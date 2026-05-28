# US/EU Calculator Build Spec

> Source of truth for the "9 new US/EU calculators via workflow" task (2026-05-28).
> Build agents read their own section. Orchestrator fills VERIFIED CONSTANTS from the
> verify workflow before the build workflow runs.

## Hard constraints (Keith, non-negotiable)
- Follow the existing design/pattern. NO overengineering, no animations, no charts, no new deps.
- NO EMOJIS anywhere on the site (JSX, comments, strings, content).
- NO em dashes in any frontend string. Use commas / colons / hyphens.
- NO fake stats or social proof ("trusted by N", "#1", star ratings). Only defensible facts.
- Calculators MUST compute correctly. Credibility depends on it. Write unit tests with hand-computed values; fix the math, never the test.
- Where a statutory figure is used, state the figure AND its effective year in the FAQ so the page is self-verifying.

## CANONICAL FILE LAYOUT (match the existing 153 calculators exactly)
Each calculator = these files. Create ONLY your own new files. DO NOT edit `src/lib/calculators.ts` (the orchestrator merges the registry centrally).

1. `src/components/calculators/[Name]/calculations.ts`
   - Pure TypeScript. No JSX, no Preact import. Named UPPER_SNAKE constants. Export a named pure calc function and its result interface. Also export `getDefaultInputs()`. This file is unit-tested.
2. `src/components/calculators/[Name]/[Name].tsx`
   - Preact component. `import { useState } from 'preact/hooks'`. Import the calc fn from `./calculations`. Use `class` not `className`. Live update on input (NO submit button). Wrapper `<div class="calc-card">`. `export default function [Name]()`. Match the reference component's input/result class names exactly. Currency: USD use `new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0})`; EUR use `new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0})` (Germany/France/Ireland all EUR).
3. `src/components/calculators/[Name]/index.ts`
   - `export { default as [Name] } from './[Name]';`
   - `export * from './calculations';`
4. `src/pages/calculators/[slug].astro`
   - Same imports/shape as the reference page: CalculatorLayout + SEOHead + HeroSection + ContentSection + FAQSection, component imported via the folder named import `{ [Name] }`, `client:load`. Title keyword-first, ends ` | Boring Math`. Meta description 150-160 chars with the target keyword. 6+ accurate FAQs. ContentSection 600+ words across h2: "How to use", "How it is calculated" (formula in words), "Understanding your results". `related`: 3-5 entries chosen ONLY from the region-appropriate safe slug list below.
5. `tests/calculations/[slug-without-calculator-suffix].test.ts`
   - Vitest. `import { describe, it, expect } from 'vitest'`. Import the pure fn from `../../src/components/calculators/[Name]/calculations`. At least 4 assertions with hand-computed expected values. Cover an edge case (zero, the cap, the band boundary). THIS LOCATION IS REQUIRED - vitest only discovers `tests/**`.

Reference files to copy the shape from:
- `src/pages/calculators/uk-child-benefit-calculator.astro`
- `src/components/calculators/UKChildBenefitCalculator/UKChildBenefitCalculator.tsx`
- `src/components/calculators/UKChildBenefitCalculator/calculations.ts`
- `src/components/calculators/UKChildBenefitCalculator/index.ts`

### Safe related-slug pools (pick 3-5 from the matching region; all exist)
US: `us-paycheck-calculator`, `us-tax-bracket-calculator`, `self-employment-tax-calculator`, `capital-gains-tax-calculator`, `401k-calculator`, `hsa-calculator`, `compound-interest-calculator`, `loan-calculator`, `mortgage-calculator`, `buy-vs-rent-calculator`, `rent-affordability-calculator`, `currency-converter`
EU: `eu-vat-calculator`, `eu-salary-calculator`, `currency-converter`, `compound-interest-calculator`, `mortgage-calculator`, `loan-calculator`

---

## SPECS

