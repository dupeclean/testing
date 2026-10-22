/* Rev Trainer Configurator — drill sheet in, print-ready STL out.
 *
 * Runs entirely in the browser. Geometry is built with the Manifold CSG
 * engine (WASM) and mirrors ../trainer.scad exactly; the preview is three.js.
 * `Module` (manifold glue), `WASM_B64` and `THREE` are provided by the
 * surrounding page (see build.py).
 */

const IN = 25.4;
const DEG = Math.PI / 180;
const APP_VERSION = '1.0';
const APP_NAME = (typeof window !== 'undefined' && window.fitslice) ? 'FitSlice' : 'Rev Trainer Configurator';

// ---------------------------------------------------------------------------
// Geometry constants — keep in sync with trainer.scad
// ---------------------------------------------------------------------------
const G = {
  R: 108,                 // regulation 8.5" ball radius
  puck_h: 60, puck_w: 140, end_wall: 10,
  spin_d: 100, spin_h: 38,
  rim_chamfer: 3,
  pocket_d: 30, pocket_depth: 16,
  lanyard_d: 7,
  sizer_t: 15, sizer_w: 175, sizer_h: 92,
  seg_sphere: 128, seg_hole: 96, seg_small: 48,
};

const DEFAULTS = {
  part: 'puck',
  hand: 'right',
  span_middle: 110, span_ring: 110,          // mm, near edge to near edge
  thumb_d: 25.4, middle_d: 21.03, ring_d: 21.03, // mm, true drill-sheet sizes
  size_source: 'drill_sheet',
  print_allowance: 0.4,                      // mm added to every bore
  bridge: 12.7, finger_depth: 24,     // bridge: about 1/2" (printed holes are finger-sized)
  thumb_through: true, thumb_depth: 40,
  thumb_fwd: -0.125, thumb_lat: 0,           // inches, drill-sheet convention
  middle_fwd: 0.3125, middle_lat: 0,
  ring_fwd: 0.3125, ring_lat: 0,
  weight_pocket: true, lanyard: true,
  sizer_thumb_center: 25.4, sizer_finger_center: 21.03, sizer_step: IN / 64,
  // Rev Ball: a full printed ball you release on the floor (grip at the top, resting flat underneath)
  ball_d: 200, ball_thumb_depth: 70, ball_flat: 22, ball_groove: false,
  ball_stripe: 'cap_band',   // second-colour pattern printed by swapping filament: none | cap | cap_band | bands
};

const LENGTH_KEYS = ['span_middle', 'span_ring', 'thumb_d', 'middle_d', 'ring_d', 'print_allowance',
  'bridge', 'finger_depth', 'thumb_depth', 'sizer_thumb_center', 'sizer_finger_center', 'sizer_step', 'ball_d', 'ball_thumb_depth', 'ball_flat'];
const PITCH_KEYS = ['thumb_fwd', 'thumb_lat', 'middle_fwd', 'middle_lat', 'ring_fwd', 'ring_lat'];
const BOOL_KEYS = ['thumb_through', 'weight_pocket', 'lanyard', 'ball_groove'];
const BALL_STRIPES = ['none', 'cap', 'cap_band', 'bands'];

// Sensible ranges (mm). Anything outside is almost always a typo or the wrong unit
// (110 typed while the switch is on inches, or 4 5/16 typed while it is on mm), and values
// far outside make the geometry engine fail, so they are refused instead of built.
const LIMITS = {
  span_middle: [60, 150], span_ring: [60, 150],
  thumb_d: [15, 38], middle_d: [10, 30], ring_d: [10, 30],
  print_allowance: [0, 2], bridge: [2, 30], finger_depth: [8, 50], thumb_depth: [10, 80],
  sizer_thumb_center: [15, 38], sizer_finger_center: [10, 30], sizer_step: [0.1, 2],
  ball_d: [150, 230], ball_thumb_depth: [40, 95], ball_flat: [0, 40],
};
const LABELS = {
  span_middle: 'Middle finger span', span_ring: 'Ring finger span',
  thumb_d: 'Thumb hole size', middle_d: 'Middle finger hole size', ring_d: 'Ring finger hole size',
  print_allowance: 'Print allowance', bridge: 'Bridge', finger_depth: 'Finger depth', thumb_depth: 'Thumb depth',
  sizer_thumb_center: 'Sizer thumb centre', sizer_finger_center: 'Sizer finger centre', sizer_step: 'Sizer step',
  ball_d: 'Ball diameter', ball_thumb_depth: 'Ball thumb hole depth', ball_flat: 'Ball resting flat',
};
const PITCH_LIMIT = 1;   // inches
const WEB_MIN = 2.0;     // mm: thinner than this between the finger holes warns

// A problem the owner can fix by changing a value; shown as plain text, never a stack trace.
class FitError extends Error {}

