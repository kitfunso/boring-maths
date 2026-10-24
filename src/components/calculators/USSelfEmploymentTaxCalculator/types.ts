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
  socialSecurityWageBase: 184500, // 2026 SS wage base
};

// Additional Medicare Tax thresholds by filing status
export const ADDITIONAL_MEDICARE_THRESHOLDS: Record<FilingStatus, number> = {
  single: 200000,
  married_jointly: 250000,
  married_separately: 125000,
  head_of_household: 200000,
};

// 2026 Tax Brackets (Rev. Proc. 2025-32, section 4.01)
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
