# Adding New Calculators

This guide walks you through creating new calculators for the Boring Math network. It's optimized for AI-assisted development ("vibe coding") - each step includes prompts you can use with AI assistants like Claude.

## Overview

Each calculator consists of:

1. **Types** (`types.ts`) - TypeScript interfaces for inputs/outputs
2. **Calculations** (`calculations.ts`) - Pure functions for math logic
3. **Component** (`Calculator.tsx`) - React component with form and results
4. **Page** (`calculator-name.astro`) - Astro page with SEO and content

---

## Step 1: Keyword Research

Before building, find a valuable long-tail keyword to target.

### Criteria for Good Keywords

| Criteria | Target |
|----------|--------|
| Word count | 3-5 words |
| Monthly searches | 50-300 |
| Competition | Low to Medium |
| Intent | Informational/Transactional |

### Research Tools (Free)

1. **Google Autocomplete** - Type your idea and see suggestions
2. **AnswerThePublic** - Question-based keyword ideas
3. **Google Keyword Planner** - Search volume (requires Google Ads account)
4. **AlsoAsked** - Related questions people search

### Example Research Process

```
Starting idea: "freelance calculator"

Google autocomplete reveals:
- "freelance rate calculator"
- "freelance hourly rate calculator"
- "freelance day rate calculator uk"
- "freelance tax calculator"

Refined to: "freelance day rate calculator with tax adjustment"
- More specific = less competition
- Clear user intent
- Addressable with a calculator
```

### AI Prompt for Keyword Ideas

```
I'm building a calculator network targeting long-tail SEO keywords.
Suggest 10 highly specific calculator ideas in the [NICHE] space that:
- Target 3-5 word search queries
- Solve a specific problem people Google
- Would have low competition
- Could include affiliate opportunities

Format: [Calculator Name] | [Target Keyword] | [Why it's valuable]
```

---

## Step 2: Define Inputs and Outputs

Before coding, clearly define what the calculator needs.

### Input Definition Template

```markdown
## Calculator: [Name]
## Target Keyword: [keyword phrase]

### Inputs
| Field | Type | Range | Default | Required | Help Text |
|-------|------|-------|---------|----------|-----------|
| ... | ... | ... | ... | ... | ... |

### Outputs
| Result | Format | Description |
|--------|--------|-------------|
| ... | ... | ... |

### Formula
[Describe the calculation logic step by step]

### Edge Cases
- What if [input] is zero?
- What if [input] is negative?
- Maximum reasonable values?
```

### Example: Freelance Day Rate Calculator

```markdown
## Calculator: Freelance Day Rate Calculator
## Target Keyword: "freelance day rate calculator with tax adjustment"

### Inputs
| Field | Type | Range | Default | Required | Help Text |
|-------|------|-------|---------|----------|-----------|
| Annual Salary | Currency | $0 - $1M | - | Yes | Your target annual income |
| Tax Rate | Percentage | 0-50% | 25% | Yes | Estimated tax rate |
| Vacation Days | Number | 0-60 | 15 | Yes | Days off per year |
| Holidays | Number | 0-30 | 10 | No | Public holidays |
| Benefits Value | Currency | $0 - $100k | $0 | No | Value of benefits you need to replace |

### Outputs
| Result | Format | Description |
|--------|--------|-------------|
| Gross Day Rate | Currency | Before tax deductions |
| Net Day Rate | Currency | After tax deductions |
| Hourly Rate | Currency | 8-hour day equivalent |
| Monthly Income | Currency | At full utilization |

### Formula
Working Days = 260 - Vacation Days - Holidays
Gross Day Rate = (Annual Salary + Benefits Value) / Working Days
Net Day Rate = Gross Day Rate × (1 - Tax Rate)
Hourly Rate = Net Day Rate / 8

### Edge Cases
- If Working Days ≤ 0: Show error "Not enough working days"
- If Tax Rate = 0: Show note about self-employment tax
- Maximum salary: $1,000,000 (prevent unrealistic inputs)
```

