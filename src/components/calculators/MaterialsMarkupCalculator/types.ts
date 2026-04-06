/**
 * Materials Markup Calculator - Type Definitions
 */

import type { Currency } from '../../../lib/regions';

export type CalculationMode = 'markupToSell' | 'sellToMarkup' | 'marginToSell';

export interface MaterialsMarkupInputs {
  currency: Currency;
  mode: CalculationMode;
  costPrice: number;
  markupPercent: number;
  sellingPrice: number;
  marginPercent: number;
  quantity: number;
}

export interface MaterialsMarkupResult {
  sellingPrice: number;
  markupPercent: number;
  marginPercent: number;
  profitPerUnit: number;
  totalProfit: number;
  markupVsMarginExplanation: string;
}

export interface TradeMarkup {
  readonly trade: string;
  readonly typicalMarkup: number;
  readonly range: readonly [number, number];
}

/**
 * Typical markups by trade for reference.
 * Source: industry norms for materials resale.
 */
export const TRADE_MARKUPS: readonly TradeMarkup[] = [
  { trade: 'Plumbing', typicalMarkup: 30, range: [20, 50] },
  { trade: 'Electrical', typicalMarkup: 25, range: [15, 40] },
  { trade: 'HVAC', typicalMarkup: 35, range: [25, 50] },
  { trade: 'Carpentry', typicalMarkup: 20, range: [15, 35] },
  { trade: 'Painting', typicalMarkup: 25, range: [15, 40] },
  { trade: 'Roofing', typicalMarkup: 30, range: [20, 45] },
  { trade: 'Landscaping', typicalMarkup: 40, range: [25, 60] },
  { trade: 'General Contractor', typicalMarkup: 20, range: [10, 30] },
];

export const CALCULATION_MODES: {
  value: CalculationMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'markupToSell',
    label: 'Markup to Selling Price',
    description: 'Know cost and markup %, find selling price',
  },
  {
    value: 'sellToMarkup',
    label: 'Find Markup %',
    description: 'Know cost and selling price, find markup',
  },
  {
    value: 'marginToSell',
    label: 'Margin to Selling Price',
    description: 'Know cost and margin %, find selling price',
  },
];

export function getDefaultInputs(currency: Currency = 'USD'): MaterialsMarkupInputs {
  const costs: Record<Currency, number> = {
    USD: 100,
    GBP: 80,
    EUR: 90,
  };

  return {
    currency,
    mode: 'markupToSell',
    costPrice: costs[currency],
    markupPercent: 30,
    sellingPrice: 130,
    marginPercent: 33.33,
    quantity: 1,
  };
}
