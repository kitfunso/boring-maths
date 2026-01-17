/**
 * Side Hustle Profitability Calculator - Calculation Logic
 *
 * Pure functions for analyzing side hustle profitability.
 */

import type { SideHustleInputs, SideHustleResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Round a number to specified decimal places
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate side hustle profitability
 *
 * @param inputs - Calculator input values
 * @returns Profitability analysis
 */
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

  // Calculate total expenses
  const totalExpenses = monthlyExpenses + marketingSpend + toolsCost + otherCosts;

  // Calculate monthly profits
  const monthlyGrossProfit = monthlyRevenue - totalExpenses;
  const monthlyNetProfit = monthlyGrossProfit * (1 - taxRate);

  // Annual projections
  const annualNetProfit = monthlyNetProfit * 12;

  // Hours calculations
  const hoursPerMonth = hoursPerWeek * 4.33; // Average weeks per month

  // Effective hourly rate
  const effectiveHourlyRate = hoursPerMonth > 0 ? monthlyNetProfit / hoursPerMonth : 0;

  // Opportunity cost (what you'd earn at main job)
  const opportunityCost = mainJobHourlyRate * hoursPerMonth;

  // Net gain/loss vs main job
  const netVsMainJob = monthlyNetProfit - opportunityCost;

  // Profitability flags
  const isProfitable = monthlyNetProfit > 0;
  const beatsMainJob = effectiveHourlyRate > mainJobHourlyRate;

  // Profit margin
  const profitMargin = monthlyRevenue > 0 ? (monthlyGrossProfit / monthlyRevenue) * 100 : 0;

  // Break-even revenue (revenue needed to cover expenses with same tax rate)
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
