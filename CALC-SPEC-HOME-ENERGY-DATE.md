# Calculator Cohort Spec: Home / Energy (traffic-growth episode) — REVISED v2

> Episode `01KSRA0R8FEVMVYRJXNAC8NY22`. 5 new calculators chosen for RANKABILITY
> (low-competition, high-intent, simple-correct math), affiliate-friendly.
> v2 changes (plan-design-critic + plan-eng-critic round 1):
> - DROPPED "Days Between Dates" + "Business Days" — duplicates of the existing
>   DateDifferenceCalculator (days/weeks/months/years + "Show business days" toggle).
> - UI pattern switched to the SHARED UI KIT (the Home siblings Tile/Paint/Mulch use it),
>   NOT the legacy calc-card pattern.
> - EV cost units pinned to GBP; BTU heating multiplier pinned to a single constant.
> - Added input affordances, invalid-state UX, and result hierarchy per calc.

## Why these (rankability rationale)
GSC: site is indexed but ranks pos 56-89 on saturated head terms (0 clicks). These 5 target lower-competition, specific-intent long-tail where page-1 is achievable, are affiliate-friendly (home improvement / EV), and use simple geometry/arithmetic so the math is verifiably correct. "Home" category is thin (8).

## CANONICAL LAYOUT — USE THE SHARED UI KIT (match the Home siblings)
The Home-category siblings (TileCalculator, PaintCalculator, MulchCalculator) all use the shared design-system kit via the `useCalculatorBase` hook. The new calcs MUST match them, NOT the legacy `calc-card`/`class` pattern.

REFERENCE TO COPY: `src/components/calculators/TileCalculator/` (types.ts + calculations.ts + TileCalculator.tsx + index.ts) and `src/components/calculators/MulchCalculator/`.

Each calculator = these files:
1. `src/components/calculators/[Name]/types.ts` — export the `[Name]Inputs` interface, `[Name]Result` interface, any selector enums, and `getDefaultInputs(): [Name]Inputs`. Include `currency: Currency` (from `../../../lib/regions`) where money is shown.
2. `src/components/calculators/[Name]/calculations.ts` — pure `calculate[Name](inputs): [Name]Result`. NaN-safe: `const safe = (v) => Number.isFinite(v) ? Math.max(0, v) : 0;` on every numeric input (Math.max(0, NaN) is NaN). No JSX.
3. `src/components/calculators/[Name]/[Name].tsx` — `import { useCalculatorBase } from '../../../hooks/useCalculatorBase';` then `const { inputs, result, updateInput } = useCalculatorBase({ name, slug: 'calc-[slug]-inputs', defaults: getDefaultInputs, compute: calculate[Name] });`. Build the UI from the kit (`import { ThemeProvider, Card, CalculatorHeader, Label, Input, Select, ButtonGroup, Toggle, Grid, Divider, ResultCard, MetricCard, Alert } from '../../ui';`). Use `className` (kit convention), NOT `class`. Live update (no submit button). Default export. Wrap in `<ThemeProvider defaultColor="<color>"><Card variant="elevated">...`.
4. `src/components/calculators/[Name]/index.ts` — `export { default as [Name] } from './[Name]'; export * from './calculations'; export * from './types';`
5. `src/pages/calculators/[slug].astro` — CalculatorLayout + SEOHead + HeroSection + ContentSection + FAQSection; component via folder named import `{ [Name] }`; `client:load`; 6+ accurate FAQs; 600+ words across 3 h2 sections ("How to use", "How it is calculated" with the formula in words, "Understanding your results"); `related` 3-5 from the safe pool below.
6. `tests/calculations/[slug-without-calculator-suffix].test.ts` — vitest; import `calculate[Name]` from the calc file; 4+ hand-computed assertions incl an edge case (zero/NaN, unit conversion, or a guarded degenerate state). This location is REQUIRED (vitest only scans `tests/**`).

