# Handoff for a local Claude Code session

State of the project as of commit `0fac0da` on branch `claude/bowling-grip-trainer-3d-laejva`
(2026-10-22). Read this first, then `app/docs/START-HERE.txt` and `app/README.md`.

## Owner and goal

The owner is a beginner bowler running a small made-to-order business on a Windows PC with a
Bambu Lab P1S + AMS. FitSlice: drill-sheet values in, printable STL out, as a local desktop app
with an order book. Products: Rev Puck (grip/thumb-exit trainer), Rev Ball (200 mm release
trainer, two-colour), Rev Spinner, Fit Kit (sizer plate), digital files. Keep explanations
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
- Rev Ball: R = ball_d/2, resting flat 22 mm, blind thumb 70 mm, cap + band colour pattern with
  swap heights on the job sheet, 0.3 mm grooves at colour boundaries; thumb_hole=false gives a
  two-handed ball.

## Owner's own sheet (drillsheet.com, right hand)

Thumb 25/32 drilled, 29/32 oval at 55 deg, pitch 0 forward, -1/8 lateral. Middle (left hole)
21/32, cut-to-cut span 4 1/8, -3/4 (reverse) forward, -1/4 lateral. Ring (right hole) 5/8,
span 4 5/16, -3/4 forward, +1/4 lateral. Bridge 1/2. Finger oval sizes unknown (measure the
inserts; 0 = round). Thumb length not yet measured (needed for ball_thumb_depth).

## Tests (all green at this commit)

```
cd app && npm install
node --test app/test/*.test.js                                   # 26
PLAYWRIGHT_PATH=<playwright> node configurator/test/engine_check.mjs   # 17
PLAYWRIGHT_PATH=<playwright> xvfb-run -a node app/test/e2e.mjs   # 18 (Linux; on Windows run without xvfb-run)
node configurator/test/oval_check.mjs <out> && python3 configurator/test/oval_check.py <out> --scad
node configurator/test/pitch_check.mjs <out> && python3 configurator/test/pitch_check.py <out>
cd app && npm run dist:win                                       # app/dist/FitSlice-1.0.0-win-x64.zip
```
The Python checks need `trimesh`, `shapely`, `manifold3d`, `numpy`; `--scad` needs `openscad`
on PATH. On Windows, Playwright can be installed with `npm i -D playwright` in `app/`.

## Not yet done (needs the owner's machine or hands)

1. FitSlice.exe has never been launched on Windows (built on Linux with electron-builder).
   Launch it, enter the sheet above in inches mode, make a Rev Ball order, export, open the
   STL in Bambu Studio, confirm the three colour-change heights and the customer card PDF.
2. Nothing has been printed or rolled. Print the puck first (about 3 h) to check the oval thumb
   fit and the 55 deg orientation against the real ball, then the ball (10-14 h).
3. Repo is public: make it private. No "patent pending" wording until a provisional is filed
   (draft package is in the IP artifact; `ip/` is local-only and not in git).
4. No rev-rate claims anywhere: the ball is a feedback tool.
5. An adversarial code review of the oval/bevel/engraving/customer-card batch was run from the
   cloud session; its findings, if any, will be reported there.

## Artifacts (claude.ai, owner-private)

Configurator https://claude.ai/artifact/1fiDeAkPe9RPJSyBWruE2p (v6), site
https://claude.ai/artifact/Jj4K6pxdrvyJicbzsicqEj, marketing kit
https://claude.ai/artifact/6e7gbT4rCUBekwZ4mezmyV, IP package
https://claude.ai/artifact/EGyojXMG4MGQtu6xF1igQS.
