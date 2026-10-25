// Builds the oval-hole, bevel, engraving and no-thumb cases from the browser engine so
// oval_check.py can measure the meshes (and compare them with OpenSCAD renders).
//   PLAYWRIGHT_PATH=/path/to/playwright node test/oval_check.mjs <outdir>
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

const IN = 25.4;
// the owner's sheet as drilled: thumb 25/32 with a 29/32 oval at 55 degrees, reverse 3/4 fingers
const SHEET = { print_allowance: 0, hand: 'right', pap_track: false, thumb_d: 25 / 32 * IN, thumb_oval_d: 29 / 32 * IN, thumb_oval_angle: 55,
  middle_d: 21 / 32 * IN, ring_d: 5 / 8 * IN, span_middle: 4.125 * IN, span_ring: 4.3125 * IN, bridge: 0.5 * IN,
  thumb_fwd: 0, thumb_lat: -0.125, middle_fwd: -0.75, middle_lat: -0.25, ring_fwd: -0.75, ring_lat: 0.25,
  thumb_bevel: 4, finger_bevel: 2.5, serial: '', weight_pocket: false, lanyard: false };
const CASES = {
  oval_ball:    { parts: ['ball'], params: { ...SHEET } },
  oval_left:    { parts: ['ball'], params: { ...SHEET, hand: 'left' } },
  oval_puck:    { parts: ['puck'], params: { ...SHEET, thumb_through: true } },
  finger_oval:  { parts: ['puck'], params: { ...SHEET, thumb_oval_d: 0, middle_oval_d: 21 / 32 * IN + 3, ring_oval_d: 5 / 8 * IN + 3, finger_oval_angle: -30, thumb_through: true } },
  nothumb_ball: { parts: ['ball'], params: { ...SHEET, thumb_hole: false } },
  plain_puck:   { parts: ['puck'], params: { ...SHEET, thumb_oval_d: 0, thumb_bevel: 0, finger_bevel: 0, thumb_through: true } },
  serial_puck:  { parts: ['puck'], params: { ...SHEET, thumb_oval_d: 0, thumb_bevel: 0, finger_bevel: 0, thumb_through: true, serial: 'FS-0001' } },
  bevel_puck:   { parts: ['puck'], params: { ...SHEET, thumb_oval_d: 0, thumb_through: true } },
  bevel_zero:   { parts: ['puck'], params: { ...SHEET, thumb_oval_d: 0, thumb_through: true, thumb_fwd: 0, thumb_lat: 0 } },   // axis = surface normal, so slices near the rim stay closed
  spinner_serial: { parts: ['spinner'], params: { ...SHEET, thumb_oval_d: 0, serial: 'FS-2026-0001' } },
  ball_serial:  { parts: ['ball'], params: { ...SHEET, serial: 'FS-0001' } },
};
const axes = {};
for (const [name, c] of Object.entries(CASES)) {
  const t0 = Date.now();
  const r = await page.evaluate(([p, parts]) => {
    const b = window.__cfgApp.buildFiles(parts, p);
    let bin = ''; const d = b.files[0].data;
    for (let i = 0; i < d.length; i += 0x8000) bin += String.fromCharCode.apply(null, d.subarray(i, i + 0x8000));
    return { b64: btoa(bin), axes: b.axes[parts[0]], warnings: b.warnings, stats: b.stats[0] };
  }, [c.params, c.parts]);
  writeFileSync(join(out, `browser_${name}.stl`), Buffer.from(r.b64, 'base64'));
  axes[name] = { part: c.parts[0], params: c.params, axes: r.axes, warnings: r.warnings, stats: r.stats };
  console.log(`  built ${name} in ${Date.now() - t0} ms, ${r.stats.grams} g, warnings: ${JSON.stringify(r.warnings)}`);
}
writeFileSync(join(out, 'oval_axes.json'), JSON.stringify(axes, null, 1));
console.log('wrote', Object.keys(CASES).length, 'STLs and oval_axes.json to', out);
await browser.close(); server.close();
