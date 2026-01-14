/**
 * US Quarterly Estimated Tax Calculator Types
 *
 * Calculate quarterly estimated tax payments with safe harbor rules.
 */

export type FilingStatus = 'single' | 'married_jointly' | 'married_separately' | 'head_of_household';
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

// 2025 Tax Constants
export const TAX_BRACKETS_2025 = {
  single: [
    { min: 0, max: 11925, rate: 10 },
    { min: 11925, max: 48475, rate: 12 },
    { min: 48475, max: 103350, rate: 22 },
    { min: 103350, max: 197300, rate: 24 },
    { min: 197300, max: 250525, rate: 32 },
    { min: 250525, max: 626350, rate: 35 },
    { min: 626350, max: Infinity, rate: 37 },
  ],
  married_jointly: [
    { min: 0, max: 23850, rate: 10 },
    { min: 23850, max: 96950, rate: 12 },
    { min: 96950, max: 206700, rate: 22 },
    { min: 206700, max: 394600, rate: 24 },
    { min: 394600, max: 501050, rate: 32 },
    { min: 501050, max: 751600, rate: 35 },
    { min: 751600, max: Infinity, rate: 37 },
  ],
  married_separately: [
    { min: 0, max: 11925, rate: 10 },
    { min: 11925, max: 48475, rate: 12 },
    { min: 48475, max: 103350, rate: 22 },
    { min: 103350, max: 197300, rate: 24 },
    { min: 197300, max: 250525, rate: 32 },
    { min: 250525, max: 375800, rate: 35 },
    { min: 375800, max: Infinity, rate: 37 },
  ],
  head_of_household: [
    { min: 0, max: 17000, rate: 10 },
    { min: 17000, max: 64850, rate: 12 },
    { min: 64850, max: 103350, rate: 22 },
    { min: 103350, max: 197300, rate: 24 },
    { min: 197300, max: 250500, rate: 32 },
    { min: 250500, max: 626350, rate: 35 },
    { min: 626350, max: Infinity, rate: 37 },
  ],
};

export const STANDARD_DEDUCTIONS_2025: Record<FilingStatus, number> = {
  single: 15000,
  married_jointly: 30000,
  married_separately: 15000,
  head_of_household: 22500,
};

export const SE_TAX_RATE = 0.153;
export const SE_TAX_MULTIPLIER = 0.9235;
export const SS_WAGE_BASE_2025 = 176100;
export const HIGH_INCOME_THRESHOLD = 150000; // For 110% safe harbor rule

export const QUARTERLY_DUE_DATES_2025 = [
  { quarter: 1, date: 'April 15, 2025', period: 'Jan 1 - Mar 31' },
  { quarter: 2, date: 'June 16, 2025', period: 'Apr 1 - May 31' },
  { quarter: 3, date: 'September 15, 2025', period: 'Jun 1 - Aug 31' },
  { quarter: 4, date: 'January 15, 2026', period: 'Sep 1 - Dec 31' },
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
