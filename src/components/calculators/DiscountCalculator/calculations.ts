/**
 * Discount Calculator - Calculation Logic
 */

import type { DiscountInputs, DiscountResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Calculate discount based on mode
 */
export function calculateDiscount(inputs: DiscountInputs): DiscountResult {
  const { mode, originalPrice, discountPercent, finalPrice, savedAmount } = inputs;

  let result: DiscountResult;

  switch (mode) {
    case 'percentOff': {
      // Given: original price and discount %
      // Find: final price and savings
      const discount = (originalPrice * discountPercent) / 100;
      const final = originalPrice - discount;
      result = {
        originalPrice,
        discountPercent,
        discountAmount: Math.round(discount * 100) / 100,
        finalPrice: Math.round(final * 100) / 100,
      };
      break;
    }

    case 'finalPrice': {
      // Given: original price and final price
      // Find: discount % and savings
      const discount = originalPrice - finalPrice;
      const percent = originalPrice > 0 ? (discount / originalPrice) * 100 : 0;
      result = {
        originalPrice,
        discountPercent: Math.round(percent * 10) / 10,
        discountAmount: Math.round(discount * 100) / 100,
        finalPrice: Math.round(finalPrice * 100) / 100,
      };
      break;
    }

    case 'savedAmount': {
      // Given: original price and amount saved
      // Find: discount % and final price
      const percent = originalPrice > 0 ? (savedAmount / originalPrice) * 100 : 0;
      const final = originalPrice - savedAmount;
      result = {
        originalPrice,
        discountPercent: Math.round(percent * 10) / 10,
        discountAmount: Math.round(savedAmount * 100) / 100,
        finalPrice: Math.round(final * 100) / 100,
      };
      break;
    }

    default:
      result = {
        originalPrice: 0,
        discountPercent: 0,
        discountAmount: 0,
        finalPrice: 0,
      };
  }

  return result;
}

/**
 * Calculate multiple discount scenarios for comparison
 */
export function calculateDiscountScenarios(
  originalPrice: number,
  discounts: number[]
): { percent: number; savings: number; final: number }[] {
  return discounts.map((percent) => ({
    percent,
    savings: Math.round(((originalPrice * percent) / 100) * 100) / 100,
    final: Math.round(originalPrice * (1 - percent / 100) * 100) / 100,
  }));
}

export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  return formatCurrencyByRegion(value, currency, 2);
}

export function formatPercent(value: number): string {
  return `${value}%`;
}
