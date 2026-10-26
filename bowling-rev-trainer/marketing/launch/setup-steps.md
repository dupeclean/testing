# RollRead launch: the steps in order

Written 2026-10-26, the afternoon the first ball went on the printer. Fees and seller rules below were
checked that day against seller guides, not the platforms' own pages, so read the fee page once when you
open each account. Prices in the kit are still a founder decision ($129 online, $99 local; section 12 of
`10-ball-first-plan.md`); the listing files say $129.

## Which channels, and why this order

| Channel | Now? | Why |
|---|---|---|
| Etsy | Yes, this week | Made-to-order processing time is a normal setting. The personalization box takes the drill sheet. Etsy runs the cards, the sales tax and the buyer trust. $0.20 to list. |
| rollread.com | Yes, this week, as the demo and the brand home, not a checkout | The configurator is the demo. Hosting is free. Prices and buy buttons stay off the page while Etsy is the shop. |
| TikTok, Instagram, Shorts (videos) | Yes, this week | The roll clip is the ad. Link in bio to rollread.com. |
| TikTok Shop (checkout) | Not yet | Shop handling time is 1 to 2 business days to dispatch and a ball is a day on the printer plus finishing. The checkout has no box for the drill sheet. One clip that lands can bring more orders than one printer ships, and late orders cost the shop its standing. Revisit with a second printer and a pre-order setting you have confirmed in Seller Center. |
| Shopify | Later | A monthly bill before there are orders, and you carry payments, tax and disputes yourself. Open it when Etsy orders cover the plan, and put the checkout on rollread.com then. |

Fees as checked 2026-10-26 (confirm on each platform's own page):

- Etsy: $0.20 per listing, every four months or on each sale. 6.5% of item plus shipping. Payment processing 3% plus $0.25. A one-time shop set-up fee may show at opening (guides say $15 to $29). Offsite Ads, 15%, only on sales they bring, and optional under $10k a year.
  On a $129 ball with $12 shipping that is about $13.65 in fees.
- TikTok Shop: about 6% referral on most categories (some 2026 guides say 8%; Seller Center shows the real rate). An individual seller registers with an SSN or government ID, a US bank account and a US phone number.

## Today (the ball is on the printer)

1. Domain. Register rollread.com. Cloudflare Registrar sells at cost and the site sits on Cloudflare Pages anyway, so one account covers both. About $10 to $16 a year.
2. Email. Cloudflare > Email Routing: support@rollread.com forwards to your Gmail. Free. Replies go out from Gmail for now.
3. Handles. Claim rollread on TikTok, Instagram and YouTube. If it's taken, rollreadball. The Etsy shop name is set in step 5.
4. Colors. Decide the base colors and second colors you will stock and put them in the [EDIT] line of `etsy-rev-ball.txt`.
5. Open the Etsy shop. Sell on Etsy > Open your Etsy shop: country, USD, shop name RollRead. Etsy makes you create the first listing before the shop opens: use `etsy-fit-kit.txt`, which needs no ball photos. Then the bank account for Etsy Payments, your ID, and a card for the bill. If a set-up fee shows, it's the one-time fee above.
   For every listing in this folder: who made it, I did; what is it, a finished product; when, made to order; renewal automatic; type physical; personalization on and required with the instruction from the file; tags one at a time; materials from the file.
6. Shipping profile. One profile, "Made to order". Processing time 5 to 10 business days (a ball a day). Origin your ZIP. Calculated shipping: weigh a packed ball when the first one comes off (the ball is about 710 g; with box and padding expect about 1 kg) and enter the box size. Free shipping is a lever for later, not now.
7. Policies and About. Etsy exempts personalized items from returns; your own promise (reprint free within 30 days if it doesn't match the sheet or doesn't roll true) is in the listing FAQ, so say the same in the policies. About: a photo of you with the printer and three true sentences in your words.
8. Shop announcement: "Build your ball first at rollread.com: type in your drill sheet, see the grip and the bullseye, export the fit sheet and paste it into the order." The address goes nowhere else on Etsy except the screen photo's caption.
9. Draft the Rev Ball listing from `etsy-rev-ball.txt` and leave it as a draft. It goes live at step 12.

## Tomorrow (the ball is off the printer)

10. The hand checks in `10-ball-first-plan.md` section 4.1: fit, pitch feel, thumb depth, roll, bullseye, pattern. Nothing below happens until it passes.
11. Photos and the clip, from the lists at the end of the two listing files. Your own photos, no stock images.
12. Publish the Rev Ball listing. Read the live page once: no FitSlice, no claude.ai, nothing about rev rate.
13. The site. `site/README.md`: upload the site folder to Cloudflare Pages and attach rollread.com. Then, on your phone, type a sheet, build, export the fit sheet.
14. The league post from `league-post.md`, after the admins' okay. Then the five texts.

## This week

15. TikTok, Instagram and YouTube Shorts: the roll clip, the yo-yo drill clip, the configurator clip. Bio: "Practice ball printed from your drill sheet. Roll it. Read it." and rollread.com. Cadence from `06-content-and-launch.md` section 1.4.
16. Orders go through the app as RR-0003 onward; put the Etsy order number in the order's notes.
17. A one-line log per ball: print hours, failures, grams. It sets the processing time and the price later.

## The stops

- Nothing public says FitSlice. Nothing public links to claude.ai.
- No rev-rate claim anywhere. "Feedback tool" is the phrase.
- Roll it, never throw it, on every listing and the card.
- The configurator page carries no prices and no buy buttons while Etsy is the shop.

## Brackets to fill before anything goes live

- `etsy-rev-ball.txt`: the [EDIT] colors line.
- `league-post.md`: [admin's name], [pro shop], [price], [Name], [league night].
- Etsy About: your own words and photo.
- The shipping profile: packed weight and box size.

## Later, from this repo

- An "Order on Etsy" line on the configurator page once the shop address exists (one edit in `configurator/template.html`, then rebuild and re-upload).
- Shopify: the products and a store preview can be made from this session's Shopify tools when orders cover the plan; `shopify_products.csv` has the rows.
- TikTok Shop: re-check handling time and pre-order in Seller Center before opening it.
