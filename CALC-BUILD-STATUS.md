# Calculator Build Task - STATUS / HANDOFF

> Working doc for the "build 4 new calculators via workflow + striking-distance SEO" task.
> If context runs out, a future agent resumes from here.

## Task (from Keith, 2026-05-28)
1. Increase boring-math.com traffic.
2. Build 4 new calculators **in parallel via the Workflow tool**:
   - UK Mortgage Affordability ("how much can I borrow")
   - Mortgage Overpayment
   - UK Holiday Entitlement (pro-rata statutory)
   - UK Redundancy Pay
3. Then do striking-distance SEO (eu-salary, subscription-audit near page 1).

## Hard constraints (from Keith)
- Follow existing design/pattern. NO overengineering, no fancy animations.
- **NO EMOJIS anywhere in the website.**
- NO fake stats ("trusted by 30,000 users") unless verifiably true.
- **Calculators MUST compute correctly** - credibility depends on it. Write unit tests.
- No em dashes in frontend strings.
- Verify work after building.

## Canonical pattern (verified from codebase)
Each calculator = 2 new files + 1 registry entry:
- `src/pages/calculators/[slug].astro` - imports CalculatorLayout, component, FAQSection, ContentSection, RelatedCalculators. Defines `faqs` (6+) and `related` (3-5) arrays. `<Component client:load />`, slots: content / faq / related.
- `src/components/calculators/[Name]/[Name].tsx` - Preact (`preact/hooks`), `class` not `className`, named const rates, pure calc fn, `Intl.NumberFormat('en-GB', {style:'currency',currency:'GBP'})`, wrapper `<div class="calc-card">`, live (no submit button).
- `src/lib/calculators.ts` - append entry: `{title, description, href, icon, color, category, country?, mostUsed}`.
- Blueprint: `src/components/calculators/CALCULATOR_BLUEPRINT.md`.
- CalculatorLayout auto-generates WebApplication + FAQPage schema from `faqs`.

### Registry field options
- IconName: dollar percent chart shield glass trending calculator cube bolt fire home heart swap calendar paw layers leaf rocket briefcase users
- ColorName: blue green accent violet coral ocean amber pink
- CategoryName incl: Income Finance Business Events Health Home Everyday "UK Tax" Life ...
- country: 'UK' | 'US' | 'EU' (omit if generic)

### Conflict-avoidance (IMPORTANT)
Parallel agents must ONLY create their own 2 new files. They must NOT edit
`src/lib/calculators.ts` (shared file = clobber). The orchestrator adds all 4
registry entries centrally AFTER, then runs ONE build.

## Verified formulas + constants

### Mortgage Affordability (all user inputs - no statutory constant)
- Inputs: annual income, optional joint income, deposit, income multiple (default 4.5), interest rate %, term yrs.
- Max borrow = (income + jointIncome) * multiple.
- Max property price = maxBorrow + deposit.
- Monthly payment at rate r (monthly), n months: P = L*r/(1-(1+r)^-n). If r==0: L/n.
- Show: max borrow, max property price, est monthly payment, LTV.

### Mortgage Overpayment (all user inputs)
- Inputs: balance, interest rate %, remaining term yrs, monthly overpayment, optional one-off lump sum.
- Amortise monthly with and without overpayment. Compare total interest + payoff time.
- monthly rate = APR/12/100. Standard payment from balance/term. Then simulate:
  each month interest=bal*mr; principal=payment-interest(+overpay); bal-=principal until <=0.
- Show: interest saved, months/years saved, new payoff date.

### UK Holiday Entitlement (statutory, stable)
- Statutory minimum = 5.6 weeks paid leave, CAPPED at 28 days for a 5-day+ week.
- Full-time 5-day week: 5.6 * 5 = 28 days.
- Part-time: daysPerWeek * 5.6 (cap 28). e.g. 3 days/wk -> 16.8 days.
- Leaver/starter mid-year: entitlement * (monthsWorked/12) or (daysWorked/365).
- Irregular/hours: 12.07% of hours worked (statutory accrual method).
- Inputs: days worked per week, optional full-year entitlement override (default statutory),
  optional fraction of year worked.

### UK Redundancy Pay (statutory) - VERIFY weekly cap before ship
- Eligibility: >=2 years continuous service.
- Per full year of service, by age DURING that year:
  - under 22: 0.5 week's pay
  - 22 to 40 (inclusive of 22, up to 41): 1.0 week's pay
  - 41+: 1.5 week's pay
- Max 20 years counted (count most recent 20).
- Weekly pay CAPPED. 2024/25 cap = £700. 2025/26 (from 6 Apr 2025) cap = **£719** (CONFIRM on gov.uk/redundancy-pay - web verify was blocked by output truncation this session).
- Max statutory total = 20 * 1.5 * cap = £21,570 (if cap £719).
- Inputs: age, full years of service, gross weekly pay. Apply cap to weekly pay for the statutory figure; optionally also show uncapped (contractual) estimate.
- FAQ must state the cap figure + effective date so it is self-verifying.
- Correct age-band tiering: walk each year of service backward from current age.

