/**
 * Savings Goal Calculator - Type Definitions
 *
 * Calculates monthly contributions needed to reach a savings goal,
 * accounting for compound interest and inflation.
 */

import type { Currency } from '../../../lib/regions';

/**
 * Input values for the Savings Goal Calculator
 */
export interface SavingsGoalInputs {
  /** Selected currency (USD, GBP, EUR) */
  currency: Currency;

  /** Target savings goal amount */
  goalAmount: number;

  /** Current savings balance */
  currentSavings: number;

  /** Time to reach goal in years */
  timelineYears: number;

  /** Expected annual return rate as decimal (0.07 = 7%) */
  annualReturn: number;

  /** Expected annual inflation rate as decimal (0.03 = 3%) */
  inflationRate: number;

  /** Contribution frequency */
  contributionFrequency: 'monthly' | 'biweekly' | 'weekly';
}

/**
 * Calculated results from the Savings Goal Calculator
 */
export interface SavingsGoalResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Required contribution per period */
  contributionAmount: number;

  /** Contribution frequency label */
  contributionFrequency: string;

  /** Total contributions over the period */
  totalContributions: number;

  /** Total interest earned */
  totalInterest: number;

  /** Final balance at goal date */
  finalBalance: number;

  /** Inflation-adjusted goal (real value) */
  inflationAdjustedGoal: number;

  /** Real return rate (after inflation) */
  realReturnRate: number;

  /** Monthly breakdown for chart */
  projectionData: Array<{
    month: number;
    balance: number;
    contributions: number;
    interest: number;
  }>;
}

/**
 * Get default input values for a given currency/region
 */
export function getDefaultInputs(currency: Currency = 'USD'): SavingsGoalInputs {
  const goalAmounts: Record<Currency, number> = {
    USD: 50000,
    GBP: 40000,
    EUR: 45000,
  };

  return {
    currency,
    goalAmount: goalAmounts[currency],
    currentSavings: 0,
    timelineYears: 5,
    annualReturn: 0.07, // 7% annual return
    inflationRate: 0.03, // 3% inflation
    contributionFrequency: 'monthly',
  };
}

/**
 * Default input values (US)
 */
export const DEFAULT_INPUTS: SavingsGoalInputs = getDefaultInputs('USD');
