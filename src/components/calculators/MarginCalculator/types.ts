import type { Currency } from '../../../lib/regions';

export type MarginInputMode = 'cost-revenue' | 'cost-margin' | 'revenue-margin';

export interface MarginCalculatorInputs {
  currency: Currency;

  mode: MarginInputMode;

  cost: number;

  revenue: number;

  marginPercent: number;
}

export interface MarginCalculatorResult {
  currency: Currency;

  cost: number;

  revenue: number;

  grossProfit: number;

  marginPercent: number;

  markupPercent: number;
}

export interface MarginMarkupRow {
  marginPercent: number;
  markupPercent: number;
}

export function getDefaultInputs(currency: Currency = 'USD'): MarginCalculatorInputs {
  return {
    currency,
    mode: 'cost-revenue',
    cost: currency === 'GBP' ? 60 : currency === 'EUR' ? 70 : 60,
    revenue: currency === 'GBP' ? 100 : currency === 'EUR' ? 120 : 100,
    marginPercent: 40,
  };
}

export const DEFAULT_INPUTS: MarginCalculatorInputs = getDefaultInputs('USD');
