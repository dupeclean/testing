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
  earlier keep their 22 mm), blind thumb 70 mm, cap + band colour pattern with swap heights on
  the job sheet, 0.3 mm grooves at colour boundaries; thumb_hole=false gives a two-handed ball.
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
PLAYWRIGHT_PATH=<playwright> node configurator/test/engine_check.mjs   # 24
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
PLAYWRIGHT_PATH="$PW" node ../configurator/test/engine_check.mjs   # 24
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
2. DONE (owner's go-ahead each time): `C:\FitSlice` holds the build of 2026-10-23 08:55 (review
   fixes, feedback parts, axis target ring, PAP on the sheet), installed by renaming the old folder
   and extracting the zip (the owner had it open; closed with his say-so). Backups: `C:\FitSlice-old-2026-10-20`
   (Oct 20 build: no Rev Ball, oval holes, bevels, engraving or customer card), `C:\FitSlice-old-2026-10-22`
   (Oct 22 morning build) and `C:\FitSlice-old-2026-10-22-evening` (review fixes + feedback parts, no
   ring). All three can be deleted once the installed one has been used for a real order.
3. DONE 2026-10-22 (owner's go-ahead): FS-0001 ("me", Pair) was reopened in the installed app,
   given thumb 25/32 drilled + 29/32 oval at 55 deg with the -3/4 reverse finger pitches kept,
   saved and re-exported: puck (795.7 cm3, 140 x 167.7 x 60 mm) and spinner STLs with bore
   T20p2, fit sheet, job sheet (oval line, bevels, engraving FS-0001, no warnings) and customer
   card. The Oct 20 STLs are in `FS-0001 me\superseded\`. Still to do: measure the thumb length
   for `ball_thumb_depth` (FS-0002 uses the 70 mm default), and confirm the pitch sign on the
   paper sheet before printing.
4. Nothing has been printed or rolled. Print the puck first (about 3 h) to check the oval thumb
   fit and the 55 deg orientation against the real ball, then the ball (10-14 h).
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
11. DECLINED 2026-10-23: the owner does not want a whistle ("no whistle"), nor a sensor, nor springs.
   Do not revive sound-based or electronic feedback. Kept for the record only. The owner wants instant feedback that the thumb left first
   and the fingers then lifted, and rejected a sensor module ("no sensor. too expensive/complex") and
   anything bought or sprung. The one printed-only route is a kettle-type whistle on a vent from each
   blind hole: the air a snug thumb drags in as it leaves sounds the thumb note, the fingers a higher
   one. `experiments/vent-whistle/` holds a test coupon (SCAD, STL, README): five holes, four whistle
   variants and a plain-vent control, one 80-minute print. Print it, pull the thumb out, note which
   letters sing. If one does, add it to the ball and puck as an option with the usual parity check;
   if none does, drop the idea and say so. Not in the engine or the order book. For the yo-yo arm
   motion the printed options are an elbow stop brace and a printed yo-yo (not started).

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
rings) 0.9988, ball with dots and rings 0.9991, ball with dots
0.9991, humming spinner 0.9984 (16 slots 0.9984); volumes agree within 0.3%. Tests on the PC:
engine_check 24, unit 26, e2e 18 from source and against the rebuilt zip,
`feedback_check` 8 cases (mesh checks: two bodies in the gate file, 3 mm sockets at the reported
axis points, the ring cavity and no tunnel in the hum spinner).

## Artifacts (claude.ai, owner-private)

Configurator https://claude.ai/artifact/1fiDeAkPe9RPJSyBWruE2p (v6), site
https://claude.ai/artifact/Jj4K6pxdrvyJicbzsicqEj, marketing kit
https://claude.ai/artifact/6e7gbT4rCUBekwZ4mezmyV, IP package
https://claude.ai/artifact/EGyojXMG4MGQtu6xF1igQS.
