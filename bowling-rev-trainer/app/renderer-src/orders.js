/* Order book for the desktop app.
 * Runs in the same module scope as app.js (so it can reuse fraction64, describePitch
 * and IN) and only activates when the preload bridge exists. All customer text is
 * written with textContent, never as HTML. */
(function ordersModule() {
  const bridge = window.rollread;
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
    window.__cfgApp.setState({ ...o.fit, serial: o.number });   // the preview shows the number that will be engraved
    fillForm(o);
    setBar(); renderList();
  }

  function newOrder() {
    if (!okToLeave()) return;
    cur = null;
    window.__cfgApp.patchState({ serial: '', thumb_hole: true });   // the number is engraved once the order has one
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
    // the "Thumb hole" switch is a ball option: a puck or spinner order never carries a stale "no thumb"
    if (!info.products[product].parts.includes('ball')) fit.thumb_hole = true;
    // RollRead engraves the order number itself (set once the order has one)
    fit.serial = cur ? cur.number : '';
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
    const hasPuck = parts.includes('puck'), hasSpin = parts.includes('spinner'), hasSizer = parts.includes('sizer'), hasBall = parts.includes('ball'), hasGate = parts.includes('gate');
    const hasGrip = hasPuck || hasBall;   // parts that carry the whole three-hole grip
    const hasThumb = hasGrip && !(hasBall && f.thumb_hole === false);   // a two-handed ball and the spinner cut no thumb hole
    const r2 = (x) => Math.round(Number(x) * 100) / 100;
    const both = (mm) => `${fraction64(mm / IN)}" (${r2(mm)} mm)`;
    const pad = (s, n) => String(s).padEnd(n);
    const side = f.hand === 'right' ? 'Right' : 'Left';
    const midSide = f.hand === 'right' ? 'left' : 'right', ringSide = f.hand === 'right' ? 'right' : 'left';
    const d = new Date(), p2 = (n) => String(n).padStart(2, '0');
    const today = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;   // the shop's own calendar day
    const L = [];
    L.push('ROLLREAD JOB SHEET', '==================', `RollRead ${info.version}, build ${info.built || 'unknown'}`, '');
    L.push(`Order      ${order.number}`, `Date       ${today}`, `Customer   ${order.customer.name}`);
    L.push(`Product    ${(info.products[order.product] || {}).label || order.product}   ${money(order.price)}`, `Hand       ${side}-handed`, '');

    if (hasGrip || hasSpin) {
      const rows = [];
      const ovalTxt = (d, ov, ang, what, modeled) => (ov > 0 ? `  ${what}: ${both(d)} drilled, ${both(ov)} oval at ${r2(ang)} deg (0 = up the sheet, + = toward the thumb side); modeled ${r2(modeled)} mm the long way` : '');
      if (hasThumb) rows.push(['Thumb', both(f.thumb_d), `${m.thumb_bore_in}" (${r2(m.thumb_bore_mm)} mm)`, '-', describePitch(f.thumb_fwd, 'fr', f.hand), describePitch(f.thumb_lat, 'lat', f.hand)]);
      rows.push([`Middle (${midSide} hole)`, both(f.middle_d), `${m.middle_bore_in}" (${r2(m.middle_bore_mm)} mm)`, hasThumb ? both(f.span_middle) : '-',
        hasGrip ? describePitch(f.middle_fwd, 'fr', f.hand) : 'zero', hasGrip ? describePitch(f.middle_lat, 'lat', f.hand) : 'zero']);
      rows.push([`Ring (${ringSide} hole)`, both(f.ring_d), `${m.ring_bore_in}" (${r2(m.ring_bore_mm)} mm)`, hasThumb ? both(f.span_ring) : '-',
        hasGrip ? describePitch(f.ring_fwd, 'fr', f.hand) : 'zero', hasGrip ? describePitch(f.ring_lat, 'lat', f.hand) : 'zero']);
      const W = [20, 22, 22, 22, 16];
      L.push('DRILL SHEET AS ENTERED, AND THE BORE SIZE THE MODEL USES (sheet size + print allowance)');
      L.push(['', 'Sheet size', 'Modeled bore', 'Span (cut to cut)', 'Forward/reverse', 'Lateral'].map((h, i) => i < 5 ? pad(h, W[i]) : h).join(''));
      for (const r of rows) L.push(r.map((c, i) => i < 5 ? pad(c, W[i]) : c).join(''));
      const ovals = [hasThumb ? ovalTxt(f.thumb_d, f.thumb_oval_d, f.thumb_oval_angle, 'Thumb', m.thumb_oval_mm) : '', ovalTxt(f.middle_d, f.middle_oval_d, f.finger_oval_angle, 'Middle', m.middle_oval_mm), ovalTxt(f.ring_d, f.ring_oval_d, f.finger_oval_angle, 'Ring', m.ring_oval_mm)].filter(Boolean);
      if (ovals.length) { L.push('OVAL HOLES (the hole size above is the short way across; the oval size is the long way; "modeled" adds the print allowance)'); ovals.forEach(x => L.push(x)); }
      L.push(`Hole edges: ${hasThumb ? `thumb bevel ${r2(f.thumb_bevel)} mm, ` : ''}finger bevel ${r2(f.finger_bevel)} mm (rounded).   Engraved in the base: ${order.number}`);
      if (hasBall && f.thumb_hole === false) L.push('NO THUMB HOLE: two-handed / no-thumb ball; the finger holes sit centred on the top, so the spans do not apply.');
      L.push('');
      if (hasPuck) {
        L.push(`Bridge ${both(f.bridge)}   Finger depth ${f.finger_depth} mm   Thumb ${f.thumb_through ? 'through' : 'blind, ' + f.thumb_depth + ' mm deep'}`);
        L.push(`Print allowance ${m.print_allowance_mm} mm   Weight pocket ${f.weight_pocket ? 'yes' : 'no'}   Wrist-cord tunnel ${f.lanyard ? 'yes' : 'no'}`);
      }
      if (hasBall) {
        const STRIPE = { none: 'one-colour body (the second colour is the inlays)', spot: 'small coloured spot on top', spot_band: 'small coloured spot on top and a band', cap: 'coloured top cap', cap_band: 'coloured top cap and a band', bands: 'three bands round the middle' };
        L.push(`Rev Ball: ${r2(f.ball_d)} mm ball. ${f.thumb_hole === false ? 'No thumb hole (two-handed)' : `Thumb hole blind, ${r2(f.ball_thumb_depth)} mm deep`}. Finger depth ${f.finger_depth} mm. Bridge ${both(f.bridge)}. Resting flat ${r2(f.ball_flat)} mm. Colours: ${STRIPE[f.ball_stripe] || f.ball_stripe}. Marker groove ${f.ball_groove ? 'yes' : 'no'}. Print allowance ${m.print_allowance_mm} mm.`);
        const pp = (built.stats.find(s => s.part === 'ball') || {}).pap || {};
        const papFrom = pp.from || (f.thumb_hole === false ? 'the middle of the two finger holes' : 'the centre of the grip');
        if (f.pap_marker) L.push(`Axis target${f.pap_ring ? ' dots and rings' : ' dots'}: two ${r2(pp.socket_d_mm || 12)} mm sockets${f.pap_ring ? `, each inside a ${2 * (pp.ring ? pp.ring.r_mm : 30)} mm ring pocket,` : ''} at the axis point and at the opposite point. PAP ${both(pp.over_mm ?? f.pap_over)} over toward the hand side, then ${both(pp.up_mm ?? f.pap_up)} up, measured along the surface from ${papFrom} (${f.pap_given ? 'from the drill sheet' : 'not on the sheet: the common position'}); those are distances on a regulation ball, so on this ${r2(f.ball_d)} mm ball the axis sits at the same angle, ${r2(pp.over_ball_mm)} mm over and ${r2(pp.up_ball_mm)} mm up along the surface. Press the printed ${f.pap_ring ? 'plugs and rings (the axis_inlays file' : 'plugs (the axis_plugs file'}, second colour) in. When the ball spins about that axis the ${f.pap_ring ? 'dot and ring stand' : 'dot stands'} still; on carpet only a forward roll keeps its axis, a hook release's axis swings round in the first foot as the carpet grabs.`);
        else if (f.pap_given) L.push(`PAP from the sheet: ${both(f.pap_over)} over, ${both(f.pap_up)} up from ${papFrom} (no axis target on this ball).`);
        if (f.pap_marker && f.pap_track) {
          const tk = pp.track || {};
          const tiltTxt = tk.tilt_deg ? `with ${r2(tk.tilt_deg)} degrees of axis tilt (${r2(tk.angle_deg)} degrees from the axis point, round the opposite axis point on the far side of the ball)` : 'end over end (the ring is its equator about the axis point)';
          const through = tk.crosses && tk.crosses.length ? ` It runs through the ${tk.crosses.join(' and ')} hole${tk.crosses.length > 1 ? 's' : ''}, as a track does; the channel stops ${r2(tk.clear_mm || 1.5)} mm short of each bevel, so that arc comes in pieces: dry-fit them round the ball before gluing.` : ' It clears the grip holes.';
          const gapsTxt = tk.gaps_mm ? ` Its centre line passes ${Object.entries(tk.gaps_mm).map(([n, g]) => g >= 0 ? `${g} mm from the ${n} hole's bevel` : `through the ${n} hole`).join(', ')} (along the surface): compare with the oil ring on the bowler's own ball.` : '';
          L.push(`Track ring: a ${r2(tk.w_mm || 12)} mm channel ${r2(tk.depth_mm || 2)} mm deep on the bowler's track, the line the ball rolls on when it spins about the axis point ${tiltTxt}.${through}${gapsTxt} Two second-colour arcs in the inlays file fit it; they stand on their lower edge as exported (no supports; a brim helps). Glue them in (CA glue) and sand flush. Rolled forward about that axis the ball rolls along the ring and the ring holds still; released with the hand round the side, the carpet swings the axis and the ring wobbles.`);
        }
        const cc = (built.stats.find(s => s.part === 'ball') || {}).color_changes || [];
        if (cc.length) {
          L.push('FILAMENT CHANGES for the two-colour ball (start the print in the base colour). In Bambu Studio slice it, then');
          L.push('right-click the layer slider at each height and choose "Add color change"; the printer pauses there for the swap:');
          for (const c of cc) L.push(`  at ${c.z_mm} mm: ${c.colour}`);
          for (const t of (((built.stats.find(s => s.part === 'ball') || {}).pattern || {}).notes || [])) L.push(`  ${t}`);
          L.push('  Easier: open the .3mf instead of the STL. It is the same ball as one object in two parts with filament 1 (base colour) and filament 2 (second colour) already assigned, so the swaps are set without touching the slider. If it opens in one colour, use the STL and the heights above. Turn the prime tower off: the swaps are one colour per layer.');
        }
      }
      if (hasSpin) {
        L.push(`${hasPuck ? 'Rev Spinner: ' : ''}two finger holes only, no thumb hole. Spans and pitches above do not apply to the spinner: its holes are drilled straight at the ball's center (zero pitch). Hole spacing uses the bridge ${both(f.bridge)}; finger depth ${Math.min(f.finger_depth, 20)} mm; wrist-cord tunnel ${f.lanyard && !f.spin_hum ? 'yes' : 'no'}; print allowance ${m.print_allowance_mm} mm.`);
        if (f.spin_hum) L.push(`HUMMING CHAMBER (experimental): a hollow ring inside the spinner with ${f.spin_hum_slots} slots at ${f.spin_hum_angle} deg through the top; it hums once the spin is fast enough and stops when it slows. The wrist-cord tunnel is left out (it would cross the chamber). Print as usual, flat side down, no supports: the chamber roof is a 45 deg gable.`);
      }
      L.push('');
    }
    if (hasSizer) {
      L.push('SIZER PLATE', `Finger row centred on ${both(f.sizer_finger_center)}, thumb row centred on ${both(f.sizer_thumb_center)}, steps of ${r2(f.sizer_step)} mm. Each bore is engraved with its diameter in mm. No print allowance is added: the bores are exactly the engraved size.`, '');
    }
    if (hasGate) {
      const g = (built.stats.find(s => s.part === 'gate') || {}).gate || {};
      L.push('RELEASE GATE (the feedback for the ball)');
      L.push(`The gate file holds one base segment and one loose pin: print 3 or 5 copies, flat, no supports (the pin prints standing). Linked end to end by their dovetails the segments put the pins ${r2(g.spacing_mm)} mm apart (ball diameter + 10 mm); the pins are ${r2(g.pin_h_mm)} mm tall, ${r2(g.pin_d_mm)} mm across, and stand loose in the shallow cups.`);
      L.push('Use: link the segments across the tape line 1.5 to 2 m from the release point, with the tape running through the groove on the middle segment, and stand a pin in each cup. Decide which pin a correct release should knock down: the centre pin for straight, heavy forward roll; one or two pins over for a hook. The pin that falls, about a second after the release, is the feedback.', '');
    }

    L.push('PRINT');
    if (hasPuck || hasSpin || hasSizer || hasGate) L.push(`${hasBall ? 'Puck, spinner, sizer, gate: ' : ''}PETG, 0.2 mm layers, 4 walls, 20% gyroid infill, flat side down, no supports.`);
    if (hasBall) L.push(`${hasPuck || hasSpin || hasSizer ? 'Ball: ' : ''}PETG (not PLA: it cracks), 0.2 mm layers, 4 walls, 8% gyroid infill, 5 top and bottom layers, nozzle at the top of the PETG range (about 250 C) with the part fan at 30 to 40% so the layers bond, grip holes facing UP. Supports: tree, "On build plate only" (so nothing grows inside the holes), with the SUPPORT INTERFACE in a filament the ball will not bond to: PLA under a PETG ball, PETG under a PLA ball (Bambu Studio: Support tab, "Filament for support interface"; threshold angle 45, so the whole underside is held; top Z distance 0, 3 interface layers). The supports then drop off and leave the surface clean; plain PETG supports tear out and leave a scar; seam: random or scarf (no ridge down one side). Roll it on a table to check it runs true.`);
    if (hasBall && f.pap_marker) L.push(`Axis ${f.pap_ring ? 'plugs and rings' : 'plugs'}${f.pap_track ? ' and track arcs' : ''}: the second colour, 0.2 mm layers, 100% infill, as exported (plugs and rings flat side down${f.pap_track ? ', the arcs standing on edge: give them a brim' : ''}), no supports. Press a plug into each socket${f.pap_ring ? ' and a ring into each ring pocket (a drop of glue if a ring is loose)' : ''}${f.pap_track ? '; glue the arcs into the track channel and sand them flush' : ''}.`);
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
  const PDF_MAP = { '\u2019': "'", '\u2018': "'", '\u201c': '"', '\u201d': '"', '\u2013': '-', '\u2014': '-', '\u00d7': 'x', '\u2026': '...', '\u20ac': 'EUR', '\u0141': 'L', '\u0142': 'l', '\u0110': 'D', '\u0111': 'd', '\u00d8': 'O', '\u00f8': 'o', '\u00c6': 'AE', '\u00e6': 'ae', '\u0152': 'OE', '\u0153': 'oe', '\u00df': 'ss', '\u00de': 'Th', '\u00fe': 'th', '\u00d0': 'D', '\u00f0': 'd' };
  function pdfEscape(s) {
    // the fonts use WinAnsiEncoding, so Latin-1 letters (José, Müller, Zoë) go through as single bytes;
    // letters beyond Latin-1 lose their accent marks (Łukasz -> Lukasz); the rest becomes '?'
    const t = String(s).replace(/[^\x20-\x7e\u00a0-\u00ff]|[\u00d7\u00df\u00de\u00fe\u00d0\u00f0\u00d8\u00f8\u00c6\u00e6]/g, (ch) => {
      if (PDF_MAP[ch]) return PDF_MAP[ch];
      const base = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return /^[\x20-\x7e\u00a0-\u00ff]$/.test(base) ? base : '?';
    }).replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ');
    return t.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }
  // word-wrap, keeping a paragraph's leading indent on every line it produces; words longer than the
  // line are broken rather than left to run off the page
  function wrap(text, max = 92) {
    const out = [];
    for (const para of String(text).split('\n')) {
      const indent = (para.match(/^ */) || [''])[0], body = para.slice(indent.length), width = Math.max(10, max - indent.length);
      let line = '';
      const words = body.split(' ').flatMap(w => { const bits = []; while (w.length > width) { bits.push(w.slice(0, width)); w = w.slice(width); } bits.push(w); return bits; });
      for (const w of words) { if ((line + ' ' + w).trim().length > width) { out.push(indent + line.trim()); line = w; } else line += ' ' + w; }
      out.push(indent + line.trim());
    }
    return out;
  }
  // The release-angle scale: the track ring seen from a phone on the floor behind the release point.
  // The ring turns with the hand, so it is a straight line on a forward roll and opens into an oval
  // as the hand turns through the ball; width over height is the sine of the release angle.
  function ovalScale(yTop) {
    const ops = ['q 1.2 w 0 0 0 RG'], ry = 17, cy = yTop - ry - 2, k = 0.5523;
    [[0, '0\u00b0'], [30, '30\u00b0'], [45, '45\u00b0 hook'], [60, '60\u00b0']].forEach(([deg, label], i) => {
      const cx = 120 + i * 118, rx = ry * Math.sin(deg * Math.PI / 180), n = (v) => v.toFixed(1);
      if (rx < 0.5) ops.push(`${cx} ${n(cy - ry)} m ${cx} ${n(cy + ry)} l S`);
      else ops.push(`${n(cx + rx)} ${n(cy)} m`,
        `${n(cx + rx)} ${n(cy + k * ry)} ${n(cx + k * rx)} ${n(cy + ry)} ${cx} ${n(cy + ry)} c`,
        `${n(cx - k * rx)} ${n(cy + ry)} ${n(cx - rx)} ${n(cy + k * ry)} ${n(cx - rx)} ${n(cy)} c`,
        `${n(cx - rx)} ${n(cy - k * ry)} ${n(cx - k * rx)} ${n(cy - ry)} ${cx} ${n(cy - ry)} c`,
        `${n(cx + k * rx)} ${n(cy - ry)} ${n(cx + rx)} ${n(cy - k * ry)} ${n(cx + rx)} ${n(cy)} c S`);
      ops.push(`0.5 w ${cx - 24} ${n(cy - ry - 2)} m ${cx + 24} ${n(cy - ry - 2)} l S 1.2 w`);   // the floor
      ops.push(`BT /F1 8.5 Tf ${n(cx - 22)} ${n(cy - ry - 13)} Td (${pdfEscape(label)}) Tj ET`);
    });
    ops.push('Q');
    return ops;
  }
  // lines: [{ t: text, b: bold?, s: size, gap: extra space after }] or { scale: true } for the oval scale
  function makePdf(lines) {
    const pages = [[]]; let y = 740;
    for (const ln of lines) {
      if (ln.scale) {
        if (y < 60 + 56) { pages.push([]); y = 740; }
        pages[pages.length - 1].push(...ovalScale(y)); y -= 56 + (ln.gap || 0);
        continue;
      }
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
    const hasPuck = parts.includes('puck'), hasSpin = parts.includes('spinner'), hasSizer = parts.includes('sizer'), hasBall = parts.includes('ball'), hasGate = parts.includes('gate');
    const hasThumb = (hasPuck || hasBall) && !(hasBall && f.thumb_hole === false);
    const both = (mm) => `${fraction64(mm / IN)}" (${Math.round(mm * 100) / 100} mm)`;
    const hookSide = f.hand === 'left' ? 'right' : 'left';   // a hook curves toward the thumb side
    // "Jordan Lee" -> Jordan; "Lee, Jordan" -> Jordan
    const name = String(order.customer.name || '').trim();
    const first = (name.includes(',') ? name.split(',').slice(1).join(' ') : name).split(/[\s,]+/).filter(Boolean)[0] || 'there';
    const kitOnly = hasSizer && !hasPuck && !hasBall && !hasSpin;
    const L = [];
    L.push({ t: 'RollRead', b: true, s: 20 }, { t: `Order ${order.number} - ${(info.products[order.product] || {}).label || order.product}`, s: 11, gap: 8 });
    L.push({ t: kitOnly ? `Hi ${first}. This plate is for finding the hole sizes that fit you on my printer. Here's how to use it.` : `Hi ${first}. This came off my printer from your own drill sheet. Here's what it's for and how to use it.`, gap: 8 });
    L.push({ t: kitOnly ? 'YOUR SIZES (the plate is centred on them)' : 'YOUR FIT (as printed)', b: true, s: 12 });
    const spanTxt = (mm) => (hasThumb ? `, span ${both(mm)}` : '');
    if (hasPuck || hasBall) {
      if (hasThumb) L.push({ t: `Thumb ${both(f.thumb_d)}${f.thumb_oval_d > 0 ? `, oval ${both(f.thumb_oval_d)} at ${f.thumb_oval_angle} deg` : ''}, pitch ${describePitch(f.thumb_fwd, 'fr', f.hand)}, ${describePitch(f.thumb_lat, 'lat', f.hand)}` });
      else L.push({ t: 'No thumb hole (two-handed): the two finger holes sit centred on the top.' });
      L.push({ t: `Middle finger ${both(f.middle_d)}${f.middle_oval_d > 0 ? ` oval ${both(f.middle_oval_d)}` : ''}${spanTxt(f.span_middle)}, pitch ${describePitch(f.middle_fwd, 'fr', f.hand)}, ${describePitch(f.middle_lat, 'lat', f.hand)}` });
      L.push({ t: `Ring finger ${both(f.ring_d)}${f.ring_oval_d > 0 ? ` oval ${both(f.ring_oval_d)}` : ''}${spanTxt(f.span_ring)}, pitch ${describePitch(f.ring_fwd, 'fr', f.hand)}, ${describePitch(f.ring_lat, 'lat', f.hand)}` });
      L.push({ t: `${f.hand === 'right' ? 'Right' : 'Left'}-handed. Bridge ${both(f.bridge)}. Printed holes are ${m.print_allowance_mm} mm oversize to allow for printing; finish the fit with bowler's tape, as on a ball.`, gap: hasBall && f.pap_marker ? 2 : 8 });
      const pb = (built.stats.find(s => s.part === 'ball') || {}).pap || {};
      if (hasBall && f.pap_marker) L.push({ t: `Axis point: ${both(pb.over_mm ?? f.pap_over)} over, ${both(pb.up_mm ?? f.pap_up)} up from ${f.thumb_hole === false ? 'the middle of the two finger holes' : 'the centre of the grip'}${f.pap_given ? ', your PAP from your sheet.' : ' (the common position; a pro shop can measure your own).'}`, gap: 8 });
    } else if (hasSpin) {
      L.push({ t: `Middle finger ${both(f.middle_d)}${f.middle_oval_d > 0 ? ` oval ${both(f.middle_oval_d)}` : ''}, ring finger ${both(f.ring_d)}${f.ring_oval_d > 0 ? ` oval ${both(f.ring_oval_d)}` : ''}, bridge ${both(f.bridge)}. Printed holes are ${m.print_allowance_mm} mm oversize to allow for printing; finish the fit with bowler's tape.`, gap: 8 });
    } else if (kitOnly) {
      L.push({ t: `Thumb row centred on ${both(f.sizer_thumb_center)}, finger row centred on ${both(f.sizer_finger_center)}, in steps of ${f.sizer_step} mm. Each hole has its size engraved beside it.`, gap: 8 });
    }
    if (hasBall) {
      const eye = f.pap_ring ? 'bullseye' : 'dot', eyes = f.pap_ring ? 'bullseyes' : 'dots';
      const ring = f.pap_marker && f.pap_track;
      const tkb = ((built.stats.find(s => s.part === 'ball') || {}).pap || {}).track || {};
      const gapsTxt = tkb.gaps_mm ? Object.entries(tkb.gaps_mm).map(([n, g]) => g >= 0 ? `${g} mm from the ${n} hole` : `through the ${n} hole`).join(', ') : '';
      L.push({ t: 'REV BALL: TWO DRILLS, ONE BALL', b: true, s: 12 });
      if (f.pap_marker) L.push({ t: `The two coloured ${eyes} are your axis point, the PAP${f.pap_given ? ', from your sheet' : `. Your sheet didn't give one, so they're at the common spot; a pro shop can measure yours`}.${ring ? ` The coloured ring is your track: the line the ball rolls on around that axis with ${tkb.tilt_deg ?? f.track_tilt} degrees of tilt. On this ball it passes ${gapsTxt || 'the holes'}. Hold your real ball next to it and the oil ring should run in about the same place. If it doesn't, the PAP or the tilt on the sheet is off, not the print.` : ''}`, gap: 4 });
      L.push({ t: `1. Tape a line on the carpet, with the couch or a wall 1.5 to 2 m past the end of it${hasGate ? ' and the gate across the tape there' : ''}. Put your phone on the floor behind you, pointing down the tape.` });
      L.push({ t: '2. Kneel on one knee and swing it low along the tape. Let it go the way you do on the lane.' });
      L.push({ t: '3. What it did:', gap: 2 });
      L.push({ t: '   Rolled and curved off the line. Thumb out first, fingers lifted, hand turned through it. More curve means more side rotation, or more revs.' });
      L.push({ t: '   Straight, long and lively. Forward roll, hand behind the ball. Nothing wrong with that.' });
      L.push({ t: '   Straight and short. Everything let go at once. A dump.' });
      L.push({ t: '   Popped up and landed late. The thumb hung up.' });
      L.push({ t: '   Spun in place. The hand came over the top.', gap: 4 });
      L.push({ t: 'DRILL 1: THE YO-YO ROLL (STAY BEHIND THE BALL)', b: true, s: 11 });
      L.push({ t: `Hand behind the ball, thumb out first, fingers lifting straight up the back, like you're throwing a yo-yo. Done right it runs straight and long down the tape with the holes going over the top${hasGate ? ' and takes out the centre pin' : ''}.${f.pap_marker ? ` Don't watch the ${eye} on this one. A straight lift spins the ball about an axis out through its sides, not your PAP, so the ${eye} wheels in a small circle${ring ? ' and the ring shows a bit open' : ''}. Watch the path.` : ''} Come round the ball and the carpet kinks it off the line in the first foot. Ten straight ones in a row, then drill 2.`, gap: 4 });
      L.push({ t: 'DRILL 2: THE PROPER RELEASE (TURN THROUGH THE BALL)', b: true, s: 11 });
      L.push({ t: `Same start, hand behind it. As the thumb comes out, the fingers lift and the hand turns through the ball to the handshake. ${ring ? 'The track ring sits square to the axis the ball spins about, so the phone behind you sees it as an oval, and how far open it is is your axis rotation. A lean in the oval is your tilt. Match it to the scale:' : 'The finger holes turn with your hand, so the phone behind you shows how far you turned.'}` });
      if (ring) L.push({ scale: true, gap: 2 });
      L.push({ t: `Carpet grabs the ball in the first foot, so it kinks off the tape to the ${hookSide}${hasGate ? ` and knocks down a pin one or two over` : ''}${f.pap_marker ? `, and the ${eye} holds for the first few frames and then wheels in a circle. The size of that circle is your rotation` : ''}. What you're after is the same ${ring ? 'oval, the same ' : ''}curve${hasGate ? ', the same pin' : ''}${f.pap_marker ? ' and the same circle' : ''}, ten times running. Add speed and revs after that holds, not before.`, gap: 4 });
      const SPIN = { none: f.ball_groove ? 'The groove round the middle shows the spin.' : 'Watch the finger holes to see the spin.', spot: 'The coloured spot on top shows the spin.', spot_band: 'The coloured spot on top and the band show the spin.', cap: 'The coloured top cap shows the spin.', cap_band: 'The coloured cap and band show the spin.', bands: 'The coloured bands show the spin.' };
      const spinTxt = ring ? `The track ring shows the spin.${f.ball_stripe && f.ball_stripe !== 'none' ? ' ' + (SPIN[f.ball_stripe] || '') : ''}` : (SPIN[f.ball_stripe] || SPIN.cap_band);
      L.push({ t: `${spinTxt} Ten of each a day is plenty. It's a feedback tool, not a measuring instrument, and it makes no promise about your rev rate.`, gap: 8 });
    }
    if (hasSpin && f.spin_hum) {
      L.push({ t: 'HUMMING SPINNER', b: true, s: 12 });
      L.push({ t: 'Spin it on a table with the finger lift alone, the way the fingers come off the ball. The hum starts only when the spin is fast enough and stops as it slows, so a hum that starts at once and lasts is a strong, clean lift. It is experimental: the note and the speed it starts at vary from print to print.', gap: 8 });
    }
    if (hasGate) {
      L.push({ t: 'RELEASE GATE', b: true, s: 12 });
      L.push({ t: `Link the segments across the tape 1.5 to 2 m out, tape through the groove on the middle one, a pin in each cup. The centre pin is the yo-yo target: roll it straight with your hand behind the ball and that pin goes down about a second after you let go. The pin one or two over to the ${hookSide} is your hook target, and a proper release takes the same one every time. When the wrong pin falls, you know which way you missed.`, gap: 8 });
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
    el.where.textContent = `Print files: ${info.ordersFolder}. Order book: ${info.dataFolder}. RollRead never sends them anywhere, but if Windows backs up your Documents folder to OneDrive, the print files and orders.csv (which holds customer contact details) go with it. Back up the order book folder to keep your customers safe.`;
  }

  async function init() {
    await appReady();
    info = await bridge.info();
    document.title = `RollRead ${info.version} · build ${info.built || 'unknown'}`;   // which build this window is, for support
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
    // RollRead engraves the order number itself, so the field only shows it
    const serialField = byId('serial');
    if (serialField) {
      serialField.readOnly = true; serialField.placeholder = 'order number';
      const note = serialField.parentElement && serialField.parentElement.querySelector('small');
      if (note) note.textContent = 'The order number is engraved automatically when the order is exported.';
    }
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
