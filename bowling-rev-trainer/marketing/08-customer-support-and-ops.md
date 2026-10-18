# FitSlice Customer Support and Operations

Everything needed to take an order from fit sheet to delivered box, and to answer the customer when something is off: the order-to-ship runbook, the fit-guarantee process, 15 support macros, the onboarding email sequence, the safety and use card, QC log templates, the returns policy, a measuring guide for customers who have no drill sheet, and the data-retention statement for fit sheets.

How to use this file:

- Product facts come from `docs/business-plan.md` (Parts 2, 4, 5, 6 and 8) and `README.md`. Prices, guarantee terms, lead times and privacy terms match `marketing/02-website-copy.md` (Fit guarantee and returns, Shipping, Privacy and your fit sheet) and `marketing/03-pro-shop-program.md` section 3. The review-email rules match `marketing/05-creators-and-coaches.md` section 6.
- Text set inside a quote block is written for the customer and can be sent or posted as it stands. Everything outside a quote block is internal.
- `{{field}}` is a merge field. The list is in section 0.2.
- `[PATENT STATUS]` marks the one place a legal status line may go once counsel supplies the wording. Leave it out until then.
- The QC limits in section 1.6 are working limits. Study 1 in business-plan Part 7 replaces them with measured values.

## Rules every message follows

These come from business-plan Part 6 and Part 9. They apply to every reply, macro, email and card in this file, and to anything an agent writes by hand.

1. Say what the part is and what we did. Do not state or imply any result for rev rate, hook, average or injuries, and never give a number for any of them. Use "designed to", "practice" and "train". Do not use verbs that promise a result. The full list is in `marketing/01-brand-platform.md` section 3.
2. Never name a ball company or compare to one. Compare by category only: generic one-size practice balls, S/M/L wrist braces, roller trainers.
3. Never claim that any governing body or association has backed FitSlice in any way. If a customer asks, the answer is the practice-tool line in macro 8.
4. Never state or imply any patent status. Write `[PATENT STATUS]` where such a line would go.
5. Never invent a testimonial, a review, a star rating or a customer name. Quote a coach or creator only after they have said it. Until then, leave the quote-placeholder marker from `marketing/01-brand-platform.md` in the layout.
6. Any mention of a creator, coach, affiliate code, seeded unit or pro-shop margin carries a plain disclosure in the same message.
7. A drill sheet is personal data tied to a hand. Handle it as section 9 says.

---

## 0. Quick reference

### 0.1 Facts an agent needs without opening another file

| Item | Value |
|---|---|
| Products and prices | Fit Kit $24 (credited toward a trainer ordered within 90 days). Rev Puck $89. Rev Spinner $45. Pair $119. Digital Files $29 (puck) and $39 (pair). |
| Reduced reprint price | $25 Rev Puck, $15 Rev Spinner, $35 Pair, shipping included. For a sheet entered wrong, or a fit changed after the order. |
| Fit guarantee | 30 days from delivery. Part does not match the order's fit sheet: free reprint including shipping. The customer keeps the first part. |
| Decision time | Confirm and start the reprint within 2 business days of a valid claim. |
| Damaged in transit | Photos of the box and part within 7 days of delivery. Free reprint and reship. |
| Stalled package | No tracking movement for 7 days. Free reprint and reship. |
| Change the sheet or address | Free until printing starts. Locked once printing starts. |
| Printing time after payment | Fit Kit 1 to 2 business days. Rev Spinner 1 to 3. Rev Puck 2 to 4. Pair 2 to 4, ships together. |
| Domestic transit | 2 to 5 business days after printing. |
| Where physical products ship | The United States, including Alaska, Hawaii and APO/FPO. Digital Files go everywhere. |
| Pro-shop orders | Five business days from confirmation to ship. Flat $9 shipping per shipment, pairs ship free. Shop margin 25%. |
| Digital Files | Download link live 30 days and can be re-sent. Not refundable once downloaded, except defective files. |
| What is printed | Slice of a regulation 8.5 inch ball surface (108 mm radius). PETG, 0.2 mm layers, 4 walls, 20% gyroid infill, flat side down, no supports. |
| Weights and print times (slicer, PETG) | Rev Puck 297 g, 11 h 20 m on a CoreXY profile, 19 h 24 m on a conventional printer. Rev Spinner 98 g, 3 h 38 m or 6 h 21 m. Sizer plate 97 g, 3 h 24 m or 6 h 12 m. |
| Print allowance | The configurator adds 0.4 mm to every bore when sizes come from a drill sheet. It adds 0 when sizes come from a printed sizer plate. |
| Fit sheet retention | Three years from the last order, then deleted. Deleted within 30 days of a request. |
| Contact | support@fitslice.com. Replies within 2 business days. Coaches: coaches@fitslice.com. Creators: creators@fitslice.com. |

### 0.2 Merge fields

| Field | Filled with |
|---|---|
| `{{first_name}}` | Customer first name, or "there" |
| `{{agent_first_name}}` | Person sending the reply |
| `{{founder_name}}` | Founder name, for the review email |
| `{{order_number}}` | Shop order number. Reprints add a suffix: `-R1`, `-R2` |
| `{{product}}`, `{{product_name}}` | Rev Puck, Rev Spinner, Pair, Fit Kit or Digital Files |
| `{{hole}}` | thumb, middle or ring |
| `{{sheet_size}}`, `{{sheet_size_mm}}` | The size on the order's fit sheet, as a fraction and in mm |
| `{{qc_measured_mm}}` | The measured bore from the QC row, in mm |
| `{{ship_date}}`, `{{delivery_date}}` | From the order record and the carrier scan |
| `{{guarantee_end_date}}` | Delivery date plus 30 days, as published. The 3-day grace in section 2.4 is applied quietly and is not shown to customers |
| `{{credit_end_date}}` | Fit Kit delivery date plus 90 days |
| `{{tracking_url}}`, `{{carrier}}` | From the shipping label |
| `{{queue_days}}` | Current business days before printing starts |
| `{{reprint_price}}` | $25, $15 or $35 by product |
| `{{credit_code}}` | Fit Kit credit code |
| `{{download_url}}` | Digital Files download page |
| `{{configurator_url}}` | https://claude.ai/artifact/1fiDeAkPe9RPJSyBWruE2p until the site hosts it |
| `{{help_drill_sheet_url}}`, `{{help_measure_url}}`, `{{guarantee_url}}`, `{{returns_url}}`, `{{privacy_url}}`, `{{training_guide_url}}`, `{{edit_order_url}}`, `{{review_link}}` | Site pages and links |
| `{{postal_address}}`, `{{unsubscribe_url}}`, `{{preferences_url}}` | Email footer fields |
| `{{what_looks_off}}`, `{{value_as_entered}}`, `{{amount}}`, `{{reason}}` | Typed by the agent for the message at hand |
| `{{thumb_style}}`, `{{thumb_depth_mm}}`, `{{sheet_depth_mm}}`, `{{qc_depth_mm}}` | Thumb style and depths from the fit sheet JSON and the QC row |
| `{{print_start_date}}`, `{{days_to_ship}}`, `{{delivery_estimate}}`, `{{last_scan_date}}` | From the order and the carrier trace |
| `{{if_pair_or_spinner}} ... {{/if_pair_or_spinner}}` | Block shown only on orders that include a Rev Spinner |

### 0.3 Tags and response times

First reply to every message within 1 business day. The site promises 2.

Tags: `fit-tight`, `fit-loose`, `depth`, `hand`, `no-sheet`, `copy-ball`, `left-hand`, `two-handed`, `intl`, `digital`, `printer`, `refund`, `damaged`, `wismo`, `change-sheet`, `guarantee-claim`, `reprint`, `safety`, `data-request`.

Marketplace orders: the message arrives through the marketplace inbox. Use the same macros. Refunds go through the marketplace's refund tool. Do not ask a marketplace customer for a review. The marketplace sends its own request.

Orders entered by a pro shop: write to the bowler and copy the shop. Under Counter Sale the shop is the seller of record. Reduced-price reprints for a wrong sheet are billed to the shop at the reprint prices.

---

## 1. Order-to-ship runbook

One person can run this. Where a step says "second read", a single operator does it at a different time from the first read, working from the original document and not from the screen.

### 1.1 The flow

| # | Step | Target | Done when |
|---|---|---|---|
| 1 | Fit sheet received | Order confirmation email goes out automatically. Sheet check within 1 business day | Sheet attached to the order. JSON `name` field set to the order number |
| 2 | Sanity check, ten points | Same day as step 1 | Result recorded in the order note: PASS, CONFIRM or STOP |
| 3 | Build and slice | When a printer is free | Files named by order number. Grams and time logged |
| 4 | Print | Puck about 11 h 20 m or 19 h 24 m | "Printing" email sent. Start and end times logged |
| 5 | Finish and QC | Same day the print ends | QC row complete and result is SHIP |
| 6 | Pack | Same day as QC | Pack list ticked. Printed fit sheet checked against the order |
| 7 | Ship | Within 1 business day of QC | Tracking added. "Shipped" email sent |
| 8 | Follow-up | Starts on the carrier's delivery scan | Onboarding sequence running (section 4) |

Planning assumption from business-plan Part 5.2: one puck per printer per day. Reprints go to the front of the queue. Everything else prints in the order received.