---

## Step 3: Create File Structure

Create the calculator folder and files.

### Directory Structure

```
src/components/calculators/[CalculatorName]/
├── types.ts           # TypeScript interfaces
├── calculations.ts    # Pure calculation functions
└── [CalculatorName]Calculator.tsx  # React component
```

### Create Files Command

```bash
# Replace YourCalculator with your calculator name (PascalCase)
mkdir -p src/components/calculators/YourCalculator
touch src/components/calculators/YourCalculator/types.ts
touch src/components/calculators/YourCalculator/calculations.ts
touch src/components/calculators/YourCalculator/YourCalculatorCalculator.tsx
```

---

## Step 4: Implement Types

Define TypeScript interfaces for type safety.

### AI Prompt for Types

```
Create TypeScript interfaces for a [CALCULATOR NAME] with these inputs and outputs:

Inputs:
- [List your inputs with types]

Outputs:
- [List your outputs with types]

Generate:
1. CalculatorInputs interface
2. CalculatorResult interface
3. Any helper types needed

Use descriptive names and add JSDoc comments explaining each field.
```

### Example: types.ts

```typescript
/**
 * Input values for the Freelance Day Rate Calculator
 */
export interface FreelanceDayRateInputs {
  /** Target annual income in dollars */
  annualSalary: number;
  /** Estimated tax rate as decimal (0.25 = 25%) */
  taxRate: number;
  /** Number of vacation days per year */
  vacationDays: number;
  /** Number of public holidays */
  holidays: number;
  /** Value of benefits to replace (health insurance, etc.) */
  benefitsValue: number;
}

/**
 * Calculated results from the Freelance Day Rate Calculator
 */
export interface FreelanceDayRateResult {
  /** Day rate before taxes */
  grossDayRate: number;
  /** Day rate after taxes */
  netDayRate: number;
  /** Hourly rate (8-hour day) */
  hourlyRate: number;
  /** Monthly income at full utilization */
  monthlyIncome: number;
  /** Number of billable working days per year */
  workingDays: number;
  /** Annual income comparison */
  annualComparison: {
    asEmployee: number;
    asFreelancer: number;
  };
}

/**
 * Default input values
 */
export const DEFAULT_INPUTS: FreelanceDayRateInputs = {
  annualSalary: 75000,
  taxRate: 0.25,
  vacationDays: 15,
  holidays: 10,
  benefitsValue: 0,
};
```

---

## Step 5: Implement Calculations

Write pure functions for the math logic.

### AI Prompt for Calculations

```
Create a TypeScript calculation function for a [CALCULATOR NAME].

Inputs (from types.ts):
[Paste your CalculatorInputs interface]

Outputs (from types.ts):
[Paste your CalculatorResult interface]

Formula:
[Describe your calculation logic]

Requirements:
1. Pure function (no side effects)
2. Handle edge cases (division by zero, negative values)
3. Round currency to 2 decimal places
4. Add JSDoc comments
5. Export as named function
```

### Example: calculations.ts

```typescript
import type { FreelanceDayRateInputs, FreelanceDayRateResult } from './types';

/**
 * Calculate freelance day rate based on salary comparison
 *
 * @param inputs - Calculator input values
 * @returns Calculated day rate and related metrics
 * @throws Error if working days calculation results in zero or negative
 */
export function calculateFreelanceDayRate(
  inputs: FreelanceDayRateInputs
): FreelanceDayRateResult {
  const {
    annualSalary,
    taxRate,
    vacationDays,
    holidays,
    benefitsValue,
  } = inputs;

  // Calculate working days (standard year has 260 weekdays)
  const workingDays = 260 - vacationDays - holidays;

  // Guard against invalid working days
  if (workingDays <= 0) {
    throw new Error('Working days must be greater than zero');
  }

  // Calculate rates
  const totalCompensation = annualSalary + benefitsValue;
  const grossDayRate = totalCompensation / workingDays;
  const netDayRate = grossDayRate * (1 - taxRate);
  const hourlyRate = netDayRate / 8;

  // Calculate monthly income (assuming 21.7 working days per month)
  const monthlyIncome = netDayRate * 21.7;

  // Round to 2 decimal places for currency
  const round = (n: number) => Math.round(n * 100) / 100;

  return {
    grossDayRate: round(grossDayRate),
    netDayRate: round(netDayRate),
    hourlyRate: round(hourlyRate),
    monthlyIncome: round(monthlyIncome),
    workingDays,
    annualComparison: {
      asEmployee: round(annualSalary),
      asFreelancer: round(netDayRate * workingDays),
    },
  };
}
```

