export const meta = {
  name: 'build-home-energy-calculators',
  description: 'Build 5 new Home/Energy calculators using the shared UI kit (useCalculatorBase), per CALC-SPEC-HOME-ENERGY-DATE.md. Conflict-safe: agents create only their own files; registry merge is central.',
  phases: [{ title: 'Build' }],
}

const SPECS = [
  { name: 'Concrete Calculator', Name: 'ConcreteCalculator', slug: 'concrete-calculator', test: 'concrete', section: '1. Concrete Calculator' },
  { name: 'Gravel Calculator', Name: 'GravelCalculator', slug: 'gravel-calculator', test: 'gravel', section: '2. Gravel Calculator' },
  { name: 'Wallpaper Calculator', Name: 'WallpaperCalculator', slug: 'wallpaper-calculator', test: 'wallpaper', section: '3. Wallpaper Calculator' },
  { name: 'BTU Calculator', Name: 'BTUCalculator', slug: 'btu-calculator', test: 'btu', section: '4. BTU Calculator (room air-con / heating sizing)' },
  { name: 'EV Charging Cost Calculator', Name: 'EVChargingCostCalculator', slug: 'ev-charging-cost-calculator', test: 'ev-charging-cost', section: '5. EV Charging Cost Calculator' },
]

const BUILT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['slug', 'filesCreated', 'logicFn', 'testResult', 'testCases'],
  properties: {
    slug: { type: 'string' },
    filesCreated: { type: 'array', items: { type: 'string' } },
    logicFn: { type: 'string' },
    testResult: { type: 'string', enum: ['passed', 'failed', 'not-run'] },
    testCases: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
}

phase('Build')

function buildPrompt(s) {
  return `You are building ONE calculator for boring-math.com (Astro 5 + Preact + Tailwind, shared design-system UI kit). cwd is the repo root: C:/Users/skf_s/boring-maths.

CALCULATOR: ${s.name}  (component ${s.Name}, slug ${s.slug})

STEP 1 - READ FIRST (do not skip):
- CALC-SPEC-HOME-ENERGY-DATE.md -> your section "${s.section}" for the exact formula, inputs, affordances, invalid-state Alerts, and result hierarchy. ALSO read the "CANONICAL LAYOUT - USE THE SHARED UI KIT" section.
- src/components/calculators/TileCalculator/TileCalculator.tsx, types.ts, calculations.ts, index.ts  (THE reference pattern - copy its structure: useCalculatorBase + kit components + types.ts + className).
- src/components/calculators/MulchCalculator/MulchCalculator.tsx  (second reference, simpler).
- src/components/ui/index.ts  (the exact kit component APIs: ThemeProvider, Card, CalculatorHeader, Label, Input, Select, ButtonGroup, Toggle, Grid, Divider, ResultCard, MetricCard, Alert).
- src/hooks/useCalculatorBase.ts  (the hook signature + return shape).

STEP 2 - CREATE EXACTLY THESE NEW FILES (UI-kit pattern, NOT the calc-card pattern). DO NOT modify any existing file. Above all DO NOT edit src/lib/calculators.ts.
1. src/components/calculators/${s.Name}/types.ts  (export ${s.Name}Inputs, ${s.Name}Result interfaces, any selector enums, and getDefaultInputs(); include currency: Currency from '../../../lib/regions' if money is shown)
2. src/components/calculators/${s.Name}/calculations.ts  (pure calculate${s.Name}(inputs): ${s.Name}Result; NaN-safe: const safe = (v) => Number.isFinite(v) ? Math.max(0, v) : 0; on EVERY numeric input; no JSX)
3. src/components/calculators/${s.Name}/${s.Name}.tsx  (default export; const { inputs, result, updateInput } = useCalculatorBase({ name, slug: 'calc-${s.slug}-inputs', defaults: getDefaultInputs, compute: calculate${s.Name} }); build UI from the kit; className NOT class; live update, no submit button; <ThemeProvider defaultColor="..."><Card variant="elevated">...; ONE primary ResultCard + secondary MetricCards in a Grid; invalid/degenerate inputs render an <Alert variant="warning"> with the copy from the spec, never NaN)
4. src/components/calculators/${s.Name}/index.ts  (export { default as ${s.Name} } from './${s.Name}'; export * from './calculations'; export * from './types';)
5. src/pages/calculators/${s.slug}.astro  (CalculatorLayout + SEOHead + HeroSection + ContentSection + FAQSection; import { ${s.Name} } from '../../components/calculators/${s.Name}'; client:load; 6+ accurate FAQs; 600+ words across "How to use" / "How it is calculated" (formula in words) / "Understanding your results"; related 3-5 from the safe pool in the spec. Use a reference page like src/pages/calculators/tile-calculator.astro for shape.)
6. tests/calculations/${s.test}.test.ts  (vitest; import calculate${s.Name} from '../../src/components/calculators/${s.Name}/calculations'; 4+ assertions with hand-computed expected values incl an edge case. This exact location is REQUIRED.)

HARD RULES (non-negotiable):
- Use the SHARED UI KIT via useCalculatorBase, matching TileCalculator - NOT the calc-card pattern.
- NO emojis. NO em dashes in any frontend string (use commas/colons/hyphens). NO fake stats.
- Math MUST be correct. Pinned constants from the spec: BTU cooling=20/heating=25 BTU per sqft; EV cost is GBP (ratePence/100), the test MUST assert the GBP value not 100x pence.
- QUOTE explicit visible <Label> strings for every control. Gravel density = a Select of named gravel types mapping to t/m3. Concrete: when shape==='column' the dimension labels must read 'Diameter' and 'Height'.
- Match existing style; do not invent new design tokens.

STEP 3 - VERIFY: run npx vitest run tests/calculations/${s.test}.test.ts --no-coverage. If it fails, fix calculations.ts (never the test) until it passes. Report pass/fail.

Return the structured result (filesCreated repo-relative, logicFn name, testResult, 4+ testCases as 'inputs -> expected', notes).`
}

const built = await parallel(SPECS.map((s) => () => agent(buildPrompt(s), { label: `build:${s.slug}`, phase: 'Build', schema: BUILT_SCHEMA })))
const ok = built.filter(Boolean)
log(`Built ${ok.length}/${SPECS.length} calculators`)
for (const b of ok) log(`  ${b.slug}: ${b.testResult} (${(b.filesCreated || []).length} files)`)
return { built: ok, specs: SPECS }
