// Vent-whistle test coupon.
//
// Question: when a snug thumb (or fingertip) leaves a blind hole fast, it pulls a vacuum behind it
// (the "thumb pop"; pro shops drill vent holes for it). Is that gulp of air enough to sound a
// printed kettle-type whistle on the vent? If so the Rev Ball and the puck can play the exit order
// out loud: thumb note first, then the finger note, with no moving parts.
//
// Five blind holes in one block, each vented through a different whistle:
//   A  thumb hole, 3 mm orifices, 12 x 10 mm cavity
//   B  thumb hole, 2.5 mm orifices, 10 x 8 mm cavity (higher note, more restriction)
//   C  thumb hole, 3.5 mm orifices, 14 x 12 mm cavity (lower note, freer)
//   D  thumb hole, plain 3 mm vent, no cavity (the control: a vent hole as a pro shop drills it)
//   F  finger hole, 2 mm orifices, 8 x 6 mm cavity
// Air path: outside -> outlet -> orifice -> cavity -> orifice -> channel -> hole bottom. The jet
// through the first orifice hits the plate of the second one, the way a kettle whistle works.
// Print flat (holes up), no supports: every channel has a 45-degree roof.
//
//   openscad -o whistle_coupon.stl whistle_coupon.scad

$fn = 64;
H = 50;                  // block height
W = 60;                  // block width (y); whistles exit through the +y face
pitch = 30;              // hole spacing
thumb_d = 20.2;          // owner's thumb 25/32" drilled + 0.4 mm print allowance (tape to snug)
finger_d = 17.1;         // middle finger 21/32" + 0.4
thumb_depth = 45;
finger_depth = 25;
channel_d = 4;           // hole bottom to the first plate
outlet_d = 8;            // last plate to the outside
plate = 2;               // orifice plate thickness
rim = 2;                 // comfort chamfer on the hole rims

// [label, hole diameter, hole depth, orifice diameter, cavity diameter (0 = plain vent), cavity length]
V = [["A", thumb_d,  thumb_depth,  3,   12, 10],
     ["B", thumb_d,  thumb_depth,  2.5, 10,  8],
     ["C", thumb_d,  thumb_depth,  3.5, 14, 12],
     ["D", thumb_d,  thumb_depth,  3,    0,  0],
     ["F", finger_d, finger_depth, 2,    8,  6]];
n = len(V);
Lb = pitch * n;

// a channel along +y from y = 0 to y = l with a 45-degree roof, so it prints without supports
module teardrop_y(d, l) {
    r = d / 2;
    rotate([-90, 0, 0]) {
        cylinder(r = r, h = l);
        intersection() {
            rotate([0, 0, 45]) translate([-r, -r, 0]) cube([2 * r, 2 * r, l]);
            translate([-2 * r, -2 * r, 0]) cube([4 * r, 2 * r, l]);   // the half that becomes the roof
        }
    }
}

module whistle(v) {
    d_h = v[1]; depth = v[2]; d_o = v[3]; D = v[4]; L = v[5];
    zb = H - depth;                      // hole bottom
    zc = zb + channel_d / 2 + 0.5;       // channel axis, just above the bottom
    // the blind hole and its rim chamfer
    translate([0, 0, zb]) cylinder(d = d_h, h = depth + 1);
    translate([0, 0, H - rim]) cylinder(d1 = d_h, d2 = d_h + 2 * rim, h = rim + 0.01);
    if (D == 0) {
        // plain vent: a straight 3 mm channel from the hole to the outside face
        translate([0, 0, zc]) teardrop_y(d_o, W / 2 + 1);
    } else {
        y1 = d_h / 2 + 2;                // first plate starts here (2 mm of channel past the hole wall)
        translate([0, 0, zc]) teardrop_y(channel_d, y1 + 0.01);
        translate([0, y1 - 0.01, zc]) teardrop_y(d_o, plate + 0.02);               // orifice, hole side
        translate([0, y1 + plate, zc]) teardrop_y(D, L);                           // cavity
        translate([0, y1 + plate + L - 0.01, zc]) teardrop_y(d_o, plate + 0.02);   // orifice, outside
        translate([0, y1 + 2 * plate + L, zc]) teardrop_y(outlet_d, W);            // outlet through the face
    }
}

difference() {
    translate([-pitch / 2, -W / 2, 0]) cube([Lb, W, H]);
    for (i = [0 : n - 1]) translate([i * pitch, 0, 0]) whistle(V[i]);
    // labels on the top face, on the side away from the outlets
    for (i = [0 : n - 1])
        translate([i * pitch, -W / 2 + 6, H - 1])
            linear_extrude(1.2) text(V[i][0], size = 7, halign = "center", valign = "center", font = "Liberation Sans:style=Bold");
    translate([(n - 1) * pitch / 2, W / 2 - 6, H - 1])
        linear_extrude(1.2) text("whistles this side", size = 4, halign = "center", valign = "center", font = "Liberation Sans");
}
