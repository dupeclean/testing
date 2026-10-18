#!/usr/bin/env python3
"""Render the go-to-market kit (marketing/*.md plus targets.csv) into one
designed HTML page.

    python3 marketing/build_kit.py     # writes marketing/gtm-kit.html
"""

import csv
import html
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "docs"))
from build_plan import CSS  # noqa: E402  (shared design tokens)


def md_to_html(md: str) -> str:
    out = subprocess.run(["pandoc", "-f", "markdown", "-t", "html5", "--wrap=none", "--no-highlight"],
                         input=md, text=True, capture_output=True, check=True).stdout
    return out.replace("<table>", '<div class="tablewrap"><table>').replace("</table>", "</table></div>")


def main():
    files = sorted(p for p in HERE.glob("[0-9][0-9]-*.md"))
    sections, toc = [], []
    for i, p in enumerate(files, 1):
        md = p.read_text()
        title = re.sub(r"^#+\s*", "", md.strip().splitlines()[0]) if md.strip() else p.stem
        body = md_to_html(md)
        # demote headings one level so each file sits under one section heading
        body = re.sub(r"<h([1-5])( id=\"[^\"]*\")?>", lambda m: f"<h{int(m.group(1)) + 1}{m.group(2) or ''}>", body)
        body = re.sub(r"</h([1-5])>", lambda m: f"</h{int(m.group(1)) + 1}>", body)
        body = re.sub(r"<h2( id=\"[^\"]*\")?>.*?</h2>", "", body, count=1)  # drop the file's own title
        sections.append(f'<h1 id="s{i}">{i}. {html.escape(title)}</h1>\n{body}')
        toc.append(f'<li><a href="#s{i}">{i}. {html.escape(title)}</a></li>')

    targets = HERE / "targets.csv"
    if targets.exists():
        rows = list(csv.reader(targets.open(newline="")))
        if rows:
            head = "".join(f"<th>{html.escape(c)}</th>" for c in rows[0])
            body = "".join("<tr>" + "".join(f"<td>{html.escape(c)}</td>" for c in r) + "</tr>" for r in rows[1:])
            n = len(files) + 1
            sections.append(f'<h1 id="s{n}">{n}. Outreach target list ({len(rows) - 1} targets)</h1>'
                            f'<p class="note">Names and facts come from web search results; contact paths are descriptions, never addresses. Confidence is the researcher\'s own rating. Verify each row before outreach.</p>'
                            f'<div class="tablewrap"><table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>')
            toc.append(f'<li><a href="#s{n}">{n}. Outreach target list</a></li>')

    css = CSS.replace("<title>FitSlice Business Plan</title>", "<title>FitSlice Go-to-Market Kit</title>")
    css = css.replace("article { max-width: 72ch; }", "article { max-width: 80ch; }")
    page = (css + '<div class="wrap">\n'
            '<header class="title"><p class="eyebrow">Go-to-market kit · compliance-reviewed drafts</p>'
            '<h1>FitSlice Go-to-Market Kit</h1>'
            '<p class="sub">Brand platform, website copy, pro-shop program, retailer and marketplace pitches, creator and coach program, content and launch calendar, paid funnel and the path to $1M, support runbook, and the outreach target list.</p>'
            '<p class="date">October 2026 — every asset was written to the claims guide in business-plan Part 6 and reviewed against it; placeholders in [BRACKETS] need a real quote, a filed patent, or a founder decision before use.</p></header>\n'
            f'<nav class="toc"><p>Contents</p><ol>{"".join(toc)}</ol></nav>\n'
            '<div class="band"><p class="q">Your drill sheet, off the ball.</p><p class="a">Lead with fit, not revs. Every claim here is a product fact or an attributed coaching view; rev-rate results wait for the pilot.</p></div>\n'
            '<article>\n' + "\n".join(sections) + '\n</article>\n'
            '<footer class="end">Source: marketing/ in the project repository. Editable Markdown; rebuild with python3 marketing/build_kit.py.</footer>\n</div>\n')
    out = HERE / "gtm-kit.html"
    out.write_text(page)
    print(f"{out.name}: {len(page.encode()) / 1e3:.0f} kB, {len(sections)} sections")


if __name__ == "__main__":
    main()
