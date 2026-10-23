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
part = "puck"; // [puck, ball, spinner, sizer, gate, plugs, both]

/* [Fit — copy from your ball] */
// Bowling hand (mirrors the finger-hole layout)
hand = "right"; // [right, left]
// Middle-finger span: NEAR edge of thumb hole to NEAR edge of middle-finger hole (straight line). Typical fingertip span 105–125.
span_middle = 110;
// Ring-finger span. Usually 2–4 shorter than the middle span.
span_ring = 110;
// Thumb hole diameter. Real holes run 22–28.5 (7/8"–1 1/8"). Add ~0.4 mm print allowance; sand/tape to final fit.
thumb_d = 26;
// Middle-finger hole diameter. Real holes run 19–23 (3/4"–29/32").
middle_d = 21.5;
// Ring-finger hole diameter. Often a half size (0.4) smaller than the middle.
ring_d = 21.5;
// Web of plastic between the two finger holes (about 1/2"; printed holes are finger-sized)
bridge = 12.7;
// Finger hole depth — fingertip grip inserts to the first joint
finger_depth = 24;

/* [Oval holes and bevels] */
// Thumb oval size: the LONG way across (0 = round). The thumb_d above is the short (drilled) size.
thumb_oval_d = 0;
// Where the thumb oval's long axis points: 0 = up the sheet (thumb-to-fingers line), + = toward the hand side
thumb_oval_angle = 0;
// Finger oval sizes (long way across, 0 = round) and angle (0 = toward the thumb)
middle_oval_d = 0;
ring_oval_d = 0;
finger_oval_angle = 0;
// Rounded edge on each hole (mm radius), like a pro-shop bevel
thumb_bevel = 4;
finger_bevel = 2.5;
// Text engraved 0.5 mm into the flat base (e.g. the order number); "" for none
serial = "";
// Ball only: false makes a two-handed / no-thumb ball
thumb_hole = true;

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

/* [Rev Ball] */
// Diameter of the release-trainer ball (200 fits a 256 mm printer; a regulation ball is 216)
ball_d = 200;
// Thumb hole depth in the ball (blind, the thumb seats fully)
ball_thumb_depth = 70;
// Small flat on the bottom so the ball stands on the print bed (0 = perfect sphere)
ball_flat = 30;
// Marker groove round the equator (for a single-colour ball)
ball_groove = false;
// Second-colour pattern made by filament swaps at exact heights: none, cap, cap_band, bands
ball_stripe = "cap_band"; // [none, cap, cap_band, bands]
// Axis target dots: two plug sockets at the axis the release should spin about (the bowler's PAP)
pap_marker = true;
// Axis point, measured along the surface from the grip centre (mm): over toward the hand side, up toward the fingers
pap_over = 139.7;   // 5 1/2"
pap_up = 12.7;      // 1/2"
// Socket diameter (add your print allowance) and depth; the plugs in part "plugs" match
pap_socket_d = 12; pap_depth = 3;

/* [Release gate] */
// Height of the loose pins that stand on the gate segments (the ball knocks one down)
gate_pin_h = 100;
// Fixed gate geometry (keep in sync with configurator/app.js G.gate_*)
gate_w = 40; gate_t = 6; gate_gap = 10; gate_pin_d = 20; gate_cup_depth = 1.5; gate_cup_clear = 1.0;
gate_dove_len = 12; gate_dove_w1 = 14; gate_dove_w2 = 20; gate_clear = 0.3;

/* [Humming spinner (experimental)] */
// Hollow ring chamber in the spinner with slanted slots through the top; hums once the spin is fast enough
spin_hum = false;
// Slots through the top (2 to 16)
spin_hum_slots = 8;
// Slot angle from radial, degrees (0 to 80); mirrored for a left hand
spin_hum_angle = 45;
// Fixed chamber geometry (keep in sync with configurator/app.js G.hum_*)
hum_r0 = 30; hum_r1 = 44; hum_z0 = 5; hum_z1 = 16; hum_slot_w = 2; hum_slot_l = 10;

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

