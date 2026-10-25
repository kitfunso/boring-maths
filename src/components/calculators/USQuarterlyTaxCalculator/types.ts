/**
 * US Quarterly Estimated Tax Calculator Types
 *
 * Calculate quarterly estimated tax payments with safe harbor rules.
 */

export type FilingStatus =
  | 'single'
  | 'married_jointly'
  | 'married_separately'
  | 'head_of_household';
export type IncomeType = 'self_employed' | 'mixed' | 'investment';

export interface USQuarterlyTaxInputs {
  filingStatus: FilingStatus;
  expectedAnnualIncome: number;
  selfEmploymentIncome: number;
  withholdingsFromW2: number;
  priorYearTax: number;
  priorYearAGI: number;
}

export interface QuarterPayment {
  quarter: number;
  dueDate: string;
  amount: number;
  cumulativeAmount: number;
}

export interface USQuarterlyTaxResult {
  estimatedTotalTax: number;
  selfEmploymentTax: number;
  federalIncomeTax: number;
  alreadyWithheld: number;
  remainingTaxDue: number;
  quarterlyPayment: number;
  quarterPayments: QuarterPayment[];
  safeHarborAmount: number;
  currentYearSafeHarbor: number;
  priorYearSafeHarbor: number;
  safeHarborRule: string;
  meetsCurrentYearSafeHarbor: boolean;
  meetsPriorYearSafeHarbor: boolean;
  penaltyRisk: 'none' | 'low' | 'high';
  annualizedIncomeAdvice: string;
}

export const SE_TAX_RATE = 0.153;
export const SE_TAX_MULTIPLIER = 0.9235;

// Prior-year AGI above this raises the prior-year safe harbor from 100% to 110% (Pub. 505)
export const HIGH_INCOME_THRESHOLDS: Record<FilingStatus, number> = {
  single: 150000,
  married_jointly: 150000,
  married_separately: 75000,
  head_of_household: 150000,
};

export const QUARTERLY_DUE_DATES_2026 = [
  { quarter: 1, date: 'April 15, 2026', period: 'Jan 1 - Mar 31' },
  { quarter: 2, date: 'June 15, 2026', period: 'Apr 1 - May 31' },
  { quarter: 3, date: 'September 15, 2026', period: 'Jun 1 - Aug 31' },
  { quarter: 4, date: 'January 15, 2027', period: 'Sep 1 - Dec 31' },
];

export function getDefaultInputs(): USQuarterlyTaxInputs {
  return {
    filingStatus: 'single',
    expectedAnnualIncome: 100000,
    selfEmploymentIncome: 60000,
    withholdingsFromW2: 5000,
    priorYearTax: 15000,
    priorYearAGI: 90000,
  };
}
