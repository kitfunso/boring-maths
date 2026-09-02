export type TaxRegion = 'england' | 'scotland';

export type StudentLoanPlan = 'none' | 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgrad';

export interface UK100kInputs {
  /** Annual gross salary before any deductions */
  grossSalary: number;
  /** Tax region - England/Wales/NI or Scotland */
  taxRegion: TaxRegion;
  studentLoanPlan: StudentLoanPlan;
  /** Current pension contribution as percentage of salary */
  currentPensionPercent: number;
  /** Additional income (bonus, dividends, etc.) */
  bonusIncome: number;
}

export interface TaxBandBreakdown {
  name: string;
  rate: number;
  taxableAmount: number;
  taxPaid: number;
}

/** Comparison of current vs optimized position */
export interface TaxComparison {
  label: string;
  current: number;
  optimized: number;
  difference: number;
}

export interface UK100kResult {
  /** Total income before pension sacrifice */
  totalIncome: number;

  /** Taxable income after pension contribution */
  taxableIncome: number;

  /** Personal Allowance after tapering */
  personalAllowance: number;

  /** Amount of Personal Allowance lost due to income over £100k */
  personalAllowanceLost: number;

  incomeTax: number;

  nationalInsurance: number;

  studentLoanRepayment: number;

  currentPensionContribution: number;

  takeHomePay: number;

  /** Effective tax rate (total deductions / gross income) */
  effectiveTaxRate: number;

  marginalTaxRate: number;

  /** Whether income falls in the £100k-£125k tax trap zone */
  isInTaxTrap: boolean;

  /** Extra tax paid due to Personal Allowance loss */
  taxTrapCost: number;

  /** Amount of income in the 60%+ marginal rate zone */
  incomeInTrapZone: number;

  /** Pension contribution needed to restore full Personal Allowance */
  optimalPensionContribution: number;

  /** Optimal pension as percentage of salary */
  optimalPensionPercent: number;

  optimizedTakeHomePay: number;

  annualTaxSaved: number;

  /** Total value gained (tax saved + employer NI saved if salary sacrifice) */
  totalBenefit: number;

  /** Extra amount going into pension vs take-home reduction */
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
