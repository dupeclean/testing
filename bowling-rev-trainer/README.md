# Bowling Rev Trainer (one-handed, thumb-in)

**Project map**

| Where | What |
|---|---|
| `trainer.scad`, `stl/`, `generate.py` | Parametric CAD source, default STLs, fit-sheet → STL command-line generator |
| `configurator/` | Browser configurator (drill sheet in, STL out); hosted copy: https://claude.ai/artifact/1fiDeAkPe9RPJSyBWruE2p |
| `docs/business-plan.md` | Business plan with evidence tables and claims guide; rendered page: https://claude.ai/artifact/PvBxUpQbEZaXPGcshtbyf2 |
| `site/` | Deployable landing page with waitlist form; preview: https://claude.ai/artifact/Jj4K6pxdrvyJicbzsicqEj |
| `marketing/` | Go-to-market kit: brand platform, website copy, pro-shop program, retailer and marketplace pitches, creator program, content and launch calendar, paid funnel, support runbook, target list |
| `ip/` (local only, not in the public repo) | IP strategy, provisional patent application draft, prior-art memo, filing checklist, figures |

Two 3D-printable training tools for building rev rate (RPM) with a conventional
one-handed, thumb-in release. Both are slices of a regulation 8.5"-diameter ball
surface, so the curvature, hole angles, and hand position match a real ball.

| Part | What it trains | Size | Weight (4 walls, 20% infill) |
|---|---|---|---|
| **Rev Puck** (`stl/rev_puck.stl`) | Fingertip holds, relaxed-thumb carries, thumb-exit timing (add weight on the cord for strength work) | 140 × 177 × 60 mm | ~300 g (297 g sliced, PETG, 20% gyroid) |
| **Rev Spinner** (`stl/rev_spinner.stl`) | Finger lift / "flick" at release, spin counting | 100 × 100 × 38 mm | ~100 g (98 g sliced) |
| **Hole Sizer** (`stl/hole_sizer.stl`) | Finding your exact hole diameters before printing the big parts | 175 × 92 × 15 mm | ~90 g |

Holes are drilled toward the sphere's center (how a zero-pitch hole is drilled on
a real ball), plus adjustable forward/reverse pitch — so your thumb and fingers
oppose each other around the curvature exactly as on your ball.

## The configurator (no software to install)

`configurator/index.html` is a single-file web app: open it in any browser
(double-click, host it on your site, or use the hosted copy at
https://claude.ai/artifact/1fiDeAkPe9RPJSyBWruE2p). Type in a pro-shop drill
sheet and it rebuilds the model in about 100 ms and lets you download the STL
(the claude.ai copy saves a zip holding the STL and a fit sheet).

- Per-hole **sizes** (thumb, middle, ring), **spans** (middle, ring), and
  **pitches** — forward/reverse and lateral, per hole, in drill-sheet inches.
  Fractions are accepted everywhere: `55/64`, `1 1/32`, `4-1/2`.
- mm or inches, right or left hand, finger depth, through or blind thumb,
  bridge, weight pocket, lanyard, print allowance.
- Live 3D preview with the bore axes drawn, so pitch is visible.
- Geometry checks: it warns when bores would break into each other, the
  pocket, or the lanyard tunnel, and when a blind thumb floor gets thin.
- A **sizer plate** generator with bores centered on your expected sizes in
  1/64" steps (labels engraved), for calibrating a specific printer.
- Fit-sheet JSON export/import so every order is reproducible.

The browser build and the OpenSCAD source produce the same geometry (checked
to 0.1 mm in every dimension and 0.12 % in volume across right/left-hand,
blind/through and custom-pitch cases; `configurator/test/run.mjs`).
Rebuild after editing `configurator/app.js` or `template.html` with
`python3 configurator/build.py`.

## Fit it to your hand first

The STLs here use average-male defaults (110 mm spans, 26 mm thumb, 21.5 mm
fingers, stock pitches). Every number a pro-shop drill sheet carries is a
parameter, so **copy your drill sheet** — in OpenSCAD's customizer
(Window → Customizer) or via `generate.py` below:

- `hand` — `right` or `left`; mirrors the layout and lateral pitches.
- `span_middle` / `span_ring` — near edge of thumb hole to near edge of each
  finger hole (your middle span is usually 2–4 mm longer than your ring span).
- `thumb_d`, `middle_d`, `ring_d` — per-hole diameters. **Add ~0.5 mm** to your
  real sizes: printed holes come out slightly small; sand out or build back with
  bowler's tape for final fit, same as a real ball.
- Pitches, **in drill-sheet inches** (`0.125` = 1/8, `0.375` = 3/8): per hole,
  forward(+)/reverse(−) (`*_fwd`) and lateral (`*_lat`, + = toward your
  bowling-hand side). Zero pitch aims the bore at the ball's center, exactly
  like a real drilling. Defaults: fingers 5/16 forward, thumb 1/8 reverse —
  a rev-friendly fingertip setup that favors a quick, clean thumb exit.

Don't know your sizes? **Print `stl/hole_sizer.stl` first** (fast, flat plate
with labeled test bores, 20–22.5 mm fingers and 25–27 mm thumb in half-mm
steps). The right bore is snug all around at the first joint with zero
squeeze needed to hang on. Index and pinky don't get holes — they spread flat
on the surface, which is what the puck's width is for.

The puck's footprint auto-sizes to the spans. Depths, bridge, lanyard, and
weight pocket are parametric too.

## Generating custom STLs (`generate.py`)

`trainer.scad` + OpenSCAD is the whole CAD pipeline; `generate.py` drives it
from a fit sheet so one command produces a customer's files:

```sh
# one person: JSON fit sheet (see fit_sheet.example.json)
python3 generate.py fit_sheet.example.json -o out/
#   -> out/rev_puck_jordan.stl, out/rev_spinner_jordan.stl

# a batch of orders: CSV, one row per customer, columns = fit-sheet keys
python3 generate.py orders.csv -o out/
```

Inputs are validated against sane ranges before OpenSCAD runs, and output
files are named after the order, so this slots straight into a
made-to-order workflow (fit sheet at checkout → generate → print → ship).

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

## Regenerating the default STLs

```sh
openscad --export-format binstl -o stl/rev_puck.stl    -D 'part="puck"'    trainer.scad
openscad --export-format binstl -o stl/rev_spinner.stl -D 'part="spinner"' trainer.scad
openscad --export-format binstl -o stl/hole_sizer.stl  -D 'part="sizer"'   trainer.scad
```

Or use OpenSCAD's GUI customizer (Window → Customizer) and F6 + export.
