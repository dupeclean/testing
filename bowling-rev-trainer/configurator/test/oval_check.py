#!/usr/bin/env python3
"""Measure oval holes, the rounded bevel, the engraved number and the no-thumb ball on the
finished meshes written by oval_check.mjs.

    python3 oval_check.py <outdir>                 # mesh checks
    python3 oval_check.py <outdir> --scad          # also render trainer.scad and compare (IoU)

Oval convention under test: the hole size is the short way across, the oval size the long
way; angle 0 points the long axis up the sheet (thumb toward fingers, +y), + turns it toward
the bowling-hand side (+x for a right hand, -x for a left hand).
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import trimesh
from shapely.geometry import Point, Polygon

SCAD = Path(__file__).resolve().parents[2] / "trainer.scad"
SCAD_KEYS = ["hand", "span_middle", "span_ring", "thumb_d", "middle_d", "ring_d", "bridge", "finger_depth",
             "thumb_fwd", "thumb_lat", "middle_fwd", "middle_lat", "ring_fwd", "ring_lat", "weight_pocket", "lanyard",
             "thumb_through", "thumb_oval_d", "thumb_oval_angle", "middle_oval_d", "ring_oval_d", "finger_oval_angle",
             "thumb_bevel", "finger_bevel", "serial", "thumb_hole", "ball_d", "ball_thumb_depth", "ball_flat", "ball_groove", "ball_stripe"]


def literal(v):
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, str):
        return f'"{v}"'
    return repr(v)


def holes_at(mesh, z):
    """Every closed hole in the horizontal slice at z: (x, y, polygon) in mesh coordinates."""
    sec = mesh.section(plane_origin=[0, 0, z], plane_normal=[0, 0, 1])
    if sec is None:
        return []
    planar, to3d = sec.to_2D()
    out = []
    for poly in planar.polygons_full:
        for ring in poly.interiors:
            hole = Polygon(ring)
            pts = trimesh.transform_points([[x, y, 0] for x, y in hole.exterior.coords], to3d)
            p = Polygon([(x, y) for x, y, _ in pts])
            out.append((p.centroid.x, p.centroid.y, p))
    return out


def bore_slice(mesh, a, depth):
    """The hole's outline in the plane perpendicular to a bore axis, `depth` mm down it.
    Returns (polygon in plane coordinates, to3d) for the hole the axis passes through."""
    p, d = np.array(a["p"]), -np.array(a["dir"])          # d points into the body
    origin = p + depth * d
    sec = mesh.section(plane_origin=origin, plane_normal=d)
    assert sec is not None, f"no section {depth} mm down the {a['name']} bore"
    planar, to3d = sec.to_2D()
    o2 = np.linalg.solve(to3d, np.append(origin, 1.0))[:2]    # the axis point, in plane coordinates
    for poly in planar.polygons_full:
        for ring in poly.interiors:
            hole = Polygon(ring)
            if hole.contains(Point(o2[0], o2[1])):
                return hole, to3d
    raise AssertionError(f"the {a['name']} bore is not a closed hole {depth} mm down its axis (plane point {o2})")


def long_axis_xy(poly, to3d):
    """Long and short extent of a hole and the mesh-xy direction of its long axis."""
    rect = poly.minimum_rotated_rectangle
    c = list(rect.exterior.coords)
    e1 = np.array(c[1]) - np.array(c[0]); e2 = np.array(c[2]) - np.array(c[1])
    l1, l2 = np.linalg.norm(e1), np.linalg.norm(e2)
    i, j = (0, 1) if l1 >= l2 else (1, 2)
    a3, b3 = trimesh.transform_points([[*c[i], 0], [*c[j], 0]], to3d)
    v = (b3 - a3)[:2]
    return max(l1, l2), min(l1, l2), v / np.linalg.norm(v)


def long_short(poly):
    """Long and short extent of a hole and the direction (unit x, y) of its long axis."""
    rect = poly.minimum_rotated_rectangle
    c = list(rect.exterior.coords)
    e1 = np.array(c[1]) - np.array(c[0]); e2 = np.array(c[2]) - np.array(c[1])
    l1, l2 = np.linalg.norm(e1), np.linalg.norm(e2)
    long_e = e1 if l1 >= l2 else e2
    return max(l1, l2), min(l1, l2), long_e / np.linalg.norm(long_e)


def axis(case, name, axes):
    return next(a for a in axes[case]["axes"] if a["name"] == name)


def main():
    out = Path(sys.argv[1])
    axes = json.loads((out / "oval_axes.json").read_text())
    m = {c: trimesh.load(out / f"browser_{c}.stl") for c in axes}
    ok = True

    def check(name, cond, detail=""):
        nonlocal ok
        print(("  ok   " if cond else "  FAIL ") + name + ("  " + detail if detail else ""))
        ok &= bool(cond)

    for c in axes:
        check(f"{c}: watertight mesh, no warnings", m[c].is_watertight and not axes[c]["warnings"], str(axes[c]["warnings"]))

    IN = 25.4
    short, long_ = 25 / 32 * IN, 29 / 32 * IN
    # 1. the oval thumb: a slice across the bore 10 mm down (past the 4 mm bevel) is the hole size the
    #    short way and the oval size the long way, and the long axis points 55 deg from "up the sheet"
    #    toward the hand side (a right hand: +x). The left hand mirrors it.
    for case, hand_x in (("oval_ball", +1), ("oval_left", -1), ("oval_puck", +1)):
        poly, to3d = bore_slice(m[case], axis(case, "thumb", axes), 10)
        L, S, u = long_axis_xy(poly, to3d)
        want = np.array([hand_x * np.sin(np.radians(55)), np.cos(np.radians(55))])
        ang = np.degrees(np.arccos(min(1.0, abs(u @ want))))
        check(f"{case}: thumb slice is {S:.2f} x {L:.2f} mm (want {short:.2f} x {long_:.2f})", abs(S - short) < 0.25 and abs(L - long_) < 0.25)
        check(f"{case}: long axis is 55 deg from up-the-sheet toward the {'right' if hand_x > 0 else 'left'} (hand side)", ang < 3.0, f"(off by {ang:.1f} deg)")
        # round finger holes on the same part stay round
        for f, dia in (("middle", 21 / 32 * IN), ("ring", 5 / 8 * IN)):
            Lf, Sf, _ = long_axis_xy(*bore_slice(m[case], axis(case, f, axes), 8))
            check(f"{case}: {f} hole stays round ({Sf:.2f} x {Lf:.2f}, want {dia:.2f})", Lf - Sf < 0.3 and abs(Sf - dia) < 0.25)

    # 2. finger ovals at -30 deg (toward the off side) on an otherwise round-thumb puck
    for f, dia in (("middle", 21 / 32 * IN), ("ring", 5 / 8 * IN)):
        Lf, Sf, u = long_axis_xy(*bore_slice(m["finger_oval"], axis("finger_oval", f, axes), 8))
        want = np.array([np.sin(np.radians(-30)), np.cos(np.radians(-30))])
        ang = np.degrees(np.arccos(min(1.0, abs(u @ want))))
        check(f"finger_oval: {f} is {Sf:.2f} x {Lf:.2f} (want {dia:.2f} x {dia + 3:.2f}) at -30 deg", abs(Sf - dia) < 0.25 and abs(Lf - dia - 3) < 0.25 and ang < 3.0, f"(angle off by {ang:.1f})")
    Lt, St, _ = long_axis_xy(*bore_slice(m["finger_oval"], axis("finger_oval", "thumb", axes), 10))
    check(f"finger_oval: thumb stays round ({St:.2f} x {Lt:.2f})", Lt - St < 0.3 and abs(St - short) < 0.25)

    # 3. the rounded bevel: across the bore the thumb hole widens smoothly over the top 4 mm and is the
    #    plain bore below it (the sphere falls away about 1 mm across the rim, so depths are approximate)
    a = axis("bevel_puck", "thumb", axes)
    areas = [bore_slice(m["bevel_puck"], a, dep)[0].area for dep in (1.0, 2.0, 3.0, 4.0, 6.0, 9.0)]
    r = short / 2
    check("bevel: hole widens toward the rim (areas shrink with depth)", all(areas[i] > areas[i + 1] for i in range(4)), " ".join(f"{x:.0f}" for x in areas))
    check(f"bevel: 6 mm down it is the plain bore (area {areas[4]:.0f} vs {np.pi * r * r:.0f})", abs(areas[4] - np.pi * r * r) < 0.03 * np.pi * r * r and abs(areas[5] - np.pi * r * r) < 0.03 * np.pi * r * r)
    r1 = np.sqrt(areas[0] / np.pi)
    check(f"bevel: 1 mm down the radius is r + {r1 - r:.2f} (a 4 mm quarter-round: between r + 0.3 and r + 2.2)", 0.3 < r1 - r < 2.2)
    plain_area = bore_slice(m["plain_puck"], axis("plain_puck", "thumb", axes), 1.0)[0].area
    check(f"bevel 0: the rim is sharp (area {plain_area:.0f} = bore 1 mm down)", abs(plain_area - np.pi * r * r) < 0.03 * np.pi * r * r)

    # 4. the engraved number: FS-0001 cut 0.5 mm into the base, so a slice at 0.25 mm has glyph voids
    #    (seven characters, each at least one void) that the plain puck does not have
    def voids(mesh, z):
        sec = mesh.section(plane_origin=[0, 0, z], plane_normal=[0, 0, 1])
        planar, _ = sec.to_2D()
        n = 0; area = 0.0
        for poly in planar.polygons_full:
            for ring in poly.interiors:
                n += 1; area += Polygon(ring).area
        return n, area, sum(p.area for p in planar.polygons_full)

    n_s, a_s, tot_s = voids(m["serial_puck"], 0.25)
    n_p, a_p, tot_p = voids(m["plain_puck"], 0.25)
    n_s1, _, _ = voids(m["serial_puck"], 0.75)
    check(f"serial: {n_s} glyph voids 0.25 mm into the base, {n_p} on the plain puck", n_s - n_p >= 7)
    check(f"serial: no voids left 0.75 mm up (cut is 0.5 mm deep)", n_s1 == n_p)
    dv = m["plain_puck"].volume - m["serial_puck"].volume
    check(f"serial: engraving removes {dv:.0f} mm3 (glyph area {a_s - a_p:.0f} mm2 x 0.5 mm)", 0.4 * (a_s - a_p) < dv < 0.6 * (a_s - a_p) + 1 and dv > 5)
    # it reads right from below: mirrored in the mesh, so the 'F' (first character) sits at +x when read from above
    xs = []
    sec = m["serial_puck"].section(plane_origin=[0, 0, 0.25], plane_normal=[0, 0, 1]); planar, to3d = sec.to_2D()
    for poly in planar.polygons_full:
        for ring in poly.interiors:
            c = Polygon(ring).centroid
            xs.append(trimesh.transform_points([[c.x, c.y, 0]], to3d)[0][0])
    check("serial: the text is mirrored for reading from underneath (glyphs spread across x, centred)", len(xs) >= 7 and abs(np.mean(xs)) < 6 and (max(xs) - min(xs)) > 20, f"(x from {min(xs):.1f} to {max(xs):.1f})")

    # 5. the no-thumb ball: two holes only, centred on the top, more plastic than the three-hole ball
    nt = axes["nothumb_ball"]["axes"]
    check("no-thumb ball reports two axes (middle, ring)", sorted(a["name"] for a in nt) == ["middle", "ring"])
    zc = max(a["p"][2] for a in nt) - 8
    check(f"no-thumb ball: exactly 2 holes in the slice 8 mm under the rim, none elsewhere", len(holes_at(m["nothumb_ball"], zc)) == 2 and len(holes_at(m["nothumb_ball"], 150)) == 0)
    check("no-thumb ball: finger holes straddle y = 0", abs(sum(a["p"][1] for a in nt)) < 0.5 and all(abs(a["p"][1]) < 1 for a in nt))
    check("no-thumb ball has more volume than the three-hole ball", m["nothumb_ball"].volume > m["oval_ball"].volume + 10000)

    # 6. optional parity with OpenSCAD (same final sizes; OpenSCAD's text font differs, so no serial case)
    if "--scad" in sys.argv:
        for case in ("oval_ball", "oval_puck", "finger_oval", "nothumb_ball", "bevel_puck"):
            p = axes[case]["params"]
            cmd = ["openscad", "--export-format", "binstl", "-o", str(out / f"scad_{case}.stl"), "-D", f'part="{axes[case]["part"]}"']
            for k in SCAD_KEYS:
                if k in p:
                    cmd += ["-D", f"{k}={literal(p[k])}"]
            cmd.append(str(SCAD))
            r = subprocess.run(cmd, capture_output=True, text=True)
            if r.returncode:
                check(f"openscad renders {case}", False, r.stderr[-400:]); continue
            a, b = m[case], trimesh.load(out / f"scad_{case}.stl")
            inter = trimesh.boolean.intersection([a, b], engine="manifold")
            union = trimesh.boolean.union([a, b], engine="manifold")
            iou = inter.volume / union.volume
            check(f'browser vs OpenSCAD mesh match, case "{case}"', iou > 0.995, f"(IoU {iou:.4f})")

    print("\nPASS" if ok else "\nFAILED")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
