# Bowling Rev Trainer (one-handed, thumb-in)

Two 3D-printable training tools for building rev rate (RPM) with a conventional
one-handed, thumb-in release. Both are slices of a regulation 8.5"-diameter ball
surface, so the curvature, hole angles, and hand position match a real ball.

| Part | What it trains | Size | Weight (4 walls, 20% infill) |
|---|---|---|---|
| **Rev Puck** (`stl/rev_puck.stl`) | Fingertip grip strength, relaxed-thumb hold, thumb-exit timing | 140 × 178 × 60 mm | ~350–450 g |
| **Rev Spinner** (`stl/rev_spinner.stl`) | Finger lift / "flick" at release, rev counting | 100 × 100 × 38 mm | ~110–130 g |

Holes are drilled toward the sphere's center (how a zero-pitch hole is drilled on
a real ball), plus adjustable forward/reverse pitch — so your thumb and fingers
oppose each other around the curvature exactly as on your ball.

## Fit it to your hand first

The STLs here use average-male defaults (110 mm fingertip span, 26 mm thumb,
21.5 mm fingers). **Open `trainer.scad` in [OpenSCAD](https://openscad.org) (free)
and set the `Fit` parameters to match your ball before printing:**

- `span` — straight-line distance from the near edge of your thumb hole to the
  near edge of your finger holes (your fingertip span). Copy it from your drilled
  ball, or have a pro shop measure you.
- `thumb_d`, `finger_d` — copy your ball's hole sizes, then **add ~0.5 mm**:
  printed holes come out slightly small, and it's easy to sand out or build back
  up with bowler's tape (use tape for final fit, same as a real ball).
- `finger_pitch` / `thumb_pitch` — defaults (4° forward fingers, 3° reverse thumb)
  suit a rev-focused fingertip grip. The reverse thumb pitch encourages the quick,
  clean thumb exit that RPM depends on.

The puck's length auto-sizes to the span. Everything else (depths, bridge,
lanyard, weight pocket) is parametric too.

## Printing

- **Material:** PETG or PLA+. 4 perimeters, 5 top/bottom layers, 20–30 % gyroid
  infill. More infill = heavier = more strength training.
- **Orientation:** flat base on the bed for both parts. No supports needed — the
  lanyard tunnel has a teardrop roof and the weight pocket a cone roof.
- **Finish:** lightly sand the hole rims and bores (the chamfer is modeled, but
  smooth bores matter for a clean thumb exit). A wipe of isopropyl + fine
  sandpaper on the thumb bore pays off.
- **Weight pocket (puck underside):** stack coins or M20/¾" washers in it and
  seal with gorilla/gaffer tape for progressive loading (~100 g of quarters fit).
- **Lanyard:** thread paracord through the side tunnel and loop it around your
  wrist for all swing drills so the trainer can't fly away.

## Training guide — building RPM with the thumb in

Rev rate for a thumb-in player comes from three things, in order:
**(1) a relaxed hand on a fingertip grip, (2) the thumb exiting early and clean,
(3) the fingers lifting from under the ball through the release.** Each drill
targets one of these. 10–15 min/day beats one long session.

### Rev Puck drills

1. **Fingertip carries (grip strength + relaxed thumb).** Hold the puck at your
   side in a fingertip grip, thumb *loose* — the fingers carry the weight, the
   thumb only balances. 5 × 30 s holds. If your thumb knuckle whitens, you're
   squeezing; restart. Add weight to the pocket as it gets easy.
2. **Thumb pops (exit timing).** Lanyard on wrist. Dangle the puck, then relax
   the thumb and let it slide out while the fingers catch and hold the weight.
   The puck should drop a few millimetres onto the fingers without the grip
   failing. 3 × 10. This is the "thumb leaves, fingers stay" feel of a high-rev
   release.
3. **Swing sync.** Slow shadow swings with the puck, releasing the thumb at the
   bottom of the swing and catching with fingers (don't let go). Trains the
   timing: thumb out *before* the lift, not during it.
4. **Cupped-wrist isometrics.** Hold the puck in front of you, wrist cupped
   (palm toward you), 5 × 20 s. Wrist strength is what keeps the hand *under*
   the ball to the release point.

### Rev Spinner drills

5. **Carpet spins (the money drill).** Kneel on carpet. Fingers in, palm up,
   arm swinging a short pendulum. At the bottom, *lift* with the fingers —
   un-cup the wrist and flick as the spinner comes off — releasing it onto the
   floor so it spins in place like a top. The engraved bars on the base flicker
   as it spins: **count seconds until it stops.** Longer spin = more revs.
   Log your best; progress is measurable.
6. **Rotation axis control.** Same drill, but start with fingers at 4–5 o'clock
   on the spinner (right-hander) and rotate to 1–2 o'clock through release.
   That's the hand action that turns lift into side revs on the lane.

### On the lanes

Transfer with low-speed, high-rev shots: 10 frames where you throw at half
speed and try to maximize hook. Speed hides rev flaws; slow shots expose them.

**Safety:** these are swing-and-hold / carpet-release tools. Don't throw them at
full speed — a half-kilo of PLA is not a bowling ball, and neither your wall nor
the plastic will enjoy it.

## Regenerating STLs

```sh
openscad --export-format binstl -o stl/rev_puck.stl    -D 'part="puck"'    trainer.scad
openscad --export-format binstl -o stl/rev_spinner.stl -D 'part="spinner"' trainer.scad
```

Or use OpenSCAD's GUI customizer (Window → Customizer) and F6 + export.
