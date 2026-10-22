'use strict';
// Local order book. One JSON file on this computer; nothing leaves it.
// Writes are atomic (temp file + rename) and the previous version is kept as a
// .bak, so a crash or power cut mid-save cannot lose the order book. A change is made on a
// copy and only adopted once it is safely on disk, so a failed save never leaves orders on
// screen that are not saved. Order numbers are also recorded in a tiny separate counter file,
// so they are never reused even if the book has to be restored from the backup.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { retrySync, writeAtomic, TRANSIENT } = require('./atomic');

const PRODUCTS = {
  puck:         { label: 'Rev Puck',                 price: 89,  parts: ['puck'] },
  ball:         { label: 'Rev Ball (release trainer)', price: 129, parts: ['ball'] },
  spinner:      { label: 'Rev Spinner',              price: 45,  parts: ['spinner'] },
  pair:         { label: 'Pair (Puck + Spinner)',    price: 119, parts: ['puck', 'spinner'] },
  fitkit:       { label: 'Fit Kit (sizer plate)',    price: 24,  parts: ['sizer'] },
  digital_puck: { label: 'Digital files: Puck',      price: 29,  parts: ['puck', 'sizer'] },
  digital_pair: { label: 'Digital files: Pair',      price: 39,  parts: ['puck', 'spinner', 'sizer'] },
  digital_ball: { label: 'Digital files: Ball',      price: 34,  parts: ['ball', 'sizer'] },
};
const STATUSES = ['new', 'printing', 'shipped', 'done', 'hold'];

// Fit-sheet fields the configurator understands; anything else is dropped. Ranges (mm, and
// inches for pitches) are the same ones the form enforces (configurator/app.js LIMITS).
const FIT_SCHEMA = {
  part:               { type: 'enum', values: ['puck', 'ball', 'spinner', 'sizer'] },
  hand:               { type: 'enum', values: ['right', 'left'] },
  size_source:        { type: 'enum', values: ['drill_sheet', 'sizer_plate'] },
  span_middle:        { type: 'num', min: 60, max: 150, label: 'Middle finger span' },
  span_ring:          { type: 'num', min: 60, max: 150, label: 'Ring finger span' },
  thumb_d:            { type: 'num', min: 15, max: 38,  label: 'Thumb hole size' },
  middle_d:           { type: 'num', min: 10, max: 30,  label: 'Middle finger hole size' },
  ring_d:             { type: 'num', min: 10, max: 30,  label: 'Ring finger hole size' },
  print_allowance:    { type: 'num', min: 0,  max: 2,   label: 'Print allowance' },
  bridge:             { type: 'num', min: 2,  max: 30,  label: 'Bridge' },
  finger_depth:       { type: 'num', min: 8,  max: 50,  label: 'Finger depth' },
  thumb_depth:        { type: 'num', min: 10, max: 80,  label: 'Thumb depth' },
  thumb_fwd:          { type: 'num', min: -1, max: 1, label: 'Thumb forward/reverse pitch', unit: 'inch' },
  thumb_lat:          { type: 'num', min: -1, max: 1, label: 'Thumb lateral pitch', unit: 'inch' },
  middle_fwd:         { type: 'num', min: -1, max: 1, label: 'Middle forward/reverse pitch', unit: 'inch' },
  middle_lat:         { type: 'num', min: -1, max: 1, label: 'Middle lateral pitch', unit: 'inch' },
  ring_fwd:           { type: 'num', min: -1, max: 1, label: 'Ring forward/reverse pitch', unit: 'inch' },
  ring_lat:           { type: 'num', min: -1, max: 1, label: 'Ring lateral pitch', unit: 'inch' },
  thumb_through:      { type: 'bool' },
  weight_pocket:      { type: 'bool' },
  lanyard:            { type: 'bool' },
  sizer_thumb_center: { type: 'num', min: 15, max: 38, label: 'Sizer thumb centre' },
  sizer_finger_center:{ type: 'num', min: 10, max: 30, label: 'Sizer finger centre' },
  sizer_step:         { type: 'num', min: 0.1, max: 2, label: 'Sizer step' },
  ball_d:             { type: 'num', min: 150, max: 230, label: 'Ball diameter' },
  ball_thumb_depth:   { type: 'num', min: 40, max: 95, label: 'Ball thumb hole depth' },
  ball_flat:          { type: 'num', min: 0, max: 40, label: 'Ball resting flat' },
  ball_groove:        { type: 'bool' },
  ball_stripe:        { type: 'enum', values: ['none', 'cap', 'cap_band', 'bands'] },
  // keys added after 1.0: an order saved by an older version gets the default (`def`) instead of
  // inheriting whatever sheet happens to be on screen when it is reopened
  thumb_hole:         { type: 'bool', def: true },
  thumb_oval_d:       { type: 'num', min: 0, max: 45, label: 'Thumb oval size', def: 0 },
  thumb_oval_angle:   { type: 'num', min: -90, max: 90, label: 'Thumb oval angle', unit: 'deg', def: 0 },
  middle_oval_d:      { type: 'num', min: 0, max: 36, label: 'Middle finger oval size', def: 0 },
  ring_oval_d:        { type: 'num', min: 0, max: 36, label: 'Ring finger oval size', def: 0 },
  finger_oval_angle:  { type: 'num', min: -90, max: 90, label: 'Finger oval angle', unit: 'deg', def: 0 },
  thumb_bevel:        { type: 'num', min: 0, max: 8, label: 'Thumb hole bevel', def: 4 },
  finger_bevel:       { type: 'num', min: 0, max: 6, label: 'Finger hole bevel', def: 2.5 },
  serial:             { type: 'text', pattern: /^[0-9FS-]{0,12}$/, label: 'Engraved text', def: '' },
};

