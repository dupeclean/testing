// Generates STL files from the browser engine for pitch-convention tests.
//   node test/pitch_check.mjs <outdir>
// Produces, for the same drill sheet, parts with: zero pitch, forward pitch and reverse
// pitch on every hole (and a lateral variant, and a left-handed one). The Python half
// (pitch_check.py) then measures the meshes themselves.

import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright');
const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'index.html'));
const out = process.argv[2] || join(here, 'out');
mkdirSync(out, { recursive: true });

const server = createServer((_, res) => { res.setHeader('content-type', 'text/html; charset=utf-8'); res.end(html); });
await new Promise(r => server.listen(0, r));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${server.address().port}/`);
await page.waitForFunction(() => window.__cfgApp && window.__cfgApp.ready, null, { timeout: 90000 });

// big, easy-to-see pitches so a wrong sign cannot hide
const BASE = { print_allowance: 0, thumb_d: 23, middle_d: 17, ring_d: 17, span_middle: 109.5, span_ring: 104.8, bridge: 14, finger_depth: 40,
  thumb_through: true, weight_pocket: false, lanyard: false, hand: 'right' };
const P = (f, l) => ({ thumb_fwd: f, thumb_lat: l, middle_fwd: f, middle_lat: l, ring_fwd: f, ring_lat: l });
const CASES = {
  zero:     { ...BASE, ...P(0, 0) },
  fwd:      { ...BASE, ...P(0.5, 0) },
  rev:      { ...BASE, ...P(-0.5, 0) },
  lat_pos:  { ...BASE, ...P(0, 0.5) },
  lat_neg:  { ...BASE, ...P(0, -0.5) },
  left_zero:{ ...BASE, ...P(0, 0), hand: 'left' },
  left_lat: { ...BASE, ...P(0, 0.5), hand: 'left' },
  // the sheet that arrived from the shop, as entered in the app
  sheet:    { ...BASE, thumb_d: 23.02, middle_d: 15.88, ring_d: 16.67, span_middle: 109.54, span_ring: 104.78, bridge: 12.7,
              thumb_fwd: 0, thumb_lat: -0.125, middle_fwd: 0.75, middle_lat: 0.25, ring_fwd: 0.75, ring_lat: -0.25 },
};
const axes = {};
for (const [name, params] of Object.entries(CASES)) {
  const r = await page.evaluate((p) => {
    window.__cfgApp.setState(p);
    const b = window.__cfgApp.buildFiles(['puck'], p);
    let bin = ''; const d = b.files[0].data;
    for (let i = 0; i < d.length; i += 0x8000) bin += String.fromCharCode.apply(null, d.subarray(i, i + 0x8000));
    return { b64: btoa(bin), axes: b.axes.puck, warnings: b.warnings };
  }, params);
  writeFileSync(join(out, `browser_${name}.stl`), Buffer.from(r.b64, 'base64'));
  axes[name] = { params, axes: r.axes, warnings: r.warnings };
}
writeFileSync(join(out, 'axes.json'), JSON.stringify(axes, null, 1));
console.log('wrote', Object.keys(CASES).length, 'STLs and axes.json to', out);
await browser.close(); server.close();