### 1.2 Step 1: Fit sheet received

The sheet arrives one of four ways.

1. **Web order.** The configurator writes the fit sheet into the order as line-item properties and the confirmation email carries a JSON file. In the configurator, paste the JSON into the fit-sheet box and press Load.
2. **Marketplace order.** The sheet comes back as the personalization text. Type it into the configurator and save the JSON. Send the confirmation email with the sheet as entered. Hold the print for a written yes.
3. **Pro-shop order.** The shop's order form. Send the confirmation with the ship date and the sheet as entered within one business day. Attach the shop code to the fit sheet record for twelve months.
4. **Photo or email.** A customer sends a picture of the sheet. Type it into the configurator, reply with the values (macro 5), and hold the print for a written yes.

Rules for all four:

- Set the fit sheet `name` to the order number. Never put the customer's name in a file name.
- Printing may start once the sanity check is PASS. Search the order inbox for the order number immediately before pressing start. A correction that arrived before the print starts is applied.
- Production path: use the configurator. It applies the 0.4 mm print allowance. If you use `generate.py`, add 0.4 mm to `thumb_d`, `middle_d` and `ring_d` in the JSON or CSV yourself, because the OpenSCAD path does not add it.

### 1.3 Step 2: Sanity check, ten things to eyeball on a sheet

Do these in order, against the original document where there is one. Thresholds come from the typical ranges in `trainer.scad` and the hard limits in `generate.py`.

| # | Look at | Normal | Hold and ask when |
|---|---|---|---|
| 1 | **Hand** | R or L on the sheet matches the Hand setting. Right-hander: with the thumb hole at the bottom as you look at the grip from outside, the middle finger hole sits on the right and the ring on the left | Sheet and order disagree. Notes say "lefty" and the order says Right. Lateral pitches look mirrored |
| 2 | **Forward and reverse signs** | Finger holes forward (positive). Thumb zero or reverse (negative) | Any finger hole at reverse. Any thumb forward. A pitch typed without a direction word |
| 3 | **Thumb size** | 7/8" to 1 1/8" (22 to 28.5 mm). Larger than both finger holes | Outside the range. Smaller than either finger hole, which usually means the numbers were swapped. Hard limit is 21 to 31 mm |
| 4 | **Finger sizes** | 3/4" to 29/32" (19 to 23 mm) is typical. Ring often a half size under the middle | Outside 19 to 24 mm. 31/32" or 1" on a finger line, which is usually the drilled size for an insert and not the size the finger feels. Hard limit is 17 to 26 mm |
| 5 | **Units and typing** | The same size reads the same in fractions and mm. 55/64" is 21.83 mm. 27/32" is 21.43 mm | An mm number in an inch field or the reverse. A decimal that rounds to a different 64th than the fraction. 5/64 where 55/64 was meant |
| 6 | **Spans** | 105 to 125 mm (about 4 1/8" to 4 7/8"), cut to cut | Under 100 or over 128 mm. Both spans over about 130 mm, which suggests center-to-center numbers. Hard limit is 85 to 135 mm |
| 7 | **Middle against ring span** | Middle equal to or 2 to 4 mm longer than ring | Ring longer than middle. A gap over 6 mm |
| 8 | **Pitch size** | Each of the six pitches at or under 1/2". Fingertip fingers usually 1/4" to 3/8" forward | Any pitch over 1/2". Any lateral over 3/8". A blank forward or reverse on any hole. Blank lateral means 0 and needs no question. Never guess a forward pitch |
| 9 | **Bridge** | 1/4" (6.35 mm), or blank for the default | Under 1/4". The two finger bores can run into each other |
| 10 | **Thumb style, options and size source** | Through or blind matches the sheet. Weight pocket and cord ticked as ordered. Size source is the drill sheet (modeled bores are the sheet size plus 0.4 mm) or the printed sizer plate (modeled bores equal the plate label, no allowance) | The size source disagrees with what the customer says. Spinner orders: ignore thumb and span fields, they do not change the part |

After the ten, build the model in the configurator and check three more things:

- The warnings panel is empty. A warning is an automatic hold.
- The modeled-bores table shows the sheet size plus 0.4 mm on a sheet-sourced order, or the exact label on a plate-sourced order.
- In the 3D preview, each hole axis leans the way the sheet says. A wrong lean is almost always a sign error.

**Results**

- **PASS.** Slice.
- **CONFIRM.** Send the sheet-confirmation email below and hold the order. Remind at 3 business days and again at 7. At 10 business days, offer a full refund. Printing has not started, so a cancellation is clean.
- **STOP.** A configurator warning that survives confirmation, or a value outside the printable range. Send to the founder. Options are a corrected sheet, a different thumb style, or a full refund.

For Digital Files orders the customer generates the files in their own session and the link goes out within minutes. Run the ten-point check on the saved sheet the same business day, after delivery. If it trips, send the email below before the customer starts an 11-hour print.

**Sheet-confirmation email (customer-facing)**

> Subject: Order {{order_number}}: one quick check on your sheet
>
> Hi {{first_name}},
>
> Before I start printing, I want to check one number against your drill sheet, because a printed part cannot be edited once it is on the bed.
>
> **{{what_looks_off}}**
>
> The sheet you entered says: {{value_as_entered}}.
>
> Could you look at your sheet and reply with the right value, or with a photo of the sheet? If the value is correct as it stands, reply "correct as entered" and I will print it.
>
> Nothing is printing yet. You can change anything free until it starts.
>
> {{agent_first_name}}
> FitSlice

For a Digital Files order, change the first paragraph to "Before you start an 11-hour print, I want to check one number against your drill sheet, because a printed part cannot be edited once it is on the bed." Delete "Nothing is printing yet." and say "We regenerate your files free if your fit changes within 30 days."

### 1.4 Step 3: Build and slice

1. Load the fit sheet in the configurator. Pick the part. Pick the size source. Confirm the warnings panel is empty.
2. Download the STL bundle. It holds the STL and the fit sheet JSON. Rename both with the order number and part, for example `FS-1042-puck.stl`.
3. Slice with the FitSlice PETG profile: 0.2 mm layers, 4 walls, 5 top and bottom layers, 20% gyroid, no supports, flat base on the bed. Sizer plates use the same profile.
4. Record the slicer's filament grams and print time on the order.
5. Look at the sliced preview. The base is on the bed. No supports were generated. The bores have all four walls. The weight pocket and cord tunnel are open.

If a batch of orders is ready together, `generate.py` with a CSV of fit sheets produces the STLs in one run. Remember the allowance note in section 1.2.

### 1.5 Step 4: Print

1. Start the print. Log the printer ID, filament lot and start time.
2. Send the "Your part is printing" email (website copy, Email 2). The platform sends it when the order status changes to Printing.
3. Check the first layers. A lifted corner on a puck is a scrap, not a rework.
4. When it finishes, log the end time and the printer's own message if any. Remove the part. Let it cool fully before measuring.
5. Finish the bores: wipe with a little isopropyl and one pass of fine sandpaper around a dowel. The aim is smooth, not larger. Measure after sanding, never before.

### 1.6 Step 5: Finish and QC

Tools: digital calipers, a set of gauge pins or drill-bit shanks in steps of 0.1 mm or finer across 17 to 29 mm, a kitchen scale reading to 1 g, a printed copy of the fit sheet, and the QC card (section 6.1). Business-plan Part 7 budgets about $100 for the measuring tools.

**How to measure a bore**

Reference diameter R for a bore:

- Sheet-sourced order: R is the drill-sheet size in mm. The modeled bore is 0.4 mm larger, and the printer takes some of that back.
- Plate-sourced order: R is the printed diameter of the same bore on the customer's Fit Kit plate, which is the plate label minus that printer's logged offset (section 6.3). Print the order on the printer ID recorded for the Fit Kit, or on a printer whose logged offset is within 0.05 mm of it.

Two methods. Use the calipers to record the number and the pins for a quick go/no-go.

1. **Calipers (record this).** Inside jaws, about 5 mm below the rim to clear the chamfer, across the narrow way of the oval the hole makes in the surface. Read twice and record the average. The bores are cut toward the ball's center, so the long way across the oval reads high. Do not use it.
2. **Pins (go/no-go).** Hold a pin of R minus 0.20 mm along the bore axis. It must pass the whole depth with light finger pressure. A pin of R plus 0.20 mm must stop at the rim chamfer and not enter further. The same pins are used for the span and lean checks below.

**QC checklist**

