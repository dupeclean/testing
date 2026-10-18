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
  let deleteArmed = null;
  let toastTimer = null;
  let toastFolder = null;

  const money = (n) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const STATUS_LABEL = { new: 'New', printing: 'Printing', shipped: 'Shipped', done: 'Done', hold: 'On hold' };

  function message(e) { return (e && e.message ? e.message : String(e)).replace(/^Error invoking remote method '[^']+': (Error: )?/, ''); }

  function toast(text, folder, ms = 9000) {
    clearTimeout(toastTimer);
    el.toastText.textContent = text;
    toastFolder = folder || null;
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
    deleteArmed = null; el.del.textContent = 'Delete';
    showError('');
  }

  function openOrder(o) {
    cur = o;
    fillForm(o);
    window.__cfgApp.setState(o.fit);
    setBar(); renderList();
  }

  function newOrder() {
    cur = null;
    fillForm(null);
    setBar(); renderList();
    openDrawer();
    el.name.focus();
  }

  function openDrawer() { el.drawer.hidden = false; }
  function closeDrawer() { el.drawer.hidden = true; }

  function parsePrice(s) {
    const t = String(s).replace(/[$,\s]/g, '');
    if (t === '') return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : NaN;
  }

  function collect() {
    const product = el.product.value;
    const fit = window.__cfgApp.getState();
    fit.part = info.products[product].parts[0];
    const price = parsePrice(el.price.value);
    if (Number.isNaN(price)) throw new Error('The price must be a number, like 119 or 119.00.');
    return {
      id: cur ? cur.id : undefined,
      customer: { name: el.name.value, email: el.email.value, phone: el.phone.value, address: el.address.value },
      product, price, status: el.status.value, notes: el.notes.value, fit,
    };
  }

  async function saveOrder() {
    showError('');
    try {
      if (!el.name.value.trim()) { openDrawer(); el.name.classList.add('bad'); el.name.focus(); throw new Error('Enter the customer\'s name before saving the order.'); }
      el.name.classList.remove('bad');
      const r = await bridge.saveOrder(collect());
      cur = r.order;
      el.num.textContent = cur.number;
      el.del.hidden = false; el.openFolder.hidden = false;
      setBar();
      await refresh();
      toast(`Saved ${cur.number} for ${cur.customer.name}.`);
      return cur;
    } catch (e) {
      showError(message(e)); openDrawer();
      return null;
    }
  }

  // ---- print files ----
  function jobSheet(order, built, fileNames) {
    const f = built.fitSheet, m = f.modeled;
    const r2 = (x) => Math.round(Number(x) * 100) / 100;
    const both = (mm) => `${fraction64(mm / IN)}" (${r2(mm)} mm)`;
    const pad = (s, n) => String(s).padEnd(n);
    const side = f.hand === 'right' ? 'Right' : 'Left';
    const rows = [
      ['Thumb',  both(f.thumb_d),  `${m.thumb_bore_in}" (${r2(m.thumb_bore_mm)} mm)`,   '-',                  describePitch(f.thumb_fwd, 'fr', f.hand),  describePitch(f.thumb_lat, 'lat', f.hand)],
      ['Middle', both(f.middle_d), `${m.middle_bore_in}" (${r2(m.middle_bore_mm)} mm)`, both(f.span_middle), describePitch(f.middle_fwd, 'fr', f.hand), describePitch(f.middle_lat, 'lat', f.hand)],
      ['Ring',   both(f.ring_d),   `${m.ring_bore_in}" (${r2(m.ring_bore_mm)} mm)`,     both(f.span_ring),   describePitch(f.ring_fwd, 'fr', f.hand),   describePitch(f.ring_lat, 'lat', f.hand)],
    ];
    const W = [8, 22, 22, 22, 16];
    const L = [];
    L.push('FITSLICE JOB SHEET', '==================', '');
    L.push(`Order      ${order.number}`, `Date       ${new Date().toISOString().slice(0, 10)}`, `Customer   ${order.customer.name}`);
    L.push(`Product    ${(info.products[order.product] || {}).label || order.product}   ${money(order.price)}`, `Hand       ${side}-handed`, '');
    L.push('DRILL SHEET AS ENTERED, AND THE BORE SIZE THE MODEL USES (sheet size + print allowance)');
    L.push(['', 'Sheet size', 'Modeled bore', 'Span (cut to cut)', 'Forward/reverse', 'Lateral'].map((h, i) => i < 5 ? pad(h, W[i]) : h).join(''));
    for (const r of rows) L.push(r.map((c, i) => i < 5 ? pad(c, W[i]) : c).join(''));
    L.push('', `Bridge ${both(f.bridge)}   Finger depth ${f.finger_depth} mm   Thumb ${f.thumb_through ? 'through' : 'blind, ' + f.thumb_depth + ' mm deep'}`);
    L.push(`Print allowance ${m.print_allowance_mm} mm   Weight pocket ${f.weight_pocket ? 'yes' : 'no'}   Wrist-cord tunnel ${f.lanyard ? 'yes' : 'no'}`, '');
    L.push('PRINT');
    L.push('PETG, 0.2 mm layers, 4 walls, 20% gyroid infill, flat side down, no supports.');
    for (const s of built.stats) L.push(`  ${s.part}: about ${s.grams_20pct} g of filament at 20% infill, ${s.bbox_mm.join(' x ')} mm`);
    L.push('After printing: smooth the bores with fine sandpaper and check each bore against the sizes above before packing.', '');
    if (built.warnings.length) {
      L.push('WARNINGS FROM THE MODEL (resolve before printing)');
      for (const w of built.warnings) L.push('  - ' + w);
      L.push('');
    }
    L.push('FILES');
    for (const n of fileNames) L.push('  ' + n);
    L.push('', 'Round bores only: if the sheet lists oval holes, the model uses the round size that was entered. Finish the fit with bowler\'s tape.');
    return L.join('\r\n') + '\r\n';
  }

  async function exportFiles() {
    const order = await saveOrder();
    if (!order) return;
    try {
      const parts = info.products[order.product].parts;
      const overrides = {};
      if (parts.includes('sizer')) {
        overrides.sizer_thumb_center = order.fit.thumb_d;
        overrides.sizer_finger_center = (order.fit.middle_d + order.fit.ring_d) / 2;
      }
      toast('Building print files…', null, 60000);
      await new Promise(r => setTimeout(r, 30));
      const built = window.__cfgApp.buildFiles(parts, overrides);
      const names = built.files.map(f => f.name).concat(['fit_sheet.json', 'job_sheet.txt']);
      const sheet = { order: order.number, ...built.fitSheet };
      const files = built.files.map(f => ({ name: f.name, data: f.data }));
      files.push({ name: 'fit_sheet.json', data: JSON.stringify(sheet, null, 2) });
      files.push({ name: 'job_sheet.txt', data: jobSheet(order, built, names) });
      const r = await bridge.exportOrder({ orderId: order.id, files });
      const warn = built.warnings.length ? ` ${built.warnings.length} warning${built.warnings.length === 1 ? '' : 's'}: see job_sheet.txt.` : '';
      toast(`Saved ${r.files.length} files for ${order.number} to ${r.dir}.${warn}`, r.dir, 15000);
    } catch (e) {
      el.toast.hidden = true;
      showError(message(e)); openDrawer();
    }
  }

  async function deleteOrder() {
    if (!cur) return;
    if (deleteArmed !== cur.id) {
      deleteArmed = cur.id; el.del.textContent = 'Click again to delete';
      setTimeout(() => { if (deleteArmed === cur?.id) { deleteArmed = null; el.del.textContent = 'Delete'; } }, 4000);
      return;
    }
    try {
      await bridge.deleteOrder(cur.id);
      toast(`Deleted ${cur.number}. Its exported files were not touched.`);
      cur = null; fillForm(null); setBar(); await refresh();
    } catch (e) { showError(message(e)); }
  }

  async function menuAction(name) {
    try {
      if (name === 'new-order') newOrder();
      else if (name === 'open-orders') { openDrawer(); }
      else if (name === 'open-folder') { const r = await bridge.openOrdersFolder(); if (!r.ok) toast('Could not open the folder: ' + r.error); }
      else if (name === 'choose-folder') { const r = await bridge.chooseOrdersFolder(); if (r.changed) { info.ordersFolder = r.folder; showWhere(); toast('New files will be saved to ' + r.folder, r.folder); } }
      else if (name === 'export-csv') { const r = await bridge.exportCsv(); toast('Saved the spreadsheet to ' + r.file); }
      else if (name === 'about-data') { openDrawer(); showWhere(); toast(`Your orders are stored in ${info.dataFolder}. Print files are saved in ${info.ordersFolder}.`, info.ordersFolder, 20000); }
    } catch (e) { toast(message(e)); }
  }

  function showWhere() {
    el.where.textContent = `Print files: ${info.ordersFolder}. Order book: ${info.dataFolder}. Both stay on this computer. Back up the order book folder to keep your customers safe.`;
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
    el.openFolder.addEventListener('click', async () => { try { await bridge.openOrderFolder(cur.id); } catch (e) { showError(message(e)); } });
    el.search.addEventListener('input', renderList);
    el.filter.addEventListener('change', renderList);
    byId('ob-csv').addEventListener('click', () => menuAction('export-csv'));
    byId('ob-folder').addEventListener('click', () => menuAction('open-folder'));
    byId('ob-choose').addEventListener('click', () => menuAction('choose-folder'));
    byId('ob-toast-x').addEventListener('click', () => { el.toast.hidden = true; });
    el.toastOpen.addEventListener('click', async () => { if (toastFolder) { try { await bridge.openOrdersFolder(); } catch (_) { /* ignore */ } } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !el.drawer.hidden) closeDrawer(); });
    bridge.onMenu(menuAction);
    window.__orders = { ready: true, newOrder, openOrder, saveOrder, exportFiles, list: () => orders.slice() };
  }

  init().catch((e) => { console.error(e); const s = byId('status'); if (s) { s.textContent = 'The order book could not start: ' + message(e); s.dataset.kind = 'error'; } });
})();
