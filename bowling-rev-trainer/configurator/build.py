#!/usr/bin/env python3
"""Assemble the single-file configurator.

Both outputs are built from template.html by inlining:
  - vendor/three.min.js            (3D preview)
  - vendor/manifold.js             (CSG engine glue, ES module)
  - vendor/manifold.wasm           (CSG engine, base64)
  - app.js                         (geometry + UI)

  index.html     complete standalone document: double-click it, or host it on
                 any static site. No server, no CDN, no install.
  artifact.html  the same page without the document skeleton, in the shape
                 the claude.ai Artifact publisher expects (it adds its own).

    python3 build.py
"""

import base64
from pathlib import Path

HERE = Path(__file__).parent

SKELETON_HEAD = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
                 '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
                 '</head>\n<body>\n')
SKELETON_TAIL = '\n</body>\n</html>\n'


def main():
    tpl = (HERE / "template.html").read_text()
    three = (HERE / "vendor" / "three.min.js").read_text()
    glue = (HERE / "vendor" / "manifold.js").read_text()
    wasm = base64.b64encode((HERE / "vendor" / "manifold.wasm").read_bytes()).decode()
    app = (HERE / "app.js").read_text()

    # the glue is an ES module; inside our inline module script it must not
    # export, and it never fetches its wasm because we hand it the bytes
    glue = glue.replace("export default Module;", "")
    assert "export " not in glue, "unexpected export left in manifold glue"
    for src in (three, glue, app):
        assert "</script" not in src, "source would terminate the script tag"

    page = (tpl.replace("/*__THREE__*/", three)
               .replace("/*__MANIFOLD_GLUE__*/", glue)
               .replace("__WASM_B64__", wasm)
               .replace("/*__APP__*/", app))
    (HERE / "artifact.html").write_text(page)
    (HERE / "index.html").write_text(SKELETON_HEAD + page + SKELETON_TAIL)
    print(f"index.html: {len(page.encode()) / 1e6:.2f} MB (+skeleton); artifact.html written")


if __name__ == "__main__":
    main()