function rangeText(key) {
  const [lo, hi] = LIMITS[key];
  return `${fmtMm(lo)}–${fmtMm(hi)} mm (${(lo / IN).toFixed(2)}"–${(hi / IN).toFixed(2)}")`;
}
// Returns '' when fine, else a plain-language sentence.
function checkLength(key, mm, unit) {
  if (!Number.isFinite(mm)) return `${LABELS[key]}: that is not a number. Type it like 55/64, 4 1/2 or 21.5.`;
  const [lo, hi] = LIMITS[key];
  if (mm >= lo && mm <= hi) return '';
  const typed = unit === 'in' ? `${fraction64(mm / IN)}"` : `${fmtMm(mm)} mm`;
  let hint = '';
  // the same digits would have been fine in the other unit: say so
  if (unit === 'in' && mm / IN >= lo && mm / IN <= hi) hint = ' This looks like millimetres typed while the switch is on inches.';
  else if (unit === 'mm' && mm * IN >= lo && mm * IN <= hi) hint = ' This looks like inches typed while the switch is on mm.';
  return `${LABELS[key]}: ${typed} is outside the usable range ${rangeText(key)}.${hint}`;
}
// Every problem in a parameter set (used before any build, so a bad saved order cannot crash the engine).
function validateParams(p) {
  const out = [];
  const keys = p.part === 'sizer' ? ['sizer_thumb_center', 'sizer_finger_center', 'sizer_step']
    : ['span_middle', 'span_ring', 'thumb_d', 'middle_d', 'ring_d', 'print_allowance', 'bridge', 'finger_depth',
      ...(p.part === 'ball' ? ['ball_d', 'ball_thumb_depth', 'ball_flat'] : p.thumb_through ? [] : ['thumb_depth'])];
  if (p.part === 'spinner') keys.splice(keys.indexOf('span_middle'), 2);
  for (const k of keys) { const m = checkLength(k, p[k], 'mm'); if (m) out.push({ key: k, message: m }); }
  if (p.part === 'ball' && !BALL_STRIPES.includes(p.ball_stripe)) out.push({ key: 'ball_stripe', message: 'Choose a colour pattern for the ball.' });
  if (p.part !== 'sizer') for (const k of PITCH_KEYS) {
    if (!Number.isFinite(p[k]) || Math.abs(p[k]) > PITCH_LIMIT) out.push({ key: k, message: `Pitch (${k.replace('_', ' ')}) must be between -1" and 1".` });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Units: pro shops talk in 64ths of an inch; printers talk in mm
// ---------------------------------------------------------------------------
function parseNumber(str) {
  // accepts "4.5", "4 1/2", "4-1/2", "55/64", "-1/8", '1 1/32"'
  const s = String(str).trim().replace(/["”″]|\bin\b|\bmm\b/gi, '').trim();
  if (!s) return NaN;
  const m = s.match(/^(-)?(?:(\d+(?:\.\d+)?)(?:[\s-]+|$))?(?:(\d+)\/(\d+))?$/);
  if (!m) return NaN;
  const sign = m[1] ? -1 : 1;
  const whole = m[2] ? parseFloat(m[2]) : 0;
  const frac = m[3] ? parseInt(m[3], 10) / parseInt(m[4], 10) : 0;
  if (!m[2] && !m[3]) return NaN;
  return sign * (whole + frac);
}
function parseLength(str, unit) {
  const v = parseNumber(str);
  return unit === 'in' ? Math.round(v * IN * 1000) / 1000 : v;
}
function fmtMm(mm, places = 2) { return (Math.round(mm * 10 ** places) / 10 ** places).toString(); }
function fmtLength(mm, unit) { return unit === 'in' ? (mm / IN).toFixed(3) : fmtMm(mm); }
function fraction64(inches) {
  // nearest 64th as a mixed fraction, e.g. 0.8281 -> 53/64, 4.5 -> 4 1/2
  const sign = inches < 0 ? '-' : '';
  let n = Math.round(Math.abs(inches) * 64);
  const whole = Math.floor(n / 64);
  let num = n - whole * 64, den = 64;
  while (num && num % 2 === 0) { num /= 2; den /= 2; }
  if (!whole && !num) return '0';
  return sign + (whole ? whole : '') + (whole && num ? ' ' : '') + (num ? `${num}/${den}` : '');
}
function describePitch(inches, kind, hand) {
  if (Math.abs(inches) < 1e-6) return 'zero';
  const f = fraction64(Math.abs(inches));
  if (kind === 'fr') return `${f}" ${inches > 0 ? 'forward' : 'reverse'}`;
  const side = (inches > 0) === (hand === 'right') ? 'right' : 'left';
  return `${f}" ${side} lateral`;
}

// ---------------------------------------------------------------------------
// Derived layout (identical to trainer.scad)
// ---------------------------------------------------------------------------
function derive(p) {
  const a = p.part === 'sizer' ? 0 : p.print_allowance;
  const mir = p.hand === 'right' ? 1 : -1;
  const td = p.thumb_d + a, md = p.middle_d + a, rd = p.ring_d + a;
  // Seen from outside the grip with the thumb hole at the bottom (the way a drill sheet is
  // drawn), a right hand's fingers run index, middle, ring from the thumb side to the pinky
  // side, so the middle finger is the LEFT hole and the ring finger the RIGHT hole. Left
  // hand mirrors that. (+x is the viewer's right.)
  const x_m = -mir * (md + p.bridge) / 2;
  const x_r = mir * (rd + p.bridge) / 2;
  const cc_m = p.span_middle + td / 2 + md / 2;
  const cc_r = p.span_ring + td / 2 + rd / 2;
  const ty = (cc_m + cc_r) / 4;
  const y_m = -ty + Math.sqrt(Math.max(0, cc_m * cc_m - x_m * x_m));
  const y_r = -ty + Math.sqrt(Math.max(0, cc_r * cc_r - x_r * x_r));
  const ext_s = ty + td / 2 + G.end_wall;
  const ext_n = Math.max(y_m + md / 2, y_r + rd / 2) + G.end_wall;
  return { mir, td, md, rd, x_m, x_r, y_m, y_r, ty, ext_s, ext_n, cc_m, cc_r };
}

const surfZ = (h, x, y, R = G.R) => h - R + Math.sqrt(R * R - x * x - y * y);

// Bore axis for a hole, defined the way a drill sheet defines it.
// The axis runs from the surface point above (x, y) through an AIM POINT near the
// ball's center C. A zero-pitch bore aims exactly at C. Pitch is the offset of the
// aim point from C, in inches:
//   forward (+)  toward the grip center: the inner end of the hole leans toward the
//                fingers for the thumb and toward the thumb for the fingers;
//                reverse (-) leans the other way.
//   lateral (+)  toward the bowling-hand side of the sheet (right for a righty).
// fdir is +1 for the thumb (grip center is toward +y) and -1 for the fingers.
// Returns the entry point, the outward unit direction, and the Euler rotation that
// turns +Z into that direction.
// Smallest distance between two hole axes over the first `len` mm of each (segment to segment).
function minAxisGap(a, b, len) {
  const sub = (u, v) => [u[0] - v[0], u[1] - v[1], u[2] - v[2]];
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const p1 = a.p, d1 = a.dir.map(v => -v * len);
  const p2 = b.p, d2 = b.dir.map(v => -v * len);
  const r = sub(p1, p2);
  const A = dot(d1, d1), E = dot(d2, d2), B = dot(d1, d2), C = dot(d1, r), F = dot(d2, r);
  const den = A * E - B * B;
  const clamp = (v) => Math.max(0, Math.min(1, v));
  let s = den > 1e-9 ? clamp((B * F - C * E) / den) : 0;
  let t = (B * s + F) / E;
  if (t < 0) { t = 0; s = clamp(-C / A); } else if (t > 1) { t = 1; s = clamp((B - C) / A); }
  const q = [r[0] + d1[0] * s - d2[0] * t, r[1] + d1[1] * s - d2[1] * t, r[2] + d1[2] * s - d2[2] * t];
  return Math.hypot(q[0], q[1], q[2]);
}

function holeAxis(x, y, fwdIn, latIn, bodyH, mir, fdir, R = G.R) {
  const P = [x, y, surfZ(bodyH, x, y, R)];
  // pitch offsets are drill-sheet inches on a regulation ball; on a smaller sphere they are scaled
  // so the hole keeps the same ANGLE to the surface as on the real ball
  const k = R / G.R;
  const A = [latIn * IN * mir * k, fwdIn * IN * fdir * k, bodyH - R];   // aim point
  const d = [A[0] - P[0], A[1] - P[1], A[2] - P[2]];              // into the body
  const n = Math.hypot(d[0], d[1], d[2]);
  const u = [-d[0] / n, -d[1] / n, -d[2] / n];                    // outward
  return { p: P, dir: u, rot: [0, Math.acos(Math.max(-1, Math.min(1, u[2]))) / DEG, Math.atan2(u[1], u[0]) / DEG] };
}

// ---------------------------------------------------------------------------
// CSG builder
// ---------------------------------------------------------------------------
function makeBuilder(W) {
  const { Manifold, CrossSection } = W;
  const trash = [];
  const T = (m) => { trash.push(m); return m; };
  const flush = () => { for (const m of trash) { try { m.delete(); } catch (_) { /* already freed */ } } trash.length = 0; };

  function drill(x, y, d, depth, fwdIn, latIn, bodyH, through, mir, fdir, R = G.R) {
    const ax = holeAxis(x, y, fwdIn, latIn, bodyH, mir, fdir, R);
    const bore = through
      ? T(T(Manifold.cylinder(165, d / 2, d / 2, G.seg_hole)).translate([0, 0, -130]))
      : T(T(Manifold.cylinder(depth + 35, d / 2, d / 2, G.seg_hole)).translate([0, 0, -depth]));
    const cham = T(T(Manifold.cylinder(G.rim_chamfer + 6, d / 2, d / 2 + G.rim_chamfer + 4, G.seg_hole))
      .translate([0, 0, -G.rim_chamfer]));
    const place = (m) => T(T(m.rotate(ax.rot)).translate(ax.p));
    // `bore` alone is used for collision checks: chamfers are allowed to merge
    // at the bridge, exactly like the bevel on a real ball
    return { cut: place(T(bore.add(cham))), bore: place(bore), axis: ax };
  }

  function footprint(w, ext_s, ext_n) {
    const a = CrossSection.circle(w / 2, 96).translate([0, -(ext_s - w / 2)]);
    const b = CrossSection.circle(w / 2, 96).translate([0, ext_n - w / 2]);
    const h = CrossSection.hull([a, b]);
    a.delete(); b.delete();
    return h;
  }

  function xtunnel(y, z, d, len) {
    const cyl = T(T(T(Manifold.cylinder(len, d / 2, d / 2, G.seg_small, true)).rotate([0, 90, 0])).translate([0, y, z]));
    const fin = T(T(Manifold.cube([len, 0.8, 0.1], true)).translate([0, y, z + d * 0.75]));
    return T(Manifold.hull([cyl, fin]));
  }

  function pocket(x, y) {
    const c = T(Manifold.cylinder(G.pocket_depth, G.pocket_d / 2, G.pocket_d / 2, G.seg_small));
    const cone = T(T(Manifold.cylinder(G.pocket_d * 0.42, G.pocket_d / 2, 2, G.seg_small)).translate([0, 0, G.pocket_depth - 0.01]));
    return T(T(c.add(cone)).translate([x, y, -0.01]));
  }

  const overlap = (a, b) => T(a.intersect(b)).volume() > 1;

  function puck(p, D) {
    const warnings = [], axes = [];
    const sph = T(T(Manifold.sphere(G.R, G.seg_sphere)).translate([0, 0, G.puck_h - G.R]));
    const fp = footprint(G.puck_w, D.ext_s, D.ext_n);
    const prism = T(Manifold.extrude(fp, G.puck_h + 1)); fp.delete();
    const body = T(sph.intersect(prism));

    const thumb = drill(0, -D.ty, D.td, p.thumb_depth, p.thumb_fwd, p.thumb_lat, G.puck_h, p.thumb_through, D.mir, +1);
    const mid = drill(D.x_m, D.y_m, D.md, p.finger_depth, p.middle_fwd, p.middle_lat, G.puck_h, false, D.mir, -1);
    const ring = drill(D.x_r, D.y_r, D.rd, p.finger_depth, p.ring_fwd, p.ring_lat, G.puck_h, false, D.mir, -1);
    axes.push({ name: 'thumb', ...thumb.axis }, { name: 'middle', ...mid.axis }, { name: 'ring', ...ring.axis });
    const cuts = [thumb.cut, mid.cut, ring.cut];
    let tunnel = null, pock = null;
    if (p.lanyard) cuts.push(tunnel = xtunnel(44, 10, G.lanyard_d, G.puck_w + 20));
    if (p.weight_pocket) cuts.push(pock = pocket(0, 6));
    const result = T(body.subtract(T(Manifold.union(cuts))));

    if (overlap(thumb.bore, mid.bore) || overlap(thumb.bore, ring.bore))
      warnings.push('Thumb and finger bores run into each other: the spans are too short for these hole sizes.');
    if (overlap(mid.bore, ring.bore))
      warnings.push('The two finger bores intersect below the surface. Increase the bridge or reduce the lateral pitches.');
    // the two finger bores converge as they go deeper (they aim at the ball's center), so the
    // web between them is thinnest at the bottom of the holes
    const web = minAxisGap(mid.axis, ring.axis, p.finger_depth) - (D.md + D.rd) / 2;
    if (web < WEB_MIN && !overlap(mid.bore, ring.bore))
      warnings.push(`The web between the finger holes narrows to ${Math.max(0, web).toFixed(1)} mm deep inside. That is a fragile hairline when printed. Increase the bridge or reduce the finger depth.`);
    for (const [name, h] of [['middle', mid], ['ring', ring]]) {
      // lowest point of the bore's bottom rim (the bore is tilted, so its rim dips below the centre)
      const rimZ = h.axis.p[2] - p.finger_depth * h.axis.dir[2] - (name === 'middle' ? D.md : D.rd) / 2 * Math.hypot(h.axis.dir[0], h.axis.dir[1]);
      if (rimZ < 1.0) warnings.push(`The ${name} finger bore would break through the base of the puck. Reduce the finger depth.`);
      if (pock && overlap(h.bore, pock)) warnings.push(`The ${name} finger bore breaks into the weight pocket. Turn the pocket off or reduce the finger depth.`);
    }
    if (pock && overlap(thumb.bore, pock))
      warnings.push('The thumb bore breaks into the weight pocket at this span. Turn the pocket off or use a blind thumb hole.');
    if (tunnel && (overlap(mid.bore, tunnel) || overlap(ring.bore, tunnel)))
      warnings.push('A finger bore breaks into the lanyard tunnel. Reduce finger depth or turn the lanyard off.');
    if (!p.thumb_through && surfZ(G.puck_h, 0, -D.ty) - p.thumb_depth * thumb.axis.dir[2] < 3)
      warnings.push('Blind thumb hole leaves under 3 mm of floor. Shorten the depth or switch to a through bore.');
    const chord = Math.sqrt(G.R * G.R - (G.R - G.puck_h) ** 2);
    if (D.ext_n > chord || D.ext_s > chord)
      warnings.push('Very long span: the puck ends taper to a thin edge where the ball surface meets the base.');
    return { result, warnings, axes };
  }

  function spinner(p, D) {
    const sph = T(T(Manifold.sphere(G.R, G.seg_sphere)).translate([0, 0, G.spin_h - G.R]));
    const cyl = T(Manifold.cylinder(G.spin_h + 1, G.spin_d / 2, G.spin_d / 2, 128));
    const body = T(sph.intersect(cyl));
    const depth = Math.min(p.finger_depth, 20);
    const mid = drill(D.x_m, 0, D.md, depth, 0, 0, G.spin_h, false, D.mir, -1);
    const ring = drill(D.x_r, 0, D.rd, depth, 0, 0, G.spin_h, false, D.mir, -1);
    const cuts = [mid.cut, ring.cut];
    if (p.lanyard) cuts.push(xtunnel(-G.spin_d / 2 + 18, 8, G.lanyard_d, G.spin_d + 20));
    for (const a of [0, 90])
      cuts.push(T(T(T(Manifold.cube([G.spin_d - 8, 4, 2.4], true)).rotate([0, 0, a])).translate([0, 0, -0.01])));
    const result = T(body.subtract(T(Manifold.union(cuts))));
    const warnings = [];
    if (overlap(mid.bore, ring.bore)) warnings.push('The two finger bores intersect. Increase the bridge.');
    else {
      const web = minAxisGap(mid.axis, ring.axis, depth) - (D.md + D.rd) / 2;
      if (web < WEB_MIN) warnings.push(`The web between the finger holes narrows to ${Math.max(0, web).toFixed(1)} mm deep inside. That is a fragile hairline when printed. Increase the bridge.`);
    }
    return { result, warnings, axes: [{ name: 'middle', ...mid.axis }, { name: 'ring', ...ring.axis }] };
  }

  // Rev Ball: a full sphere with the bowler's grip at the top and a small flat underneath so it can
  // stand on the print bed. Released on the floor it rolls and hooks (or does not), which shows the
  // release. Solid in the model; the slicer makes it light (3 walls, about 5% infill).
  function ball(p, D) {
    const R = p.ball_d / 2;
    const s = p.ball_flat > 0 ? R - Math.sqrt(Math.max(0, R * R - (p.ball_flat / 2) ** 2)) : 0;   // sagitta of the flat
    const H = 2 * R - s;                                                                          // top of the ball above the bed
    const sph = T(T(Manifold.sphere(R, G.seg_sphere)).translate([0, 0, R - s]));
    const keep = T(T(Manifold.cube([2 * R + 2, 2 * R + 2, H + 1], true)).translate([0, 0, (H + 1) / 2]));
    const body = T(sph.intersect(keep));
    const thumb = drill(0, -D.ty, D.td, p.ball_thumb_depth, p.thumb_fwd, p.thumb_lat, H, false, D.mir, +1, R);
    const mid = drill(D.x_m, D.y_m, D.md, p.finger_depth, p.middle_fwd, p.middle_lat, H, false, D.mir, -1, R);
    const ring = drill(D.x_r, D.y_r, D.rd, p.finger_depth, p.ring_fwd, p.ring_lat, H, false, D.mir, -1, R);
    const cuts = [thumb.cut, mid.cut, ring.cut];
    const groove = (z, w, deep) => {   // a groove w wide and `deep` deep round the ball, centred on height z
      const rz = Math.sqrt(Math.max(1, R * R - (z - (R - s)) ** 2));   // the ball's radius at that height
      const outer = T(Manifold.cylinder(w, R + 5, R + 5, 128));
      const inner = T(T(Manifold.cylinder(w + 0.4, rz - deep, rz - deep, 128)).translate([0, 0, -0.2]));
      return T(T(outer.subtract(inner)).translate([0, 0, z - w / 2]));
    };
    if (p.ball_groove) cuts.push(groove(R - s, 2, 0.8));   // marker groove round the equator
    // Second-colour pattern: the slicer swaps filament at these heights (everything printed above a
    // swap takes the new colour until the next swap). A fine groove marks each boundary.
    const zEq = R - s;
    const edges = [thumb, mid, ring].map((h, i) => {   // lowest point of each hole's chamfer rim
      const d = [D.td, D.md, D.rd][i], r = Math.hypot(h.axis.p[0], h.axis.p[1]) + d / 2 + G.rim_chamfer;
      return R - s + Math.sqrt(Math.max(0, R * R - r * r));
    });
    const zCap = Math.floor(Math.min(...edges) - 6);
    const swaps = { none: [], cap: [[zCap, 'cap']], cap_band: [[zEq - 6, 'band'], [zEq + 6, 'base'], [zCap, 'cap']],
      bands: [[zEq - 36, 'band'], [zEq - 24, 'base'], [zEq - 6, 'band'], [zEq + 6, 'base'], [zEq + 24, 'band'], [zEq + 36, 'base']] }[p.ball_stripe] || [];
    for (const [z] of swaps) cuts.push(groove(z, 0.6, 0.3));
    const colorChanges = swaps.map(([z, what]) => ({ z_mm: +z.toFixed(1), colour: what === 'base' ? 'base colour' : 'second colour' }));
    const result = T(body.subtract(T(Manifold.union(cuts))));
    const warnings = [];
    if (overlap(thumb.bore, mid.bore) || overlap(thumb.bore, ring.bore))
      warnings.push('Thumb and finger bores run into each other inside the ball: the spans are too short for these hole sizes, or the thumb hole is too deep.');
    if (overlap(mid.bore, ring.bore))
      warnings.push('The two finger bores intersect below the surface. Increase the bridge or reduce the lateral pitches.');
    const web = minAxisGap(mid.axis, ring.axis, p.finger_depth) - (D.md + D.rd) / 2;
    if (web < WEB_MIN && !overlap(mid.bore, ring.bore))
      warnings.push(`The web between the finger holes narrows to ${Math.max(0, web).toFixed(1)} mm deep inside. That is a fragile hairline when printed. Increase the bridge or reduce the finger depth.`);
    const floor = H - R - s + (R - p.ball_thumb_depth);   // rough: thumb bore end above the bed when aimed at the centre
    if (p.ball_thumb_depth > R - 8) warnings.push('The thumb hole reaches almost to the centre of the ball. Make it shallower.');
    const notes = colorChanges.length
      ? [`Two-colour ball: in the slicer add a filament change at these heights (Bambu Studio: right-click the layer slider, "Add color change"): ${colorChanges.map(c => `${c.z_mm} mm → ${c.colour}`).join('; ')}. Start the print in the base colour.`]
      : [];
    return { result, warnings, notes, colorChanges, axes: [{ name: 'thumb', ...thumb.axis }, { name: 'middle', ...mid.axis }, { name: 'ring', ...ring.axis }], floor };
  }

  // engraved 7-segment labels for the sizer plate (no font needed)
  const SEG7 = { '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd',
    '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg' };
  const CH_W = 3.4, CH_H = 6.5, STROKE = 0.9, DOT_W = 1.2, GAP = 1.0;
  function glyph(ch) {
    if (ch === '.') return CrossSection.square([1.0, 1.0], true).translate([0, -CH_H / 2 + 0.5]);
    const parts = [];
    const hw = CH_W / 2, hh = CH_H / 2;
    const horiz = (y) => CrossSection.square([CH_W, STROKE], true).translate([0, y]);
    const vert = (x, y) => CrossSection.square([STROKE, hh], true).translate([x, y]);
    for (const s of SEG7[ch] || '') {
      if (s === 'a') parts.push(horiz(hh - STROKE / 2));
      if (s === 'g') parts.push(horiz(0));
      if (s === 'd') parts.push(horiz(-hh + STROKE / 2));
      if (s === 'b') parts.push(vert(hw - STROKE / 2, hh / 2));
      if (s === 'c') parts.push(vert(hw - STROKE / 2, -hh / 2));
      if (s === 'f') parts.push(vert(-hw + STROKE / 2, hh / 2));
      if (s === 'e') parts.push(vert(-hw + STROKE / 2, -hh / 2));
    }
    const u = CrossSection.union(parts);
    parts.forEach(c => c.delete());
    return u;
  }
  function label(text, x, y, depth) {
    const widths = [...text].map(ch => ch === '.' ? DOT_W : CH_W);
    const total = widths.reduce((s, w) => s + w, 0) + GAP * (text.length - 1);
    let cx = -total / 2;
    const glyphs = [];
    [...text].forEach((ch, i) => {
      const g = glyph(ch);
      glyphs.push(g.translate([cx + widths[i] / 2, 0]));
      g.delete();
      cx += widths[i] + GAP;
    });
    const all = CrossSection.union(glyphs);
    glyphs.forEach(c => c.delete());
    const m = T(T(Manifold.extrude(all, depth + 1)).translate([x, y, G.sizer_t - depth]));
    all.delete();
    return m;
  }

  function sizer(p) {
    const fingerSizes = [-2, -1, 0, 1, 2, 3].map(i => p.sizer_finger_center + i * p.sizer_step);
    const thumbSizes = [-2, -1, 0, 1, 2].map(i => p.sizer_thumb_center + i * p.sizer_step);
    const r = 8;
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
      .map(([sx, sy]) => CrossSection.circle(r, 32).translate([sx * (G.sizer_w / 2 - r), sy * (G.sizer_h / 2 - r)]));
    const rr = CrossSection.hull(corners); corners.forEach(c => c.delete());
    const plate = T(Manifold.extrude(rr, G.sizer_t)); rr.delete();
    const cuts = [];
    const row = (sizes, y, pitch) => sizes.forEach((d, i) => {
      const x = (i - (sizes.length - 1) / 2) * pitch;
      cuts.push(T(T(Manifold.cylinder(G.sizer_t + 2, d / 2, d / 2, G.seg_hole)).translate([x, y, -1])));
      cuts.push(T(T(Manifold.cylinder(1.6, d / 2, d / 2 + 2.5, G.seg_hole)).translate([x, y, G.sizer_t - 1.5])));
      cuts.push(label(d.toFixed(2), x, y + d / 2 + 3 + CH_H / 2, 0.8));
    });
    row(fingerSizes, 23, 27.5);
    row(thumbSizes, -23, 33);
    const result = T(plate.subtract(T(Manifold.union(cuts))));
    const warnings = [];
    if (Math.max(...thumbSizes) > 30) warnings.push('Largest thumb test bore is over 30 mm; bores may crowd each other.');
    return { result, warnings, axes: [], sizes: { fingerSizes, thumbSizes } };
  }

  function meshOf(m) {
    const mesh = m.getMesh();
    const np = mesh.numProp;
    const nv = mesh.vertProperties.length / np;
    let pos;
    if (np === 3) pos = new Float32Array(mesh.vertProperties);
    else {
      pos = new Float32Array(nv * 3);
      for (let i = 0; i < nv; i++) for (let k = 0; k < 3; k++) pos[3 * i + k] = mesh.vertProperties[np * i + k];
    }
    return { pos, idx: new Uint32Array(mesh.triVerts) };
  }

  function build(p) {
    const bad = validateParams(p);
    if (bad.length) throw new FitError(bad[0].message);
    const D = derive(p);
    const rMax = Math.max(Math.hypot(0, D.ty), Math.hypot(D.x_m, D.y_m), Math.hypot(D.x_r, D.y_r));
    if (p.part === 'puck' && rMax > 92)
      // holes must sit on the part: a hole centre beyond ~92 mm from the axis is off the ball section
      throw new FitError('These spans do not fit on the 8.5-inch ball section: a hole would sit off its edge. Check both spans, and that they are in the right units.');
    if (p.part === 'ball' && rMax > 0.8 * p.ball_d / 2)
      throw new FitError(`A ${fmtMm(p.ball_d)} mm ball is too small for these spans: the holes would sit on its sides. Use a bigger ball diameter (${fmtMm(Math.ceil(rMax / 0.4 / 10) * 10)} mm or more) or check the spans.`);
    try {
      const out = p.part === 'puck' ? puck(p, D) : p.part === 'spinner' ? spinner(p, D) : p.part === 'ball' ? ball(p, D) : sizer(p);
      const m = out.result;
      if (!(m.volume() > 1000)) throw new FitError('The model came out empty. Check the hole sizes and spans.');
      const bb = m.boundingBox();
      return {
        mesh: meshOf(m),
        volume: m.volume(),
        area: m.surfaceArea(),
        bbox: [0, 1, 2].map(i => bb.max[i] - bb.min[i]),
        bboxMin: bb.min, bboxMax: bb.max,
        tris: m.numTri(),
        warnings: out.warnings,
        notes: out.notes || [],
        colorChanges: out.colorChanges || [],
        axes: out.axes,
        sizes: out.sizes || null,
        derived: D,
      };
    } finally {
      flush();
    }
  }

  return { build };
}

// ---------------------------------------------------------------------------
// File writers: binary STL, stored ZIP
// ---------------------------------------------------------------------------
function toSTL({ pos, idx }, comment) {
  const n = idx.length / 3;
  const buf = new ArrayBuffer(84 + n * 50);
  const dv = new DataView(buf);
  new Uint8Array(buf, 0, 80).set(new TextEncoder().encode(comment).slice(0, 80));
  dv.setUint32(80, n, true);
  let o = 84;
  for (let t = 0; t < n; t++) {
    const a = idx[3 * t] * 3, b = idx[3 * t + 1] * 3, c = idx[3 * t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len; ny /= len; nz /= len;
    dv.setFloat32(o, nx, true); dv.setFloat32(o + 4, ny, true); dv.setFloat32(o + 8, nz, true);
    for (const [k, i] of [[12, a], [24, b], [36, c]]) {
      dv.setFloat32(o + k, pos[i], true); dv.setFloat32(o + k + 4, pos[i + 1], true); dv.setFloat32(o + k + 8, pos[i + 2], true);
    }
    dv.setUint16(o + 48, 0, true);
    o += 50;
  }
  return new Uint8Array(buf);
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function zipStore(files) {
  // files: [{name, data: Uint8Array}] — "stored" entries, no compression
  const enc = new TextEncoder();
  const dosTime = 12 << 11, dosDate = ((2026 - 1980) << 9) | (10 << 5) | 18;
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name), crc = crc32(f.data), size = f.data.length;
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0, true); lh.setUint16(8, 0, true);
    lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true); lh.setUint32(14, crc, true);
    lh.setUint32(18, size, true); lh.setUint32(22, size, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0, true);
    ch.setUint16(10, 0, true); ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true); ch.setUint32(16, crc, true);
    ch.setUint32(20, size, true); ch.setUint32(24, size, true); ch.setUint16(28, name.length, true);
    ch.setUint16(30, 0, true); ch.setUint16(32, 0, true); ch.setUint16(34, 0, true); ch.setUint16(36, 0, true);
    ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
    locals.push(new Uint8Array(lh.buffer), name, f.data);
    centrals.push(new Uint8Array(ch.buffer), name);
    offset += 30 + name.length + size;
  }
  const cdSize = centrals.reduce((s, a) => s + a.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(4, 0, true); end.setUint16(6, 0, true);
  end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, offset, true); end.setUint16(20, 0, true);
  const parts = [...locals, ...centrals, new Uint8Array(end.buffer)];
  const out = new Uint8Array(parts.reduce((s, a) => s + a.length, 0));
  let o = 0;
  for (const a of parts) { out.set(a, o); o += a.length; }
  return out;
}

// ---------------------------------------------------------------------------
// 3D preview
// ---------------------------------------------------------------------------
function makeViewer(container) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    container.textContent = '3D preview needs WebGL; the STL still generates.';
    return { show() {}, clear() {}, setTheme() {} };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 1, 2000);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x334455, 0.9);
  const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(1, -1.2, 1.6);
  const fill = new THREE.DirectionalLight(0xffffff, 0.35); fill.position.set(-1.5, 1, 0.4);
  scene.add(hemi, key, fill);
  const material = new THREE.MeshStandardMaterial({ color: 0x9fb4c7, roughness: 0.55, metalness: 0.05, flatShading: true });
  const axisMaterial = new THREE.LineBasicMaterial({ color: 0x1f5f8b });
  let mesh = null, axes = null;
  const target = new THREE.Vector3(0, 0, 25);
  let theta = -1.1, phi = 0.95, dist = 300;

  function place() {
    camera.position.set(
      target.x + dist * Math.sin(phi) * Math.cos(theta),
      target.y + dist * Math.sin(phi) * Math.sin(theta),
      target.z + dist * Math.cos(phi));
    camera.up.set(0, 0, 1);
    camera.lookAt(target);
  }
  function resize() {
    const w = container.clientWidth || 1, h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  let needs = true;
  function loop() { if (needs) { needs = false; place(); renderer.render(scene, camera); } requestAnimationFrame(loop); }
  const redraw = () => { needs = true; };
  new ResizeObserver(() => { resize(); redraw(); }).observe(container);
  resize(); loop();

  // orbit: drag rotates, wheel/pinch zooms
  const el = renderer.domElement;
  const pointers = new Map();
  let lastPinch = 0;
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', e => { pointers.set(e.pointerId, [e.clientX, e.clientY]); el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointerup', e => pointers.delete(e.pointerId));
  el.addEventListener('pointercancel', e => pointers.delete(e.pointerId));
  el.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 1) {
      theta -= (e.clientX - prev[0]) * 0.008;
      phi = Math.min(Math.PI - 0.05, Math.max(0.05, phi - (e.clientY - prev[1]) * 0.008));
      redraw();
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (lastPinch) { dist = Math.min(1500, Math.max(80, dist * lastPinch / d)); redraw(); }
      lastPinch = d;
    }
  });
  el.addEventListener('pointerup', () => { lastPinch = 0; });
  el.addEventListener('wheel', e => { e.preventDefault(); dist = Math.min(1500, Math.max(80, dist * (1 + Math.sign(e.deltaY) * 0.1))); redraw(); }, { passive: false });

  return {
    clear() {
      if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); mesh = null; }
      if (axes) { scene.remove(axes); axes.geometry.dispose(); axes = null; }
      redraw();
    },
    show(data) {
      if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); }
      if (axes) { scene.remove(axes); axes.geometry.dispose(); }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(data.mesh.pos, 3));
      geo.setIndex(new THREE.BufferAttribute(data.mesh.idx, 1));
      geo.computeVertexNormals();
      mesh = new THREE.Mesh(geo, material);
      scene.add(mesh);
      if (data.axes.length) {
        const pts = [];
        for (const a of data.axes) {
          pts.push(a.p[0] - a.dir[0] * 6, a.p[1] - a.dir[1] * 6, a.p[2] - a.dir[2] * 6,
                   a.p[0] + a.dir[0] * 28, a.p[1] + a.dir[1] * 28, a.p[2] + a.dir[2] * 28);
        }
        const ag = new THREE.BufferGeometry();
        ag.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
        axes = new THREE.LineSegments(ag, axisMaterial);
        scene.add(axes);
      }
      target.set((data.bboxMin[0] + data.bboxMax[0]) / 2, (data.bboxMin[1] + data.bboxMax[1]) / 2, (data.bboxMin[2] + data.bboxMax[2]) / 2);
      const diag = Math.hypot(...data.bbox);
      if (dist < diag * 1.0 || dist > diag * 2.2) dist = diag * 1.35;
      redraw();
    },
    setTheme({ model, accent }) {
      material.color.set(model); axisMaterial.color.set(accent); redraw();
    },
  };
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);

