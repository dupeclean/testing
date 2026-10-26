# FitSlice Ball-First Plan: Selling the Rev Ball on One Printer and Under $200

Working draft, 23 October 2026. This file records the decision to lead with the Rev Ball, the plan for the first ninety days on one printer with under $200 of cash, the Rev Ball's product facts, prices, unit economics and claims, the copy the ball needs (a product page and an Etsy listing), the naming decision the founder still has to make, and the changes every other file in this kit needs before the ball goes public. The nine files before it were written for the Rev Puck on 22 October, before the Rev Ball existed, and none of them mentions it.

How to use this file:

- Source of truth for every product fact is `app/docs/START-HERE.txt` (section 5, the Rev Ball) and the job sheet FitSlice exports with each ball order; for claims, `docs/business-plan.md` Part 6 plus Section 6 of this file. Language follows `01-brand-platform.md` except where Section 8 proposes a change, which is a founder decision until adopted.
- Every number marked *estimate* is ours and unsourced. `[PRINT LOG]` marks a figure the founder's first printed balls replace. `[RATE]` marks a shipping, hosting or fee figure nobody has looked up. `[DECISION — founder: …]` marks a choice only the founder can make.
- The founder's answers of 23 October that shaped this plan: the first Rev Ball (order FS-0002, the founder's own sheet) is printing now; the first ten buyers should be league mates and local bowlers; a second printer comes when orders back up; cash for the next ninety days is under $200.

---

## 1. The decision

**Lead with the Rev Ball. Keep the Fit Kit beside it. Take the Rev Puck and Rev Spinner off the public line at launch. Sell nothing until the founder's own ball has passed Section 4.1.**

Three reasons the ball leads.

1. **It shows the outcome.** The puck gives the hand its own holes to feel. The ball does that and then rolls: off the tape line or not, with the bullseye standing still or wheeling round. The business plan (Part 8) names the puck's biggest problem: "it needs a sentence of explanation before anyone wants it." A fifteen-second clip of a ball with the bowler's own holes rolling across a carpet needs none.
2. **It uses the printer better than the puck.** One printer is the constraint (business-plan Part 5.2). Revenue per printer hour, at the kit's slicer times and the prices in Section 3:

| Product | Price | Print time | Revenue per printer hour |
|---|---|---|---|
| Fit Kit | $24, credited later | 3 h 24 m | $7 |
| Rev Spinner | $45 | 3 h 38 m | $12 |
| Rev Puck | $89 | 11 h 20 m | $8 |
| Rev Ball with inlays | $129 | 12 to 15 h (*estimate*: 10 to 14 h for the ball, about 1 h for the inlays) | $9 to $11 |

3. **It carries every drill the puck had.** The grip is in it, the blind thumb is in it, and the two-handed version (no thumb hole, finger holes centred on top) covers the spinner's customer. A buyer with the ball has no reason to buy the puck.

Why not ball-only: the Fit Kit stays. It is how the ball's holes get sized on our printer, it is the $24 first purchase a stranger will risk, and its credit carries the buyer to the ball. Why not yet: no FitSlice part has been printed and used. Thumb depth (70 mm default) and the pitch sign are still unconfirmed on a real hand (`HANDOFF.md` items 3 and 4). A ball that wobbles after its support scar is sanded, or whose pitches feel backwards, is a refund on a twelve-hour print.

What this does not change: the channel order in business-plan Part 8 and `09-target-list-notes.md` Section 4 (small coaches first, then larger channels, shops as drill-sheet capture, marketplaces for discovery, booths last), the claims rules in Part 6, the disclosure rules in `01` Section 3, the pilot in Part 7, and the fit guarantee.

---

## 2. The Rev Ball: product facts

Everything in this section comes from the exported job sheet and `START-HERE.txt`, and may be said in copy as a product fact.

