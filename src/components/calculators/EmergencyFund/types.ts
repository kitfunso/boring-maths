import type { Currency } from '../../../lib/regions';

export type JobStability = 'stable' | 'moderate' | 'unstable';
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export interface EmergencyFundInputs {
  currency: Currency;

  monthlyExpenses: number;

  jobStability: JobStability;

  dependents: number;

  currentSavings: number;

  riskTolerance: RiskTolerance;

  monthlySavingsCapacity: number;
}

export interface EmergencyFundResult {
  currency: Currency;

  recommendedMonths: number;

  targetAmount: number;

  amountNeeded: number;

  percentComplete: number;

  monthsToGoal: number;

  breakdown: {
    minimum: number;
    comfortable: number;
    secure: number;
    fortress: number;
  };
}

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

export const DEFAULT_INPUTS: EmergencyFundInputs = getDefaultInputs('USD');
