/**
 * Break-Even Calculator - Type Definitions
 *
 * Calculator to determine break-even point for a business.
 */

import type { Currency } from '../../../lib/regions';

/**
 * Input values for the Break-Even Calculator
 */
export interface BreakEvenInputs {
  /** Selected currency */
  currency: Currency;

  /** Fixed costs per month (rent, salaries, insurance, etc.) */
  fixedCosts: number;

  /** Variable cost per unit (materials, shipping, etc.) */
  variableCostPerUnit: number;

  /** Selling price per unit */
  pricePerUnit: number;

  /** Target profit (optional) */
  targetProfit: number;
}

/**
 * Calculated results from the Break-Even Calculator
 */
export interface BreakEvenResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Break-even point in units */
  breakEvenUnits: number;

  /** Break-even point in revenue */
  breakEvenRevenue: number;

  /** Contribution margin per unit */
  contributionMargin: number;

  /** Contribution margin ratio (percentage) */
  contributionMarginRatio: number;

  /** Units needed to hit target profit */
  unitsForTargetProfit: number;

  /** Revenue needed for target profit */
  revenueForTargetProfit: number;

  /** Profit at various sales levels */
  profitAnalysis: {
    units: number;
    revenue: number;
    totalCosts: number;
    profit: number;
    profitMargin: number;
  }[];
}

/**
 * Get default input values for a given currency
 */
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

/**
 * Default input values
 */
export const DEFAULT_INPUTS: BreakEvenInputs = getDefaultInputs('USD');
