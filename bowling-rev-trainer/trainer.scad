// =====================================================================
// Bowling Rev Trainer — one-handed, thumb-in
// Two printable parts:
//   "puck"    — slice of a regulation ball surface with thumb + fingertip
//               holes at YOUR span. Trains fingertip grip strength and
//               clean, early thumb exit.
//   "spinner" — fingers-only disc. Isolates the finger lift / "flick"
//               that creates revs. Spin it on carpet and count rotations.
//
// Open in OpenSCAD, set the Fit parameters to match your ball, render,
// export STL. All dimensions in mm.
// =====================================================================

/* [Part] */
// Which part to render ("sizer" is a quick test plate for finding your hole sizes)
part = "puck"; // [puck, spinner, sizer, both]

/* [Fit — copy from your ball] */
// Bowling hand (mirrors the finger-hole layout)
hand = "right"; // [right, left]
// Middle-finger span: NEAR edge of thumb hole to NEAR edge of middle-finger hole (straight line). Typical fingertip span 105–125.
span_middle = 110;
// Ring-finger span. Usually 2–4 shorter than the middle span.
span_ring = 110;
// Thumb hole diameter. Real holes run 22–28.5 (7/8"–1 1/8"). Add ~0.5 print allowance; sand/tape to final fit.
thumb_d = 26;
// Middle-finger hole diameter. Real holes run 19–23 (3/4"–29/32").
middle_d = 21.5;
// Ring-finger hole diameter. Often a half size (0.4) smaller than the middle.
ring_d = 21.5;
// Web of plastic between the two finger holes
bridge = 7;
// Finger hole depth — fingertip grip inserts to the first joint
finger_depth = 24;

/* [Pitches — copy your drill sheet, in inches] */
// Pitch here works exactly like a pro-shop drill sheet: 0 means the
// bore aims at the ball's center; forward/reverse and lateral are the
// usual inch offsets (1/8 = 0.125, 1/4 = 0.25, 3/8 = 0.375 ...).
// Thumb forward(+) / reverse(−) pitch. A touch of reverse helps the quick, clean exit.
thumb_fwd = -0.125;
// Thumb lateral pitch. + = toward your bowling-hand side (right lateral for a righty).
thumb_lat = 0;
// Middle finger forward(+) / reverse(−) pitch. Fingertip grips typically run 1/4–3/8 forward.
middle_fwd = 0.3125;
// Middle finger lateral pitch (+ = toward bowling-hand side)
middle_lat = 0;
// Ring finger forward(+) / reverse(−) pitch
ring_fwd = 0.3125;
// Ring finger lateral pitch (+ = toward bowling-hand side)
ring_lat = 0;

/* [Body] */
// Regulation ball radius (8.5" dia = 108). Don't change unless you want a different surface curvature.
ball_R = 108;
// Puck height at center
puck_h = 60;
// Puck width (across the finger holes)
puck_w = 140;
// Wall left beyond the holes at each end of the puck
end_wall = 10;
// Spinner diameter
spin_d = 100;
// Spinner height at center
spin_h = 38;

/* [Options] */
// Pocket in the puck base for stacked coins/washers (progressive loading). Tape over when filled.
weight_pocket = true;
// Pocket diameter (30 fits US quarters / M20 washers loosely)
pocket_d = 30;
// Pocket depth (straight section)
pocket_depth = 16;
// Wrist-cord tunnel through both parts (use paracord so the trainer can't fly away during swing drills)
lanyard = true;
// Lanyard tunnel diameter
lanyard_d = 7;
// Chamfer on every hole rim (comfort)
rim_chamfer = 3;

/* [Hidden] */
$fa = 2;
$fs = 0.6;
eps = 0.01;

// Looking at the grip from outside (thumb hole at the bottom), a right
// hander's middle finger sits on the right, ring on the left.
mir = (hand == "right") ? 1 : -1;
// Finger hole lateral offsets (inner edges stay `bridge` apart)
x_m =  mir*(middle_d + bridge)/2;
x_r = -mir*(ring_d  + bridge)/2;
// Center-to-center distances from the thumb hole, per finger
cc_m = span_middle + thumb_d/2 + middle_d/2;
cc_r = span_ring   + thumb_d/2 + ring_d/2;
// Thumb sits centered below the origin
ty = (cc_m + cc_r)/4;
// Finger hole positions honoring each finger's own span
y_m = -ty + sqrt(cc_m*cc_m - x_m*x_m);
y_r = -ty + sqrt(cc_r*cc_r - x_r*x_r);
// Puck footprint extents auto-size to the grip
ext_s = ty + thumb_d/2 + end_wall;
ext_n = max(y_m + middle_d/2, y_r + ring_d/2) + end_wall;

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

// Rounded footprint stretched to the grip's (possibly asymmetric) extents
module footprint(w) {
    hull() {
        translate([0, -(ext_s - w/2)]) circle(d = w);
        translate([0,   ext_n - w/2]) circle(d = w);
    }
}

// Height of the ball surface above z=0 at radius r from the part axis,
// for a part whose center height is h.
function surf_z(h, x, y) = h - ball_R + sqrt(ball_R*ball_R - x*x - y*y);

