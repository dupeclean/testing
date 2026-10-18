# FitSlice Pro Shop Program

Working draft, October 2026. Everything a pro shop sees, signs or hears from us is in this file: the program design, the sell sheet, the wholesale terms, the outreach emails, the counter script, the counter card, the operator FAQ, the pitch to certified operators, the Bowl Expo booth plan, the onboarding checklist and the incentive math.

How to use this file:

- Source of truth for every claim is `docs/business-plan.md` (Part 6, claims) and `README.md` (parts, drills). Language follows `marketing/01-brand-platform.md`. Prices, guarantee terms and reprint prices match `marketing/02-website-copy.md`.
- `[PATENT STATUS]` marks the one place a legal status line may go once counsel supplies the wording. Leave it out until then.
- `[QUOTE PLACEHOLDER — name]` marks where an operator quote goes once that operator has actually said it and agreed to its use. Ship the asset without the block until then. A quote from an operator who has a free unit, a code or a margin runs with the matching disclosure line beside it.
- `{{field}}` is a merge field filled from the shop record.
- The configurator lives at https://claude.ai/artifact/1fiDeAkPe9RPJSyBWruE2p until it is hosted on the site. Every link labeled "configurator" below points there.
- Shops talk to us at shops@fitslice.com. Bowlers talk to us at support@fitslice.com.

Claims discipline for everything a shop says on our behalf: product facts and attributed coaching views only. No number for revs, hook, pins or average. No ball-company names. No governing-body approval. Every shop mention carries the disclosure line: "This shop earns a margin on FitSlice orders entered here."

---

## 1. Program design

### 1.1 The idea in one paragraph

A pro shop already holds the two things FitSlice needs: the bowler's drill sheet and the bowler's trust. The program asks the shop to do one two-minute task at the counter, enter the sheet into the configurator and submit the order with its shop code. We print the part to that sheet, check it, and drop-ship it to the shop or to the bowler. The shop earns 25% of the order. The shop stocks nothing, sizes nothing and shelves no returns. It copies the fit the shop sold. It does not change it, and when the fit changes the bowler needs a new sheet from the shop before we print again.

### 1.2 The counter flow

1. **Pull the sheet.** The bowler asks, or the operator offers after a drilling or a re-fit. The operator pulls the bowler's drill sheet from the file or the fitting software.
2. **Enter it.** The operator opens the configurator on the counter tablet or PC and enters: hand (right or left), thumb style (through or blind), thumb, middle and ring hole sizes, middle and ring spans, and forward/reverse and lateral pitch for each hole. Fractions go in as written on the sheet: 55/64, 1 1/32, 4-1/2. Inches or millimetres. The model rebuilds in about 100 ms and the 3D preview draws every hole axis, so the bowler sees their own grip and their pitches before anything is ordered. The configurator warns if two bores would break into each other.
3. **Export the fit sheet.** The configurator saves the fit sheet with the model. That file is what we print from and what the fit guarantee is measured against.
4. **Submit the order.** On the Pro Shops order form, the operator enters the shop code, the product (Rev Puck, Rev Spinner, Pair, Fit Kit or Digital Files), the bowler's name and email, the ship-to (shop pickup or bowler's address) and attaches the fit sheet. Under Counter Sale the shop rings the sale at the counter; under Referral the bowler pays FitSlice on the form. Section 3 explains both.
5. **We confirm.** Within one business day we send the shop and the bowler an order confirmation with the ship date and a copy of the fit sheet as entered. Any correction is free before printing starts.
6. **We print, check and ship.** PETG, four walls, 20% infill, flat side down. Bores are smoothed and measured against the sheet before packing. Tracking goes to the shop and the bowler.
7. **The shop stays the fit authority.** Fit questions, re-fits and new sheets go back to the shop. By our estimate a reprint from a new sheet costs less than a re-drill, and it starts with a visit to the counter.

Time at the counter: about two minutes to enter and preview a sheet the operator can read at a glance, three to four with a bowler who wants to look at the preview. No part of the flow requires the operator to measure anything they have not already measured.

### 1.3 Two ways for a shop to get paid

| | Counter Sale (default) | Referral |
|---|---|---|
| Who the bowler pays | The shop, at the counter | FitSlice, on the order form |
| What the shop earns | Keeps the difference between its selling price and wholesale (75% of MAP). At MAP that is 25% | 25% of the order value, paid monthly |
| When the shop is billed or paid | Card on file charged at wholesale when the order ships | Commission statement and ACH payout by the 10th of the following month |
| Seller of record and sales tax | The shop | FitSlice |
| Best for | Shops that want the sale on their register and the bowler's receipt from them | Shops that do not want to handle money for a drop-shipped item |

Either way the shop code is on the order and the shop is credited.

### 1.4 The shop code stays with the bowler

The shop code is attached to the bowler's fit sheet on our side. For twelve months from the first order, every reorder or reprint from that fit sheet earns the shop its 25%, even when the bowler orders from home. The shop entered the fit; the shop earns on the fit. Because the shop is credited for orders placed with its code, the order form and the confirmation email tell the bowler: "This shop earns a margin on FitSlice orders entered here."

### 1.5 The optional in-store sizer plate demo

