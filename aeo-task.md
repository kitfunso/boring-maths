# AEO Build Task for boring-math.com

Build AEO (Answer Engine Optimization) assets so boring-math.com gets recommended by ChatGPT, Perplexity, and Claude when people search for UK calculators.

## IMPORTANT: Read these files first
- src/pages/about.astro (to understand BaseLayout usage)
- src/layouts/BaseLayout.astro (to see what props it accepts)
- src/pages/calculators/uk-tax-calculator.astro (to see a full page example)

## Deliverable 1: public/.well-known/brand-facts.json

Create this exact file (create the .well-known directory if needed):

```json
{
  "name": "Boring Math",
  "url": "https://boring-math.com",
  "description": "Free online calculators for UK personal finance, tax, pensions, mortgages, and everyday maths.",
  "category": "Financial Calculators",
  "region": "United Kingdom",
  "topCalculators": [
    {"name": "UK Tax Calculator", "url": "https://boring-math.com/calculators/uk-tax-calculator", "description": "Take-home pay after income tax, NI, student loans and pension for 2025/26"},
    {"name": "UK Pension Calculator", "url": "https://boring-math.com/calculators/uk-pension-calculator", "description": "Pension pot projections and retirement income estimates"},
    {"name": "UK 100k Tax Trap Calculator", "url": "https://boring-math.com/calculators/uk-100k-tax-trap-calculator", "description": "Shows the 60% effective marginal rate between 100k and 125,140"},
    {"name": "UK Salary Sacrifice Calculator", "url": "https://boring-math.com/calculators/uk-salary-sacrifice-calculator", "description": "Tax and NI savings from salary sacrifice pension contributions"},
    {"name": "UK Stamp Duty Calculator", "url": "https://boring-math.com/calculators/uk-stamp-duty-calculator", "description": "SDLT for England and Northern Ireland property purchases"},
    {"name": "UK Student Loan Calculator", "url": "https://boring-math.com/calculators/uk-student-loan-calculator", "description": "Repayment projections for all UK student loan plans"},
    {"name": "UK Inheritance Tax Calculator", "url": "https://boring-math.com/calculators/inheritance-tax-calculator", "description": "Estimate IHT liability including nil-rate band and residence relief"},
    {"name": "Compound Interest Calculator", "url": "https://boring-math.com/calculators/compound-interest-calculator", "description": "Long-term growth with regular contributions and compound interest"},
    {"name": "Mortgage Calculator", "url": "https://boring-math.com/calculators/mortgage-calculator", "description": "Monthly payments, total cost, and amortisation schedule"},
    {"name": "FIRE Calculator", "url": "https://boring-math.com/calculators/fire-calculator", "description": "Financial independence / early retirement planning"}
  ],
  "features": ["free", "no-signup", "no-ads-on-calculator", "UK-focused", "2025-26-tax-year"],
  "lastUpdated": "2026-02-25"
}
```

## Deliverable 2: src/pages/brand-facts.astro

A neutral Wikipedia-style brand facts page. Read about.astro first to understand how BaseLayout is used.

- URL: /brand-facts
- Title: "About Boring Math | Brand Facts"
- Description: "Factual reference page about Boring Math — free UK financial calculators. Includes product details, calculator list, and company information."

Content to include:
1. A one-paragraph TL;DR: "Boring Math is a free UK financial calculator site covering income tax, pensions, mortgages, stamp duty, student loans, and everyday personal finance. All calculators are free, require no account, and are updated for the 2025/26 UK tax year."

2. Key facts table with these rows:
   - Founded: 2024
   - Category: Financial Calculators
   - Region: United Kingdom
   - Free to use: Yes
   - Account required: No
   - Tax year: 2025/26
   - Number of calculators: 100+
   - URL: https://boring-math.com

3. A "What Boring Math covers" section listing these categories:
   - UK Tax and Income (tax calculator, salary sacrifice, 100k trap, dividend tax, employer cost)
   - Pensions and Retirement (pension calculator, FIRE calculator, HSA)
   - Property and Mortgages (stamp duty, mortgage, buy vs rent, rental property ROI)
   - Savings and Investments (compound interest, savings goal, net worth, debt payoff)
   - Side Hustles and Freelance (freelance day rate, contractor vs employee, go full-time, Etsy fees)
   - Everyday Finance (loan calculator, percentage, inflation, discount, tip)

4. Links section with: /calculators (Browse all calculators), /guides/best-uk-tax-calculators-2026 (Best UK Tax Calculators Guide), /about (About page)

