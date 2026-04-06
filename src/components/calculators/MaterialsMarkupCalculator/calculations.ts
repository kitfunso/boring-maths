/**
 * Materials Markup Calculator - Calculation Logic
 *
 * Key insight: markup and margin are NOT the same.
 * - Markup is profit as % of COST:   markup% = (profit / cost) * 100
 * - Margin is profit as % of SELLING PRICE: margin% = (profit / sell) * 100
 *
 * 50% markup = 33.3% margin. This is the #1 source of pricing confusion.
 */

import type { MaterialsMarkupInputs, MaterialsMarkupResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Convert markup % to margin %
 * margin = markup / (100 + markup) * 100
 */
export function markupToMargin(markupPercent: number): number {
  if (markupPercent <= -100) return 0;
  return (markupPercent / (100 + markupPercent)) * 100;
}

/**
 * Convert margin % to markup %
 * markup = margin / (100 - margin) * 100
 */
export function marginToMarkup(marginPercent: number): number {
  if (marginPercent >= 100) return Infinity;
  return (marginPercent / (100 - marginPercent)) * 100;
}

/**
 * Calculate selling price from cost and markup %
 * sell = cost * (1 + markup/100)
 */
export function sellingPriceFromMarkup(cost: number, markupPercent: number): number {
  return cost * (1 + markupPercent / 100);
}

/**
 * Calculate selling price from cost and margin %
 * sell = cost / (1 - margin/100)
 */
export function sellingPriceFromMargin(cost: number, marginPercent: number): number {
  if (marginPercent >= 100) return Infinity;
  return cost / (1 - marginPercent / 100);
}

/**
 * Build the explanation string showing the markup vs margin relationship.
 */
function buildExplanation(markupPct: number, marginPct: number): string {
  const mrkRounded = Math.round(markupPct * 10) / 10;
  const mrgRounded = Math.round(marginPct * 10) / 10;
  return `${mrkRounded}% markup = ${mrgRounded}% margin. Markup is based on cost; margin is based on selling price.`;
}

/**
 * Calculate all results based on mode.
 */
export function calculateMaterialsMarkup(inputs: MaterialsMarkupInputs): MaterialsMarkupResult {
  const { mode, costPrice, markupPercent, sellingPrice, marginPercent, quantity } = inputs;
  const qty = Math.max(quantity, 1);

  let sell: number;
  let markup: number;
  let margin: number;

  switch (mode) {
    case 'markupToSell': {
      sell = sellingPriceFromMarkup(costPrice, markupPercent);
      markup = markupPercent;
      margin = markupToMargin(markupPercent);
      break;
    }
    case 'sellToMarkup': {
      sell = sellingPrice;
      markup = costPrice > 0 ? ((sellingPrice - costPrice) / costPrice) * 100 : 0;
      margin = costPrice > 0 && sellingPrice > 0
        ? ((sellingPrice - costPrice) / sellingPrice) * 100
        : 0;
      break;
    }
    case 'marginToSell': {
      sell = sellingPriceFromMargin(costPrice, marginPercent);
      margin = marginPercent;
      markup = marginToMarkup(marginPercent);
      break;
    }
    default:
      sell = 0;
      markup = 0;
      margin = 0;
  }

  const profitPerUnit = Math.round((sell - costPrice) * 100) / 100;
  const totalProfit = Math.round(profitPerUnit * qty * 100) / 100;

  return {
    sellingPrice: Math.round(sell * 100) / 100,
    markupPercent: Math.round(markup * 10) / 10,
    marginPercent: Math.round(margin * 10) / 10,
    profitPerUnit,
    totalProfit,
    markupVsMarginExplanation: buildExplanation(markup, margin),
  };
}

export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  return formatCurrencyByRegion(value, currency, 2);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}