| # | Check | Pass | If it fails |
|---|---|---|---|
| Q1 | Identity: label, order number, printer ID and file name agree | All four match | Stop. Find the mix-up before anything else |
| Q2 | Visual | No warp (sits flat without rocking), no cracks or layer splits near the bores, no blobs or strings in the bores, smooth curved face. Spinner: engraved bars clear | Scrap and reprint |
| Q3 | Weight | Within 5% of the slicer's grams | Weigh again. If still outside, look for a void or an under-filled print. Scrap if found |
| Q4 | Thumb bore | Measured within ±0.20 mm of R (half a 64th) | Under by 0.20 to 0.40 mm: sand lightly, re-measure once. Over, or under by more than 0.40: scrap and reprint |
| Q5 | Middle bore | Same limit | Same action |
| Q6 | Ring bore | Same limit | Same action |
| Q7 | Thumb style and depth | Through bore passes a pin to the base. Blind bore depth within ±1 mm of the fit sheet and a floor of at least 3 mm. Finger depth within ±1 mm | Scrap and reprint |
| Q8 | Spans (puck) | Seat a pin in the thumb bore and one in the finger bore. With the inside jaws, measure the gap between the pins where they leave the surface. Reading within ±0.5 mm of the ordered span, for both fingers | Re-seat and read again. If still outside, hold the part and check the printer's scale with a calibration cube |
| Q9 | Pitch (puck) | The pins lean the way the preview shows. Second read: the six pitches and their directions on the original document match the JSON | Wrong lean or mismatch: scrap, correct the sheet if the error was ours, reprint |
| Q10 | Hand | With the thumb hole at the bottom as you look at the grip from outside, a right-hander's middle finger hole is on the right. Mirror for left | Scrap and reprint |
| Q11 | Cord (puck) | Paracord threaded through the tunnel. Knots larger than the tunnel opening. A firm hand tug does not move them | Re-thread and re-tie |
| Q12 | Weight pocket (puck) | Open, empty, no hanging strands | Clear it |
| Q13 | Bore finish | Smooth with no ridges. No dust left | Wipe and re-check |
| Q14 | Printed fit sheet | The sheet going in the box matches the JSON and the order: hand, three sizes, both spans, six pitches, thumb style | Reprint the sheet |

Spinner QC is Q1, Q2, Q3, Q5, Q6, Q7 (finger depth only), Q10, Q13 and Q14. The spinner's finger bores are cut radially, aimed at the ball's center, as the CAD builds them today, so there is no pitch check for it.

**Results**

- **SHIP.** All checks pass.
- **REWORK.** One light sanding pass on an undersize bore, then re-measure. One rework per part.
- **SCRAP.** Anything else. Put a replacement at the front of the queue the same day. Log the cause code (section 2.6). A scrapped part is not a guarantee claim, and the customer is not told unless the ship date moves. If it moves, send the lead-time note: "Your part did not pass our check against your sheet and is being printed again. New ship date: {{ship_date}}."

Take one photo of the finished part next to its printed fit sheet and a ruler. Name it with the order number. It is the evidence for any later claim and it is deleted on the schedule in section 9.4.

Monthly, per printer: print a 100 mm calibration cube and log the measured size. If a printer's average miss on its last ten parts drifts more than 0.10 mm from where it started, stop using the default allowance on that printer and tell the founder. The per-printer offset comes from the Study 1 data.

### 1.7 Step 6: Pack

What goes in each box (from the product pages):

| Product | In the box |
|---|---|
| Rev Puck | The puck. Paracord wrist cord, threaded. Printed fit sheet. Training guide card with the four puck drills. Safety and use card (section 5). One roll of bowler's tape |
| Rev Spinner | The spinner. Printed fit sheet. Training guide card with the two spinner drills. Safety and use card |
| Pair | Both parts. Paracord wrist cord threaded through the puck. Printed fit sheet. Training guide card with all six drills. Safety and use card. One roll of bowler's tape |
| Fit Kit | Sizer plate with sizes engraved. One roll of bowler's tape. Fitting card with space to record sizes. Credit code for $24 off a trainer. Safety and use card |

Steps:

1. Wrap the part in paper or bubble wrap so it cannot move. A puck or pair goes in a box with void fill. A Fit Kit goes in a padded mailer.
2. Put the printed fit sheet on top so it is the first thing the customer sees.
3. Tick the pack list against the table above.
4. Weigh the sealed box. A puck box is about 600 to 900 g.
5. Print the label from the order. Check the address against the order, not against memory.

### 1.8 Step 7: Ship

1. Use a tracked ground service. Pro-shop orders ship to the address the order names, shop or bowler.
2. Add the tracking number to the order. The platform sends the "Shipped" email (website copy, Email 3).
3. Log the ship date in the QC row.
4. Every Monday, sweep the tracking for orders shipped in the last 21 days. Any package with no scan for 5 days gets the macro 14 note and a carrier trace. At 7 days with no movement, start the reprint without waiting for the customer to write.

### 1.9 Step 8: Follow-up

The carrier's delivery scan starts the onboarding sequence in section 4. If a reprint ships, the sequence restarts from the replacement's delivery scan. A guarantee claim opened in the first 30 days stays open until the customer has the right part in hand.

### 1.10 Variants

**Fit Kit.**

- Sanity check: hand, and three expected sizes to the nearest 64th. For a customer with no sheet, center the plate on the defaults (thumb 25.4 mm, fingers 21.03 mm) and set the step to 1/32" (0.79 mm) in the sizer settings so the plate covers a wider range.
- Print one sizer plate. QC: measure the two end bores in each row (four bores). Log the average of label minus measured in the printer offset log. Check that every engraved label reads clearly.
- Record the printer ID on the order. The follow-on trainer prints on that printer.
- Ship in a padded mailer.

**Digital Files.**

- The customer's configurator session builds the files. The platform delivers the bundle: STL files, a sizer-plate STL centered on their sizes, the fit sheet as PDF and JSON, our print settings, the print guide and training guide as PDFs, and the use warning.
- Run the ten-point check after delivery, as described in section 1.3.
- There is no QC row. The fit guarantee on printed dimensions does not apply to Digital Files.

### 1.11 The reprint lane

A reprint takes the order number with a suffix: `FS-1042-R1`. It prints next, ahead of new orders. It gets the full QC with no shortcuts, plus a second look at the original sheet by someone who did not handle the first print. It ships with a note card: "Reprint of order {{order_number}}. Keep the first part."

---

## 2. Fit-guarantee process

The published terms are on the Fit guarantee and returns page. This section is how the team applies them.

### 2.1 What counts as a miss

A part misses the order's fit sheet when any of these is true, measured by the method in section 1.6:

- A bore measures more than 0.20 mm from R. This is half of one 64th, so the bore rounds to a different size than the one ordered.
- A span measures more than 0.5 mm from the ordered span.
- A pitch leans the wrong way or by the wrong amount against the stored sheet.
- The hand, thumb style or depth does not match the sheet (depth tolerance ±1 mm).

The configurator applies a 0.4 mm print allowance to every bore on a sheet-sourced order, and the limits above are measured after that. A thumb that wants a layer or two of bowler's tape is within normal fit. Tape is in the box for that reason.

### 2.2 What does not count

From the published page:

- Parts printed by the customer or a third party from Digital Files.
- Wear from use, including bores enlarged by sanding or by removing tape repeatedly.
- Damage from throwing, dropping onto hard floors, or use outside the drills in the guide.
- A sheet that does not match the customer's ball when the part matches the sheet. This is the "entered wrong" path.
- A fit changed after the order was placed.

### 2.3 The four paths

| Path | When | Outcome |
|---|---|---|
| **A. Our miss** | The part misses the sheet on the order, or we typed the sheet wrong from a photo or the shop's form | Free reprint, shipping included. The customer keeps the first part |
| **B. Entered wrong** | The part matches the sheet, and the sheet does not match the ball | Reprint at the reduced price: $25 puck, $15 spinner, $35 pair, shipping included |
| **C. Fit by feel** | The customer says it feels off and has no measurement | Run the evidence ladder (section 2.5). The outcome is A or B, or tape advice |
| **D. Shipping** | Damaged in transit, or no tracking movement for 7 days | Free reprint and reship. No evidence of fault needed beyond photos of the damage |

A wrong sheet entered by a pro shop is path B. Under Counter Sale the reduced price is billed to the shop. Under Referral the bowler pays. A wrong sheet typed by FitSlice from a photo is path A.

### 2.4 The window

Thirty days from the carrier's delivery scan, as published. Quietly accept a claim that arrives up to three days after day 30 as inside the window. This covers weekends and a day-30 email that lands on the last day. After that, a changed or corrected sheet is a reprint at the reduced price, and a claim that the part missed its sheet is still looked at. The founder may authorize a free reprint outside the window. Log it as goodwill.

### 2.5 The evidence ladder

Work down until the answer is clear. Stop at the first rung that settles it.

1. **The QC row.** Pull the row for the part. If it exists and shows the bore, span and pitch checks passed, the part left us within limits.
2. **The customer's photo.** A photo of the part next to a ruler, or next to their ball. It settles a wrong hand, a wrong lean or an obvious oversize.
3. **The customer's measurement.** Calipers, inside jaws, the narrow way across the oval, about 5 mm below the rim. Ask for the reading and the hole.
4. **The Fit Kit.** If the customer has one, ask which bore feels right and compare it with the sizes on the order.
5. **A pro-shop reading.** A shop with a pitch gauge and fitting tools can read the part. Ask only when the first four disagree.

When the QC row says pass and the customer's measurement says miss by more than 0.30 mm, do not argue. Re-measure by the other method. If the two methods still disagree, reprint and send the first part's measurements to the founder for the printer log.

### 2.6 Who authorizes and how fast

| Case | Who signs off |
|---|---|
| Path A, first reprint on an order, supported by the QC row, a photo or a measurement | Agent, same day |
| Path D (damage or stalled package) | Agent, same day |
| Path B | Agent. Collect payment first, link in the reply |
| A second reprint on the same order | Founder |
| Outside the window | Founder |
| Fit by feel with no evidence after two exchanges | Founder |
| More than two claims from one customer in twelve months | Founder |

