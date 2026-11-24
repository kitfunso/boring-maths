import type {
  EmergencyFundInputs,
  EmergencyFundResult,
  JobStability,
  RiskTolerance,
} from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

const STABILITY_MONTHS: Record<JobStability, number> = {
  stable: 3,
  moderate: 6,
  unstable: 9,
};

const RISK_ADJUSTMENT: Record<RiskTolerance, number> = {
  aggressive: -1,
  moderate: 0,
  conservative: 2,
};

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

  let recommendedMonths = STABILITY_MONTHS[jobStability];

  recommendedMonths += Math.min(dependents, 3);

  recommendedMonths += RISK_ADJUSTMENT[riskTolerance];

  recommendedMonths = Math.max(3, Math.min(12, recommendedMonths));

  const targetAmount = monthlyExpenses * recommendedMonths;
  const amountNeeded = Math.max(0, targetAmount - currentSavings);
  const percentComplete =
    targetAmount > 0 ? Math.min(100, (currentSavings / targetAmount) * 100) : 0;

  const monthsToGoal =
    monthlySavingsCapacity > 0 && amountNeeded > 0
      ? Math.ceil(amountNeeded / monthlySavingsCapacity)
      : 0;

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

export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
