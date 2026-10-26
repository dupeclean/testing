# rollread.com: the site in this folder

Hand-written static pages plus the configurator. Upload this whole folder to the host; nothing else is
needed. Written 2026-10-26.

| File | What it is |
|---|---|
| `index.html` | Home: what the ball is, the two drills, the four products, how ordering works |
| `ball.html`, `puck.html`, `spinner.html`, `fit-kit.html` | One page per product, with Order buttons that go to Etsy and TikTok Shop |
| `drills.html` | The card's drills, for people who want to read them before buying |
| `guarantee.html` | The 30-day fit guarantee, returns, lead times, shipping |
| `about.html` | You. Every square bracket on it is a fact only you know. |
| `configurator.html` | The configurator, written by `configurator/build.py` on every build, with a bar back to the site |
| `links.js` | The shop and listing addresses. Empty until each shop exists; a button with no address says "opens this week" |
| `site.js`, `style.css` | The buttons and the look. One accent color, system fonts, no web fonts, nothing loaded from elsewhere |
| `img/` | Renders from the configurator's own preview of the real models. Replace with photos of the printed parts as you take them (same file names) |

## Before the first upload

1. `about.html`: replace every bracket with the truth, and put a photo of you at `img/about-photo.jpg`.
   Nothing invented, nothing I wrote for you. The check below refuses the page while a bracket is left.
2. `links.js`: paste the Etsy shop address and each listing's address as they go live. TikTok the same.
3. Photos: when the printed ball is photographed, drop the photos over the renders in `img/` with the same
   names (`ball-grip.png` is the one on the home page). Add the roll clip to the home page then: a
   `<video>` tag in place of the first figure, file in `clips/`.
4. Run the check from the repository root:

```bash
py -3 marketing/launch/check_launch.py
```

It checks the Etsy and TikTok files against the field limits, every public text for the old name, the
internal link and machine-sounding phrases, and the site for leftover brackets, missing images and broken
links.

## Hosting on Cloudflare Pages (free)

1. Register rollread.com. Cloudflare Registrar sells at cost (a .com is about $10 to $11 a year); any
   registrar works, but then add the site to Cloudflare and move its nameservers there so step 3 is one
   click. It was still available on 2026-10-26.
2. Cloudflare dashboard: Workers & Pages, Create, Pages, Upload assets. Project name `rollread`. Drag this
   folder in (index.html must be at the top). Deploy.
3. In the project: Custom domains, Set up a custom domain, rollread.com. Cloudflare writes the DNS record
   itself when the domain is on Cloudflare. Add www.rollread.com the same way.
4. Open https://rollread.com on a phone. Every page, every button. On configurator.html type a sheet,
   build, export the fit sheet.
5. Every later update: run the check, then on the same project Create deployment, Upload assets again.

GitHub Pages works as a fallback: a separate public repository (not this one; its name shows in the default
address and its history is the whole product), this folder as the root, Settings, Pages, Deploy from a
branch, custom domain rollread.com, the four A records GitHub lists plus a CNAME for www.

## Email

Cloudflare, Email Routing: support@rollread.com to your Gmail. Free. Every page already uses that address.

## Rules the pages follow

- Every price on the site matches the Etsy listing. Checkout happens on Etsy or TikTok Shop, never here.
- No rev-rate claim anywhere. "Feedback tool" is the phrase.
- Roll it, never throw it, on every product page and in the footer.
- Nothing is loaded from another site: no fonts, no analytics, no scripts. Nothing to disclose.
