#!/usr/bin/env python3
"""Render the same cases as pitch_check.mjs with OpenSCAD (the independent reference).

    python3 pitch_scad.py <outdir>      # reads <outdir>/axes.json, writes <outdir>/scad_<case>.stl
"""
import json
import subprocess
import sys
from pathlib import Path

SCAD = Path(__file__).resolve().parents[2] / "trainer.scad"
KEYS = ["hand", "span_middle", "span_ring", "thumb_d", "middle_d", "ring_d", "bridge", "finger_depth",
        "thumb_fwd", "thumb_lat", "middle_fwd", "middle_lat", "ring_fwd", "ring_lat", "weight_pocket", "lanyard"]


def literal(v):
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, str):
        return f'"{v}"'
    return repr(v)


def main():
    out = Path(sys.argv[1])
    cases = json.loads((out / "axes.json").read_text())
    for name, c in cases.items():
        p = c["params"]
        if p.get("print_allowance"):
            sys.exit("the OpenSCAD reference takes final bore sizes: run the cases with print_allowance 0")
        cmd = ["openscad", "--export-format", "binstl", "-o", str(out / f"scad_{name}.stl"), "-D", 'part="puck"']
        for k in KEYS:
            if k in p:
                cmd += ["-D", f"{k}={literal(p[k])}"]
        cmd.append(str(SCAD))
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode:
            sys.exit(f"openscad failed for {name}:\n{r.stderr}")
        print("  rendered", name)


if __name__ == "__main__":
    main()
