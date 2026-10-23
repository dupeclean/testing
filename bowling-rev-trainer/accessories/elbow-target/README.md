# Elbow Target: the bent-elbow cue for the yo-yo release

**What it is for.** The yo-yo release wants the elbow bent at the bottom of the swing, hand under
the ball, and then uncoiled through the release. A learner's usual fault is a straight-arm swing
that never bends, so a brace that *limits* bending would stop the wrong thing. This is the
opposite: a target you find. A curved saddle straps to the inside of the forearm just below the
elbow crease and carries a bumper. When the elbow bends to the angle you chose, the upper arm
meets the bumper and you feel it; then you uncoil out of it. No hinge, no spring, nothing to
align with the joint.

**Parts** (`elbow_target.scad`; STLs rendered for a 90 mm forearm)

| File | Print | Notes |
|---|---|---|
| `elbow_target_saddle.stl` | PETG, 0.2 mm, 3 walls, 20% infill, standing on its block end as exported, no supports, about 1 h | 90 mm long, 56 mm wide, 3 mm shell with a 12 mm block at the elbow end that takes the bumper |
| `elbow_target_bumpers.stl` | PETG, lying on their backs as exported, no supports, 40 min | four bumpers, 10 / 20 / 30 / 40 mm tall; press one into the block (sand the tenon if tight) |
| `elbow_target_strap_tpu.stl` | TPU 95A, flat, print two | a 25 mm band with a peg and a row of holes; or use two 25 mm velcro straps |

**Fit.** Measure the forearm circumference just below the elbow crease, divide by 3.14, and set
`forearm_d` in the SCAD before rendering (90 mm is a 28 cm forearm). The saddle's inner curve
and the strap length follow it.

**How to set it.**

1. Strap the saddle to the inside of the forearm with the block toward the elbow crease, about
   20 mm from it, with the bumper fitted.
2. Stand in front of a mirror and bend the elbow to the angle you want at the bottom of the swing
   (about 90 degrees for the yo-yo release). Swap bumpers until the upper arm just touches the
   bumper at that angle. Taller bumper or saddle nearer the crease: contact at a more open elbow.
   Shorter, or further down the forearm: contact at a tighter bend.
3. Swing the puck on its cord, or the ball on the carpet. Bend until you feel the bumper at the
   bottom, then uncoil. The touch is the feedback; the ball's bullseye and the gate tell you what
   the uncoil did.

**Limits.** It cues the angle at the bottom; it does not measure it, and it cannot tell you how
fast you uncoiled (the ball's revs do). Use it with the trainer ball and the puck. It is not
intended for a full-weight ball on the lane. If the bumper pinches, take it off and use a
shorter one.

Not part of the app: it needs no drill-sheet values, only the forearm size.
