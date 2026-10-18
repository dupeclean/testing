#!/usr/bin/env python3
"""Render docs/business-plan.md into a designed, self-contained HTML page.

    python3 docs/build_plan.py          # writes docs/business-plan.html

Requires pandoc. The output has no document skeleton (the artifact publisher
adds one); open business-plan.html in a browser all the same, it renders fine.
"""

import re
import subprocess
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "business-plan.md"
OUT = HERE / "business-plan.html"

CSS = """
<title>FitSlice Business Plan</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* Layout: a long-form plan read top to bottom; one measure of text, numbered parts as running heads, evidence tables scroll inside their own frames. */
:root {
  --bg: #e9edf0; --surface: #f8fafb; --surface-2: #eef2f5; --fg: #15202b; --muted: #5b6b7a; --line: #c9d2da;
  --accent: #1f5f8b; --accent-ink: #ffffff; --ok: #2f7d4f; --warn: #9a6a12; --bad: #b3261e;
  --display: "Barlow Condensed", "Arial Narrow", Impact, sans-serif;
  --body: "Barlow", "Helvetica Neue", Arial, sans-serif;
  --mono: "IBM Plex Mono", "SFMono-Regular", Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #11161a; --surface: #1a2127; --surface-2: #212a31; --fg: #e7ebee; --muted: #97a4ae; --line: #2d3741;
    --accent: #5fa8dc; --accent-ink: #0d1a24; --ok: #63b584; --warn: #e0a84a; --bad: #ef6b5f; color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --bg: #11161a; --surface: #1a2127; --surface-2: #212a31; --fg: #e7ebee; --muted: #97a4ae; --line: #2d3741;
  --accent: #5fa8dc; --accent-ink: #0d1a24; --ok: #63b584; --warn: #e0a84a; --bad: #ef6b5f; color-scheme: dark;
}
* { box-sizing: border-box; }
[hidden] { display: none !important; }
body { background: var(--bg); color: var(--fg); font: 16px/1.55 var(--body); margin: 0; }
.wrap { padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 20px 56px; max-width: 1040px; margin: 0 auto; }
header.title { border-bottom: 2px solid var(--fg); padding-bottom: 16px; margin-bottom: 8px; }
header.title .eyebrow { font: 600 12px/1 var(--body); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); margin: 0 0 10px; }
header.title h1 { font: 700 clamp(38px, 7vw, 64px)/0.95 var(--display); letter-spacing: .005em; text-transform: uppercase; margin: 0; text-wrap: balance; }
header.title .sub { font-size: 18px; color: var(--muted); margin: 10px 0 0; max-width: 60ch; text-wrap: balance; }
header.title .date { font-family: var(--mono); font-size: 12.5px; color: var(--muted); margin-top: 8px; }
nav.toc { margin: 18px 0 30px; padding: 14px 16px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); }
nav.toc p { margin: 0 0 8px; font: 700 13px/1 var(--display); text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }
nav.toc ol { margin: 0; padding-left: 0; list-style: none; columns: 2; column-gap: 24px; }
nav.toc li { break-inside: avoid; padding: 3px 0; font-size: 14.5px; }
nav.toc a { color: var(--fg); text-decoration: none; border-bottom: 1px solid var(--line); }
nav.toc a:hover { border-color: var(--accent); color: var(--accent); }
@media (max-width: 600px) { nav.toc ol { columns: 1; } }
article { max-width: 72ch; }
article h1 { font: 700 30px/1.05 var(--display); text-transform: uppercase; letter-spacing: .02em; margin: 44px 0 12px; padding-top: 18px; border-top: 1px solid var(--line); text-wrap: balance; }
article h1:first-of-type { border-top: 0; padding-top: 0; }
article h2 { font: 700 20px/1.15 var(--display); letter-spacing: .02em; margin: 28px 0 8px; text-wrap: balance; }
article p { margin: 0 0 14px; }
article li { margin: 4px 0; }
article li p { margin: 0; }
article strong { font-weight: 600; }
article em { font-style: italic; }
article a { color: var(--accent); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--accent) 40%, transparent); word-break: break-word; }
article blockquote { margin: 0 0 20px; padding: 12px 16px; border-left: 3px solid var(--accent); background: var(--surface); border-radius: 0 6px 6px 0; font-size: 15px; color: var(--muted); }
article blockquote p { margin: 0; }
.tablewrap { overflow-x: auto; margin: 10px 0 20px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); max-width: min(100%, 1040px); }
article table { border-collapse: collapse; width: 100%; font-size: 13.5px; }
article thead th { text-align: left; font: 600 11.5px/1.2 var(--body); text-transform: uppercase; letter-spacing: .08em; color: var(--muted); padding: 10px 10px 8px; border-bottom: 1px solid var(--line); background: var(--surface-2); white-space: nowrap; }
article td { padding: 8px 10px; border-top: 1px solid var(--line); vertical-align: top; min-width: 7ch; }
article td:first-child { font-family: var(--mono); font-size: 12.5px; white-space: nowrap; color: var(--muted); }
article tr:nth-child(even) td { background: color-mix(in srgb, var(--surface-2) 55%, transparent); }
article table a { word-break: break-all; font-family: var(--mono); font-size: 12px; }
article code { font-family: var(--mono); font-size: 0.92em; background: var(--surface-2); padding: 1px 4px; border-radius: 3px; }
.cite { font-family: var(--mono); font-size: 0.78em; color: var(--accent); vertical-align: 0.12em; }
.band { margin: 32px 0; padding: 18px 20px; border-radius: 6px; background: var(--surface); border: 1px solid var(--line); }
.band .q { font: 700 clamp(22px, 3.4vw, 32px)/1.1 var(--display); text-transform: uppercase; letter-spacing: .02em; margin: 0; }
.band .a { color: var(--muted); margin: 8px 0 0; font-size: 15px; }
footer.end { margin-top: 48px; padding-top: 16px; border-top: 1px solid var(--line); font-family: var(--mono); font-size: 12.5px; color: var(--muted); }
@media (max-width: 700px) { article h1 { font-size: 26px; } body { font-size: 15.5px; } }
</style>
"""

