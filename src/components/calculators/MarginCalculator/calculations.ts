import type { MarginCalculatorInputs, MarginCalculatorResult, MarginMarkupRow } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateMargin(inputs: MarginCalculatorInputs): MarginCalculatorResult {
  const { currency, mode, cost, revenue, marginPercent } = inputs;

  let calcCost = cost;
  let calcRevenue = revenue;
  let grossProfit: number;
  let calcMargin: number;
  let calcMarkup: number;

  switch (mode) {
    case 'cost-revenue': {
      grossProfit = calcRevenue - calcCost;
      calcMargin = calcRevenue > 0 ? (grossProfit / calcRevenue) * 100 : 0;
      calcMarkup = calcCost > 0 ? (grossProfit / calcCost) * 100 : 0;
      break;
    }
    case 'cost-margin': {
      calcMargin = marginPercent;
      if (marginPercent >= 100) {
        calcRevenue = 0;
        grossProfit = 0;
        calcMarkup = 0;
      } else {
        calcRevenue = calcCost / (1 - marginPercent / 100);
        grossProfit = calcRevenue - calcCost;
        calcMarkup = calcCost > 0 ? (grossProfit / calcCost) * 100 : 0;
      }
      break;
    }
    case 'revenue-margin': {
      calcMargin = marginPercent;
      calcRevenue = revenue;
      grossProfit = calcRevenue * (marginPercent / 100);
      calcCost = calcRevenue - grossProfit;
      calcMarkup = calcCost > 0 ? (grossProfit / calcCost) * 100 : 0;
      break;
    }
  }

  return {
    currency,
    cost: round(calcCost),
    revenue: round(calcRevenue),
    grossProfit: round(grossProfit),
    marginPercent: round(calcMargin),
    markupPercent: round(calcMarkup),
  };
}

export function getMarginMarkupTable(): MarginMarkupRow[] {
  const margins = [10, 15, 20, 25, 30, 33.3, 40, 50, 60, 75];
  return margins.map((m) => ({
    marginPercent: m,
    markupPercent: round((m / (100 - m)) * 100),
  }));
}

export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 2
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
