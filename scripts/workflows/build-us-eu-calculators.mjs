export const meta = {
  name: 'build-us-eu-calculators',
  description: 'Build 9 US/EU calculators in parallel (calculations + component + page + test each), per CALC-SPEC-US-EU.md. Conflict-safe: agents create only new files; registry merge is central afterwards.',
  phases: [{ title: 'Build' }],
}

// Each agent creates ONLY its own new files. It must NOT touch src/lib/calculators.ts.
const SPECS = [
  { name: 'US Sales Tax Calculator', Name: 'USSalesTaxCalculator', slug: 'us-sales-tax-calculator', section: '1. US Sales Tax Calculator', region: 'US' },
  { name: 'US Auto Loan Calculator', Name: 'USAutoLoanCalculator', slug: 'us-auto-loan-calculator', section: '2. US Auto Loan Calculator', region: 'US' },
  { name: 'Roth IRA Calculator', Name: 'RothIRACalculator', slug: 'roth-ira-calculator', section: '3. Roth IRA Calculator', region: 'US' },
  { name: 'US Mortgage Calculator', Name: 'USMortgageCalculator', slug: 'us-mortgage-calculator', section: '4. US Mortgage Calculator (with PMI, taxes, insurance)', region: 'US' },
  { name: 'Home Affordability Calculator', Name: 'HomeAffordabilityCalculator', slug: 'home-affordability-calculator', section: '5. Home Affordability Calculator', region: 'US' },
  { name: 'Debt-to-Income (DTI) Calculator', Name: 'DebtToIncomeCalculator', slug: 'debt-to-income-calculator', section: '6. Debt-to-Income (DTI) Calculator', region: 'US' },
  { name: 'Ireland Take-Home Pay Calculator', Name: 'IrelandSalaryCalculator', slug: 'ireland-salary-calculator', section: '7. Ireland Take-Home Pay Calculator', region: 'EU' },
  { name: 'Germany Net Salary Calculator', Name: 'GermanySalaryCalculator', slug: 'germany-salary-calculator', section: '8. Germany Net Salary (Brutto-Netto) Calculator', region: 'EU' },
  { name: 'France Net Salary Calculator', Name: 'FranceSalaryCalculator', slug: 'france-salary-calculator', section: '9. France Net Salary Calculator', region: 'EU' },
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
    testCases: { type: 'array', items: { type: 'string' }, description: "each: 'inputs -> expected output', hand-computed" },
    notes: { type: 'string', description: 'any uncertainty, especially on verified constants used' },
  },
}

phase('Build')

function buildPrompt(s) {
  return `You are building ONE calculator for the boring-math.com static site (Astro 5 + Preact + Tailwind 4). Your cwd is the repo root: C:/Users/skf_s/boring-maths.

CALCULATOR: ${s.name}
- component name: ${s.Name}
- slug / page filename: ${s.slug}
- region: ${s.region}

STEP 1 - READ THESE FIRST (do not skip):
- CALC-SPEC-US-EU.md -> your section "${s.section}" for the exact formula, inputs, outputs and registry fields. ALSO read the "CANONICAL FILE LAYOUT", "Hard constraints", "Safe related-slug pools", and the "VERIFIED CONSTANTS" section (use the verified numbers for any statutory constant - do NOT invent tax figures).
- src/pages/calculators/uk-child-benefit-calculator.astro (reference page: copy its shape, FAQ/related arrays, slots).
- src/components/calculators/UKChildBenefitCalculator/UKChildBenefitCalculator.tsx (reference component: copy its input/result class names exactly).
- src/components/calculators/UKChildBenefitCalculator/calculations.ts and index.ts (reference for the calculations.ts + index.ts layout).

STEP 2 - CREATE EXACTLY THESE NEW FILES (canonical layout from the spec). DO NOT modify ANY existing file. Above all, DO NOT edit src/lib/calculators.ts.
1. src/components/calculators/${s.Name}/calculations.ts (pure TS, named export calc fn + result interface + getDefaultInputs, UPPER_SNAKE constants)
2. src/components/calculators/${s.Name}/${s.Name}.tsx (Preact, default export, import from './calculations', class not className, live update no submit button, <div class="calc-card">, correct Intl currency per the spec: USD for US, EUR for EU)
3. src/components/calculators/${s.Name}/index.ts (export { default as ${s.Name} } from './${s.Name}'; export * from './calculations';)
4. src/pages/calculators/${s.slug}.astro (CalculatorLayout + SEOHead + HeroSection + ContentSection + FAQSection; import the component via the folder named import { ${s.Name} } from '../../components/calculators/${s.Name}'; client:load; 6+ accurate FAQs; 600+ words across the three h2 sections; related 3-5 from the region-appropriate safe pool)
5. tests/calculations/${s.slug.replace(/-calculator$/, '')}.test.ts (Vitest; import the pure fn from '../../src/components/calculators/${s.Name}/calculations'; 4+ assertions with hand-computed expected values; cover an edge case. This exact location is REQUIRED - vitest only discovers tests/**.)

HARD RULES (Keith, non-negotiable):
- NO EMOJIS anywhere. NO em dashes in any frontend string (use commas/colons/hyphens).
- NO fake stats or social proof. NO animations, charts, or extra dependencies.
- The MATH MUST BE CORRECT and must use the VERIFIED CONSTANTS from CALC-SPEC-US-EU.md for any statutory figure. Where a statutory figure is used, state it AND its effective year in a FAQ.
- Match existing style; do not invent new design tokens.

STEP 3 - VERIFY YOUR OWN LOGIC:
Run: npx vitest run tests/calculations/${s.slug.replace(/-calculator$/, '')}.test.ts --no-coverage
If it fails, fix calculations.ts until it passes. Do NOT edit the test to pass a wrong result - fix the math. Report the final pass/fail.

Return the structured result (filesCreated as repo-relative paths, logicFn name, testResult, the 4+ testCases as 'inputs -> expected', and notes on any constant you were unsure about).`
}

const built = await parallel(
  SPECS.map((s) => () => agent(buildPrompt(s), { label: `build:${s.slug}`, phase: 'Build', schema: BUILT_SCHEMA }))
)

const ok = built.filter(Boolean)
log(`Built ${ok.length}/${SPECS.length} calculators`)
for (const b of ok) log(`  ${b.slug}: ${b.testResult} (${(b.filesCreated || []).length} files)`)

return { built: ok, specs: SPECS }