---

## Step 6: Create React Component

Build the interactive calculator UI.

### AI Prompt for Component

```
Create a React component for a [CALCULATOR NAME] with:

Inputs: [List inputs with types]
Outputs: [List outputs]

Requirements:
1. Use React hooks (useState) for state management
2. Calculate results on every input change (no submit button)
3. Format currency with $ and commas
4. Format percentages with % symbol
5. Show results in a clean card layout
6. Use Tailwind CSS classes for styling
7. Include input validation
8. Handle errors gracefully
9. Make it accessible (labels, ARIA attributes)
10. Mobile-responsive design

Follow this structure:
- State for all inputs
- useEffect or useMemo for calculations
- Input section with labeled fields
- Results section with formatted output
```

### Example: FreelanceDayRateCalculator.tsx

```tsx
import { useState, useMemo } from 'react';
import { calculateFreelanceDayRate } from './calculations';
import { DEFAULT_INPUTS, type FreelanceDayRateInputs } from './types';

// Currency formatter
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function FreelanceDayRateCalculator() {
  const [inputs, setInputs] = useState<FreelanceDayRateInputs>(DEFAULT_INPUTS);
  const [error, setError] = useState<string | null>(null);

  // Calculate results whenever inputs change
  const result = useMemo(() => {
    try {
      setError(null);
      return calculateFreelanceDayRate(inputs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation error');
      return null;
    }
  }, [inputs]);

  // Update a single input field
  const updateInput = (field: keyof FreelanceDayRateInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      {/* Input Section */}
      <div className="space-y-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Your Information
        </h2>

        {/* Annual Salary */}
        <div>
          <label
            htmlFor="annualSalary"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Target Annual Salary
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              id="annualSalary"
              type="number"
              min="0"
              max="1000000"
              value={inputs.annualSalary}
              onChange={(e) => updateInput('annualSalary', Number(e.target.value))}
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                         transition-colors text-lg"
              aria-describedby="annualSalary-help"
            />
          </div>
          <p id="annualSalary-help" className="text-sm text-gray-500 mt-1">
            Your target annual income before taxes
          </p>
        </div>

        {/* Tax Rate */}
        <div>
          <label
            htmlFor="taxRate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Estimated Tax Rate
          </label>
          <div className="relative">
            <input
              id="taxRate"
              type="number"
              min="0"
              max="50"
              value={inputs.taxRate * 100}
              onChange={(e) => updateInput('taxRate', Number(e.target.value) / 100)}
              className="w-full pl-4 pr-8 py-3 border-2 border-gray-200 rounded-lg
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                         transition-colors text-lg"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              %
            </span>
          </div>
        </div>

        {/* Vacation Days */}
        <div>
          <label
            htmlFor="vacationDays"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Vacation Days Per Year
          </label>
          <input
            id="vacationDays"
            type="number"
            min="0"
            max="60"
            value={inputs.vacationDays}
            onChange={(e) => updateInput('vacationDays', Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                       transition-colors text-lg"
          />
        </div>

        {/* Holidays */}
        <div>
          <label
            htmlFor="holidays"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Public Holidays
          </label>
          <input
            id="holidays"
            type="number"
            min="0"
            max="30"
            value={inputs.holidays}
            onChange={(e) => updateInput('holidays', Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                       transition-colors text-lg"
          />
        </div>

        {/* Benefits Value */}
        <div>
          <label
            htmlFor="benefitsValue"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Benefits Value (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              id="benefitsValue"
              type="number"
              min="0"
              max="100000"
              value={inputs.benefitsValue}
              onChange={(e) => updateInput('benefitsValue', Number(e.target.value))}
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                         transition-colors text-lg"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Annual value of benefits you'll need to self-fund (health insurance, etc.)
          </p>
        </div>
      </div>

      {/* Results Section */}
      {error ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      ) : result && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Your Freelance Rates
          </h2>

          {/* Primary Result */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
            <p className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2">
              Recommended Day Rate
            </p>
            <p className="text-4xl font-bold text-blue-700 tabular-nums">
              {formatCurrency(result.netDayRate)}
            </p>
            <p className="text-sm text-blue-600 mt-2">
              After {inputs.taxRate * 100}% tax
            </p>
          </div>

          {/* Secondary Results */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Gross Day Rate
              </p>
              <p className="text-xl font-semibold text-gray-800 tabular-nums">
                {formatCurrency(result.grossDayRate)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Hourly Rate
              </p>
              <p className="text-xl font-semibold text-gray-800 tabular-nums">
                {formatCurrency(result.hourlyRate)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Monthly Income
              </p>
              <p className="text-xl font-semibold text-gray-800 tabular-nums">
                {formatCurrency(result.monthlyIncome)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Working Days
              </p>
              <p className="text-xl font-semibold text-gray-800 tabular-nums">
                {result.workingDays}
              </p>
            </div>
          </div>

          {/* Comparison */}
          <div className="bg-gray-100 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Annual Income Comparison
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">As Employee</p>
                <p className="text-lg font-semibold text-gray-700">
                  {formatCurrency(result.annualComparison.asEmployee)}
                </p>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="text-right">
                <p className="text-xs text-gray-500">As Freelancer</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(result.annualComparison.asFreelancer)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Step 7: Create Astro Page

Build the SEO-optimized page.

### AI Prompt for Page

```
Create an Astro page for a [CALCULATOR NAME] targeting "[TARGET KEYWORD]".

