# Handoff for a local Claude Code session

State of the project as of 2026-10-23 on branch `claude/bowling-grip-trainer-3d-laejva`: the
last cloud commit is `3fe4d41`, plus the local Windows commits described under "Windows session
2026-10-22" and "Release feedback parts" (all pushed). Read this first, then `app/docs/START-HERE.txt` and `app/README.md`.

**Where the live checkout is (owner's PC):** `C:\Users\Tom\Claude\FitSlice` is a git clone of
the repo (this project is its `bowling-rev-trainer\` subfolder; the repo root also holds two
unrelated Go files). Commit there. `C:\FitSlice-src\` is an older, non-git copy of the same zip
from a parallel session on the same day; everything useful from it has been merged here and it
can be deleted. The PC's commits are pushed to GitHub (the owner signed in through Git
Credential Manager on 2026-10-22, so later pushes need no prompt).

## Owner and goal

The owner is a beginner bowler running a small made-to-order business on a Windows PC with a
Bambu Lab P1S + AMS. FitSlice: drill-sheet values in, printable STL out, as a local desktop app
with an order book. Products: Rev Puck (grip/thumb-exit trainer), Rev Ball (200 mm release
trainer, two-colour, with axis target dots), Rev Spinner (optional humming chamber), Release Gate
(pins the ball knocks down), Fit Kit (sizer plate), digital files. Keep explanations
concise. The owner has asked for honesty about what has and has not been physically verified.

## Where things are

- `configurator/app.js` geometry engine (Manifold CSG + three.js). `configurator/build.py`
  inlines it into `configurator/index.html`, `configurator/artifact.html` and
  `app/renderer/index.html` (run it after every engine or template change; the output is
  committed).
- `trainer.scad` is the OpenSCAD reference; it must stay in parity with the engine (IoU > 0.995).
- `app/` Electron shell, order book (`lib/store.js`), exports (`lib/files.js`), job sheet and
  customer-card PDF (`renderer-src/orders.js`). `app/docs/START-HERE.txt` ships in the zip.
- `generate.py` drives OpenSCAD from a fit sheet (CLI alternative to the app).
- Builds: `app/dist/FitSlice-1.0.0-win-x64.zip` (ignored by git). On the owner's PC this build
  is installed at `C:\FitSlice` (where the shortcuts point) since 2026-10-22, with a spare copy
  at `C:\Users\Tom\Claude\FitSlice-app`; the Oct 20 build is kept in `C:\FitSlice-old-2026-10-20`.

## Conventions that were verified on meshes (do not change without re-verifying)

- Finger sides: sheet viewed from outside, thumb at the bottom. Right hand: middle = LEFT
  hole, ring = RIGHT hole. Left hand mirrored.
- Pitch (aim-point): zero aims at the ball centre; forward (+) leans the inner end toward grip
  centre; lateral (+) toward the bowling-hand side. Offsets scaled by R/108 on smaller spheres.
- Oval holes: hole size = short (drilled) way, oval size = long way; angle 0 = up the sheet
  (thumb to fingers), + = toward the hand side. NOT yet checked against a real ball.
- Bevel: quarter-round, thumb 4 mm, fingers 2.5 mm. Serial (order number) engraved 0.5 mm into
  the base, mirrored; on the puck at the finger end (the thumb bore exits the base 20-30 mm in
  from its entry, so the thumb end is not free).
- Rev Ball: R = ball_d/2, resting flat 30 mm across by default (1.1 mm deep; orders saved
  earlier keep their 22 mm), blind thumb 70 mm, second-colour pattern with swap heights on the job
  sheet and 0.3 mm grooves at the boundaries (default since 2026-10-23: `spot_band`, a small spot
  just above the highest hole edge plus a 12 mm band placed by the engine clear of both bullseyes,
  low on the ball when they are in the way; `cap_band` and the others remain); thumb_hole=false
  gives a two-handed ball.
  For the default 200 mm ball the swaps are 92.9, 104.9 and 154 mm with the 30 mm flat (93.4,
  105.4 and 154 with a 22 mm flat); `configurator/test/groove_check.mjs` confirms the grooves
  on an exported STL.

## Owner's own sheet (drillsheet.com, right hand)

Thumb 25/32 drilled, 29/32 oval at 55 deg, pitch 0 forward, -1/8 lateral. Middle (left hole)
21/32, cut-to-cut span 4 1/8, -3/4 (reverse) forward, -1/4 lateral. Ring (right hole) 5/8,
span 4 5/16, -3/4 forward, +1/4 lateral. Bridge 1/2. Finger oval sizes unknown (measure the
inserts; 0 = round). Thumb length not yet measured (needed for ball_thumb_depth).

Pitch sign: the owner's Oct 20 FS-0001 export has +3/4 forward on both fingers; the saved
order was edited to -3/4 reverse on 2026-10-21 and this handoff says reverse, so reverse is the
latest word. It has not been checked against the paper sheet: do that before printing.

## Tests (all green at this commit, on Linux and on the owner's Windows PC)

```
cd app && npm install                                            # needs Node >= 22 (see below)
node --test app/test/*.test.js                                   # 26
PLAYWRIGHT_PATH=<playwright> node configurator/test/engine_check.mjs   # 25
PLAYWRIGHT_PATH=<playwright> xvfb-run -a node app/test/e2e.mjs   # 18 (Linux; on Windows run without xvfb-run)
FITSLICE_E2E_BIN=<packaged exe> PLAYWRIGHT_PATH=<playwright> node app/test/e2e.mjs   # 18, against a packaged build
node configurator/test/groove_check.mjs <ball.stl> <job_sheet.txt>   # colour-change heights vs the mesh
node configurator/test/oval_check.mjs <out> && python3 configurator/test/oval_check.py <out> --scad
node configurator/test/pitch_check.mjs <out> && python3 configurator/test/pitch_check.py <out>
node configurator/test/feedback_check.mjs <out> && python3 configurator/test/feedback_check.py <out> --scad
                                                                 # gate, axis dots + plugs, humming spinner: mesh checks + IoU
cd app && npm run dist:win                                       # app/dist/FitSlice-1.0.0-win-x64.zip
```
The Python checks need `trimesh`, `shapely`, `manifold3d`, `numpy`, `scipy`, `networkx`, `rtree`;
`--scad` needs `openscad` on PATH. On the owner's PC they live in a `--target` folder (see the
Windows section); `feedback_check` was run there on 2026-10-22, `oval_check`/`pitch_check` only on Linux. Playwright:
`npm install --no-save playwright` in `app/` (it is deliberately not in `package.json`), then
`PLAYWRIGHT_PATH=app/node_modules/playwright`; the engine checks also need
`node app/node_modules/playwright/cli.js install chromium`.

### On the owner's Windows PC

The installed Node is 20.11.0, too old for this toolchain: Electron 44's install script and
electron-builder 26 `require()` ES modules (needs Node >= 20.19 or >= 22.12), and the trust
test needs the `windows` option of `fileURLToPath` (Node >= 20.13). Symptoms: `npm install`
"succeeds" in 5 s with no `node_modules\electron\dist\electron.exe`, and `ERR_REQUIRE_ESM`
from electron-builder. A portable Node 24.22.1 is unpacked at
`C:\Users\Tom\Claude\tools\node-v24.22.1-win-x64` (Photoshop's bundled
`C:\Program Files\Adobe\Adobe Photoshop 2025\node.exe`, v22, also works). The real fix is to
install the current Node LTS. `python3` and `python` on PATH are the Microsoft Store stubs; use
`py -3` (3.14) or `C:\Users\Tom\AppData\Local\Programs\Python\Python313\python.exe`. That 3.13 install
is missing standard-library modules (`http.cookiejar`, `ensurepip`), so its pip cannot download
anything; for the Python mesh checks use `py -3` with `PYTHONPATH=C:\Users\Tom\Claude\tools\pylibs`,
where numpy, trimesh, shapely, manifold3d, scipy, rtree and networkx were installed on 2026-10-22
(`py -3 -m pip install --target C:\Users\Tom\Claude\tools\pylibs <packages>`). A portable OpenSCAD
2021.01 is at `C:\Users\Tom\Claude\tools\openscad-2021.01\openscad.exe` (its folder on PATH for
`--scad`; a ball render takes a few minutes). In Git Bash, from the repo root:

```
export PATH="/c/Users/Tom/Claude/tools/node-v24.22.1-win-x64:$PATH"
cd bowling-rev-trainer/app && npm install && npm install --no-save playwright
node node_modules/electron/install.js                 # only if dist/electron.exe is missing
py -3 ../configurator/build.py                        # must leave git status clean
node --test test/*.test.js                            # 26
PW="$PWD/node_modules/playwright"
PLAYWRIGHT_PATH="$PW" node ../configurator/test/engine_check.mjs   # 25
PLAYWRIGHT_PATH="$PW" node ../configurator/test/feedback_check.mjs ../configurator/test/out/fb
PYTHONPATH=C:/Users/Tom/Claude/tools/pylibs PATH="/c/Users/Tom/Claude/tools/openscad-2021.01:$PATH" py -3 ../configurator/test/feedback_check.py ../configurator/test/out/fb --scad
PLAYWRIGHT_PATH="$PW" node test/e2e.mjs                             # 18 (real windows open for about a minute)
node node_modules/electron-builder/cli.js --win zip --x64 --publish never   # dist/FitSlice-1.0.0-win-x64.zip
FITSLICE_E2E_BIN="$PWD/dist/win-unpacked/FitSlice.exe" PLAYWRIGHT_PATH="$PW" node test/e2e.mjs   # 18
```
`npm run dist:win` also works once a Node >= 22 is first on PATH (`build:renderer` falls back
to `py -3`). The real order book is `%APPDATA%\FitSlice` and `Documents\FitSlice Orders`; the
tests never touch it (they set `FITSLICE_DATA_DIR` and `FITSLICE_ORDERS_DIR`).

## Not yet done (needs the owner's machine or hands)

1. DONE 2026-10-22 except the look inside Bambu Studio (details under "Windows session").
   Still open from it: in Bambu Studio open
   `Documents\FitSlice Orders\FS-0002 me\rev_ball200_R_span104p8-109p5_T20p2_M17p1_R16p3.stl`,
   slice with the job-sheet settings, add colour changes at 93.4, 105.4 and 154 mm and check
   that each lands on a groove ring. Two sessions tried to do this from the PC; one was refused
   desktop control and the other was blocked by a "New version of Bambu Studio" dialog.
2. DONE (owner's go-ahead each time): `C:\FitSlice` holds the build of 2026-10-26 11:37 (item 22: the ring is the real track, tilt on the
   right side, common PAP again; the 10:51 build it replaced is in `C:\FitSlice-old-2026-10-26-c`), and
   before that the build of 2026-10-26 10:51 (item 21: two drills on the card with the
   release-angle scale; the 10:18 build it replaced is in `C:\FitSlice-old-2026-10-26-b`), and before
   that the build of 2026-10-26 10:18 (items 19 and 20: the durable print defaults
   and the forward-roll axis; the 2026-10-24 20:53 build it replaced is in `C:\FitSlice-old-2026-10-26`),
   and before that the build of 2026-10-24 20:53 (item 18: the roll-line track ring with the
   axis-tilt field, on top of item 16; the 12:27 build it replaced is in `C:\FitSlice-old-2026-10-24-b`
   and the 2026-10-23 11:15 build in `C:\FitSlice-old-2026-10-24`), and before that the build of 2026-10-23 11:15 (review
   fixes, feedback parts, axis target ring, PAP on the sheet, spot pattern, two-colour 3MF, groove
   floors following the surface, build stamp in the title bar, Download 3MF button), installed
   by renaming the old folder and extracting the zip; the owner had FitSlice open each time and said
   to close it. Backups: `C:\FitSlice-old-2026-10-20` (Oct 20 build: no Rev Ball, oval holes, bevels,
   engraving or customer card), `C:\FitSlice-old-2026-10-22` (Oct 22 morning), `C:\FitSlice-old-2026-10-22-evening`
   (review fixes + feedback parts), `C:\FitSlice-old-2026-10-23-am` (ring build),
   `C:\FitSlice-old-2026-10-23-b` (spot build before the groove fix), `C:\FitSlice-old-2026-10-23-c`
   (groove-fix build, no stamp), `C:\FitSlice-old-2026-10-23-d-wrong-stamp` and `C:\FitSlice-old-2026-10-23-e`
   (stamped build before the 3MF button). All can be deleted once the installed one has been used for a real
   order; while they exist, remember the app is single-instance, so a window from a backup folder
   stays in front when `C:\FitSlice` is launched.
3. DONE 2026-10-22 (owner's go-ahead): FS-0001 ("me", Pair) was reopened in the installed app,
   given thumb 25/32 drilled + 29/32 oval at 55 deg with the -3/4 reverse finger pitches kept,
   saved and re-exported: puck (795.7 cm3, 140 x 167.7 x 60 mm) and spinner STLs with bore
   T20p2, fit sheet, job sheet (oval line, bevels, engraving FS-0001, no warnings) and customer
   card. The Oct 20 STLs are in `FS-0001 me\superseded\`. Still to do: measure the thumb length
   for `ball_thumb_depth` (FS-0002 uses the 70 mm default), and confirm the pitch sign on the
   paper sheet before printing.
4. The first Rev Ball (FS-0002, the owner's own sheet) was printed 2026-10-23/24. The owner's report
   (2026-10-24): the thumb oval leaned the wrong way (fixed, item 16), the colour lines had nothing
   to do with the PAP (replaced by the track ring, item 16), and the support scar was bad (PLA
   support interface, item 16). Not yet reported: hole fit, pitch feel, thumb depth, roll-true,
   whether the bullseye reads. Checklist: `marketing/10-ball-first-plan.md` Section 4.1.
5. Repo is public: make it private. No "patent pending" wording until a provisional is filed
   (draft package is in the IP artifact; `ip/` is local-only and not in git).
6. No rev-rate claims anywhere: the ball is a feedback tool.
7. DONE 2026-10-22 (cloud): an adversarial code review of the oval/bevel/engraving/customer-card
   batch (62 agents) found 28 defects, all fixed in the commit "Fix the 28 defects ...": cut-to-cut
   spans for ovals at any angle, the bevel sunk by the sphere's sagitta so it meets the surface
   at full width, oval-aware web and base-breakthrough warnings, engraving that fits the spinner
   base and the ball flat (default flat now 30 mm), thumb checks skipped for parts without a
   thumb hole, old orders no longer inheriting the on-screen sheet, Latin-1 names on the card,
   and job-sheet and card wording for no-thumb balls, spinners, Fit Kits and colour patterns.
   The FS-0001 / FS-0002 exports on the PC predate it. Pulled and merged on the PC the same
   evening (with the feedback parts); the zip in `app/dist` is rebuilt from the merged tree,
   installed at `C:\FitSlice` and both orders re-exported on 2026-10-23 (item 10).
8. DONE 2026-10-22: the PC's commits are on `origin/claude/bowling-grip-trainer-3d-laejva`.
   Push again after each local commit (`git push origin claude/bowling-grip-trainer-3d-laejva`).
9. The release-feedback parts (gate, axis plugs and rings, humming spinner; section below) have never
   been printed. First prints: one gate segment + pin (does the pin stand loose in its cup, do two
   segments slide together), the two plugs and two rings (press fit into the ball's sockets and ring
   pockets; the rings are flat underneath and may want a drop of glue), one spinner with
   the hum on. Tune `spin_hum_slots` / `spin_hum_angle` by ear; if it never hums at a finger-lift
   speed, drop the feature rather than ship it. Keep it off for customer orders until then.
10. DONE 2026-10-23 (owner's go-ahead): the zip rebuilt from the merged tree (review fixes +
   feedback parts; e2e 18 against it) is installed at `C:\FitSlice`, and FS-0001 and FS-0002 were
   reopened in the installed app and re-exported without edits (driven by Playwright; no warnings,
   no bad fields). FS-0001 "me" Pair: puck + spinner STLs replaced (same names), 5 files. FS-0002
   "me" Rev Ball: now 6 files: the ball (4143.8 cm3, grooves at 93.4 / 105.4 / 154 mm match the job
   sheet, two 3 mm sockets at the axis points verified on the mesh), `axis_plugs_D12.stl` (two
   bodies), `release_gate_210mm_pin100.stl` (two bodies, 81 cm3), fit sheet, job sheet (axis dots,
   RELEASE GATE and axis-plug print lines) and customer card (dots and gate sections). The saved
   orders keep their 22 mm flat; new orders get 30 mm. Re-exported again 2026-10-23 09:14 from the
   ring build: `axis_plugs_D12.stl` moved to `superseded`, `axis_inlays_D12_ring60.stl` (6.2 cm3,
   two plugs + two rings) in its place; ball 4137.7 cm3 with 3.0 mm sockets and 3.9 mm ring pockets
   at both axis points, grooves still at 93.4 / 105.4 / 154 mm; job sheet says the PAP is the
   common position (not on the sheet). FS-0001 (puck + spinner) is unaffected by the ring.
   Re-exported a third time 2026-10-23 10:40 from the spot-pattern build with the pattern switched
   to `spot_band` (saved in the order): 7 files, now with `rev_ball...3mf` (two watertight parts,
   3857.6 + 280.2 cm3, extruders 1 and 2); band at 36.4-48.4 mm (moved low, clear of the
   bullseyes), spot at 190 mm; job sheet carries the note and the 3mf advice. Re-exported a fourth
   time at 10:50 from the groove-fix build, unchanged: `groove_check` finds all three rings
   (36.4, 48.4, 190 mm) on the exported ball, 3MF parts 3857.7 + 280.2 cm3 = the STL's 4137.8.
   VERIFIED 2026-10-23 by the owner: the 3MF opened in his Bambu Studio as one object in two colours.
11. DECLINED 2026-10-23: the owner does not want a whistle ("no whistle"), nor a sensor, nor springs.
   Do not revive sound-based or electronic feedback. Kept for the record only. The owner wants instant feedback that the thumb left first
   and the fingers then lifted, and rejected a sensor module ("no sensor. too expensive/complex") and
   anything bought or sprung. The one printed-only route is a kettle-type whistle on a vent from each
   blind hole: the air a snug thumb drags in as it leaves sounds the thumb note, the fingers a higher
   one. `experiments/vent-whistle/` holds a test coupon (SCAD, STL, README): five holes, four whistle
   variants and a plain-vent control, one 80-minute print. Print it, pull the thumb out, note which
   letters sing. If one does, add it to the ball and puck as an option with the usual parity check;
   if none does, drop the idea and say so. Not in the engine or the order book. For the yo-yo arm
   motion the printed options were an elbow stop brace and a printed yo-yo; see item 12.
12. Elbow Target (2026-10-23, `accessories/elbow-target/`, SCAD + STLs + README, not in the app).
   The owner asked for an elbow stop brace for the yo-yo arm motion; built as a TARGET instead of a
   stop, because a learner's fault is not bending enough: a curved saddle strapped to the inside of
   the forearm below the crease carries a press-fit bumper (10/20/30/40 mm) that the upper arm meets
   when the elbow reaches the chosen bend at the bottom of the swing. Saddle 90 x 56 x 3 mm for a
   90 mm forearm (`forearm_d` in the SCAD; circumference / 3.14), printed standing on its block end;
   bumpers lying flat; a printed TPU strap with peg and holes, or 25 mm velcro. Meshes watertight,
   one body each (bumpers four). NOT printed: first print checks the tenon press fit (0.25 mm
   clearance), the saddle's fit to the forearm, and which bumper touches at about 90 degrees. A
   printed yo-yo remains unbuilt.
13. Small spot pattern, automatic band placement and the two-colour 3MF (2026-10-23, after the owner
   found the 45 mm cap "a lot" of filament and asked for the software to place the marks and carry
   the colours). Engine: `spot` / `spot_band` patterns (spot = ceil(highest hole-edge z) + 2 mm;
   on a no-thumb ball the holes sit on the pole, so the mark starts just below them); the band is
   searched outward from the middle in 1 mm steps for a 12 mm window clear of both bullseye zones
   (`pap.zones`), above the flat and below the top mark, else dropped with a note; `stats.pattern`
   = { spot_z, cap_z, band_mm, notes }. Every ball export now also writes `<ball>.3mf`
   (`toBambu3MF`): a stored zip with [Content_Types].xml, _rels/.rels, 3D/3dmodel.model (one
   object per colour part, a components object, a build item at 128,128 with the Bambu
   Application and BambuStudio:3mfVersion metadata) and Metadata/model_settings.config (object >
   part id/subtype=normal_part with metadata name, matrix, source_file, extruder 1|2; plate >
   plater_id, model_instance). The parts are the ball minus / within the second-colour slabs,
   split while the Manifold is alive in build(). The layout follows Bambu Studio's bbs_3mf.cpp
   (tag constants read from the source) and community notes; it parses with trimesh (two
   watertight parts) and `files.js` now allows `.3mf`. VERIFIED 2026-10-23: the owner opened the
   FS-0002 file in his Bambu Studio and it arrived as one object in two colours. The STL + heights
   remain the fallback for other slicers and the job sheet says so. The configurator page (and the
   same page inside the app) has a "Download 3MF" button next to "Download STL", shown only when the
   last build is a ball with a second-colour pattern; the bundle zip then holds STL + 3MF + fit sheet
   (engine_check 25 covers the button and the download). `trainer.scad` mirrors the spot (`ball_spot_z`) and
   takes the band centre as `band_z` (the parity check passes the engine's value; -2 = no band).
   Groove floor fix (same day, later): the marker grooves were cut as vertical cylinders, which
   near the middle is a 0.3 mm groove but low on the ball or near the top (where the surface is
   steep) becomes a lopsided ledge, up to 1 mm one side and nothing the other, which is why
   `groove_check.mjs` could not see the 36 and 190 mm grooves. Both engines now cut the floor as a
   frustum between the ball's radii at the groove's edges (`groove()` in app.js, `ball_ring` in
   trainer.scad), so the groove is 0.3 mm deep everywhere and the detector finds all three.
14. Build stamp (2026-10-23 11:00). The owner reported `Files of type ".3mf" cannot be exported.`
   after the 10:50 install, yet his own FS-0002 export at 10:54 succeeded with the 3MF, no FitSlice
   was running afterwards, and no build on the disk both writes a 3MF and refuses it (checked the
   asar of C:\FitSlice, every backup folder and dist/win-unpacked). The only builds that could say
   that were the two spot-pattern zips of 10:05-10:20, never installed. Unresolved; the owner has
   been asked where and when he saw it. So that this is answerable next time, `app:info` now carries
   `built` (the asar's timestamp when packaged, main.js's from source), shown in the window title
   (`FitSlice 1.0.0 · build 2026-10-23 11:07`) and as the first line of every job sheet. First
   version read the asar's mtime through Electron's patched fs, which presents app.asar as a folder
   with the launch time as its timestamp, so the stamp was wrong (it showed the launch time); the
   packaged build reads it through `original-fs`. The 11:00 build with the wrong stamp was installed
   for a few minutes; it sits in `C:\FitSlice-old-2026-10-23-d-wrong-stamp` (the harness would not
   delete `C:\FitSlice`, so it was renamed aside like the others) and can be deleted.
15. Ball-first selling plan (2026-10-23 afternoon; the owner asked "what are the best ways to sell
   this? ask me questions. should i go ball only first?"). Answered with four questions; the owner's
   answers: the first ball is printing now, the first buyers should be league mates and locals, a
   second printer when orders back up, under $200 of cash for 90 days. Written up as
   `marketing/10-ball-first-plan.md`: lead with the Rev Ball plus the Fit Kit, puck and spinner off
   the public line at launch, ten local balls at a $99 founder price while the first ball is checked,
   then a free static host for the configurator and an Etsy listing, the kit's launch gates (LLC,
   insurance, tolerance table, counsel) funded by the first ten, proposed ball claims, a product page
   and an Etsy listing draft, the naming decision (rule 8 forbids "ball"; owner to decide), and the
   per-file change list. The go-to-market kit (`marketing/01`-`09`, `docs/business-plan.md`, all from
   2026-10-22) is puck-first and never mentioned the ball. The business plan's patent note was wrong
   and is corrected: US7261638 lapsed 2011-08-28 for unpaid maintenance fees and claims a hollow
   cylinder with finger plugs (Google Patents, read 2026-10-23; Parts 4, 9, C14, 12 and 13 edited;
   `01` got a cross-reference under its rules table). NOT rebuilt: `marketing/gtm-kit.html` and
   `docs/business-plan.html` are rendered by `build_kit.py` / `build_plan.py` with pandoc, which is
   not on this PC; both HTML files are from 2026-10-22 and lack the new file and the correction.
   Committed and pushed 2026-10-23 (owner's go-ahead).
16. First-print fixes (2026-10-24, from the owner's report on the printed FS-0002 ball).
   (a) OVAL ANGLE CONVENTION FLIPPED: the sheet's 55 deg leaned the wrong way on the print, so a
   positive angle now turns the long axis toward the THUMB side of the sheet (left for a right
   hand): v = (-mir sin a, cos a) in `derive()` / `ovalLocalAngle()` and in `trainer.scad`; the UI
   help, START-HERE, README, the job sheet and `oval_check.py` say so. The lateral-pitch sign is
   unchanged and still unverified by hand (item 3).
   (b) TRACK RING (`pap_track`, default on; `G.track_w` 12, `track_depth` 2, `track_gap` 1): a channel
   on the great circle 90 deg from the PAP, interrupted 3 mm short of any grip hole it would run
   through (`G.track_clear`; a real track does run through holes), plus two second-colour arcs in the inlays file (`axis_inlays_D12_ring60_track12.stl`),
   built on the ball itself and brought back to the bed standing on edge, split at the track's two
   side points, slivers under 150 mm3 dropped; `papDirection()` is now shared by the ball and the
   inlays, `stats.pap.track` reports width, depth, the holes the track is interrupted at and whether
   it reaches the flat, and the notes say so. The horizontal spot/band patterns were the wrong feedback
   (nothing to do with the PAP) and are now optional: default `ball_stripe` is `none`, so a default
   ball exports no 3MF and the 3MF button hides until a pattern is chosen. The owner first asked for
   the track as a second colour in the 3MF; that is impossible in this orientation (the ring crosses
   nearly every layer, about 1,900 filament changes), so the arcs are the answer.
   (c) SUPPORTS: the job sheet and START-HERE now ask for the support interface in the other
   material (PLA under PETG), top Z distance 0, 3 interface layers; no model change.
   (d) PAP ANGLE (found by the new engine check): the sheet's over/up arcs were divided by the
   printed ball's radius, so 5 1/2" over sat 80 deg from the grip on the 200 mm ball instead of the
   regulation ball's 74 deg, and the track ran through the thumb hole and across the flat. The arcs
   are now converted to angles on the regulation radius (G.R / ball_R = 108 mm), as the pitches
   already were; the job sheet states the resulting surface distances on the printed ball
   (`stats.pap.over_ball_mm`, `up_ball_mm`). Both engines changed together.
   Tests: engine_check 26 (new 9b), feedback_check cases `inlays_notrack` and `track_ball` with SCAD
   parity for the channel and the arcs, e2e sets `spot_band` to keep exercising the 3MF.
   Results 2026-10-24 on the PC: engine_check 26/26, store tests 26, e2e 18/18 from source and
   18/18 on the packaged build, oval_check all ok (the 55 deg thumb oval now measures toward the
   thumb side on right and left hands; SCAD parity oval_ball 0.9991, oval_puck 0.9988,
   finger_oval 0.9988, nothumb_ball 0.9991, bevel_puck 0.9988; its no-thumb checks had been
   reading the axis-target points as hole axes since the PAP was added and now filter by name),
   feedback_check all ok with SCAD parity gate 0.9999, plugs 0.9989, inlays_notrack 0.9988,
   dots_ball 0.9991, track_ball 0.9991 (the channel), hum 0.9984, and inlays (plugs + rings + the
   two arcs) 0.9923 against a threshold lowered to 0.99 for that case only: the arcs are 2 mm
   thick with both faces spherical, so the two engines' facet sag alone costs about 0.8%, while
   bodies, volumes and centroids agree to 0.01 cm3 / 0.1 mm. feedback_check.py now reuses a
   scad_<case>.stl newer than trainer.scad (`--rerender` forces the render). On the owner's sheet
   the track skirts the thumb and the middle finger (a notch each, both arcs in one piece), the
   channel takes 14.2 cm3 out of the ball, and the inlays file is 20.4 cm3 in 6 bodies (two
   200 x 99.5 x 12 mm arcs). Zip rebuilt: `app/dist/FitSlice-1.0.0-win-x64.zip` (2026-10-24).
   Installed at `C:\FitSlice` 2026-10-24 on the owner's "re do it all for me" (FitSlice was not
   running; the old build was renamed to `C:\FitSlice-old-2026-10-24`). FS-0001 re-exported
   unchanged (5 files; the puck's thumb oval now leans toward the thumb side) and FS-0002
   re-exported with `ball_stripe` switched to `none` and saved: 6 files (ball STL 4123.4 cm3,
   `axis_inlays_D12_ring60_track12.stl` 20.3 cm3 in 6 bodies, gate, fit sheet, job sheet stamped
   build 2026-10-24 12:27, card); the old 3MF and inlays file went to `superseded`. Committed and
   pushed the same day (1fb4d52). Superseded the same evening by item 17.
17. Track ring placed clear of the holes (2026-10-24 evening; the owner, looking at the re-exported
   ball: "shouldn't the band not go thru the thumb hole?"). With a 5 1/2" PAP the equator about the
   axis passes 17 mm from the thumb centre, so a 12 mm band cannot clear the thumb bevel, and the
   item-16 interruption still read as a band through the hole. Now `trackPlan()` (shared by the ball
   and the inlays) picks the largest circle about the axis point, searching outward from 90 deg in
   0.5 deg steps within `G.track_min` 45 to `G.track_max` 110, that keeps `G.track_clear` 3 mm clear
   of every grip hole (bore + oval + bevel), the resting flat and both bullseye pockets; any circle
   about the axis stands still when the axis is right, and a smaller one is the track of a
   higher-tilt release. On the owner's sheet the ring sits at 54 deg (the track of a release with
   36 deg of tilt), a 162 mm circle round the bullseye, nowhere near the holes. Only when nothing in
   range clears does the ring stay on the equator and get interrupted (the item-16 guards). The
   channel and arcs are cut as a zone between polar angles theta +- beta (`zoneSlab`; band width
   measured along the surface). The arcs stand on their lower rim, which is a cone, so a flat foot
   is cut at the inner corner (`G.track_foot` 0.8 mm, never more than 3/4 of the rim's drop, nothing
   on a great circle) and they lean inward about 36 deg: on the owner's sheet two identical pieces
   168.5 x 83.8 x 9.7 mm, 6.0 cm3 each, no notches. `stats.pap.track.angle_deg`; the plugs part now
   also reports `pap.track` so the parity check can pass `track_angle` to the SCAD (`track_angle`,
   `track_foot`, `zone_slab` in trainer.scad; the SCAD does not search, it takes the angle). Job
   sheet, card, UI help, START-HERE, release-feedback and the ball-first plan say where the ring
   sits and why. oval_check's cases now set `pap_track: false` (the ring's angle is the feedback
   check's business). Results: engine_check 26/26 (9b asserts 45-70 deg on the owner's sheet and 90
   deg with a PAP 100 mm over), e2e 18/18 from source and 18/18 packaged, feedback_check all ok with
   parity gate 0.9999, plugs 0.9989, inlays 0.9954 (the 54 deg arcs match better than the 90 deg
   ones did), inlays_notrack 0.9988, dots_ball 0.9991, track_ball 0.9991, hum 0.9984; the channel
   takes 12.1 cm3 out of the ball; oval_check all ok (its cases now set `pap_track: false` and pass
   the pap_* keys to the SCAD, parity 0.9991 / 0.9988 / 0.9988 / 0.9991 / 0.9988). Never installed:
   superseded by item 18 the same evening, when the owner said what the ring is for.
18. The ring is the roll line (2026-10-24 evening; the owner: "i want that ring to be basically the
   line you want the ball to follow via those rpms based on their pap"). The item-17 "largest clear
   circle" is gone. `trackPlan()` now puts the ring (90 - `track_tilt`) deg from the axis point: the
   circle the ball rolls on when it spins about the PAP with that axis tilt. `track_tilt` is a new
   field (Ball screen, under the track checkbox; `TRACK_TILT` 0-45 deg, default 0 = end over end, the
   ring is the equator about the axis point; store.js `track_tilt` num def 0; SCAD `track_tilt`,
   `track_angle = 90 - track_tilt`, passed by the parity check). Where that line runs through a grip
   hole, as a real track does (on the owner's sheet the thumb and the middle finger at 0 deg tilt; the
   ring finger too at 20 deg), the channel and the arc stop `G.track_clear` = 1.5 mm short of the
   bevel (the item-16 guards), so the grip is untouched and that arc comes in pieces; the notes, job
   sheet, card, UI help, START-HERE, release-feedback and the ball-first plan say so ("roll it right
   and the ball rolls along the ring while the ring holds still"). The arcs keep the item-17 flat foot
   (nothing is cut on a great circle). Results: engine_check 26/26 (9b: equator + thumb and middle
   finger at 0 deg, 70 deg and the ring finger at 20 deg, 50 deg refused, a PAP 100 mm over clears
   the holes), e2e 18/18 from source and 18/18 packaged, oval_check all ok, feedback_check all ok with
   parity gate 0.9999, plugs 0.9989, inlays 0.9923 (need 0.99), inlays_notrack 0.9988, dots_ball
   0.9991, track_ball 0.9991, tilt_ball 0.9991 (20 deg tilt), hum 0.9984; the first parity run
   failed on inlays (0.9830) because the SCAD still had track_clear 3 while the engine had 1.5, fixed
   in the SCAD. The job sheet and START-HERE then gained the support threshold angle 45 (the owner
   asked what angle to use: supports then hold the whole underside up to 29 mm above the flat) and
   the zip was rebuilt (`app/dist/FitSlice-1.0.0-win-x64.zip`, 2026-10-24 evening). Installed at
   `C:\FitSlice` the same evening on the owner's go-ahead (FitSlice was open and was closed as
   authorised, nothing unsaved; the 12:27 build went to `C:\FitSlice-old-2026-10-24-b`). FS-0002
   re-exported unchanged: 6 files, job sheet stamped build 2026-10-24 20:53 with the track-ring and
   threshold-45 lines. The owner had meanwhile saved his own PAP in the order (4 1/2" over, 2" up,
   `pap_given` true), so on his ball the roll line runs through the thumb hole only: the inlays
   file is 20.2 cm3 in 7 bodies (one arc whole, the other in two pieces of 176 and 43 mm).
   Committed and pushed the same evening (f973b9a).
19. Durable print defaults for the ball (2026-10-26; the owner asked what to do for durability and
   took the advice). The job sheet and START-HERE now say: PETG (not PLA: it cracks), 4 walls, 8%
   gyroid infill, 5 top and bottom layers, nozzle at the top of the PETG range (about 250 C) with the
   part fan at 30 to 40% so the layers bond; the filament estimate uses a 1.8 mm shell and 8%
   (`buildFiles` and `showStats` in app.js), so a 200 mm ball reads about 710 g (was 475 g at 3
   walls / 5%); the UI help and the ball-first plan say about 700 g; e2e asserts the new line.
   Engine 26, store 26, e2e 18 from source. Packaged, installed and committed together with item 20
   on 2026-10-26 (see there).
20. The forward-roll axis is the ball's default axis; the readings follow the carpet physics
   (2026-10-26; the owner: "ensure this does what I claim ... a way to help people stay behind the
   ball, with a yo-yo release"). Worked on a uniform 200 mm, 700 g ball (I about 0.5 m R^2; the
   scratchpad script `carpet_swing.py`): carpet stops the slip within 10 to 30 cm and the friction
   swings the spin axis inside the ball by about two thirds of the axis rotation at release (45 deg
   of rotation: a 33 deg swing, 57 mm on the surface, a 12 deg kink in the path; 0 deg: none), so
   the old card reading ("bullseye still = axis right; wheels = hand came round") was wrong for
   every hook release, and a straight forward roll (the yo-yo release) spins about an axis 90 deg
   round from the grip centre (a straight finger lift turns the ball about the line between the
   finger holes), not about a bowler's hook PAP. Changes: `DEFAULTS.pap_over = G.R * Math.PI / 2`
   (169.65 mm, 6 11/16"), `pap_up = 0` (was 5 1/2" over, 1/2" up); store.js defs 169.65 / 0;
   trainer.scad `pap_over = 169.646`, `pap_up = 0`, `pap_dir` falls back to `ball_R*PI/2`, 0. With
   it the ring at 0 tilt is the full roller's track (thumb, between the fingers, over the top): on
   the owner's sheet it crosses all three holes and the resting flat (arcs in three pieces, 7.1 /
   5.3 / 1.2 cm3; the flat is 0.6 mm deep, the arc flattened there) and the channel across the pole
   lowers the ball's bbox by 0.2 mm (e2e now expects 198.7). `pap_given` keeps the sheet PAP. Copy:
   the card has a STAYING BEHIND THE BALL (THE YO-YO ROLL) block for the default axis (still at
   centre height = behind the ball; swings back = came round, the ring wobbles, the path kinks) and
   a YOUR AXIS POINT block for a sheet PAP (read in the first frames of a slow-motion clip; a smooth
   floor holds it twice as far); the card's axis line now prints the engine's values (`pb.over_mm`),
   not the stale fit fields; readings say "hand coming round the ball" / "hand behind the ball" and
   "more curve = more side rotation, or more revs"; job sheet, START-HERE, template help, the kit
   (axis row, how-it-is-used, a "What carpet does to the axis" paragraph, 4.1 rows, section 6: a new
   green and yellow claim and a red one, product page, Etsy description, FAQ) and release-feedback
   section 2 rewritten to match. Tests: engine_check 26/26 (default 169.65 / 0 and 157.1 mm on the
   ball, ring crosses 3 holes + on_flat true, tilt 20 clears the holes about the forward-roll axis
   and still crosses the ring finger about a sheet PAP 5 1/2 / 1/2), store 26, e2e 18 from source.
   Parity (engine vs OpenSCAD, 2026-10-26 09:32 to 09:57): feedback PASS (gate 0.9999, plugs 0.9989, inlays
   0.9925, inlays_notrack 0.9988, dots_ball / track_ball / tilt_ball 0.9991, hum 0.9984; the track channel
   13.7 cm3; the arcs 3 pieces), oval PASS (0.9991 / 0.9988 / 0.9988 / 0.9991 / 0.9988). The tilt_ball check
   in feedback_check.py no longer compares volumes (about the forward-roll axis the 70 deg ring clears the
   holes and lands within 0.5 cm3 of the 90 deg one); it probes the surface 70 deg from the axis point
   toward the bottom: 2.01 mm deep on tilt_ball, 0.02 on track_ball. Packaged 2026-10-26 10:18 (`app/dist/FitSlice-1.0.0-win-x64.zip`), packaged
   e2e 18/18, installed at `C:\FitSlice` on the owner's go-ahead (FitSlice was not running; the 20:53
   build went to `C:\FitSlice-old-2026-10-26`). FS-0002 re-exported unchanged: 6 files, job sheet
   stamped build 2026-10-26 10:18 with the new axis and track lines, the card's YOUR AXIS POINT block
   (the order has the owner's own PAP), inlays 20.2 cm3 in 7 bodies as before. Committed and pushed
   with item 19 the same morning. Old orders saved with `pap_given` false re-export with
   the forward-roll axis (the engine ignores their stale 139.7 / 12.7 fields), which is intended.
21. Two drills, one ball: the card carries both releases (2026-10-26, later; the owner: "i want the
   ball to train on the yo yo as well as proper release. that is the entire purpose of the product",
   then "i want the product itself to promote these things"). No geometry change. The instrument for
   the proper release is the ring itself: it turns with the finger line, so a phone on the floor
   behind the release point sees it as a straight line on a forward roll and as an oval that opens
   with the hand's turn, width over height = sin(release angle); a lean is axis tilt. The card's PDF
   writer draws that scale (`ovalScale` in orders.js: a line and three Bezier ovals at 0, 30, 45 and
   60 deg with a floor line and labels, pushed as `{ scale: true }`, only when the ball has the track
   ring). Card block "REV BALL: TWO DRILLS, ONE BALL": the five outcome readings; DRILL 1, THE YO-YO
   ROLL (forward-roll ball: bullseyes still, ring on the tape, centre pin; sheet-PAP ball: read the
   path, the bullseye wheels in a small circle); DRILL 2, THE PROPER RELEASE (turn through the ball;
   the oval against the scale, the ball kinks to the thumb side and knocks a pin one or two over,
   the bullseye's circle is the rotation; the same oval, pin and circle ten in a row). The gate's
   card text and START-HERE name the centre pin as the yo-yo target and a pin one or two over as the
   hook target (`hookSide`: left for a right-hander). A second "hook line" on the ball was rejected:
   at a turned release no line on the ball lies along the tape, since the whole ball turns with the
   hand and then skids. Same text in START-HERE, the configurator help, the kit (section 2 how-it-is-
   used and gate rows, 4.1 hero clip, section 6: a green oval claim, a yellow "two drills" claim, the
   line "Two drills. One ball.", product page bullet, Etsy description, what ships, FAQ) and
   release-feedback section 2. e2e asserts the two drill headings, the gate's "yo-yo target", the
   line and three ovals and the "45 deg hook" label in the card. Store 26, e2e 18 from source,
   engine 26; no parity needed. Packaged 2026-10-26 10:51, packaged e2e 18/18, installed at
   `C:\FitSlice` on the owner's go-ahead (FitSlice was not running; the 10:18 build went to
   `C:\FitSlice-old-2026-10-26-b`). FS-0002 re-exported unchanged: 6 files, job sheet stamped build
   2026-10-26 10:51, the card with both drills and the drawn scale (two pages; drill 1 reads the path,
   since the order has the owner's own PAP). Committed and pushed the same morning.
22. The ring is the bowler's real track; the tilt was on the wrong side (2026-10-26, midday; the
   owner: "the ring around the ball just seems wrong. based on the pap, i want the ring to form and be
   accurate"; asked, he chose the real track, said his sheet gives the tilt, and confirmed 4 1/2 over,
   2 up). Two causes. (a) SIGN ERROR: the axis point is the UPPER end of a tilted axis, so the track is
   the circle (90 + tilt) deg from the PAP, round the opposite axis point on the far side of the ball,
   lower and further from the holes as tilt grows; the engine and SCAD had (90 - tilt), on the PAP's
   side, which no parity check could see (both wrong the same way; identical at 0). Fixed in
   `trackPlan` (`theta = (90 + p.track_tilt) * DEG`) and `trainer.scad` (`track_angle = 90 +
   track_tilt`); `TRACK_TILT` 0-60. (b) The forward-roll default of item 20 put the ring through the
   thumb and between the fingers (a full roller's track), which reads as wrong to any bowler. Reverted:
   DEFAULTS `pap_over 5.5"`, `pap_up 0.5"` (store 139.7 / 12.7; SCAD too), and `track_tilt` now
   defaults to 15 (typical hook; the sheet's value when given). New: `trackPlan` returns `gaps` (mm
   along the surface from each hole's bevel rim to the ring's centre line, negative = through the
   hole) -> `pap.track.gaps_mm`; a note and the job sheet print them ("compare it with the oil ring
   on the bowler's own ball"); a WARNING when the ring would cross a hole ("on a real ball that track
   would hit the hole: check the PAP and the axis tilt"), the guard interruption kept. Card: the ball
   block opens with the axis point and "your track ... passing N mm from the thumb hole, ...; it is
   where the oil ring runs on your own ball"; drill 1 (yo-yo roll) now reads the PATH on every ball
   (a straight lift spins the ball about the line between the finger holes, not the PAP, so the
   bullseye wheels in a small circle and the ring shows part open); drill 2's oval is the AXIS
   ROTATION (the track ring is square to the axis the ball spins about), lean = tilt; the scale's 0
   label lost "yo-yo". Template help, START-HERE (axis target, track ring, PAP paragraphs), the kit
   (axis row, how-it-is-used, the carpet paragraph with the history, 4.1 rows, hero clip, section 6
   claims, product page, Etsy copy, what to send, FAQ incl. "Is the ring my real track?") and
   release-feedback rewritten. Tests: engine_check 9b rebuilt (default: 105 deg, clear of the holes,
   gaps > 15 mm, no warning; 0 tilt: equator through the thumb (and the middle finger's bevel zone on
   the owner's sheet), warning; 30 deg further from the holes; 70 refused; the owner's 4 1/2 x 2 at
   0 tilt warns, at 15 clears); feedback_check.py's tilt probe moved to 110 deg sideways from the
   axis point (2 mm on tilt_ball, plain on the 15-deg ball). Engine 26, store 26, e2e 18 from source.
   Parity (11:11 to 11:34): feedback PASS (gate 0.9999, plugs 0.9989, inlays 0.9935, inlays_notrack 0.9988,
   dots_ball / track_ball / tilt_ball 0.9991, hum 0.9984; the 105-deg channel 14.2 cm3; the arcs two whole
   pieces of 195 mm; the 110-deg probe 2.01 / 0.02 mm), oval PASS (0.9991 / 0.9988 / 0.9988 / 0.9991 /
   0.9988). Packaged 2026-10-26 11:36, packaged e2e 18/18, installed at `C:\FitSlice` on the owner's
   go-ahead (FitSlice was not running; the 10:51 build went to `C:\FitSlice-old-2026-10-26-c`).
   FS-0002 re-exported unchanged: 6 files, job sheet stamped build 2026-10-26 11:37. The order still
   has `track_tilt` 0, so its ring is the equator about his PAP, through the thumb hole (centre line
   through the thumb, 42 mm from the middle finger, 72 mm from the ring finger), and the job sheet
   carries the new WARNING ("check the PAP and the axis tilt"), as designed: the owner said his sheet
   gives the tilt and will enter it in the app, then re-export. Committed and pushed the same midday.

## Windows session 2026-10-22 (local Claude Code on the owner's PC)

**Item 1 result.** A fresh `FitSlice-1.0.0-win-x64.zip` was built on Windows from this source
and the packaged `FitSlice.exe` was launched on Windows for the first time with a build that
has the Rev Ball (the Oct 20 build in `C:\FitSlice` predates it).
- Plain launch (the double-click path, real order book): window up in about 1 s, FS-0001 listed,
  clean close, `orders.json` untouched. No SmartScreen prompt because this exe was built on the
  PC; a downloaded zip will still show one.
- Driven through its real UI with Playwright against the REAL order book and orders folder,
  which is what item 1 asked for: inches mode, the owner's sheet typed exactly as listed above,
  including the 29/32 oval at 55 deg and the -3/4 finger pitches. Parsed to 19.844 / 23.019 /
  16.669 / 15.875 mm, spans 104.775 / 109.538 mm, no red fields, no model warnings on the ball.
  New order "me", product Rev Ball, "Save and export print files" gave **FS-0002**, 4 files in
  `Documents\FitSlice Orders\FS-0002 me\`: `rev_ball200_R_span104p8-109p5_T20p2_M17p1_R16p3.stl`
  (16,486 triangles, 4144.9 cm3, 200 x 200 x 199.39 mm, about 475 g at 5%), `fit_sheet.json`
  (records the oval, bevels and `serial` FS-0002), `job_sheet.txt` and `customer_card.pdf` (one
  page, renders, carries order, fit and instructions, no contact details). No page errors, no
  content-policy violations. A parallel session made the same run against a temp order book
  (`FITSLICE_DATA_DIR`) with the same result, and its STL from the packaged exe was
  byte-identical to one from the source tree.
- Colour changes on the job sheet: 93.4 mm second colour, 105.4 mm base colour, 154 mm second
  colour. `configurator/test/groove_check.mjs` finds exactly three full-ring 0.3 mm grooves in
  the exported STL, centred at 93.4, 105.4 and 154.0 mm (each shows as two edge rings 0.6 mm
  apart); nothing else goes all the way round. The heights the sheet gives the slicer match the
  mesh.
- Tests on Windows (Node 24): unit 26/26, engine checks 17/17, e2e from source 18/18, e2e
  against the packaged exe 18/18.
- NOT verified: the layer slider in Bambu Studio (item 1 above), the oval's orientation on a
  real ball, anything physical. Screenshots and the run record are in `app/test/tmp/` (ignored
  by git).

**Source changes committed from the PC** (none changes what the shipped app does):
- `configurator/build.py` reads and writes UTF-8 with LF explicitly. Before, a Windows run
  crashed on cp1252 or wrote CRLF pages; now a Windows rebuild is byte-identical to the
  committed `index.html`, `artifact.html` and `app/renderer/index.html` (verified).
- `app/package.json`: `build:renderer` falls back to `py -3` where `python3` is the Store stub.
- `app/lib/trust.js` resolves with `path.win32` / `path.posix` according to the `platform`
  argument rather than the host's module; `app/test/store.test.js` writes its Linux file URLs
  by hand because `pathToFileURL` follows the host OS (test 23 failed on Windows before this).
  Windows runtime behaviour is unchanged: the e2e proves every IPC call still passes the check.
- `configurator/test/groove_check.mjs` (new): full-ring grooves in a ball STL vs the job sheet.
- `app/README.md`: Node >= 22 and Windows notes.

## Release feedback parts (2026-10-22, built and tested on the PC, NOT printed)

Owner's ask: immediate feedback on release quality, with the constraint "no springs, 3D printed
only". Design notes and the honest limits are in `docs/release-feedback.md`. Three features, each
in the engine, `trainer.scad`, the configurator UI, the order book schema, the job sheet, the
customer card and the tests:

1. **Release gate** (part and product `gate`; also in every Rev Ball and digital-ball order). One
   dovetailed base segment (ball diameter + 10 mm long, 40 x 6 mm, 1 mm tape groove) and one loose
   pin (20 mm across, `gate_pin_h` 50-150 mm, default 100) per file; print 3 or 5 copies. The ball
   knocks down the pin where it crosses the tape line. Cup clearance 1 mm, dovetail clearance
   0.3 mm: check both on the first print.
2. **Axis target: dots and rings** on the ball (`pap_marker` and `pap_ring`, both on by default).
   Two 12 mm sockets, each inside a 60 mm flat-bottomed ring pocket (r 28-32 mm, 3 mm deep at the
   outer edge), at the axis point and its opposite. The PAP is measured the pro-shop way, along the
   surface from the CENTRE OF THE GRIP (midpoint of the thumb hole and the middle of the two finger
   holes, computed from the holes as drilled) or from the MIDDLE OF THE FINGERS on a no-thumb ball;
   over first toward the hand side, then up toward the fingers. `pap_given` (on the Drill sheet, Ball
   screen) says the sheet gives the PAP (`pap_over`, `pap_up`, validated); otherwise the common
   139.7 x 12.7 mm (5 1/2" x 1/2") is used and the job sheet and card say "not on the sheet". The
   matching part `plugs` holds two plugs and, with the ring on, two inlay rings (56/64 mm, flat
   underneath, top following the ball), file `axis_inlays_D12_ring60.stl` (`axis_plugs_D12.stl`
   with the ring off), exported with the ball only when the dots are on. Warnings when a dot or
   ring would land on a grip hole or on the resting flat. Added 2026-10-23 at the owner's request
   ("the PAP on the sheet ... from the centre of the grip; no thumb, from the middle of the fingers").
3. **Humming spinner** (spinner: `spin_hum`, off by default; `spin_hum_slots` 2-16;
   `spin_hum_angle` 0-80 degrees from radial, mirrored for a left hand). Ring cavity r 30-44 mm,
   floor at 5 mm, walls to 16 mm, 45-degree gable ridge at 23 mm (prints without supports); slots
   2 x 10 mm from the top into it; the wrist-cord tunnel is left out with it. Experimental: whether
   it hums at a finger-lift spin speed is unknown until printed. Holes that reach the chamber wall
   warn.

Parity with `trainer.scad` (IoU of the browser mesh against OpenSCAD 2021.01, print_allowance 0,
the owner's sheet, after the merge with the review fixes): gate 0.9999, plugs 0.9989, inlays (plugs +
rings) 0.9988, ball with dots, rings and the spot pattern 0.9991, ball with dots
0.9991, humming spinner 0.9984 (16 slots 0.9984); volumes agree within 0.3%. Tests on the PC:
engine_check 24, unit 26, e2e 18 from source and against the rebuilt zip,
`feedback_check` 8 cases (mesh checks: two bodies in the gate file, 3 mm sockets at the reported
axis points, the ring cavity and no tunnel in the hum spinner).

## Artifacts (claude.ai, owner-private)

Configurator https://claude.ai/artifact/1fiDeAkPe9RPJSyBWruE2p (v6), site
https://claude.ai/artifact/Jj4K6pxdrvyJicbzsicqEj, marketing kit
https://claude.ai/artifact/6e7gbT4rCUBekwZ4mezmyV, IP package
https://claude.ai/artifact/EGyojXMG4MGQtu6xF1igQS.