function readTokens() {
  const cs = getComputedStyle(document.documentElement);
  return { model: cs.getPropertyValue('--model').trim() || '#9fb4c7', accent: cs.getPropertyValue('--accent').trim() || '#1f5f8b' };
}

function fileBase(p, D) {
  const mm = (v) => v.toFixed(1).replace('.', 'p');
  if (p.part === 'sizer') return `hole_sizer_T${mm(p.sizer_thumb_center)}_F${mm(p.sizer_finger_center)}_step${mm(p.sizer_step)}`;
  const part = p.part === 'ball' ? `ball${p.ball_d.toFixed(0)}` : p.part;
  return `rev_${part}_${p.hand[0].toUpperCase()}_span${mm(p.span_middle)}-${mm(p.span_ring)}_T${mm(D.td)}_M${mm(D.md)}_R${mm(D.rd)}`;
}

function fitSheet(p, D, data) {
  const sheet = { app: APP_NAME, version: APP_VERSION, units: { lengths: 'mm', pitches: 'inches' } };
  for (const k of Object.keys(DEFAULTS)) sheet[k] = p[k];
  sheet.modeled = {
    thumb_bore_mm: +D.td.toFixed(3), middle_bore_mm: +D.md.toFixed(3), ring_bore_mm: +D.rd.toFixed(3),
    print_allowance_mm: p.part === 'sizer' ? 0 : p.print_allowance,
    thumb_bore_in: fraction64(D.td / IN), middle_bore_in: fraction64(D.md / IN), ring_bore_in: fraction64(D.rd / IN),
  };
  if (data) sheet.model = { volume_cm3: +(data.volume / 1000).toFixed(1), bbox_mm: data.bbox.map(v => +v.toFixed(1)), triangles: data.tris, ...(data.colorChanges && data.colorChanges.length ? { colour_changes: data.colorChanges } : {}) };
  return sheet;
}

