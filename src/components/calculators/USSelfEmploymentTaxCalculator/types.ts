/**
 * US Self-Employment Tax Calculator Types
 *
 * Calculate SE tax (15.3%), federal income tax, and quarterly payments for freelancers.
 */

export type FilingStatus =
  | 'single'
  | 'married_jointly'
  | 'married_separately'
  | 'head_of_household';

export interface USSelfEmploymentTaxInputs {
  filingStatus: FilingStatus;
  selfEmploymentIncome: number;
  businessExpenses: number;
  otherIncome: number;
  deductionType: 'standard' | 'itemized';
  itemizedDeductions: number;
}

export interface USSelfEmploymentTaxResult {
  netSelfEmployment: number;
  selfEmploymentTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  additionalMedicareTax: number;
  halfSETaxDeduction: number;
  taxableIncome: number;
  federalIncomeTax: number;
  totalTax: number;
  effectiveRate: number;
  quarterlyPayment: number;
  afterTaxIncome: number;
  quarterlyDueDates: string[];
}

// 2025 SE Tax Constants
export const SE_TAX_RATES = {
  selfEmploymentRate: 0.9235, // 92.35% of net earnings subject to SE tax
  socialSecurityRate: 0.124, // 12.4%
  medicareRate: 0.029, // 2.9%
  additionalMedicareRate: 0.009, // 0.9% additional Medicare
  socialSecurityWageBase: 176100, // 2025 SS wage base
  additionalMedicareSingleThreshold: 200000,
  additionalMedicareMFJThreshold: 250000,
};

// 2025 Tax Brackets (same as tax bracket calculator)
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

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  married_jointly: 'Married Filing Jointly',
  married_separately: 'Married Filing Separately',
  head_of_household: 'Head of Household',
};

// 2025 quarterly due dates
export const QUARTERLY_DUE_DATES_2025 = [
  'April 15, 2025',
  'June 16, 2025',
  'September 15, 2025',
  'January 15, 2026',
];

export function getDefaultInputs(): USSelfEmploymentTaxInputs {
  return {
    filingStatus: 'single',
    selfEmploymentIncome: 80000,
    businessExpenses: 10000,
    otherIncome: 0,
    deductionType: 'standard',
    itemizedDeductions: 0,
  };
}
