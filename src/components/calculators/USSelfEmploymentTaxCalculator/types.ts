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
  qbiDeduction: number;
  taxableIncome: number;
  federalIncomeTax: number;
  totalTax: number;
  effectiveRate: number;
  quarterlyPayment: number;
  afterTaxIncome: number;
  quarterlyDueDates: string[];
}

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  married_jointly: 'Married Filing Jointly',
  married_separately: 'Married Filing Separately',
  head_of_household: 'Head of Household',
};

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
