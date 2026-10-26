# rollread.com: the configurator as the public site

`index.html` in this folder is the complete configurator: one file, nothing loaded from elsewhere, about
1.5 MB. `configurator/build.py` writes it on every build, the same page as `configurator/index.html`.
Upload this folder, not `configurator/`, so the test files and the SCAD never go public. Rebuild
(`py -3 configurator/build.py` from `bowling-rev-trainer/`) before every upload.

Rule: this page carries no prices and no buy buttons while Etsy is the shop. The Etsy listing sends buyers
here to build the ball; the page sends them back to the order with their fit sheet.

## Cloudflare Pages (recommended; free)

1. Register rollread.com. Cloudflare Registrar sells at cost; any registrar works, but then add the site
   to Cloudflare and move its nameservers there so step 3 is one click.
2. Cloudflare dashboard > Workers & Pages > Create > Pages > Upload assets. Project name `rollread`. Drag
   this folder in (index.html must sit at the top). Deploy.
3. In the project: Custom domains > Set up a custom domain > rollread.com. Cloudflare writes the DNS record
   itself when the domain is on Cloudflare. Add www.rollread.com the same way.
4. Open https://rollread.com on a phone. Type a sheet, build, export the fit sheet (it downloads). The tab
   should say RollRead.
5. Every later update: rebuild, then on the same project Create deployment > Upload assets again.

## GitHub Pages (the fallback)

Use a separate public repository, not this one: a Pages site shows the repository's name in its default
address, and this repository's history is the whole product. Push this folder as that repository's root,
then Settings > Pages > Deploy from a branch (main, root), Custom domain rollread.com, Enforce HTTPS. DNS at
the registrar: the four A records GitHub lists on the Pages settings page for the bare domain, and a CNAME
for www.

## Email

Cloudflare > Email Routing: support@rollread.com to your Gmail. Free. The kit's copy already uses that
address.

## Checks before the address goes anywhere public

- Search index.html for "FitSlice" and "claude.ai": neither may appear.
- No price, no buy button, no "add to cart".
- Decide whether the puck and the spinner stay in the public page's product list (`10-ball-first-plan.md`
  section 12, item 6).
