/**
 * Margin Calculator - Type Definitions
 *
 * Calculate profit margin, markup, and gross profit from cost and revenue.
 */

import type { Currency } from '../../../lib/regions';

/**
 * Input modes for the Margin Calculator
 */
export type MarginInputMode = 'cost-revenue' | 'cost-margin' | 'revenue-margin';

/**
 * Input values for the Margin Calculator
 */
export interface MarginCalculatorInputs {
  /** Selected currency */
  currency: Currency;

  /** Input mode */
  mode: MarginInputMode;

  /** Cost price */
  cost: number;

  /** Revenue (selling price) */
  revenue: number;

  /** Margin percentage (0-100) */
  marginPercent: number;
}

/**
 * Calculated results from the Margin Calculator
 */
export interface MarginCalculatorResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Cost price */
  cost: number;

  /** Revenue (selling price) */
  revenue: number;

  /** Gross profit amount (revenue - cost) */
  grossProfit: number;

  /** Profit margin percentage (profit / revenue * 100) */
  marginPercent: number;

  /** Markup percentage (profit / cost * 100) */
  markupPercent: number;
}

/**
 * A row in the margin vs markup reference table
 */
export interface MarginMarkupRow {
  marginPercent: number;
  markupPercent: number;
}

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): MarginCalculatorInputs {
  return {
    currency,
    mode: 'cost-revenue',
    cost: currency === 'GBP' ? 60 : currency === 'EUR' ? 70 : 60,
    revenue: currency === 'GBP' ? 100 : currency === 'EUR' ? 120 : 100,
    marginPercent: 40,
  };
}

/**
 * Default input values (US)
 */
export const DEFAULT_INPUTS: MarginCalculatorInputs = getDefaultInputs('USD');
