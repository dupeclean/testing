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
  // release gate: base segments (dovetailed end to end) with a loose pin standing in a shallow cup
  gate_w: 40, gate_t: 6, gate_gap: 10, gate_pin_d: 20, gate_cup_depth: 1.5, gate_cup_clear: 1.0,
  gate_dove_len: 12, gate_dove_w1: 14, gate_dove_w2: 20, gate_clear: 0.3,
  // axis target dots on the ball: socket diameter (plus print allowance) and depth; the plugs match
  pap_d: 12, pap_depth: 3,
  // axis target ring round each dot: centre-line radius, width and pocket depth (the inlay ring matches)
  ring_r: 30, ring_w: 4, ring_depth: 3,
  track_w: 12, track_depth: 2, track_gap: 1, track_clear: 1.5, track_foot: 0.8,
  // humming spinner: ring chamber radii, floor and wall-top heights (the 45-degree gable ridge follows) and slot size
  hum_r0: 30, hum_r1: 44, hum_z0: 5, hum_z1: 16, hum_slot_w: 2, hum_slot_l: 10,
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
  ball_d: 200, ball_thumb_depth: 70, ball_flat: 30, ball_groove: false,
  ball_stripe: 'none',       // optional layer pattern printed by swapping filament: none | spot | spot_band | cap | cap_band | bands (the second colour is normally the inlays: bullseyes and track)
  thumb_hole: true,          // ball only: false = two-handed / no-thumb ball
  // Oval holes, as a pro shop cuts them: the hole size is the SHORT way across, the oval size the
  // LONG way (0 = round). The angle is where the long axis points on the sheet: 0 = straight up the
  // sheet (along the thumb-to-fingers line), positive = turned toward the thumb side of the sheet
  // (to the left for a right hand, to the right for a left hand), as the owner's sheet reads.
  thumb_oval_d: 0, thumb_oval_angle: 0,
  middle_oval_d: 0, ring_oval_d: 0, finger_oval_angle: 0,
  // rounded edge (bevel) on each hole, mm radius, like the bevel a pro shop puts on a thumb hole
  thumb_bevel: 4, finger_bevel: 2.5,
  serial: '',                // engraved in the base, e.g. the order number FS-0001 (digits, F, S and - only)
  // Release gate: loose pins on linked base segments across the tape line; the ball knocks one down
  gate_pin_h: 100,
  // Axis target dots on the ball: two plug sockets at the axis the ball should spin about, as surface
  // distances from the grip centre: over toward the hand side, up toward the fingers. Spin the ball about
  // that axis and the dot stands still while the rest of the ball blurs.
  // pap_given: the drill sheet gives the bowler's own PAP. Else the FORWARD-ROLL AXIS is used: 90 degrees
  // round from the grip centre, straight out the sides of the ball (6 11/16" over, 0 up on a regulation
  // ball), the axis a straight finger lift spins the ball about with the hand behind it (the yo-yo roll).
  // On carpet that is the only release whose axis holds: a hook release's axis swings round inside the
  // ball in the first foot as the carpet grabs (by about two thirds of the axis rotation), so its bullseye
  // swings whatever the hand did. The PAP is measured from the centre of the grip, or from the middle of
  // the fingers on a no-thumb ball.
  // pap_ring: a second-colour inlay ring round each dot, a bullseye that stands still when the ball spins about the axis.
  // pap_track: the track ring, a 12 mm second-colour ring on the line the ball rolls on when it spins about
  // the axis point (two inlay arcs glued into a channel); it rolls along the floor under the ball when the ball
  // spins about the axis, and wobbles when the carpet swings the axis.
  // track_tilt: the axis tilt (degrees) that line is drawn for: 0 = end over end about the axis point (the
  // ring is its equator); a tilted release rolls on a smaller ring nearer the axis point.
  pap_marker: true, pap_given: false, pap_over: G.R * Math.PI / 2, pap_up: 0, pap_ring: true, pap_track: true, track_tilt: 0,
  // Humming spinner (experimental, off by default): a hollow ring chamber with slanted slots through
  // the top. Spun fast enough it hums, and keeps humming as long as the spin stays above that speed,
  // so the strength and carry of the finger lift can be heard.
  spin_hum: false, spin_hum_slots: 8, spin_hum_angle: 45,
};

const LENGTH_KEYS = ['span_middle', 'span_ring', 'thumb_d', 'middle_d', 'ring_d', 'print_allowance',
  'bridge', 'finger_depth', 'thumb_depth', 'sizer_thumb_center', 'sizer_finger_center', 'sizer_step', 'ball_d', 'ball_thumb_depth', 'ball_flat',
  'thumb_oval_d', 'middle_oval_d', 'ring_oval_d', 'thumb_bevel', 'finger_bevel', 'gate_pin_h', 'pap_over', 'pap_up'];
const PITCH_KEYS = ['thumb_fwd', 'thumb_lat', 'middle_fwd', 'middle_lat', 'ring_fwd', 'ring_lat'];
const BOOL_KEYS = ['thumb_through', 'weight_pocket', 'lanyard', 'ball_groove', 'thumb_hole', 'pap_marker', 'pap_given', 'pap_ring', 'pap_track', 'spin_hum'];
const ANGLE_KEYS = ['thumb_oval_angle', 'finger_oval_angle'];   // degrees
const SERIAL_RE = /^[0-9FS-]{0,12}$/;
const BALL_STRIPES = ['none', 'spot', 'spot_band', 'cap', 'cap_band', 'bands'];
const HUM_SLOTS = [2, 16], HUM_ANGLE = [0, 80];   // humming spinner: slot count, slot angle in degrees from radial
const TRACK_TILT = [0, 45];                       // axis tilt the track ring is drawn for, degrees