### 1. US Sales Tax Calculator
- Name `USSalesTaxCalculator`, slug `us-sales-tax-calculator`, country US, category "US Tax", icon `percent`, color `green`.
- Inputs: amount (number), salesTaxRate (% number), mode ('add' | 'remove').
- Formula: rate = salesTaxRate/100. add: tax = amount*rate; total = amount+tax. remove (tax-inclusive total entered as amount): net = amount/(1+rate); tax = amount-net.
- No statutory constant. FAQ: give a few statewide BASE rates as examples (CA 7.25%, TX 6.25%, NY 4%, FL 6%) and make clear local/county/city rates add on top, so the user should enter their combined rate. There is no single national rate.
- Outputs: tax amount, total (or pre-tax net in remove mode), effective rate.

### 2. US Auto Loan Calculator
- Name `USAutoLoanCalculator`, slug `us-auto-loan-calculator`, country US, category "Finance", icon `dollar`, color `blue`.
- Inputs: vehiclePrice, downPayment, tradeInValue, salesTaxRate (%), apr (%), termMonths.
- principal = max(0, vehiclePrice + vehiclePrice*salesTaxRate/100 - downPayment - tradeInValue).
- r = apr/100/12; n = termMonths. payment = r===0 ? principal/n : principal*r/(1-(1+r)^-n).
- Outputs: monthly payment, total of payments (payment*n), total interest (total - principal), total cost incl tax.
- FAQ: note some states charge sales tax on price after trade-in; default here taxes the full price; user can adjust price to model their state.

### 3. Roth IRA Calculator
- Name `RothIRACalculator`, slug `roth-ira-calculator`, country US, category "Finance", icon `trending`, color `accent`.
- Inputs: currentAge, retirementAge, currentBalance, annualContribution, expectedReturn (%).
- n = max(0, retirementAge - currentAge). r = expectedReturn/100.
- FV = r===0 ? currentBalance + annualContribution*n : currentBalance*(1+r)^n + annualContribution*((1+r)^n - 1)/r.
- Roth = post-tax contributions, qualified growth is TAX-FREE. Do NOT tax the result. Also show total contributed and growth (FV - contributed - currentBalance).
- CONSTANT (contribution limit) from VERIFIED CONSTANTS below: cap the contribution input / warn if above the limit, mention the 50+ catch-up.

### 4. US Mortgage Calculator (with PMI, taxes, insurance)
- Name `USMortgageCalculator`, slug `us-mortgage-calculator`, country US, category "Finance", icon `home`, color `violet`.
- Inputs: homePrice, downPayment, interestRate (%), termYears, propertyTaxRate (%/yr, default 1.1), annualInsurance ($, default e.g. 1500), monthlyHOA ($, default 0), pmiRate (%/yr, default 0.5).
- loan = max(0, homePrice - downPayment). r = rate/100/12; n = termYears*12. pAndI = standard amortization (r===0 -> loan/n).
- propertyTaxMonthly = homePrice*propertyTaxRate/100/12. insuranceMonthly = annualInsurance/12.
- ltv = loan/homePrice. pmiMonthly = (downPayment/homePrice < 0.20) ? loan*pmiRate/100/12 : 0.
- totalMonthly = pAndI + propertyTaxMonthly + insuranceMonthly + monthlyHOA + pmiMonthly.
- Outputs: total monthly, P&I, tax, insurance, HOA, PMI, LTV. FAQ: PMI typically drops off near 78-80% LTV; this is conventional, not legal advice.

