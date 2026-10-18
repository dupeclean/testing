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
// Which part to render
part = "puck"; // [puck, spinner, both]

/* [Fit — copy from your ball] */
// Span: NEAR edge of thumb hole to NEAR edge of finger holes (cut-to-cut), measured over the ball surface. Typical fingertip span 105–125.
span = 110;
// Thumb hole diameter. Real holes run 22–28.5 (7/8"–1 1/8"). Includes ~0.6 print allowance; sand/tape to final fit.
thumb_d = 26;
// Finger hole diameter. Real holes run 19–22 (3/4"–7/8").
finger_d = 21.5;
// Web of plastic between the two finger holes
bridge = 7;
// Finger hole depth — fingertip grip inserts to the first joint
finger_depth = 24;
// Finger forward pitch, degrees (+ tilts holes toward the thumb). 2–5 helps the fingertip "hook" feel.
finger_pitch = 4;
// Thumb reverse pitch, degrees (+ tilts away from fingers). A little reverse promotes a quick, clean thumb exit.
thumb_pitch = 3;

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

// Center-to-center distance, thumb hole to finger-hole pair
cc = span + thumb_d/2 + finger_d/2;
// Puck length auto-sizes to the span
puck_len = cc + thumb_d/2 + finger_d/2 + 2*end_wall;
// Finger hole lateral offsets
fx = (finger_d + bridge)/2;

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

// Stadium (oval) footprint, long axis along Y
module stadium(l, w) {
    hull()
        for (sy = [-1, 1])
            translate([0, sy*(l - w)/2]) circle(d = w);
}

// Height of the ball surface above z=0 at radius r from the part axis,
// for a part whose center height is h.
function surf_z(h, x, y) = h - ball_R + sqrt(ball_R*ball_R - x*x - y*y);

// Drill a gripping hole into a ball-surface body of center height body_h.
// The bore is aimed at the sphere's center — exactly how a zero-pitch
// hole is drilled on a real ball — so thumb and fingers oppose each
// other around the curvature. pitch > 0 is FORWARD pitch (tilts the
// bore toward the grip center); negative is reverse. Depth is measured
// along the bore axis from the surface.
module drill(x, y, d, depth, pitch, body_h, through = false) {
    r      = sqrt(x*x + y*y);
    zs     = surf_z(body_h, x, y);
    az     = atan2(y, x);            // azimuth of this hole
    tilt   = asin(r/ball_R);         // radial tilt from vertical
    teff   = tilt - pitch;           // forward pitch leans toward center
    translate([x, y, zs]) rotate([0, 0, az]) rotate([0, teff, 0]) {
        // bore (local -Z is into the body)
        translate([0, 0, through ? -130 : -depth])
            cylinder(d = d, h = through ? 165 : depth + 35);
        // rim chamfer — axis is near the surface normal, so this cuts
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
        // slice of the ball: sphere top, flat bottom, stadium outline
        intersection() {
            translate([0, 0, puck_h - ball_R]) sphere(r = ball_R);
            linear_extrude(puck_h + 1) stadium(puck_len, puck_w);
        }

        // thumb: through bore (thumb seats fully, tip may peek out the
        // bottom). Reverse pitch = negative forward pitch.
        drill(0, -cc/2, thumb_d, 0, -thumb_pitch, puck_h, through = true);

        // fingers: blind fingertip holes
        for (sx = [-1, 1])
            drill(sx*fx, cc/2, finger_d, finger_depth, finger_pitch, puck_h);

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
        for (sx = [-1, 1])
            drill(sx*fx, 0, finger_d, min(finger_depth, 20), 0, spin_h);

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
if (part == "puck")    rev_puck();
if (part == "spinner") rev_spinner();
if (part == "both") {
    rev_puck();
    translate([puck_w/2 + spin_d/2 + 15, 0, 0]) rev_spinner();
}
