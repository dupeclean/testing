# FitSlice: Paid Media, Funnel and the Path to $1M

Working draft, October 2026. Source of truth for every claim in this document is `docs/business-plan.md` (Part 2 how it helps, Part 4 competitors, Part 5 product line and prices, Part 6 claims, Part 8 selling) and `README.md` (parts, drills). Language follows `marketing/01-brand-platform.md`. Shipping and disclosure policy follow `marketing/03-pro-shop-program.md` and `marketing/05-creators-and-coaches.md`. Anything in square brackets is a placeholder that must be filled or removed before use: `[PATENT STATUS]`, `[QUOTE PLACEHOLDER — name]`.

What this file is for: it defines the funnel we measure, states every conversion and cost assumption in one place, shows what $1,000,000 of revenue requires under three product mixes, models the first twelve months, and gives the paid-media plan for a $1,500 a month starter budget with the copy, keywords, audiences, tests, dashboard and decision rules that go with it. Every number that is an assumption says so. Replace assumptions with measured values as they arrive and rerun the tables. The formulas are written out in Sections 1 to 3, so the whole model can be rebuilt in a spreadsheet.

Where paid media sits in the plan: business-plan Part 8 ranks channels by expected return as instruction YouTube, the configurator as content, tournaments, pro shops, then marketplaces. Paid media is not on that list. Its job here is narrow and worth doing: catch the demand that creators, community posts and pro shops create (search and retargeting), run a small measured prospecting test to find out whether a scalable paid channel exists at an acceptable cost, and hand the answer to the decision rules in Section 11. At the starting assumptions paid does not pay back on the first order. Section 1.4 shows why, and Section 4 sizes the cost of finding out at about $204 a month. Paid spend scales only when the rules say so.

### Three rules that apply to every asset below

1. **Claims.** Every ad, page variant and message uses one claim from the green list of business-plan Part 6, or a yellow claim with its exact qualifier. Nothing states or implies a rev-rate, hook, average or injury result, and no number of RPM appears anywhere. The verbs are "designed to", "practice", "train" and "rehearse".
2. **Disclosure.** Every mention of a creator, coach, affiliate, seeded unit or pro shop in an ad, page, video or message carries the matching line below, first, in words a phone screen shows without expanding. The lines are verbatim from `marketing/05-creators-and-coaches.md`.
3. **Gate.** No paid dollar is spent before Study 1 (business-plan Part 7: 30 pucks measured, bore standard deviation under 0.1 mm) has passed. The word "exact" is a claim about the printed part, and Study 1 is what supports it.

| Relationship | Disclosure line |
|---|---|
| Seeded product | "FitSlice sent me this trainer, printed from my own drill sheet, free of charge." |
| Affiliate code | "I earn a commission when you order with my code." |
| Paid post | "Paid partnership with FitSlice." |
| Pro shop | "This shop earns a margin on FitSlice orders entered here." |

---

## 1. The funnel

### 1.1 Stages and definitions

Five stages. Each is an event we can count, with the definition that makes it countable. A stage that is not instrumented exactly as written here is not on the dashboard.

| # | Stage | Definition (counted once per session or person) | Event name |
|---|---|---|---|
| 1 | Visit | A session that lands on any page of the FitSlice site, including a direct link to the configurator | `session_start` |
| 2 | Configurator session | A session in which at least one configurator field is changed from its default (a size, a span, a pitch, hand, units) | `configurator_session` |
| 3 | Fit sheet completed | Thumb, middle and ring hole sizes, both spans and at least one pitch entered; the geometry check passes with no collision warning; the model renders. Also fires on a fit-sheet JSON import that passes the check | `fit_sheet_complete` |
| 4 | Fit Kit | A paid Fit Kit order ($24, credited toward a trainer). The order carries the fit sheet ID | `purchase` with `product_type=fit_kit` |
| 5 | Pair | A paid Pair order ($119), or a Puck and Spinner bought together. Matched to a prior Fit Kit by email or fit sheet ID within 45 days | `purchase` with `product_type=pair` |

Two side paths are counted but kept out of the main funnel rates: a direct Pair order with no Fit Kit first (stage 3 to stage 5), and a Digital order ($29 puck files, $39 pair files) from stage 3. Puck-only ($89) and Spinner-only ($45) orders are counted as orders and tracked in the product mix. For planning they are folded into Pairs (Section 1.3).

Attribution: paid channels get a 45-day click window because the Fit Kit to Pair step takes two to five weeks (print, ship, size, reorder). Creator traffic is attributed by the creator's link or code, and every creator video or post that sends traffic carries its disclosure line: "FitSlice sent me this trainer, printed from my own drill sheet, free of charge." for a seeded unit, and "I earn a commission when you order with my code." for an affiliate. Pro-shop orders are attributed to the shop that entered the sheet and carry the shop line at the counter: "This shop earns a margin on FitSlice orders entered here."

### 1.2 Conversion assumptions

These are planning assumptions. No benchmark exists for a bowling configurator, so each rate is our estimate with the reasoning beside it. Replace each with the trailing-four-week measured value once the stage has at least 200 entries.

| Step | Assumed rate | Why this number |
|---|---|---|
| Visit to configurator session | 30% | The configurator is the main call to action on every page, and the ad promise is "see your grip in 3D". Cold paid traffic will run lower and creator traffic higher |
| Configurator session to fit sheet completed | one third (33.3%) | Business-plan Risk 7: many league bowlers do not have their drill sheet at hand. A third finishing is the middle estimate. The no-sheet path (test 5, Section 9) measures the real number |
| Fit sheet completed to Fit Kit | 15% | A $24 purchase, credited in full, from a person who has just typed in their own fit and watched it render. High intent, low price |
| Fit Kit to Pair (45 days) | 50% | The buyer has paid, sized their holes and holds a $24 credit. Half convert; the other half keep a sizer plate |
| Fit sheet completed to Pair, direct | 3% | Bowlers confident in their sheet who skip the sizer |
| Fit sheet completed to Digital | 3% | Printer owners and international visitors who cannot be shipped to economically. Digital has no capacity limit |

Combined: 30% x one third gives a fit sheet from 10.0% of visits. From each fit sheet, 15% x 50% + 3% gives a Pair for 10.5% of sheets. Visit to Pair is therefore **1.05%**, one Pair per 95 visits. For a $119 made-to-order product that needs a drill sheet, this is a demanding blended figure across warm creator traffic and colder paid traffic. Section 11 says what we do if it is wrong in either direction.

### 1.3 The funnel per 10,000 visits

| Stage | Count | Revenue |
|---|---|---|
| Visits | 10,000 | |
| Configurator sessions | 3,000 | |
| Fit sheets completed | 1,000 | |
| Fit Kits sold | 150 | $1,800 from the 75 that stop at the sizer. The other 75 convert to a Pair within 45 days, and their $24 is credited, so it sits inside the Pair revenue |
| Pairs from Fit Kits | 75 | |
| Pairs direct | 30 | |
| **Pairs total** | **105** | **$12,495** |
| Digital files | 30 | $1,050 at a $35 blend (60% pair files at $39, 40% puck files at $29) |
| **Revenue per 10,000 visits** | | **$15,345, or $1.53 per visit** |
| Cost of goods (Pairs at $45, Fit Kits at $9, Digital at $1.50) | | $6,120 |
| **Gross profit per 10,000 visits** | | **$9,225, or $0.92 per visit (60%)** |

Two simplifications, both conservative in the same direction. All printed trainer orders are modeled as Pairs at $119, and retained Fit Kit revenue is shown on its own line so the $1M tables in Section 2 can be read on Pairs alone. In practice some orders will be Puck-only at $89 or Spinner-only at $45 and will land below $119. The retained Fit Kit revenue, about 14% on top of Pair revenue, absorbs that. Revisit the mix after the first 100 orders.

### 1.4 What the funnel says about paid media before a dollar is spent

**Cost of a Pair.** Pairs ship free (the policy in `marketing/03-pro-shop-program.md` and `marketing/05-creators-and-coaches.md`), so domestic shipping sits inside the cost.

| Item | Cost | Basis |
|---|---|---|
| Filament, 395 g PETG | $9.88 | Puck 297 g plus Spinner 98 g at $25 a kilo (business-plan Part 5.2) |
| Machine time | $3.30 | Puck $2.50 (business-plan Part 5.2) plus about $0.80 for the Spinner's 3 h 38 m, on the same electricity and depreciation basis |
| Labor | $8.50 | Start, remove, deburr, pack two parts at $20 an hour |
| Packaging, cord, fitting card | $3.50 | Box, paracord, tape, card |
| Payment fees | $3.82 | 3% + $0.25 on $119 |
| Domestic shipping | $10.00 | A 600 to 900 g box; the business plan's range is $8 to $12 |
| **Itemized** | **$39.00** | |
| Allowance for failed prints, reprints under the fit guarantee, breakage | $6.00 | About 15% of the itemized cost |
| **Landed cost used in every table** | **$45** | |