// Sensible ranges (mm). Anything outside is almost always a typo or the wrong unit
// (110 typed while the switch is on inches, or 4 5/16 typed while it is on mm), and values
// far outside make the geometry engine fail, so they are refused instead of built.
const LIMITS = {
  span_middle: [60, 150], span_ring: [60, 150],
  thumb_d: [15, 38], middle_d: [10, 30], ring_d: [10, 30],
  print_allowance: [0, 2], bridge: [2, 30], finger_depth: [8, 50], thumb_depth: [10, 80],
  sizer_thumb_center: [15, 38], sizer_finger_center: [10, 30], sizer_step: [0.1, 2],
  ball_d: [150, 230], ball_thumb_depth: [40, 95], ball_flat: [0, 40],
  thumb_oval_d: [0, 45], middle_oval_d: [0, 36], ring_oval_d: [0, 36], thumb_bevel: [0, 8], finger_bevel: [0, 6],
  gate_pin_h: [50, 150],
  pap_over: [0, 200], pap_up: [-60, 60],
};
const LABELS = {
  span_middle: 'Middle finger span', span_ring: 'Ring finger span',
  thumb_d: 'Thumb hole size', middle_d: 'Middle finger hole size', ring_d: 'Ring finger hole size',
  print_allowance: 'Print allowance', bridge: 'Bridge', finger_depth: 'Finger depth', thumb_depth: 'Thumb depth',
  sizer_thumb_center: 'Sizer thumb centre', sizer_finger_center: 'Sizer finger centre', sizer_step: 'Sizer step',
  ball_d: 'Ball diameter', ball_thumb_depth: 'Ball thumb hole depth', ball_flat: 'Ball resting flat',
  thumb_oval_d: 'Thumb oval size', middle_oval_d: 'Middle finger oval size', ring_oval_d: 'Ring finger oval size',
  thumb_bevel: 'Thumb hole bevel', finger_bevel: 'Finger hole bevel',
  gate_pin_h: 'Gate pin height',
  pap_over: 'Axis point over', pap_up: 'Axis point up',
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
  // the inlays with the track on stop at the grip holes the ring meets, so they are laid out like the ball
  const ballLike = p.part === 'ball' || (p.part === 'plugs' && p.pap_marker && p.pap_track);
  const noGrip = p.part === 'sizer' || p.part === 'gate' || (p.part === 'plugs' && !ballLike);   // parts without the three-hole grip
  // the spinner and a two-handed ball cut no thumb hole, so the thumb fields (hidden for them) are not checked
  const hasThumb = p.part === 'puck' || (ballLike && p.thumb_hole !== false);
  const keys = p.part === 'sizer' ? ['sizer_thumb_center', 'sizer_finger_center', 'sizer_step']
    : p.part === 'gate' ? ['ball_d', 'gate_pin_h']
    : noGrip ? ['print_allowance', 'ball_d']
    : ['span_middle', 'span_ring', 'middle_d', 'ring_d', 'print_allowance', 'bridge', 'finger_depth',
      'middle_oval_d', 'ring_oval_d', 'finger_bevel',
      ...(hasThumb ? ['thumb_d', 'thumb_oval_d', 'thumb_bevel'] : []),
      ...(ballLike ? ['ball_d', 'ball_flat', ...(hasThumb ? ['ball_thumb_depth'] : []), ...(p.pap_marker && p.pap_given ? ['pap_over', 'pap_up'] : [])] : p.part === 'puck' && !p.thumb_through ? ['thumb_depth'] : [])];
  if (p.part === 'spinner') keys.splice(keys.indexOf('span_middle'), 2);
  for (const k of keys) { const m = checkLength(k, p[k], 'mm'); if (m) out.push({ key: k, message: m }); }
  if (p.part === 'ball' && !BALL_STRIPES.includes(p.ball_stripe)) out.push({ key: 'ball_stripe', message: 'Choose a colour pattern for the ball.' });
  if (ballLike && p.pap_marker && p.pap_track && !(Number.isFinite(p.track_tilt) && p.track_tilt >= TRACK_TILT[0] && p.track_tilt <= TRACK_TILT[1]))
    out.push({ key: 'track_tilt', message: `Axis tilt for the track ring must be between ${TRACK_TILT[0]} and ${TRACK_TILT[1]} degrees.` });
  if (p.part === 'spinner' && p.spin_hum) {
    if (!Number.isInteger(p.spin_hum_slots) || p.spin_hum_slots < HUM_SLOTS[0] || p.spin_hum_slots > HUM_SLOTS[1]) out.push({ key: 'spin_hum_slots', message: `Hum slots: enter a whole number from ${HUM_SLOTS[0]} to ${HUM_SLOTS[1]}.` });
    if (!Number.isFinite(p.spin_hum_angle) || p.spin_hum_angle < HUM_ANGLE[0] || p.spin_hum_angle > HUM_ANGLE[1]) out.push({ key: 'spin_hum_angle', message: `Hum slot angle must be between ${HUM_ANGLE[0]} and ${HUM_ANGLE[1]} degrees.` });
  }
  if (!noGrip) {
    for (const [ov, d, label] of [...(hasThumb ? [['thumb_oval_d', 'thumb_d', 'Thumb']] : []), ['middle_oval_d', 'middle_d', 'Middle finger'], ['ring_oval_d', 'ring_d', 'Ring finger']]) {
      if (p[ov] > 0 && p[ov] < p[d] - 1e-6) out.push({ key: ov, message: `${label} oval size is the LONG way across, so it must be at least the hole size (${fmtMm(p[d])} mm). Enter 0 for a round hole.` });
      if (p[ov] > 0 && p[ov] - p[d] > 8) out.push({ key: ov, message: `${label} oval is more than 8 mm longer than it is wide; check the two sizes.` });
    }
    for (const k of ANGLE_KEYS) if (!Number.isFinite(p[k]) || Math.abs(p[k]) > 90) out.push({ key: k, message: 'Oval angle must be between -90 and 90 degrees.' });
    if (typeof p.serial !== 'string' || !SERIAL_RE.test(p.serial)) out.push({ key: 'serial', message: 'Engraved text can only use digits, F, S and a dash (up to 12 characters).' });
  }
  if (!noGrip) for (const k of PITCH_KEYS) {
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
  // oval holes: how much further each hole reaches along the grip line (y) and across it (x)
  const ovT = p.thumb_oval_d > 0 ? Math.max(0, p.thumb_oval_d - p.thumb_d) : 0;
  const ovM = p.middle_oval_d > 0 ? Math.max(0, p.middle_oval_d - p.middle_d) : 0;
  const ovR = p.ring_oval_d > 0 ? Math.max(0, p.ring_oval_d - p.ring_d) : 0;
  // An oval's long axis on the sheet is v = (-mir*sin a, cos a): a = 0 points up the sheet (thumb to
  // fingers), + turns it toward the thumb side of the sheet (left for a right hand). That is how the
  // owner's sheet read against the drilled ball (the first print, 2026-10-23, had it mirrored). A
  // hole's reach along a unit direction u is its radius plus the oval's support along u.
  const vT = [-mir * Math.sin(p.thumb_oval_angle * DEG), Math.cos(p.thumb_oval_angle * DEG)];
  const vF = [-mir * Math.sin(p.finger_oval_angle * DEG), Math.cos(p.finger_oval_angle * DEG)];
  const reach = (d, ex, v, u) => d / 2 + ex / 2 * Math.abs(v[0] * u[0] + v[1] * u[1]);
  const rm_x = reach(md, ovM, vF, [1, 0]), rr_x = reach(rd, ovR, vF, [1, 0]);   // fingers' reach across the bridge
  // Seen from outside the grip with the thumb hole at the bottom (the way a drill sheet is
  // drawn), a right hand's fingers run index, middle, ring from the thumb side to the pinky
  // side, so the middle finger is the LEFT hole and the ring finger the RIGHT hole. Left
  // hand mirrors that. (+x is the viewer's right.)
  const x_m = -mir * (rm_x + p.bridge / 2);
  const x_r = mir * (rr_x + p.bridge / 2);
  // Spans are cut to cut along the line from the thumb centre to each finger centre, which is tilted
  // a few degrees off y (in opposite directions for the two fingers). Lay the holes out once along y,
  // then measure each oval's reach along the true centre line and lay out again (one pass is enough).
  const layout = (uM, uR) => {
    const cc_m = p.span_middle + reach(td, ovT, vT, uM) + reach(md, ovM, vF, uM);
    const cc_r = p.span_ring + reach(td, ovT, vT, uR) + reach(rd, ovR, vF, uR);
    const ty = (cc_m + cc_r) / 4;
    const y_m = -ty + Math.sqrt(Math.max(0, cc_m * cc_m - x_m * x_m));
    const y_r = -ty + Math.sqrt(Math.max(0, cc_r * cc_r - x_r * x_r));
    return { cc_m, cc_r, ty, y_m, y_r };
  };
  const unit = (x, y) => { const n = Math.hypot(x, y) || 1; return [x / n, y / n]; };
  const first = layout([0, 1], [0, 1]);
  const { cc_m, cc_r, ty, y_m, y_r } = layout(unit(x_m, first.y_m + first.ty), unit(x_r, first.y_r + first.ty));
  const ext_s = ty + td / 2 + ovT / 2 + G.end_wall;
  const ext_n = Math.max(y_m + md / 2 + ovM / 2, y_r + rd / 2 + ovR / 2) + G.end_wall;
  return { mir, td, md, rd, x_m, x_r, y_m, y_r, ty, ext_s, ext_n, cc_m, cc_r, ovT, ovM, ovR, rm_x, rr_x };
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

// Angle (radians) in a hole's local XY plane that puts an oval's long axis where the drill sheet
// says: sheet angle 0 = straight up the sheet (the thumb-to-fingers line), positive = turned toward
// the thumb side of the sheet (left for a right hand). rot is the hole's Euler rotation from holeAxis().
function ovalLocalAngle(rot, sheetDeg, mir) {
  const b = rot[1] * DEG, c = rot[2] * DEG, t = sheetDeg * DEG;
  const v = [-mir * Math.sin(t), Math.cos(t)];                 // wanted direction in the plan view
  const va = v[0] * Math.cos(c) + v[1] * Math.sin(c);          // along the local X axis' footprint
  const vb = -v[0] * Math.sin(c) + v[1] * Math.cos(c);         // along the local Y axis
  return Math.atan2(vb * Math.cos(b), va);
}

// small vector helpers
const V = {
  unit: (v) => { const n = Math.hypot(v[0], v[1], v[2]) || 1; return v.map(x => x / n); },
  add: (a, b) => a.map((x, i) => x + b[i]),
  scale: (a, k) => a.map(x => x * k),
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  clamp1: (v) => Math.max(-1, Math.min(1, v)),
};

// The axis the release should spin about (the PAP), as a unit vector from the ball's centre C. The
// axis point the way a pro shop measures it: from the CENTRE OF THE GRIP (midway between the thumb
// hole and the middle of the two finger holes), or from the MIDDLE OF THE FINGERS on a no-thumb
// ball; "over" first, along the surface across the grip toward the hand side, then "up" toward the
// fingers. The sheet's own PAP when it gives one, else the common 5 1/2" x 1/2". thumb/mid/ring are
// the drilled holes (from drill()); the reference points come from them, so lateral pitches and
// unequal spans are honoured.
function papDirection(p, D, thumb, mid, ring, C) {
  const over = p.pap_given ? p.pap_over : DEFAULTS.pap_over, up = p.pap_given ? p.pap_up : DEFAULTS.pap_up;
  const dirOf = (h) => V.unit(V.add(h.axis.p, V.scale(C, -1)));                 // ball centre to a hole's entry point
  const fm = V.unit(V.add(dirOf(mid), dirOf(ring)));                             // the middle of the two finger holes
  const n = thumb ? V.unit(V.add(dirOf(thumb), fm)) : fm;                        // the reference point
  const fy = V.unit(thumb ? V.add(fm, V.scale(n, -V.dot(fm, n))) : V.add([0, 1, 0], V.scale(n, -n[1])));   // "up": toward the fingers
  const e0 = V.cross(fy, n), e = V.unit(V.scale(e0, e0[0] * D.mir >= 0 ? 1 : -1));                      // "over": toward the hand side
  // the sheet's distances are arcs on a regulation ball (G.R, 108 mm): keep the ANGLE on this ball, as
  // the pitches do, so the axis sits where it does on the real ball (5 1/2" over = 74 degrees; used
  // unscaled on a 200 mm ball it was 80 degrees, with the track through the thumb hole and the flat)
  const aOver = over / G.R, aUp = up / G.R;
  const q = V.add(V.scale(n, Math.cos(aOver)), V.scale(e, Math.sin(aOver)));
  const d = V.add(V.scale(q, Math.cos(aUp)), V.scale(fy, Math.sin(aUp)));
  return { d, over, up, over_ball_mm: +(aOver * p.ball_d / 2).toFixed(1), up_ball_mm: +(aUp * p.ball_d / 2).toFixed(1), dirOf,
    from: thumb ? 'the centre of the grip' : 'the middle of the two finger holes' };
}

// ---------------------------------------------------------------------------
// CSG builder
// ---------------------------------------------------------------------------
function makeBuilder(W) {
  const { Manifold, CrossSection } = W;
  const trash = [];
  const T = (m) => { trash.push(m); return m; };
  const flush = () => { for (const m of trash) { try { m.delete(); } catch (_) { /* already freed */ } } trash.length = 0; };

  // opts: { oval: extra length of an oval hole (mm, 0 = round), ovalAngle: sheet angle (deg), bevel: mm }
  function drill(x, y, d, depth, fwdIn, latIn, bodyH, through, mir, fdir, R = G.R, opts = {}) {
    const ax = holeAxis(x, y, fwdIn, latIn, bodyH, mir, fdir, R);
    const ex = opts.oval || 0, bev = opts.bevel == null ? G.rim_chamfer : opts.bevel;
    const phi = ex > 0 ? ovalLocalAngle(ax.rot, opts.ovalAngle || 0, mir) : 0;
    const off = [Math.cos(phi) * ex / 2, Math.sin(phi) * ex / 2];
    // an oval hole is a round one swept sideways by `ex`: the hull of two copies (each piece is convex)
    const stretch = (m) => ex > 0 ? T(Manifold.hull([T(m.translate([off[0], off[1], 0])), T(m.translate([-off[0], -off[1], 0]))])) : m;
    const bore = stretch(through
      ? T(T(Manifold.cylinder(165, d / 2, d / 2, G.seg_hole)).translate([0, 0, -130]))
      : T(T(Manifold.cylinder(depth + 35, d / 2, d / 2, G.seg_hole)).translate([0, 0, -depth])));
    // rounded edge: a quarter circle of radius `bev` built from short frustums, meeting the bore wall
    // `bev` below the surface and the surface `bev` out from the bore; above the surface it carries on
    // as a shallow cone so a surface that rises on one side (pitch, curvature) still gets an edge
    // The hole's local z = 0 is the sphere's tangent plane at the entry point; at the rim the sphere
    // has already fallen r^2/(2R) below it, so the whole edge profile is sunk by that sagitta or the
    // round would meet the surface early, with a crease, about half as wide as asked for.
    const sag = (d / 2 + bev + ex / 2) ** 2 / (2 * R);
    const pieces = [];
    const N = 6;
    for (let k = 0; k < N; k++) {
      const a0 = (k / N) * Math.PI / 2, a1 = ((k + 1) / N) * Math.PI / 2;
      const r0 = d / 2 + bev - bev * Math.cos(a0), r1 = d / 2 + bev - bev * Math.cos(a1);
      const z0 = -bev + bev * Math.sin(a0), z1 = -bev + bev * Math.sin(a1);
      pieces.push(stretch(T(T(Manifold.cylinder(Math.max(z1 - z0, 0.05), r0, r1, G.seg_hole)).translate([0, 0, z0]))));
    }
    pieces.push(stretch(T(Manifold.cylinder(6, d / 2 + bev, d / 2 + bev + 8, G.seg_hole))));
    const edge = bev > 0 ? T(T(Manifold.union(pieces)).translate([0, 0, -sag])) : null;
    const place = (m) => T(T(m.rotate(ax.rot)).translate(ax.p));
    // `bore` alone is used for collision checks: bevels are allowed to merge
    // at the bridge, exactly like the bevel on a real ball
    return { cut: place(edge ? T(bore.add(edge)) : bore), bore: place(bore), axis: ax };
  }
  const ovalOpts = (p, which) => which === 'thumb'
    ? { oval: 0, ovalAngle: p.thumb_oval_angle, bevel: p.thumb_bevel }
    : { oval: 0, ovalAngle: p.finger_oval_angle, bevel: p.finger_bevel };

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

    const thumb = drill(0, -D.ty, D.td, p.thumb_depth, p.thumb_fwd, p.thumb_lat, G.puck_h, p.thumb_through, D.mir, +1, G.R, { ...ovalOpts(p, 'thumb'), oval: D.ovT });
    const mid = drill(D.x_m, D.y_m, D.md, p.finger_depth, p.middle_fwd, p.middle_lat, G.puck_h, false, D.mir, -1, G.R, { ...ovalOpts(p, 'finger'), oval: D.ovM });
    const ring = drill(D.x_r, D.y_r, D.rd, p.finger_depth, p.ring_fwd, p.ring_lat, G.puck_h, false, D.mir, -1, G.R, { ...ovalOpts(p, 'finger'), oval: D.ovR });
    axes.push({ name: 'thumb', ...thumb.axis }, { name: 'middle', ...mid.axis }, { name: 'ring', ...ring.axis });
    const cuts = [thumb.cut, mid.cut, ring.cut];
    const ser = serialCut(p, 0, D.ext_n - 15, 1, 60);   // the finger end of the base: the thumb bore leans toward the centre and exits the base 20-30 mm in from its entry, so the thumb end is not free
    if (ser) cuts.push(ser);
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
    // (an oval finger hole reaches rm_x / rr_x across the bridge, not just its radius)
    const web = minAxisGap(mid.axis, ring.axis, p.finger_depth) - (D.rm_x + D.rr_x);
    if (web < WEB_MIN && !overlap(mid.bore, ring.bore))
      warnings.push(`The web between the finger holes narrows to ${Math.max(0, web).toFixed(1)} mm deep inside. That is a fragile hairline when printed. Increase the bridge or reduce the finger depth.`);
    for (const [name, h] of [['middle', mid], ['ring', ring]]) {
      // lowest point of the bore's bottom rim (the bore is tilted, so its rim dips below the centre;
      // an oval's extra length is counted in full, whichever way it points)
      const rimZ = h.axis.p[2] - p.finger_depth * h.axis.dir[2] - (name === 'middle' ? D.md + D.ovM : D.rd + D.ovR) / 2 * Math.hypot(h.axis.dir[0], h.axis.dir[1]);
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
    const mid = drill(D.x_m, 0, D.md, depth, 0, 0, G.spin_h, false, D.mir, -1, G.R, { ...ovalOpts(p, 'finger'), oval: D.ovM });
    const ring = drill(D.x_r, 0, D.rd, depth, 0, 0, G.spin_h, false, D.mir, -1, G.R, { ...ovalOpts(p, 'finger'), oval: D.ovR });
    const cuts = [mid.cut, ring.cut];
    const ser = serialCut(p, -21, 22, 1, 34);   // one quadrant of the 100 mm base, clear of the spin bars; long numbers shrink to fit
    if (ser) cuts.push(ser);
    if (p.lanyard && !p.spin_hum) cuts.push(xtunnel(-G.spin_d / 2 + 18, 8, G.lanyard_d, G.spin_d + 20));   // the tunnel would cross the chamber
    for (const a of [0, 90])
      cuts.push(T(T(T(Manifold.cube([G.spin_d - 8, 4, 2.4], true)).rotate([0, 0, a])).translate([0, 0, -0.01])));
    const warnings = [], notes = [];
    let hum = null;
    if (p.spin_hum) {
      cuts.push(...humCuts(p, D));
      hum = { slots: p.spin_hum_slots, angle_deg: p.spin_hum_angle, chamber_r_mm: [G.hum_r0, G.hum_r1] };
      notes.push('Humming chamber on (experimental): the wrist-cord tunnel is left out because it would cross the chamber. The speed at which the hum starts, and its note, are tuned by test prints.');
      // the finger bores must stay clear of the chamber's inner wall
      const reach = Math.max(Math.abs(D.x_m) + D.md / 2 + D.ovM / 2, Math.abs(D.x_r) + D.rd / 2 + D.ovR / 2) + p.finger_bevel;
      if (reach > G.hum_r0 - 2.5) warnings.push(`The finger holes reach ${reach.toFixed(1)} mm from the centre, into the humming chamber's wall (which starts at ${G.hum_r0} mm). Reduce the bridge or the hole sizes, or turn the hum off.`);
    }
    const result = T(body.subtract(T(Manifold.union(cuts))));
    if (overlap(mid.bore, ring.bore)) warnings.push('The two finger bores intersect. Increase the bridge.');
    else {
      const web = minAxisGap(mid.axis, ring.axis, depth) - (D.rm_x + D.rr_x);
      if (web < WEB_MIN) warnings.push(`The web between the finger holes narrows to ${Math.max(0, web).toFixed(1)} mm deep inside. That is a fragile hairline when printed. Increase the bridge.`);
    }
    return { result, warnings, notes, hum, axes: [{ name: 'middle', ...mid.axis }, { name: 'ring', ...ring.axis }] };
  }

  // Humming chamber for the spinner: a ring cavity (house-shaped profile revolved about the axis;
  // its 45-degree gable roof prints without supports) plus slanted slots from the top surface into it.
  function humCuts(p, D) {
    const { hum_r0: r0, hum_r1: r1, hum_z0: z0, hum_z1: z1 } = G;
    const rm = (r0 + r1) / 2, ridge = z1 + (r1 - r0) / 2;
    const prof = CrossSection.ofPolygons([[[r0, z0], [r1, z0], [r1, z1], [rm, ridge], [r0, z1]]]);
    const out = [T(Manifold.revolve(prof, G.seg_sphere))];
    prof.delete();
    for (let i = 0; i < p.spin_hum_slots; i++) {
      // the slot's long axis is turned from radial toward the way the surface moves (mirrored for a left hand)
      const slot = T(T(T(Manifold.cube([G.hum_slot_l, G.hum_slot_w, 30], true)).rotate([0, 0, D.mir * p.spin_hum_angle])).translate([rm, 0, z1 + 14]));
      out.push(T(slot.rotate([0, 0, i * 360 / p.spin_hum_slots])));
    }
    return out;
  }

  // Rev Ball: a full sphere with the bowler's grip at the top and a small flat underneath so it can
  // stand on the print bed. Released on the floor it rolls and hooks (or does not), which shows the
  // release. Solid in the model; the slicer makes it light (4 walls, 8% gyroid infill: about 700 g).
  // Where the track ring goes: the line the ball rolls on when it spins about the axis point with
  // p.track_tilt degrees of axis tilt, the circle (90 - tilt) degrees from the axis point (0 tilt: the
  // equator about the axis, end over end). A real track runs through the grip holes it meets, so where
  // this ring would, the channel and the arcs stop a little short of the hole's bevel instead (guard
  // cylinders along the ball's radius: the hole's reach plus G.track_clear). Angles in radians.
  function trackPlan(p, D, thumb, mid, ring, dirOf, d, R, s, wC) {
    const beta = (wC / 2) / R;                                                   // half the band, as an angle
    const theta = (90 - p.track_tilt) * DEG;
    const guards = [], crosses = [];
    for (const [h, name, dia, ex, bev] of [[thumb, 'thumb', D.td, D.ovT, p.thumb_bevel], [mid, 'middle finger', D.md, D.ovM, p.finger_bevel], [ring, 'ring finger', D.rd, D.ovR, p.finger_bevel]]) {
      if (!h) continue;
      const rG = dia / 2 + ex / 2 + bev + G.track_clear;
      const u = dirOf(h), psi = Math.acos(V.clamp1(V.dot(u, d)));              // the hole's centre, from the axis point
      if (Math.abs(psi - theta) >= Math.asin(Math.min(1, rG / R)) + beta) continue;
      crosses.push(name);
      const rotG = [0, Math.acos(V.clamp1(u[2])) / DEG, Math.atan2(u[1], u[0]) / DEG];
      guards.push(T(T(T(T(Manifold.cylinder(60, rG, rG, G.seg_hole)).translate([0, 0, -30])).rotate(rotG)).translate(h.axis.p)));
    }
    const psiPole = Math.acos(V.clamp1(-d[2])), angFlat = Math.asin(Math.min(1, (p.ball_flat / 2) / R));
    return { theta, guards, crosses, onFlat: Math.abs(psiPole - theta) < angFlat + beta };
  }
  // the slab (in the axis frame, axis = z) that cuts a band of half-angle beta round polar angle theta
  function zoneSlab(R, theta, beta) {
    const z0 = R * Math.cos(theta + beta), z1 = R * Math.cos(theta - beta);
    return T(T(Manifold.cube([2 * R + 10, 2 * R + 10, z1 - z0], true)).translate([0, 0, (z0 + z1) / 2]));
  }

  function ball(p, D) {
    const R = p.ball_d / 2;
    const s = p.ball_flat > 0 ? R - Math.sqrt(Math.max(0, R * R - (p.ball_flat / 2) ** 2)) : 0;   // sagitta of the flat
    const H = 2 * R - s;                                                                          // top of the ball above the bed
    const sph = T(T(Manifold.sphere(R, G.seg_sphere)).translate([0, 0, R - s]));
    const keep = T(T(Manifold.cube([2 * R + 2, 2 * R + 2, H + 1], true)).translate([0, 0, (H + 1) / 2]));
    const body = T(sph.intersect(keep));
    // without a thumb hole (two-handed / no-thumb) the two finger holes sit centred on the top
    const yM = p.thumb_hole ? D.y_m : 0, yR = p.thumb_hole ? D.y_r : 0;
    const thumb = p.thumb_hole ? drill(0, -D.ty, D.td, p.ball_thumb_depth, p.thumb_fwd, p.thumb_lat, H, false, D.mir, +1, R, { ...ovalOpts(p, 'thumb'), oval: D.ovT }) : null;
    const mid = drill(D.x_m, yM, D.md, p.finger_depth, p.middle_fwd, p.middle_lat, H, false, D.mir, -1, R, { ...ovalOpts(p, 'finger'), oval: D.ovM });
    const ring = drill(D.x_r, yR, D.rd, p.finger_depth, p.ring_fwd, p.ring_lat, H, false, D.mir, -1, R, { ...ovalOpts(p, 'finger'), oval: D.ovR });
    const cuts = [mid.cut, ring.cut];
    if (thumb) cuts.push(thumb.cut);
    const ser = serialCut(p, 0, 0, 0.8, Math.max(8, p.ball_flat - 2));   // on the resting flat (shrunk to fit it), read with the ball turned over
    if (ser) cuts.push(ser);
    const groove = (z, w, deep) => {   // a groove w wide and `deep` deep round the ball, centred on height z
      const rz = (zz) => Math.sqrt(Math.max(1, R * R - (zz - (R - s)) ** 2));   // the ball's radius at a height
      // the groove floor follows the surface (a frustum between the ball's radii at the groove's edges), so
      // it is `deep` everywhere, low on the ball and near the top as much as round the middle
      const outer = T(Manifold.cylinder(w, R + 5, R + 5, 128));
      const inner = T(T(Manifold.cylinder(w + 0.4, rz(z - w / 2 - 0.2) - deep, rz(z + w / 2 + 0.2) - deep, 128)).translate([0, 0, -0.2]));
      return T(T(outer.subtract(inner)).translate([0, 0, z - w / 2]));
    };
    if (p.ball_groove) cuts.push(groove(R - s, 2, 0.8));   // marker groove round the equator
    // Axis target dots: two shallow sockets at the axis the release should spin about (the PAP), given
    // as surface distances from the grip centre, `pap_over` toward the hand side and `pap_up` toward
    // the fingers; the second socket is at the opposite point. Contrasting plugs (part "plugs") press
    // in. When the ball spins about that axis the dot stands still while the rest of the ball blurs.
    const papAxes = [], papWarn = new Set(), papZones = [], trackNotes = [];   // papZones: z extents of each bullseye, for the band placement
    let pap = null;
    if (p.pap_marker) {
      // The axis point the way a pro shop measures it: from the CENTRE OF THE GRIP (midway between the
      // thumb hole and the middle of the two finger holes), or from the MIDDLE OF THE FINGERS on a
      // no-thumb ball; "over" first, along the surface across the grip toward the hand side, then "up"
      // toward the fingers. The sheet's own PAP when it gives one, else the common 5 1/2" x 1/2".
      const C = [0, 0, R - s];
      const { d, over, up, over_ball_mm, up_ball_mm, dirOf, from } = papDirection(p, D, thumb, mid, ring, C);
      const { dot: dot3, clamp1 } = V;
      const rP = G.pap_d / 2 + p.print_allowance / 2;
      const rIn = G.ring_r - G.ring_w / 2 - p.print_allowance / 2, rOut = G.ring_r + G.ring_w / 2 + p.print_allowance / 2;
      const thetaOut = Math.asin(Math.min(1, rOut / R));
      const entries = [thumb, mid, ring].filter(Boolean).map(h => h.axis.p);
      const holeReach = Math.max(D.td, D.md, D.rd) / 2 + Math.max(p.thumb_bevel, p.finger_bevel) + 4;
      pap = { over_mm: over, up_mm: up, over_ball_mm, up_ball_mm, given: !!p.pap_given, from, socket_d_mm: +(2 * rP).toFixed(2), depth_mm: G.pap_depth,
        ring: p.pap_ring ? { r_mm: G.ring_r, w_mm: G.ring_w, depth_mm: G.ring_depth } : null, track: null, points: [], zones: papZones };
      for (const sign of [1, -1]) {
        const u = d.map(v => v * sign);
        const P = [C[0] + R * u[0], C[1] + R * u[1], C[2] + R * u[2]];
        const rot = [0, Math.acos(clamp1(u[2])) / DEG, Math.atan2(u[1], u[0]) / DEG];
        cuts.push(T(T(T(Manifold.cylinder(G.pap_depth + 3, rP, rP, G.seg_hole)).translate([0, 0, -G.pap_depth])).rotate(rot)).translate(P));
        if (p.pap_ring) {
          // an annular pocket round the dot with a flat bottom, so the inlay ring can print flat
          const hP = G.ring_depth + 10;
          const ann = T(T(Manifold.cylinder(hP, rOut, rOut, G.seg_sphere)).subtract(T(T(Manifold.cylinder(hP + 2, rIn, rIn, G.seg_sphere)).translate([0, 0, -1]))));
          cuts.push(T(T(T(ann.translate([0, 0, Math.sqrt(R * R - rOut * rOut) - G.ring_depth])).rotate(rot)).translate(C)));
        }
        pap.points.push(P.map(v => +v.toFixed(2)));
        {   // the z extent of this bullseye (the ring, or just the socket when the ring is off)
          const th = p.pap_ring ? thetaOut : Math.asin(Math.min(1, rP / R)), sz = Math.sqrt(Math.max(0, 1 - u[2] * u[2]));
          papZones.push([C[2] + R * (u[2] * Math.cos(th) - sz * Math.sin(th)), C[2] + R * (u[2] * Math.cos(th) + sz * Math.sin(th))]);
        }
        papAxes.push({ name: 'axis', p: P, dir: u });
        if (P[2] < s + 15) papWarn.add('An axis target dot sits almost on the resting flat. Move the axis point further over, or turn the dots off.');
        if (p.pap_ring) {
          const alpha = Math.acos(clamp1(-u[2]));                                 // angle between the axis point and straight down
          const zMin = C[2] - R * Math.cos(Math.max(0, alpha - thetaOut));       // the ring's lowest point
          if (zMin < s + 3) papWarn.add('An axis target ring would run onto the resting flat. Move the axis point further over, or turn the ring off.');
        }
        for (const ent of entries) {
          const arc = R * Math.acos(clamp1(((ent[0] - C[0]) * u[0] + (ent[1] - C[1]) * u[1] + (ent[2] - C[2]) * u[2]) / R));
          if (arc < rP + holeReach)
            papWarn.add('An axis target dot runs into a grip hole. Move the axis point further over or up, or turn the dots off.');
          else if (p.pap_ring && arc < R * thetaOut + holeReach)
            papWarn.add('An axis target ring runs into a grip hole. Move the axis point further over or up, or turn the ring off.');
        }
      }
      if (p.pap_track) {
        // The track ring: a channel on the line the ball rolls on when it spins about the axis point
        // (trackPlan), for two second-colour inlay arcs (part "plugs"). Spun about the axis, the ball rolls
        // along the ring and the ring holds still; the carpet swings any other axis round and the ring wobbles.
        const wC = G.track_w + p.print_allowance;                               // the channel, with the allowance
        const plan = trackPlan(p, D, thumb, mid, ring, dirOf, d, R, s, wC);
        const rotT = [0, Math.acos(clamp1(d[2])) / DEG, Math.atan2(d[1], d[0]) / DEG];
        const shell = T(T(Manifold.sphere(R + 3, G.seg_sphere)).subtract(T(Manifold.sphere(R - G.track_depth, G.seg_sphere))));
        const channel = T(T(T(zoneSlab(R, plan.theta, (wC / 2) / R).intersect(shell)).rotate(rotT)).translate(C));
        cuts.push(plan.guards.length ? T(channel.subtract(T(Manifold.union(plan.guards)))) : channel);
        const deg = Math.round(plan.theta / DEG);
        pap.track = { w_mm: G.track_w, depth_mm: G.track_depth, clear_mm: G.track_clear, tilt_deg: p.track_tilt, angle_deg: +(plan.theta / DEG).toFixed(1), crosses: plan.crosses, on_flat: plan.onFlat };
        trackNotes.push(`The track ring is the line the ball rolls on when it spins about the axis point${p.track_tilt ? ` with ${p.track_tilt} degrees of axis tilt (${deg} degrees from the axis point)` : ' end over end (its equator about the axis point)'}.${plan.crosses.length ? ` It runs through the ${plan.crosses.join(' and ')} hole${plan.crosses.length > 1 ? 's' : ''}, as a track does; the channel stops ${G.track_clear} mm short of each bevel, so that arc comes in pieces.` : ' It clears the grip holes.'}`);
        if (plan.onFlat) trackNotes.push('The track runs across the resting flat; the arc is flattened there.');
      }
    }
    // Second-colour pattern: the slicer swaps filament at these heights (everything printed above a
    // swap takes the new colour until the next swap). A fine groove marks each boundary. The marks are
    // placed from the layout: a small spot just above the highest hole edge (or the full cap just below
    // the lowest), and a 12 mm band in the window nearest the middle that clears both bullseyes.
    const zEq = R - s, zTop = 2 * R - s;
    const rims = [[thumb, D.td + D.ovT, p.thumb_bevel], [mid, D.md + D.ovM, p.finger_bevel], [ring, D.rd + D.ovR, p.finger_bevel]].filter(([h]) => h);
    const rimLow = rims.map(([h, d, bev]) => { const r = Math.hypot(h.axis.p[0], h.axis.p[1]) + d / 2 + bev; return R - s + Math.sqrt(Math.max(0, R * R - r * r)); });
    const rimHigh = rims.map(([h, d, bev]) => { const r = Math.max(0, Math.hypot(h.axis.p[0], h.axis.p[1]) - d / 2 - bev); return R - s + Math.sqrt(Math.max(0, R * R - r * r)); });
    const zCap = Math.floor(Math.min(...rimLow) - 6);
    let zSpot = Math.ceil(Math.max(...rimHigh) + 2);
    const patternNotes = [];
    const wantSpot = p.ball_stripe === 'spot' || p.ball_stripe === 'spot_band';
    if (wantSpot && zSpot > zTop - 8) { zSpot = zCap; patternNotes.push('No room for a spot above the finger holes (they sit on the top), so the top mark starts just below them instead.'); }
    const bandW = 12;
    let band = null;
    if (p.ball_stripe === 'spot_band' || p.ball_stripe === 'cap_band') {
      const topLimit = (wantSpot ? zSpot : zCap) - 4, botLimit = s + 8;   // below the top mark, above the flat
      const clear = (zc) => zc - bandW / 2 >= botLimit && zc + bandW / 2 <= topLimit && papZones.every(([lo, hi]) => zc + bandW / 2 <= lo - 2 || zc - bandW / 2 >= hi + 2);
      for (let step = 0; step <= 150 && !band; step++) for (const zc of [zEq - step, zEq + step]) if (!band && clear(zc)) band = [zc - bandW / 2, zc + bandW / 2];
      if (!band) patternNotes.push('No band: there is no 12 mm window on this ball that clears both bullseyes. The top mark alone shows the spin.');
      else if (Math.abs((band[0] + band[1]) / 2 - zEq) > 0.5) patternNotes.push(`The band sits ${(band[0] + band[1]) / 2 < zEq ? 'lower' : 'higher'} than the middle, at ${band[0].toFixed(1)} to ${band[1].toFixed(1)} mm, to keep clear of the bullseyes.`);
    }
    if (p.ball_stripe === 'bands' && papZones.length) patternNotes.push('The three bands run across the bullseyes: print the plugs and rings in a third colour, or choose the spot pattern.');
    const topMark = wantSpot ? [[zSpot, 'cap']] : (p.ball_stripe === 'cap' || p.ball_stripe === 'cap_band') ? [[zCap, 'cap']] : [];
    const swaps = p.ball_stripe === 'bands'
      ? [[zEq - 36, 'band'], [zEq - 24, 'base'], [zEq - 6, 'band'], [zEq + 6, 'base'], [zEq + 24, 'band'], [zEq + 36, 'base']]
      : [...(band ? [[band[0], 'band'], [band[1], 'base']] : []), ...topMark];
    for (const [z] of swaps) cuts.push(groove(z, 0.6, 0.3));
    const colorChanges = swaps.map(([z, what]) => ({ z_mm: +z.toFixed(1), colour: what === 'base' ? 'base colour' : 'second colour' }));
    // the second-colour slabs (from each swap to the next), for the two-part 3MF
    const colorSpans = [];
    swaps.forEach(([z, what], i) => { if (what !== 'base') colorSpans.push([z, i + 1 < swaps.length ? swaps[i + 1][0] : zTop + 1]); });
    const pattern = { name: p.ball_stripe, spot_z: wantSpot && topMark.length ? +zSpot.toFixed(1) : null, cap_z: !wantSpot && topMark.length ? +zCap.toFixed(1) : null,
      band_mm: band ? band.map(v => +v.toFixed(1)) : null, notes: patternNotes };
    const result = T(body.subtract(T(Manifold.union(cuts))));
    const warnings = [...papWarn];
    if (thumb && (overlap(thumb.bore, mid.bore) || overlap(thumb.bore, ring.bore)))
      warnings.push('Thumb and finger bores run into each other inside the ball: the spans are too short for these hole sizes, or the thumb hole is too deep.');
    if (overlap(mid.bore, ring.bore))
      warnings.push('The two finger bores intersect below the surface. Increase the bridge or reduce the lateral pitches.');
    const web = minAxisGap(mid.axis, ring.axis, p.finger_depth) - (D.rm_x + D.rr_x);
    if (web < WEB_MIN && !overlap(mid.bore, ring.bore))
      warnings.push(`The web between the finger holes narrows to ${Math.max(0, web).toFixed(1)} mm deep inside. That is a fragile hairline when printed. Increase the bridge or reduce the finger depth.`);
    const floor = H - R - s + (R - p.ball_thumb_depth);   // rough: thumb bore end above the bed when aimed at the centre
    if (thumb && p.ball_thumb_depth > R - 8) warnings.push('The thumb hole reaches almost to the centre of the ball. Make it shallower.');
    const inlayNote = p.pap_marker ? [`The second colour is the inlays file: the axis plugs${p.pap_ring ? ' and rings' : ''}${p.pap_track ? ' and the two track arcs' : ''}, printed in the second colour as exported and pressed${p.pap_track ? ' or glued' : ''} in.`] : [];
    const notes = [...inlayNote, ...trackNotes, ...patternNotes, ...(colorChanges.length
      ? [`Two-colour ball: open the .3mf in Bambu Studio and it arrives as one object in two parts with filaments 1 (base colour) and 2 (second colour) assigned. Or open the STL and add a filament change at these heights (Bambu Studio: right-click the layer slider, "Add color change"): ${colorChanges.map(c => `${c.z_mm} mm → ${c.colour}`).join('; ')}. Start the print in the base colour; no prime tower is needed.`]
      : [])];
    const axes = [{ name: 'middle', ...mid.axis }, { name: 'ring', ...ring.axis }];
    if (thumb) axes.unshift({ name: 'thumb', ...thumb.axis });
    axes.push(...papAxes);   // drawn in the preview too, so the target axis is visible
    return { result, warnings, notes, colorChanges, colorSpans, pattern, axes, floor, pap };
  }

  // The second-colour inlays for the ball: two plugs for the dots (0.3 mm proud so the dot catches
  // the light), with the ring on two inlay rings (flat underneath so they print flat, the top
  // following the ball's surface), and with the track on two arcs for the track channel, standing on
  // their lower edge round the plugs, on the roll line (trackPlan), stopping at the grip holes it meets.
  function plugs(p, D) {
    const r = G.pap_d / 2, h = G.pap_depth + 0.3;
    const plug = (x, y) => T(T(Manifold.union([T(Manifold.cylinder(0.5, r - 0.5, r, G.seg_hole)), T(T(Manifold.cylinder(h - 0.5, r, r, G.seg_hole)).translate([0, 0, 0.5]))])).translate([x, y, 0]));
    const parts = [];
    if (p.pap_ring) {
      const R = p.ball_d / 2, rIn = G.ring_r - G.ring_w / 2, rOut = G.ring_r + G.ring_w / 2;
      const dPlane = Math.sqrt(R * R - rOut * rOut) - G.ring_depth;
      const prism = T(T(Manifold.cylinder(20, rOut, rOut, G.seg_sphere)).subtract(T(T(Manifold.cylinder(22, rIn, rIn, G.seg_sphere)).translate([0, 0, -1]))));
      // a finer sphere than the ball's: on a 3 mm thick ring the facet sag of 128 segments (0.03 mm) is 1% of the part
      const one = T(prism.intersect(T(T(Manifold.sphere(R, 2 * G.seg_sphere)).translate([0, 0, -dPlane]))));
      const off = rOut + 2;
      parts.push(T(one.translate([-off, 0, 0])), T(one.translate([off, 0, 0])), plug(0, 40), plug(0, -40));
    } else parts.push(plug(-G.pap_d, 0), plug(G.pap_d, 0));
    let trackInfo = null;
    if (p.pap_track) {
      // the arcs are the belt the channel holds, cut on the ball itself (the flat and the holes the ring
      // runs through cut them exactly as they cut the channel), then brought back to
      // the bed: the ball's placement undone so the axis points up, the belt stood on its lower rim with
      // a small flat foot cut (its rim is a cone, so the inner corner is the lowest point), split at
      // the ring's two side points with a gap. Pieces too small to print are dropped.
      const R = p.ball_d / 2;
      const s = p.ball_flat > 0 ? R - Math.sqrt(Math.max(0, R * R - (p.ball_flat / 2) ** 2)) : 0, H = 2 * R - s, C = [0, 0, R - s];
      const yM = p.thumb_hole ? D.y_m : 0, yR = p.thumb_hole ? D.y_r : 0;
      const thumb = p.thumb_hole ? drill(0, -D.ty, D.td, p.ball_thumb_depth, p.thumb_fwd, p.thumb_lat, H, false, D.mir, +1, R, { ...ovalOpts(p, 'thumb'), oval: D.ovT }) : null;
      const mid = drill(D.x_m, yM, D.md, p.finger_depth, p.middle_fwd, p.middle_lat, H, false, D.mir, -1, R, { ...ovalOpts(p, 'finger'), oval: D.ovM });
      const ring = drill(D.x_r, yR, D.rd, p.finger_depth, p.ring_fwd, p.ring_lat, H, false, D.mir, -1, R, { ...ovalOpts(p, 'finger'), oval: D.ovR });
      const { d, dirOf } = papDirection(p, D, thumb, mid, ring, C);
      const b = Math.acos(V.clamp1(d[2])) / DEG, c = Math.atan2(d[1], d[0]) / DEG;
      const plan = trackPlan(p, D, thumb, mid, ring, dirOf, d, R, s, G.track_w + p.print_allowance);
      trackInfo = { angle_deg: +(plan.theta / DEG).toFixed(1), crosses: plan.crosses };
      const betaA = (G.track_w / 2) / R;
      const shell = T(T(Manifold.sphere(R, 2 * G.seg_sphere)).subtract(T(Manifold.sphere(R - G.track_depth, 2 * G.seg_sphere))));
      const beltWorld = T(T(T(zoneSlab(R, plan.theta, betaA).intersect(shell)).rotate([0, b, c])).translate(C));
      const keep = T(T(Manifold.cube([2 * R + 2, 2 * R + 2, H + 1], true)).translate([0, 0, (H + 1) / 2]));
      const holes = [mid.cut, ring.cut]; if (thumb) holes.push(thumb.cut);
      const onBall = T(T(beltWorld.intersect(keep)).subtract(T(Manifold.union([...holes, ...plan.guards]))));
      const framed = T(T(T(onBall.translate([-C[0], -C[1], -C[2]])).rotate([0, 0, -c])).rotate([0, -b, 0]));
      const phiLow = plan.theta + betaA;                                          // the lower rim's polar angle
      const zLow = Math.min(R * Math.cos(phiLow), (R - G.track_depth) * Math.cos(phiLow));
      const foot = Math.min(G.track_foot, 0.75 * G.track_depth * Math.abs(Math.cos(phiLow)));   // never more than 3/4 of the rim's drop; nothing on a great circle
      const above = T(T(Manifold.cube([2 * R + 20, 2 * R + 20, 2 * R], true)).translate([0, 0, R + foot]));
      const stood = T(T(T(framed.translate([0, 0, -zLow])).intersect(above)).translate([0, 0, -foot]));
      const gap = T(Manifold.cube([2 * R + 12, G.track_gap, 2 * R + 20], true));
      const arcs = T(stood.subtract(gap));
      for (const piece of arcs.decompose()) { if (piece.volume() >= 150) parts.push(T(piece)); else piece.delete(); }
    }
    const result = T(Manifold.union(parts));
    return { result, warnings: [], axes: [], pap: trackInfo ? { track: trackInfo } : null };
  }

  // engraved 7-segment labels for the sizer plate (no font needed)
  const SEG7 = { 'F': 'afge', 'S': 'afgcd', '-': 'g', '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd',
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
  // text engraved `depth` into a face at height z0: a top face (up=false, cut downward from z0) or a
  // bottom face (up=true, cut upward from z0, mirrored so it reads right when the part is turned over)
  function label(text, x, y, depth, z0 = G.sizer_t, up = false, scale = 1) {
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
    const all0 = CrossSection.union(glyphs);
    glyphs.forEach(c => c.delete());
    const all = all0.scale([up ? -scale : scale, scale]); all0.delete();
    const m = T(T(Manifold.extrude(all, depth + 1)).translate([x, y, up ? z0 - 1 : z0 - depth]));
    all.delete();
    return m;
  }
  // the order number (or any FS-/digit text) engraved 0.5 mm into the flat base of a part
  const textWidth = (t) => [...t].reduce((w, ch) => w + (ch === '.' ? DOT_W : CH_W), 0) + GAP * (t.length - 1);
  function serialCut(p, x, y, scale = 1, maxWidth = Infinity) {
    const t = String(p.serial || '').toUpperCase();
    if (!t || !SERIAL_RE.test(t)) return null;
    return label(t, x, y, 0.5, 0, true, Math.min(scale, maxWidth / textWidth(t)));   // long numbers shrink to the room there is
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

  // Release gate: a base segment that links to its neighbours with a dovetail across the tape line,
  // and a loose pin standing in a shallow cup on it. The ball knocks over the pin where it crosses:
  // the clack is the release feedback. One STL holds one segment and one pin; print 3 or 5 copies.
  // Pins sit ball_d + gate_gap apart, so the ball never reaches more than two neighbours.
  function gate(p) {
    const L = p.ball_d + G.gate_gap, w = G.gate_w, t = G.gate_t, c = G.gate_clear;
    const slope = (G.gate_dove_w2 - G.gate_dove_w1) / 2 / G.gate_dove_len;   // half-width gained per mm along a dovetail
    const trap = (x0, x1, w0, w1) => CrossSection.ofPolygons([[[x0, -w0 / 2], [x1, -w1 / 2], [x1, w1 / 2], [x0, w0 / 2]]]);
    const body = T(T(Manifold.cube([L, w, t], true)).translate([0, 0, t / 2]));
    // dovetail tab on the +X end (starts 0.5 mm inside the body so the two fuse)
    const tabCS = trap(L / 2 - 0.5, L / 2 + G.gate_dove_len, G.gate_dove_w1 - 2 * slope * 0.5, G.gate_dove_w2);
    const tab = T(Manifold.extrude(tabCS, t)); tabCS.delete();
    // the matching slot in the -X end, with clearance, open through the end face
    const slotCS = trap(-L / 2 - 1, -L / 2 + G.gate_dove_len + c, G.gate_dove_w1 + 2 * c - 2 * slope, G.gate_dove_w2 + 2 * c);
    const slot = T(T(Manifold.extrude(slotCS, t + 2)).translate([0, 0, -1])); slotCS.delete();
    // shallow cup the pin stands in, with a 45 degree lead-in, and a groove across the top to line up with the tape
    const cupR = G.gate_pin_d / 2 + G.gate_cup_clear / 2;
    const cup = T(T(Manifold.cylinder(G.gate_cup_depth + 1, cupR, cupR, G.seg_hole)).translate([0, 0, t - G.gate_cup_depth]));
    const lead = T(T(Manifold.cylinder(1.0, cupR, cupR + 1.0, G.seg_hole)).translate([0, 0, t - 1.0]));
    const groove = T(T(Manifold.cube([1.0, w + 2, 1.2], true)).translate([0, 0, t]));
    const segment = T(T(body.add(tab)).subtract(T(Manifold.union([slot, cup, lead, groove]))));
    // the pin, standing beside the segment: a chamfered foot so it tips out of the cup, a chamfered top
    const r = G.gate_pin_d / 2, h = p.gate_pin_h;
    const foot = T(Manifold.cylinder(1, r - 1, r, G.seg_hole));
    const shaft = T(T(Manifold.cylinder(h - 3, r, r, G.seg_hole)).translate([0, 0, 1]));
    const top = T(T(Manifold.cylinder(2, r, r - 2, G.seg_hole)).translate([0, 0, h - 2]));
    const pin = T(T(Manifold.union([foot, shaft, top])).translate([0, w / 2 + 20, 0]));
    const result = T(segment.add(pin));
    return { result, warnings: [], axes: [], gate: { spacing_mm: L, pin_h_mm: h, pin_d_mm: G.gate_pin_d } };
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
    const rMax = p.part === 'ball' && !p.thumb_hole ? Math.max(Math.abs(D.x_m), Math.abs(D.x_r)) : Math.max(Math.hypot(0, D.ty), Math.hypot(D.x_m, D.y_m), Math.hypot(D.x_r, D.y_r));
    if (p.part === 'puck' && rMax > 92)
      // holes must sit on the part: a hole centre beyond ~92 mm from the axis is off the ball section
      throw new FitError('These spans do not fit on the 8.5-inch ball section: a hole would sit off its edge. Check both spans, and that they are in the right units.');
    if (p.part === 'ball' && rMax > 0.8 * p.ball_d / 2)
      throw new FitError(`A ${fmtMm(p.ball_d)} mm ball is too small for these spans: the holes would sit on its sides. Use a bigger ball diameter (${fmtMm(Math.ceil(rMax / 0.4 / 10) * 10)} mm or more) or check the spans.`);
    try {
      const out = p.part === 'puck' ? puck(p, D) : p.part === 'spinner' ? spinner(p, D) : p.part === 'ball' ? ball(p, D) : p.part === 'gate' ? gate(p) : p.part === 'plugs' ? plugs(p, D) : sizer(p);
      const m = out.result;
      if (!(m.volume() > (p.part === 'plugs' ? 100 : 1000))) throw new FitError('The model came out empty. Check the hole sizes and spans.');
      const bb = m.boundingBox();
      let colorParts = null;
      if (out.colorSpans && out.colorSpans.length) {
        // the ball as one part per colour (what the two-colour 3MF carries): base = ball minus the
        // second-colour slabs, second = ball within them
        const big = 2 * (p.ball_d || 300) + 40;
        const slabList = out.colorSpans.map(([z0, z1]) => T(T(Manifold.cube([big, big, z1 - z0], true)).translate([0, 0, (z0 + z1) / 2])));
        const slabs = slabList.length === 1 ? slabList[0] : T(Manifold.union(slabList));
        colorParts = [{ name: 'base colour', extruder: 1, mesh: meshOf(T(m.subtract(slabs))) }, { name: 'second colour', extruder: 2, mesh: meshOf(T(m.intersect(slabs))) }];
      }
      return {
        mesh: meshOf(m),
        colorParts,
        pattern: out.pattern || null,
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
        gate: out.gate || null,
        pap: out.pap || null,
        hum: out.hum || null,
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
// A two-colour 3MF in the layout Bambu Studio writes: one object made of a part per colour, each part
// assigned a filament in Metadata/model_settings.config, placed at the centre of a 256 mm plate. Opens
// in Bambu Studio already coloured; other slicers read it as a plain multi-part 3MF.
function toBambu3MF(parts, name) {
  const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const f = (v) => String(+v.toFixed(6));   // full precision: Manifold's booleans leave vertices microns apart, and merging them would open the mesh
  let res = '', comps = '', cfgParts = '';
  parts.forEach((pt, i) => {
    const id = 2 + i, { pos, idx } = pt.mesh;
    const v = new Array(pos.length / 3), t = new Array(idx.length / 3);
    for (let k = 0; k < pos.length; k += 3) v[k / 3] = `     <vertex x="${f(pos[k])}" y="${f(pos[k + 1])}" z="${f(pos[k + 2])}"/>`;
    for (let k = 0; k < idx.length; k += 3) t[k / 3] = `     <triangle v1="${idx[k]}" v2="${idx[k + 1]}" v3="${idx[k + 2]}"/>`;
    res += `  <object id="${id}" type="model">\n   <mesh>\n    <vertices>\n${v.join('\n')}\n    </vertices>\n    <triangles>\n${t.join('\n')}\n    </triangles>\n   </mesh>\n  </object>\n`;
    comps += `    <component objectid="${id}" transform="1 0 0 0 1 0 0 0 1 0 0 0"/>\n`;
    cfgParts += `    <part id="${id}" subtype="normal_part">\n      <metadata key="name" value="${esc(pt.name)}"/>\n      <metadata key="matrix" value="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1"/>\n      <metadata key="source_file" value="${esc(name)}.3mf"/>\n      <metadata key="extruder" value="${pt.extruder}"/>\n    </part>\n`;
  });
  const objId = 2 + parts.length;
  const model = `<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:BambuStudio="http://schemas.bambulab.com/package/2021">\n <metadata name="Application">BambuStudio-01.10.01.50</metadata>\n <metadata name="BambuStudio:3mfVersion">1</metadata>\n <metadata name="Title">${esc(name)}</metadata>\n <resources>\n${res}  <object id="${objId}" type="model">\n   <components>\n${comps}   </components>\n  </object>\n </resources>\n <build>\n  <item objectid="${objId}" transform="1 0 0 0 1 0 0 0 1 128 128 0" printable="1"/>\n </build>\n</model>\n`;
  const config = `<?xml version="1.0" encoding="UTF-8"?>\n<config>\n  <object id="${objId}">\n    <metadata key="name" value="${esc(name)}"/>\n    <metadata key="extruder" value="1"/>\n${cfgParts}  </object>\n  <plate>\n    <metadata key="plater_id" value="1"/>\n    <metadata key="plater_name" value=""/>\n    <metadata key="locked" value="false"/>\n    <model_instance>\n      <metadata key="object_id" value="${objId}"/>\n      <metadata key="instance_id" value="0"/>\n      <metadata key="identify_id" value="${objId}"/>\n    </model_instance>\n  </plate>\n</config>\n`;
  const types = `<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>\n</Types>\n`;
  const rels = `<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n <Relationship Target="/3D/3dmodel.model" Id="rel-1" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>\n</Relationships>\n`;
  const enc = new TextEncoder();
  return zipStore([{ name: '[Content_Types].xml', data: enc.encode(types) }, { name: '_rels/.rels', data: enc.encode(rels) }, { name: '3D/3dmodel.model', data: enc.encode(model) }, { name: 'Metadata/model_settings.config', data: enc.encode(config) }]);
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
  if (p.part === 'gate') return `release_gate_${(p.ball_d + G.gate_gap).toFixed(0)}mm_pin${p.gate_pin_h.toFixed(0)}`;
  if (p.part === 'plugs') return (p.pap_ring ? `axis_inlays_D${G.pap_d}_ring${2 * G.ring_r}` : `axis_plugs_D${G.pap_d}`) + (p.pap_track ? `_track${G.track_w}` : '');
  const part = p.part === 'ball' ? `ball${p.ball_d.toFixed(0)}` : p.part === 'spinner' && p.spin_hum ? `spinner_hum${p.spin_hum_slots}` : p.part;
  if (p.part === 'ball' && p.thumb_hole === false) return `rev_${part}_${p.hand[0].toUpperCase()}_nothumb_M${mm(D.md)}_R${mm(D.rd)}`;
  return `rev_${part}_${p.hand[0].toUpperCase()}_span${mm(p.span_middle)}-${mm(p.span_ring)}_T${mm(D.td)}_M${mm(D.md)}_R${mm(D.rd)}`;
}

function fitSheet(p, D, data) {
  const sheet = { app: APP_NAME, version: APP_VERSION, units: { lengths: 'mm', pitches: 'inches' } };
  for (const k of Object.keys(DEFAULTS)) sheet[k] = p[k];
  sheet.modeled = {
    thumb_bore_mm: +D.td.toFixed(3), middle_bore_mm: +D.md.toFixed(3), ring_bore_mm: +D.rd.toFixed(3),
    print_allowance_mm: p.part === 'sizer' ? 0 : p.print_allowance,
    thumb_bore_in: fraction64(D.td / IN), middle_bore_in: fraction64(D.md / IN), ring_bore_in: fraction64(D.rd / IN),
    // oval holes: the long way across as modeled (sheet oval size + print allowance)
    ...(D.ovT > 0 ? { thumb_oval_mm: +(D.td + D.ovT).toFixed(3) } : {}),
    ...(D.ovM > 0 ? { middle_oval_mm: +(D.md + D.ovM).toFixed(3) } : {}),
    ...(D.ovR > 0 ? { ring_oval_mm: +(D.rd + D.ovR).toFixed(3) } : {}),
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
    for (const k of ANGLE_KEYS) { const el = $(k); if (el) el.value = String(state[k]); }
    $('serial').value = state.serial || '';
    $('hand').value = state.hand;
    $('ball_stripe').value = state.ball_stripe;
    $('ball_thumb_rows').hidden = !state.thumb_hole;
    $('pap_rows').hidden = !state.pap_marker;
    $('pap_over').disabled = $('pap_up').disabled = !state.pap_given;
    $('hum_rows').hidden = !state.spin_hum;
    $('spin_hum_slots').value = String(state.spin_hum_slots);
    $('spin_hum_angle').value = String(state.spin_hum_angle);
    $('track_tilt').value = String(state.track_tilt);
    $('track_tilt').disabled = !state.pap_track;
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
  for (const k of ANGLE_KEYS) {
    const el = $(k);
    el.addEventListener('change', () => {
      const v = parseNumber(el.value.replace(/[°]/g, ''));
      if (Number.isFinite(v) && Math.abs(v) <= 90) { state[k] = v; markGood(el); schedule(); }
      else markBad(el, 'Oval angle must be a number of degrees between -90 and 90.');
    });
  }
  $('spin_hum_slots').addEventListener('change', () => {
    const el = $('spin_hum_slots'), v = parseNumber(el.value);
    if (Number.isInteger(v) && v >= HUM_SLOTS[0] && v <= HUM_SLOTS[1]) { state.spin_hum_slots = v; markGood(el); schedule(); }
    else markBad(el, `Hum slots: a whole number from ${HUM_SLOTS[0]} to ${HUM_SLOTS[1]}.`);
  });
  $('track_tilt').addEventListener('change', () => {
    const el = $('track_tilt'), v = parseNumber(el.value.replace(/[\u00b0]/g, ''));
    if (Number.isFinite(v) && v >= TRACK_TILT[0] && v <= TRACK_TILT[1]) { state.track_tilt = v; markGood(el); schedule(); }
    else markBad(el, `Axis tilt must be a number of degrees between ${TRACK_TILT[0]} and ${TRACK_TILT[1]}.`);
  });
  $('spin_hum_angle').addEventListener('change', () => {
    const el = $('spin_hum_angle'), v = parseNumber(el.value.replace(/[°]/g, ''));
    if (Number.isFinite(v) && v >= HUM_ANGLE[0] && v <= HUM_ANGLE[1]) { state.spin_hum_angle = v; markGood(el); schedule(); }
    else markBad(el, `Hum slot angle must be a number of degrees between ${HUM_ANGLE[0]} and ${HUM_ANGLE[1]}.`);
  });
  $('serial').addEventListener('change', () => {
    const el = $('serial'); const v = el.value.trim().toUpperCase();
    if (SERIAL_RE.test(v)) { state.serial = v; el.value = v; markGood(el); schedule(); }
    else markBad(el, 'Engraved text can only use digits, F, S and a dash (up to 12 characters).');
  });
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
    $(k).addEventListener('change', (e) => {
      state[k] = e.target.checked;
      if (k === 'thumb_through') $('thumb_depth_row').hidden = state.thumb_through;
      if (k === 'thumb_hole') $('ball_thumb_rows').hidden = !state.thumb_hole;
      if (k === 'pap_marker') $('pap_rows').hidden = !state.pap_marker;
      if (k === 'pap_given') {
        // without a PAP on the sheet the ball uses the forward-roll axis, and the fields show it
        if (!state.pap_given) { state.pap_over = DEFAULTS.pap_over; state.pap_up = DEFAULTS.pap_up; markGood($('pap_over')); markGood($('pap_up')); showLengths(); }
        $('pap_over').disabled = $('pap_up').disabled = !state.pap_given;
      }
      if (k === 'spin_hum') $('hum_rows').hidden = !state.spin_hum;
      if (k === 'pap_track') $('track_tilt').disabled = !state.pap_track;
      schedule();
    });
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

  let noDirect = false;   // viewer mode: only the bundle can be saved
  function showStats(data) {
    const D = data.derived, p = state;
    $('save_3mf').hidden = noDirect || !data.colorParts;
    $('save_bundle').textContent = noDirect ? 'Download STL bundle (.zip)' : data.colorParts ? 'Download bundle (.zip: STL + 3MF + fit sheet)' : 'Download bundle (.zip: STL + fit sheet)';
    const infill = parseFloat($('infill').value);
    const shell = Math.min(data.volume, data.area * (p.part === 'ball' ? 1.8 : 1.6));   // 4 walls on the ball
    const grams = (shell + (data.volume - shell) * infill) * 1.27 / 1000;
    $('stat_size').textContent = `${data.bbox.map(v => v.toFixed(0)).join(' × ')} mm`;
    $('stat_weight').textContent = `≈ ${Math.round(grams / 5) * 5} g`;
    $('stat_volume').textContent = `${(data.volume / 1000).toFixed(0)} cm³ · ${data.tris.toLocaleString()} triangles`;
    const rows = [];
    if (p.part === 'gate') {
      $('bores').innerHTML = '';
      $('bores_note').textContent = `One segment and one pin per file: print 3 or 5 copies. Linked segments put the pins ${fmtMm(p.ball_d + G.gate_gap, 0)} mm apart (ball diameter + 10 mm); the pins are ${fmtMm(p.gate_pin_h, 0)} mm tall and stand loose in the cups.`;
    } else if (p.part === 'plugs') {
      $('bores').innerHTML = '';
      $('bores_note').textContent = (p.pap_ring
        ? `Two ${G.pap_d} mm plugs and two ${2 * G.ring_r} mm rings for the ball's axis target. Print them in the second colour, flat side down, 100% infill, and press them into the sockets and ring pockets (a drop of glue if a ring is loose).`
        : `Two ${G.pap_d} mm plugs for the ball's axis target dots. Print them in the second colour, flat side down, and press them into the sockets.`)
        + (p.pap_track ? ` The two arcs are the track ring: they print standing on edge as exported (use a brim). They stand on their lower edge as exported (no supports; a brim helps). Glue them into the channel and sand flush; where the ring runs through a grip hole that arc comes in pieces, so dry-fit them first.` : '');
    } else if (p.part !== 'sizer') {
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
  // kind: 'stl' (the model), '3mf' (the two-colour ball, parts with filaments 1 and 2 assigned) or 'bundle'
  // (a zip with the STL, the 3MF when there is one, and the fit sheet)
  async function saveSTL(kind) {
    if (kind === true) kind = 'bundle'; else if (!kind) kind = 'stl';
    await settle();
    if (invalid.size) { setStatus(`Not saved. ${invalidMessage()}`, 'error'); return; }
    if (!current) { setStatus('Nothing to save: the model could not be built. Fix the message above first.', 'error'); return; }
    const D = current.derived, base = fileBase(state, D);
    const stl = toSTL(current.mesh, `${base} - ${APP_NAME} ${APP_VERSION}`);
    const sheet = new TextEncoder().encode(JSON.stringify(fitSheet(state, D, current), null, 2));
    const threeMF = current.colorParts ? toBambu3MF(current.colorParts, base) : null;
    if (kind === '3mf' && !threeMF) { setStatus('No 3MF for this part: only a ball with a second-colour pattern has one.', 'error'); return; }
    const bundleFiles = [{ name: `${base}.stl`, data: stl }, ...(threeMF ? [{ name: `${base}.3mf`, data: threeMF }] : []), { name: `${base}.fit_sheet.json`, data: sheet }];
    const dl = await downloads;
    if (dl) {
      // the claude.ai viewer saves zip (not stl): bundle the STL with its fit sheet
      const zip = zipStore(bundleFiles);
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
    if (kind === 'bundle') blobSave(`${base}.zip`, zipStore(bundleFiles), 'application/zip');
    else if (kind === '3mf') blobSave(`${base}.3mf`, threeMF, 'model/3mf');
    else blobSave(`${base}.stl`, stl, 'model/stl');
    setStatus(`Saved ${base}.${kind === 'bundle' ? 'zip' : kind}`, 'ok');
  }
  $('save_stl').addEventListener('click', () => saveSTL('stl'));
  $('save_3mf').addEventListener('click', () => saveSTL('3mf'));
  $('save_bundle').addEventListener('click', () => saveSTL('bundle'));
  downloads.then(dl => {
    if (dl || inArtifact) { $('save_stl').hidden = true; $('save_3mf').hidden = true; noDirect = true; $('save_bundle').textContent = 'Download STL bundle (.zip)'; $('save_hint').textContent = 'The zip holds the .stl and a fit sheet .json. Unzip and open the .stl in your slicer.'; }
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
    // load a whole sheet: keys the sheet lacks (an order saved by an older version) go back to the
    // defaults instead of keeping whatever the previous customer left on screen
    setState(obj) {
      for (const k of Object.keys(DEFAULTS)) state[k] = obj && k in obj ? obj[k] : JSON.parse(JSON.stringify(DEFAULTS[k]));
      showAll(); schedule();
    },
    // change some fields, keep the rest
    patchState(obj) {
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
        if (part === 'plugs' && !p.pap_marker) continue;   // no dots on the ball, so no plugs to print
        const data = builder.build(p);
        const base = fileBase(p, data.derived);
        files.push({ name: `${base}.stl`, data: toSTL(data.mesh, `${base} - ${APP_NAME} ${APP_VERSION}`), part });
        if (part === 'ball' && data.colorParts) files.push({ name: `${base}.3mf`, data: toBambu3MF(data.colorParts, base), part });
        data.warnings.forEach(w => warnings.push(`${part}: ${w}`));
        (data.notes || []).forEach(t => notes.push(`${part}: ${t}`));
        axes[part] = data.axes.map(a => ({ name: a.name, p: a.p, dir: a.dir }));
        // the ball is sliced with 4 walls and 8% gyroid infill (a drop onto a floor must not crack it),
        // the other parts with 4 walls and 20%
        const infill = part === 'ball' ? 0.08 : 0.2;
        const shell = Math.min(data.volume, data.area * (part === 'ball' ? 1.8 : 1.6));
        const grams = Math.round(((shell + (data.volume - shell) * infill) * 1.27 / 1000) / 5) * 5;
        stats.push({ part, volume_cm3: +(data.volume / 1000).toFixed(1), bbox_mm: data.bbox.map(v => +v.toFixed(1)),
          grams, infill_pct: infill * 100, grams_20pct: grams, color_changes: data.colorChanges, pattern: data.pattern, gate: data.gate, pap: data.pap, hum: data.hum });
        if (!sheet) sheet = fitSheet(p, data.derived, data);
      }
      return { files, warnings, notes, stats, axes, fitSheet: sheet };
    },
  };
}

main().catch(e => { console.error(e); const s = document.getElementById('status'); if (s) { s.textContent = 'The geometry engine failed to start: ' + e.message; s.dataset.kind = 'error'; } });
