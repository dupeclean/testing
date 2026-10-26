# Release feedback with printed parts only

Design notes for the three feedback features added on 2026-10-22. Constraint from the owner: the
bowler must know at once whether a release was done right, using nothing but printed parts. No
springs, flexures, electronics or bought hardware.

## What a signal can honestly measure

A release is "right" when (1) the thumb leaves before the fingers, (2) the fingers put spin on
the ball as it leaves, and (3) that spin is about the intended axis. Inside a sealed printed
ball nothing mechanical can sense any of these: a rolling ball turns at speed over
circumference whatever the hand did, and a loose rattle pellet co-rotates once centrifugal
force pins it to the wall, so a rattle or whistle inside the ball would reward throwing harder.
A printed click at the hand needs stored energy, which means a spring. So the printed-only
signals are about what the release *did*: where the ball went (gate), what it spun about (axis
dots), and how hard the fingers lifted (humming spinner). The puck's thumb-pop drill already
has its own honest signal: after the pop the puck either stays in the fingers or drops to the
cord.

## 1. Release gate (part `gate`)

A row of loose pins across the tape line at 1.5 to 2 m. The ball topples the pin where it
crosses, with a clack about a second after the release. The bowler decides which pin a correct
release should knock down: the centre pin for a yo-yo's straight, heavy roll; one or two pins
over for a hook. The wrong pin falling says which way the release missed.

- One STL holds one base segment and one pin; print 3 or 5 copies of the file.
- Segment: `ball_d + 10` long (210 mm for the 200 mm ball, so pins sit 210 mm apart), 40 wide,
  6 thick. Dovetail tab on the +X end, matching slot on the -X end with 0.3 mm clearance, so
  segments link into a straight row. At the centre a shallow cup, pin diameter + 1.0 mm across
  and 1.5 mm deep with a 45 degree lead-in, and a 1 mm groove across the top on both sides of
  the cup to line the segment up with the tape.
- Pin: 20 mm diameter, `gate_pin_h` tall (default 100, 50 to 150), 2 mm chamfer on top, 1 mm
  chamfer at the foot so it tips out of the cup. About 22 g at 20% infill.
- Why a cup and not a stub: a stub in a socket binds as the pin tilts, so the pin would drag
  the row instead of falling. A pin standing in a 1.5 mm cup tips freely yet is not brushed off
  by floor vibration.
- Resolution: pins are `ball_d + 10` apart, so a ball never reaches more than two neighbours,
  and a 5 mm dead zone sits between pins where neither falls (read as "between").
- Exported with the Rev Ball and Digital Ball products and on its own as the Release Gate
  product. Print flat, no supports; the pin stands upright on its foot.

## 2. Axis target: dots, rings and the track (ball: `pap_marker`, `pap_ring`, `pap_track`, `pap_given`, `pap_over`, `pap_up`)

Two shallow sockets on the ball at the axis the release should produce, each inside a 60 mm
ring pocket, with contrasting printed plugs and rings. Spin the ball about that axis and the
bullseye sits still while the rest blurs; spin about another axis and it wheels around. This is
how a pro shop reads a positive axis point (PAP), and the ring makes it readable from 2 m away
in the first half-metre of the roll.