Gross profit per Pair is $119 less $45, **$74** (62%). That is the most a Pair can cost to acquire before the first order loses money. Counting everything a visit brings, including Fit Kits that never convert and Digital orders, gross profit per visit is **$0.92**.

**What it means for paid.**

- At $1.07 per paid visit and 1.05% visit-to-Pair, a paid Pair costs **$102**. That is above the $74 ceiling. A paid visit costs $1.07 and returns $0.92 of gross profit, so each paid dollar returns $0.86 on first orders.
- For the **$74 ceiling**, cost per visit must be $0.78 or less, or visit-to-Pair must reach 1.44% at $1.07 per visit.
- For a **$50 target** (leaving $24 per Pair for overhead and profit), cost per visit must be $0.52 or less, or visit-to-Pair must reach 2.14% at $1.07 per visit.
- Cost per fit sheet is the early proxy, readable in week 2. A Pair needs 9.52 fit sheets, so the $74 ceiling is $7.77 per sheet, the $50 target is $5.25, and the model's own $1.07 per visit gives $10.68.
- The stop line in Section 11 is $110 per Pair ($11.55 per sheet). It sits just above the model's own $102, so ordinary variance does not end the test. A result worse than that means the assumptions in this document are wrong.

The funnel is an average across all traffic. Search and retargeting reach people who already know the product and should convert above it. Cold prospecting should convert below it. That is why the starter budget leans toward intent and keeps prospecting to a measured test (Section 4). It is also why Fit Kit to Pair conversion and the no-sheet path decide whether paid ever scales.

---

## 2. The path to $1M

Revenue here means what FitSlice books. Pro-shop orders count at the net $89.25 FitSlice keeps after the shop's 25% on a $119 Pair. Digital counts at the $35 blend. Capacity uses the plan's figure of one puck per printer per day, 25 to 30 a month. A Pair uses one printer-day on the CoreXY profile (puck 11 h 20 m plus spinner 3 h 38 m is about 15 hours, with the balance of the day for removal, deburring and the next start). On a conventional bed-slinger a Pair takes 25 h 45 m, about 1.1 printer-days, so count a tenth more printers there. A Fit Kit sizer plate takes 3 h 24 m, counted as a quarter of a printer-day. Printer ranges below run from 30 a month (best case) to 25 a month (the planning figure, which already allows for failed prints and maintenance).

### 2.1 Three mixes

| | Mix A: Pairs only | Mix B: Pairs + Digital | Mix C: Pairs + Digital + pro shops |
|---|---|---|---|
| Web Pairs at $119 | 8,404 ($1,000,076) | 7,752 ($922,488) | 6,300 ($749,700) |
| Pro-shop Pairs at $89.25 net of the shop's 25% | 0 | 0 | 2,100 ($187,425), 25% of Pairs printed |
| Digital files at the $35 blend | 0 | 2,215 ($77,525) | 1,800 ($63,000) |
| **Revenue** | **$1,000,076** | **$1,000,013** | **$1,000,125** |
| **Pairs to print** | **8,404** | **7,752** | **8,400** |
| **Site visits required** at 1.05% visit-to-Pair (web Pairs only) | **800,000** | **738,000** | **600,000** |
| Fit Kits sold along the way | 12,006 | 11,074 | 9,000 |
| Fit Kit revenue kept by buyers who stop at the sizer (not counted toward the $1M) | $144,069 | $132,891 | $108,000 |
| Printer-days to make everything (Pairs at 1, Fit Kits at 0.25) | 11,405 | 10,521 | 10,650 |
| **In 12 months**: printers needed | **32 to 39** | **30 to 36** | **30 to 36** |
| In 24 months: printers needed | 16 to 20 | 15 to 18 | 15 to 18 |
| In 36 months: printers needed | 11 to 13 | 10 to 12 | 10 to 12 |
| Web visits a month over 12 / 24 / 36 months | 66,698 / 33,349 / 22,233 | 61,524 / 30,762 / 20,508 | 50,000 / 25,000 / 16,667 |
| Pairs printed a month over 12 / 24 / 36 months | 700 / 350 / 233 | 646 / 323 / 215 | 700 / 350 / 233 |
| Active pro shops needed over 12 months, at 3 / 2 Pairs per shop per month | 0 | 0 | 59 / 88 |
| Cost to buy all the visits at $1.07 | $854,896 | $788,571 | $640,867 |

The printer rows are for an average month. Volume that grows into $1M ends the period above its average, so plan the last quarter's capacity at 1.5 times the figure shown.

### 2.2 What the table says

1. **$1M in twelve months needs 30 to 39 printers.** The plan is written for a one-to-three printer launch, so a twelve-month path to $1M depends on a print partner. Twenty-four months needs 15 to 20 printers and a part-time operator. Thirty-six months needs 10 to 13, which matches the business plan's own sizing: about 0.8% of the 1,075,194 certified league members counted in business-plan Part 3 buying one Pair each, against the plan's 1%-over-three-years case of about 10,700 units.
2. **Digital cuts traffic and printing by 8%.** Its larger value is that it needs no printer and almost no cost of goods, and international visitors can buy it. If Digital runs above 3% of fit sheets, lean into it: it is the one line that grows without a machine.
3. **Pro shops replace ad spend, and they pay better than paid traffic.** Mix C needs 200,000 fewer visits than Mix A (25% less) and prints the same number of Pairs. A shop Pair nets $89.25 and leaves $44.25 of gross profit before any acquisition cost. A direct Pair bought with paid traffic at the $50 target leaves $24, and at the $110 stop line it leaves -$36. The shop also brings the drill sheet, which is the scarce input. Mix C needs 59 active shops at 3 Pairs a month or 88 at 2, a three-year relationship-building number. The year-one model in Section 3 reaches 22.
4. **Traffic is the other wall.** 600,000 to 800,000 visits over twelve months is 50,000 to 66,698 a month, and over thirty-six months 16,667 to 22,233 a month. Year one in Section 3 averages 6,729 a month. Buying all of Mix A's visits at $1.07 would cost $855,000, which is more than the gross profit the $1M produces. Most of the traffic has to come from creators, community, search demand and shops, the plan's first four channels. Paid fills the gap only where Section 11 allows.

### 2.3 When to add printers, and when to add a print partner

A CoreXY printer costs about $600 and pays for itself within its first month of sold output (business-plan Part 5.2). The rule is therefore to add printers early and keep a print partner for overflow. At 25 Pairs a month, installed weekly capacity is 5.8 Pairs per printer, and the 80% line is 20 Pairs a month, or 4.6 a week, per printer.

| Trigger | Action |
|---|---|
| Printer-days used in the trailing four weeks above 80% of installed capacity | Order a printer. Lead time is days. The twelve-month model buys at this line: 3 printers at launch, 5 in January, 6 in February, 9 in September, 11 in October |
| Open orders at or above 1.5 weeks of installed weekly capacity | Order a printer and show the current ship date at checkout |
| A single week of orders above 2 times installed weekly capacity (a creator video, a tournament) | Do not buy for a spike. Send the overflow to the print partner and show the ship date before the customer pays |
| Backlog above 3 weeks for two consecutive weeks | Printer order and partner overflow, both, the same day |
| In-house labor above 80 hours a month (at 15 minutes a part that is 320 parts, or 160 Pairs, on 6 to 7 printers) | Hire a part-time operator or move a standing share of volume to the partner. The founder's time goes to sheets, shops and creators |
| A forecastable seasonal peak (league season starts in September; summer is quiet) | Pre-build Fit Kits and Spinners in July and August; they hold. Pucks are made to order and are never pre-built |
| Utilization below 50% for eight weeks | Buy nothing. Put the idle printers on Fit Kits and shop counter kits |

Print-partner facts and constraints:

