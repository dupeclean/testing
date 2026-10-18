#!/usr/bin/env python3
"""Measure the pitch convention on the finished meshes, not on the formulas.

For each STL the thumb bore (a through hole) is sliced near the top and near the
base; the hole's centroid shift between the two slices shows which way it leans.
Forward pitch must lean the inner end toward the grip center (thumb -> toward the
fingers, +y; fingers -> toward the thumb, -y). Lateral + must lean toward the
bowling-hand side (+x for a right-hander, -x for a left-hander).

    python3 pitch_check.py <outdir-with-STLs>  [--scad-dir <dir with scad_*.stl>]

Also reports mesh parity (intersection over union) between the browser engine and
OpenSCAD for the same inputs when --scad-dir is given.
"""
import json
import sys
from pathlib import Path

import numpy as np
import trimesh
from shapely.geometry import Polygon


def hole_centroids(mesh, z):
    """Centroids (x, y, area) in mesh coordinates of every closed hole in the slice at height z."""
    sec = mesh.section(plane_origin=[0, 0, z], plane_normal=[0, 0, 1])
    planar, to3d = sec.to_2D()
    cents = []
    for poly in planar.polygons_full:
        for ring in poly.interiors:
            hole = Polygon(ring)
            c = hole.centroid
            p3 = trimesh.transform_points([[c.x, c.y, 0]], to3d)[0]
            cents.append((p3[0], p3[1], hole.area))
    return cents


def expected_at(axis, z):
    """Where the reported bore axis crosses height z (x, y)."""
    p, u = np.array(axis['p']), np.array(axis['dir'])
    d = -u                                  # into the body
    t = (z - p[2]) / d[2]
    return p[0] + t * d[0], p[1] + t * d[1]


def centroid_near(cents, x, y, tol=5.0):
    best = None
    for cx, cy, a in cents:
        d = np.hypot(cx - x, cy - y)
        if d < tol and (best is None or d < best[0]):
            best = (d, cx, cy)
    return best


def lean(mesh, axis, depth, top=12.0):
    """(dx, dy) the measured hole centre moves between `top` and `depth` mm below the entry point.
    The hole must be found where the reported axis says it should be (within 5 mm), which
    also confirms the reported axes describe the real mesh."""
    z0 = axis['p'][2]
    found = []
    for off in (top, depth):
        z = z0 - off
        ex, ey = expected_at(axis, z)
        hit = centroid_near(hole_centroids(mesh, z), ex, ey)
        assert hit, f'no hole near the predicted ({ex:.1f}, {ey:.1f}) at z={z:.1f}: the mesh does not match the reported axis'
        found.append(hit)
    return found[1][1] - found[0][1], found[1][2] - found[0][2]


def main():
    out = Path(sys.argv[1])
    axes = json.loads((out / 'axes.json').read_text())
    ok = True

    def check(name, cond, detail):
        nonlocal ok
        print(('  ok   ' if cond else '  FAIL ') + name + ('  ' + detail if detail else ''))
        ok &= bool(cond)

    # thumb entry point from the axes file (entry x,y)
    def entry(case, name):
        return next(a for a in axes[case]['axes'] if a['name'] == name)

    m = {c: trimesh.load(out / f'browser_{c}.stl') for c in axes}
    D_T = 33.0   # thumb: through bore, measure well down it (mm below the entry point)
    z_dx, z_dy = lean(m['zero'], entry('zero', 'thumb'), D_T)
    f_dx, f_dy = lean(m['fwd'], entry('fwd', 'thumb'), D_T)
    r_dx, r_dy = lean(m['rev'], entry('rev', 'thumb'), D_T)
    print(f'thumb bore lean top->base (dy): zero {z_dy:+.2f}  fwd(+1/2") {f_dy:+.2f}  rev(-1/2") {r_dy:+.2f} mm')
    check('forward thumb pitch leans the inner end TOWARD the fingers (+y)', f_dy > z_dy + 1.2, f'(+{f_dy - z_dy:.1f} mm over zero)')
    check('reverse thumb pitch leans the inner end AWAY from the fingers', r_dy < z_dy - 1.2, f'({r_dy - z_dy:.1f} mm vs zero)')
    # a 1/2" aim-point offset over the ~55 mm bore length moves it about 55 * (12.7/ 108) ~ 6 mm
    check('forward and reverse are equal and opposite', abs((f_dy - z_dy) + (r_dy - z_dy)) < 1.2, '')

    # lateral on the thumb: + = bowling-hand side = +x for the right hand
    p_dx, _ = lean(m['lat_pos'], entry('lat_pos', 'thumb'), D_T); n_dx, _ = lean(m['lat_neg'], entry('lat_neg', 'thumb'), D_T)
    check('right-hand lateral + leans the thumb bore toward +x (hand side)', p_dx > z_dx + 1.2 and n_dx < z_dx - 1.2, f'({p_dx - z_dx:+.1f} / {n_dx - z_dx:+.1f} mm)')

    # finger holes: forward leans toward the thumb (-y)
    for finger in ('middle', 'ring'):
        D_F = 22.0   # finger bores are blind (40 mm along the axis, less once the chamfer is counted): stay well inside them
        zx, zy = lean(m['zero'], entry('zero', finger), D_F)
        fx, fy = lean(m['fwd'], entry('fwd', finger), D_F)
        rx, ry = lean(m['rev'], entry('rev', finger), D_F)
        check(f'{finger} finger: forward leans the inner end toward the thumb (-y), reverse away', fy < zy - 0.8 and ry > zy + 0.8, f'(fwd {fy - zy:+.1f}, rev {ry - zy:+.1f} mm)')

    # left hand mirrors the layout, and lateral + is still "toward the hand side" (-x)
    lz_dx, _ = lean(m['left_zero'], entry('left_zero', 'thumb'), D_T)
    ll_dx, _ = lean(m['left_lat'], entry('left_lat', 'thumb'), D_T)
    check('left-hand lateral + leans toward -x (the left-hander\'s hand side)', ll_dx < lz_dx - 1.2, f'({ll_dx - lz_dx:+.1f} mm)')

    # zero pitch really is the surface normal: every axis points back at the sphere centre
    R = 108.0
    for a in axes['zero']['axes']:
        p, d = np.array(a['p']), np.array(a['dir'])
        c = np.array([0, 0, 60 - R])
        n = (p - c) / np.linalg.norm(p - c)
        check(f'zero pitch: {a["name"]} bore points at the ball centre', np.degrees(np.arccos(np.clip(d @ n, -1, 1))) < 0.01, '')

    # optional parity with OpenSCAD
    if '--scad-dir' in sys.argv:
        sd = Path(sys.argv[sys.argv.index('--scad-dir') + 1])
        for case in ('fwd', 'rev', 'lat_pos', 'left_lat', 'sheet'):
            f = sd / f'scad_{case}.stl'
            if not f.exists():
                continue
            a, b = m[case], trimesh.load(f)
            inter = trimesh.boolean.intersection([a, b], engine='manifold')
            union = trimesh.boolean.union([a, b], engine='manifold')
            iou = inter.volume / union.volume
            check(f'browser vs OpenSCAD mesh match, case "{case}"', iou > 0.995, f'(IoU {iou:.4f})')
    print('\nPASS' if ok else '\nFAILED')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