Include:
1. SEO meta tags (title 55-60 chars, description 150-160 chars)
2. Schema.org SoftwareApplication JSON-LD
3. FAQ schema for the FAQ section
4. Import and use the React calculator component with client:load
5. Educational content sections:
   - Introduction (50-100 words)
   - How to Use (100-150 words)
   - Understanding Results (150-200 words)
6. FAQ section (7-10 questions targeting related keywords)
7. Related calculators section

Use BaseLayout and follow existing calculator page patterns.
```

### Example: freelance-day-rate-calculator.astro

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import FreelanceDayRateCalculator from '../../components/calculators/FreelanceDayRate/FreelanceDayRateCalculator';

const title = 'Freelance Day Rate Calculator | Compare to Salary + Tax';
const description = 'Calculate your ideal freelance day rate compared to a salaried position. Includes tax adjustments, benefits analysis, and real take-home pay comparison.';
const keywords = 'freelance day rate calculator, freelance rate calculator, day rate vs salary, freelance tax calculator';

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Freelance Day Rate Calculator",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": description
};

const faqs = [
  {
    question: "How do I calculate my freelance day rate?",
    answer: "Divide your target annual income by the number of billable working days (typically 220-235 days after accounting for vacation, holidays, and unbillable time). Then add a buffer for taxes and benefits you'll need to self-fund."
  },
  {
    question: "What's a good freelance day rate?",
    answer: "A good day rate depends on your industry, experience, and location. Generally, freelance day rates should be 1.5-2x what you'd earn as an employee to account for taxes, benefits, and unbillable time."
  },
  {
    question: "Should I charge hourly or daily as a freelancer?",
    answer: "Day rates are often better for project work as they encourage efficiency and reduce time-tracking overhead. Hourly rates may be better for ongoing support contracts or when scope is highly variable."
  },
  {
    question: "How much should I add for taxes as a freelancer?",
    answer: "In the US, self-employment tax alone is 15.3%. Combined with income tax, most freelancers should budget 25-35% of their gross income for taxes depending on their tax bracket."
  },
  {
    question: "What's the difference between gross and net day rate?",
    answer: "Gross day rate is before taxes. Net day rate is what you keep after paying taxes. When comparing to a salary, always compare net-to-net for an accurate picture."
  },
  {
    question: "How many billable days should I plan for per year?",
    answer: "Most freelancers realistically bill 200-230 days per year. This accounts for vacation, holidays, sick days, admin time, marketing, and gaps between projects."
  },
  {
    question: "Should my freelance rate include benefits?",
    answer: "Yes! As a freelancer, you need to fund your own health insurance, retirement, equipment, and other benefits an employer would provide. Add 20-30% to your base rate to cover these."
  }
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};
---

<BaseLayout title={title} description={description} keywords={keywords}>
  <script type="application/ld+json" set:html={JSON.stringify(schema)} />
  <script type="application/ld+json" set:html={JSON.stringify(faqSchema)} />

  <article class="max-w-4xl mx-auto">
    <!-- Hero -->
    <header class="text-center mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Freelance Day Rate Calculator
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Calculate your ideal freelance day rate compared to a salaried position,
        including tax adjustments and benefits analysis.
      </p>
    </header>

    <!-- Calculator -->
    <section class="mb-12">
      <FreelanceDayRateCalculator client:load />
    </section>

    <!-- How to Use -->
    <section class="prose prose-lg max-w-none mb-12">
      <h2>How to Use This Calculator</h2>
      <p>
        Enter your target annual salary - this is what you'd want to earn as an
        employee. Then input your estimated tax rate (typically 25-35% for most
        freelancers in the US). Adjust vacation days and holidays based on how
        much time off you plan to take.
      </p>
      <p>
        If you're currently employed and receiving benefits like health insurance
        or retirement matching, add their annual value to the Benefits Value field.
        This ensures your day rate accounts for benefits you'll need to self-fund.
      </p>
    </section>

    <!-- Understanding Results -->
    <section class="prose prose-lg max-w-none mb-12">
      <h2>Understanding Your Results</h2>
      <p>
        The <strong>Net Day Rate</strong> is your recommended minimum day rate -
        this is what you should charge to match your target salary after taxes.
        The Gross Day Rate shows what you'd need to invoice before taxes.
      </p>
      <p>
        The <strong>Hourly Rate</strong> is calculated based on an 8-hour workday.
        Some freelancers prefer to quote hourly for smaller projects or ongoing
        support work.
      </p>
      <p>
        <strong>Monthly Income</strong> assumes full utilization (billing every
        working day). In reality, expect 70-80% utilization due to admin work,
        marketing, and gaps between projects.
      </p>
    </section>

    <!-- FAQ Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">
        Frequently Asked Questions
      </h2>
      <div class="space-y-6">
        {faqs.map((faq) => (
          <details class="bg-gray-50 rounded-lg p-6 group">
            <summary class="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
              {faq.question}
              <span class="text-gray-400 group-open:rotate-180 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p class="mt-4 text-gray-600">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>

    <!-- Related Calculators -->
    <section>
      <h2 class="text-2xl font-bold text-gray-900 mb-6">
        Related Calculators
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/calculators/hourly-to-salary-calculator"
           class="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-900">Hourly to Salary Calculator</h3>
          <p class="text-gray-600 text-sm mt-1">
            Convert hourly rates to annual salary with tax adjustments.
          </p>
        </a>
        <a href="/calculators/side-hustle-profitability-calculator"
           class="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h3 class="font-semibold text-gray-900">Side Hustle Calculator</h3>
          <p class="text-gray-600 text-sm mt-1">
            Calculate if your side project is truly profitable.
          </p>
        </a>
      </div>
    </section>
  </article>
</BaseLayout>
```

