# 60% Tax Trap Calculator — Spec

## SEO Target Keywords
- "60% tax trap calculator" (58 impressions)
- "60 tax trap calculator" (52 impressions)  
- "tax trap over 100k calculator" (48 impressions)
- "uk 100k tax trap"
- "personal allowance taper calculator"
- "effective marginal tax rate uk"

**Total keyword cluster:** ~160+ impressions, 0 clicks (opportunity)

---

## What is the 60% Tax Trap?

UK earners between £100,000 and £125,140 lose £1 of personal allowance for every £2 earned over £100K. This creates:

- 40% income tax
- 20% effective tax from lost personal allowance (£1 allowance lost = £0.40 tax on that £1)
- = **60% effective marginal rate**

For those with children earning £50K-£60K, there's also High Income Child Benefit Charge (HICBC) which can push effective rates even higher.

---

## Calculator Inputs

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| Gross Annual Salary | number | 100000 | Required |
| Pension Contributions (%) | number | 0 | Salary sacrifice reduces taxable income |
| Bonus | number | 0 | Optional one-time payment |
| Number of Children | number | 0 | For child benefit calculation |
| Student Loan Plan | select | None | Plan 1/2/4/5/Postgrad |
| Tax Year | select | 2024/25 | For correct thresholds |

---

## Calculator Outputs

### Primary Display
- **Effective Marginal Tax Rate** — The headline number (e.g., "62.5%")
- **Tax on Next £1,000** — Concrete example of trap impact
- **Personal Allowance Remaining** — How much of £12,570 is left

### Breakdown Table
| Component | Amount | Rate |
|-----------|--------|------|
| Income Tax (Basic) | £X | 20% |
| Income Tax (Higher) | £X | 40% |
| Personal Allowance Lost | £X | 20% effective |
| National Insurance | £X | 2% above £50K |
| Student Loan | £X | 9% |
| Child Benefit Clawback | £X | 1% per £200 over £60K |
| **Total Tax** | £X | **X%** |

### Optimization Suggestions
- "Contribute £X to pension to escape the trap"
- "Your optimal salary is £X to maximize take-home"
- "Salary sacrifice of £X would save you £Y"

---

## Tax Calculations (2024/25)

```typescript
const TAX_YEAR_2024_25 = {
  personalAllowance: 12570,
  personalAllowanceTaperStart: 100000,
  personalAllowanceTaperEnd: 125140, // 100000 + (12570 * 2)
  basicRate: 0.20,
  basicRateLimit: 37700,
  higherRate: 0.40,
  higherRateLimit: 125140,
  additionalRate: 0.45,
  niLowerThreshold: 12570,
  niUpperThreshold: 50270,
  niLowerRate: 0.12, // Actually 0.08 from Jan 2024
  niUpperRate: 0.02,
};

function calculatePersonalAllowance(grossIncome: number): number {
  if (grossIncome <= 100000) return 12570;
  if (grossIncome >= 125140) return 0;
  const reduction = Math.floor((grossIncome - 100000) / 2);
  return Math.max(0, 12570 - reduction);
}

function calculateEffectiveMarginalRate(grossIncome: number): number {
  if (grossIncome > 100000 && grossIncome < 125140) {
    // 40% income tax + 20% from lost allowance + 2% NI = 62%
    return 0.62;
  }
  if (grossIncome > 50270) return 0.42; // 40% + 2% NI
  // etc.
}
```

---

## Child Benefit Clawback (HICBC)

For highest earner in household £60K-£80K:
- Clawback = 1% of child benefit per £200 over £60K
- At £80K = 100% clawback

```typescript
const CHILD_BENEFIT_WEEKLY = {
  first: 25.60,
  additional: 16.95,
};

function calculateChildBenefitClawback(
  income: number, 
  children: number
): number {
  if (income <= 60000 || children === 0) return 0;
  
  const annualBenefit = (25.60 + (children - 1) * 16.95) * 52;
  const clawbackPercent = Math.min(100, Math.floor((income - 60000) / 200));
  return annualBenefit * (clawbackPercent / 100);
}
```

---

## Page Structure

```
/calculators/uk-tax-trap-calculator

H1: UK 60% Tax Trap Calculator
Subtitle: See how earning over £100K affects your real tax rate

[Calculator Component]

## What is the 60% Tax Trap?
Explainer content with examples

## How to Escape the Tax Trap
- Pension contributions
- Salary sacrifice
- Charitable giving
- Timing bonuses

## FAQs (Schema markup)
- "What is the 60% tax trap?"
- "At what salary does the tax trap start?"
- "How do I avoid the 60% tax trap?"
- "Does pension contribution reduce the tax trap?"

## Related Calculators
- Salary Sacrifice Calculator
- Take Home Pay Calculator
- Pension Tax Relief Calculator
```

---

## Schema Markup

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the 60% tax trap in the UK?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The 60% tax trap affects UK earners between £100,000 and £125,140. For every £2 earned over £100,000, you lose £1 of personal allowance. Combined with 40% income tax, this creates an effective 60% marginal tax rate."
      }
    }
  ]
}
```

---

## Implementation Checklist

- [ ] Create calculator component in `src/components/calculators/TaxTrap/`
- [ ] Add calculations in `src/components/calculators/TaxTrap/calculations.ts`
- [ ] Create page at `src/pages/calculators/uk-tax-trap-calculator.astro`
- [ ] Add FAQ schema markup
- [ ] Add to homepage calculator list
- [ ] Internal link from salary calculator
- [ ] Write supporting content (escape strategies)
- [ ] Test edge cases (exactly £100K, exactly £125,140, with/without children)

---

## Success Metrics

- Rank top 10 for "60% tax trap calculator" within 3 months
- 500+ monthly impressions
- 5%+ CTR (vs current 0%)
- Becomes top 3 traffic driver for site