## Progress log
- [done] Scoped task, picked 4 calcs (gap-checked vs 163 live slugs - all genuine gaps).
- [done] Read blueprint, layout, example component (UKChildBenefit), registry shape.
- [done] Workflow run produced all 4 calcs (calculations + tsx + index + tests).
- [done] Redundancy £719 weekly cap CONFIRMED on gov.uk (effective 6 Apr 2025; was £700 before). FAQ + logic correct.
- [done] Normalized 4 calcs to canonical codebase layout: logic files renamed `[Name].logic.ts` -> `calculations.ts`, named folder imports via index.ts, tests moved from colocated `src/.../[Name].test.ts` to `tests/calculations/[slug].test.ts` (the only location vitest discovers). The workflow followed the handoff's `.logic.ts`/colocated pattern, which did not match the other 149 calcs.
- [done] Central registry merge: 4 entries appended to src/lib/calculators.ts (count 149 -> 153).
- [done] Build: `npm run build` -> 210 pages, 0 errors, all 4 new pages in dist.
- [done] Tests: 20/20 new tests pass (`tests/calculations/{uk-mortgage-affordability,mortgage-overpayment,uk-holiday-entitlement,uk-redundancy-pay}.test.ts`).
- [done] No em dashes / emojis in any new file.
- [PRE-EXISTING, NOT MINE] Full suite has 2 failing files unrelated to this work: `tests/calculations/loan.test.ts` and `tests/calculations/uk-student-loan.test.ts` (drifted "default inputs" assertions). Left untouched - out of scope.
- [next] Striking-distance SEO task below is still TODO. Changes are uncommitted (user has not asked to commit).

## Workflow script location + run
`scripts/workflows/build-calculators.mjs` (authored this session). Re-run via Workflow({scriptPath}).
- Run launched: runId `wf_a4f4ad95dac7`, task `task_4d36e9e3`. Track via /workflows.
- Agents create ONLY: `[Name].logic.ts`, `[Name].tsx`, `[slug].astro`, `[Name].test.ts`. They do NOT edit the registry.

## CENTRAL MERGE (orchestrator does AFTER workflow completes)
Append these 4 entries to the `calculators` array in `src/lib/calculators.ts` (insert near other UK Finance entries, keep `as const`/readonly style, no trailing-slash hrefs, no em dashes):

```ts
  {
    title: 'UK Mortgage Affordability',
    description: 'Work out how much you could borrow for a mortgage based on income, deposit, and interest rate.',
    href: '/calculators/uk-mortgage-affordability-calculator',
    icon: 'home', color: 'blue', category: 'Finance', country: 'UK', mostUsed: false,
  },
  {
    title: 'Mortgage Overpayment',
    description: 'See how much interest and time you save by overpaying your mortgage.',
    href: '/calculators/mortgage-overpayment-calculator',
    icon: 'home', color: 'green', category: 'Finance', country: 'UK', mostUsed: false,
  },
  {
    title: 'UK Holiday Entitlement',
    description: 'Calculate your statutory paid holiday entitlement, including pro-rata for part-time work.',
    href: '/calculators/uk-holiday-entitlement-calculator',
    icon: 'calendar', color: 'violet', category: 'Income', country: 'UK', mostUsed: false,
  },
  {
    title: 'UK Redundancy Pay',
    description: 'Estimate your statutory redundancy pay based on age, years of service, and weekly pay.',
    href: '/calculators/uk-redundancy-pay-calculator',
    icon: 'briefcase', color: 'coral', category: 'Income', country: 'UK', mostUsed: false,
  },
```

## VERIFY CHECKLIST (after merge)
1. `npm run build` -> must pass (0 errors). Fix any import/path issues.
2. `npx vitest run --no-coverage` -> all 4 logic test files pass.
3. Spot-check math by hand:
   - Affordability: income 50000, joint 0, multiple 4.5, deposit 25000 -> max borrow 225000, max price 250000. Monthly at 5%/25yr on 225000 ~= 1315.
   - Overpayment: 200000 @ 5% over 25yr, +100/mo overpay -> interest saved > 0, term shorter. Sanity: base monthly ~1169.
   - Holiday: 3 days/wk -> 16.8 days. 5 days/wk -> 28 (capped). 6 days/wk -> 28 (capped, not 33.6).
   - Redundancy: age 45, 10 yrs service, weekly pay 600. Last years at 41+ = 1.5/yr. If all 10 yrs were at 41+: 10*1.5*600 = 9000. (Tier by age during each year.) Cap weekly pay at 719.
4. Confirm NO emojis: `grep -rn emoji-ish chars` in the 4 new dirs + pages. No em dashes in new strings.
5. Confirm registry count went 149 -> 153.
6. **CONFIRM £719 redundancy weekly cap on gov.uk/redundancy-pay** (was unverifiable this session). Update logic + FAQ if different.

## THEN: striking-distance SEO (separate task)
GSC near-page-1 queries worth a title/intro depth tweak for quick clicks:
- `eu salary calculator 2025` (pos 8.3, getting clicks) -> eu-salary-calculator
- `subscription audit` / `add up my monthly cost for multiple subscriptions` (pos 10.8) -> subscription-audit-calculator
- `boring calculator` (pos 8.3, branded) -> homepage
Action: ensure title/H1/meta include the exact phrasing + a year stamp; add 1-2 sentences of unique depth. Do NOT keyword-stuff (CLAUDE.md rule 5 / scaled-content-abuse risk).
