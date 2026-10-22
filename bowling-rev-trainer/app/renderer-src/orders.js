/* Order book for the desktop app.
 * Runs in the same module scope as app.js (so it can reuse fraction64, describePitch
 * and IN) and only activates when the preload bridge exists. All customer text is
 * written with textContent, never as HTML. */
(function ordersModule() {
  const bridge = window.fitslice;
  if (!bridge || !bridge.isApp) return;

  const byId = (id) => document.getElementById(id);
  const root = byId('ob');
  const el = {
    bar: byId('ob-bar'), cur: byId('ob-cur'), count: byId('ob-count'), drawer: byId('ob-drawer'), stats: byId('ob-stats'),
    recovered: byId('ob-recovered'), form: byId('ob-form'), num: byId('ob-num'), name: byId('ob-name'), email: byId('ob-email'),
    phone: byId('ob-phone'), address: byId('ob-address'), product: byId('ob-product'), price: byId('ob-price'),
    status: byId('ob-status'), notes: byId('ob-notes'), err: byId('ob-err'), list: byId('ob-list'), search: byId('ob-search'),
    filter: byId('ob-filter'), where: byId('ob-where'), toast: byId('ob-toast'), toastText: byId('ob-toast-text'),
    toastOpen: byId('ob-toast-open'), del: byId('ob-delete'), openFolder: byId('ob-open-folder'),
  };

  let info = null;       // products, folders
  let orders = [];
  let cur = null;        // the open order, or null for a new one
  let priceTouched = false;
  let busy = false;      // a save or delete is running: further clicks are ignored
  let exporting = false; // an export is running
  let savedSnap = '';    // what the screen looked like when it was last saved or opened
  let toastTimer = null;
  let toastFolder = null;
  let toastOrder = null;

  const money = (n) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const STATUS_LABEL = { new: 'New', printing: 'Printing', shipped: 'Shipped', done: 'Done', hold: 'On hold' };

  function message(e) { return (e && e.message ? e.message : String(e)).replace(/^Error invoking remote method '[^']+': (Error: )?/, ''); }

  function toast(text, folder, ms = 9000, orderId = null) {
    clearTimeout(toastTimer);
    el.toastText.textContent = text;
    toastFolder = folder || null;
    toastOrder = orderId;
    el.toastOpen.hidden = !folder;
    el.toast.hidden = false;
    toastTimer = setTimeout(() => { el.toast.hidden = true; }, ms);
  }

  function showError(text) { el.err.textContent = text; el.err.hidden = !text; }

  function appReady() {
    return new Promise((resolve, reject) => {
      const t0 = Date.now();
      const tick = () => {
        if (window.__cfgApp && window.__cfgApp.ready) return resolve();
        if (Date.now() - t0 > 90000) return reject(new Error('The geometry engine did not start.'));
        setTimeout(tick, 100);
      };
      tick();
    });
  }

  // ---- list ----
  function renderStats(stats) {
    el.count.textContent = String(stats.orders);
    const parts = [`${stats.orders} order${stats.orders === 1 ? '' : 's'}`, money(stats.revenue)];
    for (const s of ['new', 'printing', 'shipped']) if (stats.byStatus[s]) parts.push(`${stats.byStatus[s]} ${STATUS_LABEL[s].toLowerCase()}`);
    el.stats.textContent = parts.join(' · ');
  }

  function renderList() {
    const q = el.search.value.trim().toLowerCase();
    const st = el.filter.value;
    el.list.replaceChildren();
    const shown = orders.filter(o => (!st || o.status === st) &&
      (!q || `${o.number} ${o.customer.name} ${o.customer.email} ${o.notes}`.toLowerCase().includes(q)));
    if (!shown.length) {
      const p = document.createElement('p');
      p.className = 'onote';
      p.textContent = orders.length ? 'No orders match.' : 'No orders yet. Enter a drill sheet, then choose New order.';
      el.list.append(p);
      return;
    }
    for (const o of shown) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'orow'; b.setAttribute('role', 'listitem');
      if (cur && cur.id === o.id) b.setAttribute('aria-current', 'true');
      const n = document.createElement('span'); n.className = 'n'; n.textContent = o.number;
      const who = document.createElement('span'); who.className = 'who'; who.textContent = o.customer.name;
      const amt = document.createElement('span'); amt.className = 'amt'; amt.textContent = money(o.price);
      const meta = document.createElement('span'); meta.className = 'meta';
      const s = document.createElement('span'); s.className = 'st'; s.dataset.s = o.status; s.textContent = STATUS_LABEL[o.status] || o.status;
      const prod = document.createElement('span'); prod.textContent = (info.products[o.product] || {}).label || o.product;
      const d = document.createElement('span'); d.textContent = new Date(o.updatedAt).toLocaleDateString();
      meta.append(s, prod, d);
      b.append(n, who, amt, meta);
      b.addEventListener('click', () => openOrder(o));
      el.list.append(b);
    }
  }

  async function refresh() {
    const r = await bridge.listOrders();
    orders = r.orders;
    renderStats(r.stats);
    renderList();
  }

  // ---- editor ----
  function setBar() {
    el.cur.replaceChildren();
    if (!cur) { el.cur.textContent = 'No order open. Enter a drill sheet, then start a new order.'; return; }
    el.cur.append(document.createTextNode(`${cur.number} · ${cur.customer.name}`));
    const small = document.createElement('small');
    small.textContent = `${(info.products[cur.product] || {}).label || cur.product} · ${money(cur.price)} · ${STATUS_LABEL[cur.status]}`;
    el.cur.append(small);
  }

  // ---- unsaved changes ----
  const r5 = (v) => (typeof v === 'number' ? Math.round(v * 1e5) / 1e5 : v);
  function fitSnap(fit) {
    const out = {};
    for (const k of Object.keys(fit).sort()) if (k !== 'part') out[k] = r5(fit[k]);
    return out;
  }
  function snapshot() {
    return JSON.stringify({
      customer: [el.name.value, el.email.value, el.phone.value, el.address.value].map(v => v.trim()),
      product: el.product.value, price: el.price.value.trim(), status: el.status.value, notes: el.notes.value.trim(),
      // a new, unsaved order's sheet is not "unsaved work" until an order exists
      fit: cur ? fitSnap(window.__cfgApp.getState()) : null,
    });
  }
  const sheetNow = () => JSON.stringify(fitSnap(window.__cfgApp.getState()));
  let sheetBase = null;          // the drill sheet as it was when last saved, opened, or cleared
  const markSaved = () => { savedSnap = snapshot(); sheetBase = sheetNow(); };
  const isDirty = () => snapshot() !== savedSnap;
  const sheetEdited = () => sheetBase !== null && sheetNow() !== sheetBase;
  function okToLeave() {
    if (cur && isDirty()) return window.confirm(`${cur.number} has changes that are not saved. Leave without saving them?`);
    if (!cur && isDirty()) return window.confirm('The customer details you typed are not saved. Leave without saving them?');
    return true;
  }

  function fillForm(o) {
    el.num.textContent = o ? `${o.number}` : 'New order';
    el.name.value = o ? o.customer.name : '';
    el.email.value = o ? o.customer.email : '';
    el.phone.value = o ? o.customer.phone : '';
    el.address.value = o ? o.customer.address : '';
    el.product.value = o ? o.product : 'pair';
    el.price.value = o ? o.price.toFixed(2) : info.products[el.product.value].price.toFixed(2);
    el.status.value = o ? o.status : 'new';
    el.notes.value = o ? o.notes : '';
    priceTouched = !!o;
    el.del.hidden = !o; el.openFolder.hidden = !o;
    el.del.textContent = 'Delete';
    showError('');
    markSaved();
  }

  function openOrder(o) {
    if (cur && cur.id === o.id && !isDirty()) { renderList(); return; }
    if (!okToLeave()) return;
    if (!cur && sheetEdited() && !window.confirm('The drill sheet on screen has not been saved with an order. Opening another order replaces it. Continue?')) return;
    cur = o;
    window.__cfgApp.setState(o.fit);
    fillForm(o);
    setBar(); renderList();
  }

  function newOrder() {
    if (!okToLeave()) return;
    cur = null;
    fillForm(null);
    setBar(); renderList();
    openDrawer();
    el.name.focus();
  }

  function openDrawer() { el.drawer.hidden = false; }
  function closeDrawer() { el.drawer.hidden = true; }

  function parsePrice(s) {
    let t = String(s).replace(/[$\s]/g, '');
    if (t === '') return null;                       // blank = the list price
    // "119,50" is a decimal comma; "1,119" or "1,119.50" are thousands separators
    t = /^\d+,\d{1,2}$/.test(t) ? t.replace(',', '.') : t.replace(/,/g, '');
    return /^\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
  }

  function collect() {
    const product = el.product.value;
    const stuck = window.__cfgApp.problems();
    if (stuck.length) throw new Error('Fix the drill sheet first. ' + stuck[0]);
    const fit = window.__cfgApp.getState();
    fit.part = info.products[product].parts[0];
    // a Fit Kit's sizer plate is centred on this customer's sizes; keep that in the saved order too
    if (info.products[product].parts.includes('sizer')) {
      fit.sizer_thumb_center = Math.round(fit.thumb_d * 1000) / 1000;
      fit.sizer_finger_center = Math.round(((fit.middle_d + fit.ring_d) / 2) * 1000) / 1000;
    }
    const bad = window.__cfgApp.validate(fit);
    if (bad.length) throw new Error(bad[0]);
    const price = parsePrice(el.price.value);
    if (Number.isNaN(price)) throw new Error('The price must be a number, like 119 or 119.00.');
    return {
      id: cur ? cur.id : undefined,
      customer: { name: el.name.value, email: el.email.value, phone: el.phone.value, address: el.address.value },
      product, price, status: el.status.value, notes: el.notes.value, fit,
    };
  }

  async function saveOrder() {
    if (busy) return null;
    busy = true;
    showError('');
    try {
      if (!el.name.value.trim()) { openDrawer(); el.name.classList.add('bad'); el.name.focus(); throw new Error('Enter the customer\'s name before saving the order.'); }
      el.name.classList.remove('bad');
      const r = await bridge.saveOrder(collect());
      cur = r.order;
      el.num.textContent = cur.number;
      el.del.hidden = false; el.openFolder.hidden = false;
      setBar();
      markSaved();
      await refresh();
      toast(`Saved ${cur.number} for ${cur.customer.name}.`);
      return cur;
    } catch (e) {
      showError(message(e)); openDrawer();
      return null;
    } finally {
      busy = false;
    }
  }

  // ---- print files ----
  function jobSheet(order, built, fileNames) {
    const f = built.fitSheet, m = f.modeled;
    const parts = info.products[order.product].parts;
    const hasPuck = parts.includes('puck'), hasSpin = parts.includes('spinner'), hasSizer = parts.includes('sizer'), hasBall = parts.includes('ball');
    const hasGrip = hasPuck || hasBall;   // parts that carry the whole three-hole grip
    const r2 = (x) => Math.round(Number(x) * 100) / 100;
    const both = (mm) => `${fraction64(mm / IN)}" (${r2(mm)} mm)`;
    const pad = (s, n) => String(s).padEnd(n);
    const side = f.hand === 'right' ? 'Right' : 'Left';
    const midSide = f.hand === 'right' ? 'left' : 'right', ringSide = f.hand === 'right' ? 'right' : 'left';
    const d = new Date(), p2 = (n) => String(n).padStart(2, '0');
    const today = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;   // the shop's own calendar day
    const L = [];
    L.push('FITSLICE JOB SHEET', '==================', '');
    L.push(`Order      ${order.number}`, `Date       ${today}`, `Customer   ${order.customer.name}`);
    L.push(`Product    ${(info.products[order.product] || {}).label || order.product}   ${money(order.price)}`, `Hand       ${side}-handed`, '');

    if (hasGrip || hasSpin) {
      const rows = [];
      const ovalTxt = (d, ov, ang, what) => (ov > 0 ? `  ${what}: ${both(d)} drilled, ${both(ov)} oval at ${r2(ang)} deg (0 = up the sheet, + = hand side)` : '');
      if (hasGrip && f.thumb_hole !== false) rows.push(['Thumb', both(f.thumb_d), `${m.thumb_bore_in}" (${r2(m.thumb_bore_mm)} mm)`, '-', describePitch(f.thumb_fwd, 'fr', f.hand), describePitch(f.thumb_lat, 'lat', f.hand)]);
      rows.push([`Middle (${midSide} hole)`, both(f.middle_d), `${m.middle_bore_in}" (${r2(m.middle_bore_mm)} mm)`, hasGrip ? both(f.span_middle) : '-',
        hasGrip ? describePitch(f.middle_fwd, 'fr', f.hand) : 'zero', hasGrip ? describePitch(f.middle_lat, 'lat', f.hand) : 'zero']);
      rows.push([`Ring (${ringSide} hole)`, both(f.ring_d), `${m.ring_bore_in}" (${r2(m.ring_bore_mm)} mm)`, hasGrip ? both(f.span_ring) : '-',
        hasGrip ? describePitch(f.ring_fwd, 'fr', f.hand) : 'zero', hasGrip ? describePitch(f.ring_lat, 'lat', f.hand) : 'zero']);
      const W = [20, 22, 22, 22, 16];
      L.push('DRILL SHEET AS ENTERED, AND THE BORE SIZE THE MODEL USES (sheet size + print allowance)');
      L.push(['', 'Sheet size', 'Modeled bore', 'Span (cut to cut)', 'Forward/reverse', 'Lateral'].map((h, i) => i < 5 ? pad(h, W[i]) : h).join(''));
      for (const r of rows) L.push(r.map((c, i) => i < 5 ? pad(c, W[i]) : c).join(''));
      const ovals = [ovalTxt(f.thumb_d, f.thumb_oval_d, f.thumb_oval_angle, 'Thumb'), ovalTxt(f.middle_d, f.middle_oval_d, f.finger_oval_angle, 'Middle'), ovalTxt(f.ring_d, f.ring_oval_d, f.finger_oval_angle, 'Ring')].filter(Boolean);
      if (ovals.length) { L.push('OVAL HOLES (the hole size above is the short way across; the oval size is the long way)'); ovals.forEach(x => L.push(x)); }
      L.push(`Hole edges: thumb bevel ${r2(f.thumb_bevel)} mm, finger bevel ${r2(f.finger_bevel)} mm (rounded).   Engraved in the base: ${order.number}`);
      if (hasBall && f.thumb_hole === false) L.push('NO THUMB HOLE: two-handed / no-thumb ball; the finger holes sit centred on the top.');
      L.push('');
      if (hasPuck) {
        L.push(`Bridge ${both(f.bridge)}   Finger depth ${f.finger_depth} mm   Thumb ${f.thumb_through ? 'through' : 'blind, ' + f.thumb_depth + ' mm deep'}`);
        L.push(`Print allowance ${m.print_allowance_mm} mm   Weight pocket ${f.weight_pocket ? 'yes' : 'no'}   Wrist-cord tunnel ${f.lanyard ? 'yes' : 'no'}`);
      }
      if (hasBall) {
        const STRIPE = { none: 'single colour', cap: 'coloured top cap', cap_band: 'coloured top cap and a band round the middle', bands: 'three bands round the middle' };
        L.push(`Rev Ball: ${r2(f.ball_d)} mm ball. Thumb hole blind, ${r2(f.ball_thumb_depth)} mm deep. Finger depth ${f.finger_depth} mm. Bridge ${both(f.bridge)}. Resting flat ${r2(f.ball_flat)} mm. Colours: ${STRIPE[f.ball_stripe] || f.ball_stripe}. Marker groove ${f.ball_groove ? 'yes' : 'no'}. Print allowance ${m.print_allowance_mm} mm.`);
        const cc = (built.stats.find(s => s.part === 'ball') || {}).color_changes || [];
        if (cc.length) {
          L.push('FILAMENT CHANGES for the two-colour ball (start the print in the base colour). In Bambu Studio slice it, then');
          L.push('right-click the layer slider at each height and choose "Add color change"; the printer pauses there for the swap:');
          for (const c of cc) L.push(`  at ${c.z_mm} mm: ${c.colour}`);
        }
      }
      if (hasSpin) {
        L.push(`${hasPuck ? 'Rev Spinner: ' : ''}two finger holes only, no thumb hole. Spans and pitches above do not apply to the spinner: its holes are drilled straight at the ball's center (zero pitch). Hole spacing uses the bridge ${both(f.bridge)}; finger depth ${Math.min(f.finger_depth, 20)} mm; wrist-cord tunnel ${f.lanyard ? 'yes' : 'no'}; print allowance ${m.print_allowance_mm} mm.`);
      }
      L.push('');
    }
    if (hasSizer) {
      L.push('SIZER PLATE', `Finger row centred on ${both(f.sizer_finger_center)}, thumb row centred on ${both(f.sizer_thumb_center)}, steps of ${r2(f.sizer_step)} mm. Each bore is engraved with its diameter in mm. No print allowance is added: the bores are exactly the engraved size.`, '');
    }

    L.push('PRINT');
    if (hasPuck || hasSpin || hasSizer) L.push(`${hasBall ? 'Puck, spinner, sizer: ' : ''}PETG, 0.2 mm layers, 4 walls, 20% gyroid infill, flat side down, no supports.`);
    if (hasBall) L.push(`${hasPuck || hasSpin || hasSizer ? 'Ball: ' : ''}PETG or PLA, 0.2 mm layers, 3 walls, 5% gyroid infill, grip holes facing UP. Supports: tree, "On build plate only" (so nothing grows inside the holes); seam: random or scarf (no ridge down one side). Snap the supports off and sand the scar smooth so it rolls true.`);
    for (const s of built.stats) L.push(`  ${s.part}: about ${s.grams} g of filament at ${s.infill_pct}% infill, ${s.bbox_mm.join(' x ')} mm`);
    if (hasGrip || hasSpin) L.push('After printing: smooth the bores with fine sandpaper and check each bore against the sizes above before packing.');
    if (hasBall) L.push('Ball drill: kneel, swing low, let it go along a strip of tape on the floor with a couch or wall 1.5 to 2 m away. Roll + curve off the line = thumb out, fingers lifted. Straight but long and lively = strong forward roll (fine). Straight and short = dumped. Popped up = thumb hung up. Spins in place = hand on top.');
    if (hasSizer) L.push('Do not sand the sizer plate: its holes are the test. The bore that fits the finger snugly is that finger\'s size.');
    L.push('');
    if (built.warnings.length) {
      L.push('WARNINGS FROM THE MODEL (resolve before printing)');
      for (const w of built.warnings) L.push('  - ' + w);
      L.push('');
    }
    L.push('FILES');
    for (const n of fileNames) L.push('  ' + n);
    if (hasGrip || hasSpin) {
      const anyOval = f.thumb_oval_d > 0 || f.middle_oval_d > 0 || f.ring_oval_d > 0;
      L.push('', anyOval ? 'Oval holes are modeled as listed above (short way = hole size, long way = oval size). Finish the fit with bowler\'s tape.'
        : 'All holes are round. If the sheet lists an oval hole, enter its long size and angle under "Oval holes" and export again. Finish the fit with bowler\'s tape.');
    }
    return L.join('\r\n') + '\r\n';
  }

  // ---- customer card: a plain one-page PDF (no library; Helvetica text only) ----
  function pdfEscape(s) { return String(s).replace(/[^\x20-\x7e]/g, (ch) => ({ '\u2019': "'", '\u2018': "'", '\u201c': '"', '\u201d': '"', '\u2013': '-', '\u2014': '-', '\u00b0': ' deg', '\u00d7': 'x' }[ch] || '?')).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'); }
  function wrap(text, max = 92) {
    const out = []; for (const para of String(text).split('\n')) { let line = '';
      for (const w of para.split(' ')) { if ((line + ' ' + w).trim().length > max) { out.push(line.trim()); line = w; } else line += ' ' + w; }
      out.push(line.trim()); }
    return out;
  }
  // lines: [{ t: text, b: bold?, s: size, gap: extra space after }]
  function makePdf(lines) {
    const pages = [[]]; let y = 740;
    for (const ln of lines) {
      const size = ln.s || 10.5, lead = size * 1.35;
      for (const piece of wrap(ln.t, Math.floor(1000 / size))) {
        if (y < 60) { pages.push([]); y = 740; }
        pages[pages.length - 1].push(`BT /${ln.b ? 'F2' : 'F1'} ${size} Tf 54 ${y.toFixed(1)} Td (${pdfEscape(piece)}) Tj ET`);
        y -= lead;
      }
      y -= ln.gap || 0;
    }
    const objs = []; const add = (s) => { objs.push(s); return objs.length; };
    const fontR = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    const fontB = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const pagesId = objs.length + 1 + pages.length * 2;   // the Pages object comes after all page/content pairs
    const pageIds = [];
    for (const pg of pages) {
      const content = pg.join('\n');
      const cId = add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
      const pId = add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontR} 0 R /F2 ${fontB} 0 R >> >> /Contents ${cId} 0 R >>`);
      pageIds.push(pId);
    }
    const pagesIdReal = add(`<< /Type /Pages /Kids [${pageIds.map(i => i + ' 0 R').join(' ')}] /Count ${pageIds.length} >>`);
    if (pagesIdReal !== pagesId) throw new Error('pdf object numbering');
    const catalog = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    let out = '%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n'; const offsets = [];
    objs.forEach((o, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('');
    out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    // bytes: every char here is < 256, so a byte per char (the binary comment line uses 0xe2.. codes)
    const bytes = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
    return bytes;
  }
  function customerCard(order, built) {
    const f = built.fitSheet, m = f.modeled, parts = info.products[order.product].parts;
    const hasPuck = parts.includes('puck'), hasSpin = parts.includes('spinner'), hasSizer = parts.includes('sizer'), hasBall = parts.includes('ball');
    const both = (mm) => `${fraction64(mm / IN)}" (${Math.round(mm * 100) / 100} mm)`;
    const first = (order.customer.name || '').split(/[ ,]+/)[0] || 'there';
    const L = [];
    L.push({ t: 'FitSlice', b: true, s: 20 }, { t: `Order ${order.number} - ${(info.products[order.product] || {}).label || order.product}`, s: 11, gap: 8 });
    L.push({ t: `Hi ${first}, this was printed from your own drill sheet. Here is what it is for and how to use it.`, gap: 8 });
    L.push({ t: 'YOUR FIT (as printed)', b: true, s: 12 });
    if (hasPuck || hasBall) {
      if (f.thumb_hole !== false) L.push({ t: `Thumb ${both(f.thumb_d)}${f.thumb_oval_d > 0 ? `, oval ${both(f.thumb_oval_d)} at ${f.thumb_oval_angle} deg` : ''}, pitch ${describePitch(f.thumb_fwd, 'fr', f.hand)}, ${describePitch(f.thumb_lat, 'lat', f.hand)}` });
      L.push({ t: `Middle finger ${both(f.middle_d)}${f.middle_oval_d > 0 ? ` oval ${both(f.middle_oval_d)}` : ''}, span ${both(f.span_middle)}, pitch ${describePitch(f.middle_fwd, 'fr', f.hand)}, ${describePitch(f.middle_lat, 'lat', f.hand)}` });
      L.push({ t: `Ring finger ${both(f.ring_d)}${f.ring_oval_d > 0 ? ` oval ${both(f.ring_oval_d)}` : ''}, span ${both(f.span_ring)}, pitch ${describePitch(f.ring_fwd, 'fr', f.hand)}, ${describePitch(f.ring_lat, 'lat', f.hand)}` });
      L.push({ t: `${f.hand === 'right' ? 'Right' : 'Left'}-handed. Bridge ${both(f.bridge)}. Printed holes are ${m.print_allowance_mm} mm oversize to allow for printing; finish the fit with bowler's tape, as on a ball.`, gap: 8 });
    } else if (hasSpin) {
      L.push({ t: `Middle finger ${both(f.middle_d)}, ring finger ${both(f.ring_d)}, bridge ${both(f.bridge)}.`, gap: 8 });
    }
    if (hasBall) {
      L.push({ t: 'REV BALL: HOW TO USE IT', b: true, s: 12 });
      L.push({ t: '1. Put a strip of tape on the floor, with a couch or wall 1.5 to 2 m beyond it. Carpet or a rug is best.' });
      L.push({ t: '2. Kneel on one knee, swing the ball low along the tape and let it go, the way you release on the lane.' });
      L.push({ t: '3. Read what it does:', gap: 2 });
      L.push({ t: '   Rolls and curves off the line: thumb out first, fingers lifted. More curve = more revs.' });
      L.push({ t: '   Straight but long and lively: strong forward roll. Fine.' });
      L.push({ t: '   Straight and short: everything let go at once (a dump).' });
      L.push({ t: '   Pops up and lands late: the thumb hung up.' });
      L.push({ t: '   Spins in place: the hand came over the top.', gap: 4 });
      L.push({ t: 'The coloured cap and band show the spin. Ten releases a day is plenty. It is a feedback tool, not a measuring instrument, and it is not a promise about your rev rate.', gap: 8 });
    }
    if (hasPuck) {
      L.push({ t: 'REV PUCK: HOW TO USE IT', b: true, s: 12 });
      L.push({ t: 'Put the cord round your wrist. Hold it like your ball. Fingertip hold: thumb out, carry it on the two fingers for 20 seconds, 4 rounds. Thumb exit: all three in, let it hang, slide the thumb out while the fingers keep carrying it, 10 slow reps, then with a small swing. Add coins to the pocket in the base to make it heavier.', gap: 8 });
    }
    if (hasSpin) {
      L.push({ t: 'REV SPINNER: HOW TO USE IT', b: true, s: 12 });
      L.push({ t: 'Fingers in to the first joint, short pendulum swing, lift with the fingers at the bottom and let it go onto carpet. It spins; the longer and steadier, the cleaner the lift.', gap: 8 });
    }
    if (hasSizer) {
      L.push({ t: 'SIZER PLATE', b: true, s: 12 });
      L.push({ t: 'Try each hole to the first joint. The one that is snug all round, with no squeeze needed to hang on, is your size on this printer. Each hole has its size engraved beside it in millimetres.', gap: 8 });
    }
    L.push({ t: 'SAFETY', b: true, s: 12 });
    L.push({ t: `Never throw ${parts.length > 1 ? 'any of these' : 'it'}.${hasBall ? ' Release the ball low and only toward a soft stop.' : ''}${hasPuck ? ' Keep the puck on its wrist cord.' : ''} Stop if your thumb or fingers hurt or go numb. Printed plastic can crack if dropped on a hard floor.`, gap: 8 });
    L.push({ t: 'CARE', b: true, s: 12 });
    L.push({ t: 'Wipe with a damp cloth. Keep out of a hot car. A light sand inside a hole makes it smoother; bowler\'s tape makes it snugger.', gap: 8 });
    L.push({ t: `Questions: reply to your order email and quote ${order.number}.`, s: 9.5 });
    return makePdf(L);
  }

  async function exportFiles() {
    if (exporting) return;
    exporting = true;
    try {
      const order = await saveOrder();
      if (!order) return;
      const parts = info.products[order.product].parts;
      toast('Building print files…', null, 60000);
      await new Promise(r => setTimeout(r, 30));
      // built from the order exactly as it was just saved, not from whatever the form shows now
      const built = window.__cfgApp.buildFiles(parts, { ...order.fit, serial: order.number });
      const names = built.files.map(f => f.name).concat(['fit_sheet.json', 'job_sheet.txt', 'customer_card.pdf']);
      const sheet = { order: order.number, ...built.fitSheet };
      const files = built.files.map(f => ({ name: f.name, data: f.data }));
      files.push({ name: 'fit_sheet.json', data: JSON.stringify(sheet, null, 2) });
      files.push({ name: 'job_sheet.txt', data: jobSheet(order, built, names) });
      files.push({ name: 'customer_card.pdf', data: customerCard(order, built) });
      const r = await bridge.exportOrder({ orderId: order.id, files });
      const warn = built.warnings.length ? ` ${built.warnings.length} warning${built.warnings.length === 1 ? '' : 's'}: see job_sheet.txt.` : '';
      const old = r.superseded && r.superseded.length ? ` Older files for this order were moved to its "superseded" folder.` : '';
      toast(`Saved ${r.files.length} files for ${order.number} to ${r.dir}.${warn}${old}`, r.dir, 15000, order.id);
      cur = (await bridge.listOrders()).orders.find(o => o.id === order.id) || cur;
    } catch (e) {
      el.toast.hidden = true;
      showError(message(e)); openDrawer();
    } finally {
      exporting = false;
    }
  }

  async function deleteOrder() {
    if (!cur || busy) return;
    busy = true;
    try {
      const gone = cur;
      const r = await bridge.deleteOrder(gone.id);   // asks for confirmation in a native dialog
      if (!r.deleted) return;
      toast(`Deleted ${gone.number}. Its exported files were not touched.`);
      cur = null; fillForm(null); setBar(); await refresh();
    } catch (e) { showError(message(e)); } finally { busy = false; }
  }

  async function menuAction(name) {
    try {
      if (name === 'new-order') newOrder();
      else if (name === 'open-orders') { openDrawer(); }
      else if (name === 'open-folder') { const r = await bridge.openOrdersFolder(); if (!r.ok) toast('Could not open the folder: ' + (r.error || 'unknown problem')); }
      else if (name === 'choose-folder') { const r = await bridge.chooseOrdersFolder(); if (r.changed) { info.ordersFolder = r.folder; el.recovered.hidden = true; showWhere(); toast('New files will be saved to ' + r.folder, r.folder); } }
      else if (name === 'export-csv') { const r = await bridge.exportCsv(); toast('Saved the spreadsheet to ' + r.file); }
      else if (name === 'about-data') { openDrawer(); showWhere(); toast(`Your orders are stored in ${info.dataFolder}. Print files are saved in ${info.ordersFolder}.`, info.ordersFolder, 20000); }
    } catch (e) { toast(message(e)); }
  }

  function showWhere() {
    el.where.textContent = `Print files: ${info.ordersFolder}. Order book: ${info.dataFolder}. FitSlice never sends them anywhere, but if Windows backs up your Documents folder to OneDrive, the print files and orders.csv (which holds customer contact details) go with it. Back up the order book folder to keep your customers safe.`;
  }

  async function init() {
    await appReady();
    info = await bridge.info();
    for (const [key, p] of Object.entries(info.products)) {
      const o = document.createElement('option'); o.value = key; o.textContent = `${p.label}: ${money(p.price)}`; el.product.append(o);
    }
    document.querySelector('header.top').after(el.bar);
    root.hidden = false;
    if (info.recovered) { el.recovered.textContent = info.recovered; el.recovered.hidden = false; openDrawer(); }
    showWhere();
    await refresh();
    fillForm(null); setBar();

    byId('ob-orders').addEventListener('click', () => { el.drawer.hidden ? openDrawer() : closeDrawer(); });
    byId('ob-close').addEventListener('click', closeDrawer);
    byId('ob-new').addEventListener('click', newOrder);
    byId('ob-save').addEventListener('click', saveOrder);
    byId('ob-export').addEventListener('click', exportFiles);
    byId('ob-form-export').addEventListener('click', exportFiles);
    el.form.addEventListener('submit', (e) => { e.preventDefault(); saveOrder(); });
    el.product.addEventListener('change', () => { if (!priceTouched) el.price.value = info.products[el.product.value].price.toFixed(2); });
    el.price.addEventListener('input', () => { priceTouched = true; });
    el.del.addEventListener('click', deleteOrder);
    el.openFolder.addEventListener('click', async () => { try { await bridge.openOrderFolder(cur.id); } catch (e) { showError(message(e)); toast(message(e), null, 12000); } });
    el.search.addEventListener('input', renderList);
    el.filter.addEventListener('change', renderList);
    byId('ob-csv').addEventListener('click', () => menuAction('export-csv'));
    byId('ob-folder').addEventListener('click', () => menuAction('open-folder'));
    byId('ob-choose').addEventListener('click', () => menuAction('choose-folder'));
    byId('ob-toast-x').addEventListener('click', () => { el.toast.hidden = true; });
    el.toastOpen.addEventListener('click', async () => { if (!toastFolder) return; try { if (toastOrder) await bridge.openOrderFolder(toastOrder); else await bridge.openOrdersFolder(); } catch (e) { toast(message(e), null, 12000); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !el.drawer.hidden) closeDrawer(); });
    bridge.onMenu(menuAction);
    window.addEventListener('beforeunload', (e) => { if (isDirty() || (!cur && sheetEdited())) { e.preventDefault(); e.returnValue = ''; } });
    window.__orders = { ready: true, newOrder, openOrder, saveOrder, exportFiles, list: () => orders.slice() };
  }

  init().catch((e) => { console.error(e); const s = byId('status'); if (s) { s.textContent = 'The order book could not start: ' + message(e); s.dataset.kind = 'error'; } });
})();