### 5. Home Affordability Calculator ("how much house can I afford")
- Name `HomeAffordabilityCalculator`, slug `home-affordability-calculator`, country US, category "Finance", icon `home`, color `coral`.
- Inputs: annualIncome, monthlyDebts, downPayment, interestRate (%), termYears, propertyTaxRate (%/yr default 1.1), insuranceRate (%/yr of price, default 0.5).
- grossMonthly = annualIncome/12. maxFront = 0.28*grossMonthly. maxBack = 0.36*grossMonthly - monthlyDebts.
- maxHousing = max(0, min(maxFront, maxBack)).
- The taxes+insurance depend on price, which depends on the loan -> mild circularity. Solve by FIXED-POINT ITERATION (loop ~30 times): start price = downPayment; each iter: monthlyTaxIns = price*(propertyTaxRate+insuranceRate)/100/12; maxPI = max(0, maxHousing - monthlyTaxIns); r=rate/100/12,n=term*12; loan = r===0 ? maxPI*n : maxPI*(1-(1+r)^-n)/r; price = loan + downPayment. Converges fast.
- Outputs: max home price, max loan, est total monthly payment, the binding rule (front vs back). FAQ: 28/36 is the conventional rule; FHA often allows 31/43; lenders vary; not financial advice.

### 6. Debt-to-Income (DTI) Calculator
- Name `DebtToIncomeCalculator`, slug `debt-to-income-calculator`, country US, category "Finance", icon `percent`, color `amber`.
- Inputs: grossMonthlyIncome, housingPayment, otherMonthlyDebts.
- frontDTI = grossMonthlyIncome>0 ? housingPayment/grossMonthlyIncome*100 : 0.
- backDTI = grossMonthlyIncome>0 ? (housingPayment+otherMonthlyDebts)/grossMonthlyIncome*100 : 0.
- Outputs: front DTI %, back DTI %, plain-English rating vs conventional limits (front <=28 ideal; back <=36 ideal, <=43 is the Qualified Mortgage limit, >43 high). State these as lender conventions, not law.

### 7. Ireland Take-Home Pay Calculator
- Name `IrelandSalaryCalculator`, slug `ireland-salary-calculator`, country EU, category "Income", icon `calculator`, color `green`. EUR.
- Inputs: grossAnnualSalary. (Single person, Class A employee, no pension, standard credits by default.)
- net = gross - incomeTax - usc - prsi. incomeTax = 20% up to standard band + 40% above, then minus (personal + employee/PAYE credits), floored at 0. USC = progressive per VERIFIED bands. PRSI = gross * verified rate.
- Outputs: net annual, net monthly, income tax, USC, PRSI, effective rate. Use VERIFIED CONSTANTS below.

### 8. Germany Net Salary (Brutto-Netto) Calculator
- Name `GermanySalaryCalculator`, slug `germany-salary-calculator`, country EU, category "Income", icon `calculator`, color `blue`. EUR.
- Inputs: grossAnnualSalary, churchTax (bool, default false). Tax class I (single), no children for care surcharge by default.
- incomeTax = §32a EStG on gross (verified formula). soli = verified rate above verified threshold. church = churchTax ? incomeTax * verified% : 0.
- social (employee share, each = min(gross, ceiling) * employeeRate): pension, health (base+Zusatzbeitrag employee share), unemployment, care.
- net = gross - incomeTax - soli - church - pension - health - unemployment - care.
- Outputs: net annual, net monthly, each deduction, effective rate. Estimate for tax class I. Use VERIFIED CONSTANTS below.

### 9. France Net Salary Calculator
- Name `FranceSalaryCalculator`, slug `france-salary-calculator`, country EU, category "Income", icon `calculator`, color `violet`. EUR.
- Inputs: grossAnnualSalary, status ('non-cadre' | 'cadre', default 'non-cadre').
- net = gross * (1 - employeeRate[status]). This is net AVANT impot sur le revenu (income tax is at-source separately and depends on the household).
- Outputs: net annual, net monthly, total contributions, effective rate. Use VERIFIED CONSTANTS below. FAQ must state this is net before income tax.

---

## VERIFIED CONSTANTS (verified 2026-05-28 via web; high confidence; sources below)

