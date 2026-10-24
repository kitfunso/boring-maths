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

// 2026 SE Tax Constants (SSA wage base, IRS Topic 554 and Additional Medicare Tax Q&A)
export const SE_TAX_RATES = {
  selfEmploymentRate: 0.9235, // 92.35% of net earnings subject to SE tax
  socialSecurityRate: 0.124, // 12.4%
  medicareRate: 0.029, // 2.9%
  additionalMedicareRate: 0.009, // 0.9% additional Medicare
};

// Additional Medicare Tax thresholds by filing status
export const ADDITIONAL_MEDICARE_THRESHOLDS: Record<FilingStatus, number> = {
  single: 200000,
  married_jointly: 250000,
  married_separately: 125000,
  head_of_household: 200000,
};

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  married_jointly: 'Married Filing Jointly',
  married_separately: 'Married Filing Separately',
  head_of_household: 'Head of Household',
};

// 2026 quarterly due dates (Pub. 505)
export const QUARTERLY_DUE_DATES_2026 = [
  'April 15, 2026',
  'June 15, 2026',
  'September 15, 2026',
  'January 15, 2027',
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