On 26 October 2026 the default axis was briefly the forward-roll axis (90° round from the grip centre,
the yo-yo line through the thumb and between the fingers); the owner rejected that the same day ("based
on the pap, i want the ring to form and be accurate"), and the default is the common position again,
5 1/2" over, 1/2" up. What carpet does is still true and is on the card: the ball stops slipping within
10 to 30 cm and the friction swings the spin axis inside the ball by about two thirds of the axis
rotation (45°: a 33° swing, 57 mm, a 12° kink), so the bullseye is read in the first frames of a
slow-motion clip, and after that as the size of the circle it wheels in. A straight forward roll spins
the ball about the line between the finger holes, not the PAP, so drill 1 (the yo-yo roll) is read
from the path.

The card runs two drills with a drawn release-angle scale (`ovalScale` in orders.js, only when the
ball has the track ring): the track ring is square to the axis the ball spins about, so a phone on the
floor behind the release point sees it as an oval whose width over height = sin(axis rotation),
leaning with the tilt. Drill 1 is the yo-yo roll (read from the path; the gate's centre pin); drill 2
the proper release (the oval against the scale, a pin one or two over, the bullseye's circle, ten in a
row). The gate's card text names the two targets.

- The PAP is taken the way a pro shop measures it, along the surface with a tape: from the
  **centre of the grip** (midway between the thumb hole and the middle of the two finger holes)
  on a thumb-in ball, or from the **middle of the two finger holes** on a no-thumb ball; `over`
  first, along the line across the grip toward the bowling-hand side, then `up` toward the
  fingers (negative = toward the thumb). Both reference points are computed from the holes as
  drilled, so lateral pitches and unequal spans are honoured. The sheet's distances are arcs on a
  regulation ball (R 108 mm) and are kept as angles on the printed ball, as the pitches are, so the
  axis sits where it does on the real ball: 5 1/2" over is 74 degrees, 129 mm along the surface of
  a 200 mm ball. (Until 2026-10-24 the lengths were used unscaled, which put the axis 80 degrees
  over and the track through the thumb hole and across the flat.) The second socket is at the
  antipode.
- `pap_given` marks that the drill sheet gives the PAP (then `pap_over`, `pap_up` are the
  sheet's numbers and are validated); otherwise the common 5 1/2" over, 1/2" up is used and the
  job sheet and card say "not on the sheet".
- Socket: 12 mm diameter plus the print allowance, 3 mm deep. Ring pocket: between radii 28 and
  32 mm (plus the allowance), flat-bottomed 3 mm under the surface at its outer edge (about
  4.3 mm at the inner edge, the sphere's sag). Plug: 12 mm, 3.3 mm tall, 0.5 mm foot chamfer.
  Inlay ring: 56/64 mm, flat underneath so it prints flat, top following the ball's surface.
  Plugs and rings ship in one second-colour STL (`plugs`, named `axis_inlays_...`; `axis_plugs_...`
  with the ring off). Without inlays the pockets still read as dark marks.
- Track ring (`pap_track`, on by default, with `track_tilt`; added 2026-10-24 after the first
  print): a 12 mm channel 2 mm deep on the line the ball rolls on when it spins about the axis
  point with `track_tilt` degrees of axis tilt, the circle (90 - tilt) degrees from the axis point.
  The default tilt is 15°, typical of a hook; 0 is end over end, the ring the ball's equator about the
  axis point. The axis point is the upper end of a tilted axis, so the track sits 90° plus the tilt from
  it, round the opposite axis point, lower on the far side of the ball and further from the holes as the
  tilt grows (until 26 October the engine had it 90° minus the tilt, on the PAP's side: wrong for any
  tilt, invisible at 0). The job sheet gives the ring's distance from each hole's bevel rim. Where
  that line runs through a grip hole (it should not: a real track clears the holes, so the ball warns
  that the PAP or the tilt is off) the channel stops 1.5 mm short of the bevel, so the grip is untouched
  and that arc comes in pieces. Two second-colour arcs for it ship in the inlays file, standing on
  their lower rim with a small flat foot cut (the rim is a cone when the ring is tilted), split at
  the ring's two side points with a 1 mm gap; glued in and sanded flush. Stay behind the ball and
  the ball rolls along the ring while the ring holds still. (An earlier version the same day moved the ring
  to the largest circle clear of the holes; the owner wanted the roll line itself.) Like the bullseye it stays put when the ball spins about the axis and wobbles when
  the carpet swings the axis, and unlike the bullseye it shows from behind as the ball rolls away. The earlier horizontal
  spot and band patterns (layer colour swaps) had no relation to the PAP; they remain as options,
  off by default. A second-colour track by layer swaps is not possible in this print orientation
  (the ring crosses nearly every layer: about 1,900 filament changes), which is why it is an inlay.
- Warnings: a socket or ring closer than 4 mm to a hole's bevel rim; a socket within 15 mm of
  the resting flat, or a ring running onto it.
- Honest limit: on carpet the ball skids briefly and then rolls, and a hooking ball's axis
  migrates toward the rolling axis, so the dot is steady only during the first part of the
  roll. For a release that spins the ball about its axis point the dot stays steady throughout.

## 3. Humming spinner (spinner: `spin_hum`, `spin_hum_slots`, `spin_hum_angle`)

A hollow ring chamber inside the spinner with slanted slots through the top. Spinning fast
enough drives air through the slots and the chamber hums, like a humming top. The hum is a
threshold: it starts once the spin is fast enough and lasts as long as the spin stays above
that speed, so it reports the strength of the finger lift and how long it carried.

- Chamber: ring from radius 30 to 44 mm, floor at 5 mm, walls to 16 mm, 45 degree gable roof to
  23 mm (self-supporting, no supports). Keeps 2.6 mm of floor above the engraved spin bars and
  about 4 mm of wall to the finger bores.
- Slots: `spin_hum_slots` (default 8, 2 to 16) openings 2 mm wide and 10 mm long through the top
  into the chamber, each turned `spin_hum_angle` (default 45, 0 to 80) degrees from the radial
  direction so the moving surface scoops air.
- The wrist-cord tunnel would cross the chamber, so it is left out when the hum is on.
- Experimental: the threshold speed and the tone depend on slot size and chamber volume, which
  only test prints can tune. It is off by default.

## Status

All three are built by the engine (`configurator/app.js`), mirrored in `trainer.scad` (parity
checked by intersection-over-union of the two meshes; the figures are in `HANDOFF.md`), covered
by `configurator/test/engine_check.mjs`, and exposed in the configurator, the order book
(products `ball`, `gate`, `digital_ball`; fit schema keys `gate_pin_h`, `pap_marker`, `pap_over`,
`pap_up`, `spin_hum`, `spin_hum_slots`, `spin_hum_angle`), the job sheet and the customer card.
The owner printed the first Rev Ball (own sheet) on 2026-10-23: the oval thumb was mirrored (the
sheet angle now turns toward the thumb side), the horizontal pattern bands read as unrelated to the
PAP (replaced by the track ring), and PETG supports scarred the underside (the job sheet now asks
for a PLA support interface). Still to check on prints: a gate pin stands freely in its cup and
two segments slide together; a plug presses into its socket by hand; whether the spinner hums at
all at a finger-lift spin speed, and with which slot count and angle.
