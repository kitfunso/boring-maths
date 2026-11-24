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
  w2Wages: number;
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
  qbiDeduction: number;
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

export const HIGH_INCOME_THRESHOLDS: Record<FilingStatus, number> = {
  single: 150000,
  married_jointly: 150000,
  married_separately: 75000,
  head_of_household: 150000,
};

export function getDefaultInputs(): USQuarterlyTaxInputs {
  return {
    filingStatus: 'single',
    expectedAnnualIncome: 100000,
    selfEmploymentIncome: 60000,
    w2Wages: 40000,
    withholdingsFromW2: 5000,
    priorYearTax: 15000,
    priorYearAGI: 90000,
  };
}
