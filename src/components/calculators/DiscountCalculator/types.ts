/**
 * Discount Calculator - Type Definitions
 */

import type { Currency } from '../../../lib/regions';

export type CalculationMode = 'percentOff' | 'finalPrice' | 'savedAmount';

export interface DiscountInputs {
  currency: Currency;
  mode: CalculationMode;
  originalPrice: number;
  discountPercent: number;
  finalPrice: number;
  savedAmount: number;
}

export interface DiscountResult {
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  pricePerUnit?: number;
}

export const COMMON_DISCOUNTS = [10, 15, 20, 25, 30, 40, 50, 60, 70, 75];

export const CALCULATION_MODES: { value: CalculationMode; label: string; description: string }[] = [
  { value: 'percentOff', label: 'Percent Off', description: 'Know the discount %, find final price' },
  { value: 'finalPrice', label: 'Find Discount %', description: 'Know the sale price, find the discount' },
  { value: 'savedAmount', label: 'Amount Saved', description: 'Know savings, find the discount %' },
];

export function getDefaultInputs(currency: Currency = 'USD'): DiscountInputs {
  const prices: Record<Currency, number> = {
    USD: 100,
    GBP: 80,
    EUR: 90,
  };

  return {
    currency,
    mode: 'percentOff',
    originalPrice: prices[currency],
    discountPercent: 25,
    finalPrice: 75,
    savedAmount: 25,
  };
}
