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
  try { const b = window.__cfgApp.buildFiles(parts, p); return { ok: true, warnings: b.warnings, axes: b.axes, bytes: b.files.map(f => f.data.length) }; }
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
r = await build({ ...SHEET, bridge: 6.35, middle_lat: 0, ring_lat: 0, middle_fwd: 0.3125, ring_fwd: 0.3125, finger_depth: 24 });
assert.ok(r.warnings.some(w => /web between the finger holes narrows/.test(w)), 'thin web warns: ' + JSON.stringify(r.warnings));
ok('a 1/4" bridge at 24 mm depth warns about the hairline web');
r = await build({ ...SHEET, span_middle: 130, span_ring: 130, finger_depth: 50, lanyard: false, weight_pocket: false });
assert.ok(r.warnings.some(w => /break through the base/.test(w)), 'base breakout warns: ' + JSON.stringify(r.warnings));
ok('a long span with deep finger holes warns that a bore would break through the base');

// 5. spinner and sizer still build
for (const part of ['spinner', 'sizer']) { r = await build(SHEET, [part]); assert.ok(r.ok, part + ': ' + r.message); }
ok('spinner and sizer build');

await browser.close(); server.close();
console.log(`\nALL ${results.length} ENGINE CHECKS PASSED`);