const LIMITS = { name: 120, email: 200, phone: 60, address: 400, notes: 4000, orderNotes: 4000 };

class UserError extends Error {}

function cleanText(v, max) {
  if (v == null) return '';
  // strip control characters except newline and tab, then trim
  return String(v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, max).trim();
}

function cleanFit(fit) {
  const out = {};
  if (!fit || typeof fit !== 'object') throw new UserError('This order has no fit sheet.');
  for (const [k, spec] of Object.entries(FIT_SCHEMA)) {
    if (!(k in fit)) { if ('def' in spec) out[k] = spec.def; continue; }
    const v = fit[k];
    if (spec.type === 'enum') {
      if (!spec.values.includes(v)) throw new UserError(`Fit sheet field "${k}" must be one of ${spec.values.join(', ')}.`);
      out[k] = v;
    } else if (spec.type === 'bool') {
      out[k] = !!v;
    } else if (spec.type === 'text') {
      const t = v == null ? '' : String(v).trim().toUpperCase();
      if (!spec.pattern.test(t)) throw new UserError(`${spec.label} can only use digits, F, S and a dash (up to 12 characters).`);
      out[k] = t;
    } else {
      // a real number (or a numeric string); never null, '', true or [] which Number() would turn into 0 or 1
      const n = typeof v === 'number' ? v : (typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN);
      const unit = spec.unit === 'inch' ? '"' : spec.unit === 'deg' ? '°' : ' mm';
      if (!Number.isFinite(n) || n < spec.min || n > spec.max) {
        throw new UserError(`${spec.label}: ${Number.isFinite(n) ? n + unit : 'that value'} is outside the usable range ${spec.min} to ${spec.max}${unit}. Check the drill sheet values and the mm/inches switch.`);
      }
      out[k] = Math.round(n * 1e5) / 1e5;   // drop float noise from inch-to-mm conversion
    }
  }
  return out;
}

function pad(n) { return String(n).padStart(4, '0'); }

class OrderStore {
  constructor(filePath) {
    this.file = filePath;
    this.bak = filePath + '.bak';
    this.data = { version: 1, nextNumber: 1, orders: [] };
    this.recovered = null; // message if the book had to be restored
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    this._load();
  }