Cause codes, logged on every reprint: `P1` printer or material, `P2` our data entry, `P3` customer data entry, `P4` pro shop entry, `P5` damage in transit, `P6` carrier loss, `P7` fit by feel, `P8` other. Review the counts monthly. Any code above 5% of parts shipped gets a root-cause note.

If a second reprint also misses the sheet, offer a full refund. Two misses in a row is our problem, not the customer's.

### 2.7 Turnaround

| Stage | Time |
|---|---|
| First reply | 1 business day |
| Decision and start of reprint | Within 2 business days of a valid claim, as published |
| Reprint prints | Same times as a new order, counted from sign-off: Spinner 1 to 3, Puck 2 to 4, Pair 2 to 4 business days. It jumps the queue |
| Transit | 2 to 5 business days |
| Worst case end to end | 11 business days |

Tell the customer the new ship date in the reply and send the standard "Your part is printing" and "Shipped" emails for the reprint.

### 2.8 Safety reports are not fit claims

If a customer reports an injury, a cracked part in use, a part that softened or warped from heat, or a child's use without an adult:

1. Reply the same day. Say you are sorry, ask what happened, ask for photos, and ask them to stop using the part.
2. Do not speculate about cause and do not offer an opinion on injuries.
3. Log it with the `safety` tag and tell the founder the same day.
4. If a returned part arrives, keep it and the packaging.
5. Two reports of the same failure on different parts: stop shipping that part until the founder has looked at the batch.

---

## 3. Support macros

Fifteen replies. Each has a use case, what to check first, the reply and what to do afterwards. Fill the merge fields, delete the branches that do not apply, and read it once before sending.

### Macro 1. Fit feels tight

**Use when:** a customer says the thumb or a finger hole feels tight.
**Check first:** the QC row for the measured bore, the size source (sheet or Fit Kit), and the delivery date.

> Subject: Re: your {{product}}, order {{order_number}}
>
> Hi {{first_name}},
>
> Thanks for telling me. Let's work out whether it is the hole or the feel.
>
> 1. Which hole is tight, and where: at the rim, partway in, or all the way down?
> 2. If you have added tape to that hole, take it out. The part ships with bare bores, and each layer makes the hole smaller.
> 3. Try the same hole on your ball at the time of day you usually bowl. Hands change size across a day and across a season, and the holes on a ball are beveled.
> 4. If you have calipers, measure the hole the narrow way across the oval, about 5 mm below the rim, and send me the reading. No calipers? A photo with a ruler across the hole works.
>
> Your sheet says {{hole}} {{sheet_size}} ({{sheet_size_mm}} mm). We measured your part before it shipped and the bore read {{qc_measured_mm}} mm.
>
> Please hold off on sanding. Sanding is permanent, and if the hole measures more than 0.2 mm under your sheet we reprint it free. That is easier with an untouched part.
>
> If it measures within 0.2 mm of your sheet, the part is what you ordered, and you have two good options. Lightly sand: wrap fine sandpaper around a pencil, turn it a few times, check, and stop early. Or order a Fit Kit ($24, credited toward a trainer) to find the size that feels right on our printer, and I will reprint at {{reprint_price}} from your new numbers.
>
> {{agent_first_name}}
> FitSlice

**After:** tag `fit-tight`. If the customer measures a miss, move to path A and reprint. If no evidence after two exchanges, escalate to the founder.

### Macro 2. Fit feels loose

**Use when:** a customer says the thumb or a finger slides around or falls out.
**Check first:** the QC row, and how many layers of tape the customer has already added.

> Subject: Re: your {{product}}, order {{order_number}}
>
> Hi {{first_name}},
>
> A loose hole is the easy one, and it is the same adjustment you make on your ball: tape.
>
> 1. Take one piece from the roll in the box. Press it flat against the wall of the bore, trim it at the rim, and smooth it down so there is no ridge.
> 2. Test it. Add a second piece only if you still want more. A layer or two is normal fit.
> 3. Tape only the hole that is loose. Tape the thumb separately from the fingers.
>
> If you need more than two layers to get a snug fit, tell me. Your sheet says {{hole}} {{sheet_size}} ({{sheet_size_mm}} mm), and we measured your bore at {{qc_measured_mm}} mm before it shipped. If you can measure it with calipers (narrow way across the oval, about 5 mm below the rim) and it reads more than 0.2 mm over your sheet, we reprint it free. A photo with a ruler across the hole also helps.
>
> If the part matches your sheet and your ball feels different, the usual reason is a change in your hand or your tape since the sheet was written. In that case a Fit Kit ($24, credited toward a trainer) finds the right size, and I can reprint at {{reprint_price}}.
>
> {{agent_first_name}}
> FitSlice

**After:** tag `fit-loose`. More than two layers needed: ask for the measurement and follow section 2.5.

### Macro 3. Thumb hole too deep

**Use when:** a customer says the thumb goes in too far, bottoms out, or the hole feels too long.
**Check first:** thumb style on the sheet (through or blind), the depth on the fit sheet JSON (blind default 40 mm), and the QC depth reading. Depth is not a drill-sheet number. We set it from the standard unless the order says otherwise.

> Subject: Re: your {{product}}, order {{order_number}}
>
> Hi {{first_name}},
>
> Depth is not on a drill sheet, so we set it to the standard unless you tell us otherwise. Two quick questions will tell me what to change.
>
> 1. Your order has a **{{thumb_style}}** thumb. A through bore has no floor, so the thumb goes as far as your hand takes it. A blind bore has a floor at {{thumb_depth_mm}} mm.
> 2. On your ball, where does the edge of the hole land on your thumb when it is seated? A photo of your thumb in the part and one of your thumb in your ball, side by side, is enough.
>
> If you have a through bore and want a floor, or a blind bore and want it shallower, tell me the depth you want. Your sheet is stored, so I only change the thumb style or depth and keep every other number. That is a reprint at {{reprint_price}}, shipping included.
>
> If we measured the depth at {{qc_depth_mm}} mm and your sheet said {{sheet_depth_mm}} mm, the part missed what you ordered and the reprint is free.
>
> {{agent_first_name}}
> FitSlice

**After:** tag `depth`. Use path A only if the QC depth was outside ±1 mm of the sheet. Otherwise path B.

### Macro 4. Which hand

**Use when:** a customer asks which hand to choose, or whether a part can be used with the other hand.

> Subject: Re: choosing Right or Left
>
> Hi {{first_name}},
>
> Choose the hand whose fingers go in the holes on your ball. For most bowlers that is the hand they throw with. If you bowl two-handed or switch hands, pick the hand your drill sheet was written for.
>
> The Hand setting mirrors the layout. Looking at the grip from outside with the thumb hole at the bottom, a right-hander's middle finger hole is on the right and the ring on the left. Left is the reverse. It also mirrors the lateral pitches, which count as positive toward your bowling-hand side. For a right-hander, "right" is positive and "left" is negative. For a left-hander, "left" is positive and "right" is negative.
>
> The 3D preview in the configurator draws every hole axis, so you can compare the lean with your ball before you order: {{configurator_url}}
>
> A part laid out for one hand is not a match for the other. If you are not sure, send me a photo of your drill sheet and I will tell you what the sheet says.
>
> {{agent_first_name}}
> FitSlice

**After:** tag `hand`. If the customer has already ordered and chose the wrong hand before printing started, change it free. After printing started, section 3, macro 15.

### Macro 5. I don't have a drill sheet

**Use when:** a customer wants to order and cannot produce a sheet.

> Subject: Re: no drill sheet
>
> Hi {{first_name}},
>
> That is common, and it is easy to sort out. The numbers exist, and the pro shop that drilled your ball almost always still has them.
>
> 1. **Ask the shop that drilled your ball.** Ask for a copy or a photo of your drill sheet. Shops do this all the time. If they keep your sheet in software, a printout works.
> 2. **No record, or the shop has closed?** Take your ball to any pro shop and ask whether they can read the sizes, spans and pitches off it and write them down. Some will do it at the counter, some charge a small fee, and some will not. Ask before you go.
> 3. **Let the shop enter it for you.** Pro shops can enter your sheet on the Pro Shops page and we print and ship. The shop earns 25% of the order for doing it.
> 4. **Find your hole sizes at home.** The $24 Fit Kit is a plate with bores in 1/64" steps, printed on the same printer as your trainer. The $24 is credited toward your order. Say "no sheet" in the notes and we print a wider range of sizes.
>
> We do not estimate spans or pitches from a photo of a hand, because spans and pitches make up about 80% of a fit by the pro-shop trade body's own rule of thumb. A pro-shop fitting is better than any measurement you take at home. Our guide for what you can measure yourself, and what to bring to a fitter, is here: {{help_measure_url}}
>
> If you do find a sheet, send me a photo and I will send back the values to type into the configurator.
>
> {{agent_first_name}}
> FitSlice

**After:** tag `no-sheet`. Do not offer to guess any number.

### Macro 6. Can you copy my ball

**Use when:** a customer offers to mail a ball or asks us to measure one.

