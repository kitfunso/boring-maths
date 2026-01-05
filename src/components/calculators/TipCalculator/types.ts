/**
 * Tip Calculator - Type Definitions
 *
 * Simple tip calculator with bill splitting functionality.
 */

import type { Currency } from '../../../lib/regions';

/**
 * Input values for the Tip Calculator
 */
export interface TipCalculatorInputs {
  /** Selected currency */
  currency: Currency;

  /** Bill total before tip */
  billAmount: number;

  /** Tip percentage (0.15 = 15%) */
  tipPercentage: number;

  /** Number of people splitting the bill */
  splitCount: number;

  /** Custom tip amounts per person (optional) */
  useCustomSplit: boolean;
}

/**
 * Calculated results from the Tip Calculator
 */
export interface TipCalculatorResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Tip amount */
  tipAmount: number;

  /** Total bill including tip */
  totalAmount: number;

  /** Amount each person pays (total) */
  perPersonTotal: number;

  /** Tip portion per person */
  perPersonTip: number;

  /** Bill portion per person (before tip) */
  perPersonBill: number;

  /** Common tip suggestions */
  suggestions: {
    percentage: number;
    tipAmount: number;
    totalAmount: number;
    perPerson: number;
  }[];
}

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): TipCalculatorInputs {
  return {
    currency,
    billAmount: currency === 'GBP' ? 50 : currency === 'EUR' ? 60 : 50,
    tipPercentage: 0.18,
    splitCount: 1,
    useCustomSplit: false,
  };
}

/**
 * Default input values (US)
 */
export const DEFAULT_INPUTS: TipCalculatorInputs = getDefaultInputs('USD');