  // A file that parses is trusted; an unreadable one (locked by another program) is NOT treated
  // as damaged: the app refuses to start rather than replace a good order book with a backup.
  _read(p) {
    let text;
    try { text = retrySync(() => fs.readFileSync(p, 'utf8')); } catch (e) {
      if (e && TRANSIENT.has(e.code)) throw new UserError(`The order book (${p}) is locked by another program right now (${e.code}). Close anything that might have it open, such as a backup or sync tool, and start FitSlice again. Your orders have not been changed.`);
      throw e;
    }
    const parsed = JSON.parse(text.replace(/^\uFEFF/, ''));
    if (!parsed || !Array.isArray(parsed.orders)) throw new Error('not an order book');
    parsed.nextNumber = Number.isInteger(parsed.nextNumber) ? parsed.nextNumber : parsed.orders.length + 1;
    return parsed;
  }

  _isParseError(e) { return e instanceof SyntaxError || (e && e.message === 'not an order book'); }

  get seqFile() { return this.file + '.seq'; }
  _readSeq() {
    try { const n = JSON.parse(fs.readFileSync(this.seqFile, 'utf8')).last; return Number.isInteger(n) ? n : 0; } catch (_) { return 0; }
  }
  _writeSeq(n) { writeAtomic(this.seqFile, JSON.stringify({ last: n })); }
  _numberOf(o) { const m = /^FS-(\d+)$/.exec(o && o.number || ''); return m ? parseInt(m[1], 10) : 0; }
  // never lower than any number ever issued, even after a restore from an older backup
  _fixNextNumber() {
    const top = Math.max(0, ...this.data.orders.map(o => this._numberOf(o)));
    this.data.nextNumber = Math.max(this.data.nextNumber, top + 1, this._readSeq() + 1);
  }

  _load() {
    if (!fs.existsSync(this.file)) {
      if (fs.existsSync(this.bak)) {
        try { this.data = this._read(this.bak); this.recovered = 'The order book was missing, so the last backup was restored.'; } catch (e) { if (e instanceof UserError) throw e; }
      }
      this._fixNextNumber();
      return;
    }
    try {
      this.data = this._read(this.file);
    } catch (e) {
      if (!this._isParseError(e)) throw e;
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const quarantined = `${this.file}.corrupt-${stamp}`;
      try { fs.renameSync(this.file, quarantined); } catch (_) { /* leave it */ }
      const issued = this._readSeq();
      const gap = issued ? ` Order numbers up to FS-${pad(issued)} have been used and will not be reused; any order created after the backup was made is missing from the book, so check the FitSlice Orders folder for its files.` : '';
      try {
        this.data = this._read(this.bak);
        this.recovered = `The order book could not be read, so the last backup was restored. The damaged file was kept as ${path.basename(quarantined)}.${gap}`;
      } catch (_) {
        this.data = { version: 1, nextNumber: 1, orders: [] };
        this.recovered = `The order book could not be read and there was no backup. The damaged file was kept as ${path.basename(quarantined)}.${gap}`;
      }
    }
    this._fixNextNumber();
  }

  // Write `data` as the new order book (previous one kept as .bak). Throws if it cannot.
  _persist(data) {
    if (fs.existsSync(this.file)) retrySync(() => fs.copyFileSync(this.file, this.bak));
    writeAtomic(this.file, JSON.stringify(data, null, 2));
  }

  // Apply `change(draft)` to a copy and adopt it only once it is on disk.
  _commit(change) {
    const draft = JSON.parse(JSON.stringify(this.data));
    const result = change(draft);
    // the counter goes first: if it cannot be written the whole change is refused, so a number
    // that was handed out is never missing from it
    this._writeSeq(Math.max(0, ...draft.orders.map(o => this._numberOf(o)), draft.nextNumber - 1));
    this._persist(draft);
    this.data = draft;
    return result;
  }

  list() {
    return this.data.orders.slice().sort((a, b) => b.number.localeCompare(a.number)).map(o => JSON.parse(JSON.stringify(o)));
  }

  get(id) {
    const o = this.data.orders.find(x => x.id === id);
    return o ? JSON.parse(JSON.stringify(o)) : null;
  }

  stats() {
    const live = this.data.orders.filter(o => o.status !== 'hold');
    const byStatus = {};
    for (const s of STATUSES) byStatus[s] = this.data.orders.filter(o => o.status === s).length;
    return { orders: this.data.orders.length, revenue: live.reduce((s, o) => s + (o.price || 0), 0), byStatus };
  }

