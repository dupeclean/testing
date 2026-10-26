# Checks the launch folder before anything goes public.
#   py -3 marketing/launch/check_launch.py
# - the Etsy files against Etsy's field limits (title 140, tags 13 x 20, personalization instruction 256, template 1,024)
# - every public text for the words that may not appear (the old name, the internal link, machine-sounding phrases)
# - the site: no square-bracket placeholders left in a page, every image a page uses exists
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent
SITE = HERE / 'site'
TELLS = ['—', 'seamless', 'elevate', 'unlock', 'game-chang', "whether you're", "it's not just", 'journey', 'delve',
         'dive in', 'in today', 'look no further', 'take your game', 'next level', 'revolution', 'cutting-edge']
NEVER = ['FitSlice', 'claude.ai', 'rollread.com']   # no domain yet: the address is the free Pages one
problems = []

def block(lines, prefix):
    for k, l in enumerate(lines):
        if l.startswith(prefix):
            out = []
            for m in lines[k + 1:]:
                if not m.strip():
                    break
                out.append(m)
            return out
    return None

for f in sorted(HERE.glob('etsy-*.txt')):
    lines = f.read_text(encoding='utf-8').split('\n')
    title = block(lines, 'TITLE (')[0]
    tags = block(lines, 'TAGS (')
    ins = block(lines, 'PERSONALIZATION: on')[0]
    tpl = block(lines, 'TEMPLATE (') or []
    long_tags = [t for t in tags if len(t) > 20]
    print(f'{f.name}: title {len(title)}/140, tags {len(tags)} (longest {max(len(t) for t in tags)}/20), '
          f'instruction {len(ins)}/256, template {len(chr(10).join(tpl))}/1024')
    if len(title) > 140: problems.append(f'{f.name}: title over 140')
    if len(tags) != 13 or long_tags: problems.append(f'{f.name}: tags {len(tags)}, too long: {long_tags}')
    if len(ins) > 256: problems.append(f'{f.name}: instruction over 256')
    if len(chr(10).join(tpl)) > 1024: problems.append(f'{f.name}: template over 1,024')

for f in sorted(HERE.glob('tiktok-*.txt')):
    lines = f.read_text(encoding='utf-8').split('\n')
    name = block(lines, 'PRODUCT NAME')[0]
    desc = f.read_text(encoding='utf-8').split('====')[1] if '====' in f.read_text(encoding='utf-8') else ''
    print(f'{f.name}: product name {len(name)}/255, description {len(desc)} characters')
    if len(name) > 255 or len(name) < 25: problems.append(f'{f.name}: product name length {len(name)}')
    if re.search(r'https?://|www\.|\.com\b|@', desc): problems.append(f'{f.name}: a link, address or handle in the description (TikTok forbids it)')

public = list(HERE.glob('etsy-*.txt')) + list(HERE.glob('tiktok-*.txt')) + [HERE / 'league-post.md'] + list(SITE.glob('*.html'))
for f in public:
    txt = f.read_text(encoding='utf-8')
    # the configurator page is the application itself, not copy: only the never-words apply to it
    words = NEVER if f.name == 'configurator.html' else TELLS + NEVER
    for w in words:
        if w in txt and not (f.name == 'league-post.md' and w == 'claude.ai'):
            problems.append(f'{f.name}: contains ' + ('an em dash' if w == chr(0x2014) else repr(w)))

for f in sorted(SITE.glob('*.html')):
    txt = f.read_text(encoding='utf-8')
    body = re.sub(r'<!--.*?-->', '', txt, flags=re.S)
    if f.name != 'configurator.html':
        for m in re.findall(r'\[[^\]]{3,}\]', body):
            problems.append(f'{f.name}: placeholder left: {m[:60]}')
    for src in re.findall(r'src="(img/[^"]+)"', body):
        if not (SITE / src).exists():
            problems.append(f'{f.name}: missing image {src}')
    for href in re.findall(r'href="([a-z\-]+\.html)"', body):
        if not (SITE / href).exists():
            problems.append(f'{f.name}: broken link {href}')

if problems:
    print('\nPROBLEMS:')
    for p in problems: print(' -', p)
    sys.exit(1)
print('\nALL OK')
