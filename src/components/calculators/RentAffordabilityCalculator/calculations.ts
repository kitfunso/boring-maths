/**
 * Rent Affordability Calculator - Calculation Logic
 *
 * Three budgeting frameworks:
 * 1. 30% Rule: Spend no more than 30% of gross income on rent.
 * 2. 50/30/20 Rule: 50% needs, 30% wants, 20% savings. Rent fits in "needs" alongside debts/utilities.
 * 3. 28/36 DTI Rule: Housing costs <= 28% of gross income; total debt <= 36% of gross income.
 *
 * Recommendation uses the most conservative (lowest) max rent across all three rules.
 */

import type { RentAffordabilityInputs, RentAffordabilityResult, RuleResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/** Rough tax multiplier to convert gross to net. */
const GROSS_TO_NET: Record<Currency, number> = {
  USD: 0.72,
  GBP: 0.75,
  EUR: 0.7,
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function estimateNetFromGross(gross: number, currency: Currency): number {
  return round2(gross * GROSS_TO_NET[currency]);
}

export function calculateRentAffordability(inputs: RentAffordabilityInputs): RentAffordabilityResult {
  const {
    monthlyIncome,
    incomeType,
    existingDebts,
    savingsGoalPercent,
    includeUtilities,
    estimatedUtilities,
    currency,
  } = inputs;

  const grossIncome =
    incomeType === 'gross' ? monthlyIncome : round2(monthlyIncome / GROSS_TO_NET[currency]);
  const netIncome =
    incomeType === 'net' ? monthlyIncome : estimateNetFromGross(monthlyIncome, currency);

  const utilityCost = includeUtilities ? estimatedUtilities : 0;

  // -------------------------------------------------------------------------
  // Rule 1: 30% Rule (based on gross income)
  // -------------------------------------------------------------------------
  const thirtyPercentMax = round2(grossIncome * 0.3 - utilityCost);
  const maxRent30: RuleResult = {
    maxRent: Math.max(0, thirtyPercentMax),
    isAffordable: thirtyPercentMax > 0,
    label: '30% Rule',
    description: 'Spend no more than 30% of gross income on rent.',
  };

  // -------------------------------------------------------------------------
  // Rule 2: 50/30/20 Rule (based on net income)
  // -------------------------------------------------------------------------
  const needsBudget = round2(netIncome * 0.5);
  const wantsBudget = round2(netIncome * 0.3);
  const savingsBudget = round2(netIncome * 0.2);

  // Rent comes out of needs, alongside debts and utilities.
  const fiftyThirtyTwentyMax = round2(needsBudget - existingDebts - utilityCost);
  const maxRent5030: RuleResult = {
    maxRent: Math.max(0, fiftyThirtyTwentyMax),
    isAffordable: fiftyThirtyTwentyMax > 0,
    label: '50/30/20 Rule',
    description: '50% needs, 30% wants, 20% savings. Rent + debts + utilities fit in needs.',
  };

  // -------------------------------------------------------------------------
  // Rule 3: 28/36 DTI Rule (based on gross income)
  // -------------------------------------------------------------------------
  const housingMax28 = round2(grossIncome * 0.28 - utilityCost);
  const totalDebtMax36 = round2(grossIncome * 0.36 - existingDebts - utilityCost);
  const dtiMax = round2(Math.min(housingMax28, totalDebtMax36));
  const maxRent2836: RuleResult = {
    maxRent: Math.max(0, dtiMax),
    isAffordable: dtiMax > 0,
    label: '28/36 DTI Rule',
    description: 'Housing <= 28% gross income; total debt (housing + other) <= 36% gross income.',
  };

  // -------------------------------------------------------------------------
  // Recommendation: most conservative
  // -------------------------------------------------------------------------
  const recommendedMax = Math.max(
    0,
    Math.min(maxRent30.maxRent, maxRent5030.maxRent, maxRent2836.maxRent)
  );

  // -------------------------------------------------------------------------
  // Post-rent breakdown (using net income and recommended max)
  // -------------------------------------------------------------------------
  const totalHousing = recommendedMax + utilityCost;
  const remainingAfterRent = round2(netIncome - totalHousing - existingDebts);
  const savingsTarget = round2(netIncome * (savingsGoalPercent / 100));
  const savingsAfterRent = round2(Math.max(0, remainingAfterRent - savingsTarget));

  const effectiveIncome = netIncome;

  return {
    maxRent30Percent: maxRent30,
    maxRent50_30_20: maxRent5030,
    maxRent28_36: maxRent2836,
    recommendedMax,
    remainingAfterRent,
    savingsAfterRent,
    budgetBreakdown: {
      needs: needsBudget,
      wants: wantsBudget,
      savings: savingsBudget,
    },
    effectiveIncome,
  };
}

export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  return formatCurrencyByRegion(value, currency, 0);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