Every onboarded shop receives one counter kit at no cost: a printed sizer plate, 25 counter cards, one shelf talker and the shop code. The sizer plate is a flat printed plate with labeled test bores in 1/64" steps across the common adult range. A bowler puts a finger in it and finds the bore that is snug at the first joint with no squeeze.

What the plate does for the shop:

- It starts a fit conversation in thirty seconds. A bowler at the counter trying bores is a bowler asking about their grip.
- It lets a bowler test the thing they will check first, which is whether a printed bore feels like their hole. The plate is printed on the same printer and in the same material as the trainer, so it shows how each bore size feels in the part we print.
- It gives the shop a reason to pull the sheet.

What the plate does not do: it does not measure spans or pitches and it does not replace the shop's fitting tools. It calibrates hole size on a printed part. Spans and pitches come from the shop's sheet.

The demo is optional. A shop that prefers a cards-only presence gets the cards and the code and enters sheets without the plate.

### 1.6 Capacity and cohorts

We print to order, and one printer yields about 25 to 30 pucks a month. Shops are onboarded in cohorts matched to printer capacity, and the current lead time is published to every active shop each Monday. We would rather tell a shop "next cohort opens in six weeks" than miss a ship date on a bowler's first order.

### 1.7 What we ask the shop to say and not say

Approved lines a shop may use in any medium:

- "Your drill sheet, off the ball."
- "It's the part of your ball your hand touches, printed with your exact holes, so you can practice your release anywhere."
- "Printed to your pro shop's numbers."
- "Built from your sheet, in 64ths."
- "Reproduces your drill sheet: hole sizes in 1/64" steps, both spans, forward/reverse and lateral pitch for every hole, on a regulation 8.5" ball radius."
- "Coaches agree the thumb must leave first, and a relaxed hand creates more revs."
- "Designed for fingertip grip holds in the exact position you bowl in. Add weight on the cord for strength work."
- "Practice a clean, early thumb exit."
- "Unlike generic one-size trainers and S/M/L wrist braces, it is built from your fit."
- "This shop earns a margin on FitSlice orders entered here."

Lines a shop may not use on our behalf: any number for revs, hook, pins or average; "improves", "increases", "fixes", "prevents", "adds"; any ball company's name in a comparison; "approved", "endorsed" or "recommended" by any governing body or association; "patented" or "patent pending"; "exact fit" about the printed part; "the first" or "the only" without "to our knowledge"; "builds strength".

---

## 2. One-page sell sheet (text layout)

```
================================================================================
FITSLICE PRO SHOP PROGRAM
Your drill sheet, off the ball.
================================================================================

YOU ALREADY WROTE THE SHEET. ENTER IT ONCE, EARN 25%, STOCK NOTHING.

FitSlice prints a bowler's training aid from the drill sheet in your drawer.
You enter it at the counter, we print and drop-ship, you earn 25% of the order.

--------------------------------------------------------------------------------
WHAT IT IS
--------------------------------------------------------------------------------
It's the part of your ball your hand touches, printed with your exact holes,
so you can practice your release anywhere.

A slice with the curvature of a regulation 8.5" ball, built from the bowler's
own drill sheet: hole sizes in 1/64" steps, both spans, forward/reverse and
lateral pitch on every hole, right or left hand, through or blind thumb.
Holes are aimed at the ball's center the way a zero-pitch hole is drilled,
so thumb and fingers oppose each other exactly as on the ball. About 300 g
in PETG at 20% infill, with a weight pocket and a wrist-cord tunnel.

Rev Puck      The part the bowler holds. Fingertip carries, thumb pops,
              swing sync, cupped-wrist holds.
Rev Spinner   A fingers-only disc from the same surface. Lift it, spin it on
              carpet, count the engraved bars.
Fit Kit       A sizer plate in 1/64" steps printed on the printer that will
              print the part. $24, credited toward a trainer.

--------------------------------------------------------------------------------
HOW IT WORKS AT YOUR COUNTER
--------------------------------------------------------------------------------
1. Pull the bowler's sheet.
2. Enter it in the free configurator. The grip appears in 3D in about
   a tenth of a second, hole axes drawn.
3. Submit the order with your shop code. We print, check every bore against
   the sheet, and ship to you or to the bowler.

Two minutes at the counter. No stock. No sizes. No returns to shelve.

--------------------------------------------------------------------------------
WHAT YOU EARN
--------------------------------------------------------------------------------
Product              Retail (MAP)   Wholesale   Your 25%
Fit Kit              $24            $18.00      $6.00
Rev Spinner          $45            $33.75      $11.25
Rev Puck             $89            $66.75      $22.25
Pair (Puck+Spinner)  $119           $89.25      $29.75
Digital Files        $29 / $39      $21.75 / $29.25   $7.25 / $9.75

Quarterly volume bonus: 15 to 29 units in a quarter adds 2.5% on the quarter;
30 or more adds 5%. Your code stays on the bowler's fit sheet for twelve
months, so reorders earn you too.

--------------------------------------------------------------------------------
IT COPIES THE FIT YOU SOLD. IT DOES NOT CHANGE IT.
--------------------------------------------------------------------------------
The pro-shop trade body puts hole size at about 20% of a fit; span and pitch
are 40% each. We copy all three from your numbers. When the fit changes, the
bowler needs a new sheet from you before we print again. Fit questions come
back to your counter.

What we do not claim: any rev-rate, hook or average result, or a measured
printed fit. Nobody has measured off-lane trainers, including us, and we
have not yet published measurements of printed holes. A 30-day fit
guarantee carries the risk instead: if the part misses the sheet, we
reprint free.

--------------------------------------------------------------------------------
[QUOTE PLACEHOLDER — operator name, shop, city]
[Beside any quote: the operator's free unit, code or margin, in the standard
disclosure line.]
--------------------------------------------------------------------------------

THE COUNTER KIT, FREE WITH ONBOARDING
One sizer plate for the counter. 25 counter cards. One shelf talker.
Your shop code. A fifteen-minute setup call where we enter the first sheet
with you.

Configurator: https://claude.ai/artifact/1fiDeAkPe9RPJSyBWruE2p
Shops: shops@fitslice.com

[PATENT STATUS]
Disclosure line for every shop display: "This shop earns a margin on
FitSlice orders entered here."
================================================================================
```