  save(input) {
    if (!input || typeof input !== 'object') throw new UserError('Nothing to save.');
    const c = input.customer || {};
    const customer = {
      name: cleanText(c.name, LIMITS.name),
      email: cleanText(c.email, LIMITS.email),
      phone: cleanText(c.phone, LIMITS.phone),
      address: cleanText(c.address, LIMITS.address),
    };
    if (!customer.name) throw new UserError('Enter the customer\'s name before saving the order.');
    const product = String(input.product);
    if (!Object.prototype.hasOwnProperty.call(PRODUCTS, product)) throw new UserError('Choose a product for this order.');
    const status = input.status == null ? 'new' : String(input.status);
    if (!STATUSES.includes(status)) throw new UserError('Unknown order status.');
    const price = input.price == null || input.price === '' ? PRODUCTS[product].price : Number(input.price);
    if (!Number.isFinite(price) || price < 0 || price > 100000) throw new UserError('The price must be a number between 0 and 100,000.');
    const fit = cleanFit(input.fit);
    const notes = cleanText(input.notes, LIMITS.orderNotes);
    const now = new Date().toISOString();

    if (input.id && !this.data.orders.some(o => o.id === input.id)) throw new UserError('That order no longer exists. Save it as a new order instead.');
    const saved = this._commit((draft) => {
      let order = input.id ? draft.orders.find(o => o.id === input.id) : null;
      if (!order) {
        order = { id: crypto.randomUUID(), number: `FS-${pad(draft.nextNumber)}`, createdAt: now };
        draft.nextNumber += 1;
        draft.orders.push(order);
      }
      Object.assign(order, { customer, product, price: Math.round(price * 100) / 100, status, notes, fit, updatedAt: now });
      return order;
    });
    return JSON.parse(JSON.stringify(saved));
  }

  // Remember where an order's files were written (so a later rename of the customer never loses them).
  recordExport(id, { folder, files }) {
    if (!this.data.orders.some(o => o.id === id)) throw new UserError('That order no longer exists.');
    const out = this._commit((draft) => {
      const order = draft.orders.find(o => o.id === id);
      order.exportFolder = String(folder);
      order.exportFiles = files.map(String);
      order.exportedAt = new Date().toISOString();
      return order;
    });
    return JSON.parse(JSON.stringify(out));
  }

  delete(id) {
    if (!this.data.orders.some(o => o.id === id)) return false;
    this._commit((draft) => { draft.orders.splice(draft.orders.findIndex(o => o.id === id), 1); });
    return true;
  }

  toCsv() {
    const cols = ['order', 'created', 'updated', 'status', 'customer', 'email', 'phone', 'address', 'product', 'price',
      'hand', 'thumb_mm', 'middle_mm', 'ring_mm', 'span_middle_mm', 'span_ring_mm', 'notes'];
    const text = new Set(['customer', 'email', 'phone', 'address', 'notes']);
    const cell = (name, v) => {
      let s = v == null ? '' : String(v);
      // spreadsheet formula injection: neutralize text cells that would be read as formulas
      if (text.has(name) && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
      return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const lines = [cols.join(',')];
    for (const o of this.list().reverse()) {
      const f = o.fit || {};
      const row = {
        order: o.number, created: o.createdAt, updated: o.updatedAt, status: o.status, customer: o.customer.name,
        email: o.customer.email, phone: o.customer.phone, address: o.customer.address,
        product: PRODUCTS[o.product] ? PRODUCTS[o.product].label : o.product, price: o.price.toFixed(2),
        hand: f.hand, thumb_mm: f.thumb_d, middle_mm: f.middle_d, ring_mm: f.ring_d,
        span_middle_mm: f.span_middle, span_ring_mm: f.span_ring, notes: o.notes,
      };
      lines.push(cols.map(c => cell(c, row[c])).join(','));
    }
    return lines.join('\r\n') + '\r\n';
  }
}

module.exports = { OrderStore, PRODUCTS, STATUSES, FIT_SCHEMA, UserError, cleanText };
