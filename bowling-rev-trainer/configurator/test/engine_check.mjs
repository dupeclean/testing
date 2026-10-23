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
// the two-colour pattern: a small spot just above the highest hole edge, a 12 mm band placed clear of the bullseyes
const cc = r.stats[0].color_changes, pat = r.stats[0].pattern;
assert.equal(cc.length, 3, 'spot + band = 3 filament changes: ' + JSON.stringify(cc));
assert.ok(pat && pat.spot_z > 180 && pat.spot_z < 196 && cc[2].z_mm === pat.spot_z && cc[2].colour === 'second colour', 'the spot starts just above the highest hole edge: ' + JSON.stringify([pat, cc]));
assert.ok(pat.band_mm && Math.abs(pat.band_mm[1] - pat.band_mm[0] - 12) < 0.01 && pat.band_mm[1] < pat.spot_z - 4, 'a 12 mm band below the spot: ' + JSON.stringify(pat));
const zones = r.stats[0].pap.zones;
assert.ok(zones.length === 2 && zones.every(([lo, hi]) => pat.band_mm[1] <= lo - 2 + 0.06 || pat.band_mm[0] >= hi + 2 - 0.06), 'the band clears both bullseyes: ' + JSON.stringify([pat.band_mm, zones]));
assert.ok(pat.notes.some(n => /keep clear of the bullseyes/.test(n)), 'the moved band is explained: ' + JSON.stringify(pat.notes));
assert.ok(r.notes && r.notes.some(n => /Add color change/.test(n) && /3mf/.test(n)), 'the swap heights and the 3mf are explained: ' + JSON.stringify(r.notes));
r = await build({ ...SHEET, ball_stripe: 'cap_band' }, ['ball']);
const cc2 = r.stats[0].color_changes;
assert.ok(cc2.length === 3 && cc2[2].z_mm > 140 && cc2[2].z_mm < 165 && cc2[2].colour === 'second colour', 'the full cap starts below the lowest hole rim: ' + JSON.stringify(cc2));
r = await build({ ...SHEET, ball_stripe: 'cap_band', pap_marker: false }, ['ball']);
const cc3 = r.stats[0].color_changes;
assert.ok(Math.abs(cc3[0].z_mm - 92.9) < 0.2 && Math.abs(cc3[1].z_mm - 104.9) < 0.2, 'with no bullseyes the band straddles the equator (ball top at 198.9 with the 30 mm flat): ' + JSON.stringify(cc3));
r = await build({ ...SHEET, ball_stripe: 'none' }, ['ball']);
assert.equal(r.stats[0].color_changes.length, 0);
r = await build({ ...SHEET, thumb_hole: false, ball_stripe: 'spot' }, ['ball']);
assert.ok(r.ok && r.stats[0].pattern.spot_z > 180 && r.stats[0].pattern.spot_z < 196 && r.notes.some(n => /starts just below them/.test(n)), 'a no-thumb ball has its holes on the pole: the top mark starts just below them and says so: ' + JSON.stringify([r.stats[0].pattern, r.notes]));
// the two-colour 3MF: one object in two parts with filaments 1 and 2 assigned (stored zip, so the text is searchable)
r = await page.evaluate(() => {
  const b = window.__cfgApp.buildFiles(['ball'], {});
  const f = b.files.find(x => /\.3mf$/.test(x.name));
  const txt = f ? new TextDecoder('latin1').decode(f.data) : '';
  return { names: b.files.map(x => x.name), size: f ? f.data.length : 0, hasConfig: /Metadata\/model_settings\.config/.test(txt), extruders: (txt.match(/key="extruder" value="[12]"/g) || []).length, parts: (txt.match(/<part id="\d+" subtype="normal_part">/g) || []).length, item: /<item objectid="4" transform="1 0 0 0 1 0 0 0 1 128 128 0"/.test(txt) };
});
assert.ok(r.names.length === 2 && r.size > 200000 && r.hasConfig && r.extruders === 3 && r.parts === 2 && r.item, 'the ball export carries a two-part 3MF: ' + JSON.stringify(r));
ok('two-colour pattern: spot above the holes, band placed clear of the bullseyes, heights listed, two-part 3MF (none for a single-colour ball)');
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
assert.deepEqual(r.axes.ball.filter(a => a.name !== 'axis').map(a => a.name).sort(), ['middle', 'ring']);
assert.ok(r.axes.ball.filter(a => a.name !== 'axis').every(a => Math.abs(a.p[1]) < 1), 'two-handed finger holes sit across the top centre');
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

