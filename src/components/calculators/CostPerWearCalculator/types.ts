/**
 * Cost Per Wear Calculator - Type Definitions
 */

import type { Currency } from '../../../lib/regions';

export interface CostPerWearInputs {
  currency: Currency;
  itemName: string;
  purchasePrice: number;
  wearsPerMonth: number;
  expectedLifespanMonths: number;
  careCostPerMonth: number;
  alternativePrice: number;
  alternativeWearsPerMonth: number;
  alternativeLifespanMonths: number;
}

export interface CostPerWearResult {
  costPerWear: number;
  totalWears: number;
  annualCost: number;
  totalLifetimeCost: number;
  alternativeCostPerWear: number;
  alternativeTotalCost: number;
  isBetterValue: boolean;
  savingsVsAlternative: number;
  verdict: string;
}

export function getDefaultInputs(currency: Currency = 'USD'): CostPerWearInputs {
  const prices: Record<Currency, { purchase: number; care: number; alt: number }> = {
    USD: { purchase: 200, care: 10, alt: 50 },
    GBP: { purchase: 160, care: 8, alt: 40 },
    EUR: { purchase: 180, care: 9, alt: 45 },
  };

  const p = prices[currency];

  return {
    currency,
    itemName: 'Jacket',
    purchasePrice: p.purchase,
    wearsPerMonth: 8,
    expectedLifespanMonths: 36,
    careCostPerMonth: p.care,
    alternativePrice: p.alt,
    alternativeWearsPerMonth: 8,
    alternativeLifespanMonths: 12,
  };
}