### Roth IRA (tax year 2026, IRS Notice 2025-67)
- Annual contribution limit under age 50: **$7,500**.
- Age 50+ catch-up: **+$1,100** -> total **$8,600**.
- Roth contributions are POST-TAX: qualified growth/withdrawals are tax-free. Do NOT apply income tax to the result.
- Cap the contribution input at the limit (50+ uses $8,600). MAGI phase-out (single $153k-$168k; MFJ $242k-$252k) is out of scope; mention briefly in a FAQ.
- Source: irs.gov "The limit on annual contributions to an IRA is increased to $7,500 from $7,000"; catch-up "$1,100, up from $1,000 for 2025".

### Ireland (tax year 2026, Budget 2026 effective 1 Jan 2026; single, Class A, no pension)
```
STANDARD_RATE_BAND = 44000   // 20% up to this, 40% above (single)
PERSONAL_TAX_CREDIT = 2000; PAYE_TAX_CREDIT = 2000; TOTAL_CREDITS = 4000
incomeTax = (gross<=44000 ? gross*0.20 : 44000*0.20 + (gross-44000)*0.40); then max(0, incomeTax - 4000)
USC: exempt if gross<=13000; else progressive on FULL gross:
  0.5% on first 12012; 2% on 12012->28700; 3% on 28700->70044; 8% above 70044
PRSI (Class A employee): 0 if weekly earnings (gross/52) <= 352; else gross * rate.
  Rate: 4.2% (Jan-Sep 2026), 4.35% (from 1 Oct 2026). USE BLENDED 4.2375% for a full-year 2026 estimate; state this in a FAQ.
net = gross - incomeTax - USC - PRSI
```
- Source: revenue.ie tax-relief-charts ("€44,000 @ 20% Balance @ 40%"; credits €2,000 + €2,000); revenue.ie USC ("First €12,012 - 0.5%; Next €16,688 - 2%; Next €41,344 - 3%; Balance - 8%"); KPMG Budget 2026 (USC exemption €13,000; PRSI 4.2% -> 4.35% from 1 Oct 2026).

### Germany (tax year 2026; single, tax class I, no church tax by default)
IMPORTANT: §32a applies to taxable income (zvE), NOT gross. Derive zvE first (standard simplified Vorsorgepauschale approach):
```
ARBEITNEHMER_PAUSCHBETRAG = 1230
employeeSocial(gross, childless) =
  min(gross,101400)*(0.093 + 0.013)            // RV 9.3% + ALV 1.3%, ceiling 101400
  + min(gross,69750)*(0.0875 + (childless?0.024:0.018))  // KV 8.75% (7.3%+1.45% Zusatz) + PV 1.8% (+0.6% if childless), ceiling 69750
// ALV (unemployment) is NOT tax-deductible in Germany; only pension + health + care reduce the tax base.
deductibleVorsorge(gross, childless) = min(gross,101400)*0.093 + min(gross,69750)*(0.0875 + (childless?0.024:0.018))
zvE = max(0, gross - deductibleVorsorge(gross,childless) - ARBEITNEHMER_PAUSCHBETRAG)

// Einkommensteuer 2026 (§32a EStG). x = floor(zvE):
GRUNDFREIBETRAG_2026 = 12348
if x <= 12348: est = 0
else if x <= 17799: y=(x-12348)/10000; est = (914.51*y + 1400)*y
else if x <= 69878: z=(x-17799)/10000; est = (173.10*z + 2397)*z + 1034.87
else if x <= 277825: est = 0.42*x - 11135.63
else: est = 0.45*x - 19470.38
est = floor(est)

// Solidaritaetszuschlag (single): none if est<=20350; else min(0.055*est, 0.119*(est-20350))
// Church tax (optional input): churchTax ? est*0.09 : 0  (use 9%; note 8% in Bavaria/BW)

net = gross - est - soli - church - employeeSocial(gross,childless)
```
NOTE: this is an ESTIMATE for tax class I using the simplified Vorsorgepauschale (zvE = gross - employee social insurance - 1230). State "estimate, tax class I" in a FAQ. Default childless = true (most conservative net); expose a checkbox if simple.
- Source: gesetze-im-internet.de §32a (Grundfreibetrag 12.348; zone coeffs 914,51/1400; 173,10/2397/1034,87; 0,42x-11135,63; 0,45x-19470,38, VZ 2026); GKV-Spitzenverband Rechengroessen 2026 (RV 18.6%, ALV 2.6%, KV 14.6%+2.9% avg Zusatz, PV 3.6% +0.6% childless; ceilings RV/ALV 101400, KV/PV 69750); TK (Soli Freigrenze single 20.350 EUR, 5.5%, 11.9% Milderung).