// 9. axis target dots: two sockets at the release axis and its opposite point, plus their plugs
const dots = await build(SHEET, ['ball']), noDots = await build({ ...SHEET, pap_marker: false }, ['ball']), noRing = await build({ ...SHEET, pap_ring: false }, ['ball']);
assert.ok(dots.ok && noDots.ok && dots.warnings.length === 0, 'dots: ' + JSON.stringify(dots.warnings));
assert.ok(dots.bytes[0] !== noDots.bytes[0], 'the sockets change the ball mesh');
const dotAxes = dots.axes.ball.filter(a => a.name === 'axis');
assert.equal(dotAxes.length, 2, 'two sockets');
const [d1, d2] = dotAxes.map(a => a.dir);
assert.ok(Math.abs(d1[0] + d2[0]) < 1e-9 && Math.abs(d1[2] + d2[2]) < 1e-9, 'the two sockets are opposite each other');
assert.ok(d1[0] > 0.9 || d2[0] > 0.9, 'right hand: the axis point is far over on the hand (+x) side: ' + JSON.stringify([d1, d2]));
const dotsL = await build({ ...SHEET, hand: 'left' }, ['ball']);
assert.ok(dotsL.axes.ball.filter(a => a.name === 'axis').some(a => a.dir[0] < -0.9), 'left hand mirrors the axis point');
assert.ok(dots.stats[0].pap && dots.stats[0].pap.points.length === 2 && Math.abs(dots.stats[0].pap.over_mm - 139.7) < 0.01, 'pap data on the stats: ' + JSON.stringify(dots.stats[0].pap));
assert.ok(dots.stats[0].pap.from === 'the centre of the grip' && dots.stats[0].pap.given === false && dots.stats[0].pap.ring && dots.stats[0].pap.ring.r_mm === 30, 'pap reference, source and ring on the stats: ' + JSON.stringify(dots.stats[0].pap));
const ringCm3 = noRing.stats[0].volume_cm3 - dots.stats[0].volume_cm3;
assert.ok(noRing.ok && ringCm3 > 4 && ringCm3 < 8, 'two ring pockets take about 6 cm3 out of the ball: ' + ringCm3);
r = await build({ ...SHEET, thumb_hole: false }, ['ball']);
assert.ok(r.ok && r.warnings.length === 0 && r.stats[0].pap.from === 'the middle of the two finger holes', 'a no-thumb ball measures the PAP from the middle of the fingers: ' + (r.message || JSON.stringify([r.warnings, r.stats[0].pap])));
// the sheet's PAP is used only when the sheet gives one; otherwise the common position, whatever the fields hold
r = await build({ ...SHEET, pap_given: false, pap_over: 50, pap_up: 0 }, ['ball']);
assert.ok(r.ok && r.bytes[0] === dots.bytes[0] && Math.abs(r.stats[0].pap.over_mm - 139.7) < 0.01, 'without a PAP on the sheet the common position is used');
r = await build({ ...SHEET, pap_given: true, pap_over: 50, pap_up: 0 }, ['ball']);
assert.ok(r.ok && r.bytes[0] !== dots.bytes[0] && r.stats[0].pap.given === true && r.stats[0].pap.over_mm === 50, 'the sheet PAP moves the target');
r = await build({ ...SHEET, pap_given: true, pap_over: 40, pap_up: 30 }, ['ball']);
assert.ok(r.ok && r.warnings.some(w => /ring runs into a grip hole/.test(w)) && !r.warnings.some(w => /dot runs into/.test(w)), 'a ring near the fingers warns while the dot is still clear: ' + JSON.stringify(r.warnings));
// aim the dot 12 mm short of the thumb hole centre (pap_up is the arc from the top, negative toward the thumb)
const thumbP = dots.axes.ball.find(a => a.name === 'thumb').p, Rb = 100;
r = await build({ ...SHEET, pap_given: true, pap_over: 0, pap_up: Math.max(-60, Rb * Math.asin(thumbP[1] / Rb) + 12) }, ['ball']);
assert.ok(r.ok && r.warnings.some(w => /runs into a grip hole/.test(w)), 'a dot on the grip warns: ' + JSON.stringify(r.warnings));
r = await build({ ...SHEET, pap_given: true, pap_over: 15, pap_up: 0 }, ['ball']);
assert.ok(r.ok && !r.warnings.some(w => /grip hole/.test(w)) && r.warnings.some(w => /resting flat/.test(w)), 'a dot 15 mm over sits between the holes (no hole warning) but its twin is on the flat: ' + JSON.stringify(r.warnings));
r = await build({ ...SHEET, pap_given: true, pap_over: 0, pap_up: 0 }, ['ball']);
assert.ok(r.ok && r.warnings.some(w => /resting flat/.test(w)), 'a dot at the pole puts its twin on the flat and warns: ' + JSON.stringify(r.warnings));
r = await build({ ...SHEET, pap_given: true, pap_over: 250 }, ['ball']);
assert.equal(r.ok, false); assert.match(r.message, /Axis point over/);
r = await build({ ...SHEET, pap_ring: false }, ['plugs']);
assert.ok(r.ok && r.stats[0].volume_cm3 > 0.6 && r.stats[0].volume_cm3 < 0.9, 'two plugs: ' + (r.message || r.stats[0].volume_cm3));
r = await build(SHEET, ['plugs']);
assert.ok(r.ok && r.stats[0].volume_cm3 > 5 && r.stats[0].volume_cm3 < 8 && r.stats[0].bbox_mm[0] > 130 && r.stats[0].bbox_mm[0] < 134 && r.stats[0].bbox_mm[2] > 4 && r.stats[0].bbox_mm[2] < 4.6, 'two plugs and two rings: ' + (r.message || JSON.stringify([r.stats[0].volume_cm3, r.stats[0].bbox_mm])));
r = await page.evaluate(() => { const b = window.__cfgApp.buildFiles(['ball', 'plugs'], { pap_marker: false }); return b.files.map(f => f.name); });
assert.ok(r.length === 2 && r.every(n => /rev_ball/.test(n)) && r.some(n => /\.3mf$/.test(n)), 'no inlays file when the dots are off (just the ball STL and its 3MF): ' + JSON.stringify(r));
ok('axis target: dots at the PAP (sheet or common, from the grip centre or the finger middle) and their rings, mirrored for a left hand, warnings near holes and the flat, inlays file only when the dots are on');

