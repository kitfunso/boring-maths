# Calculator Blueprint

This template provides the structure for creating new calculators in the Boring Math project.

## File Structure

Each calculator should be organized in its own folder:

```
src/components/calculators/YourCalculator/
├── YourCalculator.tsx     # Main React component
├── calculations.ts        # Pure calculation functions
├── types.ts              # TypeScript types and default values
└── index.ts              # Barrel export
```

---

## 1. types.ts

```typescript
import type { Currency } from '../../../lib/regions';

// Input types - what the user provides
export interface YourCalculatorInputs {
  currency: Currency;
  // Add your input fields here
  mainValue: number;
  optionalValue?: number;
}

// Result types - what the calculator outputs
export interface YourCalculatorResult {
  currency: Currency;
  // Add your result fields here
  primaryResult: number;
  secondaryResult: number;
}

// Default values based on currency/region
export function getDefaultInputs(currency: Currency): YourCalculatorInputs {
  const defaults: Record<Currency, Partial<YourCalculatorInputs>> = {
    USD: { mainValue: 1000 },
    GBP: { mainValue: 800 },
    EUR: { mainValue: 900 },
  };

  return {
    currency,
    mainValue: defaults[currency]?.mainValue ?? 1000,
    optionalValue: 0,
  };
}
```

---

## 2. calculations.ts