### France (tax year 2026; net = net AVANT impot sur le revenu / prelevement a la source)
```
PMSS_ANNUAL = 47100  // 3925/mo * 12 (Plafond Securite sociale 2026)
T1 = min(gross, PMSS_ANNUAL)                       // tranche 1
T2 = max(0, min(gross, 8*PMSS_ANNUAL) - PMSS_ANNUAL) // tranche 2
csgBase = (gross <= 4*PMSS_ANNUAL) ? gross*0.9825 : (4*PMSS_ANNUAL*0.9825 + (gross-4*PMSS_ANNUAL)) // 1.75% abattement up to 4 PMSS
employeeContrib(gross, isCadre) =
    T1*0.069                 // vieillesse plafonnee 6.90% (T1)
  + gross*0.004              // vieillesse deplafonnee 0.40% (total)
  + csgBase*0.068            // CSG deductible 6.80%
  + csgBase*0.024            // CSG non-deductible 2.40%
  + csgBase*0.005            // CRDS 0.50%
  + T1*0.0315 + T2*0.0864    // Agirc-Arrco salarial T1 3.15%, T2 8.64%
  + T1*0.0086 + T2*0.0108    // CEG salarial T1 0.86%, T2 1.08%
  + (gross > PMSS_ANNUAL ? (T1+T2)*0.0014 : 0)     // CET 0.14% only if gross > 1 PMSS
  + (isCadre ? min(gross, 4*PMSS_ANNUAL)*0.00024 : 0) // APEC cadre 0.024% up to 4 PMSS
// Assurance chomage employee share = 0% (do NOT deduct). Assurance maladie employee = 0% (general regime).
net = gross - employeeContrib(gross, isCadre)
```
- Input: status 'non-cadre' | 'cadre' (default non-cadre). For a non-cadre below the ceiling this yields ~21% deductions; a cadre above the ceiling rises toward ~25% (Agirc-Arrco T2). FAQ must state net = net avant impot sur le revenu.
- Source: legisocial/URSSAF 2026 (vieillesse 6.90%+0.40%; CSG 6.80%+2.40% on 98.25%; CRDS 0.50%); Agirc-Arrco 2026 (T1 3.15% / T2 8.64% salarial; CEG 0.86%/1.08%; CET 0.14% salarial; APEC 0.024% salarial); urssaf.fr (employee chomage abolished 2019, employer-only 4.05%; PMSS 3925/mo).

## CENTRAL MERGE (orchestrator, after build workflow)
Append 9 entries to the `calculators` array in `src/lib/calculators.ts` (plain string values, `country` field, no em dashes, no trailing-slash hrefs). Then ONE `npm run build` + `npx vitest run --no-coverage`.

## VERIFY CHECKLIST (orchestrator)
1. `npm run build` -> 0 errors.
2. `npx vitest run --no-coverage tests/calculations/{us-sales-tax,us-auto-loan,roth-ira,us-mortgage,home-affordability,debt-to-income,ireland-salary,germany-salary,france-salary}.test.ts` -> all pass.
3. INDEPENDENT audit of tax figures: spot-check Ireland/Germany/France net for a known gross against an authoritative external calculator, and the Roth limit vs irs.gov. Tests passing != constants correct.
4. No emojis / no em dashes in new files. Registry count 153 -> 162.