// Looking at the grip from outside (thumb hole at the bottom, as a drill
// sheet is drawn), a right hander's fingers run index, middle, ring from the
// thumb side outward: the middle finger is the LEFT hole, the ring the RIGHT
// hole. A left hander is the mirror image. (+x is the viewer's right.)
mir = (hand == "right") ? 1 : -1;
// Oval holes reach further along their long axis: extra length per hole, and its share
// along the grip line (y) and across it (x)
ov_t = thumb_oval_d  > 0 ? max(0, thumb_oval_d  - thumb_d)  : 0;
ov_m = middle_oval_d > 0 ? max(0, middle_oval_d - middle_d) : 0;
ov_r = ring_oval_d   > 0 ? max(0, ring_oval_d   - ring_d)   : 0;
// An oval's long axis on the sheet is v = (mir*sin a, cos a): a = 0 points up the sheet, + turns it
// toward the bowling-hand side. A hole's reach along a unit direction u is its radius plus the
// oval's support along u.
function reach(d, ex, v, u) = d/2 + ex/2*abs(v[0]*u[0] + v[1]*u[1]);
function unit(v) = v / max(1e-9, norm(v));
v_t = [mir*sin(thumb_oval_angle),  cos(thumb_oval_angle)];
v_f = [mir*sin(finger_oval_angle), cos(finger_oval_angle)];
rm_x = reach(middle_d, ov_m, v_f, [1, 0]);
rr_x = reach(ring_d,   ov_r, v_f, [1, 0]);
// Finger hole lateral offsets (inner edges stay `bridge` apart)
x_m = -mir*(rm_x + bridge/2);
x_r =  mir*(rr_x + bridge/2);
// Spans are cut to cut along the line from the thumb centre to each finger centre, which is a few
// degrees off y. Lay out once along y, then measure the ovals' reach along the true centre lines.
cc_m1 = span_middle + reach(thumb_d, ov_t, v_t, [0, 1]) + reach(middle_d, ov_m, v_f, [0, 1]);
cc_r1 = span_ring   + reach(thumb_d, ov_t, v_t, [0, 1]) + reach(ring_d,   ov_r, v_f, [0, 1]);
u_m = unit([x_m, sqrt(max(0, cc_m1*cc_m1 - x_m*x_m))]);
u_r = unit([x_r, sqrt(max(0, cc_r1*cc_r1 - x_r*x_r))]);
// Center-to-center distances from the thumb hole, per finger
cc_m = span_middle + reach(thumb_d, ov_t, v_t, u_m) + reach(middle_d, ov_m, v_f, u_m);
cc_r = span_ring   + reach(thumb_d, ov_t, v_t, u_r) + reach(ring_d,   ov_r, v_f, u_r);
// Thumb sits centered below the origin
ty = (cc_m + cc_r)/4;
// Finger hole positions honoring each finger's own span
y_m = -ty + sqrt(max(0, cc_m*cc_m - x_m*x_m));
y_r = -ty + sqrt(max(0, cc_r*cc_r - x_r*x_r));
// Puck footprint extents auto-size to the grip
ext_s = ty + thumb_d/2 + ov_t/2 + end_wall;
ext_n = max(y_m + middle_d/2 + ov_m/2, y_r + ring_d/2 + ov_r/2) + end_wall;

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
function surf_z(h, x, y, R = ball_R) = h - R + sqrt(R*R - x*x - y*y);

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
// R is the sphere radius the hole is cut into; the pitch offsets are scaled by R/ball_R so a
// smaller sphere (the Rev Ball) keeps the same hole angles as the regulation ball.
module drill(x, y, d, depth, fwd_in, lat_in, body_h, fdir, through = false, R = ball_R, oval = 0, oval_angle = 0, bevel = rim_chamfer) {
    zs     = surf_z(body_h, x, y, R);
    aim    = [lat_in*25.4*mir*R/ball_R, fwd_in*25.4*fdir*R/ball_R, body_h - R];
    inward = aim - [x, y, zs];
    out    = -inward / norm(inward);                       // outward unit vector
    b      = acos(out[2]);
    c      = atan2(out[1], out[0]);
    // the oval's long axis, as the drill sheet gives it (0 = up the sheet, + = hand side), in the hole's frame
    v      = [mir*sin(oval_angle), cos(oval_angle)];
    va     = v[0]*cos(c) + v[1]*sin(c);
    vb     = -v[0]*sin(c) + v[1]*cos(c);
    phi    = oval > 0 ? atan2(vb*cos(b), va) : 0;
    off    = [cos(phi)*oval/2, sin(phi)*oval/2];
    translate([x, y, zs])
    rotate([0, b, c]) {                                    // maps +Z onto `out`
        // bore (local -Z is into the body)
        ovalize(off) translate([0, 0, through ? -130 : -depth])
            cylinder(d = d, h = through ? 165 : depth + 35);
        // rounded edge: a quarter circle of radius `bevel` from short frustums, then a shallow cone
        // above the surface so a surface that rises on one side still gets an edge. Local z = 0 is
        // the sphere's tangent plane; at the rim the sphere has fallen r^2/(2R) below it, so the
        // whole profile is sunk by that sagitta to meet the real surface tangentially.
        if (bevel > 0) translate([0, 0, -pow(d/2 + bevel + oval/2, 2)/(2*R)]) {
            N = 6;
            for (k = [0 : N-1]) {
                a0 = k*90/N; a1 = (k+1)*90/N;
                r0 = d/2 + bevel - bevel*cos(a0); r1 = d/2 + bevel - bevel*cos(a1);
                z0 = -bevel + bevel*sin(a0);      z1 = -bevel + bevel*sin(a1);
                ovalize(off) translate([0, 0, z0]) cylinder(h = max(z1 - z0, 0.05), r1 = r0, r2 = r1);
            }
            ovalize(off) cylinder(h = 6, r1 = d/2 + bevel, r2 = d/2 + bevel + 8);
        }
    }
}