### UI affordances (use the kit; do not hand-roll)
- Numeric fields: `Input` (with `variant="currency"` for money).
- Unit toggles (m/ft), shape selectors, sun-exposure, charging mode: `ButtonGroup` or `Select`.
- Booleans (kitchen, include-spare): `Toggle`.
- Primary result: ONE `ResultCard` (the headline number). Secondary figures: `MetricCard` in a `Grid`.
- Invalid/degenerate state: render an `Alert variant="warning"` instead of a misleading number (see each spec). Never show NaN.

### Hard constraints
NO emojis. NO em dashes in frontend strings. NO fake stats. Math MUST be correct. Currency `Intl.NumberFormat('en-GB',...maximumFractionDigits:0)` via the kit's currency formatting; UK-first. Support metric + imperial where relevant.

### Safe related-slug pool (all exist; pick 3-5, domain-appropriate)
`tile-calculator`, `paint-calculator`, `flooring-calculator`, `mulch-calculator`, `square-footage-calculator`, `electricity-cost-calculator`, `currency-converter`.

---

## SPECS (5)

### 1. Concrete Calculator
- Name `ConcreteCalculator`, slug `concrete-calculator`, category "Home", icon `cube`, color `amber`.
- Inputs: shape (Select: 'slab'|'footing'|'column'), length, width, depth (for slab/footing) OR diameter+height (for column — reuse fields: column uses diameter=width, height=depth), unit (ButtonGroup: 'm'|'ft'), wastePct (default 10), bagYield m3/bag (default 0.011 = 25kg bag), optional bagPrice + currency.
- Slab/footing volume = L*W*D (ft->m: *0.3048 each dim). Column = Math.PI*(diameter/2)**2*height. volumeWithWaste = volume*(1+wastePct/100). bags = volume>0 ? Math.ceil(volumeWithWaste / bagYield) : 0.
- PRIMARY ResultCard: bags needed. Secondary MetricCards: volume m3, cubic yards (m3*1.30795), optional cost (bags*bagPrice).
- Invalid state: any dimension <= 0 -> Alert "Enter all dimensions to see how much concrete you need." (result 0, no NaN). FAQ: bag-yield assumption + ready-mix sold by m3 + worked example (4x3x0.1m slab = 1.2m3, +10% = 1.32m3, 120 bags).

### 2. Gravel Calculator
- Name `GravelCalculator`, slug `gravel-calculator`, category "Home", icon `cube`, color `ocean`.
- Inputs: length, width, depth, unit (ButtonGroup m/ft), density t/m3 (default 1.5; Select common types or numeric), wastePct (default 5), optional pricePerTonne + currency.
- volume = L*W*depth (unit converted). tonnes = volume*density*(1+waste/100). bulkBags (0.85t each) = volume>0 ? Math.ceil(tonnes/0.85) : 0.
- PRIMARY: tonnes needed. Secondary: volume m3, bulk bags, optional cost. Invalid: dims<=0 -> Alert. FAQ: gravel density varies 1.4-1.7 t/m3.

### 3. Wallpaper Calculator
- Name `WallpaperCalculator`, slug `wallpaper-calculator`, category "Home", icon `layers`, color `violet`.
- Inputs: roomPerimeter (or length+width -> perimeter=2*(L+W)), wallHeight, rollLength (default 10.05 m), rollWidth (default 0.53 m), patternRepeat (default 0), unit (m/ft).
- dropsNeeded = rollWidth>0 ? Math.ceil(perimeter / rollWidth) : 0. effectiveDropLength = wallHeight + patternRepeat. dropsPerRoll = effectiveDropLength>0 ? Math.floor(rollLength / effectiveDropLength) : 0. rolls = dropsPerRoll>0 ? Math.ceil(dropsNeeded / dropsPerRoll) : 0.
- PRIMARY: rolls needed (suggest +1 spare in copy). Secondary: drops needed, drops per roll. Invalid: if dropsPerRoll===0 (pattern repeat + height exceed roll length) -> Alert "Your wall height plus pattern repeat is taller than one roll; choose a longer roll." If perimeter/height<=0 -> Alert prompt. FAQ: explain drops + pattern-repeat waste. Worked example (16m perimeter, 2.4m height, no repeat -> 31 drops, 4 drops/roll, 8 rolls).