```typescript
import type { YourCalculatorInputs, YourCalculatorResult } from './types';
import type { Currency } from '../../../lib/regions';

// Main calculation function - PURE, no side effects
export function calculateYourThing(inputs: YourCalculatorInputs): YourCalculatorResult {
  const { mainValue, optionalValue = 0 } = inputs;

  // Your calculation logic here
  const primaryResult = mainValue * 2;
  const secondaryResult = mainValue + (optionalValue || 0);

  return {
    currency: inputs.currency,
    primaryResult,
    secondaryResult,
  };
}

// Currency formatting helper
export function formatCurrency(
  amount: number,
  currency: Currency,
  decimals: number = 0
): string {
  const symbols: Record<Currency, string> = {
    USD: '$',
    GBP: '£',
    EUR: '€',
  };

  const formatted = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${amount < 0 ? '-' : ''}${symbols[currency]}${formatted}`;
}
```

---

## 3. YourCalculator.tsx

```typescript
/**
 * Your Calculator - React Component
 *
 * Brief description of what this calculator does.
 * Uses the design system components.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateYourThing, formatCurrency } from './calculations';
import { getDefaultInputs, type YourCalculatorInputs, type YourCalculatorResult } from './types';
import { type Currency, getCurrencySymbol } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function YourCalculator() {
  // State
  const [inputs, setInputs] = useState<YourCalculatorInputs>(() => getDefaultInputs('USD'));
  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Memoized calculation
  const result: YourCalculatorResult = useMemo(() => {
    return calculateYourThing(inputs);
  }, [inputs]);

  // Generic input updater
  const updateInput = <K extends keyof YourCalculatorInputs>(
    field: K,
    value: YourCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Currency change handler (resets to defaults)
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  return (
    // Choose theme color: blue, green, yellow, red, purple
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Your Calculator Title"
          subtitle="Brief description of what this calculates"
          actions={
            <CurrencySelector
              value={inputs.currency}
              onChange={handleCurrencyChange}
            />
          }
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Currency Input Example */}
            <div>
              <Label htmlFor="mainValue" required>
                Main Value
              </Label>
              <Input
                id="mainValue"
                variant="currency"
                currencySymbol={currencySymbol}
                min={0}
                step={100}
                value={inputs.mainValue}
                onChange={(e) => updateInput('mainValue', Number(e.target.value))}
              />
              <p className="text-sm text-gray-500 mt-1">Helper text here</p>
            </div>

            {/* Grid for side-by-side inputs */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="field1">Field 1</Label>
                <Input
                  id="field1"
                  type="number"
                  min={0}
                  max={100}
                  value={inputs.optionalValue}
                  onChange={(e) => updateInput('optionalValue', Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="field2">Field 2</Label>
                <Input
                  id="field2"
                  variant="percentage"
                  min={0}
                  max={100}
                  step={1}
                  value={50}
                  onChange={(e) => console.log(e.target.value)}
                />
              </div>
            </Grid>

            {/* Slider Example */}
            <Slider
              label="Time Period"
              value={10}
              onChange={(value) => console.log(value)}
              min={1}
              max={30}
              showValue
              labels={{
                min: '1 year',
                mid: '15 years',
                max: '30 years',
                current: (v) => `${v} years`,
              }}
            />
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Your Primary Result"
              value={formatCurrency(result.primaryResult, result.currency)}
              subtitle="Additional context"
              footer={
                <>
                  Secondary info: <span className="font-semibold">
                    {formatCurrency(result.secondaryResult, result.currency)}
                  </span>
                </>
              }
            />

            {/* Metric Cards Grid */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Metric 1"
                value={formatCurrency(result.primaryResult, result.currency)}
                sublabel="per month"
              />
              <MetricCard
                label="Metric 2"
                value={formatCurrency(result.secondaryResult, result.currency)}
                sublabel="per year"
                valueColor="success"
              />
              <MetricCard
                label="Metric 3"
                value="42%"
                sublabel="percentage"
              />
              <MetricCard
                label="Metric 4"
                value="1,234"
                sublabel="units"
              />
            </Grid>

            {/* Custom Section (optional) */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                Additional Details
              </h3>
              {/* Custom content here */}
            </div>

            {/* Tips/Alerts */}
            <Alert variant="tip" title="Pro tip:">
              Helpful advice related to this calculation.
            </Alert>

            {/* Share Results - REQUIRED */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Your result: ${formatCurrency(result.primaryResult, result.currency)} - Secondary: ${formatCurrency(result.secondaryResult, result.currency)}`}
                calculatorName="Your Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
```

---

## 4. index.ts

```typescript
export { default } from './YourCalculator';
export * from './types';
export * from './calculations';
```

---

## 5. Register the Calculator

### Add to calculators config (`src/lib/calculators.ts`):

```typescript
{
  id: 'your-calculator',
  name: 'Your Calculator',
  description: 'Brief description of what it calculates',
  category: 'financial', // financial, lifestyle, diy
  icon: '📊', // Choose appropriate emoji
  color: 'blue', // Match ThemeProvider color
  path: '/calculators/your-calculator',
}
```

### Create the page (`src/pages/calculators/your-calculator.astro`):

```astro
---
import CalculatorLayout from '../../layouts/CalculatorLayout.astro';
import YourCalculator from '../../components/calculators/YourCalculator/YourCalculator';
import { getCalculatorById } from '../../lib/calculators';

const calculator = getCalculatorById('your-calculator');
---

<CalculatorLayout calculator={calculator}>
  <YourCalculator client:load />
</CalculatorLayout>
```

---

## Available UI Components

| Component | Usage |
|-----------|-------|
| `ThemeProvider` | Wrap calculator, set `defaultColor` (blue/green/yellow/red/purple) |
| `Card` | Main container with `variant="elevated"` |
| `CalculatorHeader` | Title, subtitle, and currency selector slot |
| `CurrencySelector` | Dropdown for USD/GBP/EUR |
| `Label` | Form labels with `required` or `badge="Optional"` props |
| `Input` | Inputs with `variant="currency"` or `variant="percentage"` |
| `Slider` | Range slider with labels |
| `ButtonGroup` | Toggle buttons for options |
| `Checkbox` | Checkbox with label |
| `Select` | Dropdown select |
| `Grid` | Responsive grid with `responsive={{ sm: 1, md: 2 }}` |
| `Divider` | Section separator |
| `ResultCard` | Large primary result display |
| `MetricCard` | Smaller metric cards for grids |
| `Alert` | Info/warning/tip/error messages |
| `ShareResults` | Social share buttons (REQUIRED) |

---

## Checklist for New Calculators

- [ ] Create folder structure with all 4 files
- [ ] Use `preact/hooks` (not `react`)
- [ ] Include `ShareResults` component
- [ ] Add to calculators config
- [ ] Create Astro page
- [ ] Test all three currencies (USD, GBP, EUR)
- [ ] Verify mobile responsiveness
- [ ] Run `npm run build` to check for errors
