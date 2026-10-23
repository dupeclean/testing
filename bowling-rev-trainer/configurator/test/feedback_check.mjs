// Builds the release-feedback parts (gate, axis plugs, ball with axis dots, humming spinner) from
// the browser engine so feedback_check.py can measure the meshes and compare them with OpenSCAD.
//   PLAYWRIGHT_PATH=/path/to/playwright node test/feedback_check.mjs <outdir>
// All cases use print_allowance 0 so trainer.scad can be given the same final sizes.

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

// the owner's sheet, round holes, bores at the printed sizes
const SHEET = { print_allowance: 0, hand: 'right', thumb_d: 23.02, middle_d: 16.67, ring_d: 15.88, span_middle: 104.78, span_ring: 109.54, bridge: 12.7,
  thumb_fwd: 0, thumb_lat: -0.125, middle_fwd: 0.75, middle_lat: -0.25, ring_fwd: 0.75, ring_lat: 0.25, serial: '' };
const CASES = {
  gate:          { parts: ['gate'], params: { ...SHEET } },
  plugs:         { parts: ['plugs'], params: { ...SHEET, pap_ring: false } },
  inlays:        { parts: ['plugs'], params: { ...SHEET } },
  dots_ball:     { parts: ['ball'], params: { ...SHEET, pap_marker: true } },
  dots_noring:   { parts: ['ball'], params: { ...SHEET, pap_marker: true, pap_ring: false } },
  dots_left:     { parts: ['ball'], params: { ...SHEET, pap_marker: true, hand: 'left' } },
  plain_ball:    { parts: ['ball'], params: { ...SHEET, pap_marker: false } },
  hum_spinner:   { parts: ['spinner'], params: { ...SHEET, spin_hum: true } },
  hum16_spinner: { parts: ['spinner'], params: { ...SHEET, spin_hum: true, spin_hum_slots: 16, spin_hum_angle: 0 } },
  plain_spinner: { parts: ['spinner'], params: { ...SHEET, spin_hum: false } },
};
const results = {};
for (const [name, c] of Object.entries(CASES)) {
  const t0 = Date.now();
  const r = await page.evaluate(([p, parts]) => {
    const b = window.__cfgApp.buildFiles(parts, p);
    let bin = ''; const d = b.files[0].data;
    for (let i = 0; i < d.length; i += 0x8000) bin += String.fromCharCode.apply(null, d.subarray(i, i + 0x8000));
    return { b64: btoa(bin), axes: b.axes[parts[0]], warnings: b.warnings, notes: b.notes, stats: b.stats[0] };
  }, [c.params, c.parts]);
  writeFileSync(join(out, `browser_${name}.stl`), Buffer.from(r.b64, 'base64'));
  results[name] = { part: c.parts[0], params: c.params, axes: r.axes, warnings: r.warnings, notes: r.notes, stats: r.stats };
  console.log(`  built ${name} in ${Date.now() - t0} ms, ${r.stats.volume_cm3} cm3, warnings: ${JSON.stringify(r.warnings)}`);
}
writeFileSync(join(out, 'feedback_axes.json'), JSON.stringify(results, null, 1));
console.log('wrote', Object.keys(CASES).length, 'STLs and feedback_axes.json to', out);
await browser.close(); server.close();