### 4. BTU Calculator (room air-con / heating sizing)
- Name `BTUCalculator`, slug `btu-calculator`, category "Home", icon `fire`, color `coral`.
- Inputs: roomLength, roomWidth, unit (m/ft), ceilingHeight (default 2.4m / 8ft), sunExposure (ButtonGroup: 'shaded'|'normal'|'sunny'), occupants (default 2), kitchen (Toggle).
- areaSqFt = L*W converted to sq ft (m->ft: *10.7639 on area, or convert each dim *3.28084). COOLING_BTU_PER_SQFT = 20. HEATING_BTU_PER_SQFT = 25 (PINNED constant; state in FAQ). base_cooling = areaSqFt*20; base_heating = areaSqFt*25. ceiling adjustment: multiply by (ceilingHeightFt/8). sun: shaded *0.9, sunny *1.1, normal *1.0 (cooling only). occupants: + (max(0, occupants-2))*600. kitchen: +4000 (cooling). 
- PRIMARY: recommended cooling BTU. Secondary: heating BTU, cooling kW (BTU/3412), heating kW. Invalid: area<=0 -> Alert. FAQ: rule-of-thumb (20 cooling / 25 heating BTU per sq ft), recommend a pro for exact sizing. Worked example: 12ft x 12ft = 144 sqft x 20 = 2880 base cooling BTU.

### 5. EV Charging Cost Calculator
- Name `EVChargingCostCalculator`, slug `ev-charging-cost-calculator`, country 'UK', category "Automotive", icon `bolt`, color `green`.
- Inputs: batterySize kWh, currentCharge % (default 20), targetCharge % (default 80), ratePence p/kWh (default 28; Input), chargingEfficiency % (default 90), milesPerKwh (default 3.5).
- energyNeeded = batterySize*(target-current)/100 (only if target>current). energyDrawn = energyNeeded / (chargingEfficiency/100). UNITS: rate is PENCE/kWh -> costGBP = energyDrawn * (ratePence/100). costPerMileGBP = (ratePence/100) / milesPerKwh. fullChargeCostGBP = (batterySize/(efficiency/100)) * (ratePence/100).
- PRIMARY: cost for this charge (GBP, e.g. 60kWh 20->80% at 28p/90% eff = £11.20). Secondary: cost per mile, full-charge cost, energy added kWh. Invalid: targetCharge <= currentCharge -> Alert "Target charge must be higher than current charge." FAQ: home vs public rates, charging losses, rates vary; state the 28p default is illustrative.
- TEST MUST assert the GBP value (11.20), not a 100x pence value.

---

## CENTRAL MERGE (orchestrator, after execute)
Append 5 entries to the `calculators` array in `src/lib/calculators.ts`. FULL entry shape (per CalculatorEntry): `{ title, description, href: '/calculators/[slug]', icon, color, category, country?, mostUsed: false }`. No em dashes, no trailing slashes. icons cube/cube/layers/fire/bolt; colors amber/ocean/violet/coral/green; categories Home/Home/Home/Home/Automotive; EV country 'UK'. Then build + full vitest + lighthouse.

## VERIFY CHECKLIST (orchestrator)
1. `npm run build` -> 0 errors, 5 new pages in dist.
2. `npx vitest run --no-coverage` -> all pass incl 5 new suites (4+ hand-computed assertions each).
3. Spot-check: concrete 4x3x0.1m +10% = 1.32m3 = 120 bags; gravel 5x3x0.05m=0.75m3*1.5=1.125t; wallpaper 16m/0.53=31 drops, floor(10.05/2.4)=4/roll -> 8 rolls; BTU 144 sqft*20=2880 cooling; EV 60kWh 20->80%=36kWh/0.9=40kWh*0.28=GBP 11.20 (NOT 1120).
4. No emojis / em dashes. NaN-safe inputs. UI-kit pattern (useCalculatorBase). Registry 162 -> 167.
5. Lighthouse on 1-2 new pages: strong perf/seo/best-practices/a11y, 0 console errors.