// 10. release gate: one segment and one pin per file, pins ball diameter + 10 mm apart
r = await build(SHEET, ['gate']);
assert.ok(r.ok, 'gate: ' + r.message);
assert.deepEqual(r.warnings, [], 'gate warns: ' + JSON.stringify(r.warnings));
const g = r.stats[0];
assert.ok(g.gate && Math.abs(g.gate.spacing_mm - 210) < 1e-9 && g.gate.pin_h_mm === 100, 'gate spacing/pin: ' + JSON.stringify(g.gate));
assert.ok(g.bbox_mm[0] > 221 && g.bbox_mm[0] < 224 && g.bbox_mm[1] > 69 && g.bbox_mm[1] < 71 && Math.abs(g.bbox_mm[2] - 100) < 0.01, 'gate bbox: ' + JSON.stringify(g.bbox_mm));
assert.ok(g.volume_cm3 > 70 && g.volume_cm3 < 90, 'gate volume (segment about 50 cm3 + pin about 31 cm3): ' + g.volume_cm3);
r = await build({ ...SHEET, ball_d: 230 }, ['gate']);
assert.ok(r.ok && Math.abs(r.stats[0].gate.spacing_mm - 240) < 1e-9, 'spacing follows the ball diameter');
r = await build({ ...SHEET, gate_pin_h: 30 }, ['gate']);
assert.equal(r.ok, false); assert.match(r.message, /Gate pin height/);
ok('release gate builds (segment + pin, spacing = ball diameter + 10 mm); a silly pin height is refused');

