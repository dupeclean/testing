// Elbow Target: a tactile cue for the bent-elbow ("yo-yo") release.
//
// A curved saddle straps to the INSIDE of the forearm just below the elbow crease. A bumper of
// chosen height stands on it, facing the crease. When the elbow bends to the target angle at the
// bottom of the swing, the upper arm meets the bumper: you feel it, then uncoil out of it.
// No hinge to align, no spring. The bumper plugs into the saddle with a press-fit tenon; the arm's
// contact pushes it further in, never out. Adjust the angle with the bumper height and by sliding
// the saddle along the forearm (closer to the crease = contact at a tighter bend).
//
//   openscad -o saddle.stl  -D 'part="saddle"'  elbow_target.scad    (print standing on its block end, no supports)
//   openscad -o bumpers.stl -D 'part="bumpers"' elbow_target.scad    (four heights lying on their backs, no supports)
//   openscad -o strap.stl   -D 'part="strap"'   elbow_target.scad    (TPU 95A, flat; print two. Or use 25 mm velcro)
// Set forearm_d to the forearm diameter just below the elbow: circumference in mm / 3.14.

part = "all";            // [saddle, bumpers, strap, all]
forearm_d = 90;          // forearm diameter just below the elbow crease (circumference / 3.14)
saddle_len = 90;         // along the arm
saddle_w = 56;           // across the arm (chord)
saddle_t = 3;
block_len = 18;          // the thicker block at the elbow end that holds the bumper
block_h = 12;            // its height above the arm
block_w = 44;
tenon = [20, 12, 8];     // bumper tenon: across the arm, along the arm, depth into the block
clear = 0.25;            // mortise clearance per side (press fit; sand the tenon if tight)
strap_w = 25; strap_t = 3.5;             // strap slot size (25 mm velcro, or the printed TPU strap)
bumper_heights = [10, 20, 30, 40];       // above the block
bumper_w = 40; bumper_th = 12;
eps = 0.01;
$fn = 96;

Ri = forearm_d / 2;
y_block = saddle_len / 2 - block_len / 2;             // bumper position along the arm
y_strap = [-(saddle_len / 2 - 16), saddle_len / 2 - block_len - 15];

// A section of the arm cylinder (axis y, crown at +z): radii Ri..Ri+h, chord width w, y0..y1
module shell(h, w, y0, y1) {
    a = asin((w / 2) / Ri);
    intersection() {
        rotate([-90, 0, 0]) translate([0, 0, y0]) difference() {
            cylinder(r = Ri + h, h = y1 - y0);
            translate([0, 0, -1]) cylinder(r = Ri, h = y1 - y0 + 2);
        }
        translate([-(Ri + h + 1) * sin(a), y0 - 1, 0]) cube([2 * (Ri + h + 1) * sin(a), y1 - y0 + 2, Ri + h + 2]);
    }
}

module saddle() {
    difference() {
        union() {
            shell(saddle_t, saddle_w, -saddle_len / 2, saddle_len / 2);
            shell(block_h, block_w, saddle_len / 2 - block_len, saddle_len / 2);
        }
        // mortise for the bumper's tenon, cut down from the block's crown
        translate([-(tenon[0] / 2 + clear), y_block - tenon[1] / 2 - clear, Ri + block_h - tenon[2]])
            cube([tenon[0] + 2 * clear, tenon[1] + 2 * clear, tenon[2] + 2]);
        // strap slots along both edges, two positions
        for (sx = [-1, 1], y = y_strap)
            translate([sx * (saddle_w / 2 - 7) - 2.5, y - strap_w / 2 - 0.5, -1]) cube([5, strap_w + 1, Ri + saddle_t + 2]);
    }
}

// A bumper of height h above the block: rounded top, concave underside that sits on the block's crown,
// tenon below. Its +y face is the contact face (toward the elbow crease).
module bumper(h) {
    union() {
        difference() {
            hull() {
                translate([-bumper_w / 2, -bumper_th / 2, -3]) cube([bumper_w, bumper_th, eps]);
                translate([-bumper_w / 2 + 4, 0, h - 4]) rotate([0, 90, 0]) cylinder(r = 4, h = bumper_w - 8);
            }
            // the block's crown, so the bumper seats on it without a gap at its edges
            translate([0, 0, -(Ri + block_h)]) rotate([-90, 0, 0]) cylinder(r = Ri + block_h, h = 40, center = true);
        }
        translate([-tenon[0] / 2, -tenon[1] / 2, -tenon[2]]) cube([tenon[0], tenon[1], tenon[2] + 1]);
    }
}

// Bumpers in print orientation: lying on their backs (the -y face), tenons pointing +y... i.e. flat on the bed
module bumpers_flat() {
    for (i = [0 : len(bumper_heights) - 1])
        translate([i * (bumper_w + 8), 0, bumper_th / 2]) rotate([90, 0, 0]) bumper(bumper_heights[i]);
}

// Printed TPU strap: a 25 mm band round the forearm with a peg at one end and a row of holes at the other
module strap() {
    L = PI * forearm_d + 80;
    t = 1.8;
    difference() {
        hull() { for (x = [strap_w / 2, L - strap_w / 2]) translate([x, 0, 0]) cylinder(r = strap_w / 2, h = t); }
        for (x = [L - 20 : -12 : L - 130]) translate([x, 0, -1]) cylinder(d = 6, h = t + 2);
    }
    translate([14, 0, t - eps]) { cylinder(d = 5.5, h = 3); translate([0, 0, 3]) cylinder(d1 = 9, d2 = 7, h = 1.6); }
}

module saddle_standing() { translate([0, 0, saddle_len / 2]) rotate([-90, 0, 0]) saddle(); }   // block end on the bed

if (part == "saddle")  saddle_standing();
if (part == "bumpers") bumpers_flat();
if (part == "strap")   strap();
if (part == "all") {
    saddle();
    translate([0, y_block, Ri + block_h]) bumper(bumper_heights[2]);   // the 30 mm bumper in place, for the picture
}
