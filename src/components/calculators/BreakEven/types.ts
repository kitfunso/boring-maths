import type { Currency } from '../../../lib/regions';

export interface BreakEvenInputs {
  currency: Currency;

  fixedCosts: number;

  variableCostPerUnit: number;

  pricePerUnit: number;

  targetProfit: number;
}

export interface BreakEvenResult {
  currency: Currency;

  breakEvenUnits: number;

  breakEvenRevenue: number;

  contributionMargin: number;

  contributionMarginRatio: number;

  unitsForTargetProfit: number;

  revenueForTargetProfit: number;

  profitAnalysis: {
    units: number;
    revenue: number;
    totalCosts: number;
    profit: number;
    profitMargin: number;
  }[];
}

export function getDefaultInputs(currency: Currency = 'USD'): BreakEvenInputs {
  const multiplier = currency === 'GBP' ? 0.8 : currency === 'EUR' ? 0.9 : 1;

  return {
    currency,
    fixedCosts: Math.round(5000 * multiplier),
    variableCostPerUnit: Math.round(15 * multiplier),
    pricePerUnit: Math.round(30 * multiplier),
    targetProfit: Math.round(2000 * multiplier),
  };
}

export const DEFAULT_INPUTS: BreakEvenInputs = getDefaultInputs('USD');
