import type { Currency } from '../../../lib/regions';

export type PricingStrategy = 'cost_plus' | 'value_based' | 'competitive';

export interface PricingInputs {
  currency: Currency;

  productCost: number;

  overheadPerUnit: number;

  desiredMargin: number;

  competitorPrice: number;

  perceivedValue: number;

  expectedUnitSales: number;

  monthlyFixedCosts: number;

  strategy: PricingStrategy;
}

export interface PricingAnalysis {
  strategy: string;
  price: number;
  margin: number;
  marginPercent: number;
  monthlyProfit: number;
  pros: string[];
  cons: string[];
}

export interface PricingResult {
  currency: Currency;

  recommendedPrice: number;

  recommendedMargin: number;
  recommendedMarginPercent: number;

  strategies: {
    costPlus: PricingAnalysis;
    valueBased: PricingAnalysis;
    competitive: PricingAnalysis;
  };

  breakEvenUnits: number;
  breakEvenRevenue: number;

  monthlyRevenue: number;
  monthlyProfit: number;
  annualProfit: number;

  unitsForTargetProfit: number;

  priceRange: {
    floor: number;
    target: number;
    ceiling: number;
  };

  insights: string[];
}

export function getDefaultInputs(currency: Currency = 'USD'): PricingInputs {
  const multiplier = currency === 'GBP' ? 0.8 : currency === 'EUR' ? 0.9 : 1;

  return {
    currency,
    productCost: Math.round(25 * multiplier),
    overheadPerUnit: Math.round(10 * multiplier),
    desiredMargin: 0.4,
    competitorPrice: Math.round(75 * multiplier),
    perceivedValue: Math.round(100 * multiplier),
    expectedUnitSales: 100,
    monthlyFixedCosts: Math.round(5000 * multiplier),
    strategy: 'cost_plus',
  };
}

export const DEFAULT_INPUTS: PricingInputs = getDefaultInputs('USD');

export const STRATEGY_OPTIONS = [
  { value: 'cost_plus', label: 'Cost-Plus' },
  { value: 'value_based', label: 'Value-Based' },
  { value: 'competitive', label: 'Competitive' },
];
