#!/usr/bin/env python3
"""Make the artifact-publishable copy of the landing page.

index.html is the deployable page (complete document). The claude.ai artifact
publisher adds its own document skeleton, so artifact.html is the same page
with <!doctype>, <html>, <head> and <body> wrappers removed and the head's
<title>, fonts link and <style> moved to the top of the body content.

    python3 site/build.py
"""

import re
from pathlib import Path

HERE = Path(__file__).parent
src = (HERE / "index.html").read_text()
head = re.search(r"<head>(.*?)</head>", src, re.S).group(1)
body = re.search(r"<body>(.*?)</body>", src, re.S).group(1)
keep = []
for tag in re.findall(r"<title>.*?</title>|<link[^>]+>|<style>.*?</style>", head, re.S):
    keep.append(tag)
(HERE / "artifact.html").write_text("\n".join(keep) + "\n" + body.strip() + "\n")
print("artifact.html written")