// An oval hole is a round one swept sideways: the hull of two copies of each (convex) piece
module ovalize(off) {
    hull() {
        translate([ off[0],  off[1], 0]) children();
        translate([-off[0], -off[1], 0]) children();
    }
}

// Text engraved 0.5 mm into the base at (x, y), mirrored so it reads right with the part turned over
module serial_cut(x, y, size = 5.5, max_w = 1e9) {
    w = len(serial)*size*0.72 + (len(serial) - 1)*size*0.1;   // rough width of the bold text
    if (serial != "")
        translate([x, y, -1]) mirror([1, 0, 0]) linear_extrude(1.5)
            text(serial, size = size*min(1, max_w/max(w, 1)), halign = "center", valign = "center", font = "Liberation Sans:style=Bold");
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
        drill(0, -ty, thumb_d, 0, thumb_fwd, thumb_lat, puck_h, +1, true, ball_R, ov_t, thumb_oval_angle, thumb_bevel);

        // fingers: blind fingertip holes, each at its own span, size, pitch
        drill(x_m, y_m, middle_d, finger_depth, middle_fwd, middle_lat, puck_h, -1, false, ball_R, ov_m, finger_oval_angle, finger_bevel);
        drill(x_r, y_r, ring_d,   finger_depth, ring_fwd,   ring_lat,   puck_h, -1, false, ball_R, ov_r, finger_oval_angle, finger_bevel);
        serial_cut(0, ext_n - 15, 5.5, 60);   // finger end of the base (the thumb bore exits the base well in from its entry)

        if (lanyard)
            xtunnel(44, 10, lanyard_d, puck_w + 20);

        if (weight_pocket)
            pocket(0, 6);
    }
}

