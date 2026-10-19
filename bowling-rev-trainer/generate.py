#!/usr/bin/env python3
"""Fit-sheet -> STL generator for the bowling rev trainer.

Turns a customer fit sheet (JSON) into print-ready STLs by driving
OpenSCAD headlessly. This is the order pipeline: collect the fit sheet,
run this, print (or deliver) the STLs.

Single order:
    python3 generate.py fit_sheet.example.json -o out/

Batch of orders (CSV with a header row; columns = fit-sheet keys,
plus a required "name" column):
    python3 generate.py orders.csv -o out/

Any key you leave out falls back to the defaults in trainer.scad.
Requires: openscad on PATH (https://openscad.org).
"""

import argparse, csv, json, shutil, subprocess, sys
from pathlib import Path

SCAD = Path(__file__).parent / "trainer.scad"
PARTS = ["puck", "spinner", "sizer"]

# key: (type, min, max) — ranges are sanity rails, in the SCAD's units
# (mm for sizes/spans, drill-sheet inches for pitches). Same limits as the app.
SCHEMA = {
    "hand":        (str,   None,  None),
    "span_middle": (float, 60,    150),
    "span_ring":   (float, 60,    150),
    "thumb_d":     (float, 15,    38),
    "middle_d":    (float, 10,    30),
    "ring_d":      (float, 10,    30),
    "bridge":      (float, 2,     30),
    "finger_depth":(float, 8,     50),
    "thumb_fwd":   (float, -1,    1),
    "thumb_lat":   (float, -1,    1),
    "middle_fwd":  (float, -1,    1),
    "middle_lat":  (float, -1,    1),
    "ring_fwd":    (float, -1,    1),
    "ring_lat":    (float, -1,    1),
    "weight_pocket": (bool, None, None),
    "lanyard":     (bool,  None,  None),
}
# Keys the FitSlice app writes into fit_sheet.json that this script does not need
# (its job sheet / model summary, and options trainer.scad has no switch for).
IGNORED = {"name", "parts", "app", "version", "units", "modeled", "model", "order", "part",
           "size_source", "thumb_through", "thumb_depth", "sizer_thumb_center",
           "sizer_finger_center", "sizer_step", "print_allowance"}


def validate(sheet: dict) -> dict:
    out = {}
    for key, raw in sheet.items():
        if key in IGNORED:
            continue
        if key not in SCHEMA:
            sys.exit(f"error: unknown fit-sheet key {key!r}")
        typ, lo, hi = SCHEMA[key]
        if typ is bool:
            val = raw if isinstance(raw, bool) else str(raw).lower() in ("1", "true", "yes")
        else:
            val = typ(raw)
        if key == "hand" and val not in ("right", "left"):
            sys.exit("error: hand must be 'right' or 'left'")
        if lo is not None and not (lo <= val <= hi):
            sys.exit(f"error: {key}={val} outside sane range [{lo}, {hi}]")
        out[key] = val
    # trainer.scad takes final bore sizes: a fit sheet from the app lists the drill-sheet sizes
    # plus a print allowance, so add it here the way the app does (the sizer plate is exempt)
    try:
        allowance = float(sheet.get("print_allowance", 0) or 0)
    except (TypeError, ValueError):
        sys.exit("error: print_allowance must be a number (mm)")
    if not (0 <= allowance <= 2):
        sys.exit(f"error: print_allowance={allowance} outside sane range [0, 2]")
    if allowance:
        for k in ("thumb_d", "middle_d", "ring_d"):
            if k in out:
                out[k] = round(out[k] + allowance, 4)
    return out


def scad_arg(val):
    if isinstance(val, bool):
        return "true" if val else "false"
    if isinstance(val, str):
        return f'"{val}"'
    return repr(val)


def generate(sheet: dict, outdir: Path):
    name = sheet.get("name", "custom")
    parts = sheet.get("parts", PARTS)
    params = validate(sheet)
    outdir.mkdir(parents=True, exist_ok=True)
    for part in parts:
        if part not in PARTS:
            sys.exit(f"error: unknown part {part!r} (choose from {PARTS})")
        out = outdir / f"rev_{part}_{name}.stl"
        cmd = ["openscad", "--export-format", "binstl", "-o", str(out),
               "-D", f'part="{part}"']
        for k, v in params.items():
            cmd += ["-D", f"{k}={scad_arg(v)}"]
        cmd.append(str(SCAD))
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0 or not out.exists():
            sys.exit(f"openscad failed for {out.name}:\n{res.stderr}")
        print(f"  wrote {out} ({out.stat().st_size // 1024} KiB)")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("sheet", help="fit sheet .json, or orders .csv for a batch")
    ap.add_argument("-o", "--outdir", default="out", type=Path)
    args = ap.parse_args()

    if shutil.which("openscad") is None:
        sys.exit("error: openscad not found on PATH — install it from openscad.org")

    src = Path(args.sheet)
    if src.suffix.lower() == ".csv":
        with open(src, newline="") as f:
            orders = [row for row in csv.DictReader(f)]
        for i, row in enumerate(orders, 1):
            row = {k: v for k, v in row.items() if v not in ("", None)}
            if "name" not in row:
                sys.exit(f"error: CSV row {i} has no 'name' column")
            print(f"[{i}/{len(orders)}] {row['name']}")
            generate(row, args.outdir)
    else:
        generate(json.loads(src.read_text()), args.outdir)


if __name__ == "__main__":
    main()
