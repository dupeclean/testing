// End-to-end test: launches the real desktop app, enters a drill sheet through the
// form, creates and exports an order, restarts, and checks what is on disk.
//
//   xvfb-run -a node test/e2e.mjs            (Linux without a display)
//   node test/e2e.mjs                        (anywhere with a display)
//
// PLAYWRIGHT_PATH points at a playwright install if it is not in node_modules.

import { createRequire } from 'node:module';
import { mkdtempSync, readdirSync, readFileSync, existsSync, rmSync, mkdirSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { _electron: electron } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const electronBin = require(join(appDir, 'node_modules', 'electron'));
const shotDir = process.argv[2] || join(appDir, 'test', 'tmp');
mkdirSync(shotDir, { recursive: true });

const root = mkdtempSync(join(tmpdir(), 'fitslice-e2e-'));
const dataDir = join(root, 'data');
const ordersDir = join(root, 'orders');
const results = [];
const ok = (name) => { results.push(name); console.log('  ok  ' + name); };

async function launch() {
  // FITSLICE_E2E_BIN runs a packaged build (e.g. dist/linux-unpacked/fitslice) instead of the source tree
  const packaged = process.env.FITSLICE_E2E_BIN;
  const args = packaged ? ['--disable-gpu'] : [appDir, '--disable-gpu'];
  if (typeof process.getuid === 'function' && process.getuid() === 0) args.push('--no-sandbox');
  const app = await electron.launch({ executablePath: packaged || electronBin, args, env: { ...process.env, FITSLICE_DATA_DIR: dataDir, FITSLICE_ORDERS_DIR: ordersDir } });
  const page = await app.firstWindow();
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  await page.waitForFunction(() => window.__cfgApp && window.__cfgApp.ready && window.__orders && window.__orders.ready, null, { timeout: 90000 });
  await page.waitForFunction(() => /Built in/.test(document.getElementById('status').textContent), null, { timeout: 60000 });
  return { app, page, problems };
}

async function fill(page, id, value) {
  await page.fill('#' + id, value);
  await page.dispatchEvent('#' + id, 'change');
}

function readStl(file) {
  const b = readFileSync(file);
  const n = b.readUInt32LE(80);
  assert.equal(b.length, 84 + n * 50, `${file}: STL size matches its triangle count`);
  let vol = 0, minZ = Infinity, maxZ = -Infinity;
  for (let t = 0; t < n; t++) {
    const o = 84 + t * 50 + 12; const v = [];
    for (let k = 0; k < 3; k++) { v.push([b.readFloatLE(o + k * 12), b.readFloatLE(o + k * 12 + 4), b.readFloatLE(o + k * 12 + 8)]); minZ = Math.min(minZ, v[k][2]); maxZ = Math.max(maxZ, v[k][2]); }
    vol += (v[0][0] * (v[1][1] * v[2][2] - v[2][1] * v[1][2]) - v[1][0] * (v[0][1] * v[2][2] - v[2][1] * v[0][2]) + v[2][0] * (v[0][1] * v[1][2] - v[1][1] * v[0][2])) / 6;
  }
  return { triangles: n, volume_cm3: vol / 1000, height_mm: maxZ - minZ };
}

let session;
try {
  console.log('first launch');
  session = await launch();
  let { app, page, problems } = session;

  // sandboxed page: no Node, only the named bridge
  const sec = await page.evaluate(() => ({ req: typeof require, proc: typeof process, bridge: Object.keys(window.fitslice).sort() }));
  assert.equal(sec.req, 'undefined'); assert.equal(sec.proc, 'undefined');
  assert.ok(sec.bridge.includes('saveOrder') && !sec.bridge.includes('writeFile'));
  ok('page has no Node access, only the named bridge');

  // enter the drill sheet the way a person would (inches mode, fractions as written)
  await page.click('[data-unit="in"]');
  await fill(page, 'thumb_d', '29/32');
  await fill(page, 'middle_d', '5/8'); await fill(page, 'ring_d', '21/32');
  await fill(page, 'span_middle', '4 5/16'); await fill(page, 'span_ring', '4 1/8');
  await fill(page, 'thumb_fwd', '0'); await fill(page, 'thumb_lat', '-1/8');
  await fill(page, 'middle_fwd', '3/4'); await fill(page, 'middle_lat', '1/4');
  await fill(page, 'ring_fwd', '3/4'); await fill(page, 'ring_lat', '-1/4');
  await fill(page, 'bridge', '1/2');
  await page.waitForFunction(() => /Built in/.test(document.getElementById('status').textContent));
  const st = await page.evaluate(() => window.__cfgApp.getState());
  assert.ok(Math.abs(st.thumb_d - 23.0) < 0.05, 'thumb 29/32 in mm'); assert.ok(Math.abs(st.span_middle - 109.5) < 0.1);
  assert.equal(st.middle_fwd, 0.75); assert.equal(st.thumb_lat, -0.125);
  ok('form accepts the sheet in fractions and converts correctly');

  // saving without a name is refused with a plain message
  await page.click('#ob-new');
  await page.click('#ob-form-save');
  assert.match(await page.textContent('#ob-err'), /customer's name/);
  ok('order without a name is refused');

  // create the order; hostile text in the name must stay text
  const evil = 'Jordan <img src=x onerror="window.__pwn=1"> Lee';
  await page.fill('#ob-name', evil);
  await page.fill('#ob-email', 'jordan@example.com');
  await page.selectOption('#ob-product', 'pair');
  await page.fill('#ob-notes', 'League bowler, wants it before Thursday');
  await page.click('#ob-form-save');
  await page.waitForSelector('.orow');
  assert.equal(await page.textContent('.orow .n'), 'FS-0001');
  assert.equal(await page.evaluate(() => window.__pwn === undefined), true);
  assert.equal(await page.evaluate(() => document.querySelectorAll('#ob-list img').length), 0);
  assert.match(await page.textContent('#ob-stats'), /1 order · \$119\.00/);
  ok('order saved as FS-0001 at $119.00; customer text is not interpreted as HTML');

  // export print files
  await page.click('#ob-close');
  await page.click('#ob-export');
  await page.waitForFunction(() => /Saved \d+ files/.test(document.getElementById('ob-toast-text').textContent), null, { timeout: 60000 });
  const folders = readdirSync(ordersDir);
  assert.equal(folders.length, 1);
  const folder = join(ordersDir, folders[0]);
  assert.ok(/^FS-0001 Jordan/.test(folders[0]) && !/[<>"]/.test(folders[0]), 'folder name is safe: ' + folders[0]);
  const files = readdirSync(folder).sort();
  assert.equal(files.filter(f => f.endsWith('.stl')).length, 2);
  assert.ok(files.includes('fit_sheet.json') && files.includes('job_sheet.txt'));
  assert.equal(files.some(f => f.endsWith('.tmp')), false);
  const stls = files.filter(f => f.endsWith('.stl')).map(f => ({ f, ...readStl(join(folder, f)) }));
  const puck = stls.find(s => /puck/.test(s.f)), spin = stls.find(s => /spinner/.test(s.f));
  assert.ok(puck && spin);
  assert.ok(puck.volume_cm3 > 600 && puck.volume_cm3 < 900, 'puck volume ' + puck.volume_cm3);
  assert.ok(Math.abs(puck.height_mm - 60) < 0.01 && Math.abs(spin.height_mm - 38) < 0.01);
  const sheet = JSON.parse(readFileSync(join(folder, 'fit_sheet.json'), 'utf8'));
  assert.equal(sheet.order, 'FS-0001'); assert.equal(sheet.hand, 'right'); assert.equal(sheet.middle_fwd, 0.75);
  assert.ok(Math.abs(sheet.modeled.middle_bore_mm - (15.875 + 0.4)) < 0.01, 'modeled middle bore includes print allowance');
  const job = readFileSync(join(folder, 'job_sheet.txt'), 'utf8');
  assert.match(job, /FS-0001/); assert.match(job, /5\/8/); assert.equal(/jordan@example\.com/.test(job), false);
  ok(`exported ${files.length} files: two valid STLs (puck ${puck.volume_cm3.toFixed(0)} cm3, spinner ${spin.volume_cm3.toFixed(0)} cm3), fit sheet, job sheet without contact details`);

  // spreadsheet export
  await page.evaluate(() => window.fitslice.exportCsv());
  const csv = readFileSync(join(ordersDir, 'orders.csv'), 'utf8');
  assert.match(csv, /FS-0001/); assert.match(csv, /119\.00/);
  ok('orders.csv written');

  // millimetres typed while the switch is on inches: refused plainly, no crash, no save
  await fill(page, 'span_middle', '110');
  assert.match(await page.textContent('#status'), /outside the usable range.*millimetres typed while the switch is on inches/s);
  assert.equal(await page.evaluate(() => document.getElementById('span_middle').classList.contains('bad')), true);
  assert.equal((await page.evaluate(() => window.__cfgApp.getState())).span_middle > 100 && (await page.evaluate(() => window.__cfgApp.getState())).span_middle < 120, true, 'the old good value is kept');
  await page.click('#ob-save');
  assert.match(await page.textContent('#ob-err'), /Fix the drill sheet first/);
  await fill(page, 'span_middle', '4 5/16');
  await page.waitForFunction(() => /Built in/.test(document.getElementById('status').textContent));
  assert.equal(await page.evaluate(() => document.getElementById('span_middle').classList.contains('bad')), false);
  ok('a wrong-unit span is refused with a plain message, blocks saving, and the app keeps running');

  // a download right after an edit must use the NEW model, not the previous one
  await page.evaluate(() => { window.__dl = []; HTMLAnchorElement.prototype.click = function () { window.__dl.push(this.download); }; });   // capture the file name instead of opening a Save dialog
  await fill(page, 'middle_d', '19/32');
  await page.click('#save_stl');
  await page.waitForFunction(() => window.__dl.length === 1, null, { timeout: 20000 });
  const dlName = await page.evaluate(() => window.__dl[0]);
  assert.match(dlName, /_M15p5_/, 'download used the old model: ' + dlName);
  ok('a download straight after an edit uses the edited model, not the previous one');

  // nothing in the app reaches the network
  assert.equal(await page.evaluate(() => fetch('https://example.com/').then(() => 'loaded', () => 'blocked')), 'blocked');
  assert.equal(await app.evaluate(({ session }) => session.defaultSession.isSpellCheckerEnabled()), false);
  const reqs = await app.evaluate(async ({ net }) => {
    // a request made from the main process side is also refused (the session filter)
    try { await net.fetch('https://example.com/', { bypassCustomProtocolHandlers: true }); return ['loaded']; } catch (_) { return ['blocked']; }
  });
  assert.deepEqual(reqs, ['blocked']);
  ok('network requests are refused (page and session), spell-check downloads are off');

  // re-export after a change: same folder, only the current files, the old ones set aside
  await page.evaluate(() => { document.getElementById('ob-toast-text').textContent = ''; });
  await fill(page, 'middle_d', '11/16');
  await page.click('#ob-export');
  await page.waitForFunction(() => /Saved \d+ files for FS-0001/.test(document.getElementById('ob-toast-text').textContent), null, { timeout: 60000 });
  const dirsIn = () => readdirSync(ordersDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  assert.equal(dirsIn().length, 1, 'still one folder');
  const nowFiles = readdirSync(folder).filter(f => f !== 'superseded');
  assert.equal(nowFiles.filter(f => f.endsWith('.stl')).length, 2, 'only the two current STLs: ' + nowFiles.join(', '));
  assert.ok(readdirSync(join(folder, 'superseded')).filter(f => f.endsWith('.stl')).length >= 1, 'old STLs moved aside');
  ok('re-export keeps one folder with only the current STLs; the old ones are in "superseded"');

  // fixing the customer's name later does not strand the files
  if (!(await page.isVisible('#ob-name'))) await page.click('#ob-orders');
  await page.fill('#ob-name', 'Jordan Leigh');
  await page.evaluate(() => { document.getElementById('ob-toast-text').textContent = ''; });
  await page.click('#ob-form-export');
  await page.waitForFunction(() => /Saved \d+ files for FS-0001/.test(document.getElementById('ob-toast-text').textContent), null, { timeout: 60000 });
  assert.deepEqual(dirsIn(), [folders[0]], 'the same folder is reused after a rename');
  ok('renaming the customer reuses the same files folder');
  await page.click('#ob-close');

  await page.screenshot({ path: join(shotDir, 'app-main.png') });
  await page.click('#ob-orders');
  await page.screenshot({ path: join(shotDir, 'app-drawer.png') });
  const bad = problems.filter(p => !/GPU|WebGL|swiftshader|GL Driver|ContextResult|example\.com/i.test(p));
  assert.deepEqual(bad, [], 'no page errors or CSP violations');
  ok('no page errors or content-policy violations');
  await app.close();

  // restart: the order must still be there and reopen with its sheet
  console.log('second launch (restart)');
  session = await launch(); ({ app, page, problems } = session);
  await page.click('#ob-orders');
  assert.equal(await page.textContent('.orow .n'), 'FS-0001');
  await page.click('.orow');
  await page.waitForFunction(() => /Built in/.test(document.getElementById('status').textContent));
  const re = await page.evaluate(() => window.__cfgApp.getState());
  assert.ok(Math.abs(re.thumb_d - 23.0) < 0.05 && re.middle_fwd === 0.75 && re.hand === 'right');
  assert.equal(await page.inputValue('#ob-email'), 'jordan@example.com');
  assert.equal(await page.inputValue('#ob-name'), 'Jordan Leigh');
  ok('after restart the order is still there and restores its drill sheet');

  // unsaved changes are not thrown away silently
  await page.fill('#ob-notes', 'changed but not saved');
  const dialogs = [];
  page.once('dialog', (d) => { dialogs.push(d.message()); d.dismiss(); });
  await page.click('#ob-new');
  assert.equal(await page.textContent('#ob-num'), 'FS-0001', 'declining stays on the order');
  assert.match(dialogs[0], /FS-0001 has changes that are not saved/);
  page.once('dialog', (d) => d.accept());
  await page.click('#ob-new');
  assert.equal(await page.textContent('#ob-num'), 'New order');
  ok('leaving an order with unsaved changes asks first');

  // ...but a clean switch (nothing edited since the last save) must not nag
  let nagged = false;
  const nag = (d) => { nagged = true; d.dismiss(); };
  page.on('dialog', nag);
  await page.click('.orow');
  await page.waitForFunction(() => /FS-0001/.test(document.getElementById('ob-num').textContent));
  await page.click('#ob-new');
  await page.click('.orow');
  await page.waitForFunction(() => /FS-0001/.test(document.getElementById('ob-num').textContent));
  page.off('dialog', nag);
  assert.equal(nagged, false, 'no confirm when nothing was changed');
  await page.click('#ob-new');
  ok('switching orders without edits does not ask');

  // second order gets the next number; status change persists
  await page.click('#ob-new');
  await page.fill('#ob-name', 'Sam Ortiz'); await page.selectOption('#ob-product', 'fitkit'); await page.selectOption('#ob-status', 'printing');
  await page.click('#ob-form-save');
  await page.waitForFunction(() => document.querySelectorAll('.orow').length === 2);
  assert.match(await page.textContent('#ob-stats'), /2 orders · \$143\.00/);
  await page.click('#ob-form-export');
  await page.waitForFunction(() => /Saved \d+ files for FS-0002/.test(document.getElementById('ob-toast-text').textContent), null, { timeout: 60000 });
  const f2 = readdirSync(ordersDir).find(n => n.startsWith('FS-0002'));
  assert.ok(readdirSync(join(ordersDir, f2)).some(n => /hole_sizer/.test(n)), 'fit kit exports a sizer plate');
  const kitJob = readFileSync(join(ordersDir, f2, 'job_sheet.txt'), 'utf8');
  assert.match(kitJob, /SIZER PLATE/); assert.match(kitJob, /Do not sand the sizer plate/);
  assert.equal(/DRILL SHEET AS ENTERED|Bridge |Wrist-cord/.test(kitJob), false, 'a Fit Kit job sheet must not describe puck features');
  ok('second order is FS-0002; Fit Kit exports a sizer plate');

  // a Rev Ball order with an oval thumb (as on the owner's sheet): the full-sphere part, with its own job-sheet instructions
  await page.click('#ob-close');
  await page.click('[data-unit="in"]');   // a restart comes back in mm
  await fill(page, 'thumb_d', '25/32'); await fill(page, 'thumb_oval_d', '29/32'); await fill(page, 'thumb_oval_angle', '55');
  await page.waitForFunction(() => /Built in/.test(document.getElementById('status').textContent));
  // the optional layer pattern too, so the two-colour 3MF is exercised (the default ball is one colour with the inlays)
  await page.evaluate(() => { document.getElementById('status').textContent = 'changing'; window.__cfgApp.setState({ ...window.__cfgApp.getState(), ball_stripe: 'spot_band' }); });
  await page.waitForFunction(() => /Built in/.test(document.getElementById('status').textContent));
  // the edited sheet still belongs to the open order (FS-0002), so "New order" asks before leaving it: accept
  const leave = (d) => d.accept(); page.on('dialog', leave);
  await page.click('#ob-new');
  await page.waitForSelector('#ob-name:visible'); page.off('dialog', leave);
  await page.fill('#ob-name', 'Ball Buyer'); await page.selectOption('#ob-product', 'ball');
  await page.evaluate(() => { document.getElementById('ob-toast-text').textContent = ''; });
  await page.click('#ob-form-export');
  await page.waitForFunction(() => /Saved \d+ files for FS-0003/.test(document.getElementById('ob-toast-text').textContent), null, { timeout: 90000 });
  const f3 = readdirSync(ordersDir).find(n => n.startsWith('FS-0003'));
  const ballStl = readdirSync(join(ordersDir, f3)).find(n => /rev_ball200.*\.stl$/.test(n));
  assert.ok(readdirSync(join(ordersDir, f3)).some(n => /rev_ball200.*\.3mf$/.test(n)), 'the two-colour 3MF is exported with the ball: ' + readdirSync(join(ordersDir, f3)).join(', '));
  assert.ok(ballStl, 'ball STL exported: ' + readdirSync(join(ordersDir, f3)).join(', '));
  assert.ok(readdirSync(join(ordersDir, f3)).some(n => /^axis_inlays_D12_ring60_track12\.stl$/.test(n)), 'the inlays file carries the track arcs: ' + readdirSync(join(ordersDir, f3)).join(', '));
  const bs = readStl(join(ordersDir, f3, ballStl));
  assert.ok(bs.volume_cm3 > 4000 && bs.volume_cm3 < 4200 && Math.abs(bs.height_mm - 198.7) < 0.2, `ball ${bs.volume_cm3} cm3, ${bs.height_mm} mm`);   // 198.7: the resting flat below, and the track channel (forward-roll axis) across the pole above
  const ballJob = readFileSync(join(ordersDir, f3, 'job_sheet.txt'), 'utf8');
  assert.match(ballJob, /Rev Ball: 200 mm ball/); assert.match(ballJob, /Supports: tree, "On build plate only"/); assert.match(ballJob, /Filament for support interface/); assert.match(ballJob, /Track ring: a 12 mm channel 2 mm deep/); assert.match(ballJob, /seam: random or scarf/); assert.match(ballJob, /4 walls, 8% gyroid infill/); assert.match(ballJob, /about 250 C/); assert.match(ballJob, /Ball drill/);
  assert.match(ballJob, /OVAL HOLES[\s\S]*Thumb: 25\/32" \(19\.84 mm\) drilled, 29\/32" \(23\.02 mm\) oval at 55 deg/, 'oval thumb on the job sheet');
  assert.match(ballJob, /thumb bevel 4 mm, finger bevel 2\.5 mm \(rounded\)/); assert.match(ballJob, /modeled 23\.42 mm the long way/); assert.match(ballJob, /Engraved in the base: FS-0003/);
  assert.match(ballJob, /FILES[\s\S]*customer_card\.pdf/);
  const card = readFileSync(join(ordersDir, f3, 'customer_card.pdf'));
  assert.equal(card.subarray(0, 8).toString('latin1'), '%PDF-1.4'); assert.match(card.toString('latin1'), /%%EOF\n$/);
  const cardText = card.toString('latin1');
  assert.ok(/Order FS-0003/.test(cardText) && /Ball Buyer|Hi Ball/.test(cardText) && /oval 29\/32/.test(cardText) && /REV BALL: TWO DRILLS, ONE BALL/.test(cardText) && /DRILL 1: THE YO-YO ROLL/.test(cardText) && /DRILL 2: THE PROPER RELEASE/.test(cardText) && /yo-yo target/.test(cardText), 'customer card carries the order, fit and the two drills');
  assert.ok(/ l S\n/.test(cardText) && (cardText.match(/ c S\n/g) || []).length === 3 && /45\xb0 hook/.test(cardText), 'the card draws the release-angle scale: a line and three ovals with their labels');
  assert.equal(/example\.com|@/.test(cardText.replace(/%[^\n]*/g, '')), false, 'no contact details on the card');
  // keep the card and job sheet for a look (test/tmp is ignored by git)
  copyFileSync(join(ordersDir, f3, 'customer_card.pdf'), join(shotDir, 'customer_card.pdf')); copyFileSync(join(ordersDir, f3, 'job_sheet.txt'), join(shotDir, 'job_sheet_ball.txt'));
  const ballSheet = JSON.parse(readFileSync(join(ordersDir, f3, 'fit_sheet.json'), 'utf8'));
  assert.ok(Math.abs(ballSheet.thumb_oval_d - 23.02) < 0.05 && ballSheet.thumb_oval_angle === 55 && ballSheet.serial === 'FS-0003', 'fit sheet records the oval and the engraved number');
  assert.match(ballJob, /FILAMENT CHANGES[\s\S]*Add color change[\s\S]*at \d\d(\.\d)? mm: second colour[\s\S]*at \d\d(\.\d)? mm: base colour[\s\S]*at 1[89]\d(\.\d)? mm: second colour[\s\S]*open the \.3mf/, 'swap heights and the 3mf on the job sheet');
  assert.equal(/Wrist-cord/.test(ballJob), false, 'no puck-only lines on a ball job sheet');
  ok('Rev Ball order with an oval thumb exports a 200 mm ball, a job sheet with the oval, bevel, engraving and support settings, and a customer card PDF');

  // delete: a native confirmation, and the number is never reused
  await app.evaluate(({ dialog }) => { dialog.showMessageBox = async () => ({ response: 1 }); });
  await page.click('#ob-delete');
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => document.querySelectorAll('.orow').length), 3, 'declining keeps the order');
  await app.evaluate(({ dialog }) => { dialog.showMessageBox = async () => ({ response: 0 }); });
  await page.click('#ob-delete');
  await page.waitForFunction(() => document.querySelectorAll('.orow').length === 2);
  await page.click('#ob-new');
  await page.fill('#ob-name', 'Fourth Customer');
  await page.click('#ob-form-save');
  await page.waitForFunction(() => document.querySelectorAll('.orow').length === 3);
  assert.equal(await page.evaluate(() => [...document.querySelectorAll('.orow .n')].map(n => n.textContent).sort().join()), 'FS-0001,FS-0002,FS-0004');
  ok('delete asks first; after a delete the next order is FS-0004, not a reused FS-0003');
  await app.close();
  session = null;
  console.log(`\nALL ${results.length} CHECKS PASSED`);
} catch (e) {
  console.error('\nFAILED:', e && e.stack || e);
  try { if (session) await session.page.screenshot({ path: join(shotDir, 'app-failure.png') }); } catch (_) { /* ignore */ }
  // a blocking native dialog could stop a polite close from ever returning: kill the process
  try { if (session) session.app.process().kill('SIGKILL'); } catch (_) { /* ignore */ }
  process.exitCode = 1;
} finally {
  rmSync(root, { recursive: true, force: true });
}
