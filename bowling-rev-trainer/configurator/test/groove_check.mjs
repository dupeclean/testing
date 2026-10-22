// Reads a binary STL of a Rev Ball and finds the colour-boundary grooves (0.6 mm wide, 0.3 mm deep)
// by looking for surface vertices that sit just inside the sphere, then compares their heights with
// the "at NN mm" lines of the job sheet.
//   node configurator/test/groove_check.mjs <ball.stl> [job_sheet.txt]
import { readFileSync } from 'node:fs';
const b = readFileSync(process.argv[2]);
const n = b.readUInt32LE(80);
if (b.length !== 84 + n * 50) throw new Error(`STL size ${b.length} does not match ${n} triangles`);
let vol = 0; const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
const verts = new Float64Array(n * 9);
for (let t = 0; t < n; t++) {
  const o = 84 + t * 50 + 12; const v = [];
  for (let k = 0; k < 3; k++) { const p = [b.readFloatLE(o + k * 12), b.readFloatLE(o + k * 12 + 4), b.readFloatLE(o + k * 12 + 8)]; v.push(p); for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], p[a]); mx[a] = Math.max(mx[a], p[a]); verts[t * 9 + k * 3 + a] = p[a]; } }
  vol += (v[0][0] * (v[1][1] * v[2][2] - v[2][1] * v[1][2]) - v[1][0] * (v[0][1] * v[2][2] - v[2][1] * v[0][2]) + v[2][0] * (v[0][1] * v[1][2] - v[1][1] * v[0][2])) / 6;
}
const H = mx[2] - mn[2], W = mx[0] - mn[0], Dp = mx[1] - mn[1];
const R = Math.max(W, Dp) / 2; const z0 = H - R;             // sphere centre height (flat underneath)
console.log(`triangles ${n}, volume ${(vol / 1000).toFixed(1)} cm3, bbox ${W.toFixed(2)} x ${Dp.toFixed(2)} x ${H.toFixed(2)} mm, min z ${mn[2].toFixed(3)}, sphere R ${R.toFixed(2)} centre z ${z0.toFixed(2)}, flat sagitta ${(2 * R - H).toFixed(3)} mm`);
// vertices 0.15-0.5 mm inside the sphere, at least 1 mm above the bed: groove floors and walls
const bins = new Map();
for (let i = 0; i < n * 3; i++) {
  const x = verts[i * 3], y = verts[i * 3 + 1], z = verts[i * 3 + 2];
  if (z < 1) continue;
  const rs = Math.sqrt(Math.max(0, R * R - (z - z0) ** 2)); const r = Math.hypot(x, y); const depth = rs - r;
  if (depth < 0.15 || depth > 0.5) continue;
  const key = Math.round(z * 10); const ang = Math.floor((Math.atan2(y, x) + Math.PI) / (2 * Math.PI) * 36) % 36;
  const e = bins.get(key) || { count: 0, angs: new Set(), zsum: 0, dsum: 0 }; e.count++; e.angs.add(ang); e.zsum += z; e.dsum += depth; bins.set(key, e);
}
const keys = [...bins.keys()].sort((a, b) => a - b); const clusters = [];
for (const k of keys) { const last = clusters[clusters.length - 1]; if (last && k - last.hi <= 2) { last.hi = k; last.bins.push(k); } else clusters.push({ lo: k, hi: k, bins: [k] }); }
console.log('grooves found (full rings only count if all 36 angle sectors are present):');
const found = [];
for (const c of clusters) {
  let count = 0, zsum = 0, dsum = 0; const angs = new Set();
  for (const k of c.bins) { const e = bins.get(k); count += e.count; zsum += e.zsum; dsum += e.dsum; e.angs.forEach(a => angs.add(a)); }
  const zc = zsum / count; const full = angs.size === 36;
  if (count < 50) continue;
  found.push({ z: zc, full, count, depth: dsum / count, span: (c.hi - c.lo) / 10 });
  console.log(`  z = ${zc.toFixed(2)} mm  (${count} verts, z-span ${((c.hi - c.lo) / 10).toFixed(1)} mm, mean depth ${(dsum / count).toFixed(2)} mm, ${angs.size}/36 sectors${full ? ', full ring' : ''})`);
}
if (process.argv[3]) {
  const job = readFileSync(process.argv[3], 'utf8');
  const want = [...job.matchAll(/^\s*at ([\d.]+) mm: (.+)$/gm)].map(m => ({ z: +m[1], what: m[2].trim() }));
  console.log('job sheet colour changes: ' + want.map(w => `${w.z} mm -> ${w.what}`).join('; '));
  let okAll = true;
  for (const w of want) {
    const g = found.filter(f => f.full).map(f => ({ f, d: Math.abs(f.z - w.z) })).sort((a, b) => a.d - b.d)[0];
    const ok = g && g.d <= 0.35; okAll = okAll && !!ok;
    console.log(`  ${ok ? 'OK ' : 'MISSING'} ${w.z} mm (${w.what}): nearest full-ring groove ${g ? g.f.z.toFixed(2) + ' mm, off by ' + g.d.toFixed(2) + ' mm' : 'none'}`);
  }
  console.log(okAll ? 'RESULT: every job-sheet colour change has a matching groove on the mesh' : 'RESULT: MISMATCH between job sheet and mesh');
  process.exitCode = okAll ? 0 : 2;
}
