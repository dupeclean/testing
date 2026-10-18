'use strict';
// Local order book. One JSON file on this computer; nothing leaves it.
// Writes are atomic (temp file + rename) and the previous version is kept as a
// .bak, so a crash or power cut mid-save cannot lose the order book.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PRODUCTS = {
  puck:         { label: 'Rev Puck',                 price: 89,  parts: ['puck'] },
  spinner:      { label: 'Rev Spinner',              price: 45,  parts: ['spinner'] },
  pair:         { label: 'Pair (Puck + Spinner)',    price: 119, parts: ['puck', 'spinner'] },
  fitkit:       { label: 'Fit Kit (sizer plate)',    price: 24,  parts: ['sizer'] },
  digital_puck: { label: 'Digital files: Puck',      price: 29,  parts: ['puck', 'sizer'] },
  digital_pair: { label: 'Digital files: Pair',      price: 39,  parts: ['puck', 'spinner', 'sizer'] },
};
const STATUSES = ['new', 'printing', 'shipped', 'done', 'hold'];

// fit-sheet fields the configurator understands; anything else is dropped
const FIT_SCHEMA = {
  part:               { type: 'enum', values: ['puck', 'spinner', 'sizer'] },
  hand:               { type: 'enum', values: ['right', 'left'] },
  size_source:        { type: 'enum', values: ['drill_sheet', 'sizer_plate'] },
  span_middle:        { type: 'num', min: 40, max: 200 },
  span_ring:          { type: 'num', min: 40, max: 200 },
  thumb_d:            { type: 'num', min: 10, max: 45 },
  middle_d:           { type: 'num', min: 8,  max: 40 },
  ring_d:             { type: 'num', min: 8,  max: 40 },
  print_allowance:    { type: 'num', min: 0,  max: 2 },
  bridge:             { type: 'num', min: 0,  max: 40 },
  finger_depth:       { type: 'num', min: 5,  max: 60 },
  thumb_depth:        { type: 'num', min: 5,  max: 80 },
  thumb_fwd:          { type: 'num', min: -1.5, max: 1.5 },
  thumb_lat:          { type: 'num', min: -1.5, max: 1.5 },
  middle_fwd:         { type: 'num', min: -1.5, max: 1.5 },
  middle_lat:         { type: 'num', min: -1.5, max: 1.5 },
  ring_fwd:           { type: 'num', min: -1.5, max: 1.5 },
  ring_lat:           { type: 'num', min: -1.5, max: 1.5 },
  thumb_through:      { type: 'bool' },
  weight_pocket:      { type: 'bool' },
  lanyard:            { type: 'bool' },
  sizer_thumb_center: { type: 'num', min: 10, max: 45 },
  sizer_finger_center:{ type: 'num', min: 8,  max: 40 },
  sizer_step:         { type: 'num', min: 0.05, max: 2 },
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
    if (!(k in fit)) continue;
    const v = fit[k];
    if (spec.type === 'enum') {
      if (!spec.values.includes(v)) throw new UserError(`Fit sheet field "${k}" must be one of ${spec.values.join(', ')}.`);
      out[k] = v;
    } else if (spec.type === 'bool') {
      out[k] = !!v;
    } else {
      const n = Number(v);
      if (!Number.isFinite(n) || n < spec.min || n > spec.max) {
        throw new UserError(`Fit sheet field "${k}" is ${v}, which is outside the range ${spec.min} to ${spec.max}.`);
      }
      out[k] = n;
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

  _read(p) {
    const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!parsed || !Array.isArray(parsed.orders)) throw new Error('not an order book');
    parsed.nextNumber = Number.isInteger(parsed.nextNumber) ? parsed.nextNumber : parsed.orders.length + 1;
    return parsed;
  }

  _load() {
    if (!fs.existsSync(this.file)) {
      if (fs.existsSync(this.bak)) {
        try { this.data = this._read(this.bak); this.recovered = 'The order book was missing, so the last backup was restored.'; } catch (_) { /* start empty */ }
      }
      return;
    }
    try {
      this.data = this._read(this.file);
    } catch (_) {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const quarantined = `${this.file}.corrupt-${stamp}`;
      try { fs.renameSync(this.file, quarantined); } catch (_) { /* leave it */ }
      try {
        this.data = this._read(this.bak);
        this.recovered = `The order book could not be read, so the last backup was restored. The damaged file was kept as ${path.basename(quarantined)}.`;
      } catch (_) {
        this.data = { version: 1, nextNumber: 1, orders: [] };
        this.recovered = `The order book could not be read and there was no backup. The damaged file was kept as ${path.basename(quarantined)}.`;
      }
    }
  }

  _persist() {
    const tmp = this.file + '.tmp';
    const fd = fs.openSync(tmp, 'w');
    try { fs.writeSync(fd, JSON.stringify(this.data, null, 2)); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    if (fs.existsSync(this.file)) fs.copyFileSync(this.file, this.bak);
    fs.renameSync(tmp, this.file);
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
    if (!PRODUCTS[product]) throw new UserError('Choose a product for this order.');
    const status = input.status == null ? 'new' : String(input.status);
    if (!STATUSES.includes(status)) throw new UserError('Unknown order status.');
    const price = input.price == null || input.price === '' ? PRODUCTS[product].price : Number(input.price);
    if (!Number.isFinite(price) || price < 0 || price > 100000) throw new UserError('The price must be a number between 0 and 100,000.');
    const fit = cleanFit(input.fit);
    const notes = cleanText(input.notes, LIMITS.orderNotes);
    const now = new Date().toISOString();

    let order = input.id ? this.data.orders.find(o => o.id === input.id) : null;
    if (input.id && !order) throw new UserError('That order no longer exists. Save it as a new order instead.');
    if (!order) {
      order = { id: crypto.randomUUID(), number: `FS-${pad(this.data.nextNumber)}`, createdAt: now };
      this.data.nextNumber += 1;
      this.data.orders.push(order);
    }
    Object.assign(order, { customer, product, price: Math.round(price * 100) / 100, status, notes, fit, updatedAt: now });
    this._persist();
    return JSON.parse(JSON.stringify(order));
  }

  delete(id) {
    const i = this.data.orders.findIndex(o => o.id === id);
    if (i < 0) return false;
    this.data.orders.splice(i, 1);
    this._persist();
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