async function main() {
  const status = $('status');
  const setStatus = (t, kind = '') => { status.textContent = t; status.dataset.kind = kind; };
  setStatus('Loading geometry engine…');

  const wasmBinary = Uint8Array.from(atob(WASM_B64), c => c.charCodeAt(0)).buffer;
  const W = await Module({ wasmBinary });
  W.setup();
  const builder = makeBuilder(W);
  const viewer = makeViewer($('viewport'));
  viewer.setTheme(readTokens());

  const state = { ...DEFAULTS };
  let unit = 'mm';
  let current = null; // last build result

  // download capability (claude.ai viewer) vs. plain blob save (standalone)
  const inArtifact = !!(window.claude && typeof window.claude.use === 'function');
  const downloads = inArtifact ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null);

  // ---- form plumbing ----
  const lengthInputs = LENGTH_KEYS.map(k => $(k)).filter(Boolean);
  const unitLabels = document.querySelectorAll('[data-unit-label]');

  function showLengths() {
    // the fields are rewritten from the last good values, so any red mark on them no longer applies
    for (const k of LENGTH_KEYS) { const el = $(k); if (el) { el.value = fmtLength(state[k], unit); el.classList.remove('bad'); el.removeAttribute('title'); invalid.delete(k); } }
    unitLabels.forEach(el => el.textContent = unit);
    refreshHints();
  }
  function refreshHints() {
    for (const k of ['thumb_d', 'middle_d', 'ring_d', 'span_middle', 'span_ring']) {
      const h = $(k + '_hint');
      if (h) h.textContent = unit === 'in' ? `${fmtMm(state[k])} mm` : `${fraction64(state[k] / IN)}"`;
    }
    for (const k of PITCH_KEYS) {
      const h = $(k + '_hint');
      if (h) h.textContent = describePitch(state[k], k.endsWith('_fwd') ? 'fr' : 'lat', state.hand);
    }
  }
  function rowLabels() {
    const left = state.hand === 'right';
    const label = (id, name, side) => {
      const th = $(id); th.textContent = name;
      const sub = document.createElement('small'); sub.className = 'rowside'; sub.textContent = `${side} hole`;
      th.append(sub);
    };
    label('row_middle', 'Middle', left ? 'left' : 'right');
    label('row_ring', 'Ring', left ? 'right' : 'left');
  }
  function showAll() {
    invalid.clear();
    document.querySelectorAll('.bad').forEach(e => { e.classList.remove('bad'); e.removeAttribute('title'); });
    rowLabels();
    showLengths();
    for (const k of PITCH_KEYS) { const el = $(k); if (el) el.value = state[k] === 0 ? '0' : fraction64(state[k]); }
    for (const k of BOOL_KEYS) { const el = $(k); if (el) el.checked = !!state[k]; }
    $('hand').value = state.hand;
    $('ball_stripe').value = state.ball_stripe;
    $('size_source').value = state.size_source;
    document.querySelectorAll('[data-part]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.part === state.part)));
    document.querySelectorAll('[data-only-part]').forEach(el => { el.hidden = !el.dataset.onlyPart.split(' ').includes(state.part); });
    $('thumb_depth_row').hidden = state.thumb_through || state.part !== 'puck';
    $('print_allowance').disabled = false;
    refreshHints();
  }

  let timer = null;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(() => { timer = null; rebuild(); }, 250); };
  // run a rebuild that is still waiting out its delay, so a save never uses the previous model
  async function settle() { if (timer) { clearTimeout(timer); timer = null; await rebuild(); } }

  // Fields whose typed text was refused. The model keeps the last good value for them, so
  // saving or exporting is blocked until each is fixed (never silently using stale numbers).
  const invalid = new Map();   // field id -> message
  const markBad = (el, msg) => { el.classList.add('bad'); el.title = msg; invalid.set(el.id, msg); setStatus(msg, 'error'); };
  const markGood = (el) => { el.classList.remove('bad'); el.removeAttribute('title'); invalid.delete(el.id); };
  const invalidMessage = () => (invalid.size ? [...invalid.values()][0] + (invalid.size > 1 ? ` (+${invalid.size - 1} more field${invalid.size > 2 ? 's' : ''} marked red)` : '') : '');

  for (const el of lengthInputs) {
    el.addEventListener('change', () => {
      const v = parseLength(el.value, unit);
      const msg = LIMITS[el.id] ? checkLength(el.id, v, unit) : (Number.isFinite(v) && v >= 0 ? '' : 'That is not a number.');
      if (!msg) { state[el.id] = v; markGood(el); schedule(); }
      else markBad(el, msg);
      refreshHints();
    });
  }
  for (const k of PITCH_KEYS) {
    const el = $(k);
    el.addEventListener('change', () => {
      const v = parseNumber(el.value);
      if (Number.isFinite(v) && Math.abs(v) <= PITCH_LIMIT) { state[k] = v; markGood(el); schedule(); }
      else markBad(el, 'Pitch must be a number between -1" and 1" (for example 3/8, -1/8 or 0).');
      refreshHints();
    });
  }
  for (const k of BOOL_KEYS) {
    $(k).addEventListener('change', (e) => { state[k] = e.target.checked; if (k === 'thumb_through') $('thumb_depth_row').hidden = state.thumb_through; schedule(); });
  }
  $('hand').addEventListener('change', e => { state.hand = e.target.value; rowLabels(); refreshHints(); schedule(); });
  $('ball_stripe').addEventListener('change', e => { state.ball_stripe = e.target.value; schedule(); });
  $('size_source').addEventListener('change', e => {
    state.size_source = e.target.value;
    state.print_allowance = state.size_source === 'sizer_plate' ? 0 : 0.4;
    showLengths(); schedule();
  });
  document.querySelectorAll('[data-part]').forEach(b => b.addEventListener('click', () => { state.part = b.dataset.part; showAll(); schedule(); }));
  document.querySelectorAll('[data-unit]').forEach(b => b.addEventListener('click', () => {
    unit = b.dataset.unit;
    document.querySelectorAll('[data-unit]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    showLengths();
  }));
  $('infill').addEventListener('change', () => current && showStats(current));

  // ---- build ----
  async function rebuild() {
    setStatus('Rebuilding…', 'busy');
    await new Promise(r => setTimeout(r, 0));
    try {
      const t0 = performance.now();
      current = builder.build(state);
      viewer.show(current);
      showStats(current);
      const w = current.warnings;
      setStatus(`Built in ${Math.round(performance.now() - t0)} ms` + (w.length ? ` · ⚠ ${w[0]}${w.length > 1 ? ` (+${w.length - 1} more below)` : ''}` : ''), w.length ? 'warn' : 'ok');
    } catch (e) {
      if (!(e instanceof FitError)) console.error(e);
      current = null;   // never leave an old model that no longer matches the form
      viewer.clear();
      for (const id of ['stat_size', 'stat_weight', 'stat_volume']) $(id).textContent = '—';
      $('bores').innerHTML = ''; $('bores_note').textContent = '';
      $('warnings').innerHTML = ''; $('warnings').parentElement.hidden = true;
      $('fit_json').value = '';
      setStatus(e instanceof FitError ? e.message : 'Could not build this geometry. Check the values marked in red.', 'error');
    }
  }

  function showStats(data) {
    const D = data.derived, p = state;
    const infill = parseFloat($('infill').value);
    const shell = Math.min(data.volume, data.area * (p.part === 'ball' ? 1.3 : 1.6));
    const grams = (shell + (data.volume - shell) * infill) * 1.27 / 1000;
    $('stat_size').textContent = `${data.bbox.map(v => v.toFixed(0)).join(' × ')} mm`;
    $('stat_weight').textContent = `≈ ${Math.round(grams / 5) * 5} g`;
    $('stat_volume').textContent = `${(data.volume / 1000).toFixed(0)} cm³ · ${data.tris.toLocaleString()} triangles`;
    const rows = [];
    if (p.part !== 'sizer') {
      const bore = (name, d, trueD) => `<tr><th>${name}</th><td>${fmtMm(trueD)} mm · ${fraction64(trueD / IN)}"</td><td>${fmtMm(d)} mm · ${fraction64(d / IN)}"</td></tr>`;
      rows.push(bore('Thumb', D.td, p.thumb_d), bore('Middle', D.md, p.middle_d), bore('Ring', D.rd, p.ring_d));
      $('bores').innerHTML = `<tr><th></th><th>Drill sheet</th><th>Modeled bore</th></tr>${rows.join('')}`;
      $('bores_note').textContent = p.print_allowance
        ? `Modeled bores include +${fmtMm(p.print_allowance)} mm print allowance. The printed hole lands near the drill-sheet size; finish with bowler's tape.`
        : 'No print allowance: bores are modeled at the exact drill-sheet size.';
    } else if (data.sizes) {
      const r = (label, arr) => `<tr><th>${label}</th>${arr.map(d => `<td>${d.toFixed(2)}<br><small>${fraction64(d / IN)}"</small></td>`).join('')}</tr>`;
      $('bores').innerHTML = r('Finger row (top)', data.sizes.fingerSizes) + r('Thumb row (bottom)', data.sizes.thumbSizes);
      $('bores_note').textContent = 'Each bore is engraved with its modeled diameter in mm. The one that fits snugly at the first joint, with no squeeze needed to hang on, is your size on this printer.';
    }
    const n = $('notes');
    n.innerHTML = (data.notes || []).map(t => `<li>${t}</li>`).join('');
    n.parentElement.hidden = !(data.notes || []).length;
    const w = $('warnings');
    w.innerHTML = data.warnings.map(t => `<li>${t}</li>`).join('');
    w.parentElement.hidden = !data.warnings.length;
    $('fit_json').value = JSON.stringify(fitSheet(p, D, data), null, 2);
  }

  // ---- saving ----
  function blobSave(name, bytes, type) {
    const url = URL.createObjectURL(new Blob([bytes], { type }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 2000);
  }
  async function saveSTL(bundle) {
    await settle();
    if (invalid.size) { setStatus(`Not saved. ${invalidMessage()}`, 'error'); return; }
    if (!current) { setStatus('Nothing to save: the model could not be built. Fix the message above first.', 'error'); return; }
    const D = current.derived, base = fileBase(state, D);
    const stl = toSTL(current.mesh, `${base} - ${APP_NAME} ${APP_VERSION}`);
    const sheet = new TextEncoder().encode(JSON.stringify(fitSheet(state, D, current), null, 2));
    const dl = await downloads;
    if (dl) {
      // the claude.ai viewer saves zip (not stl): bundle the STL with its fit sheet
      const zip = zipStore([{ name: `${base}.stl`, data: stl }, { name: `${base}.fit_sheet.json`, data: sheet }]);
      try {
        await dl.save({ filename: `${base}.zip`, data: new Blob([zip]) });
        setStatus(`Saved ${base}.zip — unzip it for the .stl`, 'ok');
      } catch (e) {
        if (e && e.code === 'declined') setStatus('Save cancelled.', '');
        else setStatus(`Could not save here (${e && e.code || 'unavailable'}). Open the standalone copy of this page to download directly.`, 'error');
      }
      return;
    }
    if (inArtifact) { setStatus('Downloads are not available in this view. Open the standalone copy of this page to download.', 'error'); return; }
    if (bundle) blobSave(`${base}.zip`, zipStore([{ name: `${base}.stl`, data: stl }, { name: `${base}.fit_sheet.json`, data: sheet }]), 'application/zip');
    else blobSave(`${base}.stl`, stl, 'model/stl');
    setStatus(`Saved ${base}.${bundle ? 'zip' : 'stl'}`, 'ok');
  }
  $('save_stl').addEventListener('click', () => saveSTL(false));
  $('save_bundle').addEventListener('click', () => saveSTL(true));
  downloads.then(dl => {
    if (dl || inArtifact) { $('save_stl').hidden = true; $('save_bundle').textContent = 'Download STL bundle (.zip)'; $('save_hint').textContent = 'The zip holds the .stl and a fit sheet .json. Unzip and open the .stl in your slicer.'; }
  });

  $('copy_json').addEventListener('click', async () => {
    const ta = $('fit_json');
    try { await navigator.clipboard.writeText(ta.value); setStatus('Fit sheet copied.', 'ok'); }
    catch (_) { ta.focus(); ta.select(); setStatus('Select-all and copy the fit sheet text.', ''); }
  });
  $('load_json').addEventListener('click', () => {
    try {
      const obj = JSON.parse($('fit_json').value);
      for (const k of Object.keys(DEFAULTS)) if (k in obj) state[k] = obj[k];
      showAll(); schedule(); setStatus('Fit sheet loaded.', 'ok');
    } catch (_) { setStatus('That is not a valid fit sheet (JSON).', 'error'); }
  });
  $('reset').addEventListener('click', () => { Object.assign(state, DEFAULTS); showAll(); schedule(); });

  // theme follows the viewer
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const retheme = () => viewer.setTheme(readTokens());
  mq.addEventListener('change', retheme);
  new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  showAll();
  await rebuild();

  // test hook: headless checks drive the same code path as the buttons
  window.__cfg = {
    ready: true,
    generate(params) {
      const p = { ...DEFAULTS, ...params };
      const data = builder.build(p);
      const stl = toSTL(data.mesh, 'test');
      let b = ''; for (let i = 0; i < stl.length; i += 0x8000) b += String.fromCharCode.apply(null, stl.subarray(i, i + 0x8000));
      return { stl_b64: btoa(b), volume_cm3: data.volume / 1000, bbox: data.bbox, tris: data.tris, warnings: data.warnings };
    },
  };

  // programmatic API used by the desktop app's order book (and tests)
  window.__cfgApp = {
    ready: true,
    getState: () => JSON.parse(JSON.stringify(state)),
    // [] when every field holds a usable value, else the plain-language problems
    problems: () => [...invalid.values()],
    // checks any parameter set (e.g. a saved order) without building it
    validate: (obj) => validateParams({ ...state, ...obj }).map(x => x.message),
    defaults: () => JSON.parse(JSON.stringify(DEFAULTS)),
    setState(obj) {
      for (const k of Object.keys(DEFAULTS)) if (obj && k in obj) state[k] = obj[k];
      showAll(); schedule();
    },
    // Build print files for the given parts from the current form values.
    // Nothing in the visible form changes.
    buildFiles(parts, overrides = {}) {
      const files = [], warnings = [], notes = [], stats = [], axes = {};
      let sheet = null;
      for (const part of parts) {
        const p = { ...state, ...overrides, part };
        const data = builder.build(p);
        const base = fileBase(p, data.derived);
        files.push({ name: `${base}.stl`, data: toSTL(data.mesh, `${base} - ${APP_NAME} ${APP_VERSION}`), part });
        data.warnings.forEach(w => warnings.push(`${part}: ${w}`));
        (data.notes || []).forEach(t => notes.push(`${part}: ${t}`));
        axes[part] = data.axes.map(a => ({ name: a.name, p: a.p, dir: a.dir }));
        // the ball is sliced with 3 walls and 5% infill, the other parts with 4 walls and 20%
        const infill = part === 'ball' ? 0.05 : 0.2;
        const shell = Math.min(data.volume, data.area * (part === 'ball' ? 1.3 : 1.6));
        const grams = Math.round(((shell + (data.volume - shell) * infill) * 1.27 / 1000) / 5) * 5;
        stats.push({ part, volume_cm3: +(data.volume / 1000).toFixed(1), bbox_mm: data.bbox.map(v => +v.toFixed(1)),
          grams, infill_pct: infill * 100, grams_20pct: grams, color_changes: data.colorChanges });
        if (!sheet) sheet = fitSheet(p, data.derived, data);
      }
      return { files, warnings, notes, stats, axes, fitSheet: sheet };
    },
  };
}

main().catch(e => { console.error(e); const s = document.getElementById('status'); if (s) { s.textContent = 'The geometry engine failed to start: ' + e.message; s.dataset.kind = 'error'; } });
