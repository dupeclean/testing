// Headless check of the built configurator.
//
// Serves ../index.html, generates STLs through the page's own code path for a
// set of parameter cases, writes them to the out dir, and prints volume/bbox so
// they can be compared against OpenSCAD renders of the same parameters.
//
//   node test/run.mjs <outdir>

import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// PLAYWRIGHT_PATH lets a globally installed playwright be used without npm install
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright');
const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'index.html'));
const outdir = process.argv[2] || join(here, 'out');
mkdirSync(outdir, { recursive: true });

const server = createServer((_, res) => { res.setHeader('content-type', 'text/html; charset=utf-8'); res.end(html); });
await new Promise(r => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/`;

// cases mirror trainer.scad's defaults (its hole sizes already include the
// print allowance, so print_allowance is 0 here and the sizes are passed as-is)
const SCAD = { print_allowance: 0, thumb_d: 26, middle_d: 21.5, ring_d: 21.5, span_middle: 110, span_ring: 110 };
const CASES = {
  puck_default:    { ...SCAD, part: 'puck' },
  spinner_default: { ...SCAD, part: 'spinner' },
  sizer_default:   { ...SCAD, part: 'sizer', sizer_finger_center: 21, sizer_thumb_center: 26, sizer_step: 0.5 },
  puck_jordan:     { ...SCAD, part: 'puck', hand: 'right', span_middle: 112, span_ring: 109,
                     thumb_d: 26.5, middle_d: 22, ring_d: 21.5, thumb_fwd: -0.125, thumb_lat: 0.125,
                     middle_fwd: 0.375, middle_lat: 0, ring_fwd: 0.3125, ring_lat: 0.125 },
  puck_lefty:      { ...SCAD, part: 'puck', hand: 'left', span_middle: 118, span_ring: 115,
                     thumb_d: 27.5, middle_d: 22.5, ring_d: 22 },
  puck_blind:      { ...SCAD, part: 'puck', thumb_through: false, thumb_depth: 40 },
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(url);
await page.waitForFunction(() => window.__cfg && window.__cfg.ready === true, null, { timeout: 60000 });

for (const [name, params] of Object.entries(CASES)) {
  const t0 = Date.now();
  const r = await page.evaluate(p => window.__cfg.generate(p), params);
  const bytes = Buffer.from(r.stl_b64, 'base64');
  writeFileSync(join(outdir, `${name}.stl`), bytes);
  console.log(`${name}: ${r.volume_cm3.toFixed(1)} cm3  bbox ${r.bbox.map(v => v.toFixed(1)).join(' x ')}  tris ${r.tris}  ${Date.now() - t0} ms  warnings=${JSON.stringify(r.warnings)}`);
}

await page.screenshot({ path: join(outdir, 'ui.png') });
await page.setViewportSize({ width: 400, height: 860 });
await page.screenshot({ path: join(outdir, 'ui-phone.png') });
console.log(errors.length ? `PAGE ERRORS:\n${errors.join('\n')}` : 'no page errors');
await browser.close();
server.close();