> Subject: Re: copying your ball
>
> Hi {{first_name}},
>
> I wish I could say yes, and at launch we cannot. We do not take balls by mail and we do not measure balls. Please do not send one. A ball is yours, it is heavy, and it is a lot to risk in the post.
>
> What works today:
>
> 1. **Your sheet.** The shop that drilled the ball has it. Ask for a copy or a photo.
> 2. **A reading from any pro shop.** Take the ball in and ask them to read the sizes, spans and pitches off it and write them down. Not every shop does this, so ask first.
> 3. **Your own measurements.** If you have a drilled ball and calipers, our guide shows how to read the sizes and spans off it, and what to leave to a shop: {{help_measure_url}}
>
> Once you have the numbers, the configurator rebuilds the model in about a tenth of a second and draws the hole axes, so you can compare it with your ball: {{configurator_url}}
>
> {{agent_first_name}}
> FitSlice

**After:** tag `copy-ball`. If a ball arrives anyway, do not open or use it. Email the sender the same day, ship it back at our cost with tracking, and tell the founder.

### Macro 7. Left-handed

**Use when:** a left-handed bowler asks whether FitSlice works for them.

> Subject: Re: left-handed bowlers
>
> Hi {{first_name}},
>
> Yes. Choose Left in the configurator. It mirrors the finger layout and the lateral pitches, and it costs the same.
>
> One thing catches people. Lateral pitch counts as positive toward your bowling-hand side. For you that means "left" on your sheet is positive and "right" is negative. Forward and reverse work the same for both hands: forward is positive, reverse is negative. A sheet that says "1/8 reverse" goes in as -1/8.
>
> After you enter the numbers, look at the 3D preview, which draws every hole axis, and compare the lean with your ball before you order. If anything looks mirrored the wrong way, send me a photo of your sheet and I will read it with you.
>
> Configurator: {{configurator_url}}
> How to read a drill sheet: {{help_drill_sheet_url}}
>
> {{agent_first_name}}
> FitSlice

**After:** tag `left-hand`. Run sanity-check item 1 on the order.

### Macro 8. Two-handed

**Use when:** a two-handed or thumbless bowler asks whether FitSlice is for them.

> Subject: Re: two-handed bowling
>
> Hi {{first_name}},
>
> The Rev Spinner is the one for you. It is a fingers-only disc with your middle and ring hole sizes and your bridge, and it has no thumb hole, so it works for thumb-in, thumbless and two-handed bowlers. It is $45.
>
> You swing it on a short pendulum, lift with the fingers, and release it onto carpet. It spins in place, and the engraved bars on the base let you count how long. It gives you feedback. It does not measure anything.
>
> Your drill sheet has the finger numbers even without a thumb hole. Enter them exactly as written. The thumb and span fields do not change the spinner.
>
> The Rev Puck is made for thumb-in bowlers. If your ball does have a thumb hole, send me your sheet and I will tell you what we can make from it.
>
> If you are wondering: FitSlice is a practice tool for your hand. It is not a bowling ball. Do not use it on a lane or in competition.
>
> {{agent_first_name}}
> FitSlice

**After:** tag `two-handed`. Point the customer to the Spinner, not the Pair, unless their ball has a thumb hole.

### Macro 9. International shipping

**Use when:** a customer outside the US asks to buy.

> Subject: Re: shipping outside the US
>
> Hi {{first_name}},
>
> At launch we ship physical products within the United States, including Alaska, Hawaii and APO/FPO addresses. We do not ship the Rev Puck, Rev Spinner, Pair or Fit Kit to other countries yet.
>
> You can still get your fit. The Digital Files are available everywhere: $29 for the Rev Puck, $39 for the Pair. You get the STL files built from your drill sheet, a sizer-plate file centered on your sizes so you can calibrate your own printer, your fit sheet, and our print settings. Print at home or at a local print shop. The configurator accepts millimeters and inches: {{configurator_url}}
>
> Tell me your country and I will add you to the list, so we know where to open next. Your email goes on that list only for that purpose.
>
> {{agent_first_name}}
> FitSlice

**After:** tag `intl`. If asked about mail-forwarding services: we ship to any US street address, and the customs and onward leg are between the customer and the forwarder. Do not name a forwarder. Digital sales to other countries may carry local tax duties; the founder sets that in the shop platform.

### Macro 10. Digital file questions

**Use when:** a Digital Files buyer asks what they get, how long the link lasts, whether they can share or resell, or what the guarantee covers.

> Subject: Re: your Digital Files
>
> Hi {{first_name}},
>
> Here is how the Digital Files work.
>
> **What you get.** STL files for the Rev Puck, or the Puck and Spinner, built from your sheet. A sizer-plate STL centered on your sizes. Your fit sheet as a PDF and as a JSON file the configurator can reload. Our print settings, a one-page print guide, the six-drill training guide, and the use warning.
>
> **Delivery.** A download link by email, usually within minutes of payment. It stays live for 30 days, and I can re-send it any time: {{download_url}}
>
> **If your fit changes.** Within 30 days, we regenerate the files free from your new numbers. Send me the new sheet.
>
> **If the files are wrong.** If they do not match the fit sheet on your order, or will not open, we regenerate or replace them free.
>
> **What the guarantee does not cover.** We do not control your printer or filament, so the fit guarantee on printed dimensions does not apply to Digital Files. Print the sizer plate first and use it to calibrate. Downloaded digital goods are not refundable, except where the files are defective.
>
> **Sharing and selling.** The license is personal use. Print as many copies as you like for yourself. Please do not share the files or sell prints. [PATENT STATUS]
>
> {{agent_first_name}}
> FitSlice

**After:** tag `digital`. Resend the link if asked. Do not refund a downloaded file that opens and matches the sheet.

### Macro 11. Printer settings for digital buyers

**Use when:** a Digital Files buyer asks how to print it.

> Subject: Re: print settings
>
> Hi {{first_name}},
>
> These are the settings we print with. They are in your download too.
>
> - **Material:** PETG. Filament needed: about 300 g for the puck, 100 g for the spinner, 100 g for the sizer plate.
> - **Layers:** 0.2 mm.
> - **Walls:** 4 perimeters, 5 top and bottom layers.
> - **Infill:** 20% gyroid. Up to 30% is fine; more infill weighs more.
> - **Orientation:** flat base on the bed, as the STL opens. No supports. The cord tunnel and weight pocket are shaped so they print without them.
> - **Scale:** 100%. Do not resize the file.
> - **Bed:** at least 180 × 180 mm.
> - **Time:** the puck takes roughly 11 to 20 hours depending on your printer. The spinner and sizer take about 3 to 6 hours each.
>
> **Print the sizer plate first.** Every printer makes holes a little smaller than the model. The configurator allows 0.4 mm for that. The sizer plate shows what your printer actually makes: find the bore that is snug at the first joint with no squeeze, then go back to the configurator, choose "The printed sizer plate" as your size source, and enter the engraved size. Your puck then prints at the size that fit your hand on your printer.
>
> **Finish.** Lightly sand the hole rims and bores with fine sandpaper, with a wipe of isopropyl first. Smooth bores matter for a clean thumb exit. Finish the fit with bowler's tape, as you would on your ball.
>
> **Heat.** PETG softens in heat. Keep the part out of hot cars and direct sun.
>
> Send me a photo if a print gives you trouble and I will help you read it.
>
> {{agent_first_name}}
> FitSlice

**After:** tag `printer`. We help with these settings and do not troubleshoot the customer's printer hardware.

### Macro 12. Refund request

**Use when:** a customer asks for their money back. Keep only the branch that applies.

> Subject: Re: order {{order_number}}
>
> Hi {{first_name}},
>
> I am sorry this has not worked out. Here is where your order stands and what I can do.
>
> **A. Printing has not started.** I have cancelled order {{order_number}} and refunded {{amount}} to your original payment method. Your bank decides how long it takes to show, and I send it within 3 business days.
>
> **B. Printing has started or it has shipped, and the part matches your sheet.** Your part is made to your measurements and cannot be resold, so it cannot be returned for a refund. What I can do is make it right if something is off. If the part does not match your sheet, we reprint it free within 30 days of delivery. If the sheet turns out not to match your ball, we reprint at {{reprint_price}}, shipping included. Tell me what feels wrong, which hole, and what your ball feels like, and I will take it from there.
>
> **C. Fit Kit, unused, inside 30 days.** Send it back unused and I will refund the $24. The shipping you paid at checkout is not refunded, and return postage is yours. If you use it and order a trainer, the $24 comes off the price instead.
>
> **D. Digital Files.** Downloaded files are not refundable. If they do not match your fit sheet or will not open, I regenerate or replace them free. Send me what you see.
>
> **E. Charged twice, or charged the wrong amount.** That is on us. I have refunded the difference to your original payment method.
>
> Nothing here limits any rights you have under the consumer laws where you live.
>
> {{agent_first_name}}
> FitSlice

**After:** tag `refund`. A second miss on the same order gets branch F: a full refund (section 2.6). If a card dispute opens, send the processor the order record, the QC row, the printed fit sheet and the tracking.

### Macro 13. Damaged in transit

**Use when:** a part arrives broken, cracked, or in a crushed box.