// 11. humming spinner: the chamber and slots take plastic out, the wrist-cord tunnel is left out, silly values are refused
const plainSpin = await build(SHEET, ['spinner']), humSpin = await build({ ...SHEET, spin_hum: true }, ['spinner']);
assert.ok(humSpin.ok && humSpin.warnings.length === 0, 'hum: ' + (humSpin.message || JSON.stringify(humSpin.warnings)));
const removed = plainSpin.stats[0].volume_cm3 - humSpin.stats[0].volume_cm3;
assert.ok(removed > 38 && removed < 56, 'the chamber and slots remove about 45 cm3 (a 203 mm2 ring profile round 37 mm, less the tunnel that is left out): ' + removed);
assert.ok(humSpin.stats[0].hum && humSpin.stats[0].hum.slots === 8 && humSpin.notes.some(n => /tunnel is left out/.test(n)), 'hum data and the tunnel note: ' + JSON.stringify([humSpin.stats[0].hum, humSpin.notes]));
const humNoCord = await build({ ...SHEET, spin_hum: true, lanyard: false }, ['spinner']);
assert.equal(humNoCord.bytes[0], humSpin.bytes[0], 'with the hum on, the wrist-cord setting changes nothing (the tunnel is left out)');
const hum16 = await build({ ...SHEET, spin_hum: true, spin_hum_slots: 16, spin_hum_angle: 0 }, ['spinner']);
assert.ok(hum16.ok && hum16.stats[0].volume_cm3 < humSpin.stats[0].volume_cm3, 'more slots take more plastic out');
r = await build({ ...SHEET, spin_hum: true, spin_hum_slots: 1 }, ['spinner']);
assert.equal(r.ok, false); assert.match(r.message, /Hum slots/);
r = await build({ ...SHEET, spin_hum: true, spin_hum_slots: 8.5 }, ['spinner']);
assert.equal(r.ok, false); assert.match(r.message, /whole number/);
r = await build({ ...SHEET, spin_hum: true, spin_hum_angle: 85 }, ['spinner']);
assert.equal(r.ok, false); assert.match(r.message, /slot angle/);
r = await build({ ...SHEET, spin_hum: true, middle_d: 28, ring_d: 28, bridge: 30 }, ['spinner']);
assert.ok(r.ok && r.warnings.some(w => /humming chamber/.test(w)), 'wide holes on a wide bridge warn that they reach the chamber: ' + (r.message || JSON.stringify(r.warnings)));
r = await build({ ...SHEET, spin_hum: true }, ['puck']);
assert.ok(r.ok && r.bytes[0] === (await build(SHEET, ['puck'])).bytes[0], 'the hum setting does nothing to the puck');
ok('humming spinner: ring chamber and slots, no wrist-cord tunnel with it, bad slot counts and angles refused, holes reaching the chamber warn');

// 12. the download buttons: the 3MF button appears only for a two-colour ball, and saves a Bambu-style 3MF
const rebuilt = async (part) => { await page.evaluate(() => { document.getElementById('status').textContent = 'changing'; }); await page.click(`[data-part="${part}"]`); await page.waitForFunction(() => /Built in/.test(document.getElementById('status').textContent), null, { timeout: 120000 }); };
await rebuilt('ball');
assert.equal(await page.isHidden('#save_3mf'), false, 'the 3MF button shows for the ball');
const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#save_3mf')]);
assert.match(dl.suggestedFilename(), /^rev_ball200.*\.3mf$/, 'download name: ' + dl.suggestedFilename());
const dlText = readFileSync(await dl.path()).toString('latin1');
assert.ok(dlText.length > 200000 && /Metadata\/model_settings\.config/.test(dlText) && (dlText.match(/key="extruder" value="[12]"/g) || []).length === 3, 'the download is the two-part 3MF');
assert.match(await page.textContent('#save_bundle'), /STL \+ 3MF/, 'the bundle button says it carries the 3MF');
await rebuilt('puck');
assert.equal(await page.isHidden('#save_3mf'), true, 'no 3MF button for the puck');
ok('the Download 3MF button appears for a two-colour ball only and saves the Bambu-style file');

await browser.close(); server.close();
console.log(`\nALL ${results.length} ENGINE CHECKS PASSED`);
