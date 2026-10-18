# FitSlice: Paid Media, Funnel and the Path to $1M

Working draft, October 2026. Source of truth for every claim in this document is `docs/business-plan.md` (Part 2 how it helps, Part 4 competitors, Part 5 product line and prices, Part 6 claims, Part 8 selling) and `README.md` (parts, drills). Language follows `marketing/01-brand-platform.md`. Anything in square brackets is a placeholder that must be filled or removed before use: `[PATENT STATUS]`, `[QUOTE PLACEHOLDER — name]`.

What this file is for: it defines the funnel we measure, states the conversion and cost assumptions in one place, shows what $1,000,000 of revenue requires under three product mixes, models the first twelve months, and gives the paid-media plan for a $1,500 per month starter budget with the copy, keywords, audiences, tests, dashboard and decision rules that go with it. Every number that is an assumption says so. Replace assumptions with measured values as they arrive and rerun the tables; the arithmetic is in `scratchpad/model.py` and is simple enough to redo in a spreadsheet.

Where paid media sits in the plan: business-plan Part 8 ranks channels by expected return as instruction YouTube, the configurator as content, tournaments, pro shops, then marketplaces. Paid media is not in that list. Its job here is narrower and worth doing anyway: catch the demand that creators, community posts and pro shops create (search and retargeting), run a small, measured prospecting test to find out whether a scalable paid channel exists at an acceptable cost, and hand the answer to the decision rules in Section 11. Paid spend scales only when the rules say so.

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
| 5 | Pair | A paid Pair order ($119) or a Puck plus Spinner bought together. Matched to a prior Fit Kit by email or fit sheet ID within 45 days | `purchase` with `product_type=pair` |

Two side paths are counted but kept out of the main funnel rates: a direct Pair order with no Fit Kit first (stage 3 to stage 5), and a Digital order ($29 puck files, $39 pair files) from stage 3. Puck-only ($89) and Spinner-only ($45) orders are counted as orders and tracked in the product mix; for planning they are folded into Pairs (Section 1.3).

Attribution: paid channels get a 45-day click window because the Fit Kit to Pair step takes two to five weeks (print, ship, size, reorder). Creator traffic is attributed by the creator's link or code, and every creator video or post that sends traffic carries its disclosure line (seeded unit: "FitSlice sent me this trainer, printed from my own drill sheet, free of charge." Affiliate: "I earn a commission when you order with my code."). Pro-shop orders are attributed to the shop that entered the sheet and carry the shop disclosure at the counter.

### 1.2 Conversion assumptions

These are planning assumptions, not measurements. The reasoning is beside each one. Replace each with the trailing-four-week measured value once the stage has at least 200 entries.

| Step | Assumed rate | Why this number |
|---|---|---|
| Visit to configurator session | 30% | The configurator is the primary call to action on every page and the ad promise is "see your grip in 3D". Interactive tools on landing pages commonly engage a quarter to a third of visitors. Cold paid traffic will run lower, creator traffic higher |
| Configurator session to fit sheet completed | 33% | Business-plan Risk 7: many league bowlers do not have their drill sheet at hand. A third finishing is the honest middle; the no-sheet path (test 5, Section 9) is how we learn the real number |
| Fit sheet completed to Fit Kit | 15% | A $24 purchase with full credit, from a person who has just typed in their own fit and watched it render. High intent, low price |
| Fit Kit to Pair (45 days) | 50% | The buyer has paid, sized their holes and holds a $24 credit. Half convert; half stop at a sizer plate, which they keep |
| Fit sheet completed to Pair, direct | 3% | Bowlers confident in their sheet who skip the sizer |
| Fit sheet completed to Digital | 3% | Printer owners and international visitors who cannot be shipped to economically. Digital files have no capacity limit |

Combined, visit to Pair is **1.05%** (0.30 × 0.33 × 0.15 × 0.50 plus 0.30 × 0.33 × 0.03). That is one Pair per 95 visits. For a $119 made-to-order product that requires the customer to produce a drill sheet, this is a demanding but defensible blended figure across warm creator traffic and colder paid traffic. Section 11 says what we do if it is wrong in either direction.

### 1.3 The funnel per 10,000 visits

| Stage | Count | Revenue |
|---|---|---|
| Visits | 10,000 | |
| Configurator sessions | 3,000 | |
| Fit sheets completed | 1,000 | |
| Fit Kits sold | 150 | 75 retained at $24 = $1,800 (the other 75 credit into a Pair) |
| Pairs from Fit Kits | 75 | |
| Pairs direct | 30 | |
| **Pairs total** | **105** | **$12,495** |
| Digital files | 30 | $1,050 at a $35 blend (60% pair files at $39, 40% puck files at $29) |
| **Revenue per 10,000 visits** | | **$15,345, or $1.53 per visit** |

Two simplifications, both conservative in the same direction: all printed trainer orders are modeled as Pairs at $119, and retained Fit Kit revenue is shown separately so the $1M tables below can be read on Pairs alone. In practice some orders will be Puck-only at $89 or Spinner-only at $45 and will land below $119. The retained Fit Kit revenue (about 14% on top of Pair revenue) is the cushion that absorbs that. Revisit the mix after the first 100 orders.

### 1.4 What the funnel says about paid media before a dollar is spent

Gross profit per Pair is about $84 (71%) at a $35 landed cost for a puck plus spinner sold direct, with shipping charged separately (derived from the cost stack in business-plan Part 5.2; see the assumptions register in Section 12). That is the ceiling on what a Pair can cost to acquire and still break even on the first order.

At the funnel above, one paid Pair needs 95 paid visits. So:

- At $1.00 per visit, paid cost per Pair is **$95**. That is above the $84 ceiling. Paid prospecting at $1.00 per click loses money on the first order.
- For a **$60 target cost per Pair** (leaving $24 per Pair for overhead), cost per visit must be at or under **$0.63**, or visit-to-Pair must reach **1.67%** at $1.00 per visit.
- For the **$84 breakeven ceiling**, cost per visit must be at or under **$0.88**, or visit-to-Pair must reach **1.19%** at $1.00 per visit.
- Cost per fit sheet is the early proxy. At $1.00 per visit and 10% sheet completion it is $10.00. The $60 Pair target corresponds to **$6.30 per paid fit sheet**.

