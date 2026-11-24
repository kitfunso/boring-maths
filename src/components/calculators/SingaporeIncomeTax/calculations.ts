export interface TaxBracket {
  upTo: number;
  rate: number;
}

export const TAX_BRACKETS: readonly TaxBracket[] = [
  { upTo: 20000, rate: 0 },
  { upTo: 30000, rate: 0.02 },
  { upTo: 40000, rate: 0.035 },
  { upTo: 80000, rate: 0.07 },
  { upTo: 120000, rate: 0.115 },
  { upTo: 160000, rate: 0.15 },
  { upTo: 200000, rate: 0.18 },
  { upTo: 240000, rate: 0.19 },
  { upTo: 280000, rate: 0.195 },
  { upTo: 320000, rate: 0.2 },
  { upTo: 500000, rate: 0.22 },
  { upTo: 1000000, rate: 0.23 },
  { upTo: Infinity, rate: 0.24 },
];

export interface BracketBreakdown {
  from: number;
  to: number;
  rate: number;
  taxable: number;
  tax: number;
}

export interface SingaporeIncomeTaxInputs {
  assessableIncome: number;
  totalReliefs: number;
}

export interface SingaporeIncomeTaxResult {
  assessableIncome: number;
  totalReliefs: number;
  chargeableIncome: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  brackets: BracketBreakdown[];
}

export function getDefaultInputs(): SingaporeIncomeTaxInputs {
  return {
    assessableIncome: 80000,
    totalReliefs: 0,
  };
}

function computeBrackets(chargeableIncome: number): BracketBreakdown[] {
  const breakdown: BracketBreakdown[] = [];
  let previousCeiling = 0;

  for (const bracket of TAX_BRACKETS) {
    if (chargeableIncome <= previousCeiling) break;
    const taxable = Math.min(chargeableIncome, bracket.upTo) - previousCeiling;
    breakdown.push({
      from: previousCeiling,
      to: bracket.upTo,
      rate: bracket.rate,
      taxable,
      tax: taxable * bracket.rate,
    });
    previousCeiling = bracket.upTo;
  }

  return breakdown;
}

export function calculateSingaporeIncomeTax(
  inputs: SingaporeIncomeTaxInputs
): SingaporeIncomeTaxResult {
  const assessableIncome = Math.max(0, inputs.assessableIncome || 0);
  const totalReliefs = Math.max(0, inputs.totalReliefs || 0);
  const chargeableIncome = Math.max(0, assessableIncome - totalReliefs);

  const brackets = computeBrackets(chargeableIncome);
  const totalTax = brackets.reduce((sum, b) => sum + b.tax, 0);
  const marginalRate = brackets.length > 0 ? brackets[brackets.length - 1].rate : 0;
  const effectiveRate = chargeableIncome > 0 ? (totalTax / chargeableIncome) * 100 : 0;

  const round2 = (v: number) => Math.round(v * 100) / 100;

  return {
    assessableIncome: round2(assessableIncome),
    totalReliefs: round2(totalReliefs),
    chargeableIncome: round2(chargeableIncome),
    totalTax: round2(totalTax),
    effectiveRate: round2(effectiveRate),
    marginalRate: round2(marginalRate * 100),
    brackets: brackets.map((b) => ({ ...b, tax: round2(b.tax) })),
  };
}
