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
  safeHarborRule: string;
  meetsCurrentYearSafeHarbor: boolean;
  meetsPriorYearSafeHarbor: boolean;
  penaltyRisk: 'none' | 'low' | 'high';
  annualizedIncomeAdvice: string;
}

// 2026 Tax Constants (Rev. Proc. 2025-32, SSA wage base, Pub. 505)
export const TAX_BRACKETS_2026 = {
  single: [
    { min: 0, max: 12400, rate: 10 },
    { min: 12400, max: 50400, rate: 12 },
    { min: 50400, max: 105700, rate: 22 },
    { min: 105700, max: 201775, rate: 24 },
    { min: 201775, max: 256225, rate: 32 },
    { min: 256225, max: 640600, rate: 35 },
    { min: 640600, max: Infinity, rate: 37 },
  ],
  married_jointly: [
    { min: 0, max: 24800, rate: 10 },
    { min: 24800, max: 100800, rate: 12 },
    { min: 100800, max: 211400, rate: 22 },
    { min: 211400, max: 403550, rate: 24 },
    { min: 403550, max: 512450, rate: 32 },
    { min: 512450, max: 768700, rate: 35 },
    { min: 768700, max: Infinity, rate: 37 },
  ],
  married_separately: [
    { min: 0, max: 12400, rate: 10 },
    { min: 12400, max: 50400, rate: 12 },
    { min: 50400, max: 105700, rate: 22 },
    { min: 105700, max: 201775, rate: 24 },
    { min: 201775, max: 256225, rate: 32 },
    { min: 256225, max: 384350, rate: 35 },
    { min: 384350, max: Infinity, rate: 37 },
  ],
  head_of_household: [
    { min: 0, max: 17700, rate: 10 },
    { min: 17700, max: 67450, rate: 12 },
    { min: 67450, max: 105700, rate: 22 },
    { min: 105700, max: 201750, rate: 24 },
    { min: 201750, max: 256200, rate: 32 },
    { min: 256200, max: 640600, rate: 35 },
    { min: 640600, max: Infinity, rate: 37 },
  ],
};

export const STANDARD_DEDUCTIONS_2026: Record<FilingStatus, number> = {
  single: 16100,
  married_jointly: 32200,
  married_separately: 16100,
  head_of_household: 24150,
};

export const SE_TAX_RATE = 0.153;
export const SE_TAX_MULTIPLIER = 0.9235;
export const SS_WAGE_BASE_2026 = 184500;

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
