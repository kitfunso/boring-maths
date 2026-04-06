/**
 * Tipping Guide Calculator - Calculation Logic
 *
 * Pure functions for looking up country/service tipping norms
 * and computing tip amounts.
 */

import type { TippingGuideInputs, TippingGuideResult } from './types';
import { TIPPING_DATA } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Round to 2 decimal places.
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Round a total up to the nearest "nice" number for easy payment.
 * Rounds up to the nearest whole unit of currency.
 */
function roundUpNicely(value: number): number {
  return Math.ceil(value);
}

/**
 * Look up tipping data for a country + service and compute amounts.
 */
export function calculateTippingGuide(inputs: TippingGuideInputs): TippingGuideResult {
  const { country, serviceType, billAmount, currency } = inputs;

  const profile = TIPPING_DATA[country];
  const norm = profile.services[serviceType];

  const tipAmount = billAmount * norm.suggestedPercent;
  const totalWithTip = billAmount + tipAmount;
  const roundedTotal = roundUpNicely(totalWithTip);

  return {
    suggestedTipPercent: norm.suggestedPercent,
    tipAmount: round(tipAmount),
    totalWithTip: round(totalWithTip),
    culturalNote: norm.culturalNote,
    isServiceIncluded: norm.serviceIncluded,
    roundedTotal,
    currency,
  };
}

/**
 * Format a number as currency.
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 2
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
