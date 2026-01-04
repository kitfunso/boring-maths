/**
 * Side Hustle Profitability Calculator - Type Definitions
 *
 * Determines if a side hustle is truly profitable by calculating
 * effective hourly rate, net profit, and opportunity cost.
 */

import type { Currency } from '../../../lib/regions';
import { getRegionDefaults } from '../../../lib/regions';

/**
 * Input values for the Side Hustle Profitability Calculator
 */
export interface SideHustleInputs {
  /** Selected currency (USD, GBP, EUR) */
  currency: Currency;

  /** Monthly revenue from the side hustle */
  monthlyRevenue: number;

  /** Monthly expenses (materials, tools, subscriptions, etc.) */
  monthlyExpenses: number;

  /** Hours spent per week on the side hustle */
  hoursPerWeek: number;

  /** Current hourly rate at main job (opportunity cost) */
  mainJobHourlyRate: number;

  /** Estimated tax rate for side hustle income as decimal */
  taxRate: number;

  /** Monthly marketing/advertising spend */
  marketingSpend: number;

  /** Monthly software/tools cost */
  toolsCost: number;

  /** Other monthly costs */
  otherCosts: number;
}

/**
 * Calculated results from the Side Hustle Profitability Calculator
 */
export interface SideHustleResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Monthly gross profit (revenue - expenses) */
  monthlyGrossProfit: number;

  /** Monthly net profit (after taxes) */
  monthlyNetProfit: number;

  /** Annual net profit */
  annualNetProfit: number;

  /** Hours worked per month */
  hoursPerMonth: number;

  /** Effective hourly rate (net profit / hours) */
  effectiveHourlyRate: number;

  /** Opportunity cost (what you could earn at main job) */
  opportunityCost: number;

  /** Net gain/loss compared to main job */
  netVsMainJob: number;

  /** Is the side hustle profitable? */
  isProfitable: boolean;

  /** Is the effective rate better than main job? */
  beatsMainJob: boolean;

  /** Profit margin percentage */
  profitMargin: number;

  /** Break-even monthly revenue */
  breakEvenRevenue: number;

  /** Total monthly expenses breakdown */
  totalExpenses: number;
}

/**
 * Get default input values for a given currency/region
 */
export function getDefaultInputs(currency: Currency = 'USD'): SideHustleInputs {
  const regionDefaults = getRegionDefaults(currency);

  const hourlyRates: Record<Currency, number> = {
    USD: 25,
    GBP: 20,
    EUR: 22,
  };

  const revenues: Record<Currency, number> = {
    USD: 1500,
    GBP: 1200,
    EUR: 1350,
  };

  return {
    currency,
    monthlyRevenue: revenues[currency],
    monthlyExpenses: 200,
    hoursPerWeek: 10,
    mainJobHourlyRate: hourlyRates[currency],
    taxRate: regionDefaults.typicalTaxRate,
    marketingSpend: 50,
    toolsCost: 30,
    otherCosts: 20,
  };
}

/**
 * Default input values (US)
 */
export const DEFAULT_INPUTS: SideHustleInputs = getDefaultInputs('USD');