> Subject: Re: damage to order {{order_number}}
>
> Hi {{first_name}},
>
> I am sorry it arrived like that. We reprint and reship free. To start, please send:
>
> 1. A photo of the outside of the box, with the shipping label visible.
> 2. A photo of the damage to the part.
> 3. A photo of the part next to the printed fit sheet, if the part is in one piece.
>
> We ask for these within 7 days of delivery, and they go to the carrier with our claim. Please keep the box and packing until the claim is closed. You do not need to send the damaged part back.
>
> Your sheet is on file, so you do not need to retype anything. I will confirm within 2 business days and start the reprint. It goes to the front of the queue, and you will get a printing email and a tracking email as usual.
>
> {{agent_first_name}}
> FitSlice

**After:** tag `damaged`, path D, cause code `P5`. File the carrier claim with the photos. If the part is cracked and the box looks fine, treat it as a possible safety report (section 2.8).

### Macro 14. Where is my order

**Use when:** a customer asks about timing or status. Pick the line that matches the status.

> Subject: Re: where is order {{order_number}}
>
> Hi {{first_name}},
>
> Here is where it is.
>
> **Confirmed, not printing yet.** We print in the order received. The queue is {{queue_days}} business days before printing starts, then the part prints in 1 to 4 business days depending on the product, and ships. Domestic transit takes 2 to 5 business days after that. You will get an email when it starts printing and another with tracking.
>
> **Printing.** It started on {{print_start_date}}. A Rev Puck takes about 11 to 19 hours on the printer, and then we smooth the bores and check each one against your sheet. Tracking follows within {{days_to_ship}} business days.
>
> **Shipped.** It left on {{ship_date}} with {{carrier}}. Tracking: {{tracking_url}}. The estimate is {{delivery_estimate}}.
>
> **Shipped, no movement.** I can see the same scan since {{last_scan_date}}. I have asked {{carrier}} to trace it. If tracking shows no movement for 7 days from the last scan, we reprint and reship free. You do not need to do anything.
>
> **Running behind.** We are beyond our usual times because {{reason}}. Your new ship date is {{ship_date}}. If that is too long for you, say so and I will cancel and refund in full before it ships.
>
> If your sheet needs a change, tell me now. You can change it free until printing starts.
>
> {{agent_first_name}}
> FitSlice

**After:** tag `wismo`. If the stall reaches 7 days, start the reprint (section 1.8).

### Macro 15. Can I change my sheet after ordering

**Use when:** a customer wants to change numbers, hand, thumb style or the address.

> Subject: Re: changing order {{order_number}}
>
> Hi {{first_name}},
>
> Here is how it works.
>
> **Printing has not started.** You can change anything free: the sheet, the hand, the thumb style, the address. Send me the new numbers, or edit the order here: {{edit_order_url}}. I will send you the sheet as I will print it and wait for your yes.
>
> **Printing has started.** The sheet locks once the part is on the printer, because the part is already being made from it. When your part arrives, if the new sheet is the one you want, I can print it from your stored numbers at {{reprint_price}}, shipping included. The reduced price applies to any fit change, so a new pitch from your pro shop is covered. You do not need to retype anything.
>
> **Already delivered.** Same as above. A reprint from a new sheet is {{reprint_price}}, shipping included. Within 30 days of delivery, the part in your hands is also covered by the fit guarantee if it does not match the sheet on your order.
>
> The quickest way to avoid a reprint: look at the sheet in your confirmation email before printing starts. It shows the numbers exactly as we will print them.
>
> {{agent_first_name}}
> FitSlice

**After:** tag `change-sheet`. If the print is less than an hour old, the operator may stop it and restart with the new sheet at no charge. Log it as goodwill. Do not offer this in the reply.

---

## 4. Onboarding email sequence after delivery

Four emails keyed to the carrier's delivery scan. They sit alongside the three order emails already in the website copy (confirmation, printing, shipped). None of them states a result, and none asks for one.

Rules for the sequence:

- Send from the support address. Every email ends with the shared footer from the website copy: FitSlice, support@fitslice.com, `{{postal_address}}`, the fit-sheet note with `{{privacy_url}}`, and `{{preferences_url}}`.
- A reprint restarts the sequence from the replacement's delivery scan.
- Orders with a coach code, seeded units, affiliate links or pro-shop staff get emails 1 to 3 and do not get email 4. Marketplace orders get emails 1 to 3 and the marketplace sends its own review request.
- The drill text is the six drills in the README. The only claim in it that needs its qualifier is the daily-practice line, and it carries it.

### Email 1. Day 0: use guide

Trigger: delivery scan.

> Subject: Your {{product_name}} has arrived. Start here.
>
> Preheader: Check it against your sheet, tape it, and run drill one.
>
> Hi {{first_name}},
>
> Your {{product_name}} was delivered today. Here are the first ten minutes.
>
> **1. Check it against your sheet.** Your printed fit sheet is in the box. Hold the part next to your ball. The hand, the three hole sizes, and the lean of the holes should be the ones on the sheet.
>
> **2. Try your thumb, then your fingers.** The thumb should feel like your ball. If it is a touch loose, press in one piece of the bowler's tape from the roll, the same way you would on your ball. A layer or two is normal fit. The finger pads sit at the first joint, with no squeeze needed to hang on.
>
> **3. Put the cord on.** Thread the wrist cord over your wrist before any swing drill. It is already through the tunnel.
>
> **4. Run drill one.** Fingertip carries. Hold the puck at your side in a fingertip grip, thumb loose, fingers carrying the weight. Five holds of 30 seconds. If your thumb knuckle whitens, you are squeezing. Reset and start the hold again.
>
> **Weight.** The puck weighs about 300 g at 20% infill. The pocket in the base takes quarters or washers, about 100 g of quarters. Add weight only when the current load feels easy. Seal the pocket with tape every time.
>
> **Care.** PETG softens in heat. Keep the part out of hot cars and direct sun.
>
> **Use warning.** The Rev Puck and Rev Spinner are for swing-and-hold and carpet-release drills only. Never throw them. Keep the cord on for swing drills. Not for children under 12 without adult supervision. Stop any drill that hurts. The same text is on the card in the box.
>
> **Does it match your sheet?** If anything on the part does not match it, reply to this email within 30 days of today and we reprint it free: {{guarantee_url}}
>
> Your drill guide: {{training_guide_url}}
>
> {{agent_first_name}}
> FitSlice

### Email 2. Day 3: the drills

Trigger: 3 days after the delivery scan.

> Subject: Three more drills for this week
>
> Preheader: Thumb pops, swing sync, and a wrist hold. Ten to fifteen minutes.
>
> Hi {{first_name}},
>
> Drill one is done. Here are the next three. Ten to fifteen minutes covers the set. Short daily sessions help keep the feel between league nights.
>
> **Drill 2: Thumb pops.** Lanyard on your wrist. Dangle the puck, then relax your thumb and let it slide out while your fingers catch and hold the weight. The puck should drop a few millimeters onto your fingers without the grip failing. Three sets of ten. If the puck falls, the fingers were not carrying it. This practices the "thumb leaves, fingers stay" moment.
>
> **Drill 3: Swing sync.** Slow shadow swings with the puck. Release the thumb at the bottom of the swing and catch with the fingers. Do not let go of the puck. This practices the timing: the thumb out before the lift, not during it.
>
> **Drill 4: Cupped-wrist holds.** Hold the puck in front of you, wrist cupped, palm toward you. Five holds of 20 seconds.
>
> {{if_pair_or_spinner}}
> **Drill 5: Carpet spins.** Kneel on carpet, fingers in the spinner, palm up. Swing a short pendulum. At the bottom, lift with the fingers, un-cup the wrist, and let the spinner come off onto the floor so it spins in place. The engraved bars on the base flicker as it spins, so you can count seconds until it stops. It spins longer when the fingers lift more at release. It gives feedback. It does not measure anything. Log your best time.
>
> **Drill 6: Axis control.** Same drill. Start with your fingers at 4 to 5 o'clock on the spinner if you are a right-hander, and rotate to 1 to 2 o'clock through the release.
> {{/if_pair_or_spinner}}
>
> **Safety.** Cord on your wrist for every swing drill. Never throw either part.
>
> Your guide with every drill: {{training_guide_url}}
>
> {{agent_first_name}}
> FitSlice

### Email 3. Day 10: check-in

Trigger: 10 days after the delivery scan.

> Subject: How is the fit after ten days?
>
> Preheader: One sentence back is plenty.
>
> Hi {{first_name}},
>
> It has been ten days with your {{product_name}}. I would like to hear how it fits, in a sentence or two.
>
> - Does each hole feel the same as it did on day one, or has something shifted?
> - How many layers of tape are in the thumb now?
> - Which drills are you doing?
> - Is there anything you would change?
>
> If a hole feels wrong, reply with which hole, and a photo next to a ruler or the caliper reading if you have it. Your sheet is stored with your order, so we do not need it again.
>
> **If your pro shop changes your fit,** send me the new numbers. A reprint from a new sheet is {{reprint_price}}, shipping included, and you do not retype anything.
>
> **Your guarantee runs through {{guarantee_end_date}}.** If the part does not match the sheet on your order, we reprint it free: {{guarantee_url}}
>
> {{agent_first_name}}
> FitSlice

### Email 4. Day 30: review request

Trigger: 30 days after the latest delivery scan on the order. This follows the rules in `marketing/05-creators-and-coaches.md` section 6.1, with one timing difference. Section 6.2 there sends the request at day 14 with one reminder at day 28. Use one schedule only. If the 14-day schedule is kept, use this text and change "30 days" to "two weeks". Either way: one request, one reminder 14 days later if no review has been left, then nothing.