// ---------------------------------------------------------------------
// Rev ball — release trainer: a full ball with the grip at the top and a
// small flat underneath. Released on the floor it rolls and hooks (or not).
// ---------------------------------------------------------------------
module rev_ball() {
    R = ball_d/2;
    s = ball_flat > 0 ? R - sqrt(max(0, R*R - (ball_flat/2)*(ball_flat/2))) : 0;  // sagitta of the flat
    H = 2*R - s;                                                                   // top of the ball
    difference() {
        intersection() {
            translate([0, 0, R - s]) sphere(r = R);
            translate([-R - 1, -R - 1, 0]) cube([2*R + 2, 2*R + 2, H + 1]);
        }
        if (thumb_hole)
            drill(0, -ty, thumb_d, ball_thumb_depth, thumb_fwd, thumb_lat, H, +1, false, R, ov_t, thumb_oval_angle, thumb_bevel);
        drill(x_m, thumb_hole ? y_m : 0, middle_d, finger_depth, middle_fwd, middle_lat, H, -1, false, R, ov_m, finger_oval_angle, finger_bevel);
        drill(x_r, thumb_hole ? y_r : 0, ring_d,   finger_depth, ring_fwd,   ring_lat,   H, -1, false, R, ov_r, finger_oval_angle, finger_bevel);
        serial_cut(0, 0, 4.4, max(8, ball_flat - 2));   // on the resting flat, shrunk to fit it
        if (ball_groove) ball_ring(R, s, R - s, 2, 0.8);
        // a fine groove at every colour boundary (the slicer swaps filament at these heights)
        for (z = ball_swaps(R, s)) ball_ring(R, s, z, 0.6, 0.3);
        if (pap_marker) pap_cut(R, s);
    }
}

// Two shallow sockets at the release axis (PAP) and its opposite point. The axis point is given as
// arc lengths along the surface from the grip centre: over toward the hand side, up toward the fingers.
module pap_cut(R, s) {
    a_up = pap_up/R*180/PI; a_over = pap_over/R*180/PI;
    t0 = [0, sin(a_up), cos(a_up)];                               // the top, tilted toward the fingers
    d  = [sin(a_over)*t0[2]*mir, t0[1], cos(a_over)*t0[2]];      // then toward the hand side
    for (sg = [1, -1]) {
        u = d*sg;
        P = [0, 0, R - s] + R*u;
        translate(P) rotate([0, acos(u[2]), atan2(u[1], u[0])])
            translate([0, 0, -pap_depth]) cylinder(d = pap_socket_d, h = pap_depth + 3);
    }
}

// The two contrasting plugs for the axis target dots (print in the second colour); 0.3 mm proud
module axis_plugs() {
    r = pap_socket_d/2; h = pap_depth + 0.3;
    for (x = [-pap_socket_d, pap_socket_d]) translate([x, 0, 0]) {
        cylinder(h = 0.5, r1 = r - 0.5, r2 = r);
        translate([0, 0, 0.5]) cylinder(h = h - 0.5, r = r);
    }
}

// Groove w wide and `deep` deep round a ball of radius R (flat sagitta s), centred on height z
module ball_ring(R, s, z, w, deep) {
    rz = sqrt(max(1, R*R - pow(z - (R - s), 2)));   // the ball's radius at that height
    translate([0, 0, z - w/2]) difference() {
        cylinder(r = R + 5, h = w);
        translate([0, 0, -0.2]) cylinder(r = rz - deep, h = w + 0.4);
    }
}
// Lowest point of a hole's chamfer rim on the ball surface
function ball_edge_z(R, s, x, y, d, bev) = R - s + sqrt(max(0, R*R - pow(sqrt(x*x + y*y) + d/2 + bev, 2)));
function ball_cap_z(R, s) = floor(min(thumb_hole ? ball_edge_z(R, s, 0, -ty, thumb_d + ov_t, thumb_bevel) : 1e9,
    ball_edge_z(R, s, x_m, thumb_hole ? y_m : 0, middle_d + ov_m, finger_bevel),
    ball_edge_z(R, s, x_r, thumb_hole ? y_r : 0, ring_d + ov_r, finger_bevel)) - 6);
function ball_swaps(R, s) =
    ball_stripe == "cap"      ? [ball_cap_z(R, s)] :
    ball_stripe == "cap_band" ? [R - s - 6, R - s + 6, ball_cap_z(R, s)] :
    ball_stripe == "bands"    ? [R - s - 36, R - s - 24, R - s - 6, R - s + 6, R - s + 24, R - s + 36] : [];

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
        drill(x_m, 0, middle_d, min(finger_depth, 20), 0, 0, spin_h, -1, false, ball_R, ov_m, finger_oval_angle, finger_bevel);
        drill(x_r, 0, ring_d,   min(finger_depth, 20), 0, 0, spin_h, -1, false, ball_R, ov_r, finger_oval_angle, finger_bevel);
        serial_cut(-21, 22, 5.5, 34);   // one quadrant of the base, clear of the spin bars

        if (lanyard && !spin_hum)   // the tunnel would cross the chamber
            xtunnel(-spin_d/2 + 18, 8, lanyard_d, spin_d + 20);
        if (spin_hum) hum_cuts();

        // spin-indicator bars engraved in the base: when it spins on the
        // floor the flicker makes rev count easy to read
        for (a = [0, 90])
            rotate([0, 0, a])
                translate([0, 0, -eps])
                    cube([spin_d - 8, 4, 2.4], center = true);
    }
}

