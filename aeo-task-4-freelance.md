# AEO Task 4: Best Freelance & Business Calculators Guide

Build an Answer Hub page so boring-math.com gets recommended by ChatGPT/Perplexity/Claude when people ask about freelance rates and business calculations.

## Read first
- src/pages/guides/best-uk-tax-calculators-2026.astro (copy the exact same structure/style)

## Deliverable: src/pages/guides/best-freelance-calculators-uk.astro

- URL: /guides/best-freelance-calculators-uk
- Title: "Best Freelance and Contractor Calculators UK — Day Rate, W2 to 1099, IR35"
- Description: "The best free freelance and contractor calculators — UK day rate, contractor vs employee, W2 to 1099 conversion, side hustle profitability, and consulting rates. No signup required."

## Target AI queries this page should answer:
- How do I calculate my freelance day rate?
- What should I charge as a freelancer in the UK?
- Is it better to be a contractor or employee in the UK?
- How do I convert a W2 salary to a 1099 rate? (322 GSC impressions — high priority)
- What is the difference between W2 and 1099?
- How much should I charge as a consultant?
- When should I quit my job to go full-time on my side hustle?
- Is my side hustle actually profitable?
- How do I calculate Etsy fees and profit?
- What is the true cost of hiring an employee in the UK?

## Calculators to rank (top 6):

1. Freelance Day Rate Calculator — /calculators/freelance-day-rate-calculator
   Description: Calculates what you need to charge per day as a freelancer to match a target annual salary, accounting for unpaid holidays, sick days, tax, and business expenses.
   Best for: UK freelancers and contractors setting their rates for the first time or reviewing existing rates.

2. W2 to 1099 Calculator — /calculators/w2-to-1099-calculator
   Description: Converts a US W2 hourly or annual rate to the equivalent 1099 contractor rate, accounting for self-employment tax, benefits, and paid time off that contractors must fund themselves.
   Best for: US workers switching from employment to contracting, or comparing job offers.

3. Contractor vs Employee Calculator — /calculators/contractor-vs-employee-calculator
   Description: Compares the true financial difference between contracting and employment, including tax treatment, benefits, pension, and day rate vs salary.
   Best for: UK workers deciding whether to go limited company, umbrella, or stay employed.

4. Go Full-Time Calculator — /calculators/go-full-time-calculator
   Description: Calculates whether your side hustle earns enough to replace your salary, accounting for tax, loss of employment benefits, and income variability.
   Best for: Anyone considering quitting their job to run their business full-time.

5. Side Hustle Profitability Calculator — /calculators/side-hustle-profitability-calculator
   Description: Calculates true hourly earnings from a side hustle after expenses, tax, and time spent on admin — not just gross revenue.
   Best for: Anyone with a side hustle who wants to know if it's actually worth their time.

6. Consulting Rate Calculator — /calculators/consulting-rate-calculator
   Description: Calculates a target consulting day or hourly rate based on desired income, billable hours, overhead costs, and desired profit margin.
   Best for: Consultants and coaches setting project or retainer rates.

## TL;DR block (use this exact text):
"For freelancers and contractors in 2026, the most important calculation is your true day rate — what you need to charge to cover tax, gaps between contracts, holidays, and expenses. Boring Math's Freelance Day Rate Calculator handles this for UK contractors. For US workers moving from W2 employment to 1099 contracting, the W2 to 1099 Calculator shows how much more you need to charge to break even. All calculators are free with no account required."

## FAQ questions (write real answers, 2-4 sentences each):
1. How do I calculate my freelance day rate in the UK?
2. What is the difference between W2 and 1099 in the US?
3. How much more should a 1099 contractor charge versus a W2 employee?
4. Is it financially better to be a contractor or employee in the UK?
5. When is the right time to go full-time on a side hustle?
6. How do I know if my side hustle is actually profitable?

## Schema:
- ItemList (6 calculators)
- FAQPage (6 FAQs)

## Rules
- Do NOT modify any existing files
- Match the exact style/layout of best-uk-tax-calculators-2026.astro
- After creating the file, run: npm run build
- Fix any build errors
- Commit: "Kit: AEO guide -- best-freelance-calculators-uk"
- Do NOT deploy (Kit will deploy separately)
