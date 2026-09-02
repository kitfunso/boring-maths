/** Side Hustle Calculator: net profit, effective hourly rate, and opportunity cost vs a main job, for USD/GBP/EUR. */

import type { Currency } from '../../../lib/regions';
import { getRegionDefaults } from '../../../lib/regions';

export interface SideHustleInputs {
  currency: Currency;

  monthlyRevenue: number;

  /** Monthly expenses (materials, tools, subscriptions, etc.) */
  monthlyExpenses: number;

  hoursPerWeek: number;

  /** Current hourly rate at main job (opportunity cost) */
  mainJobHourlyRate: number;

  /** Estimated tax rate for side hustle income as decimal */
  taxRate: number;

  marketingSpend: number;

  toolsCost: number;

  otherCosts: number;
}

export interface SideHustleResult {
  currency: Currency;

  /** Monthly gross profit (revenue - expenses) */
  monthlyGrossProfit: number;

  /** Monthly net profit (after taxes) */
  monthlyNetProfit: number;

  annualNetProfit: number;

  hoursPerMonth: number;

  /** Effective hourly rate (net profit / hours) */
  effectiveHourlyRate: number;

  /** Opportunity cost (what you could earn at main job) */
  opportunityCost: number;

  netVsMainJob: number;

  isProfitable: boolean;

  beatsMainJob: boolean;

  profitMargin: number;

  breakEvenRevenue: number;

  totalExpenses: number;
}

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

export const DEFAULT_INPUTS: SideHustleInputs = getDefaultInputs('USD');