// Humming chamber: a ring cavity (house-shaped profile revolved; the 45-degree gable roof prints
// without supports) and slanted slots from the top surface into it
module hum_cuts() {
    rm = (hum_r0 + hum_r1)/2;
    ridge = hum_z1 + (hum_r1 - hum_r0)/2;
    rotate_extrude($fn = 128)
        polygon([[hum_r0, hum_z0], [hum_r1, hum_z0], [hum_r1, hum_z1], [rm, ridge], [hum_r0, hum_z1]]);
    for (i = [0 : spin_hum_slots - 1])
        rotate([0, 0, i*360/spin_hum_slots])
            translate([rm, 0, hum_z1 + 14])
                rotate([0, 0, mir*spin_hum_angle])
                    cube([hum_slot_l, hum_slot_w, 30], center = true);
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
// Release gate — the feedback for the ball. A base segment that links to
// its neighbours with a dovetail across the tape line, and a loose pin
// standing in a shallow cup on it; the ball knocks over the pin where it
// crosses. One file = one segment + one pin; print 3 or 5 copies.
// ---------------------------------------------------------------------
module trap(x0, x1, w0, w1) { polygon([[x0, -w0/2], [x1, -w1/2], [x1, w1/2], [x0, w0/2]]); }

module release_gate() {
    L = ball_d + gate_gap; w = gate_w; t = gate_t; c = gate_clear;
    slope = (gate_dove_w2 - gate_dove_w1)/2/gate_dove_len;   // half-width gained per mm along a dovetail
    cup_r = gate_pin_d/2 + gate_cup_clear/2;
    difference() {
        union() {
            translate([0, 0, t/2]) cube([L, w, t], center = true);
            // dovetail tab on the +X end (starts 0.5 mm inside the body so the two fuse)
            linear_extrude(t) trap(L/2 - 0.5, L/2 + gate_dove_len, gate_dove_w1 - 2*slope*0.5, gate_dove_w2);
        }
        // the matching slot in the -X end, with clearance, open through the end face
        translate([0, 0, -1]) linear_extrude(t + 2)
            trap(-L/2 - 1, -L/2 + gate_dove_len + c, gate_dove_w1 + 2*c - 2*slope, gate_dove_w2 + 2*c);
        // shallow cup the pin stands in, its 45 degree lead-in, and a groove across the top for the tape
        translate([0, 0, t - gate_cup_depth]) cylinder(r = cup_r, h = gate_cup_depth + 1);
        translate([0, 0, t - 1]) cylinder(r1 = cup_r, r2 = cup_r + 1, h = 1);
        translate([0, 0, t]) cube([1, w + 2, 1.2], center = true);
    }
    // the pin, standing beside the segment: chamfered foot so it tips out of the cup, chamfered top
    r = gate_pin_d/2; h = gate_pin_h;
    translate([0, w/2 + 20, 0]) {
        cylinder(h = 1, r1 = r - 1, r2 = r);
        translate([0, 0, 1]) cylinder(h = h - 3, r = r);
        translate([0, 0, h - 2]) cylinder(h = 2, r1 = r, r2 = r - 2);
    }
}

// ---------------------------------------------------------------------
if (part == "puck")    rev_puck();
if (part == "ball")    rev_ball();
if (part == "spinner") rev_spinner();
if (part == "sizer")   hole_sizer();
if (part == "gate")    release_gate();
if (part == "plugs")   axis_plugs();
if (part == "both") {
    rev_puck();
    translate([puck_w/2 + spin_d/2 + 15, 0, 0]) rev_spinner();
}