This is why the starter budget leans toward search and retargeting (people who already know the product, where cost per visit and conversion are both better) and keeps prospecting to a measured test. It is also why Fit Kit to Pair conversion and the no-sheet path are the two numbers that decide whether paid ever scales.

---

## 2. The path to $1M

Revenue here means what FitSlice books. Pro-shop orders are counted at the net $89.25 FitSlice keeps after the shop's 25% on a $119 Pair. Capacity uses the plan's assumption of one puck per printer per day, 25 to 30 per month; the tables use **25 per printer per month** so that failed prints, maintenance and cooldown are inside the number. A Pair consumes one printer-day (puck 11 h 20 m plus spinner 3 h 38 m on the CoreXY profile, about 15 h, with the balance for removal, deburring and the next start). A Fit Kit sizer plate consumes a quarter of a printer-day (3 h 24 m).

### 2.1 Three mixes

| | Mix A: Pairs only | Mix B: Pairs + Digital | Mix C: Pairs + Digital + Pro shop |
|---|---|---|---|
| Direct-web Pairs at $119 | 8,404 ($1,000,076) | 7,752 ($922,488) | 6,299 ($749,581) |
| Pro-shop Pairs at $89.25 net | 0 | 0 | 2,100 ($187,425), 25% of printed Pairs |
| Digital files at $35 blend | 0 | 2,215 ($77,525) | 1,800 ($63,000) |
| **Revenue** | **$1,000,076** | **$1,000,013** | **$1,000,006** |
| Pairs to print | 8,404 | 7,752 | 8,399 |
| Fit Kits along the way (not in revenue) | 12,006 sold; 6,003 retained ($144,069) | 11,075 sold; 5,538 retained ($132,900) | 8,999 sold; 4,499 retained ($107,986) |
| **Site visits required** at 1.05% visit-to-Pair | **800,000** | **738,000** | **600,000** |
| Printer-days (Pairs + Fit Kits at 0.25) | 11,405 | 10,521 | 10,649 |
| Over 12 months: Pairs per month, printers | 700, 29 printers | 646, 26 printers | 700, 28 printers |
| Over 24 months: Pairs per month, printers | 350, 15 printers | 323, 13 printers | 350, 14 printers |
| Over 36 months: Pairs per month, printers | 233, 10 printers | 215, 9 printers | 233, 10 printers |
| Active pro shops needed (steady state over 12 months) | 0 | 0 | 58 at 3 Pairs per shop per month; 87 at 2 |

Printer counts in the horizon rows are for Pairs alone; add roughly one printer in three for Fit Kits, or print Fit Kits on a dedicated flat-plate printer (four per day).

### 2.2 What the table says

