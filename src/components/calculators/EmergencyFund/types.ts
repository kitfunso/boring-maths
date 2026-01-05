/**
 * Emergency Fund Calculator - Type Definitions
 *
 * Calculator to determine how much emergency fund you need.
 */

import type { Currency } from '../../../lib/regions';

export type JobStability = 'stable' | 'moderate' | 'unstable';
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

/**
 * Input values for the Emergency Fund Calculator
 */
export interface EmergencyFundInputs {
  /** Selected currency */
  currency: Currency;

  /** Monthly essential expenses */
  monthlyExpenses: number;

  /** Job stability level */
  jobStability: JobStability;

  /** Number of dependents */
  dependents: number;

  /** Current emergency savings */
  currentSavings: number;

  /** Risk tolerance */
  riskTolerance: RiskTolerance;

  /** Monthly amount you can save */
  monthlySavingsCapacity: number;
}

/**
 * Calculated results from the Emergency Fund Calculator
 */
export interface EmergencyFundResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Recommended months of expenses to save */
  recommendedMonths: number;

  /** Target emergency fund amount */
  targetAmount: number;

  /** Amount still needed */
  amountNeeded: number;

  /** Percentage of goal achieved */
  percentComplete: number;

  /** Months to reach goal at current savings rate */
  monthsToGoal: number;

  /** Breakdown by expense category */
  breakdown: {
    minimum: number; // 3 months
    comfortable: number; // 6 months
    secure: number; // 9 months
    fortress: number; // 12 months
  };
}

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): EmergencyFundInputs {
  const expenses = currency === 'GBP' ? 2500 : currency === 'EUR' ? 2800 : 3500;
  const savings = currency === 'GBP' ? 5000 : currency === 'EUR' ? 6000 : 8000;

  return {
    currency,
    monthlyExpenses: expenses,
    jobStability: 'moderate',
    dependents: 0,
    currentSavings: savings,
    riskTolerance: 'moderate',
    monthlySavingsCapacity: Math.round(expenses * 0.15),
  };
}

/**
 * Default input values (US)
 */
export const DEFAULT_INPUTS: EmergencyFundInputs = getDefaultInputs('USD');