---

## Step 8: Testing Checklist

Before launching, verify everything works:

### Functionality
- [ ] All inputs accept valid values
- [ ] Calculations are mathematically correct
- [ ] Edge cases handled (zero, negatives, max values)
- [ ] Error messages display appropriately
- [ ] Results update immediately on input change

### Design
- [ ] Matches design system colors and typography
- [ ] Mobile responsive (test at 320px, 768px, 1024px)
- [ ] Touch targets are 44px minimum
- [ ] Focus states visible for keyboard users

### Accessibility
- [ ] All inputs have labels
- [ ] Color contrast passes WCAG AA
- [ ] Screen reader announces results
- [ ] Keyboard navigation works

### SEO
- [ ] Title tag 55-60 characters
- [ ] Meta description 150-160 characters
- [ ] H1 contains primary keyword
- [ ] Schema markup validates (use Google's Rich Results Test)
- [ ] Content is 300+ words

### Performance
- [ ] Lighthouse score 90+
- [ ] No layout shifts on calculation
- [ ] Page loads in < 2 seconds

---

## Step 9: Deploy

Commit and deploy your new calculator.

```bash
# Add all files
git add .

# Commit with descriptive message
git commit -m "feat(calculator): add [calculator name]

- Implement calculation logic for [use case]
- Add React component with form validation
- Create Astro page with SEO optimization
- Include FAQ section with [X] questions

Target keyword: [your target keyword]"

# Push to deploy
git push origin main
```

Vercel will automatically build and deploy.

---

## Complete AI Prompt Template

Use this comprehensive prompt to generate a complete calculator in one go:

```
Create a complete calculator for: [CALCULATOR NAME]

Target keyword: "[LONG-TAIL KEYWORD]"

## Inputs
[List each input with: name, type, range, default, description]

## Outputs
[List each output with: name, format, description]

## Formula
[Describe calculation logic step by step]

## Generate the following files:

1. **types.ts** - TypeScript interfaces for inputs and outputs with JSDoc comments

2. **calculations.ts** - Pure calculation function that:
   - Takes inputs, returns outputs
   - Handles edge cases
   - Rounds currency to 2 decimals
   - Has JSDoc documentation

3. **[CalculatorName]Calculator.tsx** - React component that:
   - Uses useState for inputs with sensible defaults
   - Calculates results on every input change
   - Formats currency with $ and commas
   - Shows results in cards
   - Uses Tailwind CSS (blue-500 primary color)
   - Is accessible (labels, ARIA)
   - Mobile-first responsive

4. **[calculator-name].astro** - Astro page that:
   - Has SEO meta tags (title 55-60 chars, desc 150-160 chars)
   - Includes SoftwareApplication schema
   - Imports calculator with client:load
   - Has "How to Use" section (100 words)
   - Has "Understanding Results" section (150 words)
   - Has FAQ with 7 questions and FAQPage schema
   - Has related calculators section

Follow the existing codebase patterns. Use Inter font with tabular-nums for numbers.
```

---

## Troubleshooting

### Calculator doesn't update in real-time
- Ensure using `onChange` not `onBlur`
- Check that state updates trigger re-render
- Verify `useMemo` dependencies are correct

### TypeScript errors
- Check interface imports
- Ensure all required fields are provided
- Verify type compatibility in calculations

### Styling issues
- Check Tailwind classes are valid
- Ensure global.css imports Tailwind
- Clear build cache: `rm -rf .astro && npm run build`

### SEO schema not validating
- Test with Google's Rich Results Test
- Check JSON-LD syntax (valid JSON)
- Ensure all required schema fields present

---

*Guide Version: 1.0.0*
*Last Updated: January 2026*
