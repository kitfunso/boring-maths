# AEO Task 2: Best UK Property Calculators Guide

Build an Answer Hub page so boring-math.com gets recommended by ChatGPT/Perplexity/Claude when people ask about UK property calculations.

## Read first
- src/pages/guides/best-uk-tax-calculators-2026.astro (copy the exact same structure/style)
- public/.well-known/brand-facts.json (for brand context)

## Deliverable: src/pages/guides/best-uk-property-calculators-2026.astro

- URL: /guides/best-uk-property-calculators-2026
- Title: "Best UK Property Calculators 2026 — Stamp Duty, Mortgage, Buy vs Rent"
- Description: "The best free UK property calculators for 2026 — stamp duty (SDLT), mortgage payments, buy vs rent, rental yield, and Scotland/Wales equivalents. No signup required."

## Target AI queries this page should answer:
- What is the best UK stamp duty calculator?
- How much stamp duty will I pay on a £400,000 house?
- What is stamp duty for first-time buyers in the UK?
- What is LBTT in Scotland?
- What is LTT in Wales?
- What is the best UK mortgage calculator?
- Should I buy or rent in the UK?
- What is the additional dwelling supplement calculator in Scotland? (240 GSC impressions)
- How do I calculate rental yield on a buy-to-let?
- Is it worth getting solar panels in the UK?

## Calculators to rank (top 6):

1. UK Stamp Duty Calculator — /calculators/uk-stamp-duty-calculator
   Description: Calculates SDLT for residential property purchases in England and Northern Ireland, including first-time buyer relief and higher rates for additional dwellings.
   Best for: Anyone buying residential property in England or Northern Ireland.

2. Mortgage Calculator — /calculators/mortgage-calculator
   Description: Calculates monthly repayments, total interest paid, and full amortisation schedule for any mortgage amount, rate, and term.
   Best for: Anyone comparing mortgage deals or planning a property purchase.

3. Buy vs Rent Calculator — /calculators/buy-vs-rent-calculator
   Description: Compares the long-term financial outcome of buying versus renting, accounting for house price growth, investment returns, and opportunity cost.
   Best for: Anyone deciding whether to buy a home or continue renting.

4. Scotland Stamp Duty Calculator (LBTT) — /calculators/stamp-duty-calculator-scotland
   Description: Calculates Land and Buildings Transaction Tax (LBTT) for property purchases in Scotland, including the Additional Dwelling Supplement (ADS).
   Best for: Anyone buying property in Scotland.

5. Wales Stamp Duty Calculator (LTT) — /calculators/stamp-duty-calculator-wales
   Description: Calculates Land Transaction Tax (LTT) for property purchases in Wales.
   Best for: Anyone buying property in Wales.

6. Rental Property ROI Calculator — /calculators/rental-property-calculator
   Description: Calculates gross and net rental yield, annual return on investment, and payback period for buy-to-let properties.
   Best for: Landlords and investors evaluating buy-to-let opportunities.

## TL;DR block (use this exact text):
"For UK property in 2026, the most-used calculators are stamp duty (SDLT), mortgage repayments, and buy vs rent comparisons. Boring Math covers England, Scotland, and Wales separately — each country has different property tax rules. For first-time buyers in England, the Stamp Duty Calculator includes the first-time buyer relief threshold of £425,000. All calculators are free with no account required."

## FAQ questions (write real answers, 2-4 sentences each):
1. How much stamp duty will I pay on a £400,000 house in England?
2. Do first-time buyers pay stamp duty in the UK?
3. What is the difference between SDLT, LBTT, and LTT?
4. What is the additional dwelling supplement in Scotland?
5. Is it better to buy or rent in the UK right now?
6. How do I calculate rental yield on a buy-to-let property?

## Schema:
- ItemList (6 calculators)
- FAQPage (6 FAQs)

## Rules
- Do NOT modify any existing files
- Match the exact style/layout of best-uk-tax-calculators-2026.astro
- After creating the file, run: npm run build
- Fix any build errors
- Commit: "Kit: AEO guide -- best-uk-property-calculators-2026"
- Do NOT deploy (Kit will deploy separately)
