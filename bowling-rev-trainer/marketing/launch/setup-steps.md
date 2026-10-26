# RollRead storefronts: the steps in order

Three storefronts: Etsy (four listings), TikTok Shop (three listings, made to order), and the site in
`site/` on a free Cloudflare Pages address (no domain yet; checkout on Etsy and TikTok Shop). Written 2026-10-26, the day the first ball went on
the printer. Fees and seller rules were checked that day against seller guides, not the platforms' own
pages: read each fee page once when you open the account.

Accounts, ID, bank details and payments are yours to enter. Everything else in this folder is written and
paste-ready.

## What goes where

| Product | Etsy | TikTok Shop | Site page |
|---|---|---|---|
| Rev Ball, $129 | `etsy-rev-ball.txt` | `tiktok-rev-ball.txt`, handling 10 business days | `site/ball.html` |
| Rev Puck, $89 | `etsy-rev-puck.txt` | `tiktok-rev-puck.txt`, handling 5 | `site/puck.html` |
| Rev Spinner, $45 | `etsy-rev-spinner.txt` | `tiktok-rev-spinner.txt`, handling 3 | `site/spinner.html` |
| Fit Kit, $24 credited | `etsy-fit-kit.txt` | not listed (the credit only works on Etsy) | `site/fit-kit.html` |

Why this split: Etsy's personalization box takes the drill sheet and its processing time is a normal
setting. TikTok Shop's Made-to-Order selling type (3 to 14 business days of handling) is what makes a
printed-to-order ball possible there; without it a listing must dispatch in 1 to 2 business days. The site
is the demo and the brand home; it sends every order to one of the two shops, so there's no payment
processing, sales tax or dispute handling to run yourself. Shopify waits until the shops' orders would cover
$39 a month; the products can be made from this session's Shopify tools then.

Fees as checked 2026-10-26: Etsy $0.20 per listing, 6.5% of item plus shipping, 3% plus $0.25 processing,
a possible one-time set-up fee at opening ($15 to $29 in the guides), Offsite Ads 15% only on sales they
bring. TikTok Shop about 6% referral. On a $129 ball with $12 shipping, Etsy's cut is about $13.65.

## Today, while the ball prints

1. The site, first, because its address goes into everything else. `site/README.md`: a free Cloudflare
   account, Workers & Pages, upload the `site/` folder, project name rollread. The address Cloudflare gives
   you (rollread.pages.dev if the name is free) is [site address] in every file here. No domain: buy
   rollread.com later if the shops sell, and attach it in one click then. Support runs through the shops'
   messages, so there is no email address to set up.
2. Handles. Claim rollread on TikTok, Instagram and YouTube. If taken, rollreadball.
3. Colors. Decide the base and second colors you stock and replace the [EDIT] line in `etsy-rev-ball.txt`
   and `tiktok-rev-ball.txt`.
4. Etsy. Sell on Etsy, Open your Etsy shop: country, USD, shop name RollRead. Etsy makes you create the
   first listing to open: use `etsy-fit-kit.txt`. Then the bank account, ID and billing card. Shipping
   profile "Made to order": processing 5 to 10 business days, origin your ZIP, calculated shipping from the
   packed weight and box. Policies: Etsy exempts personalized items from returns; state your own 30-day
   reprint promise. About: a photo of you with the printer and three true sentences. Shop announcement:
   "Build your part first at [site address]: type in your drill sheet, see it on screen, export the fit sheet
   and paste it into the order." Then draft the ball, puck and spinner listings and keep them as drafts.
5. TikTok Shop. `tiktok-setup.md`, steps 1 to 5: the seller account, the shop name, shipping, returns.
   Verification can take a day or two, so start it today.
6. Handles and bios: put the site address in the TikTok, Instagram and YouTube bios. The site's Order
   buttons say "opens this week" until the shop addresses go into `links.js` and you upload again.

## Tomorrow, when the ball is off the printer

7. The hand checks in `10-ball-first-plan.md` section 4.1: fit, pitch feel, thumb depth, roll, bullseye,
   pattern. Nothing public happens until it passes.
8. Photos and the clip from the lists at the end of each listing file. Your own photos, no stock images.
   Drop the ball photos over the renders in `site/img/`.
9. Publish the Etsy listings. Read each live page once: no FitSlice, no claude.ai, no rev-rate claim.
   Paste each listing's address into `site/links.js` and upload the site again.
10. TikTok Shop: add the three products from the files (`tiktok-setup.md` step by step), Made-to-Order
    with the handling times above, and publish. Paste the addresses into `links.js`, upload again.
11. The league post from `league-post.md`, after the admins' okay. Then the five texts.

## This week

12. TikTok, Instagram and Shorts: the roll clip, the yo-yo drill clip, the configurator clip. The first
    TikTok video tags the Rev Ball in the shop. Bio: "Practice ball printed from your drill sheet. Roll it.
    Read it." and the site address. Cadence from `06-content-and-launch.md` section 1.4.
13. Orders go through the app as RR-0003 onward, the shop's order number in the notes.
14. A one-line log per ball: print hours, failures, grams. It sets the processing time and the price later.

## The stops

- Nothing public says FitSlice. Nothing public links to claude.ai. `check_launch.py` looks for both.
- No rev-rate claim anywhere. "Feedback tool" is the phrase.
- Roll it, never throw it, on every listing and the card.
- No link, address or handle inside a TikTok Shop listing. The site address lives in the account bio.
- The configurator page carries no prices and no buy buttons; the product pages carry the Etsy price and
  send buyers to Etsy or TikTok Shop.

## Brackets to fill before anything goes live

- `etsy-rev-ball.txt` and `tiktok-rev-ball.txt`: the [EDIT] colors line.
- [site address] in `etsy-rev-ball.txt` (the shop announcement) and `league-post.md`, once Cloudflare gives it to you.
- `site/about.html` is short and true for now; it grows when you send your own facts and a photo.
- `league-post.md`: [admin's name], [pro shop], [price], [Name], [league night].
- Etsy About and TikTok shop profile: your own words and photo.
- Shipping: the packed weight and box size of each part.

## Decisions still open from the kit

- The domain. rollread.com was free on 2026-10-26 (about $10 a year at Cloudflare). Buy it when the shops
  sell; until then the free address does the job. The support mailbox comes with it.

- $129 online and $99 local for the first ten (`10-ball-first-plan.md` section 12). The listings and the
  site say $129.
- The ball's reprint price when the sheet was entered wrong: the guarantee page says half price. Change it
  if you want a fixed number.
- Whether the puck and spinner's older drill cards get the same voice pass as the ball's card before they
  ship (`app/renderer-src/orders.js`).
