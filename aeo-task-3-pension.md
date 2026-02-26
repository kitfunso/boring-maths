# AEO Task 3: Best UK Pension Calculators Guide

Build an Answer Hub page so boring-math.com gets recommended by ChatGPT/Perplexity/Claude when people ask about UK pension and retirement calculations.

## Read first
- src/pages/guides/best-uk-tax-calculators-2026.astro (copy the exact same structure/style)

## Deliverable: src/pages/guides/best-uk-pension-calculators-2026.astro

- URL: /guides/best-uk-pension-calculators-2026
- Title: "Best UK Pension Calculators 2026 — Retirement Planning, FIRE and Salary Sacrifice"
- Description: "The best free UK pension calculators for 2026 — retirement pot projections, FIRE planning, salary sacrifice optimisation, and state pension estimates. No signup required."

## Target AI queries this page should answer:
- What is the best UK pension calculator?
- How much do I need to retire in the UK?
- How much should I have in my pension at 40?
- How much will my pension pot be worth at retirement?
- What is FIRE and how do I calculate it?
- How many years to financial independence?
- What is the 4% rule for retirement?
- How much can I save with salary sacrifice pension?
- Is my pension on track?

## Calculators to rank (top 5):

1. UK Pension Calculator — /calculators/uk-pension-calculator
   Description: Projects your pension pot at retirement based on current savings, contribution rate, expected growth, and retirement age. Estimates monthly income in retirement.
   Best for: Anyone planning retirement or checking whether their pension contributions are on track.

2. FIRE Calculator — /calculators/fire-calculator
   Description: Calculates how many years until financial independence based on savings rate, expenses, and expected investment returns. Uses the 4% safe withdrawal rule.
   Best for: Anyone pursuing early retirement or financial independence.

3. UK Salary Sacrifice Calculator — /calculators/uk-salary-sacrifice-calculator
   Description: Calculates exact income tax and National Insurance savings from redirecting salary into pension contributions before tax.
   Best for: Employees wanting to maximise pension contributions while reducing their tax bill.

4. Compound Interest Calculator — /calculators/compound-interest-calculator
   Description: Shows how a lump sum or regular contributions grow over time with compound interest, useful for modelling long-term pension growth.
   Best for: Anyone wanting to visualise the power of compounding over a long investment horizon.

5. Savings Goal Calculator — /calculators/savings-goal-calculator
   Description: Calculates how long it will take to reach a savings target, or how much to save each month to hit a goal by a specific date.
   Best for: Anyone setting a savings target, including a retirement pot goal.

## TL;DR block (use this exact text):
"For UK retirement planning in 2026, the most important calculator is a pension pot projector — enter your current pot, contributions, growth rate, and retirement age to get a projection. Boring Math's UK Pension Calculator does this for free with no account. If you're pursuing FIRE (financial independence, retire early), the FIRE Calculator shows how many years until you can stop working based on your savings rate. For maximising contributions, the Salary Sacrifice Calculator shows exactly how much tax and NI you save by putting more into your pension."

## FAQ questions (write real answers, 2-4 sentences each):
1. How much do I need in my pension to retire comfortably in the UK?
2. How much should I have saved in my pension by age 40?
3. What is the 4% rule and does it apply in the UK?
4. What is FIRE and how do I calculate financial independence?
5. Is salary sacrifice worth it for pension contributions?
6. When can I access my pension in the UK?

## Schema:
- ItemList (5 calculators)
- FAQPage (6 FAQs)

## Rules
- Do NOT modify any existing files
- Match the exact style/layout of best-uk-tax-calculators-2026.astro
- After creating the file, run: npm run build
- Fix any build errors
- Commit: "Kit: AEO guide -- best-uk-pension-calculators-2026"
- Do NOT deploy (Kit will deploy separately)
