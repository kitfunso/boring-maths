/**
 * HSA Calculator - Type Definitions
 *
 * Health Savings Account calculator with triple tax advantage analysis.
 * 2025 contribution limits and tax savings calculations.
 */

export type CoverageType = 'individual' | 'family';

export interface HSAInputs {
  /** Coverage type */
  coverageType: CoverageType;

  /** Annual contribution amount */
  annualContribution: number;

  /** Employer contribution (if any) */
  employerContribution: number;

  /** Current age */
  age: number;

  /** Federal tax bracket (%) */
  federalTaxRate: number;

  /** State tax rate (%) */
  stateTaxRate: number;

  /** Current HSA balance */
  currentBalance: number;

  /** Expected annual return (%) */
  expectedReturn: number;

  /** Years until retirement/65 */
  yearsToRetirement: number;

  /** Annual medical expenses from HSA */
  annualMedicalExpenses: number;
}

export interface HSAResult {
  /** Maximum allowed contribution for coverage type */
  maxContribution: number;

  /** Catch-up contribution if 55+ */
  catchUpAmount: number;

  /** Total contribution limit (base + catch-up) */
  totalLimit: number;

  /** Your total contribution (employee + employer) */
  totalContribution: number;

  /** Amount over the limit (if any) */
  overContribution: number;

  /** Remaining contribution room */
  remainingRoom: number;

  /** Tax Savings Breakdown */
  federalTaxSavings: number;
  stateTaxSavings: number;
  ficaTaxSavings: number;
  totalAnnualTaxSavings: number;

  /** Effective "discount" on contributions */
  effectiveDiscount: number;

  /** Projected balance at retirement */
  projectedBalance: number;

  /** Total contributions over time */
  totalContributions: number;

  /** Total investment growth */
  totalGrowth: number;

  /** Tax-free growth amount */
  taxFreeGrowth: number;

  /** Year-by-year projection */
  projections: {
    year: number;
    age: number;
    contribution: number;
    balance: number;
    taxSavings: number;
  }[];
}

/** 2025 HSA Contribution Limits */
export const HSA_LIMITS_2025 = {
  individual: 4300,
  family: 8550,
  catchUp: 1000, // For age 55+
  catchUpAge: 55,
};

/** FICA tax rate (Social Security + Medicare) */
export const FICA_RATE = 0.0765;

/** Default federal tax brackets for quick selection */
export const FEDERAL_TAX_BRACKETS = [
  { rate: 10, label: '10%' },
  { rate: 12, label: '12%' },
  { rate: 22, label: '22%' },
  { rate: 24, label: '24%' },
  { rate: 32, label: '32%' },
  { rate: 35, label: '35%' },
  { rate: 37, label: '37%' },
];

export function getDefaultInputs(): HSAInputs {
  return {
    coverageType: 'individual',
    annualContribution: 3000,
    employerContribution: 500,
    age: 35,
    federalTaxRate: 22,
    stateTaxRate: 5,
    currentBalance: 5000,
    expectedReturn: 7,
    yearsToRetirement: 30,
    annualMedicalExpenses: 500,
  };
}
