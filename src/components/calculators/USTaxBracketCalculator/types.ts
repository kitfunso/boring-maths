/**
 * US Tax Bracket Calculator Types
 *
 * Calculate federal income tax, show tax brackets, and effective rates.
 */

export type FilingStatus =
  | 'single'
  | 'married_jointly'
  | 'married_separately'
  | 'head_of_household';

export interface USTaxBracketInputs {
  taxYear: TaxYear;
  filingStatus: FilingStatus;
  grossIncome: number;
  deductionType: 'standard' | 'itemized';
  itemizedDeductions: number;
}

export interface TaxBracketBreakdown {
  bracket: string;
  rate: number;
  incomeInBracket: number;
  taxInBracket: number;
}

export interface USTaxBracketResult {
  taxableIncome: number;
  federalTax: number;
  effectiveRate: number;
  marginalRate: number;
  standardDeduction: number;
  deductionUsed: number;
  afterTaxIncome: number;
  bracketBreakdown: TaxBracketBreakdown[];
  marginalBracketLabel: string;
}

export const TAX_YEARS = [2025, 2026] as const;
export type TaxYear = (typeof TAX_YEARS)[number];
export const DEFAULT_TAX_YEAR: TaxYear = 2026;

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

// 2025: IRS rates and brackets page; 2026: Rev. Proc. 2025-32 section 4.01
export const TAX_BRACKETS: Record<TaxYear, Record<FilingStatus, TaxBracket[]>> = {
  2025: {
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
  },
  2026: {
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
  },
};

// Standard deductions: Rev. Proc. 2025-32 section 3.01 (2025, post-OBBBA), 4.14 (2026)
export const STANDARD_DEDUCTIONS: Record<TaxYear, Record<FilingStatus, number>> = {
  2025: {
    single: 15750,
    married_jointly: 31500,
    married_separately: 15750,
    head_of_household: 23625,
  },
  2026: {
    single: 16100,
    married_jointly: 32200,
    married_separately: 16100,
    head_of_household: 24150,
  },
};

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  married_jointly: 'Married Filing Jointly',
  married_separately: 'Married Filing Separately',
  head_of_household: 'Head of Household',
};

export function getDefaultInputs(): USTaxBracketInputs {
  return {
    taxYear: DEFAULT_TAX_YEAR,
    filingStatus: 'single',
    grossIncome: 75000,
    deductionType: 'standard',
    itemizedDeductions: 0,
  };
}
