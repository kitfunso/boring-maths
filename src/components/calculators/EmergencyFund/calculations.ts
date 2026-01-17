/**
 * Emergency Fund Calculator - Calculation Logic
 *
 * Pure functions for calculating emergency fund recommendations.
 */

import type {
  EmergencyFundInputs,
  EmergencyFundResult,
  JobStability,
  RiskTolerance,
} from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Base months by job stability
 */
const STABILITY_MONTHS: Record<JobStability, number> = {
  stable: 3,
  moderate: 6,
  unstable: 9,
};

/**
 * Risk tolerance adjustments
 */
const RISK_ADJUSTMENT: Record<RiskTolerance, number> = {
  aggressive: -1,
  moderate: 0,
  conservative: 2,
};

/**
 * Calculate recommended emergency fund
 */
export function calculateEmergencyFund(inputs: EmergencyFundInputs): EmergencyFundResult {
  const {
    currency,
    monthlyExpenses,
    jobStability,
    dependents,
    currentSavings,
    riskTolerance,
    monthlySavingsCapacity,
  } = inputs;

  // Calculate recommended months
  let recommendedMonths = STABILITY_MONTHS[jobStability];

  // Adjust for dependents (add 1 month per dependent, max 3)
  recommendedMonths += Math.min(dependents, 3);

  // Adjust for risk tolerance
  recommendedMonths += RISK_ADJUSTMENT[riskTolerance];

  // Ensure minimum of 3 months, maximum of 12
  recommendedMonths = Math.max(3, Math.min(12, recommendedMonths));

  // Calculate target and progress
  const targetAmount = monthlyExpenses * recommendedMonths;
  const amountNeeded = Math.max(0, targetAmount - currentSavings);
  const percentComplete =
    targetAmount > 0 ? Math.min(100, (currentSavings / targetAmount) * 100) : 0;

  // Calculate time to goal
  const monthsToGoal =
    monthlySavingsCapacity > 0 && amountNeeded > 0
      ? Math.ceil(amountNeeded / monthlySavingsCapacity)
      : 0;

  // Calculate breakdown tiers
  const breakdown = {
    minimum: monthlyExpenses * 3,
    comfortable: monthlyExpenses * 6,
    secure: monthlyExpenses * 9,
    fortress: monthlyExpenses * 12,
  };

  return {
    currency,
    recommendedMonths,
    targetAmount: Math.round(targetAmount),
    amountNeeded: Math.round(amountNeeded),
    percentComplete: Math.round(percentComplete * 10) / 10,
    monthsToGoal,
    breakdown: {
      minimum: Math.round(breakdown.minimum),
      comfortable: Math.round(breakdown.comfortable),
      secure: Math.round(breakdown.secure),
      fortress: Math.round(breakdown.fortress),
    },
  };
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