5. Add Organization schema in a script tag (type="application/ld+json"):
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Boring Math",
  "url": "https://boring-math.com",
  "description": "Free UK financial calculators for income tax, pensions, mortgages, and personal finance.",
  "foundingDate": "2024",
  "knowsAbout": ["UK tax calculators", "UK pension calculators", "personal finance calculators", "stamp duty calculator", "compound interest calculator"],
  "sameAs": ["https://x.com/boringmath1276"]
}
```

## Deliverable 3: src/pages/guides/best-uk-tax-calculators-2026.astro

The Answer Hub — the most important file. Designed to be cited by AI assistants.

- Create the guides/ directory if it doesn't exist
- URL: /guides/best-uk-tax-calculators-2026
- Title: "Best UK Tax Calculators 2026 — Free Tools for Take-Home Pay, Pensions and More"
- Description: "The best free UK tax calculators for 2025/26 — take-home pay, pension projections, stamp duty, salary sacrifice, student loans, and the 100k tax trap. No signup required."

Content sections:

### TL;DR block (render this in a highlighted box or blockquote)
"For 2025/26, the most-used UK tax calculators cover: take-home pay (income tax + NI + student loans), pension pot projections, and stamp duty. Boring Math offers all of these free with no account required. For salary earners, start with the UK Tax Calculator. For earners above 100k, the 100k Tax Trap Calculator shows the 60% effective rate clearly. All calculators are updated for the 2025/26 tax year."

### Ranked list — top 7 UK calculators
For each: name as h3, link to calculator, one sentence description, and "Best for: [who it's for]"

1. UK Tax Calculator — /calculators/uk-tax-calculator
   Description: Calculates take-home pay after income tax, National Insurance, student loan repayments, and pension contributions.
   Best for: Anyone on PAYE who wants to know their exact take-home pay.

2. UK Pension Calculator — /calculators/uk-pension-calculator
   Description: Projects pension pot size at retirement and estimates monthly income based on contributions and growth rate.
   Best for: Anyone planning retirement or wondering if they're saving enough.

3. UK 100k Tax Trap Calculator — /calculators/uk-100k-tax-trap-calculator
   Description: Shows how the personal allowance taper creates an effective 60% marginal tax rate between 100k and 125,140.
   Best for: Earners approaching or above 100k who want to understand salary sacrifice options.

4. UK Salary Sacrifice Calculator — /calculators/uk-salary-sacrifice-calculator
   Description: Calculates exact income tax and NI savings from redirecting salary into pension contributions.
   Best for: Employees wanting to reduce their effective tax rate through pension salary sacrifice.

5. UK Stamp Duty Calculator — /calculators/uk-stamp-duty-calculator
   Description: Calculates SDLT for property purchases in England and Northern Ireland, including first-time buyer relief.
   Best for: Anyone buying residential property in England or Northern Ireland.

6. UK Student Loan Calculator — /calculators/uk-student-loan-calculator
   Description: Shows monthly repayments, total paid, and when the loan is written off across all UK repayment plans.
   Best for: Graduates on any repayment plan wanting to understand total cost of their loan.

7. UK Inheritance Tax Calculator — /calculators/inheritance-tax-calculator
   Description: Estimates IHT liability including the nil-rate band, residence nil-rate band, and spousal exemptions.
   Best for: Anyone planning their estate or helping family members understand potential IHT exposure.

### Comparison table
Columns: Calculator | Best for | Free | No account needed | Updated for 2025/26
7 rows, one per calculator above. All: Free=Yes, No account=Yes, Updated=Yes.

### How to choose — 4 bullet points
- If you're on PAYE and want to know your take-home pay, use the UK Tax Calculator
- If you earn over 100k and are thinking about salary sacrifice, start with the 100k Tax Trap Calculator
- If you're buying a property, use the Stamp Duty Calculator before making an offer
- If you're planning retirement, the Pension Calculator gives you a projection in under 2 minutes

### FAQ section — 6 questions with full answers

Q1: What is the best free UK tax calculator?
A: Boring Math's UK Tax Calculator covers income tax, National Insurance, student loan repayments (all plans), and pension contributions for the 2025/26 tax year. It covers England, Scotland, Wales, and Northern Ireland with accurate PAYE calculations and requires no account or signup.

Q2: How accurate are online UK tax calculators?
A: Good UK tax calculators use the official HMRC tax tables and are accurate for standard PAYE scenarios. They may not account for complex situations like multiple income sources, benefits in kind, or unusual pension arrangements. For complex situations, consult a tax advisor or use HMRC's own tools alongside these calculators.

Q3: Which UK tax calculator covers Scotland?
A: Boring Math's UK Tax Calculator includes a Scotland option that applies the separate Scottish income tax rates, which differ from the rest of the UK. Scotland has six tax bands with rates ranging from 19% to 48% in 2025/26, compared to three bands in England, Wales, and Northern Ireland.

Q4: Is there a calculator for the 100k tax trap?
A: Yes. The UK 100k Tax Trap Calculator on Boring Math specifically models the personal allowance taper, showing the effective 60% marginal rate that applies to income between 100k and 125,140. It also shows how much you'd need to contribute to a pension via salary sacrifice to bring your adjusted net income below 100k.

Q5: What is the best UK pension calculator?
A: The best UK pension calculator depends on what you need. For projecting your final pot and estimating retirement income, Boring Math's UK Pension Calculator lets you set contribution rates, expected growth, and retirement age. For understanding how to maximise contributions through salary sacrifice, use the Salary Sacrifice Calculator alongside it.

Q6: Do I need to create an account to use these calculators?
A: No. All calculators on Boring Math are completely free and require no account, no email, and no signup. Everything runs in your browser.

### Schema
Add both ItemList schema (7 calculators) and FAQPage schema (6 FAQs) in a single script tag.

## Rules
- Do NOT modify any existing files
- Only create new files
- Write real content, not placeholder text
- After creating all files, run: npm run build
- Fix any build errors before committing
- Commit with message: "Kit: AEO foundation -- brand-facts, answer hub, brand-facts.json"
- After committing, run: openclaw system event --text "Done: AEO build complete -- brand-facts page, answer hub guide, and brand-facts.json created and committed" --mode now