HERO_BAND = """
<div class="band"><p class="q">Your drill sheet, off the ball.</p>
<p class="a">The part of your ball your hand touches, printed with your exact holes, so you can practice your release anywhere.</p></div>
"""


def main():
    md = SRC.read_text()
    meta = {}
    m = re.match(r"^---\n(.*?)\n---\n", md, re.S)
    if m:
        for line in m.group(1).splitlines():
            k, _, v = line.partition(":")
            meta[k.strip()] = v.strip().strip('"')
        md = md[m.end():]

    body = subprocess.run(
        ["pandoc", "-f", "markdown", "-t", "html5", "--wrap=none", "--no-highlight"],
        input=md, text=True, capture_output=True, check=True).stdout

    # bracketed evidence keys like [M1] become small cite marks linking to the tables
    body = re.sub(r"\[([MCEHX]\d{1,2})\]", r'<a class="cite" href="#evidence-tables">\1</a>', body)
    # tables scroll inside their own frame
    body = body.replace("<table>", '<div class="tablewrap"><table>').replace("</table>", "</table></div>")

    # table of contents from the top-level headings pandoc emitted
    toc = re.findall(r'<h1 id="([^"]+)">(.*?)</h1>', body)
    toc_html = "".join(f'<li><a href="#{i}">{re.sub("<.*?>", "", t)}</a></li>' for i, t in toc)
    # anchor for the citation links
    body = body.replace('<h1 id="evidence-tables">', '<h1 id="evidence-tables">', 1)

    html = (CSS + '<div class="wrap">\n'
            f'<header class="title"><p class="eyebrow">Business plan · working draft</p>'
            f'<h1>{meta.get("title", "Business Plan")}</h1>'
            f'<p class="sub">{meta.get("subtitle", "")}</p>'
            f'<p class="date">{meta.get("date", "")}</p></header>\n'
            f'<nav class="toc"><p>Contents</p><ol>{toc_html}</ol></nav>\n'
            f'{HERO_BAND}\n<article>\n{body}\n</article>\n'
            '<footer class="end">Source: docs/business-plan.md in the project repository. Figures were collected from search-engine excerpts of the cited pages in October 2026; verify against the URL before external use.</footer>\n'
            '</div>\n')
    OUT.write_text(html)
    print(f"{OUT.name}: {len(html.encode()) / 1e3:.0f} kB, {len(toc)} parts")


if __name__ == "__main__":
    main()