---

## 3. Wholesale terms sheet

Effective for shops onboarded from the date on the shop agreement. FitSlice may revise these terms with 30 days' written notice to active shops; orders already confirmed ship on the terms in force when they were confirmed.

### 3.1 Products and pricing

| Product | Retail list and MAP | Wholesale (75% of MAP) | Shop margin at MAP |
|---|---|---|---|
| Fit Kit (sizer plate, bowler's tape, fitting card) | $24, credited toward a trainer | $18.00 | $6.00 |
| Rev Spinner | $45 | $33.75 | $11.25 |
| Rev Puck | $89 | $66.75 | $22.25 |
| Pair (Rev Puck and Rev Spinner, one fit sheet) | $119 | $89.25 | $29.75 |
| Digital Files, Rev Puck | $29 | $21.75 | $7.25 |
| Digital Files, Pair | $39 | $29.25 | $9.75 |

**Fit Kit credit.** When a bowler who bought a Fit Kit orders a trainer, the $24 is credited against the trainer. The shop's earnings on the Fit Kit are not clawed back, and the shop earns 25% of what the bowler pays on the trainer order. A bowler who buys a Fit Kit and then a Rev Puck earns the shop $6.00 and then $16.25, which is $22.25, the same 25% of $89.

### 3.2 Margin and payment

- **Counter Sale.** The shop is the seller of record and sets its own in-store price. FitSlice invoices the shop at wholesale plus shipping when the order ships and charges the card on file. After 90 days and ten shipped orders with no failed payments, a shop may request Net 15 invoicing.
- **Referral.** FitSlice is the seller of record. The bowler pays on the order form. FitSlice pays the shop 25% of the order value, less any refund, by ACH by the 10th of the following month for orders shipped in the prior month, with a statement listing each order by order number. There is no minimum payout.
- **Volume bonus.** Counted per calendar quarter across both payment methods: 15 to 29 shipped units earn an additional 2.5% of that quarter's order value at retail; 30 or more earn an additional 5%. Paid as a credit on the next wholesale statement or added to the next commission payout. Fit Kits and Digital Files count as units.
- **Reorder attribution.** The shop code attaches to the bowler's fit sheet for twelve months from the first order. Reprints and reorders from that fit sheet in that period are credited to the shop at the same rates.

### 3.3 Minimum advertised price (MAP)

FitSlice sets this policy unilaterally. Any price a shop advertises for a FitSlice product, in any medium (website, marketplace listing, social post, email, print, in-store signage), must be at or above MAP, which is the retail list price above. The policy concerns advertised prices only; a shop sells at the counter at any price it chooses. Bundling a FitSlice product with a drilling or a fitting service is fine as long as no FitSlice price below MAP is shown. First violation: written notice. Second: shop code suspended for 30 days. Third: program ended.

### 3.4 Lead time and shipping

- Order confirmation, with the ship date and the fit sheet as entered, within one business day of submission. Corrections are free before printing starts.
- Standard lead time is five business days from confirmation to ship. In peak months (September, October, January) it can run longer. The current lead time is published to active shops every Monday. No rush service is offered at launch.
- Shipping is a flat $9 per shipment within the United States, to the shop or to the bowler, as chosen on the order. Pairs ship free. Shop pickup is encouraged: it brings the bowler back to the counter with the part in hand.
- Transit time is in addition to lead time. Tracking goes to the shop and the bowler.

### 3.5 Guarantee, returns and reprints

- **30-day fit guarantee.** Every part is checked against the fit sheet on the order before it ships. If the part does not match that sheet within the configurator's print allowance, FitSlice reprints it free, shipping included, when told within 30 days of delivery. The bowler keeps the first part.
- **Sheet entered wrong.** If the part matches the fit sheet but the sheet does not match the ball, FitSlice reprints at the reduced reprint price: $25 for a Rev Puck, $15 for a Rev Spinner, $35 for a Pair, shipping included. Under Counter Sale the reprint is billed to the shop at those prices; the shop decides whether to pass it on. The confirmation step in 3.4 exists to make this rare.
- **Returns.** Rev Puck, Rev Spinner and Pair are personalized goods made to the bowler's measurements and are not returnable for refund. The fit guarantee is how we make them right. Fit Kits are returnable unused within 30 days. Digital Files are not refundable; files that do not match the fit sheet or will not open are regenerated free.
- **Damaged in transit.** Photograph the box and the part within 7 days of delivery. We reprint and reship free.
- **Fit changes after the order.** Not covered. A reprint from the new sheet is available at the reduced reprint prices above and earns the shop its 25%.

### 3.6 Exclusivity

None. FitSlice sells direct through its own site and the configurator, through online retailers, and through every participating shop. No shop receives a territory, and no shop is asked to carry FitSlice exclusively. What every active shop does receive is a listing on the Pro Shops page ("Where to get your sheet entered") with name, address, hours and a link, and the reorder attribution in 3.2.

### 3.7 Co-op and support

- **Counter kit**, free at onboarding: one sizer plate, 25 counter cards, one shelf talker, the shop code. Card refills free on request. A replacement sizer plate free once a year, or sooner if the shop reaches 15 units in a quarter.
- **Co-op advertising.** FitSlice reimburses 50% of a shop's approved local advertising of FitSlice products, up to 5% of the shop's prior-quarter FitSlice order value at retail. Pre-approval by email is required and the copy must come from Section 1.7 or from `marketing/01-brand-platform.md` and must carry the disclosure line from 3.8. Proof of placement and the invoice are due within 30 days.
- **Event support.** For a shop's open house, league night or clinic, FitSlice lends two additional sizer plates and sends 50 extra cards, and supplies approved social templates that carry the disclosure line.
- **Onboarding call.** Fifteen minutes, by video. We enter the first sheet together.

### 3.8 Conduct

- Claims: shops use the approved lines in Section 1.7 and make no rev-rate, hook, average or injury claims, name no ball company in a comparison, and claim no approval, endorsement or recommendation by any governing body or association.
- Disclosure: every shop display, post or mention carries "This shop earns a margin on FitSlice orders entered here." In a post or video it is the first line, and in a video it is also spoken aloud. A shop that received a free unit also uses: "FitSlice sent me this trainer, printed from my own drill sheet, free of charge."
- Safe use: shops tell bowlers to use the parts for swing-and-hold and carpet-release drills only, never to throw them, and to supervise children under 12.
- Data: a drill sheet is personal data tied to a bowler's hand. The shop obtains the bowler's consent before entering it, and FitSlice stores it with the order, states its retention period, and deletes it on the bowler's request.
- Not a ball: shops do not describe the product as a ball, a mini ball or regulation equipment, and do not suggest it is used in competition.

### 3.9 Term

Either party may end the program with 30 days' written notice. Orders confirmed before the notice ship as confirmed, commissions owed are paid, and the shop code is deactivated at the end of the notice period. The shop returns or discards counter materials carrying the FitSlice name.

---

## 4. Outreach sequence to pro-shop owners

Three emails, each under 150 words in the body. Send from the founder's own address. Day 0, day 7, day 21. Stop the sequence the moment a shop replies. Each email ends with an opt-out line and the postal address (commercial email rules apply to emails to businesses too). A "stop" reply ends all contact at once.

### Email 1 (day 0, cold)

Subject: The drill sheet in your drawer

Hi {{first_name}},

I'm {{founder_name}} from FitSlice. We print a bowler's training aid from their drill sheet: a slice with the curvature of a regulation 8.5" ball, with their hole sizes in 1/64" steps, both spans and every pitch, so they can practice the grip and thumb exit off the lane.

Here is the pro-shop part. You enter the sheet at the counter in our free configurator, we print and drop-ship, and you earn 25%. No stock, no sizes, no returns to shelve. It copies the fit you sold. It does not change it, and fit questions come back to you.

The configurator is at https://claude.ai/artifact/1fiDeAkPe9RPJSyBWruE2p. Type in any sheet and the grip appears in 3D in about a tenth of a second.

Can I send you the one-page sell sheet and terms?

{{founder_name}}
FitSlice
Reply "stop" and I will not write again. {{postal_address}}

### Email 2 (day 7, follow-up with the counter-demo offer)

Subject: A sizer plate for your counter

Hi {{first_name}},

Following up on FitSlice. I'd like to put a demo on your counter at no cost: one printed sizer plate with test bores in 1/64" steps, a stack of counter cards and your shop code.

The plate does two things. Bowlers put their fingers in it and find their size in thirty seconds, which starts a fit conversation at your counter. And it is printed on the same printer and material as the trainer, so it shows how each bore size feels in the part we print.

I will enter the first sheet with you over a fifteen-minute call and you can watch the model build. From then on it is a two-minute counter task that pays you 25% of the order.

Which afternoon this week or next works for a call?

{{founder_name}}
FitSlice
Reply "stop" and I will not write again. {{postal_address}}

### Email 3 (day 21, break-up)

Subject: Closing the file on this

Hi {{first_name}},

I have written twice about FitSlice and have not heard back, so this is my last note. Either the timing is wrong or the program is not for your shop. Both are fine.

If it is timing, the offer stands: a free sizer plate and counter cards, 25% on every order you enter, no stock. Reply "later" and I will check in next quarter.

If you would rather see it first, the configurator is free at https://claude.ai/artifact/1fiDeAkPe9RPJSyBWruE2p. Type in any drill sheet and the grip appears in 3D.

Thanks for reading, and good luck with league season.

{{founder_name}}
FitSlice
Reply "stop" and I will not write again. {{postal_address}}

---

## 5. Phone and walk-in script

Use the same script on the phone and in person. On the phone, ask for the operator by name and ask for two minutes. In person, go when the counter is quiet, carry a Rev Puck printed from a real sheet and a sizer plate, and put the puck on the counter before you say anything.

**Open (ten seconds).**
"I'm {{founder_name}} with FitSlice. It's the part of a bowler's ball their hand touches, printed with their exact holes, so they can practice their release anywhere. We print it from the drill sheet you already wrote. I have two questions to see if it fits your shop."

**Qualifying question 1.**
"How many fingertip drillings for one-handed, thumb-in bowlers do you do in a typical month?"

What it tells you: whether the shop has the customers. Ten or more a month means a steady stream of bowlers with a sheet worth entering. Fewer than five means the shop is mostly house-ball and conventional work, and the Rev Spinner is the product to offer there.

**Qualifying question 2.**
"When one of those bowlers comes back, can you pull their drill sheet at the counter?"

What it tells you: whether the shop has the data. A shop that keeps sheets on paper or in fitting software can enter an order in two minutes. A shop that drills from memory and the ball cannot, and the program will stall.

**If yes to both: the ask.**
"Then here is the program. You enter the sheet at the counter in our free configurator, we print it and drop-ship it to you or to the bowler, and you earn 25% of the order. You stock nothing. I'd like to send you a free counter kit, a sizer plate and cards with your shop code, and do a fifteen-minute call where we enter the first sheet together. Can I put you down for {{day}} or {{day}}?"

Hand over the puck. Let them put their hand in it. If they ask whose sheet it is, name the bowler or the operator who drilled it only if that person has agreed. Otherwise say it is a real sheet shared with permission. Then hand over the sizer plate and the sell sheet.

**If yes to one.**
Customers but no sheets on file: "Then start with the next bowler you fit. Enter the sheet while it is in front of you." Sheets but few thumb-in fingertip bowlers: "Then the Rev Spinner is your product. It is fingers only, so it serves your two-handers and your youth bowlers too."

**If no to both.**
"Then this is not for your shop right now. Thanks for the two minutes." Leave a card. Do not push.

**Objections you will hear.**

- *"I don't have time at the counter."* "Two minutes with the sheet in front of you. Or the bowler scans the card, enters it themselves at home with your shop code, and you still earn the 25%."
- *"Does this take drilling away from me?"* "It is built not to. It copies the fit you sold. It does not change it. When the bowler's fit changes they need a new sheet from you, and a reprint starts with a visit to your counter."
- *"Who handles problems?"* "We do. Thirty-day fit guarantee: if the part misses the sheet, we reprint free. Fit questions come to you, because you are the fit authority."
- *"Does it actually add revs?"* "Honest answer: nobody has measured off-lane trainers, including us. It lets a bowler practice the two things coaches say the release depends on, a relaxed hand and an early, clean thumb exit, in their own holes. We do not put a number on it, and we ask you not to either."
- *"What does it feel like?"* "Put your hand in this one. It is printed PETG, not coverstock, and the bores are smoothed. The bowler finishes the fit with tape, as on a ball."

**Close.** Confirm the call time, confirm the email address for the kit, and send Email 2's content as the confirmation within the hour.

---

## 6. Counter card and shelf talker

### Counter card, front (39 words)

**Your drill sheet, off the ball.**

FitSlice prints the part of your ball your hand touches, with your exact holes, so you can practice your release anywhere. Ask us.

This shop earns a margin on FitSlice orders entered here.

### Counter card, back (40 words, plus the disclosure line beside the shop code)

We enter your sheet at the counter: hole sizes in 1/64" steps, both spans, every pitch. Printed to order, shipped to you or held here. 30-day fit guarantee.

Rev Puck $89. Rev Spinner $45. Pair $119. Fit Kit $24, credited.

Design notes for the card: 4" x 6", heavy stock. Front shows the Rev Puck from above, the ball-surface curve obvious, three holes visible. Back carries a QR code to the configurator and a blank line for the shop code so a bowler who orders from home is still credited to the shop. The disclosure line, "This shop earns a margin on FitSlice orders entered here.", sits on the front and again next to the shop-code line on the back, because the shop earns on home orders placed with its code. It is set in the same size as the body text, never smaller.

### Shelf talker (sits beside the sizer plate)

**Find your size before you print your fit.**

Put a finger in the plate. The right bore is snug at the first joint with no squeeze needed to hang on. Note the label on that bore and tell us. Spans and pitches come from your drill sheet, which this shop keeps on file. Ask us to enter it.

This shop earns a margin on FitSlice orders entered here.

Design notes: 3" x 7" tent card or clip strip. The plate it sits beside is labeled by bore, so the shelf talker carries no sizes of its own.

---

## 7. Operator FAQ

**1. What am I actually selling?**
A made-to-order training aid. It is a slice with the curvature of a regulation 8.5" ball, built from your customer's drill sheet: hole sizes in 1/64" steps, both spans, forward/reverse and lateral pitch on every hole, right or left hand, through or blind thumb. The Rev Puck is the part they hold, about 300 g in PETG at 20% infill, with a weight pocket and a wrist cord. The Rev Spinner is a fingers-only disc from the same surface that spins on carpet. The Fit Kit is a sizer plate for finding hole sizes on our printer. It is a trainer. It is not a ball and is not used in competition.

**2. Does this cannibalize my drilling?**
It is built not to. It copies the fit you sold. It does not change it: the configurator takes your numbers and reproduces them. The pro-shop trade body puts hole size at about 20% of a fit and span and pitch at 40% each, and all three come from your sheet. When a bowler's fit changes, they need a new sheet from you before we print again, so a reprint begins with a visit to your counter. The sizer plate finds the size a printed bore needs to be on our printer; it does not measure spans or pitches and does not replace your fitting tools. We expect a bowler who practices in their own holes to have more reason to come back and talk about their fit. We have no shop data on that yet.

**3. How long does it take at the counter?**
About two minutes to enter a sheet you can read at a glance and preview it. Three to four if the bowler wants to look at the 3D preview and the hole axes. Fractions go in as written. The configurator warns if two holes would break into each other, so you see a mis-keyed pitch before you submit.

**4. What do I earn, and when?**
25% of the order at retail. Rev Puck $22.25, Rev Spinner $11.25, Pair $29.75, Fit Kit $6.00. Under Counter Sale you ring the sale and we bill you at wholesale when the order ships. Under Referral the bowler pays us and we pay you by ACH by the 10th of the next month. Quarterly volume bonus: 15 units adds 2.5%, 30 adds 5%. Your code stays on the bowler's fit sheet for twelve months, so reorders earn you too.

**5. Do I have to stock anything or buy an opening order?**
No. Every unit is printed to order from a sheet, so there is no inventory, no size run and no markdowns. The counter kit (sizer plate, 25 cards, shelf talker, shop code) is free. There is no minimum.

**6. Who ships, and where does it go?**
We do, from our printer. You choose on each order: to your shop for pickup or to the bowler's address. Flat $9 within the US; Pairs ship free. Standard lead time is five business days from confirmation to ship, longer in peak months, and we send you the current lead time every Monday. Tracking goes to you and the bowler.

**7. What if I enter the sheet wrong?**
First, you will usually catch it: the 3D preview draws the hole axes, and we send a confirmation with the sheet as entered within one business day, before printing starts. Corrections at that stage are free. If a wrong sheet gets printed, we reprint at the reduced reprint price ($25 Rev Puck, $15 Rev Spinner, $35 Pair, shipping included). If the part misses the sheet you entered, that is on us and the reprint is free under the 30-day fit guarantee.

**8. What happens when the bowler's fit changes?**
The file changes with it. Their fit sheet is stored with their order. You write the new sheet, enter it, and we reprint from it at the reduced reprint price. You earn 25% on the reprint. By our estimate a reprint costs less than a re-drill, and it keeps the bowler in your shop.

**9. What can I tell a bowler it does?**
Say what it is: their drill sheet reproduced on a slice of ball surface, so they can practice their grip and release anywhere. Say what coaches say: the thumb must leave first, and a relaxed hand creates more revs. Say what it is designed for: fingertip grip holds in the exact position they bowl in, with weight added on the cord for strength work, and practice of a clean, early thumb exit. Say how to use it safely: swing-and-hold and carpet-release drills only, never thrown, and children under 12 only with supervision. Do not say it adds revs, hook or pins, and do not quote a number. Nobody has measured off-lane trainers, including us, and we would rather you say that plainly than promise something we cannot show.

**10. Can I advertise it and sell it online?**
Yes, at or above MAP (the retail prices on the terms sheet), using the approved lines, with the disclosure line on every post or page: "This shop earns a margin on FitSlice orders entered here." We reimburse half of approved local advertising up to 5% of your prior-quarter FitSlice order value. Send the copy first.

**11. What about two-handed bowlers and interchangeable thumbs?**
Two-handed and thumbless bowlers use the Rev Spinner, which is fingers only. For a bowler with an interchangeable thumb system, enter the size of the hole the thumb actually goes into, with its pitches, and choose through or blind as drilled. The puck is one piece and does not accept an insert.

**12. Is it approved by any governing body, and is the design protected?**
It is a training aid used off the lane. It is not a ball, it is not used in sanctioned competition, and to our knowledge no governing-body approval applies to it. We do not claim any, and we ask you not to. [PATENT STATUS]

---

## 8. Pitch to certified operators

Written for operators who hold a pro-shop certification. Use as a letter, a talk track or the opening of a clinic session. It names the certification as a fact about the reader. It does not claim or imply that any association approves, endorses or recommends FitSlice.

### 8.1 The pitch

You spent the time to get certified because fit is a discipline. You measure to a sixty-fourth. You choose spans and pitches to suit one hand, and no size chart is involved. The trade body's own weighting says hole size is about 20% of a fit and span and pitch are 40% each, and your customers pay you because you get all three right.

Then that fit goes into one place: a fifteen-pound ball the bowler throws a few nights a week. Everything they practice off the lane, they practice in somebody else's holes. The soft practice balls come with one set. The wrist supports come in small, medium and large.

FitSlice puts your fit in their hand. We print the patch of ball surface the hand touches, at the real 8.5" radius, with your sheet in it: their sizes, both spans, every pitch, aimed at the ball's center the way a zero-pitch hole is drilled. About 300 g. It goes in a bag. They can hang it on their fingertips with a loose thumb, pop the thumb and catch the weight, and spin the fingers-only disc on the carpet. Coaches agree the thumb must leave first and a relaxed hand creates more revs. Those are hand skills. The puck is designed to let the hand practice them in its own geometry.

We are asking certified operators first because you are the people who can tell whether the bore feels right. Put your hand in one printed from your own sheet. If it does not feel like your ball, tell us, and we will show you where the numbers went.

What the program asks of you is two minutes at the counter and the sheet you already wrote. What it pays is 25% of every order, with no stock. What it leaves alone is your fitting. It copies the fit. It does not change it, and when the fit changes the bowler needs a new sheet from you.

What we do not say, and ask you not to say: any number for revs, hook or average. Nobody has measured off-lane trainers, including us. We plan a pilot and will publish the result whatever it says. We have also not yet published measurements of printed holes. Until then the 30-day fit guarantee carries the risk.

[QUOTE PLACEHOLDER — certified operator name, shop, city]
[Beside any quote: the operator's free unit, code or margin, in the standard disclosure line.]

### 8.2 The certified-operator cohort offer

For the first ten certified operators who onboard:

- A Rev Puck printed from the operator's own drill sheet, free. If the operator posts about it, the post opens with two lines: "FitSlice sent me this trainer, printed from my own drill sheet, free of charge." and "This shop earns a margin on FitSlice orders entered here."
- Two sizer plates instead of one, so one can travel to league nights.
- A named listing at the top of "Where to get your sheet entered" on the Pro Shops page for the first year.
- A standing invitation to the fit review: before any change to the configurator's hole geometry or print allowance ships, cohort operators see it first and their notes are answered in writing.

In return we ask for one thing: a measured comparison of a printed bore against the bore on the bowler's ball, done with the operator's own gauges, that we may publish with the operator's name. If the numbers are off, we publish that too. Wherever we publish it, the free unit and the shop's margin are stated next to the operator's name.

---

## 9. Bowl Expo booth plan

Bowl Expo is the BPAA's annual convention and trade show, held each summer. Its attendees are mostly center proprietors and managers, with pro-shop operators among them and the pro-shop trade present in the hall. Before booking, confirm with the organizers which days and sessions draw operators, and whether the operators' association holds its own sessions alongside the show that year. If it does, book. If it does not, this plan transfers unchanged to the operators' own event, and the Expo becomes a center-proprietor conversation about in-center pro shops.

### 9.1 Goal

Forty qualified pro-shop conversations (yes to both questions in Section 5) and fifteen onboarding calls booked before we leave the hall. Secondary goal: ten center proprietors who own in-center shops referred to their operator.

### 9.2 Booth

A 10 ft by 10 ft inline booth. Four things on it, nothing else:

1. **A printer, running.** One CoreXY printer printing a Rev Puck from a real sheet, for the whole show. A puck takes most of a day, so the print is always in progress and always visible. Watching the thumb bore being laid down shows what made to order means.
2. **A counter with three sizer plates.** Attendees try bores. The person at the counter asks, "What do you drill your thumb at?" and hands them the plate. Thirty seconds later there is a fit conversation.
3. **A tablet with the configurator.** The ninety-second demo (9.3). A stand so the attendee can type their own sheet.
4. **A rack of finished parts.** Six Rev Pucks and four Rev Spinners printed from real sheets: right and left hand, through and blind thumb, a long span and a short span, one with heavy reverse pitch so the axes look obviously different. Each tagged with its sheet, operator's name withheld unless the operator has agreed. A tag that names an operator who received the part free says so.

Signage: the primary line, "Your drill sheet, off the ball." The ten-second explanation under it. The product and price table from the sell sheet. The disclosure that seeded units carry. Nothing about revs.

### 9.3 The ninety-second demo

1. "Tell me your thumb hole size, your spans and your thumb pitch." Type them as they are said. (30 seconds.)
2. Turn the tablet. The grip is on screen with the axes drawn. "That is your thumb pitch, that is your middle finger. Zero pitch aims at the ball's center, like a real drilling." (20 seconds.)
3. Hand them the finished puck nearest their numbers from the rack. "That is somebody else's. Yours ships about five business days after we confirm the order." (20 seconds.)
4. The two qualifying questions. Write the answers on the lead card. (20 seconds.)

### 9.4 Staffing

Two people at all times: one on the counter and the plates, one on the tablet and the lead cards. The founder works the tablet. Breaks are staggered so the printer is never unattended.

### 9.5 Lead capture

A printed lead card, filled in by us, not the attendee: shop name, operator name, email, phone, the two qualifying answers, Counter Sale or Referral preference, and a checkbox for "print my own sheet." The "print my own sheet" box is the show giveaway: we print a Rev Spinner from the operator's own drill sheet and ship it after the show at no cost. The lead card carries the disclosure in print: "If you post about it, start with: FitSlice sent me this trainer, printed from my own drill sheet, free of charge. If your shop is in the program, add: This shop earns a margin on FitSlice orders entered here."

### 9.6 Follow-up cadence

- Day 1 after the show: thank-you email to every lead, with the sell sheet and terms attached, the onboarding call link and the opt-out line from Section 4. Leads who checked "print my own sheet" get the confirmation of their sheet as entered.
- Day 7: Email 2 from Section 4, adapted to mention the booth conversation.
- Day 21: Email 3 to anyone who has not replied.
- Spinners ship within three weeks of the show.

### 9.7 Budget lines

Booth fee as quoted in the organizer's exhibitor kit; one printer and spare nozzle and filament; one tablet and stand; three sizer plates and ten display parts; 500 counter cards and 200 lead cards; signage; travel and lodging for two; and the cost of the giveaway spinners (about $2.45 in filament each plus shipping). Measure the show on booked onboarding calls per dollar, not on badge scans.

---

## 10. Pro-shop onboarding checklist

Copy this into the shop record and tick each line.

**Before the call**
- [ ] Shop name, operator name, email, phone, address and hours recorded for the Pro Shops listing.
- [ ] Both qualifying questions answered yes, or the exception noted.
- [ ] Payment method chosen: Counter Sale (card on file collected) or Referral (ACH details collected).
- [ ] Shop agreement sent, with the terms sheet (Section 3) attached, and signed.
- [ ] Shop code generated and tested on the order form.
- [ ] Counter kit packed: sizer plate, 25 counter cards with the shop code written on each, shelf talker, a copy of Section 1.7 (approved lines) printed on one page.

**On the call (fifteen minutes, video)**
- [ ] Operator opens the configurator on the device they will use at the counter.
- [ ] Enter one real sheet together. Point out the hole axes, the fraction entry and the collision warning.
- [ ] Export the fit sheet and submit a test order with the shop code (flagged as a test, not printed).
- [ ] Walk the confirmation email the shop will receive and where the ship date appears.
- [ ] Walk the fit guarantee, the reduced reprint prices and who is billed under their payment method.
- [ ] Read the approved lines and the disclosure line aloud. Confirm the operator has the one-pager.
- [ ] Confirm the current lead time and the Monday lead-time email.

**Go-live**
- [ ] Counter kit delivered and the plate on the counter (photo from the shop, if they will send one).
- [ ] Shop listed on the Pro Shops page.
- [ ] First real order submitted. We confirm within one business day and telephone the operator when it ships.

**30-day check**
- [ ] Call the operator: orders entered, time per entry, questions bowlers asked, anything the configurator should accept that it does not.
- [ ] Confirm the first statement or payout arrived and matched the orders.
- [ ] Card refill offered. Co-op pre-approval offered if the shop advertises locally.
- [ ] Ask for a quote only if the operator volunteers one; record it verbatim and get written agreement before it replaces a `[QUOTE PLACEHOLDER — name]`. Run it with the matching disclosure line beside it, and do not use a quote that states a result.

---

## 11. Quarterly incentive math

What a shop earns at 2, 5 and 10 units a month, shown two ways: every unit a Rev Puck ($89), and every unit a Pair ($119). A shop's mix would land between them; Fit Kits and Spinners pull the average down, Pairs pull it up. Base margin is 25% of retail. The volume bonus is 2.5% of the quarter's retail value at 15 to 29 units and 5% at 30 or more.

These are arithmetic examples at stated volumes. They are not a forecast or a typical result, and FitSlice does not promise any volume. What a shop earns depends on how many sheets it enters and which products its bowlers order.

### 11.1 Per unit

| Product | Retail | Shop earns (25%) |
|---|---|---|
| Fit Kit | $24 | $6.00 |
| Rev Spinner | $45 | $11.25 |
| Rev Puck | $89 | $22.25 |
| Pair | $119 | $29.75 |
| Digital Files (Puck / Pair) | $29 / $39 | $7.25 / $9.75 |

### 11.2 Per quarter, all Rev Pucks

| Units per month | Units per quarter | Retail value | Base 25% | Volume bonus | Shop earns per quarter | Per year |
|---|---|---|---|---|---|---|
| 2 | 6 | $534 | $133.50 | none | $133.50 | $534.00 |
| 5 | 15 | $1,335 | $333.75 | 2.5% = $33.38 | $367.13 | $1,468.50 |
| 10 | 30 | $2,670 | $667.50 | 5% = $133.50 | $801.00 | $3,204.00 |

### 11.3 Per quarter, all Pairs

| Units per month | Units per quarter | Retail value | Base 25% | Volume bonus | Shop earns per quarter | Per year |
|---|---|---|---|---|---|---|
| 2 | 6 | $714 | $178.50 | none | $178.50 | $714.00 |
| 5 | 15 | $1,785 | $446.25 | 2.5% = $44.63 | $490.88 | $1,963.50 |
| 10 | 30 | $3,570 | $892.50 | 5% = $178.50 | $1,071.00 | $4,284.00 |

### 11.4 What the shop puts in

At three minutes of counter time per order, 10 units a month is 30 minutes a month. On Rev Pucks that is $222.50 of base margin a month before the bonus and before the shop's own costs, about $7.40 per counter minute. On Pairs it is $297.50, about $9.90 per counter minute. No shelf space, no inventory dollars, no markdowns.

### 11.5 What comes after the quarter

- The shop code stays on each bowler's fit sheet for twelve months. A shop that enters 30 sheets in a quarter has 30 bowlers whose reprints and reorders earn it 25% for the next year, if they reorder. We have no reorder data yet.
- At 15 units in a quarter the shop also earns a free replacement sizer plate. At any volume, its co-op reimbursement cap for the next quarter is 5% of the quarter's retail value: $66.75 on 15 Rev Pucks, $133.50 on 30, $178.50 on 30 Pairs.
- Capacity is a ceiling on volume. One printer makes 25 to 30 pucks a month, so ten shops at 10 units a month need four printers. Shops are onboarded in cohorts matched to that, and a shop that outgrows the cohort's capacity is told so before it happens.
