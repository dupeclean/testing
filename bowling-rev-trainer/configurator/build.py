#!/usr/bin/env python3
"""Assemble the configurator pages from template.html.

Inlined into every page:
  - vendor/three.min.js            (3D preview)
  - vendor/manifold.js             (CSG engine glue, ES module)
  - vendor/manifold.wasm           (CSG engine, base64)
  - app.js                         (geometry + UI)

Outputs:
  index.html                       complete standalone document: double-click it,
                                   or host it on any static site. No server, no CDN.
  artifact.html                    the same page without the document skeleton, in the
                                   shape the claude.ai Artifact publisher expects.
  ../app/renderer/index.html       the desktop app's page: the configurator plus the
                                   order book (../app/renderer-src/orders.*), with no
                                   network references and a strict content security policy.

    python3 build.py
"""

import base64
import re
from pathlib import Path

HERE = Path(__file__).parent
APP_DIR = HERE.parent / "app"

SKELETON_HEAD = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
                 '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
                 '</head>\n<body>\n')
SKELETON_TAIL = '\n</body>\n</html>\n'

# The desktop page loads nothing from the network and cannot navigate or fetch.
APP_CSP = ("default-src 'none'; script-src 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'unsafe-inline'; "
           "img-src data: blob:; connect-src 'none'; font-src 'none'; base-uri 'none'; form-action 'none'")


def assemble(tpl, three, glue, wasm, app, extra_css="", extra_html="", extra_js=""):
    return (tpl.replace("/*__THREE__*/", three)
               .replace("/*__MANIFOLD_GLUE__*/", glue)
               .replace("__WASM_B64__", wasm)
               .replace("/*__APP__*/", app)
               .replace("/*__APP_EXTRA_CSS__*/", extra_css)
               .replace("<!--__APP_EXTRA_HTML__-->", extra_html)
               .replace("/*__APP_EXTRA_JS__*/", extra_js))


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

    page = assemble(tpl, three, glue, wasm, app)
    (HERE / "artifact.html").write_text(page)
    (HERE / "index.html").write_text(SKELETON_HEAD + page + SKELETON_TAIL)
    print(f"index.html: {len(page.encode()) / 1e6:.2f} MB (+skeleton); artifact.html written")

    src_dir = APP_DIR / "renderer-src"
    if src_dir.exists():
        css = (src_dir / "orders.css").read_text()
        html = (src_dir / "orders.html").read_text()
        js = (src_dir / "orders.js").read_text()
        assert "</script" not in js, "orders.js would terminate the script tag"
        # the module script that hosts app.js also hosts orders.js, which runs after main() is wired
        desk = assemble(tpl, three, glue, wasm, app, css, html, js)
        # offline: drop the web-font links (system fonts are the fallback stack)
        desk = re.sub(r'<link rel="preconnect"[^>]*>\n?', "", desk)
        desk = re.sub(r'<link rel="stylesheet" href="https://fonts[^>]*>\n?', "", desk)
        assert "fonts.googleapis.com" not in desk, "web-font link left in the offline app page"
        # this is the FitSlice app, not the web configurator
        desk = desk.replace("<title>Rev Trainer Configurator</title>", "<title>FitSlice</title>")
        desk = desk.replace("<h1>Rev Trainer Configurator</h1>", "<h1>FitSlice</h1>")
        assert "Rev Trainer Configurator</h1>" not in desk
        desk = desk.replace("The model is rebuilt with those exact holes and you download a print-ready file.",
                            "The model is rebuilt with those exact holes; the print files are saved with each order.")
        csp = f'<meta http-equiv="Content-Security-Policy" content="{APP_CSP}">'
        out = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
               '<meta name="viewport" content="width=device-width, initial-scale=1">\n' + csp + '\n</head>\n<body>\n'
               + desk + SKELETON_TAIL)
        (APP_DIR / "renderer").mkdir(parents=True, exist_ok=True)
        (APP_DIR / "renderer" / "index.html").write_text(out)
        print(f"app/renderer/index.html: {len(out.encode()) / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
