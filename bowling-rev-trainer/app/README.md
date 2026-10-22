# FitSlice desktop app

Drill sheet in, print-ready STL out, plus a local order book. Everything runs on the
computer: no account, no server, no network access (the page's content policy blocks it).

The owner-facing instructions are in [`docs/START-HERE.txt`](docs/START-HERE.txt); that
file ships next to `FitSlice.exe`.

## What it is

- **Electron shell** (`main.js`, `preload.js`) around the same geometry engine the web
  configurator uses (`../configurator/app.js`, Manifold WASM + three.js, inlined into one HTML
  file by `../configurator/build.py`).
- **Order book** (`lib/store.js`, UI in `renderer-src/orders.*`): orders, statuses, saved drill
  sheets, CSV export. Order numbers (`FS-0001`, ...) are never reused.
- **Exports** (`lib/files.js`): one folder per order with the STLs (order number engraved in
  the base), `fit_sheet.json`, `job_sheet.txt` (print settings, filament-change heights, no
  customer contact details) and `customer_card.pdf` (a one-page how-to for the customer,
  written without a PDF library in `renderer-src/orders.js`).

## Run from source

```
cd app
npm install
python3 ../configurator/build.py      # regenerates renderer/index.html (do this after changing ../configurator/*)
npm start
```

Needs Node 22 or newer: Electron's binary installer and electron-builder load an ES-module
dependency (`@electron/get` 5), so Node 20.11 stops with `ERR_REQUIRE_ESM` and no
`electron.exe` is downloaded. On Windows, `python3` on PATH is often the Microsoft Store stub;
call the real `python.exe` by its full path instead.

## Build the Windows zip (works from Linux or macOS, no Wine needed)

```
npm run dist:win     # dist/FitSlice-1.0.0-win-x64.zip, contains FitSlice.exe and START-HERE.txt
```

On Windows the `predist` hook's `python3` call usually fails (Store stub), so run the three
steps yourself: `build.py` with your real Python, `npm test`, then
`node node_modules/electron-builder/cli.js --win zip --x64 --publish never`.

The exe is unsigned, so Windows SmartScreen shows "Windows protected your PC" on first run
("More info" then "Run anyway"). A code-signing certificate removes that.

## Tests

```
npm test                                           # unit tests: store, file naming, validation
PLAYWRIGHT_PATH=/path/to/playwright xvfb-run -a node test/e2e.mjs
                                                   # launches the real app, enters a sheet, exports, restarts
FITSLICE_E2E_BIN=dist/linux-unpacked/fitslice xvfb-run -a node test/e2e.mjs   # same, against a packaged build
```

On Windows run the same without `xvfb-run` (the app's windows open on the desktop for a
minute); `FITSLICE_E2E_BIN` is then `dist\win-unpacked\FitSlice.exe`. Playwright can be added
without changing `package.json` with `npm install --no-save playwright`.

Geometry (pitch direction, bridge, spans, oval holes, bevels, engraving, the Rev Ball, parity
with OpenSCAD) is tested from `../configurator/test/` (`engine_check.mjs`, `pitch_check.mjs` +
`pitch_check.py`, `oval_check.mjs` + `oval_check.py --scad`).

## Where data lives

| What | Windows | Override (tests / portable use) |
|---|---|---|
| Order book + backup | `%APPDATA%\FitSlice\orders.json`, `orders.json.bak` | `FITSLICE_DATA_DIR` |
| Print files | `Documents\FitSlice Orders\<FS-#### Name>\` | `FITSLICE_ORDERS_DIR` or File > Choose orders folder |

## Security model

Renderer is sandboxed (`contextIsolation`, no Node integration, `sandbox`), talks to the
main process only through the named functions in `preload.js`, and every IPC handler checks
that the caller is the app's own page. A strict CSP forbids network access. The main process
validates every order field and file name (no path traversal, Windows reserved names are
rejected, only `.stl` / `.json` / `.txt`, size and count limits) and writes atomically
(temp file, fsync, rename) with a one-generation backup.