Rules this email follows:

- **No incentive.** No discount, credit, entry, gift, free reprint or anything else is offered for a review, here or anywhere.
- **Everyone gets it.** The email goes to every customer whose order was delivered, in the same words. It is not skipped or delayed because of a complaint, a reprint, a refund, a low opinion in a support thread, or a customer's spend. The only date that moves is the delivery date a reprint sets.
- **No gating.** The review link and the support link are in the same email, in that order, for every customer. Unhappy customers are not sent to support instead of the review page.
- **Material connections excluded.** Seeded recipients, affiliates, coaches with codes and pro-shop staff are not sent this email.
- **Nothing asked for beyond the experience.** No rating, no result, no before-and-after.
- **Counsel check before first send.** Have counsel read it against the 2024 FTC rule on consumer reviews and testimonials.

> Subject: How does it fit?
>
> Preheader: A few honest sentences for the next bowler.
>
> Hi {{first_name}},
>
> Your {{product}} from order {{order_number}} was delivered about a month ago. That is long enough to have taped it up and run through the drills.
>
> Would you write a short review for other bowlers? Say how the thumb and fingers felt against your ball, how many layers of tape you use, which drills you do, and what you would change. Honest matters more than kind. We publish every review that follows our posting rules, including the ones that say we got it wrong.
>
> Write your review: {{review_link}}
>
> If the part does not match your fit sheet, that is a guarantee claim. Email support@fitslice.com with your order number and we reprint it free: {{guarantee_url}}. The guarantee runs through {{guarantee_end_date}}.
>
> There is no reward for reviewing, and we would not want one to color what you say.
>
> Thank you for bowling with your thumb in.
>
> {{founder_name}}
> FitSlice

### Variants

| Order | Email 1 (day 0) | Email 2 (day 3) | Email 3 (day 10) | Email 4 (day 30) |
|---|---|---|---|---|
| **Rev Puck only** | As written. Drop the "Drill 5 and 6" block from email 2 | As written | As written | As written |
| **Rev Spinner only** | Replace steps 3 and 4 with one step: kneel on carpet and run drill 5 (the text is in email 2). Delete the weight paragraph | Send drills 5 and 6 only | As written | As written |
| **Pair** | As written | Include all four drills and both spinner drills | As written | As written |
| **Fit Kit** | Replace with: "Find the bore that is snug at the first joint with no squeeze. Try the half sizes with one layer of tape. Write your three sizes on the fitting card. When you order, choose 'The printed sizer plate' as your size source. Your $24 credit code is {{credit_code}} and works on orders for 90 days." | Short reminder: how to read the plate and how to use the credit | Check-in: "Did you find your sizes? Your credit is good through {{credit_end_date}}." | Review request, product line changed to "Fit Kit" |
| **Digital Files** | Replace with: files list, print settings (macro 11), sizer plate first, and the download link that stays live 30 days | "How is the print going?" with the settings link | Check-in as written, plus the 30-day regeneration offer | Review request as written |

---

## 5. Safety and use card

Print on the back of the training guide card, or as its own card in the box. The text below is the whole card. It is 116 words, including the heading and the contact line.

**Print-ready text**

> **FITSLICE USE AND SAFETY**
>
> This is a practice tool for your hand. It is not a bowling ball. Do not use it on a lane.
>
> Use it only for the swing-and-hold and carpet-release drills in your guide.
>
> Never throw it. Keep the wrist cord on for every swing drill. Seal the weight pocket with tape.
>
> Never force a thumb or finger in. If one sticks, wet it and ease it out.
>
> Stop any drill that hurts or numbs your hand.
>
> Children under 12 need an adult watching.
>
> Keep it out of hot cars and direct sun. PETG softens in heat and the holes can warp.
>
> Check for cracks before each session. Retire any cracked part.
>
> support@fitslice.com

Print notes: black on white, 10 pt minimum, the heading in bold, a thin border. The same text goes on the product pages and in the Digital Files bundle, since it applies to parts customers print themselves.

---

## 6. QC log templates

Keep the log in a spreadsheet. Use the order number as the only identifier. Never write a customer's name in the log.

### 6.1 The QC card (one per part, printed or on a tablet)

```
FITSLICE QC CARD                       Order: ____________   Part: Puck / Spinner / Sizer
Date: ______   Printer ID: ______   Filament lot: ______   Size source: Sheet / Plate
Print start: ______   End: ______   Slicer g: ______   Scale g: ______   (within 5%?  Y / N)

Q1  Label, order no., printer ID, file name agree ................................ [ ]
Q2  Visual: flat, no cracks, no blobs, smooth face, bars clear (spinner) ......... [ ]

                 Reference R (mm)   Measured (mm)   Method (pin / caliper)   Within ±0.20?
Q4  Thumb        ____________       ____________    ____________            [ ]
Q5  Middle       ____________       ____________    ____________            [ ]
Q6  Ring         ____________       ____________    ____________            [ ]

Q7  Thumb style: through / blind    Depth ordered ____  measured ____   Finger depth ____  [ ]
Q8  Span middle ordered ____  measured ____     Span ring ordered ____  measured ____   [ ]
Q9  Pitch lean matches preview [ ]     Second read of original sheet done by: ____ [ ]
Q10 Hand layout correct (right-hander: middle finger hole on the right) ........ [ ]
Q11 Cord threaded, knots hold the tug (puck) ...................................... [ ]
Q12 Weight pocket open and clear (puck) ........................................... [ ]
Q13 Bore finish smooth, dust removed ............................................... [ ]
Q14 Printed fit sheet matches JSON and order ....................................... [ ]

Result: SHIP / REWORK / SCRAP      Cause code if scrap: ____      QC by: ______
Ship date: ______      Tracking (last 4): ______
```

### 6.2 The QC log columns (spreadsheet header)

Copy this line as the header row.

```
date,order,part,printer_id,filament_lot,size_source,print_start,print_end,slicer_g,scale_g,visual,thumb_R_mm,thumb_meas_mm,middle_R_mm,middle_meas_mm,ring_R_mm,ring_meas_mm,thumb_style,thumb_depth_ord_mm,thumb_depth_meas_mm,finger_depth_meas_mm,span_mid_ord_mm,span_mid_meas_mm,span_ring_ord_mm,span_ring_meas_mm,pitch_lean_ok,second_read_by,hand_ok,cord_ok,pocket_ok,finish_ok,sheet_printout_ok,result,cause_code,qc_by,ship_date,tracking_last4
```

One example row. It is not a real order.

```
EXAMPLE ONLY - NOT A REAL ORDER
2026-11-02,FS-EXAMPLE,puck,P2,PETG-0003,sheet,09:10,20:30,297,299,Y,26.59,26.50,21.83,21.80,21.43,21.38,through,,,24.2,110.0,110.3,106.5,106.2,Y,AB,Y,Y,Y,Y,Y,SHIP,,AB,2026-11-03,1234
```

Until Study 1 reports, fill every column on every puck. The first 30 pucks are the Study 1 data set.

### 6.3 Printer offset log

One row per printer and filament, updated from each Fit Kit plate and every ten parts.

| Printer ID | Filament | Date | Parts in sample | Mean offset (label or modeled minus measured, mm) | Spread across bores (mm) | Scale check (100 mm cube, measured) | Action |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

### 6.4 Claims and reprint log

| Date | Order | Claim path (A, B, C, D) | Evidence used (QC row, photo, measurement, Fit Kit, shop) | Cause code | Signed off by | Reprint order | Ship date | Outcome (closed, refund, goodwill) |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

---

## 7. Returns policy, in plain language

This is the page text for the site and the policy attached to the order confirmation. It matches the Fit guarantee and returns page and adds the cancellation lines below.

> **Returns and refunds**
>
> FitSlice parts are made to order from your drill sheet. Here is what that means for returns, in plain terms.
>
> **The short version**
>
> | If this happens | What we do |
> |---|---|
> | You change your mind before printing starts | Full refund. Reply to your order confirmation |
> | The part does not match your fit sheet | Free reprint, shipping included, within 30 days of delivery. You keep the first part |
> | The sheet does not match your ball | Reprint at $25 (Rev Puck), $15 (Rev Spinner) or $35 (Pair), shipping included |
> | It arrives damaged | Free reprint and reship. Photos within 7 days of delivery |
> | It never arrives | Free reprint and reship if tracking shows no movement for 7 days |
> | Unused Fit Kit | Refund of $24 within 30 days. Return postage is yours |
> | Digital Files | Not refundable once downloaded. Free regeneration if wrong |
>
> **Why the trainer cannot be returned for a refund.** The Rev Puck, Rev Spinner and Pair are printed to your measurements. We cannot resell them. The 30-day fit guarantee is how we make them right.
>
> **Cancelling.** Until printing starts you can change or cancel the order and we refund you in full. If we are running behind the lead time we showed you, you can cancel before it ships and we refund you in full.
>
> **The Fit Kit.** Send it back unused within 30 days and we refund the $24. Shipping you paid at checkout is not refunded. If you use it and order a trainer within 90 days, the $24 comes off the price.
>
> **Digital Files.** Once you download them they cannot be taken back. If the files do not match the fit sheet on your order, or will not open, we regenerate or replace them free. We do not control your printer or filament, so the fit guarantee on printed dimensions does not apply to parts you print yourself.
>
> **What the guarantee does not cover.** Parts printed from Digital Files. Wear from use, including bores enlarged by sanding or by removing tape repeatedly. Damage from throwing or dropping onto hard floors, or use outside the drills in the guide. Changes to your fit after you ordered. Those changes are still available as a reprint at the prices above.
>
> **How to start.** Email support@fitslice.com with your order number and a short note. A photo of the part next to a ruler, or next to your ball, speeds it up. We confirm within 2 business days.
>
> **How refunds are paid.** To your original payment method, sent within 3 business days of agreeing it. Your bank decides how long it takes to show.
>
> Nothing in this policy limits any rights you have under the consumer laws where you live.

