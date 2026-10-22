// Engine checks that need no second CAD program: which finger is on which side, the
// guards against values that used to crash the engine, and the model warnings.
//   PLAYWRIGHT_PATH=/path/to/playwright node test/engine_check.mjs
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright');
const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html'));
const server = createServer((_, res) => { res.setHeader('content-type', 'text/html; charset=utf-8'); res.end(html); });
await new Promise(r => server.listen(0, r));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${server.address().port}/`);
await page.waitForFunction(() => window.__cfgApp && window.__cfgApp.ready, null, { timeout: 90000 });

const build = (params, parts = ['puck']) => page.evaluate(([p, parts]) => {
  try { const b = window.__cfgApp.buildFiles(parts, p); return { ok: true, warnings: b.warnings, notes: b.notes, stats: b.stats, axes: b.axes, bytes: b.files.map(f => f.data.length) }; }
  catch (e) { return { ok: false, message: e.message }; }
}, [params, parts]);
const results = [];
const ok = (m) => { results.push(m); console.log('  ok  ' + m); };

// the owner's sheet, bores at the printed sizes
const SHEET = { print_allowance: 0, thumb_d: 23.02, middle_d: 16.67, ring_d: 15.88, span_middle: 104.78, span_ring: 109.54, bridge: 12.7,
  thumb_fwd: 0, thumb_lat: -0.125, middle_fwd: 0.75, middle_lat: -0.25, ring_fwd: 0.75, ring_lat: 0.25, hand: 'right' };

// 1. finger sides: seen from outside, thumb at the bottom, a right hand's middle finger is the LEFT hole
let r = await build({ ...SHEET, hand: 'right' });
assert.ok(r.ok, r.message);
const at = (res, name) => res.axes.puck.find(a => a.name === name).p;
assert.ok(at(r, 'middle')[0] < 0 && at(r, 'ring')[0] > 0, 'right hand: middle left (-x), ring right (+x)');
assert.ok(at(r, 'thumb')[1] < at(r, 'middle')[1] && at(r, 'thumb')[1] < at(r, 'ring')[1], 'thumb below the fingers');
ok('right hand: middle finger is the left hole, ring the right hole');
r = await build({ ...SHEET, hand: 'left' });
assert.ok(at(r, 'middle')[0] > 0 && at(r, 'ring')[0] < 0, 'left hand mirrors');
ok('left hand mirrors it');

// 2. the owner's sheet builds with no warnings and the bridge is as asked
r = await build(SHEET);
assert.deepEqual(r.warnings, [], 'sheet should not warn: ' + r.warnings.join('|'));
ok('the owner\'s sheet builds with no warnings');

// 3. guards: values that used to crash or hang the engine now give a plain message
for (const [label, params, re] of [
  ['mm number typed while inches is on (110 in)', { span_middle: 2794 }, /outside the usable range/],
  ['inches typed while mm is on (4.3 mm span)', { span_middle: 4.3125 }, /outside the usable range/],
  ['zero thumb size', { thumb_d: 0, print_allowance: 0 }, /Thumb hole size/],
  ['very different spans that push a hole off the part', { span_middle: 150, span_ring: 62 }, /do not fit|outside/],
  ['NaN', { span_ring: NaN }, /not a number|outside/],
]) {
  const t0 = Date.now();
  r = await build({ ...SHEET, ...params });
  assert.equal(r.ok, false, label + ' should be refused');
  assert.match(r.message, re, label + ': ' + r.message);
  assert.ok(Date.now() - t0 < 5000, label + ' must fail fast');
}
ok('absurd values are refused fast with a plain message (no hang, no crash)');
// the page is still alive afterwards
r = await build(SHEET); assert.ok(r.ok); ok('engine still healthy after the refusals');

// 4. warnings
// default-size finger holes with a 1/4" bridge (right for insert-size holes, thin for finger-size ones)
const THIN = { ...SHEET, middle_d: 21.03, ring_d: 21.03, bridge: 6.35, middle_lat: 0, ring_lat: 0, middle_fwd: 0.3125, ring_fwd: 0.3125, finger_depth: 24 };
r = await build(THIN);
assert.ok(r.warnings.some(w => /web between the finger holes narrows/.test(w)), 'thin web warns: ' + JSON.stringify(r.warnings));
ok('a 1/4" bridge with finger-size holes at 24 mm depth warns about the hairline web');
r = await build({ ...THIN, bridge: 12.7 });
assert.deepEqual(r.warnings, [], 'a 1/2" bridge is clean: ' + JSON.stringify(r.warnings));
r = await build({ ...THIN, print_allowance: 0.4, bridge: 12.7 });
assert.deepEqual(r.warnings, []);
ok('a 1/2" bridge builds clean');
// grazing bores (bridge so small that the holes just touch) must not slip through silently
r = await build({ ...THIN, bridge: 5.4 });
assert.ok(r.warnings.length > 0, 'grazing bores warn: ' + JSON.stringify(r.warnings));
ok('bores that graze each other still warn');
// the app's own defaults build with no warnings
r = await page.evaluate(() => { try { const b = window.__cfgApp.buildFiles(['puck', 'spinner'], {}); return { ok: true, warnings: b.warnings }; } catch (e) { return { ok: false, message: e.message }; } });
assert.ok(r.ok && r.warnings.length === 0, 'defaults are clean: ' + JSON.stringify(r));
ok('the default sheet builds with no warnings (puck and spinner)');
r = await build({ ...SHEET, span_middle: 130, span_ring: 130, finger_depth: 50, lanyard: false, weight_pocket: false });
assert.ok(r.warnings.some(w => /break through the base/.test(w)), 'base breakout warns: ' + JSON.stringify(r.warnings));
ok('a long span with deep finger holes warns that a bore would break through the base');

// 5. the Rev Ball: full sphere, grip at the top, holes exactly as on the puck
r = await build(SHEET, ['ball']);
assert.ok(r.ok, 'ball: ' + r.message);
assert.deepEqual(r.warnings, [], 'ball warns: ' + JSON.stringify(r.warnings));
const bp = (n) => r.axes.ball.find(a => a.name === n).p;
assert.ok(bp('thumb')[2] > 150 && bp('middle')[2] > 150 && bp('ring')[2] > 150, 'holes are at the top of the ball');
assert.ok(bp('middle')[0] < 0 && bp('ring')[0] > 0, 'right hand: middle left, ring right on the ball too');
const pk = await build(SHEET, ['puck']);
const flat = (q) => [q[0], q[1]];
for (const n of ['thumb', 'middle', 'ring']) assert.ok(Math.hypot(...flat(bp(n)).map((v, i) => v - flat(pk.axes.puck.find(a => a.name === n).p)[i])) < 0.01, n + ' sits at the same plan position as on the puck');
ok('ball builds with the same hole layout as the puck, holes at the top, no warnings');
// the two-colour pattern: swap heights sit round the equator and just below the grip
const cc = r.stats[0].color_changes;
assert.equal(cc.length, 3, 'cap + band = 3 filament changes: ' + JSON.stringify(cc));
assert.ok(Math.abs(cc[0].z_mm - 92.9) < 0.2 && Math.abs(cc[1].z_mm - 104.9) < 0.2, 'band straddles the equator (ball top at 198.9 with the 30 mm flat): ' + JSON.stringify(cc));
assert.ok(cc[2].z_mm > 140 && cc[2].z_mm < 165 && cc[2].colour === 'second colour', 'cap starts below the lowest hole rim: ' + JSON.stringify(cc));
assert.ok(r.notes && r.notes.some(n => /Add color change/.test(n)), 'the swap heights are explained: ' + JSON.stringify(r.notes));
r = await build({ ...SHEET, ball_stripe: 'none' }, ['ball']);
assert.equal(r.stats[0].color_changes.length, 0);
ok('two-colour pattern gives the filament-change heights (none for a single-colour ball)');
r = await build({ ...SHEET, ball_d: 150 }, ['ball']);
assert.equal(r.ok, false); assert.match(r.message, /too small for these spans/);
r = await build({ ...SHEET, ball_thumb_depth: 96 }, ['ball']);
assert.equal(r.ok, false); assert.match(r.message, /Ball thumb hole depth/);
ok('a ball too small for the spans, or a thumb hole too deep, is refused with a plain message');

// 6. spinner and sizer still build
for (const part of ['spinner', 'sizer']) { r = await build(SHEET, [part]); assert.ok(r.ok, part + ': ' + r.message); }
ok('spinner and sizer build');

// 7. oval holes, the engraved order number and the no-thumb ball (the shapes themselves are measured by oval_check.py)
const OVAL = { ...SHEET, thumb_d: 19.84, thumb_oval_d: 23.02, thumb_oval_angle: 55 };
for (const parts of [['puck'], ['ball'], ['spinner']]) { r = await build(OVAL, parts); assert.ok(r.ok && r.warnings.length === 0, parts[0] + ' with an oval thumb: ' + (r.message || JSON.stringify(r.warnings))); }
r = await build({ ...OVAL, thumb_oval_d: 18 });
assert.equal(r.ok, false); assert.match(r.message, /oval size is the LONG way across/i);
r = await build({ ...OVAL, thumb_oval_d: 40 });
assert.equal(r.ok, false); assert.match(r.message, /oval/i);
r = await build({ ...OVAL, thumb_oval_angle: 120 });
assert.equal(r.ok, false); assert.match(r.message, /between -90 and 90/);
ok('oval holes build on every grip part; an oval smaller than the hole, absurdly large, or past 90 degrees is refused');
const plain = await build(SHEET), numbered = await build({ ...SHEET, serial: 'FS-0042' });
assert.ok(numbered.ok && numbered.bytes[0] !== plain.bytes[0], 'the engraved number changes the puck mesh');
r = await build({ ...SHEET, serial: 'hello world' });
assert.equal(r.ok, false); assert.match(r.message, /digits/i);
const ballPlain = await build(SHEET, ['ball']), ballNum = await build({ ...SHEET, serial: 'FS-0042' }, ['ball']);
assert.ok(ballNum.bytes[0] !== ballPlain.bytes[0], 'the number is engraved on the ball too');
ok('the order number is engraved when given and refused when it is not FS-/digits');
r = await build({ ...SHEET, thumb_hole: false }, ['ball']);
assert.ok(r.ok && r.warnings.length === 0, 'no-thumb ball: ' + (r.message || JSON.stringify(r.warnings)));
assert.deepEqual(r.axes.ball.map(a => a.name).sort(), ['middle', 'ring']);
assert.ok(r.axes.ball.every(a => Math.abs(a.p[1]) < 1), 'two-handed finger holes sit across the top centre');
ok('a no-thumb (two-handed) ball has just the two finger holes, centred on top');

// 8. fixes from the adversarial review
// the hairline-web and base-breakthrough checks count an oval finger hole's extra reach
const FAT = { ...SHEET, print_allowance: 0.4, middle_d: 21.03, ring_d: 21.03, middle_lat: 0, ring_lat: 0, middle_fwd: 0.3125, ring_fwd: 0.3125, finger_depth: 24, bridge: 7.5 };
r = await build({ ...FAT, middle_oval_d: 24, ring_oval_d: 24, finger_oval_angle: 90 });
assert.ok(r.ok && r.warnings.some(w => /web between the finger holes narrows/.test(w)), 'ovals across the bridge thin the web: ' + JSON.stringify(r.warnings));
r = await build({ ...SHEET, print_allowance: 0.4, middle_d: 21.03, ring_d: 21.03, span_middle: 125, span_ring: 125, middle_fwd: 0.75, ring_fwd: 0.75, middle_lat: 0, ring_lat: 0, finger_depth: 27, middle_oval_d: 29.03, ring_oval_d: 29.03, finger_oval_angle: 0, lanyard: false, weight_pocket: false });
assert.ok(r.ok && r.warnings.some(w => /break through the base/.test(w)), 'an oval along the tilt dips through the base: ' + JSON.stringify(r.warnings));
ok('oval finger holes are counted in the hairline-web and base-breakthrough warnings');
// parts without a thumb hole ignore the (hidden) thumb fields
r = await build({ ...SHEET, thumb_d: 25.4, thumb_oval_d: 23.02 }, ['spinner']);
assert.ok(r.ok, 'spinner must not refuse over the thumb oval: ' + r.message);
r = await build({ ...SHEET, thumb_hole: false, thumb_d: 25.4, thumb_oval_d: 23.02, ball_thumb_depth: 99 }, ['ball']);
assert.ok(r.ok, 'a no-thumb ball must not refuse over thumb fields: ' + r.message);
r = await build({ ...SHEET, thumb_d: 25.4, thumb_oval_d: 23.02 });
assert.equal(r.ok, false, 'the puck still refuses an oval smaller than the hole');
ok('the spinner and a no-thumb ball ignore the thumb fields they do not cut');
// setState loads a whole sheet: keys an old order lacks go back to the defaults
await page.evaluate((s) => window.__cfgApp.setState({ ...s, thumb_oval_d: 23.02, thumb_oval_angle: 55, thumb_bevel: 6, thumb_hole: false, serial: 'FS-0007' }), SHEET);
await page.evaluate((s) => window.__cfgApp.setState(s), SHEET);   // an order saved before these keys existed
const st = await page.evaluate(() => window.__cfgApp.getState());
assert.ok(st.thumb_oval_d === 0 && st.thumb_oval_angle === 0 && st.thumb_bevel === 4 && st.thumb_hole === true && st.serial === '', 'stale keys reset: ' + JSON.stringify([st.thumb_oval_d, st.thumb_bevel, st.thumb_hole, st.serial]));
ok('opening an older order resets the oval, bevel, thumb-hole and engraving fields to their defaults');
// long order numbers still build (they shrink to fit the spinner base and the ball flat)
for (const parts of [['spinner'], ['ball'], ['puck']]) { r = await build({ ...SHEET, serial: 'FS-2026-0001' }, parts); assert.ok(r.ok && r.warnings.length === 0, parts[0] + ' with a 12-character number: ' + (r.message || JSON.stringify(r.warnings))); }
r = await build({ ...SHEET, thumb_hole: false }, ['ball']);
ok('a 12-character order number builds on every part');

await browser.close(); server.close();
console.log(`\nALL ${results.length} ENGINE CHECKS PASSED`);