// Drill a gripping hole into a ball-surface body of center height body_h.
// The bore axis runs from the surface point above (x, y) through an AIM POINT
// near the ball's center C. A zero-pitch bore aims exactly at C (how a real
// ball is drilled), so thumb and fingers oppose each other around the
// curvature. Pitch is the drill sheet's inch offset of the aim point from C:
//   fwd_in > 0  forward: toward the grip center. The inner end of the hole
//               leans toward the fingers for the thumb and toward the thumb
//               for the fingers; negative is reverse.
//   lat_in > 0  lateral toward the bowling-hand side (mirrored for lefties).
// fdir is +1 for the thumb and -1 for the fingers.
// Depth is measured along the bore axis from the surface.
module drill(x, y, d, depth, fwd_in, lat_in, body_h, fdir, through = false) {
    zs     = surf_z(body_h, x, y);
    aim    = [lat_in*25.4*mir, fwd_in*25.4*fdir, body_h - ball_R];
    inward = aim - [x, y, zs];
    out    = -inward / norm(inward);                       // outward unit vector
    translate([x, y, zs])
    rotate([0, acos(out[2]), atan2(out[1], out[0])]) {     // maps +Z onto `out`
        // bore (local -Z is into the body)
        translate([0, 0, through ? -130 : -depth])
            cylinder(d = d, h = through ? 165 : depth + 35);
        // rim chamfer: the axis is near the surface normal, so this cuts
        // an even, comfortable ring
        translate([0, 0, -rim_chamfer])
            cylinder(d1 = d, d2 = d + 2*rim_chamfer + 8, h = rim_chamfer + 6);
    }
}

// Horizontal through-tunnel along X with a self-supporting teardrop roof
module xtunnel(y, z, d, len) {
    hull() {
        translate([0, y, z]) rotate([0, 90, 0])
            cylinder(d = d, h = len, center = true);
        translate([0, y, z + d*0.75])
            cube([len, 0.8, 0.1], center = true);
    }
}

// Bottom pocket with a shallow cone roof (prints without supports)
module pocket(x, y) {
    translate([x, y, -eps]) {
        cylinder(d = pocket_d, h = pocket_depth);
        translate([0, 0, pocket_depth - eps])
            cylinder(d1 = pocket_d, d2 = 4, h = pocket_d*0.42);
    }
}

// ---------------------------------------------------------------------
// Rev puck — grip + thumb-exit trainer
// ---------------------------------------------------------------------
module rev_puck() {
    difference() {
        // slice of the ball: sphere top, flat bottom, rounded outline
        intersection() {
            translate([0, 0, puck_h - ball_R]) sphere(r = ball_R);
            linear_extrude(puck_h + 1) footprint(puck_w);
        }

        // thumb: through bore (thumb seats fully, tip may peek out the bottom)
        drill(0, -ty, thumb_d, 0, thumb_fwd, thumb_lat, puck_h, +1, through = true);

        // fingers: blind fingertip holes, each at its own span, size, pitch
        drill(x_m, y_m, middle_d, finger_depth, middle_fwd, middle_lat, puck_h, -1);
        drill(x_r, y_r, ring_d,   finger_depth, ring_fwd,   ring_lat,   puck_h, -1);

        if (lanyard)
            xtunnel(44, 10, lanyard_d, puck_w + 20);

        if (weight_pocket)
            pocket(0, 6);
    }
}

// ---------------------------------------------------------------------
// Rev spinner — release / lift trainer (fingers only)
// ---------------------------------------------------------------------
module rev_spinner() {
    difference() {
        intersection() {
            translate([0, 0, spin_h - ball_R]) sphere(r = ball_R);
            cylinder(d = spin_d, h = spin_h + 1);
        }

        // finger holes, drilled radially (zero pitch)
        drill(x_m, 0, middle_d, min(finger_depth, 20), 0, 0, spin_h, -1);
        drill(x_r, 0, ring_d,   min(finger_depth, 20), 0, 0, spin_h, -1);

        if (lanyard)
            xtunnel(-spin_d/2 + 18, 8, lanyard_d, spin_d + 20);

        // spin-indicator bars engraved in the base: when it spins on the
        // floor the flicker makes rev count easy to read
        for (a = [0, 90])
            rotate([0, 0, a])
                translate([0, 0, -eps])
                    cube([spin_d - 8, 4, 2.4], center = true);
    }
}

// ---------------------------------------------------------------------
// Hole sizer — fast test plate to find your exact hole sizes before
// printing the big parts. Insert each digit to the first joint; the
// right hole is snug all around with zero squeeze needed to hang on.
// ---------------------------------------------------------------------
sizer_finger = [20, 20.5, 21, 21.5, 22, 22.5];  // finger test bores
sizer_thumb  = [25, 25.5, 26, 26.5, 27];        // thumb test bores
sizer_t = 15;                                    // plate thickness

module sizer_row(sizes, y, pitch) {
    n = len(sizes);
    for (i = [0:n-1]) {
        x = (i - (n-1)/2) * pitch;
        translate([x, y, -1]) cylinder(d = sizes[i], h = sizer_t + 2);
        translate([x, y, sizer_t - 1.5])                     // rim chamfer
            cylinder(d1 = sizes[i], d2 = sizes[i] + 5, h = 1.6);
        translate([x, y + sizes[i]/2 + 3, sizer_t - 0.8])    // label
            linear_extrude(1)
                text(str(sizes[i]), size = 4.5, halign = "center",
                     font = "Liberation Sans:style=Bold");
    }
}

module hole_sizer() {
    pw = 175; ph = 92; r = 8;
    difference() {
        linear_extrude(sizer_t)
            offset(r) offset(-r) square([pw, ph], center = true);
        sizer_row(sizer_finger,  23, 27.5);
        sizer_row(sizer_thumb,  -23, 33);
    }
}

// ---------------------------------------------------------------------
if (part == "puck")    rev_puck();
if (part == "spinner") rev_spinner();
if (part == "sizer")   hole_sizer();
if (part == "both") {
    rev_puck();
    translate([puck_w/2 + spin_d/2 + 15, 0, 0]) rev_spinner();
}
