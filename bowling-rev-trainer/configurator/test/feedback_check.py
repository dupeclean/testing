#!/usr/bin/env python3
"""Measure the release-feedback parts on the meshes written by feedback_check.mjs.

    python3 feedback_check.py <outdir>            # mesh checks
    python3 feedback_check.py <outdir> --scad     # also render trainer.scad and compare (IoU)

Checks: the gate file holds two bodies (a 6 mm segment and a pin of the asked height); the plugs
file holds two 12 mm plugs; the ball has a 3 mm deep socket at each reported axis point and the
dots take about 0.7 cm3 out of the plain ball; the humming spinner has a ring cavity from 30 to
44 mm radius and no wrist-cord tunnel. With --scad, each mesh is compared with OpenSCAD's render
of trainer.scad for the same values (IoU > 0.995).
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import trimesh
from shapely.geometry import Polygon

SCAD = Path(__file__).resolve().parents[2] / "trainer.scad"
SCAD_KEYS = ["hand", "span_middle", "span_ring", "thumb_d", "middle_d", "ring_d", "bridge", "finger_depth",
             "thumb_fwd", "thumb_lat", "middle_fwd", "middle_lat", "ring_fwd", "ring_lat", "weight_pocket", "lanyard",
             "thumb_through", "thumb_oval_d", "thumb_oval_angle", "middle_oval_d", "ring_oval_d", "finger_oval_angle",
             "thumb_bevel", "finger_bevel", "serial", "thumb_hole", "ball_d", "ball_thumb_depth", "ball_flat", "ball_groove", "ball_stripe",
             "gate_pin_h", "pap_marker", "pap_given", "pap_over", "pap_up", "pap_ring", "spin_hum", "spin_hum_slots", "spin_hum_angle"]
SCAD_CASES = ("gate", "plugs", "inlays", "dots_ball", "hum_spinner", "hum16_spinner")

ok = True


def check(label, cond, detail=""):
    global ok
    ok = ok and bool(cond)
    print(("  ok   " if cond else "  FAIL ") + label + (" " + detail if detail else ""))


def literal(v):
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, str):
        return '"' + v + '"'
    return repr(v)


def bodies(mesh):
    return sorted(mesh.split(only_watertight=False), key=lambda b: b.volume)


def main():
    out = Path(sys.argv[1])
    cases = json.loads((out / "feedback_axes.json").read_text())
    m = {name: trimesh.load(out / f"browser_{name}.stl") for name in cases}
    for name, mesh in m.items():
        check(f"{name}: watertight mesh", mesh.is_watertight)

    # 1. gate: a flat segment and a standing pin, as two separate bodies
    g = bodies(m["gate"])
    check("gate file holds two bodies (segment and pin)", len(g) == 2, f"({len(g)})")
    if len(g) == 2:
        pin, seg = (g[0], g[1]) if g[0].extents[2] > g[1].extents[2] else (g[1], g[0])
        check("gate segment is 6 mm thick", abs(seg.extents[2] - 6) < 0.05, f"({seg.extents[2]:.2f})")
        check("gate pin is the asked height (100 mm) and 20 mm across", abs(pin.extents[2] - 100) < 0.05 and abs(pin.extents[0] - 20) < 0.3, f"({pin.extents.round(2).tolist()})")
        check("segment spans ball diameter + 10 mm plus the dovetail tab (222 mm)", abs(seg.extents[0] - 222) < 0.1, f"({seg.extents[0]:.2f})")

    # 2. plugs: two 12 mm plugs, 3.3 mm tall
    p = bodies(m["plugs"])
    check("plugs file holds two plugs", len(p) == 2, f"({len(p)})")
    check("each plug is 12 mm across and 3.3 mm tall", all(abs(b.extents[0] - 12) < 0.2 and abs(b.extents[2] - 3.3) < 0.05 for b in p), f"({[b.extents.round(2).tolist() for b in p]})")
    q = bodies(m["inlays"])
    check("inlays file holds two plugs and two rings", len(q) == 4, f"({len(q)})")
    rings = [b for b in q if b.extents[0] > 50]
    check("each ring is 64 mm across and about 4.3 mm tall at its inner edge", len(rings) == 2 and all(abs(b.extents[0] - 64) < 0.3 and 4.1 < b.extents[2] < 4.5 for b in rings), f"({[b.extents.round(2).tolist() for b in rings]})")

    # 3. axis dots: a socket 3 mm deep at each reported axis point, taking about 0.7 cm3 out of the ball
    for case in ("dots_ball", "dots_left"):
        axes = [a for a in cases[case]["axes"] if a["name"] == "axis"]
        check(f"{case}: two axis points reported", len(axes) == 2)
        for a in axes:
            P, u = np.array(a["p"]), np.array(a["dir"])
            loc, _, _ = m[case].ray.intersects_location([P + 5 * u], [-u], multiple_hits=False)
            depth = np.linalg.norm(loc[0] - (P + 5 * u)) - 5 if len(loc) else float("nan")
            check(f"{case}: socket at ({P[0]:.0f}, {P[1]:.0f}, {P[2]:.0f}) is 3 mm deep", abs(depth - 3) < 0.15, f"({depth:.2f} mm)")
        hand_side = 1 if cases[case]["params"]["hand"] == "right" else -1
        check(f"{case}: the axis point is on the hand side", any(a["dir"][0] * hand_side > 0.9 for a in axes))
        # the ring pocket: about 3.7 mm deep on the ring's centre line (flat bottom under a curved surface)
        for a in axes:
            P, u = np.array(a["p"]), np.array(a["dir"])
            t = np.cross(u, [0, 0, 1]); t /= np.linalg.norm(t)
            R = 100.0; th = np.arcsin(30 / R)
            v = u * np.cos(th) + t * np.sin(th); Q = (P - R * u) + R * v
            loc, _, _ = m[case].ray.intersects_location([Q + 5 * v], [-v], multiple_hits=False)
            depth = np.linalg.norm(loc[0] - (Q + 5 * v)) - 5 if len(loc) else float("nan")
            check(f"{case}: ring pocket at ({Q[0]:.0f}, {Q[1]:.0f}, {Q[2]:.0f}) is about 3.7 mm deep", 3.3 < depth < 4.2, f"({depth:.2f} mm)")
    removed = (m["plain_ball"].volume - m["dots_noring"].volume) / 1000
    check("the two sockets take about 0.68 cm3 out of the ball", 0.55 < removed < 0.85, f"({removed:.3f} cm3)")
    removed = (m["dots_noring"].volume - m["dots_ball"].volume) / 1000
    check("the two ring pockets take about 5.4 cm3 more", 4.5 < removed < 6.5, f"({removed:.3f} cm3)")

    # 4. humming spinner: ring cavity between 30 and 44 mm radius, no wrist-cord tunnel, slots through the top
    hs = m["hum_spinner"]
    sec = hs.section(plane_origin=[0, 0, 10], plane_normal=[0, 0, 1])
    polys = sec.to_planar()[0].polygons_full if sec is not None else []
    check("hum spinner: the slice 10 mm up is a solid centre plus an outer ring (the cavity between them)", len(polys) == 2, f"({len(polys)} regions)")
    if len(polys) == 2:
        inner, outer = sorted(polys, key=lambda q: Polygon(q.exterior).area)   # by outline, not net area (the ring's net area is small)
        check("cavity inner wall at 30 mm radius", abs(inner.area - np.pi * 30 ** 2) < 0.02 * np.pi * 30 ** 2, f"(centre area {inner.area:.0f} mm2)")
        hole = max((0.0, *[Polygon(r).area for r in outer.interiors]))
        check("cavity outer wall at 44 mm radius", abs(hole - np.pi * 44 ** 2) < 0.02 * np.pi * 44 ** 2, f"(cavity outer area {hole:.0f} mm2)")
    sec8 = hs.section(plane_origin=[0, -32, 8], plane_normal=[0, 1, 0])
    tunnel = sec8 is not None and len(sec8.to_planar()[0].polygons_full) > 1
    check("hum spinner: no wrist-cord tunnel (the y = -32 mm slice is one solid region)", not tunnel)
    removed = (m["plain_spinner"].volume - hs.volume) / 1000
    check("chamber and slots remove about 45 cm3 (less the tunnel that is left out)", 38 < removed < 56, f"({removed:.1f} cm3)")
    check("16 slots remove more than 8", m["hum16_spinner"].volume < hs.volume)

    # 5. optional parity with OpenSCAD
    if "--scad" in sys.argv:
        for case in SCAD_CASES:
            prm = cases[case]["params"]
            cmd = ["openscad", "--export-format", "binstl", "-o", str(out / f"scad_{case}.stl"), "-D", 'part="' + cases[case]["part"] + '"']
            for k in SCAD_KEYS:
                if k in prm:
                    cmd += ["-D", f"{k}={literal(prm[k])}"]
            pat = (cases[case].get("stats") or {}).get("pattern")
            if pat is not None:   # the app placed the band; the reference takes its value
                band = pat.get("band_mm")
                cmd += ["-D", f"band_z={(band[0] + band[1]) / 2 if band else -2}"]
            cmd.append(str(SCAD))
            r = subprocess.run(cmd, capture_output=True, text=True)
            if r.returncode:
                check(f"openscad renders {case}", False, r.stderr[-400:]); continue
            a, b = m[case], trimesh.load(out / f"scad_{case}.stl")
            inter = trimesh.boolean.intersection([a, b], engine="manifold")
            union = trimesh.boolean.union([a, b], engine="manifold")
            iou = inter.volume / union.volume
            check(f'browser vs OpenSCAD mesh match, case "{case}"', iou > 0.995, f"(IoU {iou:.4f})")

    print(chr(10) + ("PASS" if ok else "FAILED"))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