- Institutional and commercial print pricing runs $0.07 to $0.10 per gram, which puts a 300 g puck at $21 to $30 before margin, roughly our in-house landed cost (business-plan Part 5.2 and X4). The partner takes overflow and does not carry the base load.
- Get three quotes before launch (the plan's Part 12 names Craftcloud, JLC3DP and Xometry as candidates) and run the same 30-part bore measurement on partner output that Study 1 runs on our own printers. The fit guarantee rests on the printer that made the part.
- The Fit Kit promise is that the sizer is printed on the same printer and material as the order. An outsourced Pair therefore needs its Fit Kit printed on the same partner line, or the partner's bore offset must be calibrated and applied in the configurator's print allowance. Decide this before the first outsourced order ships.

---

## 3. Twelve-month revenue model

### 3.1 Assumptions

- **Calendar.** Month 1 is November 2026: seeding (20 trainers to coaches and creators, each shipped with the disclosure terms in `marketing/05-creators-and-coaches.md`, so every recipient who shows the unit says "FitSlice sent me this trainer, printed from my own drill sheet, free of charge."), Study 1, waitlist and configurator live, shop closed. The shop opens in Month 2, December 2026, in line with the launch sequence in business-plan Part 8 and the calendar in `marketing/06-content-and-launch.md`, where launch week 1 is configurator-only and the shop opens in week 2. December orders are therefore modeled at three-quarters of a month. Month 12 is October 2027.
- **Funnel rates** as in Section 1.2. Every count is rounded to a whole unit at each step so the tables reconcile by hand. Fit Kits bought in one month convert to Pairs at 50% in the following month.
- **Seasonality** multiplies the visit-to-sheet rate: 0.85 in May, 0.70 in June and July, 0.90 in August, 1.10 in September and October, 1.00 otherwise. League season runs roughly September to April and summer demand is unknown (business-plan Part 12), so this is a cautious guess.
- **Paid traffic.** $1,500 a month in Months 2 to 12 at $1.07 per visit, which buys 1,404 visits a month (Section 4 builds this from four lines). The base case holds the budget flat. Section 11 sets the rules for stepping up, and Section 3.5 shows what each step is worth.
- **Creator and community traffic.** The first two creator videos go live in Months 2 and 3 (4,000 and 5,000 visits), with a tail of 1,500 to 2,500 a month and a new wave at season start (3,000 in August, 4,000 in September and October). Every creator video, post and clip carries the matching disclosure line.
- **Organic** (search, community posts, word of mouth, returning visitors) grows from 800 a month to 5,000 by Month 12. April includes an earned-media bump from the pilot-results post in plan Month 6, whatever the result says.
- **Pro shops.** First shop in Month 3, 22 active by Month 12, two Pairs per active shop per month at $89.25 net. New shops produce less than mature ones, and two is an average. Each new shop gets a counter kit (a sizer plate and 25 cards) at $14 and a quarter printer-day.
- **Digital.** 3% of fit sheets at a $35 blend.
- **Costs.** Pair $45 landed (Section 1.4). Fit Kit $9 landed: $2.42 filament, $0.75 machine, $3.00 labor, $2.00 tape, card and mailer, $0.97 payment fees. Fit Kit shipping is a flat rate shown at checkout and treated as pass-through. Digital $1.50 in payment fees and delivery.
- **Printers.** Three bought in Month 1 at $600 each. After that the model buys printers whenever printer-days exceed 80% of installed capacity at 25 Pairs per printer per month.
- **One-off launch costs, all in Month 1:** three printers $1,800, 20 seeded Pairs $1,000 (`marketing/05-creators-and-coaches.md` costs a box at about $50, and every recipient agrees to the seeded-unit disclosure line), and Study 1 $500. Together $3,300. Study 1 uses 30 printer-days and the seeded Pairs 20, so Month 1 shows 50 printer-days.
- **Contribution** is gross profit less paid media, printer purchases and the one-off launch costs. It excludes founder time beyond the $8.50 of labor in the cost stack, hosting and software, insurance, legal and counsel review, pilot studies 2 and 3 ($450 and $1,500 to $3,000), and tournament booths.
- **Not modeled:** Puck-only and Spinner-only orders, marketplace listings, tournament booth sales, revenue from reprints on new sheets, international shipping, any price change after the pilot.

### 3.2 Traffic and units

| Month | Paid $ | Paid visits | Creator and community | Organic | Total visits | Fit sheets | Fit Kits | Pairs direct | Pairs from kits | Web Pairs | Digital | Active shops | Pro-shop Pairs |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Nov 26 | 0 | 0 | 0 | 800 | 800 | 80 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Dec 26 | 1,500 | 1,404 | 4,000 | 1,000 | 6,404 | 640 | 72 | 14 | 0 | 14 | 14 | 0 | 0 |
| Jan 27 | 1,500 | 1,404 | 5,000 | 1,500 | 7,904 | 790 | 119 | 24 | 36 | 60 | 24 | 1 | 2 |
| Feb 27 | 1,500 | 1,404 | 2,500 | 2,000 | 5,904 | 590 | 89 | 18 | 60 | 78 | 18 | 2 | 4 |
| Mar 27 | 1,500 | 1,404 | 2,500 | 2,500 | 6,404 | 640 | 96 | 19 | 45 | 64 | 19 | 4 | 8 |
| Apr 27 | 1,500 | 1,404 | 2,500 | 4,000 | 7,904 | 790 | 119 | 24 | 48 | 72 | 24 | 6 | 12 |
| May 27 | 1,500 | 1,404 | 2,000 | 3,000 | 6,404 | 544 | 82 | 16 | 60 | 76 | 16 | 8 | 16 |
| Jun 27 | 1,500 | 1,404 | 1,500 | 2,500 | 5,404 | 378 | 57 | 11 | 41 | 52 | 11 | 10 | 20 |
| Jul 27 | 1,500 | 1,404 | 1,500 | 2,500 | 5,404 | 378 | 57 | 11 | 29 | 40 | 11 | 12 | 24 |
| Aug 27 | 1,500 | 1,404 | 3,000 | 3,500 | 7,904 | 711 | 107 | 21 | 29 | 50 | 21 | 15 | 30 |
| Sep 27 | 1,500 | 1,404 | 4,000 | 4,500 | 9,904 | 1,089 | 163 | 33 | 54 | 87 | 33 | 18 | 36 |
| Oct 27 | 1,500 | 1,404 | 4,000 | 5,000 | 10,404 | 1,144 | 172 | 34 | 82 | 116 | 34 | 22 | 44 |
| **Year 1** | **16,500** | **15,444** | **32,500** | **32,800** | **80,744** | **7,774** | **1,133** | **225** | **484** | **709** | **225** | | **196** |

### 3.3 Revenue, margin and capacity

Revenue = $24 x Fit Kits + $95 x Pairs from kits + $119 x Pairs direct + $35 x Digital + $89.25 x pro-shop Pairs. A Pair from a kit books $95 in the month it converts because the $24 was booked when the kit sold. Cost of goods = $45 x (web and pro-shop Pairs) + $9 x Fit Kits + $1.50 x Digital + $14 x new shops. Printer-days = Pairs + 0.25 x (Fit Kits + new shops).

| Month | Revenue | Cumulative | Cost of goods | Gross profit | Printer-days | Printers | Utilization | Printer spend | Paid $ | One-off launch costs | Contribution |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Nov 26 | $0 | $0 | $0 | $0 | 50 | 3 | 67% | $0 | $0 | $3,300 | -$3,300 |
| Dec 26 | $3,884 | $3,884 | $1,299 | $2,585 | 32 | 3 | 43% | $0 | $1,500 | $0 | $1,085 |
| Jan 27 | $10,150 | $14,034 | $3,911 | $6,240 | 92 | 5 | 74% | $1,200 | $1,500 | $0 | $3,540 |
| Feb 27 | $10,965 | $25,000 | $4,532 | $6,433 | 104 | 6 | 70% | $600 | $1,500 | $0 | $4,333 |
| Mar 27 | $10,219 | $35,218 | $4,160 | $6,058 | 96 | 6 | 64% | $0 | $1,500 | $0 | $4,558 |
| Apr 27 | $12,183 | $47,402 | $4,915 | $7,268 | 114 | 6 | 76% | $0 | $1,500 | $0 | $5,768 |
| May 27 | $11,560 | $58,962 | $4,930 | $6,630 | 113 | 6 | 75% | $0 | $1,500 | $0 | $5,130 |
| Jun 27 | $8,742 | $67,704 | $3,798 | $4,944 | 87 | 6 | 58% | $0 | $1,500 | $0 | $3,444 |
| Jul 27 | $7,959 | $75,662 | $3,438 | $4,522 | 79 | 6 | 52% | $0 | $1,500 | $0 | $3,022 |
| Aug 27 | $11,234 | $86,897 | $4,636 | $6,598 | 108 | 6 | 72% | $0 | $1,500 | $0 | $5,098 |
| Sep 27 | $17,337 | $104,234 | $7,094 | $10,244 | 164 | 9 | 73% | $1,800 | $1,500 | $0 | $6,944 |
| Oct 27 | $21,081 | $125,315 | $8,855 | $12,226 | 204 | 11 | 74% | $1,200 | $1,500 | $0 | $9,526 |
| **Year 1** | **$125,315** | | **$51,568** | **$73,748 (59%)** | **1,244** | | | **$4,800** | **$16,500** | **$3,300** | **$49,148** |

### 3.4 Reading the model

- Year one is **$125,315 of revenue and 905 Pairs printed** (709 web and 196 pro-shop), 225 Digital orders, 11 printers by October, and a positive contribution of $49,148 after ads, printers and the launch costs. That is the "profitable one-to-three-printer operation first" the business plan asks for, grown to 11 by the capacity rule.
- October brings in $21,081, a run rate of $252,972 a year. $1M in a single year needs $83,333 a month, 4.0 times October's revenue.
- The blended year-one rate of web Pairs per visit is **0.88%**, below the 1.05% design rate, because of the Fit Kit lag, the launch month and the summer multiplier. Do not judge the funnel against 1.05% before Month 4.
- Paid is 19% of visits and $16,500 of spend. Against no paid at all, it brings in $20,582 of revenue and $12,395 of gross profit, a net of -$4,105 on first orders inside the year. The steady-state gap is smaller (Section 4) because December runs at three-quarters of a month and Fit Kits bought late in the year convert after it ends: October's 172 kits are worth about 86 Pairs and $8,170 in November, none of it counted above. A small first-order loss on a capped test is the price of learning whether search, retargeting and prospecting can reach the lines in Section 11.
- The capacity line is the thing to watch each Monday. Utilization stays at or under 76% from February because the model buys printers as soon as the 80% rule fires. If orders arrive faster than the model, the partner absorbs the spike.
- Month 1 and Month 2 show the cost of getting ready: Month 1 carries $3,300 of launch costs, and December's orders cover about three-quarters of a month.

### 3.5 Scenarios

Each row changes one thing against the base case.

| Scenario | Year-1 revenue | Pairs printed | Printers in Oct | Paid spend | Contribution after ads, printers and launch costs |
|---|---|---|---|---|---|
| No paid ads (creators, community, organic and pro shops only) | $104,733 | 767 | 10 | $0 | $53,852 |
| Base case: $1,500 a month at $1.07 per visit | $125,315 | 905 | 11 | $16,500 | $49,148 |
| Paid at the double-down line: $1,500 a month at $0.52 per visit (cost per Pair $50) | $146,110 | 1,042 | 12 | $16,500 | $61,168 |
| Paid doubled to $3,000 a month, same rates | $145,908 | 1,041 | 12 | $33,000 | $44,530 |
| Visit-to-sheet rate 30% lower, all traffic | $92,919 | 692 | 8 | $16,500 | $31,315 |
| Visit-to-sheet rate 30% higher, all traffic | $157,578 | 1,116 | 13 | $16,500 | $67,578 |
| No pro-shop orders | $107,822 | 709 | 8 | $16,500 | $42,582 |

- **Cost per visit matters more than spend.** The same $1,500 at the double-down line ($50 per Pair) buys twice the traffic and brings year-one revenue to $146,110, against the base case's $125,315. Doubling spend at the base-case rates raises revenue and lowers contribution (fourth row), because each paid dollar returns only $0.86 of first-order gross profit. Scaling waits for the rules.
- **The funnel is the biggest lever.** A 30% shortfall in visit-to-sheet rate cuts revenue to $92,919 and still leaves a positive contribution. A 30% beat lifts it to $157,578.
- **Pro shops carry real weight.** Without them revenue falls by about $17,500 and contribution by about $6,600, and the model needs three fewer printers. The shop line is the cheapest growth in the plan.
- **The no-paid row is the benchmark.** If paid never reaches the double-down line, the plan still works on creators, community and shops, and the test has cost a few thousand dollars.

### 3.6 From October's run rate to $1M

If revenue keeps growing from October 2027's $21,081 at a steady monthly rate (smoothed, with no seasonality), cumulative revenue reaches $1M as follows.

| Monthly revenue growth after October 2027 | Months after October to reach $1M of cumulative revenue | Calendar | Monthly revenue in that last month |
|---|---|---|---|
| 0% a month | 42 | Apr 2031 | $21,081 |
| 3% a month | 27 | Jan 2030 | $46,827 |
| 5% a month | 23 | Sep 2029 | $64,751 |
| 8% a month | 19 | May 2029 | $90,979 |

At a flat October run rate, $1M of cumulative revenue arrives in month 54 of operation. At 5% growth a month it arrives in about two years after October 2027, which matches the thirty-six-month rows in Section 2.

---

## 4. Starter budget: $1,500 a month

Months 2 to 12. The split favors intent. Each line has a job, an assumed cost, the visits it buys, and the number that decides whether it keeps its budget.

| Line | Monthly | Job | Assumed cost | Expected monthly visits | Keeps its budget if |
|---|---|---|---|---|---|
| Google Search | $350 | Catch people who heard about it from a creator, a shop or a friend and typed it in, plus fit and category searches | $1.15 per click | 304 | Cost per fit sheet at or under $9.00 by week 8 and at or under $7.75 by week 16 |
| YouTube | $400 | Show the 15-second thumb-pop clip to people watching bowling instruction; build the video-viewer audience for retargeting | $0.04 per view, 2% of views click through, so $2.00 per visit | 200 | 15-second view rate at or above 30%, and a viewer audience of 5,000 by week 8 |
| Meta prospecting | $450 | The scalable-channel test: feed and Reels, interests first, lookalike once it exists | $0.90 per click | 500 | Cost per fit sheet at or under $11.50 by week 8 and at or under $7.75 by week 16 |
| Retargeting | $300 | Bring back configurator abandoners, completed sheets without an order, and Fit Kit buyers without a Pair | $0.75 per click | 400 | Cost per order of any product at or under $30 |
| **Total** | **$1,500** | | **$1.07 blended per visit** | **1,404** | |

At these costs the budget buys about 1,404 visits, 140 fit sheets and 15 Pairs a month at the funnel average. Gross profit on those orders is about $1,296 against $1,500 of spend, a first-order gap of $204 a month. Search and retargeting should convert above the average and prospecting below it, so the blend holds.

Rules for the budget as a whole:

- Spend is capped daily, so one bad placement cannot take a week's money in a night.
- Retargeting is funded first every month because it is where the funnel's lag is recovered. No budget moves from retargeting to prospecting.
- Creative is the ten-second explanation and the thumb-pop clip until testing says otherwise. One claim per ad, from the green or yellow list.
- The first two weeks are a measurement period. Nothing is paused or scaled before an ad set has 300 clicks or $75 of spend, whichever comes first.
- The account does not bid on any ball maker's name and does not build an audience from one.
- Scaling to $3,000 and $5,000 follows Section 11, never the calendar.

---

## 5. Audiences

Platform interest categories are targeting inputs. They never appear in copy.

| Audience | Definition | Used for | Notes |
|---|---|---|---|
| A1. Bowling interest, prospecting | United States and Canada; age 25 to 65+; platform interest categories for bowling, ten-pin bowling, bowling equipment and league bowling as the platform lists them. Exclude purchasers and existing fit-sheet completers | Meta prospecting, YouTube in-feed | Broad by design. The configurator and the fit-sheet step qualify the traffic, so the ad does not have to |
| A2. Lookalike of fit-sheet completers | 1% lookalike seeded from the `fit_sheet_complete` audience once it has 1,000 people; before that, seeded from all site visitors once that reaches 1,000 | Meta prospecting; replaces A1 as it proves out | Sheet completers are the people who have a drill sheet, which is the trait we want to find more of |
| A3. Bowling instruction viewers | YouTube custom segments built from the Group 1 and Group 2 keywords in Section 6, plus placement targeting on bowling instruction channels. Any channel that holds a FitSlice unit, code or sponsorship is excluded from placement targeting | YouTube in-stream | Use the 15-second clip. Skippable; we pay for the watch |
| A4. Configurator abandoners | Fired `configurator_session`, no `fit_sheet_complete`, last 7 days | Retargeting | Message: "Your grip is one drill sheet away. Don't have it? Your pro shop does." |
| A5. Sheet completed, no order | Fired `fit_sheet_complete`, no `purchase`, last 30 days | Retargeting | Day 1: the Fit Kit at $24, credited. Day 14: the 30-day fit guarantee |
| A6. Fit Kit, no Pair | `purchase` with `product_type=fit_kit`, no Pair, days 10 to 45 | Retargeting, plus email | Message: "Your $24 credit is waiting. Your sheet is on file." |
| A7. Video viewers | Watched 50% or more of the thumb-pop clip, last 30 days | Retargeting into the configurator | A cheap pool; the clip does the explaining |
| A8. Purchasers | Any `purchase` | Excluded from all prospecting and retargeting | A reorder message at six months is out of scope here |

One-handed or two-handed style cannot be targeted, and none is attempted. Copy says "for one-handed, thumb-in bowlers" and lets two-handed bowlers self-select to the Spinner. Minimum age is 18 on every platform. The product card says not for children under 12 without supervision, and no ad is aimed at minors.

---

## 6. Keywords

Thirty terms in four intent groups. A keyword is something a person typed and carries no claim from us. The ad shown on "bowling rev rate drills" describes what the trainer is and what it practices, and promises no revs. Keyword insertion is off in every ad, so a typed term such as term 15 is never repeated back as a description of the product. Phrase and exact match only.

### 6.1 Group 1: mechanics and problem intent (10)

Phrase match at a low bid. The same terms seed the YouTube custom segment (A3).

| # | Term | Match |
|---|---|---|
| 1 | bowling release drills | phrase |
| 2 | bowling thumb exit drill | phrase |
| 3 | bowling thumb release timing | phrase |
| 4 | bowling fingertip grip practice | phrase |
| 5 | relaxed hand bowling release | phrase |
| 6 | bowling finger lift drill | phrase |
| 7 | bowling rev rate drills | phrase |
| 8 | one handed bowling release tips | phrase |
| 9 | bowling grip pressure squeezing | phrase |
| 10 | bowling practice at home | phrase |

Ad job: the ten-second explanation, then "Enter your drill sheet". Landing page: the configurator with the drills section one scroll down.

### 6.2 Group 2: product and category intent (10)

Exact and phrase match, highest bids in the account.

| # | Term | Match |
|---|---|---|
| 11 | bowling release trainer | exact |
| 12 | bowling rev trainer | exact |
| 13 | bowling grip trainer | exact |
| 14 | bowling training aid | phrase |
| 15 | bowling practice ball with holes | phrase |
| 16 | bowling finger lift trainer | phrase |
| 17 | bowling wrist and finger trainer | phrase |
| 18 | bowling training equipment for home | phrase |
| 19 | bowling thumb release aid | phrase |
| 20 | bowling release practice tool | phrase |

Ad job: the category comparison from the green list ("Unlike generic one-size trainers and S/M/L wrist braces, it is built from your fit"), the price, the Fit Kit. Landing page: product page with the configurator embedded.

### 6.3 Group 3: fit intent (7)

Phrase match. These people already care about the thing we copy.

| # | Term | Match |
|---|---|---|
| 21 | bowling ball drill sheet | phrase |
| 22 | bowling thumb hole size chart | phrase |
| 23 | bowling ball span measurement | phrase |
| 24 | bowling ball pitch explained | phrase |
| 25 | bowling thumb tape 64th | phrase |
| 26 | bowling fingertip grip fit | phrase |
| 27 | custom fit bowling grip | phrase |

Ad job: "Your drill sheet, off the ball." and the 1/64" fact. Landing page: the configurator, with the fit-sheet import visible.

### 6.4 Group 4: brand and maker intent (3)

Brand terms are cheap and defend the name. Maker terms sell Digital.

| # | Term | Match |
|---|---|---|
| 28 | FitSlice | exact |
| 29 | 3D printed bowling trainer | phrase |
| 30 | bowling trainer STL | phrase |

Ad job for 29 and 30: Digital files at $29 and $39, generated from your sheet, with the print notes (Section 7.2, Digital ad group). Landing page: the Digital product page.

### 6.5 Negative keywords

Applied account-wide on Search and reviewed weekly from the search-terms report.

- **Other equipment shopping:** ball for sale, bowling ball prices, bowling ball reviews, bowling ball cleaner, bowling shoes, bowling bag, bowling ball drill bits, drill press, how to drill a bowling ball, bowling ball drilling near me, used bowling ball
- **A different product:** wrist brace, wrist support, wrist guard (revisit after week 8; these searchers are adjacent and may deserve a dedicated ad set built on the green comparison "unlike generic one-size trainers and S/M/L wrist braces, it is built from your fit")
- **A different sport or style:** two handed, cricket bowling, lawn bowling, candlepin, duckpin, five pin
- **Spectating and venues:** tv schedule, tour schedule, tournament results, scores, rules, bowling alley near me, bowling league near me, bowling jobs, bowling party
- **Games and novelties:** wii bowling, video game, bowling pin, bowling costume
- **Pain and medical searches:** stuck, swollen, pain, injury, blister, numb, surgery, bowler's thumb. We make no injury claim, so we do not show ads against these
- **Free-file seekers (Group 4 only):** free stl, thingiverse, free download, free 3d model
- **Every ball manufacturer's name and model line.** The list lives in the ad account and is kept current by the person who runs it. We do not bid on those names either

---

## 7. Ad copy

Every ad is one claim from the green or yellow list in business-plan Part 6, the ten-second explanation or one of its parts, and one call to action. No ad names a rev rate, a hook, an average, an injury, a governing body, a ball company or a patent. Ads carry the brand name only. Where a later version might mention patent status, the slot reads `[PATENT STATUS]` and stays out of every live ad. An ad that uses a coach's words runs only after the coach has said them, and carries the coach's disclosure line. The ten-second line contains the word "exact" (Meta variant 1, description D1, YouTube cut 2 and its companion text), so those assets run only after Study 1 has passed.

All character counts below were measured. Platform limits change, so check them in the ad interface before upload.

### 7.1 Meta: five variants

Headline under 40 characters. The first sentence of the primary text sits under 125 characters so it reads before the fold. Creative: variants 1 and 5 on the thumb-pop clip, 2 and 4 on the configurator screen recording, 3 on a still of the puck in a hand with the drill sheet beside it.

| # | Headline | Chars | Primary text | First sentence chars | Button | Claim used (business-plan Part 6) |
|---|---|---|---|---|---|---|
| 1 | Your drill sheet, off the ball. | 31 | It's the part of your ball your hand touches, printed with your exact holes, so you can practice your release anywhere. Enter your drill sheet and see your grip in 3D. Free. | 119 | Learn more | The ten-second explanation; the free configurator |
| 2 | Same holes. Same pitch. No lane fee. | 36 | Your pro-shop drill sheet, built as a part you can hold. Hole sizes in 1/64" steps, both spans, every pitch, right or left hand, on a regulation 8.5-inch ball surface. About 300 g at 20% infill, so it fits in a bag. Practice fingertip holds and a clean thumb exit at your desk. | 56 | Learn more | Green: built from your drill sheet; weight with infill. Yellow: practice a clean thumb exit |
| 3 | Train the hand that bowls. | 26 | Coaches agree the thumb must leave first, and a relaxed hand creates more revs. FitSlice gives you your own grip to practice both, away from the lane. Built from your drill sheet. Start with the $24 Fit Kit, credited toward your trainer. | 79 | Shop now | Green: attributed coaching consensus |
| 4 | Fit you can practice. | 21 | Unlike generic one-size trainers and S/M/L wrist braces, FitSlice is built from your fit. Type in your drill sheet and the configurator rebuilds your grip in about a tenth of a second. Free to try. | 89 | Learn more | Green: category comparison |
| 5 | Relax the thumb. Let the fingers work. | 38 | Thumb pops, fingertip carries and carpet spins you can count. Six drills in your own hole geometry. Short daily sessions help keep the feel between league nights. Made to order, with a 30-day fit guarantee. | 61 | Shop now | Yellow: short daily sessions help keep the feel |

Held variant, not to run until filled: headline "Train the hand that bowls." with primary text beginning with the coach's disclosure line as its first sentence ("FitSlice sent me this trainer, printed from my own drill sheet, free of charge." and, if the coach holds a code, "I earn a commission when you order with my code."), followed by `[QUOTE PLACEHOLDER — name]`. When the ad runs from the coach's handle, "Paid partnership with FitSlice." is set on the post itself.

### 7.2 Google Search: responsive search ads

Headlines are at or under 30 characters and descriptions at or under 90. A responsive search ad takes up to 15 headlines and 4 descriptions, so the five variants load as two ads per ad group. Pin G1 to position 1 in the Group 3 and brand-term ad groups and let the system rotate elsewhere.

| Pair | Headline (30 or fewer) | Chars | Description (90 or fewer) | Chars | Claim used |
|---|---|---|---|---|---|
| G1 / D1 | Your Drill Sheet, Off the Ball | 30 | The part of your ball your hand touches, printed with your exact holes. Practice anywhere. | 90 | The primary line and the ten-second explanation |
| G2 / D2 | Custom-Fit Release Trainer | 26 | Built from your drill sheet: 1/64" hole steps, both spans, every pitch. Free 3D preview. | 88 | Green: built from your drill sheet |
| G3 / D3 | Practice Your Thumb Exit | 24 | About 300 g at 20% infill, built to your sheet. Practice thumb pops and fingertip holds. | 88 | Yellow: practice a clean thumb exit. Green: weight with infill |
| G4 / D4 | Same Holes. Same Pitch. | 23 | Holes aimed at the ball's center, like a zero-pitch drilling. Your grip, off the lane. | 86 | Green: holes aimed at the ball's center |
| G5 / D5 | Start With the $24 Fit Kit | 26 | Find your hole sizes on the printer that makes your part. Credited to your trainer. | 83 | Product fact: the Fit Kit and its credit |
| R1 (rotation) | Built From Your Drill Sheet | 27 | | | |
| R2 (rotation) | Train the Hand That Bowls | 25 | | | |
| R3 (rotation) | Free 3D Preview of Your Grip | 28 | | | |
| R4 (rotation) | Fit You Can Practice | 20 | | | |
| R5 (rotation) | Made to Order in PETG | 21 | | | |
| D6 (extra) | | | Enter your drill sheet and see your grip rebuilt in 3D in about a tenth of a second. Free. | 90 | Product fact: configurator speed |
| D7 (extra) | | | To our knowledge, the first trainer that uses your actual drill sheet. Made to order. | 85 | Yellow: "to our knowledge" |

- **Ad 1 (Groups 1 and 2):** headlines G1 to G5 plus rotation headlines R1 to R5; descriptions D1 to D4.
- **Ad 2 (Group 3 and the brand term, term 28):** headlines G1, G2, G4, G5 plus R1, R3, R4; descriptions D5, D6, D7 and D2.
- **Digital ad group (terms 29 and 30)** runs its own ad, below.

Sitelinks: Configurator; Fit Kit $24; Rev Puck $89; The six drills. Callouts (25 characters or fewer): Made to order; Right or left hand; 1/64" steps; Digital files available. A fifth callout slot reads `[PATENT STATUS]` and stays empty in every live account. Structured snippet, Types: Rev Puck, Rev Spinner, Fit Kit, Digital files.

**Digital ad group.** Headline: "Print Your Own Trainer" (22 characters). Description: "Your drill sheet becomes print-ready STL files. $29 puck, $39 pair. Free 3D preview first." (90 characters).

### 7.3 YouTube: the 15-second thumb-pop clip

Five hook variants for the first three seconds, cut onto the same footage. The ad shows the product doing the one thing a paragraph cannot.

| # | Seconds 0 to 3: on-screen text and voice | Seconds 3 to 12 | Seconds 12 to 15: end card |
|---|---|---|---|
| 1 | "This is your drill sheet, off the ball." | Hand dangles the puck on its wrist cord, thumb relaxes, the puck drops a few millimetres onto the fingers and holds. Cut to the configurator rendering a sheet. | "Enter your drill sheet. Free." FitSlice. |
| 2 | "It's the part of your ball your hand touches." | Same footage. Voice: "printed with your exact holes, so you can practice your release anywhere." | "See your grip in 3D." FitSlice. |
| 3 | "Thumb out first. Fingers stay." | Thumb pop in slow motion, three repetitions. Voice: "Coaches agree the thumb must leave first. Practice it with your own fit." | "Built from your drill sheet." FitSlice. |
| 4 | "Same holes. Same pitch. No lane fee." | Drill sheet on the table, numbers typed into the configurator, the model rebuilds, a print comes off the bed, a hand goes in. | "Start with the $24 Fit Kit." FitSlice. |
| 5 | "Lift it, spin it, count it." | Rev Spinner released onto carpet, the bars flicker, a hand counts seconds on its fingers. Voice: "Fingers-only release practice, on carpet." | "Rev Spinner, $45. Pair, $119." FitSlice. |

Companion text for each cut:

| # | Companion headline (30 or fewer) | Chars | Companion description (90 or fewer) | Chars |
|---|---|---|---|---|
| 1 | Your Drill Sheet, Off the Ball | 30 | Enter your drill sheet and see your grip rebuilt in 3D. Free. | 61 |
| 2 | See Your Grip in 3D | 19 | Printed with your exact holes, so you can practice your release anywhere. | 73 |
| 3 | Practice Your Thumb Exit | 24 | Coaches agree the thumb must leave first. Practice it with a grip built from your sheet. | 88 |
| 4 | Start With the $24 Fit Kit | 26 | Find your hole sizes on the printer that makes your part. Credited to your trainer. | 83 |
| 5 | Lift It, Spin It, Count It | 26 | Rev Spinner, $45: fingers-only release practice. Pair it with the Puck: $119 for both. | 86 |

Every cut ends with "Never throw it. Swing-and-hold and carpet drills only." on screen for the last two seconds, under the end card. Companion banner and call-to-action button: "Enter your sheet" on the banner, "Learn more" on the button. If a creator's footage is ever used in a paid placement, the clip opens with the creator's spoken disclosure ("FitSlice sent me this trainer, printed from my own drill sheet, free of charge."), the placement is marked "Paid partnership with FitSlice.", and the creator has signed off on the cut in writing.

---

## 8. Landing page and instrumentation

One page carries the funnel: hero with the primary line and the ten-second explanation, the configurator embedded above the fold or one click away (tests 1 and 2 decide), the six drills, the product cards with prices, the fit guarantee, the no-sheet path, and the use warning ("Swing-and-hold and carpet drills only. Never throw it. Not for children under 12 without adult supervision.").

Site copy is in `marketing/02-website-copy.md`. The configurator is at https://claude.ai/artifact/1fiDeAkPe9RPJSyBWruE2p until it is hosted on the FitSlice domain. Ads must land on the FitSlice domain so that events, pixels and the 45-day attribution window work. The footer carries one held line, `[PATENT STATUS]`, that stays empty until counsel says what may be said.

Instrumentation that must exist before the first paid dollar:

- The five events in Section 1.1, with fit-sheet ID and product type as parameters.
- Purchase value, and UTM capture on every entry.
- The fit sheet written to the order as line-item properties.
- A weekly print log (printer, part, start, finish, pass or fail, bore check) that the dashboard reads.
- A per-source field on every order so pro-shop, creator-code and paid orders are separable.

---

## 9. Landing-page A/B test plan: five tests

Each test names its decision metric before it starts, and that metric alone decides. Sample sizes are per arm at 95% confidence and 80% power, set in advance, with no early stopping. Durations use the base-case traffic: about 1,550 visits a week in the Launch phase and 1,450 in the Build phase (Section 10). A test on purchase rate cannot be powered in year one: seeing 1.05% move to 1.36% takes about 19,500 visits per arm. Purchase rate is therefore read as a guardrail only.

| # | Test | A (control) | B | Decision metric | Guardrail | Sample per arm | Duration and window |
|---|---|---|---|---|---|---|---|
| 1 | Primary button wording | "Enter your drill sheet" | "See my grip in 3D" | Visit to configurator session (30% to 35%) | Fit-sheet completion among sessions does not fall | 1,400 visits | about 2 weeks; weeks 1 to 2 |
| 2 | Hero media | 15-second thumb-pop clip, muted autoplay, configurator one scroll down | Live configurator embedded above the fold, clip beside it | Visit to fit sheet completed (10% to 12%) | Bounce rate and visit to any order do not fall | 3,850 visits | about 5 weeks; weeks 3 to 7 |
| 3 | Headline | "Your drill sheet, off the ball." with the ten-second explanation as subhead | The ten-second explanation as the headline, the primary line as subhead | Visit to fit sheet completed (10% to 12%) | Bounce rate | 3,850 visits | about 5 weeks; weeks 8 to 12 |
| 4 | Price presentation on the product card | Pair $119 selected by default; Puck $89 and Spinner $45 as alternatives | Puck $89 selected by default with "Add the Spinner for $30" | Fit-sheet completers who order anything within 30 days (21% to 26%) | Fit Kit attach rate; revenue per completer, read as direction only | 1,150 completers | about 18 weeks at 130 sheets a week; weeks 14 to 32 |
| 5 | The no-sheet path | Block under the configurator: "Don't have your drill sheet? Your pro shop does. Here's exactly what to ask for," with a copyable request text and an email capture to save progress | Block: "Don't have your drill sheet? Join the list for the no-sheet fit option," email capture, no script | Share of no-sheet clickers who complete a sheet within 14 days, matched by email (10% to 18%) | Fit Kit orders from the no-sheet segment | 300 clickers | about 10 weeks at 58 clickers a week; weeks 14 to 24 |

Order: tests 1, 2 and 3 run one after another in the Launch phase, so each has the full traffic. Tests 4 and 5 start in week 14 and run together, because test 4 measures sheet completers and test 5 measures people who did not complete a sheet, and the two groups do not overlap. Test 2 is fast and sets the page shape the others run on. Test 5 answers the business plan's Risk 7 (can the customer produce a drill sheet) with observed behavior, and its result feeds the pro-shop program directly. Test 4 is the slowest and the first to drop if traffic runs below plan.

Every variant uses only green and yellow claims, and a variant may not win by making a claim the control may not make. Test 3's variant B puts the word "exact" in a headline, which the business plan allows only after Study 1 has passed. Study 1 has already passed by then, since it gates all paid spend. The test 5 block names no shop. If it ever lists a shop from the program, that entry carries "This shop earns a margin on FitSlice orders entered here."

---

## 10. KPI dashboard: twelve metrics

Reviewed every Monday for the trailing seven days and the trailing four weeks. Weeks count from the day the shop opens. Phases follow the model: **Launch** (weeks 1 to 13, December to February), **Build** (weeks 14 to 35, March to July) and **Season 2** (weeks 36 to 48, August to October). Sources: site analytics events (Section 1.1), the order system with fit-sheet line-item properties, the ad platforms' spend, and the print log. The targets are the base-case model's phase values rounded, and beating them is a double-down signal. Cost per Pair and cost per sheet step down from the stop line to the ceiling to the target ($110, $74, $50 per Pair).

| # | Metric | Formula | Launch | Build | Season 2 | Why it is on the board |
|---|---|---|---|---|---|---|
| 1 | Visits | Sessions on the FitSlice domain, all sources | 1,550 a week | 1,450 a week | 2,150 a week | Top of the funnel and the model's traffic line |
| 2 | Configurator session rate | `configurator_session` ÷ visits | 30% or more | 30% or more | 32% or more | Whether the page gets people to type |
| 3 | Fit-sheet completion rate | `fit_sheet_complete` ÷ `configurator_session`, also shown ÷ visits | 33% (10% of visits) or more | 33% or more | 35% (11% of visits) or more | The Risk 7 number. The whole business turns on it |
| 4 | Sheet-to-order rate (30 days) | Orders of any product within 30 days ÷ `fit_sheet_complete` | 21% or more | 21% or more | 23% or more | Sum of the Fit Kit (15%), direct Pair (3%) and Digital (3%) assumptions |
| 5 | Fit Kit to Pair (45-day cohort) | Pairs matched to a Fit Kit within 45 days ÷ Fit Kits in that cohort | 50% or more on the first 40-kit cohort | 50% or more | 55% or more | Shows whether the $24 credit moves buyers to a Pair |
| 6 | Visit to web Pair | Web Pairs ÷ visits, trailing 45 days | 0.75% or more | 0.95% or more | 0.90% or more | The one-number funnel health check. The design rate is 1.05%; the lag and August's 0.90 multiplier hold Season 2 lower |
| 7 | Paid cost per Pair | Paid spend ÷ paid-attributed Pairs (45-day click window) | $110 or less | $74 or less | $50 or less | Ceiling $74; scaling needs $50 |
| 8 | Paid cost per fit sheet | Paid spend ÷ paid-attributed `fit_sheet_complete` | $11.50 or less | $7.75 or less | $5.25 or less | Early proxy for metric 7, readable in week 2 |
| 9 | Web revenue per visit | Revenue from web orders (excluding pro-shop) ÷ visits, trailing four weeks | $1.21 or more | $1.38 or more | $1.41 or more | Compared with the blended cost per paid visit ($1.07) to see whether paid can ever pay |
| 10 | Gross margin per Pair | (Pair price − measured landed cost) ÷ Pair price, from the print log and fee statements | 62% or more | 63% or more | 65% or more | The $45 landed cost is an assumption until the log replaces it |
| 11 | Printer utilization and backlog | Printer-days used ÷ (printers x 25); open orders ÷ weekly capacity, in weeks | 50% to 80%; backlog 1.5 weeks or less | 50% to 80%; 1.5 weeks or less | 50% to 80%; 1.5 weeks or less | Above 80% for two weeks fires the printer rule in Section 2.3 |
| 12 | Fit remake and refund rate | (Reprints under the fit guarantee + refunds) ÷ Pairs shipped | 8% or less | 5% or less | 4% or less | The product's promise is the fit. Above 15% stops marketing until Study 1 is rerun |

Weekly volume targets that sit behind the rates, from the same model:

| Phase | Visits | Fit sheets | Fit Kits | Web Pairs | Pro-shop Pairs | Revenue |
|---|---|---|---|---|---|---|
| Launch | 1,550 | 150 | 21 | 12 | 0.5 | $1,900 |
| Build | 1,450 | 130 | 19 | 14 | 3.7 | $2,300 |
| Season 2 | 2,150 | 230 | 34 | 19 | 8.4 | $3,800 |

Also tracked weekly, without targets until the data exists: active pro shops and sheets entered per shop; Digital share of fit sheets; Puck-only and Spinner-only share of orders; search-terms report additions to the negative list; median order-to-ship days.

---

## 11. Stop or double down: the decision rules

One page. Read at weeks 8, 16 and 26 after the shop opens, and on any Monday a stop trigger fires. Each rule names the signal, the minimum data before it counts, and the action. Where rules conflict, a stop beats a hold and a hold beats a double down.

**The main dial is paid cost per Pair, trailing eight weeks.**

| Paid cost per Pair | Reading | Budget |
|---|---|---|
| $50 or less | Double down. $24 or more is left per Pair for overhead and profit | Raise one step if the minimum data in 11.3 is met |
| Above $50 up to $74 | Pays back on the first order and leaves little over | Hold at the current step; work the creative and page tests |
| Above $74 up to $110 | Loses on the first order, inside the range the model expects | Hold at the current step; the test is still cheap |
| Above $110 | Worse than the model's own assumptions | Stop prospecting (11.1) |

### 11.1 Stop (pause the line, keep organic and pro shops running)

| Signal | Minimum data | Action |
|---|---|---|
| Paid cost per Pair above $110 over the trailing eight weeks | $2,500 spent in the window | Pause prospecting (Meta A1 and A2, YouTube A3). Keep search and retargeting. Re-read at the next review |
| Paid cost per fit sheet above $11.50 for four consecutive weeks on any line | 300 clicks on that line | Pause that line and move its budget to retargeting for the month |
| Fit-sheet completion below 5% of visits once tests 2 and 3 have reported | Tests 2 and 3 complete (week 12) | Stop all prospecting. The page is losing people before the sheet, so fund test 5 and the pro-shop program |
| Fit remake and refund rate above 15% | 40 Pairs shipped | Stop all paid spend and all creator seeding until Study 1 is rerun and passes, with a bore standard deviation under 0.1 mm and a per-printer offset applied. The fit promise is the product |
| Study 1 not passed | Before the shop opens | No paid spend of any kind |
| Fit Kit to Pair below 30% on the first 40-kit cohort | 40 kits aged 45 days | Pause Fit Kit-led ads (Meta variant 3, Google variant 5, YouTube cut 4). Rework the Fit Kit email sequence and the credit presentation; re-read on the next 40 |
| A complaint, platform rejection or counsel note that an ad implies a rev, hook, average or injury result | One instance | Pull the ad the same day. Check every live asset against Part 6 before anything resumes |

### 11.2 Hold

Anything between the lines. Specifically: paid cost per Pair between $50 and $110; fit-sheet completion between 5% and 10% of visits; Fit Kit to Pair between 30% and 50%; printer utilization between 50% and 80%. In a hold the budget stays at the current step, the next A/B test starts, and the search-terms report is worked weekly. A hold that lasts past week 26 is judged under 11.4.

### 11.3 Double down

| Signal | Minimum data | Action |
|---|---|---|
| Paid cost per Pair at or under $50 for four consecutive weeks | 20 paid-attributed Pairs in the window | Raise the budget one step ($1,500 to $3,000, then to $5,000). One step a month at most; conversion lags spend by two to five weeks |
| Paid cost per fit sheet at or under $5.25 on a line for four weeks | 300 clicks on that line | Raise that line's share by 50% within the current step |
| Fit Kit to Pair at or above 50% on a 40-kit cohort | 40 kits aged 45 days | Lead with the Fit Kit everywhere: retargeting, Google variant 5, YouTube cut 4, the product-card default. The credit is doing its job |
| Fit-sheet completion at or above 12% of visits | Trailing four weeks, 4,000 visits | Shift prospecting from A1 (interests) to A2 (lookalike of completers). The seed is large enough and the trait is proven |
| Printer utilization above 80% for two weeks, or backlog at or above 1.5 weeks | Two consecutive weekly reads | Buy a printer the same day. Payback is inside a month |
| Referrals, reprints on new sheets and pro shops at or above 25% of Pairs | Trailing eight weeks | Hold paid flat and put the next increment into the pro-shop program and creator seeding, with every seeded unit disclosed |
| Digital above 5% of fit sheets | Trailing four weeks | Add Group 4 search budget and an international landing page for Digital; it grows without a printer |

### 11.4 Ending the paid program

If, at week 26, prospecting has never held a cost per Pair under $74 for four consecutive weeks on at least $4,500 of prospecting spend, and creators, community, search and pro shops are delivering 80% or more of Pairs, paid prospecting ends. Search and retargeting continue at $650 a month because they harvest demand the other channels create. The freed $850 a month goes to seeded units (each disclosed as a free unit) and a tournament booth. That result confirms the channel ranking in business-plan Part 8.

---

## 12. Assumptions register

Every assumption in this document, where it came from, and what replaces it.

| Assumption | Value used | Source or reasoning | Replaced by |
|---|---|---|---|
| Prices | Fit Kit $24 credited, Puck $89, Spinner $45, Pair $119, Digital $29/$39, pro-shop margin 25% | Business plan Part 5.1 | Pricing decision after the pilot and the willingness-to-pay test in Part 12 |
| Digital blend | $35 (60% pair files, 40% puck files) | Our guess | Measured mix after 50 Digital orders |
| Funnel rates | 30% / one third / 15% / 50% / 3% / 3% | Section 1.2 reasoning | Trailing four weeks once each stage has 200 entries |
| Paid cost per visit | $1.07 blended: Search $1.15, YouTube $2.00, Meta $0.90, retargeting $0.75 | Niche hobby audience; YouTube at $0.04 a view and 2% click-through | Two weeks of platform data |
| Pair landed cost | $45: $39.00 itemized plus $6.00 allowance, shipping included | Business plan 5.2 cost stack; shipping at the $8 to $12 placeholder; free-shipping policy in `marketing/03` and `marketing/05` | Print log, fee statements and carrier invoices |
| Fit Kit landed cost | $9, shipping passed through | 97 g filament, tape, card, mailer, machine, labor, fees | Print log |
| Printer output | 25 Pairs per printer per month (planning), 30 (best case); Pair = 1 printer-day; Fit Kit = 0.25 printer-day | Business plan 5.2 (one puck per printer per day, 25 to 30 a month); slicer times in X6 | Real print logs on the production printer |
| Printer cost and payback | $600; inside the first month of sold output | Business plan 5.2 | Purchase receipts |
| Print-partner price | $0.07 to $0.10 per gram | Business plan X4 | Three quotes before launch |
| Seasonality | 0.85 May, 0.70 June and July, 0.90 August, 1.10 September and October | League season September to April; summer unknown (Part 12) | Year-one monthly data |
| December launch share | 0.75 of a month of orders | `marketing/06` calendar: configurator week 1, shop week 2 | The actual launch date |
| Creator traffic | 4,000 and 5,000 visits for the first two videos, tail 1,500 to 2,500 a month | Our estimate against the subscriber counts in Part 8; no conversion data exists for these channels (Part 12) | Link and code tracking from the creator program |
| Pro-shop ramp | 1 shop in Month 3 to 22 in Month 12, two Pairs per shop per month | Our estimate; the plan says to call 20 shops first (Part 12) | Shop onboarding log |
| No-sheet block click share (test 5) | 20% of sessions that stop short of a completed sheet | Our estimate | Test 5 data |
| Gross profit per Pair | $74 (62%) | $119 less $45 | Measured margin, metric 10 |
| Decision lines | $50 target, $74 ceiling, $110 stop, per paid Pair | Gross profit per Pair; stop line just above the model's own $102 | Rerun when landed cost changes |
| Attribution window | 45 days, click | Fit Kit to Pair lag of two to five weeks | Measured lag distribution |

---

## 13. What the founder must decide or supply

1. **Study 1 result.** Thirty pucks measured, standard deviation per bore, per-printer offset. No paid spend before this passes. Date it.
2. **Shipping.** This document follows the policy in `marketing/03` and `marketing/05`: Pairs ship free, so $10 of shipping sits inside the $45 landed cost. The shipping page in `marketing/02-website-copy.md` says only that a flat rate is shown at checkout; align it with this policy before launch. If shipping moves to the buyer, landed cost falls to $35, gross profit per Pair rises to $84, and each line in Section 11 rises by $10 (ceiling $84, target $60, stop $120).
3. **Launch date.** The model assumes launch week 1 starts on December 1, 2026 and the shop opens in week 2. A later date moves every row in Section 3.
4. **Brand-name clearance.** FitSlice must clear the register and common-law use before it goes into an ad account, a domain or a package. Every asset here assumes the name holds.
5. **Hosting.** The configurator and landing page on the FitSlice domain, with the five events firing, before the first ad. Ads cannot run to the claude.ai preview.
6. **Counsel review of this document's ad copy** against Part 6 and the FTC endorsement and substantiation rules listed in business-plan Part 9, before anything goes live.
7. **Print-partner quotes** (three) and the decision on how Fit Kits are handled for outsourced orders (Section 2.3).
8. **Pro-shop calls.** Twenty shops asked whether they will enter a customer's sheet into our tool. The 22-shop ramp in Section 3 is a guess until then.
9. **Budget step approvals.** The founder signs off on each step from $1,500 to $3,000 to $5,000 against Section 11, in writing, with the four-week numbers attached.
10. **The ball-manufacturer negative-keyword list** in the ad account, kept by whoever runs it and never placed in a shared document.
11. **Pilot timing.** Study 3 results (plan Month 6) decide whether any claim moves from red to yellow. Until then this document's copy does not change, however good the early numbers look.
12. **Real cost per visit by platform** after two weeks, and the funnel rates after each stage reaches 200 entries, pasted into the assumptions register so the tables are rerun.
13. **`[PATENT STATUS]`** stays as written in every asset until counsel says what may be said. **`[QUOTE PLACEHOLDER — name]`** stays until a named coach has said the words and agreed to the disclosure.

---

## 14. Compliance checklist for every paid asset

Before an ad, a landing-page variant or a retargeting message goes live, someone other than its author checks each line.

- The claim is on the green list, or on the yellow list with its exact qualifier ("designed for", "practice", "to our knowledge", "help keep the feel").
- Any mention of weight states both "about 300 g" and "20% infill".
- No number for revs, hook, average or pins, and no implied result ("more revs in 30 days", "see the difference on the lane"). Attributed coaching consensus is stated as coaching consensus.
- No ball-company name, model name or trade dress anywhere in copy, image, video or landing page.
- No patent language of any kind. The slot reads `[PATENT STATUS]` until counsel says what may be said.
- No claim of approval, endorsement or recommendation by a governing body, a coach or a shop that has not said so in writing.
- Every creator, coach, affiliate, seeded unit or shop that appears carries the matching disclosure line from the top of this document, first, in words a phone screen shows without expanding.
- No testimonial, review count, star rating or customer name that has not actually happened and been cleared.
- The product is called a trainer, slice, puck, disc or plate. It is never called a ball, a mini ball or regulation equipment.
- The verbs are "designed to", "practice", "train" and "rehearse". Any verb that promises a result is out.
- The use warning is on the landing page and in the last two seconds of every video: swing-and-hold and carpet drills only, never throw it, not for children under 12 without adult supervision.
- The call to action lands on the FitSlice domain with events firing.
- `[PATENT STATUS]` and `[QUOTE PLACEHOLDER — name]` are absent from anything live.
