# The site in this folder

Hand-written static pages plus the configurator, hosted on a free Cloudflare Pages address. No domain for
now (rollread.com was free on 2026-10-26; buy it when the shops sell, and attach it in one click). Upload
this whole folder; nothing else is needed. Written 2026-10-26.

| File | What it is |
|---|---|
| `index.html` | Home: what the ball is, the two drills, the four products, how ordering works |
| `ball.html`, `puck.html`, `spinner.html`, `fit-kit.html` | One page per product, with Order buttons that go to Etsy and TikTok Shop |
| `drills.html` | The card's drills, for people who want to read them before buying |
| `guarantee.html` | The 30-day fit guarantee, returns, lead times, shipping |
| `about.html` | Short and true for now. It grows when the owner sends his own facts and a photo (the HTML comment on the page lists them). Nothing invented. |
| `configurator.html` | The configurator, written by `configurator/build.py` on every build, with a bar back to the site |
| `links.js` | The shop and listing addresses. Empty until each shop exists; a button with no address says "opens this week" |
| `site.js`, `style.css` | The buttons and the look. One accent color, system fonts, no web fonts, nothing loaded from elsewhere |
| `img/` | Renders from the configurator's own preview of the real models. Replace with photos of the printed parts as you take them (same file names) |

Support runs through the shops' messages (Etsy and TikTok Shop), and every page says so. There is no email
address on the site until the domain exists.

## Before every upload

1. Run the check from the repository root:

```bash
py -3 marketing/launch/check_launch.py
```

It checks the Etsy and TikTok files against the field limits, every public text for the old name, the
internal link, the domain that doesn't exist yet and machine-sounding phrases, and the site for leftover
brackets, missing images and broken links.

2. `links.js`: paste the Etsy shop address and each listing's address as they go live. TikTok the same.
3. Photos: when the printed ball is photographed, drop the photos over the renders in `img/` with the same
   names (`ball-grip.png` is the one on the home page).

## Hosting on Cloudflare Pages (free, no domain)

1. Create a free Cloudflare account (email and password; nothing to pay).
2. Dashboard: Workers & Pages, Create, Pages, Upload assets. Project name `rollread`. Drag this folder in
   (index.html must be at the top). Deploy.
3. Cloudflare shows the address: `rollread.pages.dev` if the name was free, otherwise the name you chose.
   That is [site address] everywhere in `marketing/launch/`: the Etsy shop announcement, the league post,
   the TikTok, Instagram and YouTube bios.
4. Open the address on a phone. Every page, every button. On configurator.html type a sheet, build, export
   the fit sheet.
5. Every later update: run the check, then on the same project Create deployment, Upload assets again.

## When you buy the domain

Cloudflare Registrar sells rollread.com at cost (about $10 a year). Then, in the Pages project: Custom
domains, Set up a custom domain, rollread.com; Cloudflare writes the DNS itself. Email Routing gives you
support@rollread.com forwarded to Gmail for free; put it on the pages then.

## Rules the pages follow

- Every price on the site matches the Etsy listing. Checkout happens on Etsy or TikTok Shop, never here.
- No rev-rate claim anywhere. "Feedback tool" is the phrase.
- Roll it, never throw it, on every product page and in the footer.
- Nothing is loaded from another site: no fonts, no analytics, no scripts. Nothing to disclose.
