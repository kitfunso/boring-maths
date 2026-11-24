import type { SideHustleInputs, SideHustleResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function calculateSideHustle(inputs: SideHustleInputs): SideHustleResult {
  const {
    currency,
    monthlyRevenue,
    monthlyExpenses,
    hoursPerWeek,
    mainJobHourlyRate,
    taxRate,
    marketingSpend,
    toolsCost,
    otherCosts,
  } = inputs;

  const totalExpenses = monthlyExpenses + marketingSpend + toolsCost + otherCosts;

  const monthlyGrossProfit = monthlyRevenue - totalExpenses;
  const monthlyNetProfit = monthlyGrossProfit * (1 - taxRate);

  const annualNetProfit = monthlyNetProfit * 12;

  const hoursPerMonth = hoursPerWeek * 4.33;
  const effectiveHourlyRate = hoursPerMonth > 0 ? monthlyNetProfit / hoursPerMonth : 0;

  const opportunityCost = mainJobHourlyRate * hoursPerMonth;

  const netVsMainJob = monthlyNetProfit - opportunityCost;

  const isProfitable = monthlyNetProfit > 0;
  const beatsMainJob = effectiveHourlyRate > mainJobHourlyRate;

  const profitMargin = monthlyRevenue > 0 ? (monthlyGrossProfit / monthlyRevenue) * 100 : 0;

  const breakEvenRevenue = totalExpenses / (1 - taxRate);

  return {
    currency,
    monthlyGrossProfit: round(monthlyGrossProfit),
    monthlyNetProfit: round(monthlyNetProfit),
    annualNetProfit: round(annualNetProfit),
    hoursPerMonth: round(hoursPerMonth, 1),
    effectiveHourlyRate: round(effectiveHourlyRate),
    opportunityCost: round(opportunityCost),
    netVsMainJob: round(netVsMainJob),
    isProfitable,
    beatsMainJob,
    profitMargin: round(profitMargin, 1),
    breakEvenRevenue: round(breakEvenRevenue),
    totalExpenses: round(totalExpenses),
  };
}

export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
