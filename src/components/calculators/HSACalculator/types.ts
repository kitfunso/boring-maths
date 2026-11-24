export type CoverageType = 'individual' | 'family';

export interface HSAInputs {
  coverageType: CoverageType;

  annualContribution: number;

  employerContribution: number;

  age: number;

  federalTaxRate: number;

  stateTaxRate: number;

  currentBalance: number;

  expectedReturn: number;

  yearsToRetirement: number;

  annualMedicalExpenses: number;
}

export interface HSAResult {
  maxContribution: number;

  catchUpAmount: number;

  totalLimit: number;

  totalContribution: number;

  overContribution: number;

  remainingRoom: number;

  federalTaxSavings: number;
  stateTaxSavings: number;
  ficaTaxSavings: number;
  totalAnnualTaxSavings: number;

  effectiveDiscount: number;

  projectedBalance: number;

  totalContributions: number;

  totalGrowth: number;

  taxFreeGrowth: number;

  projections: {
    year: number;
    age: number;
    contribution: number;
    balance: number;
    taxSavings: number;
  }[];
}

export const HSA_LIMITS_2026 = {
  individual: 4400,
  family: 8750,
  catchUp: 1000, // For age 55+
  catchUpAge: 55,
};

export const FICA_RATE = 0.0765;

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
