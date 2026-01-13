/**
 * UK £100k Tax Trap Calculator Types
 *
 * TypeScript interfaces for calculator inputs and results.
 */

export type TaxRegion = 'england' | 'scotland';

export type StudentLoanPlan = 'none' | 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgrad';

/**
 * Calculator Input State
 */
export interface UK100kInputs {
  /** Annual gross salary before any deductions */
  grossSalary: number;
  /** Tax region - England/Wales/NI or Scotland */
  taxRegion: TaxRegion;
  /** Student loan plan type */
  studentLoanPlan: StudentLoanPlan;
  /** Current pension contribution as percentage of salary */
  currentPensionPercent: number;
  /** Additional income (bonus, dividends, etc.) */
  bonusIncome: number;
}

/**
 * Tax breakdown by band for visualization
 */
export interface TaxBandBreakdown {
  name: string;
  rate: number;
  taxableAmount: number;
  taxPaid: number;
}

/**
 * Comparison of current vs optimized position
 */
export interface TaxComparison {
  label: string;
  current: number;
  optimized: number;
  difference: number;
}

/**
 * Calculator Result
 */
export interface UK100kResult {
  // =========================================================================
  // CURRENT POSITION
  // =========================================================================

  /** Total income before pension sacrifice */
  totalIncome: number;

  /** Taxable income after pension contribution */
  taxableIncome: number;

  /** Personal Allowance after tapering */
  personalAllowance: number;

  /** Amount of Personal Allowance lost due to income over £100k */
  personalAllowanceLost: number;

  /** Income tax payable */
  incomeTax: number;

  /** National Insurance payable */
  nationalInsurance: number;

  /** Student loan repayment */
  studentLoanRepayment: number;

  /** Current pension contribution amount */
  currentPensionContribution: number;

  /** Take-home pay after all deductions */
  takeHomePay: number;

  /** Effective tax rate (total deductions / gross income) */
  effectiveTaxRate: number;

  /** Marginal tax rate at current income level */
  marginalTaxRate: number;

  // =========================================================================
  // TAX TRAP ANALYSIS
  // =========================================================================

  /** Whether income falls in the £100k-£125k tax trap zone */
  isInTaxTrap: boolean;

  /** Extra tax paid due to Personal Allowance loss */
  taxTrapCost: number;

  /** Amount of income in the 60%+ marginal rate zone */
  incomeInTrapZone: number;

  // =========================================================================
  // OPTIMIZATION
  // =========================================================================

  /** Pension contribution needed to restore full Personal Allowance */
  optimalPensionContribution: number;

  /** Optimal pension as percentage of salary */
  optimalPensionPercent: number;

  /** Take-home pay with optimal pension contribution */
  optimizedTakeHomePay: number;

  /** Tax saved by using optimal pension strategy */
  annualTaxSaved: number;

  /** Total value gained (tax saved + employer NI saved if salary sacrifice) */
  totalBenefit: number;

  /** Extra amount going into pension vs take-home reduction */
  pensionGainRatio: number;

  // =========================================================================
  // BREAKDOWNS FOR VISUALIZATION
  // =========================================================================

  /** Income tax breakdown by band */
  taxBreakdown: TaxBandBreakdown[];

  /** Comparison table: current vs optimized */
  comparison: TaxComparison[];
}

/**
 * Default input values
 */
export function getDefaultInputs(): UK100kInputs {
  return {
    grossSalary: 110000,
    taxRegion: 'england',
    studentLoanPlan: 'none',
    currentPensionPercent: 5,
    bonusIncome: 0,
  };
}

/**
 * Tax region labels for UI
 */
export const TAX_REGION_LABELS: Record<TaxRegion, string> = {
  england: 'England, Wales & NI',
  scotland: 'Scotland',
};

/**
 * Student loan plan labels for UI
 */
export const STUDENT_LOAN_LABELS: Record<StudentLoanPlan, string> = {
  none: 'No Student Loan',
  plan1: 'Plan 1 (pre-2012)',
  plan2: 'Plan 2 (post-2012)',
  plan4: 'Plan 4 (Scotland)',
  plan5: 'Plan 5 (post-2023)',
  postgrad: 'Postgraduate Loan',
};
