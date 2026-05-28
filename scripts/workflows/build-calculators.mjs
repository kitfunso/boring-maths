export const meta = {
  name: 'build-calculators',
  description: 'Build boring-math calculators in parallel (logic + component + page + test each), per CALCULATOR_BLUEPRINT.md. Conflict-safe: agents create only new files; registry merge is done centrally afterwards.',
  phases: [{ title: 'Build' }],
}

// Each agent creates ONLY its own new files. It must NOT touch src/lib/calculators.ts
// (shared file -> the orchestrator merges all registry entries centrally after this runs).
const SPECS = [
  { name: 'UK Mortgage Affordability', Name: 'UKMortgageAffordabilityCalculator', slug: 'uk-mortgage-affordability-calculator', key: 'Mortgage Affordability' },
  { name: 'Mortgage Overpayment', Name: 'MortgageOverpaymentCalculator', slug: 'mortgage-overpayment-calculator', key: 'Mortgage Overpayment' },
  { name: 'UK Holiday Entitlement', Name: 'UKHolidayEntitlementCalculator', slug: 'uk-holiday-entitlement-calculator', key: 'UK Holiday Entitlement' },
  { name: 'UK Redundancy Pay', Name: 'UKRedundancyPayCalculator', slug: 'uk-redundancy-pay-calculator', key: 'UK Redundancy Pay' },
]

const BUILT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['slug', 'filesCreated', 'logicFn', 'testResult', 'testCases'],
  properties: {
    slug: { type: 'string' },
    filesCreated: { type: 'array', items: { type: 'string' } },
    logicFn: { type: 'string', description: 'name of the exported pure calc function' },
    testResult: { type: 'string', enum: ['passed', 'failed', 'not-run'] },
    testCases: { type: 'array', items: { type: 'string' }, description: 'each: inputs -> expected output, hand-computed' },
    notes: { type: 'string' },
  },
}

const SAFE_RELATED = [
  'uk-tax-calculator', 'uk-salary-sacrifice-calculator', 'uk-pension-calculator',
  'mortgage-calculator', 'buy-vs-rent-calculator', 'rent-affordability-calculator',
  'uk-100k-tax-trap-calculator', 'uk-student-loan-calculator', 'compound-interest-calculator',
  'uk-child-benefit-calculator', 'overtime-calculator', 'hourly-to-salary-calculator',
  'salary-to-hourly-calculator', 'uk-employer-cost-calculator',
]

phase('Build')

function buildPrompt(s) {
  return `You are building ONE calculator for the boring-math.com static site (Astro 5 + Preact + Tailwind 4). Your cwd is the repo root: C:/Users/skf_s/boring-maths.

CALCULATOR: ${s.name}
- component name: ${s.Name}
- slug / page filename: ${s.slug}

STEP 1 - READ THESE FIRST (do not skip):
- src/components/calculators/CALCULATOR_BLUEPRINT.md   (the mandatory structure)
- CALC-BUILD-STATUS.md   -> section "Verified formulas + constants" -> "${s.key}" (your exact formula + constants)
- src/pages/calculators/uk-child-benefit-calculator.astro   (reference page: copy its shape, FAQ/related arrays, slots)
- src/components/calculators/UKChildBenefitCalculator/UKChildBenefitCalculator.tsx   (reference component: copy its input/result class names exactly)

STEP 2 - CREATE EXACTLY THESE NEW FILES (create the component dir). DO NOT modify ANY existing file. Above all, DO NOT edit src/lib/calculators.ts - the orchestrator handles the registry.
1. src/components/calculators/${s.Name}/${s.Name}.logic.ts
   - Pure TypeScript. No JSX, no Preact import. Named constants. Export a named pure function that does the calculation per CALC-BUILD-STATUS.md. Also export the result interface. This file is unit-tested.
2. src/components/calculators/${s.Name}/${s.Name}.tsx
   - Preact component. import { useState } from 'preact/hooks'. import the logic fn from './${s.Name}.logic'. Use class not className. Live update on input (NO submit button). Currency via new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}). Wrapper <div class="calc-card">. Match the reference component's visual style and class names EXACTLY (same input classes, same result card classes). default export the component.
3. src/pages/calculators/${s.slug}.astro
   - Same imports/shape as the reference page (CalculatorLayout + ${s.Name} + FAQSection + ContentSection + RelatedCalculators). client:load. Title keyword-first, under 60 chars, ending ' | Boring Math'. Meta description 150-160 chars with the target keyword. slug="${s.slug}". 6+ accurate FAQs (where a statutory figure is used, state the figure AND its effective date in the answer). ContentSection: 600+ words across h2 sections: "How to use", "How it is calculated" (show the formula in words), "Understanding your results". related: 3-5 entries chosen ONLY from this safe slug list: ${SAFE_RELATED.join(', ')}.
4. src/components/calculators/${s.Name}/${s.Name}.test.ts
   - Vitest. import { describe, it, expect } from 'vitest'. import the pure fn from './${s.Name}.logic'. At least 3 assertions with hand-computed expected values from the formula. Cover an edge case (e.g. zero, the cap, part-time).

HARD RULES (Keith, non-negotiable):
- NO EMOJIS anywhere (not in JSX, comments, strings, content).
- NO em dashes in any frontend string. Use commas/colons/hyphens.
- NO fake stats or social proof ("trusted by N users", "#1", star ratings). Only state facts you can defend.
- NO animations, charts, or extra dependencies. Keep it as plain as the reference component.
- The MATH MUST BE CORRECT. This is the priority. Double-check against CALC-BUILD-STATUS.md.
- Match existing style; do not invent new design tokens.

STEP 3 - VERIFY YOUR OWN LOGIC:
Run: npx vitest run src/components/calculators/${s.Name}/${s.Name}.test.ts --no-coverage
If it fails, fix ${s.Name}.logic.ts until it passes. Do not edit the test to pass a wrong result - fix the math. Report the final pass/fail.

Return the structured result (filesCreated as repo-relative paths, logicFn name, testResult, the 3+ testCases as 'inputs -> expected', any notes/uncertainties).`
}

const built = await parallel(SPECS.map((s) => () =>
  agent(buildPrompt(s), { label: `build:${s.slug}`, phase: 'Build', schema: BUILT_SCHEMA })
))

const ok = built.filter(Boolean)
log(`Built ${ok.length}/${SPECS.length} calculators`)
for (const b of ok) log(`  ${b.slug}: ${b.testResult} (${(b.filesCreated || []).length} files)`)

return { built: ok, specs: SPECS }