1. **$1M in twelve months needs 26 to 29 printers.** The plan is written for a one-to-three printer launch. Twelve months is a print-partner plan or it is not a plan. Twenty-four months with 13 to 15 printers and one part-time operator is the realistic in-house path; thirty-six months with 9 to 10 printers matches the plan's own market sizing (one percent of certified league bowlers buying a Pair over three years, about 10,700 units, about $1.3M).
2. **Digital shaves traffic, not printers, by much.** At 3% of fit sheets, digital cuts the visits needed by 8% and the printing by 8%. Its real value is different: zero capacity, near-zero cost of goods, and it is the only product international visitors can buy. If digital runs above 3% of sheets, lean into it; it is the one line that scales without a printer.
3. **Pro shops replace ad spend, not printers.** Mix C needs 200,000 fewer visits than Mix A (a quarter less traffic to buy or earn) and prints the same number of Pairs. Each pro-shop printer-day earns $89.25 against $119 direct. The channel is worth it because it carries no acquisition cost and brings the drill sheet with it, and because 58 active shops is a three-year relationship-building number, not a year-one number (year one in Section 3 reaches 22).
4. **Traffic is the other wall.** 600,000 to 800,000 visits over the life of the goal is 50,000 to 67,000 a month on a twelve-month horizon and 17,000 to 22,000 a month on thirty-six. Year one in Section 3 averages 8,300 a month. The gap is closed by creators and community (the plan's first two channels), by search demand that those channels create, and by paid only where Section 11 allows it.

### 2.3 When to add printers, and when to add a print partner

A CoreXY printer costs about $600 and pays for itself within its first month of sold output (business-plan Part 5.2). The rule is therefore biased toward adding printers early and keeping a print partner for overflow.

| Trigger | Action |
|---|---|
| Trailing four-week orders above 80% of installed capacity (20 Pairs per printer per month sustained) and order-to-ship backlog at or above 1.5 weeks | Order one printer. Lead time is days; the backlog clears in the first week of the new machine |
| A single week of orders above 2× installed weekly capacity (a creator video, a tournament) | Do not buy for a spike. Send the overflow to the print partner and tell customers the ship date before they pay |
| Backlog above 3 weeks for two consecutive weeks | Printer order plus partner overflow, both, the same day |
| In-house labor above 80 hours a month (at 15 minutes per part that is about 320 parts, roughly 160 Pairs, roughly 6 to 7 printers) | Hire a part-time operator or move a standing share of volume to the partner. The founder's time is for sheets, shops and creators |
| Forecastable seasonal peak (league season starts September; summer is quiet) | Pre-build Fit Kits and spinners in July and August; they hold. Pucks are made to order and are not pre-built |

Print-partner facts and constraints:

- Institutional and commercial print pricing runs $0.07 to $0.10 per gram, which puts a 300 g puck at $21 to $30 before margin, roughly our in-house landed cost (business-plan Part 5.2). The partner is for overflow, not for the base load.
- Get three quotes before launch (the plan's Part 12 names Craftcloud, JLC3DP and Xometry as candidates) and run the same 30-part bore measurement on partner output that Study 1 runs on our own printers. The fit guarantee rests on the printer that made the part.
- The Fit Kit promise is that the sizer is printed on the same printer and material as the order. An outsourced Pair must therefore have its Fit Kit printed by the same partner line, or the partner's bore offset must be calibrated and applied in the configurator's print allowance. Decide this before the first outsourced order ships.

---

## 3. Twelve-month revenue model

### 3.1 Assumptions

- **Calendar.** Month 1 is November 2026 (seeding month: 20 trainers to coaches and creators, waitlist live, configurator live, shop not yet open). The shop opens in Month 2, December 2026, in line with the launch sequence in business-plan Part 8 and the first-90-days table in Part 13. Month 12 is October 2027.
- **Funnel rates** as in Section 1.2. Fit Kits bought in one month convert to Pairs at 50% in the following month.
- **Seasonality.** League season runs roughly September to April. Fit-sheet completion is multiplied by 0.85 in May, 0.70 in June and July, 0.90 in August and 1.10 in September and October. Summer demand is unknown (business-plan Part 12); this is a guess that leans cautious.
- **Paid traffic.** $1.00 blended cost per site visit across search, YouTube and Meta. Budget: $0 in Month 1, $1,500 a month in Months 2 to 4, $3,000 in Months 5 to 9, $5,000 in Months 10 to 12. Each step up happens only if the Section 11 rules pass; if they fail, the model's paid rows go to zero and revenue falls by roughly a third.
- **Creator and community traffic.** The first two creator videos go live in Months 2 and 3 (4,000 and 5,000 visits), with a tail of 1,500 to 2,500 a month and a new wave at season start. Every creator video carries the seeded-unit disclosure and, where a code exists, the affiliate disclosure. A pilot-results post in Month 6 adds an earned-media bump whatever the result says.
- **Organic.** Search, community posts, word of mouth and returning visitors, from 800 a month to 5,000 by Month 12.
- **Pro shops.** First shop in Month 3, 22 active shops by Month 12, two Pairs per active shop per month at $89.25 net. New shops produce less than mature ones; two is an average.
- **Digital.** 3% of fit sheets at a $35 blend.
- **Costs.** Pair landed cost $35 (puck and spinner, direct-web payment fees, shipping charged separately). Fit Kit $8. Digital $1.50. Printers $600 each, bought when the capacity rule fires, starting with three. Contribution is gross profit less paid media less printer purchases. It excludes founder time beyond the $5 per part in the cost stack, hosting and software, insurance, legal, the pilot study ($1,500 to $3,000), the 20 seeded units (about $700 of parts) and tournament booths.
- **Not modeled.** Puck-only and Spinner-only orders, marketplace listings, tournament booth sales, reprints on new sheets, international shipping, any price change after the pilot.

### 3.2 Traffic and units

| Month | Paid $ | Paid visits | Creator and community | Organic | Total visits | Fit sheets | Fit Kits | Pairs direct | Pairs from kits | Pairs (web) | Digital | Active shops | Pro-shop Pairs |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Nov 26 | 0 | 0 | 0 | 800 | 800 | 80 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Dec 26 | 1,500 | 1,500 | 4,000 | 1,000 | 6,500 | 650 | 98 | 20 | 0 | 20 | 20 | 0 | 0 |
| Jan 27 | 1,500 | 1,500 | 5,000 | 1,500 | 8,000 | 800 | 120 | 24 | 49 | 73 | 24 | 1 | 2 |
| Feb 27 | 1,500 | 1,500 | 2,500 | 2,000 | 6,000 | 600 | 90 | 18 | 60 | 78 | 18 | 2 | 4 |
| Mar 27 | 3,000 | 3,000 | 2,500 | 2,500 | 8,000 | 800 | 120 | 24 | 45 | 69 | 24 | 4 | 8 |
| Apr 27 | 3,000 | 3,000 | 2,500 | 4,000 | 9,500 | 950 | 142 | 28 | 60 | 88 | 28 | 6 | 12 |
| May 27 | 3,000 | 3,000 | 2,000 | 3,000 | 8,000 | 680 | 102 | 20 | 71 | 92 | 20 | 8 | 16 |
| Jun 27 | 3,000 | 3,000 | 1,500 | 2,500 | 7,000 | 490 | 73 | 15 | 51 | 66 | 15 | 10 | 20 |
| Jul 27 | 3,000 | 3,000 | 1,500 | 2,500 | 7,000 | 490 | 73 | 15 | 37 | 51 | 15 | 12 | 24 |
| Aug 27 | 5,000 | 5,000 | 3,000 | 3,500 | 11,500 | 1,035 | 155 | 31 | 37 | 68 | 31 | 15 | 30 |
| Sep 27 | 5,000 | 5,000 | 4,000 | 4,500 | 13,500 | 1,485 | 223 | 45 | 78 | 122 | 45 | 18 | 36 |
| Oct 27 | 5,000 | 5,000 | 4,000 | 5,000 | 14,000 | 1,540 | 231 | 46 | 111 | 158 | 46 | 22 | 44 |
| **Year 1** | **34,500** | **34,500** | **32,500** | **32,800** | **99,800** | **9,600** | **1,428** | **286** | **598** | **884** | **286** | | **196** |

### 3.3 Revenue, margin and capacity

| Month | Revenue | Cumulative | Cost of goods | Gross profit | Printer-days used | Printers | Utilization | Printers bought | Contribution after ads and printers |
|---|---|---|---|---|---|---|---|---|---|
| Nov 26 | $0 | $0 | $0 | $0 | 0 | 3 | 0% | $0 (3 on hand) | $0 |
| Dec 26 | $5,343 | $5,343 | $1,492 | $3,851 | 44 | 3 | 58% | $0 | $2,351 |
| Jan 27 | $11,386 | $16,729 | $3,612 | $7,774 | 105 | 5 | 84% | $1,200 | $5,074 |
| Feb 27 | $10,989 | $27,718 | $3,617 | $7,372 | 104 | 5 | 84% | $0 | $5,872 |
| Mar 27 | $11,565 | $39,283 | $3,691 | $7,874 | 107 | 5 | 86% | $0 | $4,874 |
| Apr 27 | $14,580 | $53,863 | $4,700 | $9,880 | 136 | 6 | 91% | $600 | $6,280 |
| May 27 | $13,786 | $67,649 | $4,614 | $9,172 | 133 | 6 | 89% | $0 | $6,172 |
| Jun 27 | $10,658 | $78,307 | $3,610 | $7,048 | 104 | 6 | 69% | $0 | $4,048 |
| Jul 27 | $9,661 | $87,968 | $3,251 | $6,410 | 94 | 6 | 63% | $0 | $3,410 |
| Aug 27 | $14,676 | $102,644 | $4,712 | $9,965 | 137 | 6 | 91% | $0 | $4,965 |
| Sep 27 | $22,794 | $125,438 | $7,385 | $15,409 | 214 | 9 | 95% | $1,800 | $8,609 |
| Oct 27 | $27,166 | $152,605 | $8,972 | $18,194 | 259 | 11 | 94% | $1,200 | $11,994 |
| **Year 1** | **$152,605** | | **$49,656** | **$102,949 (67%)** | **1,437** | | | **$4,800** | **$63,649** |

### 3.4 Reading the model

- Year one is about **$150,000 of revenue, 1,080 Pairs printed, 11 printers by October 2027**, and a positive contribution every month after launch before the unmodeled overheads. That is the "profitable one-to-three-printer operation first" that the business plan asks for, grown to eleven by the capacity rule. $1M is a cumulative figure for the end of year three on this trajectory, sooner only with a print partner and a traffic source we have not yet proven.
- The blended year-one visit-to-Pair rate is **0.89%**, below the 1.05% steady state, because of the Fit Kit lag, the pre-launch month and the summer multiplier. Do not judge the funnel against 1.05% before Month 4.
- Paid is **35% of visits** and **$34,500 of spend** in year one. At the modeled cost per visit it returns about $1.53 of revenue per dollar, around $1.07 of gross profit per dollar: roughly breakeven on first orders, positive once repeat sheets and word of mouth are counted. That is acceptable for a test and not acceptable as the growth engine. Section 11 holds paid to that standard.
- The capacity line is the thing to watch each Monday. Utilization sits above 84% from January; the model buys printers as soon as the rule fires. If orders arrive faster than the model (a creator video that lands), the partner absorbs the spike.
- Month 1 shows zero revenue and zero contribution by construction; the seeding units and the pilot study are real cash out in Months 1 to 3 that the contribution line does not carry.

---

## 4. Starter budget: $1,500 a month

Months 2 to 4. The split favors intent. Each line has a job, an expected output at the stated cost assumption, and the number that decides whether it keeps its budget.

| Line | Monthly | Job | Assumed cost | Expected monthly output | Keeps budget if |
|---|---|---|---|---|---|
| Google Search, brand and high-intent category terms | $350 | Catch people who heard about it from a creator, a shop or a friend and typed it in | $1.15 per click | ~300 visits, ~30 fit sheets | Cost per fit sheet at or under $8 by week 8, $6.50 by week 16 |
| YouTube in-stream and in-feed, 15-second thumb-pop clip | $400 | Show the product in motion to people watching bowling instruction; build a video-viewer audience for retargeting | $0.04 per view | ~10,000 views, 150 to 200 visits | 15-second view rate at or above 30%; viewer audience reaches 5,000 by week 8 |
| Meta prospecting (feed and Reels, interests then lookalike) | $450 | The scalable-channel test | $0.90 per click | ~500 visits, ~50 fit sheets | Cost per fit sheet at or under $9 by week 8, $6.50 by week 16 |
| Retargeting, Meta and Google Display and YouTube | $300 | Bring back configurator abandoners, completed sheets without an order, and Fit Kit buyers without a Pair | $0.75 per click | ~400 visits, the highest-converting traffic we have | Cost per order (any product) at or under $25 |
| **Total** | **$1,500** | | **~$1.00 blended per visit** | **~1,500 visits** | |

Rules for the budget as a whole:

- Spend is capped daily, not monthly, so one bad placement cannot take a week's money in a night.
- No budget moves to prospecting from retargeting; retargeting is funded first every month because it is where the funnel's lag is recovered.
- Creative is the ten-second explanation and the thumb-pop clip until testing says otherwise. One claim per ad, from the green or yellow list.
- The first two weeks are a measurement period. Nothing is paused or scaled before an ad set has 300 clicks or $75 of spend, whichever comes first.
- Scaling to $3,000 and $5,000 follows Section 11, not the calendar.

---

## 5. Audiences

Platform interest categories are targeting inputs. They never appear in copy, and no organization's name appears in an ad because of them.

| Audience | Definition | Used for | Notes |
|---|---|---|---|
| A1. Bowling interest, prospecting | United States and Canada; age 25 to 65+; platform interest categories for bowling, ten-pin bowling, bowling equipment and league bowling as the platform lists them. Exclude purchasers and existing fit-sheet completers | Meta prospecting, YouTube in-feed | Broad by design. The configurator and the fit-sheet step qualify the traffic; the ad does not need to |
| A2. Lookalike of fit-sheet completers | 1% lookalike seeded from the `fit_sheet_complete` audience once it has 1,000 people; before that, seeded from all site visitors once that reaches 1,000 | Meta prospecting, replaces A1 as it proves out | The sheet completers are the people who have a drill sheet. That is the trait we want to find more of |
| A3. Bowling instruction viewers | YouTube: custom segments built from the intent-group keywords in Section 6, plus placement targeting on bowling instruction channels. Placement targeting is a platform feature and implies nothing about the channel's view of the product; channels in the creator program are placed only on terms that program allows | YouTube in-stream | Use the 15-second clip. Skippable; we pay for the watch, not the impression |
| A4. Configurator abandoners | Fired `configurator_session`, no `fit_sheet_complete`, last 7 days | Retargeting | Message: "Your grip is one drill sheet away. Don't have it? Your pro shop does." |
| A5. Sheet completed, no order | Fired `fit_sheet_complete`, no `purchase`, last 30 days | Retargeting | Message: the Fit Kit at $24, credited. Second message at day 14: the fit guarantee |
| A6. Fit Kit, no Pair | `purchase` with `product_type=fit_kit`, no Pair, days 10 to 45 | Retargeting, plus email | Message: "Your $24 credit is waiting. Your sheet is on file." |
| A7. Video viewers | Watched 50% or more of the thumb-pop clip, last 30 days | Retargeting into the configurator | Cheap pool; the clip does the explaining |
| A8. Purchasers | Any `purchase` | Excluded from all prospecting and retargeting. A reorder message at six months is out of scope here |

Not targetable and not attempted: one-handed versus two-handed style. Copy says "for one-handed, thumb-in bowlers" and lets two-handers self-select to the Spinner. Minimum age 18 on every platform; the product card says not for children under 12 without supervision, and no ad is aimed at minors.

---

## 6. Keywords

Thirty terms in four intent groups, with match type and the job of the ad that runs on them. A keyword is a thing a person typed; it is not a claim we make. An ad shown on "bowling rev rate drills" describes what the trainer is and what it practices; it never promises revs.

### 6.1 Group 1: mechanics and problem intent (10)

Phrase match on Search at a low bid; the same terms seed the YouTube custom segment (A3).

1. bowling release drills
2. bowling thumb exit drill
3. how to get thumb out of bowling ball
4. bowling fingertip grip practice
5. relaxed hand bowling release
6. bowling finger lift drill
7. bowling rev rate drills
8. one handed bowling release tips
9. bowling grip pressure squeezing
10. bowling practice at home

Ad job: the ten-second explanation, then "Enter your drill sheet". Landing page: the configurator with the drills section one scroll down.

### 6.2 Group 2: product and category intent (10)

Exact and phrase match on Search, highest bids in the account.

11. bowling release trainer
12. bowling rev trainer
13. bowling grip trainer
14. bowling training aid
15. bowling practice ball with holes
16. bowling hand strengthener
17. bowling wrist and finger trainer
18. bowling training equipment for home
19. bowling thumb release aid
20. bowling release practice tool

Ad job: the category comparison from the green list ("Unlike generic one-size trainers and S/M/L wrist braces, it is built from your fit"), price, Fit Kit. Landing page: product page with the configurator embedded.

### 6.3 Group 3: fit intent (7)

Phrase match. These people already care about the thing we copy.

21. bowling ball drill sheet
22. bowling thumb hole size chart
23. bowling ball span measurement
24. bowling ball pitch explained
25. bowling thumb tape 64th
26. bowling fingertip grip fit
27. custom fit bowling grip

Ad job: "Your drill sheet, off the ball." and the 1/64" fact. Landing page: the configurator, with the fit-sheet import visible.

### 6.4 Group 4: brand and maker intent (3)

Exact match. Brand terms are cheap and defend the name; maker terms sell Digital.

28. FitSlice
29. 3D printed bowling trainer
30. bowling trainer STL

Ad job for 29 and 30: Digital files at $29 and $39, generated from your sheet, with the print notes. Landing page: Digital product page.

### 6.5 Negative keywords

Applied account-wide on Search; reviewed weekly from the search-terms report.

- Shopping for other equipment: ball for sale, bowling ball prices, bowling ball reviews, bowling ball cleaner, bowling shoes, bowling bag, bowling ball drill bits, drill press, how to drill a bowling ball, bowling ball drilling near me
- Different product category: wrist brace, wrist support, wrist guard (revisit after week 8; these searchers are adjacent and may be worth a dedicated ad set with the "a brace holds your wrist for you; this trains your hand" answer)
- Different style or sport: two handed, cricket bowling, lawn bowling, candlepin, duckpin, five pin
- Spectating and venues: tv schedule, tour schedule, tournament results, scores, rules, bowling alley near me, bowling league near me, bowling jobs, bowling party
- Games and novelties: wii bowling, video game, bowling pin, bowling costume
- Free-file seekers (Group 4 only): free stl, thingiverse, free download
- Every ball manufacturer's name and model line. The list lives in the ad account, not in this document, and is kept current by the person who runs the account.

---

## 7. Ad copy

Every ad is one claim from the green or yellow list in business-plan Part 6, the ten-second explanation, and one call to action. No ad names a rev rate, a hook, an average, an injury, a governing body, a ball company or a patent. Ads carry the brand name only; no "patented", no "patent pending" (where a later version might mention it, write `[PATENT STATUS]` and leave it out of the live ad). An ad that uses a coach's words runs only after the coach has said them, and carries the coach's material-connection disclosure.

### 7.1 Meta: five variants

Headline under 40 characters. Primary text with the first sentence under 125 characters so it reads before the fold. Creative: variant 1 and 5 on the thumb-pop clip, 2 and 4 on the configurator screen recording, 3 on a still of the puck in a hand with the drill sheet beside it.

| # | Headline | Primary text | Call to action |
|---|---|---|---|
| 1 | Your drill sheet, off the ball. | It's the part of your ball your hand touches, printed with your exact holes, so you can practice your release anywhere. Enter your drill sheet and see your grip in 3D. Free. | Enter your sheet |
| 2 | Same holes. Same pitch. No lane fee. | FitSlice reproduces your pro-shop drill sheet: hole sizes in 1/64" steps, both spans, every pitch, right or left hand, on a regulation 8.5" ball radius. About 300 g at 20% infill. Fits in a bag. Practice fingertip holds and a clean thumb exit at your desk. | See your grip |
| 3 | Train the hand that bowls. | Coaches agree the thumb must leave first and a relaxed hand creates more revs. FitSlice gives you your own grip to practice both, away from the lane. Built from your drill sheet. Start with the $24 Fit Kit, credited toward your trainer. | Start with the Fit Kit |
| 4 | Fit you can practice. | Generic practice balls have one-size holes. Wrist braces come in S, M and L. FitSlice is built from your fit. Type in your drill sheet and the configurator rebuilds your grip in about a tenth of a second. Free to try. | Try the configurator |
| 5 | Relax the thumb. Let the fingers work. | Thumb pops. Fingertip carries. Carpet spins you can count. Six drills in your own hole geometry on a 300 g slice of ball surface, so you can rehearse the release between league nights. Made to order. 30-day fit guarantee. | Build mine |

Held variant, not to run until filled: headline "Train the hand that bowls." with primary text `[QUOTE PLACEHOLDER — coach name]`, the coach's disclosure line as the first sentence ("FitSlice sent me this trainer, printed from my own drill sheet, free of charge." and, if a code exists, "I earn a commission when you order with my code."), and "Paid partnership with FitSlice" set on the post itself when the ad runs from the coach's handle.

### 7.2 Google Search: responsive search ad assets

Headlines at or under 30 characters, descriptions at or under 90. Pin headline 1 to position 1 on Group 3 and 4 terms; let the system rotate elsewhere. Five headline-and-description pairs, plus five extra headlines for rotation.

| # | Headline (≤30) | Description (≤90) |
|---|---|---|
| 1 | Your Drill Sheet, Off the Ball | The part of your ball your hand touches, printed with your exact holes. Practice anywhere. |
| 2 | Custom-Fit Release Trainer | Built from your drill sheet: 1/64" hole steps, both spans, every pitch. Free 3D preview. |
| 3 | Practice Your Thumb Exit | 300 g slice of ball surface drilled to your sheet. Thumb pops and fingertip holds at home. |
| 4 | Same Holes. Same Pitch. | Holes aimed at the ball's center, like a zero-pitch drilling. Your grip, off the lane. |
| 5 | Start With the $24 Fit Kit | Find your exact hole sizes on the printer that makes your part. Credited to your trainer. |

Extra headlines for rotation: Built From Your Drill Sheet; Train the Hand That Bowls; Free 3D Preview of Your Grip; Fit You Can Practice; Made to Order in PETG.

Extra descriptions: "Enter your drill sheet and see your grip rebuilt in 3D in about a tenth of a second. Free." and "To our knowledge, the first trainer built from your drill sheet. 30-day fit guarantee."

Sitelinks: Configurator; Fit Kit $24; Rev Puck $89; The six drills. Callouts: Made to order; Right or left hand; 1/64" steps; Digital files available. Structured snippet, Types: Rev Puck, Rev Spinner, Fit Kit, Digital files.

### 7.3 YouTube: the 15-second thumb-pop clip

Five hook variants for the first three seconds, cut onto the same footage. The ad shows the product doing the one thing a paragraph cannot.

| # | Seconds 0 to 3, on-screen text and voice | Seconds 3 to 12 | Seconds 12 to 15, end card |
|---|---|---|---|
| 1 | "This is your drill sheet, off the ball." | Hand dangles the puck on its wrist cord, thumb relaxes, puck drops a few millimetres onto the fingers and holds. Cut to the configurator rendering a sheet. | "Enter your drill sheet. Free." FitSlice. |
| 2 | "It's the part of your ball your hand touches." | Same footage. Voice: "printed with your exact holes, so you can practice your release anywhere." | "See your grip in 3D." FitSlice. |
| 3 | "Thumb out first. Fingers stay." | Thumb pop in slow motion, three repetitions. Voice: "Coaches agree the thumb must leave first. Practice it with your own fit." | "Built from your drill sheet." FitSlice. |
| 4 | "Same holes. Same pitch. No lane fee." | Drill sheet on the table, numbers typed into the configurator, model rebuilds, print comes off the bed, hand goes in. | "Start with the $24 Fit Kit." FitSlice. |
| 5 | "Count your spin." | Rev Spinner released onto carpet, bars flicker, a hand counts seconds on fingers. Voice: "Lift it, spin it, count it. Fingers-only release practice." | "Rev Spinner, $45. Pair, $119." FitSlice. |

Companion banner and call-to-action button: "Enter your sheet". If a creator's footage is ever used in a paid placement, the clip opens with the creator's spoken disclosure ("FitSlice sent me this trainer, printed from my own drill sheet, free of charge."), the placement is marked as a paid partnership, and the creator has approved the cut in writing.

---

## 8. Landing page

One page carries the funnel: hero with the primary line and the ten-second explanation, the configurator embedded above the fold or one click away (test 1 and 2 decide), the six drills, the product cards with prices, the fit guarantee, the no-sheet path, and the safety line ("Swing-and-hold and carpet drills only. Never throw it.").

Site copy is in `marketing/02-website-copy.md`. The configurator is at https://claude.ai/artifact/1fiDeAkPe9RPJSyBWruE2p until it is hosted on the FitSlice domain; ads must land on the FitSlice domain so that events, pixels and the 45-day attribution window work.

Instrumentation that must exist before the first paid dollar: the five events in Section 1.1 with fit-sheet ID and product type as parameters; purchase value; UTM capture on every entry; the fit sheet written to the order as line-item properties; a weekly print log (printer, part, start, finish, pass or fail, bore check) that the dashboard reads.

---

## 9. Landing-page A/B test plan: five tests

Run one test at a time on the full traffic. The decision metric is named before the test starts and is the only metric that decides. Sample sizes below are per arm at 95% confidence and 80% power; at the year-one traffic of 6,000 to 9,000 visits a month, a test on fit-sheet completion takes four to eight weeks, and a test on purchase rate cannot be powered in year one (about 20,000 visits per arm to see 1.0% move to 1.3%), so purchase rate is read as a guardrail only.

| # | Test | A (control) | B | Decision metric | Guardrail | Sample per arm | Expected duration |
|---|---|---|---|---|---|---|---|
| 1 | Primary call to action | "Enter your drill sheet" opens the configurator | "Start with the $24 Fit Kit" opens the Fit Kit product page, configurator second | Visit to fit sheet completed (baseline 10%; detect 10% to 12%) | Visit to any order does not fall | 3,850 | 5 to 6 weeks |
| 2 | Hero media | 15-second thumb-pop clip, muted autoplay, configurator one scroll down | Live configurator embedded above the fold, clip beside it | Visit to configurator session (baseline 30%; detect 30% to 35%) | Fit-sheet completion among sessions does not fall | 1,400 | 2 weeks |
| 3 | Headline | "Your drill sheet, off the ball." with the ten-second explanation as subhead | The ten-second explanation as the headline, the primary line as subhead | Visit to fit sheet completed (10% to 13%) | Bounce rate | 1,800 | 3 weeks |
| 4 | Price presentation on the product card | Pair $119 selected by default; Puck $89 and Spinner $45 as alternatives | Puck $89 selected by default with "Add the Spinner for $30" | Revenue per fit-sheet completer (sheet-to-order baseline 21%; detect 21% to 26%) | Fit Kit attach rate | 1,150 sheet completers | 8 to 10 weeks |
| 5 | The no-sheet path | Block under the configurator: "Don't have your drill sheet? Your pro shop does. Here's exactly what to ask for," with a copyable request text and an email capture to save progress | Block: "Don't have your drill sheet? Join the list for the no-sheet fit option," email capture, no script | Share of no-sheet clickers who return and complete a sheet within 14 days (email-matched) | Fit Kit orders from the no-sheet segment | 400 no-sheet clickers | 6 to 8 weeks |

Order: 2, then 3, then 1, then 5, then 4. Test 2 is fast and sets the page shape the others run on. Test 5 answers the business plan's Risk 7 (can the customer produce a drill sheet) with behavior instead of a poll, and its result feeds the pro-shop program directly. Test 4 waits until orders are frequent enough to read.

Every variant uses only green and yellow claims. A variant is not allowed to win by making a claim the control is not allowed to make.

---

## 10. KPI dashboard: twelve metrics

Reviewed every Monday for the trailing seven days and the trailing four weeks. Three target phases follow the model: Launch (weeks 1 to 12, December to February), Build (weeks 13 to 30, March to July), Season 2 (weeks 40 to 52, August to October). Sources: site analytics events (Section 1.1), the order system with fit-sheet line-item properties, the ad platforms' spend, and the print log.

| # | Metric | Formula | Launch | Build | Season 2 | Why it is on the board |
|---|---|---|---|---|---|---|
| 1 | Visits | Sessions on the FitSlice domain, all sources | 1,600 a week | 1,800 a week | 3,000 a week | Top of the funnel; the model's traffic line |
| 2 | Configurator session rate | `configurator_session` ÷ visits | ≥ 30% | ≥ 30% | ≥ 32% | Whether the page gets people to type |
| 3 | Fit-sheet completion rate | `fit_sheet_complete` ÷ `configurator_session` (also shown ÷ visits) | ≥ 33% (≥ 10% of visits) | ≥ 33% | ≥ 35% | The Risk 7 number. The whole business turns on it |
| 4 | Sheet-to-order rate (30 days) | Orders of any product within 30 days ÷ `fit_sheet_complete` | ≥ 21% | ≥ 21% | ≥ 23% | Sum of the Fit Kit (15%), direct Pair (3%) and Digital (3%) assumptions |
| 5 | Fit Kit to Pair (45-day cohort) | Pairs matched to a Fit Kit within 45 days ÷ Fit Kits in that cohort | ≥ 50% on the first 40-kit cohort | ≥ 50% | ≥ 55% | The credit mechanism either works or it does not |
| 6 | Visit to Pair (blended, 45-day) | Pairs ÷ visits, trailing 45 days | ≥ 0.8% | ≥ 1.0% | ≥ 1.05% | The one-number funnel health check |
| 7 | Paid cost per Pair | Paid spend ÷ paid-attributed Pairs (45-day click window) | ≤ $84 (ceiling) | ≤ $70 | ≤ $60 (target) | Breakeven is $84 gross profit; scaling needs $60 |
| 8 | Paid cost per fit sheet | Paid spend ÷ paid-attributed `fit_sheet_complete` | ≤ $10 | ≤ $8 | ≤ $6.50 | Early proxy for metric 7; readable in week 2 |
| 9 | Revenue per visit | Revenue ÷ visits, trailing four weeks | ≥ $1.10 | ≥ $1.35 | ≥ $1.53 | Compared with blended cost per paid visit to see whether paid can ever pay |
| 10 | Gross margin per Pair | (Pair price − measured landed cost) ÷ Pair price, from the print log and fee statements | ≥ 65% | ≥ 68% | ≥ 70% | The $35 landed cost is an assumption until the log says otherwise |
| 11 | Printer utilization and backlog | Printer-days used ÷ (printers × 25); open orders ÷ weekly capacity, in weeks | 60 to 80%; backlog ≤ 1.5 weeks | 60 to 85%; ≤ 1.5 weeks | 70 to 85%; ≤ 1.5 weeks | Above 80% for two weeks fires the printer rule in Section 2.3 |
| 12 | Fit remake and refund rate | (Reprints under the fit guarantee + refunds) ÷ Pairs shipped | ≤ 8% | ≤ 5% | ≤ 4% | The product's promise is the fit. Above 15% stops marketing until Study 1 is rerun |

Also tracked below the twelve, weekly, without targets until the data exists: active pro shops and sheets entered per shop; Digital share of fit sheets; Puck-only and Spinner-only share of orders; search-terms report additions to the negative list; median order-to-ship days.

---

## 11. Stop or double down: the decision rules

One page. Read at weeks 8, 16 and 26 after the shop opens, and any Monday a stop trigger fires. Each rule names the signal, the minimum data before it counts, and the action. Where rules conflict, a stop beats a hold and a hold beats a double down.

### 11.1 Stop (pause the line, keep organic and pro shops running)

| Signal | Minimum data | Action |
|---|---|---|
| Paid cost per Pair above $84 on the trailing eight weeks | $3,000 spent and 2,000 paid visits | Pause prospecting (Meta A1/A2 and YouTube A3). Keep search and retargeting. Re-read at week 16 with the test results in |
| Paid cost per fit sheet above $12 for four consecutive weeks on any line | 300 clicks or $75 on that line | Pause that line. Move its budget to retargeting for the rest of the month |
| Fit-sheet completion below 5% of visits after tests 2 and 3 have reported | Both tests complete | Stop all prospecting. The problem is the sheet, not the ad. Fund test 5 and the pro-shop program instead |
| Fit remake and refund rate above 15% | 40 Pairs shipped | Stop all paid spend and all creator seeding until Study 1 (30 pucks measured) passes with a bore standard deviation under 0.1 mm and a per-printer offset applied. The fit promise is the product |
| Study 1 not passed | Before the shop opens | No paid spend of any kind. Business-plan Part 7 names this as the gate before marketing spend; this document agrees |
| Fit Kit to Pair below 30% on the first 40-kit cohort | 40 kits aged 45 days | Pause Fit Kit-led ads (Meta variant 3, Search headline 5). Rework the Fit Kit email sequence and the credit presentation; re-read on the next 40 |
| Any complaint, platform rejection or counsel note that an ad implies a rev, hook, average or injury result | One instance | Pull the ad the same day. Review every live asset against Part 6 before anything resumes |

### 11.2 Hold (spend flat, keep testing)

Anything between the stop and double-down lines. Specifically: paid cost per Pair between $60 and $84; fit-sheet completion between 5% and 10% of visits; Fit Kit to Pair between 30% and 50%; printer utilization between 60% and 80%. In a hold, budget stays at the current step, the next A/B test starts, and the search-terms report is worked weekly. A hold that lasts past week 26 is a stop for prospecting, with the budget redirected to creator seeding and tournament booths, which the business plan ranks above paid in any case.

### 11.3 Double down

| Signal | Minimum data | Action |
|---|---|---|
| Paid cost per Pair at or under $60 for four consecutive weeks | 1,500 paid visits in the window | Raise the budget one step ($1,500 to $3,000, then to $5,000). Never more than one step a month; conversion lags spend by two to five weeks |
| Paid cost per fit sheet at or under $6.50 on a line for four weeks | 300 clicks on that line | Raise that line's share within the step by 50% |
| Fit Kit to Pair at or above 50% on a 40-kit cohort | 40 kits aged 45 days | Lead with the Fit Kit everywhere: retargeting, search headline 5, the product card default. The credit is doing its job |
| Fit-sheet completion at or above 12% of visits | Trailing four weeks, 4,000 visits | Shift prospecting from A1 (interests) to A2 (lookalike of completers); the seed is now large enough and the trait is proven |
| Printer utilization above 80% for two weeks with backlog at or above 1.5 weeks | Two consecutive weekly reads | Buy a printer the same day. Payback is inside a month |
| Orders from referrals, reprints on new sheets and pro shops at or above 25% of Pairs | Trailing eight weeks | The flywheel is turning without ads. Hold paid flat and put the next increment into the pro-shop program and creator seeding |
| Digital above 5% of fit sheets | Trailing four weeks | Add Group 4 search budget and an international landing page for Digital; it is the only line that scales without a printer |

### 11.4 What would make us stop the paid program entirely

If, at week 26, prospecting has never held a cost per Pair under $84 for four consecutive weeks on at least $6,000 of spend, while creators, community, search and pro shops are delivering 80% or more of Pairs, paid prospecting ends. Search and retargeting continue at $650 a month because they harvest demand the other channels create. The freed budget goes to seeded units and a tournament booth. That outcome is not a failure of the plan; it is the plan's own channel ranking confirmed by data.

---

## 12. Assumptions register

Every assumption in this document, where it came from, and what replaces it.

| Assumption | Value used | Source or reasoning | Replaced by |
|---|---|---|---|
| Prices | Fit Kit $24 credited, Puck $89, Spinner $45, Pair $119, Digital $29/$39, pro-shop margin 25% | Business plan Part 5.1 | Pricing decision after the pilot and the willingness-to-pay test in Part 12 |
| Digital blend | $35 (60% pair files, 40% puck files) | Our guess | Measured mix after 50 Digital orders |
| Funnel rates | 30% / 33% / 15% / 50% / 3% / 3% | Section 1.2 reasoning | Trailing four weeks once each stage has 200 entries |
| Blended paid cost per visit | $1.00 | Niche hobby audience; search $1.15, Meta $0.90, retargeting $0.75, YouTube counted by view | Two weeks of platform data |
| Pair landed cost | $35, shipping charged separately | Business plan 5.2 cost stack: filament about $9.90 for 395 g, machine time about $3.50, labor about $8.50 for two parts, packaging and cord $3.50, direct-web payment fees about $4; rounded up | Print log and fee statements; changes if shipping is built into price |
| Fit Kit landed cost | $8 | 97 g filament, tape, card, machine, labor | Print log |
| Printer output | 25 Pairs per printer per month; Pair = 1 printer-day; Fit Kit = 0.25 printer-day | Business plan 5.2 (one puck per printer per day, 25 to 30 a month); slicer times in X6 | Real print logs on the production printer |
| Printer cost and payback | $600; inside first month of sold output | Business plan 5.2 | Purchase receipts |
| Print-partner price | $0.07 to $0.10 per gram | Business plan X4 | Three quotes before launch |
| Seasonality | 0.85 May, 0.70 June and July, 0.90 August, 1.10 September and October | League season September to April; summer unknown (Part 12) | Year-one monthly data |
| Creator traffic | 4,000 and 5,000 visits for the first two videos, tail 1,500 to 2,500 a month | Our estimate against the subscriber counts in Part 8; no conversion data exists for these channels (Part 12) | Link and code tracking from the creator program |
| Pro-shop ramp | 1 shop in Month 3 to 22 in Month 12, two Pairs per shop per month | Our estimate; the plan says to call 20 shops first (Part 12) | Shop onboarding log |
| Gross profit per Pair | $84 (71%) | $119 less $35 | Measured margin, metric 10 |
| Attribution window | 45 days click | Fit Kit to Pair lag of two to five weeks | Measured lag distribution |

---

## 13. What the founder must decide or supply

1. **Study 1 result.** Thirty pucks measured, standard deviation per bore, per-printer offset. No paid spend before this passes. Date it.
2. **Shipping.** Charged separately (modeled) or built into a $99 Puck and a higher Pair price. Changes landed cost, gross profit per Pair and the $84 ceiling.
3. **Brand-name clearance.** FitSlice must clear the register and common-law use before it goes into an ad account, a domain or a package. Every asset here assumes the name holds.
4. **Hosting.** The configurator and the landing page on the FitSlice domain with the five events firing, before the first ad. Ads cannot run to the claude.ai preview.
5. **Counsel review of this document's ad copy** against Part 6 and the FTC endorsement and substantiation rules listed in business-plan Part 9, before anything goes live.
6. **Print-partner quotes** (three) and the decision on how Fit Kits are handled for outsourced orders (Section 2.3).
7. **Pro-shop calls.** Twenty shops asked whether they will enter a customer's sheet into our tool. The 22-shop ramp in Section 3 is a guess until then.
8. **Budget step approvals.** The founder approves each step from $1,500 to $3,000 to $5,000 against Section 11, in writing, with the four-week numbers attached.
9. **The ball-manufacturer negative-keyword list** in the ad account, maintained by whoever runs it, never in a public document.
10. **Pilot timing.** Study 3 results (Month 6) decide whether any claim moves from red to yellow. Until then this document's copy does not change, however good the early numbers look.
11. **Real cost per visit by platform** after two weeks, and the funnel rates after each stage reaches 200 entries, pasted into the assumptions register so the tables are rerun.
12. **`[PATENT STATUS]`** stays as written in every asset until counsel says what may be said. **`[QUOTE PLACEHOLDER — name]`** stays until a named coach has said the words and agreed to the disclosure.

---

## 14. Compliance checklist for every paid asset

Before an ad, a landing-page variant or a retargeting message goes live, someone other than its author checks each line.

- The claim is on the green list, or on the yellow list with its exact qualifier ("designed for", "practice", "to our knowledge", "help keep the feel").
- No number for revs, hook, average or pins, and no implied result ("more revs in 30 days", "see the difference on the lane"). Attributed coaching consensus is stated as coaching consensus.
- No ball-company name, model name or trade dress anywhere in copy, image, video or landing page.
- No "patented", "patent pending", or governing-body approval, endorsement or recommendation.
- Every creator, coach or shop that appears carries the matching disclosure line, first, in words a phone screen shows without expanding.
- No testimonial, review count, star rating or customer name that has not actually happened and been cleared.
- The product is called a trainer, slice, puck, disc or plate. Never a ball, a mini ball or regulation anything.
- The safety line is on the landing page: swing-and-hold and carpet drills only, never throw it, not for children under 12 without supervision.
- The call to action lands on the FitSlice domain with events firing.
- `[PATENT STATUS]` and `[QUOTE PLACEHOLDER — name]` are absent from anything live.
