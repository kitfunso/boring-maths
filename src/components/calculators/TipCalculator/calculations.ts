/**
 * Tip Calculator - Calculation Logic
 *
 * Pure functions for calculating tips and bill splits.
 */

import type { TipCalculatorInputs, TipCalculatorResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/** Common tip percentages for suggestions */
const COMMON_TIP_PERCENTAGES = [0.15, 0.18, 0.20, 0.25];

/**
 * Round to 2 decimal places
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate tip and split amounts
 */
export function calculateTip(inputs: TipCalculatorInputs): TipCalculatorResult {
  const { currency, billAmount, tipPercentage, splitCount } = inputs;

  // Calculate base amounts
  const tipAmount = billAmount * tipPercentage;
  const totalAmount = billAmount + tipAmount;

  // Calculate per-person amounts
  const effectiveSplit = Math.max(1, splitCount);
  const perPersonTotal = totalAmount / effectiveSplit;
  const perPersonTip = tipAmount / effectiveSplit;
  const perPersonBill = billAmount / effectiveSplit;

  // Generate suggestions for common tip percentages
  const suggestions = COMMON_TIP_PERCENTAGES.map((pct) => {
    const tip = billAmount * pct;
    const total = billAmount + tip;
    return {
      percentage: pct,
      tipAmount: round(tip),
      totalAmount: round(total),
      perPerson: round(total / effectiveSplit),
    };
  });

  return {
    currency,
    tipAmount: round(tipAmount),
    totalAmount: round(totalAmount),
    perPersonTotal: round(perPersonTotal),
    perPersonTip: round(perPersonTip),
    perPersonBill: round(perPersonBill),
    suggestions,
  };
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 2
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
