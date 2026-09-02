/** Savings Goal Calculator: monthly contribution needed to reach a target, with compound interest and inflation adjustment, for USD/GBP/EUR. */

import type { Currency } from '../../../lib/regions';

export interface SavingsGoalInputs {
  currency: Currency;

  goalAmount: number;

  currentSavings: number;

  timelineYears: number;

  /** Expected annual return rate as decimal (0.07 = 7%) */
  annualReturn: number;

  /** Expected annual inflation rate as decimal (0.03 = 3%) */
  inflationRate: number;

  contributionFrequency: 'monthly' | 'biweekly' | 'weekly';
}

export interface SavingsGoalResult {
  currency: Currency;

  contributionAmount: number;

  contributionFrequency: string;

  totalContributions: number;

  totalInterest: number;

  finalBalance: number;

  /** Inflation-adjusted goal (real value) */
  inflationAdjustedGoal: number;

  /** Real return rate (after inflation) */
  realReturnRate: number;

  projectionData: Array<{
    month: number;
    balance: number;
    contributions: number;
    interest: number;
  }>;
}

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

export const DEFAULT_INPUTS: SavingsGoalInputs = getDefaultInputs('USD');