| Fact | Value |
|---|---|
| Size and weight | 200 mm ball; about 700 g of PETG at 4 walls and 8% gyroid infill (`[PRINT LOG]` replaces this with the sliced figure) |
| Grip | The customer's drill sheet: thumb, middle and ring sizes in 1/64" steps, both spans, forward/reverse and lateral pitch on every hole, oval thumb if the sheet gives one, right or left hand, bevelled hole edges (thumb 4 mm, fingers 2.5 mm) |
| Thumb | Blind, 70 mm deep by default, set from the customer's thumb length; or no thumb hole for a two-handed bowler (the finger holes then sit centred on top) |
| Finger depth, bridge | 24 mm; bridge from the sheet (1/2" default) |
| Resting flat | A 22 mm flat on the bottom so it sits still on a shelf and stands on the build plate |
| Axis target | Two 12 mm sockets, each inside a 60 mm ring pocket, at the axis point (the PAP) and the opposite point; plugs and rings print in the second colour and press in. PAP from the drill sheet when the shop measured it (over, then up, along the surface from the centre of the grip; from the middle of the finger holes on a no-thumb ball), otherwise the forward-roll axis: 90° round from the grip centre, straight out the sides of the ball (6 11/16" over, 0 up on a regulation ball), the axis of the yo-yo roll |
| Second colour | The axis bullseyes and a 12 mm track ring on the line the ball rolls on about the axis point, all printed inlays (plugs, rings and two arcs) pressed or glued in; the ball body is one colour. An optional layer pattern (spot, cap, bands) by filament swaps remains in the Second colour list, then exported as a Bambu Studio 3MF with both colours assigned (verified to open as one object in two colours, 23 October) |
| Engraving | The order number, 0.5 mm into the flat |
| Files per order | ball STL, ball 3MF (only with a layer pattern), `axis_inlays_D12_ring60_track12.stl`, `release_gate_210mm_pin100.stl`, fit sheet (JSON), job sheet, customer card (PDF) |
| Release gate | In every ball order's files: dovetailed segments and loose 20 mm pins 210 mm apart that the ball knocks down 1.5 to 2 m out; about 65 g and a short print per segment. Not a product yet (Section 3) |
| Print | PETG, 0.2 mm layers, 4 walls, 8% gyroid infill, 5 top and bottom layers, a hot nozzle and a low fan, grip holes up, tree supports on the build plate only with the support interface in the other material (PLA under PETG) so they drop off clean, random or scarf seam. Inlays: 100% infill, no supports; the arcs stand on edge |

**How it is used** (the drill on the customer card): kneel, swing low, let it go along a strip of tape on the floor with a couch or wall 1.5 to 2 m away. It rolls and curves off the line, or it does not. The customer card lists what each outcome shows (roll and curve: thumb out, fingers lifted, hand coming round the ball; straight and lively: forward roll, hand behind the ball; straight and short: dumped; pops up: thumb hung up; spins in place: hand on top) and the behind-the-ball reading: the bullseyes sit at the forward-roll axis, straight out the sides, so a yo-yo roll (hand behind the ball, fingers lifting straight) keeps them still at the ball's centre height with the track ring rolling along the tape, while a hand that comes round the ball has its axis swung round by the carpet in the first foot, so the bullseye swings back, the ring wobbles and the path kinks. A bullseye at the bowler's own PAP (the sheet option) is read in the first frames of a slow-motion clip, not on the roll. How those readings are worded in public copy is governed by Section 6.

**What carpet does to the axis (worked 26 October 2026).** A 200 mm, 700 g ball released at 2 m/s and 150 rpm stops slipping within 10 to 30 cm of carpet, and while it slips the friction swings its spin axis inside the ball by about two thirds of the axis rotation it was released with: 0° of rotation leaves the axis where it was; 20° swings it 14° (25 mm across the surface) and kinks the path 6°; 45° swings it 33° (57 mm) and kinks the path 12°. So a hook release's bullseye swings on carpet whether the release was right or not. A straight forward roll (the yo-yo release: hand behind the ball, fingers lifting straight up the back) is the one release whose axis holds, and its axis sits 90° round from the grip centre, straight out the sides of the ball, for every bowler, because a straight finger lift turns the ball about the line between the finger holes. That is why the bullseyes and the track ring sit at the forward-roll axis unless the sheet gives a PAP, and why the card reads them as a behind-the-ball check rather than a verdict on a hook release. A smooth floor doubles the slip distance; a slow-motion clip shows the axis at release before the floor moves it.

**What it is not.** Not a bowling ball, not a regulation anything, never thrown, never used on a lane. 200 mm against a regulation 8.5 inches (216 mm); about 700 g against 6 to 16 pounds. It is rolled on carpet from a kneeling swing.

---

## 3. The line and the prices

| Product | What ships | Price | Status |
|---|---|---|---|
| **Fit Kit** | Sizer plate around the expected sizes in 1/64" steps, bowler's tape, fitting card | $24, credited toward a Rev Ball | On the line (unchanged from `02`) |
| **Rev Ball** | The ball from the drill sheet, axis plugs, rings and track arcs fitted, gate segments and pins if proven (Section 4.1), fit sheet, customer card | $129 plus shipping online; $99 hand-delivered founder price for the first ten (Section 4) | **Lead product** |
| **Rev Ball, two-handed** | Same ball without a thumb hole | Same | Lead product; takes over the Rev Spinner's role |
| **Digital Rev Ball** | STL, two-colour 3MF, inlays STL, gate STL, fit sheet, print settings; the configurator generates them | $29 | After the printed ball has sold (Section 5.4) |
| Rev Puck, Rev Spinner, Pair | Unchanged | $89 / $45 / $119 | Off the public line at launch; files kept; printed on request |
| Release gate | Segments and pins | Free in the ball box once it has proved itself in the founder's hands | Not sold separately yet |
| Elbow Target | `accessories/elbow-target/` | Not sold | Not in the app; needs no drill sheet |
| Pro-shop program | Shop enters the sheet; we drop-ship; shop earns 25% | Wholesale on $129 | Unchanged in design (`03`); margin math moves to the ball |

**Why $129.** The puck's anchors (business-plan Part 5.1) still hold: the wrist-brace band ($40 to $100), fit services ($40 to $150 drilling), unit cost. The ball adds two things the puck lacked, the rolling outcome and the two-colour axis target, carries five times the filament, takes a full printer day, and ships in a box five times the volume. $129 sits above the puck's $89 and below the point where a league bowler compares it with a drilling. The $99 founder price is for hand-delivered balls to people the founder bowls with, with no box, shipping or fees in it, and it is said to be a founder price. `[DECISION — founder: $129 online and $99 local, or other]`.

**Unit economics, Rev Ball** (*estimates* until `[PRINT LOG]`; the cost basis is business-plan Part 5.2):

| Item | Online sale at $129 | Hand-delivered at $99 | Basis |
|---|---|---|---|
| PETG: ball 700 g, inlays 20 g, supports `[PRINT LOG]` | $19 | $19 | $25/kg; supports guessed at 40 g |
| Machine time, 12 to 15 h | $3 | $3 | Part 5.2 basis, scaled from 11 h |
| Labour: supports off, scar sanded, roll check, bores checked, inlays pressed, pack | $8 | $8 | 25 min at $20/h |
| Box (9 by 9 by 9 in), padding, card | $5 | $0 | *estimate* |
| Payment and marketplace fees | $4 (own shop) to $13 (Etsy) | $0 | 3% + $0.25; Etsy 6.5% + 3% + $0.25 |
| **Landed before shipping** | **$33 to $42** | **$24** | |
| Shipping, about 750 g packed, domestic | `[RATE]` (*estimate* $12 to $18), charged to the buyer | none | Unsourced, as Part 12 already notes |
| **Gross margin** | **67% to 74%** | **76%** | |

**Capacity.** One ball a day on one printer, so 20 to 25 balls a month with nothing else printing: a revenue ceiling of about $2,600 to $3,200 a month at $129. Rule for the second printer `[DECISION — founder]`: order it when paid orders waiting exceed five (a week of printing), and pay for it from the margin on balls already sold, never from the $200.

---

## 4. The first ten: the local round (weeks 0 to 4)

### 4.1 Week 0: the founder's own ball must pass

FS-0002 is printing. Before anyone else's sheet goes in, it passes every line:

| Check | Pass |
|---|---|
| Holes | Thumb, middle and ring fit the founder's hand the way the drilled ball does, with no more than a layer of tape; bores measured against the sheet and written down |
| Pitches | Forward/reverse and lateral feel the same as on the drilled ball; if they feel backwards, the pitch sign is wrong (`HANDOFF.md` item 3) and nothing ships until it is fixed and re-verified |
| Thumb depth | 70 mm is right for the founder's thumb, or the right value is known |
| Roll | After the support scar is sanded, the ball rolls straight on carpet from a push with no visible wobble |
| Axis target | Plugs and rings press in and stay in; rolled straight forward with the hand behind the ball, the bullseyes sit still at centre height and read from 2 m; rolled with the hand round the side, the bullseye swings back in the first foot |
| Track ring | The arcs seat flush in the channel; on a forward roll the ring stays under the ball along the tape and reads from behind |
| Print log | Actual time and grams from Bambu Studio, and the support weight, written into Section 3's table (`[PRINT LOG]`) |
| Gate | Segments link, pins stand, a rolled ball knocks a pin down at 1.5 to 2 m; if it does not earn its place, it stays out of the box |

The clip is filmed on this ball: phone on the floor, the ball rolling straight away along the tape from a behind-the-ball release, the bullseye still; then one with the hand round the side, the bullseye swinging back. That is the hero asset for everything in Section 5 and it costs nothing.

### 4.2 Weeks 1 to 4: ten balls for ten people the founder bowls with

1. **Ask for the drill sheet.** Each person asks their pro shop for it (the shop has it on file). How many of the ten can produce one, and in what form, is the plan's open question (Part 12) answered on a small sample; write it down.
2. **Enter it in FitSlice, export, print.** One a day. Ten balls is about two weeks of printer, three with reprints.
3. **Check every ball** against Section 4.1 before it leaves, and measure the three bores against the sheet. Ten balls give the first tolerance table (Section 4.3).
4. **Deliver by hand, inlays pressed in, $99 by cash or Venmo.** Say it is a founder price. A friend who paid is a customer and may be quoted with permission. Anyone who receives a ball free carries the disclosure line from `01` Section 3 on anything they say about it in public.
5. **Collect three things** from every buyer within a week: the sentence they use to describe it to someone else (the product page opens with the best one, in their words, with permission); whether the holes fit without tape; whether the bullseye reads from the couch.
6. **Ask for one clip or photo** of them using it, and written permission to use it. No scripts, no asked-for quotes (`05` Section 1 rules apply to friends too).

**Cash.** Two spools of PETG and one of the second colour, about $75, start it. Each ball's $99 buys the next spools. Nothing else is spent in these weeks. `[DECISION — founder: the ten names]`.

### 4.3 The ball's tolerance table (the launch gate)

The kit's launch gate is Study 1 (business-plan Part 7; `06` Section 1.2): thirty pucks measured, bore standard deviation under 0.1 mm, before any paid spend and before the word "exact" is used about a printed part. For the ball path the gate is the same measurement on the first ten balls: thirty bores against ten sheets. The table goes on the Fit Kit page and the Rev Ball page as "measured on the first ten balls". Until it exists, copy says "built from your drill sheet" about the model and nothing about the printed bore.

---

## 5. Online, still under $200 (weeks 4 to 8)

### 5.1 Hosting: the configurator on a domain, free

The configurator is one self-contained HTML file (`configurator/index.html`, about 1.5 MB, nothing loaded from elsewhere). It runs on any static host: GitHub Pages or Cloudflare Pages cost nothing; a domain costs about $12 a year `[RATE]`. The kit already requires this: the claude.ai link in every file is for internal review only and must never go public (`06` Section 12, `07` Section 13). The hosted page is the demo: type in a sheet, see the ball with the bullseye and the pattern. Prices and buy buttons on it come later, with the shop; the page shown to Etsy buyers must carry neither (`04` Section F).

### 5.2 Etsy first, Shopify later

Etsy costs $0.20 to list and takes its fees from each sale (6.5% plus 3% and $0.25, and 12 to 15% on ad-attributed sales; `04` Section F). Shopify waits until monthly orders cover its subscription. The Rev Ball listing is in Section 10.2, in the format of `04` Section F.1, with the ball's extra personalisation fields.

### 5.3 Video and posts, at no cost

- The roll clip (Section 4.1), fifteen seconds, with the ten-second line as the caption. Instagram, TikTok and Shorts, in the cadence of `06` Section 1.4.
- The configurator clip: a real drill sheet typed in, the ball appearing with the bullseye (`06` Script 3, with the ball).
- r/Bowling, only with the moderators' permission, on their day, as `06` Section 4 requires. The founder stays in the thread for 48 hours.
- The founder's own league's Facebook group first, then groups A to D from `06` Section 5, one post each, value first, maker disclosed.
- Scripts 1, 3, 5, 8 and 10 in `06` Section 3 need ball versions; Script 1 (the thumb pop) becomes the roll test and Script 8 (carpet spins) becomes the bullseye.

### 5.4 Digital Rev Ball

After the printed ball has sold: the files for $29, generated from the buyer's sheet by the configurator, with the inlays (bullseyes and track arcs), the gate, the optional two-colour 3MF and the print settings. Same rules as the Digital Files page in `02`: printed hole sizes vary by printer, use the sizer plate first, the fit guarantee does not cover files you print yourself.

### 5.5 Budget

| Item | Cost | When |
|---|---|---|
| Two spools PETG, one spool second colour | about $75 | Week 0 |
| Domain | about $12 `[RATE]` | Week 5 |
| Static hosting | $0 | Week 5 |
| Etsy listing | $0.20 | Week 6 |
| Boxes, padding, tape | from ball revenue | Week 6 |
| Everything else (LLC, insurance, counsel, a second printer, any ad) | from ball revenue, Section 7 | When the first ten have paid |
| **Cash out of pocket** | **under $100** | |

---

## 6. Claims for the ball (proposed additions to business-plan Part 6)

Same three colours, same rules. These are proposed until counsel has read them with Part 6.

**Green: product facts**

- "Built from your drill sheet: hole sizes in 1/64" steps, both spans, forward/reverse and lateral pitch for every hole, on a 200 mm ball." (Model fact, as the puck's. "Exact" about the printed bore only after Section 4.3.)
- "A 200 mm practice ball, about 700 g, rolled on carpet. Not a bowling ball, never thrown." (Product fact and use.)
- "The bullseyes and the track ring sit at the forward-roll axis, straight out the sides of the ball, or at your own axis point if your sheet gives it. When the ball spins about that axis they stand still." (Physical fact about a marked sphere.)
- "Stay behind the ball, fingers lifting straight up the back, and the bullseyes sit still as it rolls away; come round the ball and they swing back." (What a rolling sphere does on carpet: the carpet swings the axis of a turned release in the first foot; Section 2.)
- "The second colour marks your axis point and your track, as printed inlays, not paint." (Product fact.)
- "Your order number is in the base. Your sheet is on file." (Product fact.)

**Yellow: with the qualifier**

- "*Designed to show* what the hand did: it rolls and curves off the line, or it does not, and the bullseyes sit still or swing back." (Not "tells you your release is right". The ball shows an outcome; reading that outcome as thumb, fingers and the hand behind or round the ball is the coaching consensus `01` already attributes.)
- "*Practise* staying behind the ball, the yo-yo roll, with your own holes." (Not "teaches" or "fixes".)
- "*Practice* a clean, early thumb exit and let the fingers lift, with your own holes." (Not "fixes" or "improves".)
- "*To our knowledge*, the first practice ball built from your actual drill sheet."

**Red: unchanged**

- Any number for revs, hook, pins or average; "feels exactly like your ball"; "approved"; any ball company's name; results in testimonials without the typical-result disclosure; the bullseye standing still on a hook release, or any reading of the bullseye as a verdict on a hook release (on carpet the carpet swings that axis whatever the hand did).

**Lines for the ball** (each tied to a true property, like Part 6's):

- "Your drill sheet, in a ball you can roll at home."
- "Roll it. Read it." (The outcome is the feedback.)
- "Same holes. Same pitch. Your living room." (A variant of the puck line.)

---

## 7. Gates before a public shop (unchanged, now funded by the first ten)

`06` Section 1.2 lists what must be true before launch week 1. The ball path keeps every item and changes only where the money comes from.

| Gate | Status on the ball path |
|---|---|
| Tolerance study passed | Section 4.3: thirty bores on ten balls, measured, published |
| Seeded units out three weeks before launch | Two balls to a coach and a creator from their own sheets, disclosed, after the ten (Section 9); not from the $200 |
| Configurator on the brand domain | Section 5.1, free |
| LLC and general liability with product cover | From the first ten balls' revenue (about $1,000), which should cover the LLC fee and a year's premium in most states `[RATE]`; no ball is listed to strangers before both exist |
| Brand name cleared | Unchanged; the register search is free, counsel is not |
| Counsel review of claims | Part 6 plus Section 6 of this file, before the Etsy listing goes live |
| Welcome emails, pilot waitlist | Unchanged (`06` Section 8, Part 7) |
| Ten Fit Kits and display units photographed | Ten Fit Kits and two balls (one thumb, one two-handed) |

**The patent note, corrected.** Business-plan Part 4, Part 9, row C14 and Part 12 said US 7,261,638 (2007, "bowling practice device") was in force until about 2027 and needed a freedom-to-operate review before launch. Google Patents' legal-status record, read on 23 October 2026, says it lapsed on 28 August 2011 for non-payment of maintenance fees, and its only independent claim covers a generally cylindrical hollow body with two finger holes that take finger plugs, with foam appearing only in dependent claims. The business plan has been corrected, the freedom-to-operate item is closed, and the general patent search in Part 9's document list stays, with the ball's own terms added. Confirm the status in USPTO Patent Center before quoting it to anyone.

---

## 8. The name: a founder decision

`01` Section 1 says "what we never call it: a ball, a mini ball, a regulation anything", and rule 8 in Section 3 forbids "ball" in copy, because the Rev Puck must never sound like competition equipment. The Rev Ball is a ball: 200 mm, rolled on carpet, never thrown. `[DECISION — founder: name]`, two options:

**A. Keep "Rev Ball" and change the rule (recommended).** Replace the `01` line "What we never call it" with: "What we never call it: a bowling ball, a mini bowling ball, a regulation anything, a rev booster. The Rev Ball is called a practice ball, 200 mm, rolled on carpet, never thrown, and those words sit beside the name wherever it first appears on a page." Replace rule 8 with: "Call the puck a trainer, a slice, a puck, a disc, a plate. Call the Rev Ball a practice ball, 200 mm, rolled on carpet, never thrown. | Call anything a bowling ball, a mini bowling ball, 'regulation', or anything that sounds like competition equipment." Business-plan Part 9 (governing body) gets the same sentence. Why: "practice ball" is the category buyers already search for (Part 4 lists handheld practice balls as adjacent products), and the two words that matter, "never thrown", travel with it.

**B. Rename it** (Rev Roller, Rev Sphere, or a name the founder prefers) and keep the rule as written. Costs a rename in the app, the file names, the job sheet and `START-HERE.txt`, and buys nothing a buyer notices.

Until decided, internal files say "Rev Ball" and no public copy for the ball ships.

---

## 9. After the ten: coaches, the local shop, the second printer (weeks 8 to 12)

- **The founder's own pro shop first.** Ask the discovery question from `09` Section 4.3, word for word: "If a customer brought you their sheet and a link, would you enter it?" Log the answer. If yes, the counter card and a sizer plate from `03`, with the shop disclosure line, and 25% on $129.
- **One coach, one creator**, from Wave 1 of `09`, each with a ball printed from their own sheet, free, disclosed, no script (`05` Sections 1 and 2). The brief in `05` Section 4 changes in one line: film the roll, not the thumb pop.
- **Second printer** by the rule in Section 3.
- **Digital Rev Ball** goes on sale (Section 5.4).
- **Pilot** (Part 7) and the month-6 claims review are unchanged. The ball's outcome readings in Section 6 stay yellow until the pilot has something to say.

### 9.1 The ninety days, as a table

| When | What | Done when |
|---|---|---|
| Week 0 | The founder's ball passes Section 4.1; the clip is filmed; the print log is in Section 3 | Checklist signed; clip on disk |
| Weeks 1 to 2 | Five balls from five league mates' sheets, $99 each, hand-delivered | Five sold; bores measured; sheets-on-file count known |
| Weeks 3 to 4 | Five more; the tolerance table; the sentences, clips and permissions collected | Ten sold, about $1,000 in; table in the repo |
| Weeks 5 to 6 | Domain, hosting, configurator live without prices; LLC and insurance quotes; counsel reads Section 6 with Part 6; ball Etsy listing drafted | Page live; quotes in hand |
| Weeks 7 to 8 | LLC and insurance paid from revenue; Etsy listing live; r/Bowling post with permission; league Facebook group post; the shop's discovery question asked | First order from a stranger; shop answer logged |
| Weeks 9 to 12 | Coach and creator seeded; second printer by the rule; Digital Rev Ball on sale | Two seed units shipped; backlog under a week |
| Month 6 | Pilot results; claims and prices reviewed (unchanged from Part 13) | Updated Part 6 |

---

## 10. Copy the ball needs

### 10.1 PAGE: Product · Rev Ball (format of `02-website-copy.md`)

**Rev Ball**

$129

Tagline: Roll it. Read it.

[IMAGE: hero render of the Rev Ball on its flat, grip holes toward the camera, the track ring and one bullseye in the second colour.]

[IMAGE: the ball mid-roll on carpet along a strip of tape, the bullseye sharp, the couch out of focus behind.]

**Description**

The Rev Ball is a 200 mm practice ball printed from your drill sheet: thumb, middle and ring hole sizes in 1/64" steps, both spans, forward or reverse and lateral pitch on every hole, right or left hand, or no thumb hole for a two-handed bowler. About 700 g in PETG. Rolled on carpet from a kneeling swing, never thrown. It is not a bowling ball.

**Details**

- Built from your drill sheet: hole sizes in 1/64" steps, both spans, forward/reverse and lateral pitch for every hole, oval thumb if your sheet gives one.
- Blind thumb hole, 70 mm deep or set from your thumb length. Two-handed: no thumb hole, finger holes centred on top.
- Two bullseyes, a printed dot inside a printed ring in the second colour, at the forward-roll axis: straight out the sides of the ball, the axis it spins about when your hand stays behind it and the fingers lift straight up the back, like throwing a yo-yo. Stay behind the ball and they sit still as it rolls away; come round the ball and they swing back. If your shop measured your PAP, enter it and the bullseyes go there instead (read in slow motion, as the card explains).
- The track ring in the second colour: the line the ball rolls on about that axis, up through the thumb hole, between the fingers and over the top. Stay behind the ball and the ring rolls along the tape under it; come round the ball and it wobbles.
- A flat on the bottom so it sits still on a shelf.
- Designed to show what the hand did: roll it along a strip of tape toward the couch, and it rolls and curves off the line, or it does not. The card in the box lists the readings.
- Bores are smoothed by hand before shipping. Finish the fit with bowler's tape, as on your ball.
- Your order number is in the base. Your fit sheet is stored with your order.

**What you need to order**

Your drill sheet (the same list as the Rev Puck page), plus: through or no thumb hole; your thumb length to the first joint if you want the blind hole set to it; your PAP (over, then up) if your pro shop measured it, otherwise the bullseyes go at the forward-roll axis for the yo-yo roll; your two colours.

Enter it in the configurator and the 3D preview shows your holes, your axes and the bullseye before you order. If you completed a Fit Kit, enter the sizes from your fitting card. If you do not have your sheet, your pro shop usually has it on file.

**What's in the box**

- One Rev Ball, PETG, printed from your fit sheet, with the axis bullseyes and the track ring fitted in the second colour
- [The release gate: segments and pins, if Section 4.1 passes]
- Printed fit sheet matching your order
- Training card with the roll drill, the readings and the use warning
- One roll of bowler's tape

**Shipping and lead time**

Made to order. One ball takes a printer day; printing starts within `[LEAD TIME]` business days of your order and domestic shipping takes 2 to 5 business days. Shipping is charged at checkout `[RATE]`. You will get an email when your ball starts printing and another with tracking when it ships.

**Guarantee**

30-day fit guarantee. Your fit sheet is stored with your order. If the ball we ship does not match it, or does not roll true, we reprint it free. If your sheet was entered wrong, we reprint at a reduced price. Full terms on the Fit Guarantee and Returns page.

**Use and safety**

Rolled on carpet, never thrown. Keep 1.5 to 2 m clear in front of the line. Not for children under 12 without supervision; the plugs and rings are small parts. Keep it out of a hot car: PETG softens with heat and a warped ball will not roll true.

Button: Print my Rev Ball
Link: Prefer the files? Digital Rev Ball, $29

### 10.2 Etsy listing: Rev Ball (format of `04` Section F)

**Title (under 140 characters)**

Custom Bowling Practice Ball Printed From Your Drill Sheet, Your Hole Sizes Spans and Pitches, Two Colours, Axis Bullseye, Rolled Not Thrown

**Price:** $129.00 plus shipping. **Quantity:** 50 (made to order). **Processing time:** 5 to 10 business days (one ball a day).

**13 tags**

bowling practice ball · custom bowling · bowling release trainer · bowling drill sheet · bowling trainer · 3d printed bowling · bowling gift · league bowler gift · bowling training aid · two handed bowling · bowling axis · rev trainer · bowling coach

**Description**

Your drill sheet, in a ball you can roll at home.

The FitSlice Rev Ball is a 200 mm practice ball, 3D printed from your drill sheet: thumb, middle and ring hole sizes in 1/64-inch steps, both spans, forward/reverse and lateral pitch on every hole, right or left hand, or with no thumb hole if you bowl two-handed. It weighs about 700 g. You roll it on carpet from a kneeling swing along a strip of tape toward the couch, and it rolls and curves off the line, or it does not. The card in the box lists what each outcome shows.

The second colour marks two bullseyes (a dot inside a ring) at the forward-roll axis, straight out the sides of the ball, and the track ring: the line it rolls on about that axis, up through the thumb hole and between the fingers. Stay behind the ball, fingers lifting straight up the back like a yo-yo, and the bullseyes sit still and the ring rolls along the tape as it rolls away; come round the ball and they swing. If your pro shop measured your PAP, send it and the marks go there instead.

What to send me: your drill sheet in the personalization box, using the template below. Your pro shop has your sheet on file; ask them for it. Fractions are fine.

What ships: one Rev Ball in your two colours with the axis bullseyes and the track ring fitted, a printed fit sheet, a training card, and a roll of bowler's tape. Made to order, one ball a day.

Prefer to see it first? Build your ball in the free FitSlice configurator (link in the listing photos and the shop announcement), export the fit sheet, and paste it into the box.

This is a practice ball for use off the lane, rolled on carpet, never thrown. It is not a bowling ball. FitSlice is not affiliated with any ball manufacturer or bowling governing body.

**Personalization field**

Instruction shown to the buyer (under 256 characters):

Copy the template from the description into this box and fill it in from your drill sheet (fractions fine), or paste your configurator fit sheet. Include hand, thumb yes/no, sizes, spans, pitches, and your two colours.

Template printed in the description:

```
HAND: right
THUMB HOLE: yes (no = two-handed)
THUMB SIZE: 25/32   OVAL (if on sheet): 29/32 at 55 deg
MIDDLE SIZE: 21/32   RING SIZE: 5/8
MIDDLE SPAN: 4 1/8   RING SPAN: 4 5/16
THUMB PITCH: 0 fwd, 1/8 left
MIDDLE PITCH: 3/4 rev, 1/4 left
RING PITCH: 3/4 rev, 1/4 right
THUMB LENGTH to first joint (optional): 70 mm
PAP if measured (optional): 5 1/2 over, 1/2 up
BASE COLOUR: black   SECOND COLOUR: orange
UNITS: inches
NOTES: anything else on your sheet
```

Buyer limit is 1,024 characters. The template uses about 420.

**FAQ**

*Do I need a drill sheet?* Yes. It is your fit, and the shop that drilled your ball has it. If you have never been fitted, start with the Fit Kit and have a pro shop measure your spans and pitches.

*Is it a bowling ball?* No. It is a 200 mm practice ball, rolled on carpet, never thrown.

*What does the bullseye do?* It marks the forward-roll axis, straight out the sides of the ball. Stay behind the ball and lift straight, and the bullseye stands still as the ball rolls away. Come round the ball and the carpet swings the axis in the first foot, so the bullseye swings back; the further it swings, the further round your hand came. If you send your own PAP the bullseye goes there instead, and you read it in a slow-motion clip of the release, because carpet swings a hook release's axis whether the release was right or not.

*What is it made of?* PETG, 4 walls, 8% infill, with the bullseyes and the track ring as printed inlays in the second colour, bores smoothed by hand.

*What if the holes do not fit?* Your sheet is stored with the order. If the ball does not match it, or does not roll true, I reprint it free within 30 days.

---

## 11. Changes the other files need

| File | Section | Change | When |
|---|---|---|---|
| `01-brand-platform.md` | Positioning, rule 8, the league-bowler persona, the lines table, the boilerplate, the FAQ | The ball in the positioning and the persona; the naming decision (Section 8); the ball lines; a ball boilerplate; FAQ entries for the ball | After the naming decision |
| `02-website-copy.md` | Home, product pages, Help, Fit guarantee, Shipping, Emails | Home leads with the ball and the clip; the Rev Ball page from Section 10.1; Puck, Spinner and Pair pages unpublished; guarantee adds "or does not roll true"; shipping page states the ball box and rate; emails say "ball" | Week 5 |
| `03-pro-shop-program.md` | 1, 2, 3, 11 | Program on $129; sell sheet shows the ball; incentive math rerun | Week 7 |
| `04-retailers-and-marketplaces.md` | F, G, C, E | Ball listing from Section 10.2 added as F.3; Shopify CSV row for the ball when Shopify opens; line sheet; Amazon later | Week 6 |
| `05-creators-and-coaches.md` | 1, 4 | Seed unit is a ball from the creator's own sheet; the brief films the roll | Week 9 |
| `06-content-and-launch.md` | 1.3, 3 | Week 3 hero is the roll test; Scripts 1, 3, 5, 8, 10 get ball versions | Week 5 |
| `07-paid-and-funnel.md` | 2, 3, 11 | Revenue model at $129 and one ball a day; the capacity ceiling; no paid spend in the first ninety days | When ads are considered |
| `08-customer-support-and-ops.md` | 1, 5, 6 | Runbook adds supports, sanding, the roll check and the inlays; safety card from Section 10.1; QC log adds roll-true and inlay fit | Week 1 |
| `09-target-list-notes.md` | none | Outreach order unchanged | |
| `shopify_products.csv` | | A `fitslice-rev-ball` row, right and left, 750 g, when Shopify opens | Later |
| `docs/business-plan.md` | 4, 9, C14, 12, 13 | Patent note corrected (done 23 October). Part 5.1 and 5.2 still describe the puck line; the ball's line and economics are in Section 3 of this file until the plan is revised | Done / later |

---

## 12. Inputs needed from the founder

1. The Section 4.1 report on FS-0002: fit, pitch feel, thumb depth, roll, bullseye, pattern, and the print log.
2. `[DECISION — founder: name]` (Section 8).
3. `[DECISION — founder: $129 online and $99 local]` (Section 3).
4. The ten names, and which of them bowl two-handed.
5. The second colour to stock.
6. Whether the Rev Puck and Rev Spinner stay available on request or disappear from the configurator's public page.
7. The state for the LLC, and two insurance quotes, when the first ten have paid.