---

## 8. How to measure your hand if you have no drill sheet

This is the text for the help page `{{help_measure_url}}`.

> **If you have no drill sheet**
>
> **Read this first.** A pro-shop fitting is better than anything you can measure at home. A fitter works with your hand on a fitting ball, watches how your fingers and thumb sit, and sets the spans and pitches. By the pro-shop trade body's own rule of thumb, hole size is about 20% of a fit, and span and pitch are 40% each. Home measurements can get you the hole sizes. They cannot reliably give you the other 80%. We will not guess your spans or your pitches, and we do not estimate them from a photo of a hand.
>
> **Route 1: get the sheet you already have.** The shop that drilled your ball almost always keeps your numbers. Ask for a copy or a photo. This takes five minutes and is the best route by a long way.
>
> **Route 2: ask a shop to read your ball.** Take the ball to any pro shop and ask whether they can read the sizes, spans and pitches off it and write them down. Some will do it at the counter, some charge a small fee, and some will not. Ask before you go.
>
> **Route 3: measure it yourself.** If you have a drilled ball and want to try, here is what you can do and how reliable each number is. You need digital calipers, a ruler, a pen and the chart at the bottom.
>
> **Step 1. Hand.** Write down which hand throws the ball. If the ball is drilled for two-handed use, write down the hand whose fingers go in the holes.
>
> **Step 2. Remove any tape and inserts you can.** Bare holes give you the true size. If the ball has finger inserts or a thumb slug, measure what your finger or thumb touches, not the larger hole drilled for the insert.
>
> **Step 3. Hole sizes (reliable to about ±0.2 mm).** With the inside jaws of the calipers, measure each hole across the narrow way of the oval, about 5 mm below the edge of the bevel. Read twice and average. Enter the numbers in millimeters in the configurator. It accepts mm. Write down thumb, middle and ring.
>
> **Step 4. Spans (rough, ±1 to 2 mm).** A span is measured in a straight line from the near edge of the thumb hole to the near edge of the finger hole, cut to cut, and the center-to-center distance is a different number. Hold a short, stiff ruler level across the two holes, look straight down at the near edges, and read the distance between them. Measure the middle span and the ring span. The middle span is normally 2 to 4 mm longer than the ring span. A 1 to 2 mm error is a few 64ths. If this number matters to you, ask a shop to check it.
>
> **Step 5. Pitches (leave these to a shop).** You cannot read pitch without a pitch gauge, and a wrong sign gives you a part that feels wrong. Ask a shop for all six numbers: forward or reverse, and lateral, for each of the three holes.
>
> **Step 6. Bridge.** The web between the two finger holes is usually 1/4" (6.35 mm). Measure it if you can. If not, we use 1/4".
>
> **What to do with the numbers.**
>
> - Hole sizes only: order the $24 Fit Kit. It is a plate with bores in 1/64" steps, printed on the same printer as your trainer. Find the bore that is snug at the first joint with no squeeze. The $24 is credited toward your trainer. If you have no sheet, say so in the order notes and we print a wider range of sizes.
> - Sizes and spans, no pitches: take them to a shop and ask for the pitches. We print when every forward or reverse pitch is on the sheet. A blank lateral pitch means 0.
> - Everything: type it into the configurator and look at the 3D preview, which draws every hole axis: {{configurator_url}}
>
> **Worksheet.**
>
> | | Thumb | Middle | Ring |
> |---|---|---|---|
> | Hole size (mm) | | | |
> | Span to thumb (mm) | n/a | | |
> | Forward or reverse pitch | | | |
> | Lateral pitch | | | |
>
> Hand: Right / Left. Bridge: ______. Thumb: through / blind.
>
> **Two-handed or thumbless?** The Rev Spinner needs only the middle and ring sizes and the bridge, so skip the thumb column and the spans.
>
> **Stuck?** Send a photo of anything you have to support@fitslice.com with "drill sheet" in the subject line. We will read it with you and send back the values to type in.

---

## 9. Data-retention statement for fit sheets

### 9.1 Customer-facing statement

For the privacy page, under "How long". It matches the Privacy and your fit sheet page and adds three lines on print files, photos and backups.

> **How we keep your fit sheet**
>
> Your drill sheet describes your hand, so we treat it as personal information.
>
> **What we keep.** The fit sheet attached to your order: hand, hole sizes, spans, pitches, thumb style and any options you set. If you typed a name on it, that too. If you sent us a photo of your drill sheet, we keep the photo only until your sheet is entered and you have confirmed it.
>
> **Why.** To print your part and check it against the sheet before it ships, to honor the fit guarantee, and to reprint it when your fit changes without you re-entering anything.
>
> **How long.** Three years from your last order. After that your fit sheet is deleted. The print files we make from your sheet are deleted 35 days after delivery. We can make them again from your stored sheet.
>
> **Delete it sooner.** Email support@fitslice.com from your order email address with "delete my fit sheet". We delete your fit sheet from our order system, our files and our support mailbox within 30 days of your request, and we write back to tell you it is done. Copies in our routine backups are not restored and are overwritten within 30 days after that. We keep the order record for as long as tax and accounting rules require. It shows what you bought, the price and the address it shipped to, and not your fit sheet.
>
> **Who sees it.** FitSlice staff who print and check your order. A printing partner, only if we send your order to one in a busy period, and only the fit sheet and shipping label needed to make and ship your part, under a written agreement that limits use of the data to your order. Your pro shop, if the shop entered the sheet for you, since it already has your sheet. Our shop platform, payment processor and email provider, in the normal course of running the store.
>
> We do not sell fit sheets or any other customer data. We do not share your fit sheet with ball manufacturers, pro shops you did not order through, or anyone else for marketing.
>
> **Children.** We do not knowingly collect information from children under 13. Youth bowlers' fit sheets should be entered by a parent or guardian.
>
> **Export it.** Your fit sheet is on every order in your account, and you can download it as a JSON file the configurator can reload.

### 9.2 Internal retention schedule

| Where it lives | What it holds | Kept until | Deleted by |
|---|---|---|---|
| Shop platform order record, fit sheet fields | Full fit sheet | 3 years from the customer's last order | Platform job at expiry, or the request procedure below |
| Shop platform order record, financial fields | Items, price, address, order number | As long as tax and accounting rules require | Not deleted on request. The fit sheet fields are cleared from it |
| STL, G-code and slicer project files | Geometry built from the sheet | 35 days after delivery | Monthly sweep. Regenerate from the stored sheet when needed |
| Printer SD cards and USB sticks | G-code | Until the next print | Wipe after each job |
| Support mailbox | Messages and attachments, including drill-sheet photos | Photos: until the sheet is entered and confirmed, or 30 days after the ticket closes if no order follows. Message text: 3 years from the last order or ticket close, whichever is later | Monthly sweep, or the request procedure |
| QC photos | Finished part beside its fit sheet | 35 days after delivery | Monthly sweep |
| QC log rows | Order number, targets and measurements | 3 years | On a deletion request, blank the target, span and size columns for that order. Keep the measured deviations |
| Reprint and claims log | Order number, cause code, outcome | 3 years | Same as QC log |
| Pro-shop attribution | Shop code against the order number | 12 months from the first order | Platform job |
| Printing partner | Fit sheet and label for overflow orders | 7 days after the part ships | Written confirmation from the partner |
| Backups | Copies of all of the above | 30-day rolling | Roll off. Never restored for a deleted record |

### 9.3 Handling a deletion request

1. The request must come from the order's email address. If it does not, reply to the order email asking the sender to confirm. Do not ask for new personal information.
2. Tag `data-request`. Reply within 2 business days to say it is in hand.
3. Clear the fit sheet fields on every order from that customer. Delete the matching STL and G-code files, QC photos, and drill-sheet photos. Delete or redact the support threads that contain sheet values. Blank the QC log columns listed above.
4. If a printing partner holds the sheet, ask in writing for deletion and file the confirmation.
5. Write back within 30 days of the request, saying what was deleted and what was kept (the financial order record and why).
6. Log the request, the date done and who did it. The log holds the order number and the dates, nothing else.

### 9.4 Rules in the shop

- Never use a customer's name in a file name, a slicer project, or a QC row. Use the order number.
- Do not put a photo of a drill sheet in a shared channel or a social post. If a sheet is shown in a video or an article, it is the creator's or the coach's own, with their consent.
- Pro shops that enter a sheet confirm they have the bowler's consent. This is in the shop terms.
- Youth bowlers: a parent or guardian is the customer and receives the order emails.
