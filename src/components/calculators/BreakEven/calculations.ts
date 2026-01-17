/**
 * Break-Even Calculator - Calculation Logic
 *
 * Pure functions for calculating break-even points.
 */

import type { BreakEvenInputs, BreakEvenResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Calculate break-even point
 */
export function calculateBreakEven(inputs: BreakEvenInputs): BreakEvenResult {
  const { currency, fixedCosts, variableCostPerUnit, pricePerUnit, targetProfit } = inputs;

  // Contribution margin = Price - Variable Cost
  const contributionMargin = pricePerUnit - variableCostPerUnit;

  // Contribution margin ratio = Contribution Margin / Price
  const contributionMarginRatio = pricePerUnit > 0 ? contributionMargin / pricePerUnit : 0;

  // Break-even units = Fixed Costs / Contribution Margin
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;

  // Break-even revenue = Break-even Units * Price
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;

  // Units for target profit = (Fixed Costs + Target Profit) / Contribution Margin
  const unitsForTargetProfit =
    contributionMargin > 0 ? Math.ceil((fixedCosts + targetProfit) / contributionMargin) : 0;

  // Revenue for target profit
  const revenueForTargetProfit = unitsForTargetProfit * pricePerUnit;

  // Generate profit analysis at various sales levels
  const profitAnalysis: BreakEvenResult['profitAnalysis'] = [];
  const analysisPoints = [0, 0.5, 0.75, 1, 1.25, 1.5, 2].map((mult) =>
    Math.round(breakEvenUnits * mult)
  );

  for (const units of analysisPoints) {
    const revenue = units * pricePerUnit;
    const totalCosts = fixedCosts + units * variableCostPerUnit;
    const profit = revenue - totalCosts;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    profitAnalysis.push({
      units,
      revenue: Math.round(revenue),
      totalCosts: Math.round(totalCosts),
      profit: Math.round(profit),
      profitMargin: Math.round(profitMargin * 10) / 10,
    });
  }

  return {
    currency,
    breakEvenUnits,
    breakEvenRevenue: Math.round(breakEvenRevenue),
    contributionMargin: Math.round(contributionMargin * 100) / 100,
    contributionMarginRatio: Math.round(contributionMarginRatio * 1000) / 10,
    unitsForTargetProfit,
    revenueForTargetProfit: Math.round(revenueForTargetProfit),
    profitAnalysis,
  };
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
