/**
 * Pricing Calculator - Type Definitions
 *
 * Calculate optimal product pricing using cost-plus
 * and value-based pricing strategies.
 */

import type { Currency } from '../../../lib/regions';

export type PricingStrategy = 'cost_plus' | 'value_based' | 'competitive';

export interface PricingInputs {
  currency: Currency;

  /** Direct product cost (materials, manufacturing) */
  productCost: number;

  /** Overhead allocation per unit (rent, utilities, salaries divided by units) */
  overheadPerUnit: number;

  /** Desired profit margin (as decimal, e.g., 0.30 = 30%) */
  desiredMargin: number;

  /** Average competitor price for similar product */
  competitorPrice: number;

  /** Perceived value to customer (what they'd pay) */
  perceivedValue: number;

  /** Expected monthly unit sales at calculated price */
  expectedUnitSales: number;

  /** Monthly fixed costs (for break-even analysis) */
  monthlyFixedCosts: number;

  /** Pricing strategy to emphasize */
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

  /** Recommended price based on selected strategy */
  recommendedPrice: number;

  /** Margin at recommended price */
  recommendedMargin: number;
  recommendedMarginPercent: number;

  /** All pricing strategies analyzed */
  strategies: {
    costPlus: PricingAnalysis;
    valueBased: PricingAnalysis;
    competitive: PricingAnalysis;
  };

  /** Break-even analysis */
  breakEvenUnits: number;
  breakEvenRevenue: number;

  /** Profitability projections */
  monthlyRevenue: number;
  monthlyProfit: number;
  annualProfit: number;

  /** Volume needed for profitability */
  unitsForTargetProfit: number;

  /** Price elasticity suggestions */
  priceRange: {
    floor: number; // Minimum viable price (covers costs)
    target: number; // Optimal price
    ceiling: number; // Maximum before demand drops
  };

  /** Insights */
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
