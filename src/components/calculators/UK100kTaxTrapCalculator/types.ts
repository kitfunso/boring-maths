export type TaxRegion = 'england' | 'scotland';

export type StudentLoanPlan = 'none' | 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgrad';

export interface UK100kInputs {
  grossSalary: number;
  taxRegion: TaxRegion;
  studentLoanPlan: StudentLoanPlan;
  currentPensionPercent: number;
  bonusIncome: number;
}

export interface TaxBandBreakdown {
  name: string;
  rate: number;
  taxableAmount: number;
  taxPaid: number;
}

export interface TaxComparison {
  label: string;
  current: number;
  optimized: number;
  difference: number;
}

export interface UK100kResult {
  totalIncome: number;

  taxableIncome: number;

  personalAllowance: number;

  personalAllowanceLost: number;

  incomeTax: number;

  nationalInsurance: number;

  studentLoanRepayment: number;

  currentPensionContribution: number;

  takeHomePay: number;

  effectiveTaxRate: number;

  marginalTaxRate: number;

  isInTaxTrap: boolean;

  taxTrapCost: number;

  incomeInTrapZone: number;

  optimalPensionContribution: number;

  optimalPensionPercent: number;

  optimizedTakeHomePay: number;

  annualTaxSaved: number;

  totalBenefit: number;

  pensionGainRatio: number;

  taxBreakdown: TaxBandBreakdown[];

  comparison: TaxComparison[];
}

export function getDefaultInputs(): UK100kInputs {
  return {
    grossSalary: 110000,
    taxRegion: 'england',
    studentLoanPlan: 'none',
    currentPensionPercent: 5,
    bonusIncome: 0,
  };
}

export const TAX_REGION_LABELS: Record<TaxRegion, string> = {
  england: 'England, Wales & NI',
  scotland: 'Scotland',
};

export const STUDENT_LOAN_LABELS: Record<StudentLoanPlan, string> = {
  none: 'No Student Loan',
  plan1: 'Plan 1 (pre-2012)',
  plan2: 'Plan 2 (post-2012)',
  plan4: 'Plan 4 (Scotland)',
  plan5: 'Plan 5 (post-2023)',
  postgrad: 'Postgraduate Loan',
};
