/**
 * Rent Affordability Calculator - Type Definitions
 */

import type { Currency } from '../../../lib/regions';

export type IncomeType = 'gross' | 'net';

export interface RentAffordabilityInputs {
  currency: Currency;
  monthlyIncome: number;
  incomeType: IncomeType;
  existingDebts: number;
  savingsGoalPercent: number;
  includeUtilities: boolean;
  estimatedUtilities: number;
}

export interface RuleResult {
  maxRent: number;
  isAffordable: boolean;
  label: string;
  description: string;
}

export interface BudgetBreakdown {
  needs: number;
  wants: number;
  savings: number;
}

export interface RentAffordabilityResult {
  maxRent30Percent: RuleResult;
  maxRent50_30_20: RuleResult;
  maxRent28_36: RuleResult;
  recommendedMax: number;
  remainingAfterRent: number;
  savingsAfterRent: number;
  budgetBreakdown: BudgetBreakdown;
  effectiveIncome: number;
}

export const INCOME_TYPE_OPTIONS: { value: IncomeType; label: string }[] = [
  { value: 'gross', label: 'Gross (before tax)' },
  { value: 'net', label: 'Net (after tax)' },
];

export function getDefaultInputs(currency: Currency = 'USD'): RentAffordabilityInputs {
  const incomes: Record<Currency, number> = {
    USD: 5000,
    GBP: 3500,
    EUR: 4000,
  };

  const utilities: Record<Currency, number> = {
    USD: 200,
    GBP: 150,
    EUR: 180,
  };

  return {
    currency,
    monthlyIncome: incomes[currency],
    incomeType: 'gross',
    existingDebts: 0,
    savingsGoalPercent: 20,
    includeUtilities: false,
    estimatedUtilities: utilities[currency],
  };
}
