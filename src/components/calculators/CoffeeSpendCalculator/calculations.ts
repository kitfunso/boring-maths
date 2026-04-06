/**
 * Coffee Spend Calculator - Calculation Logic
 */

import type { CoffeeSpendInputs, CoffeeSpendResult, FunEquivalent } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Calculate future value of annual contributions with compound growth.
 *
 * FV = contribution * ((1 + rate)^years - 1) / rate
 */
function futureValueOfAnnuity(annualContribution: number, rate: number, years: number): number {
  if (rate === 0) return annualContribution * years;
  return annualContribution * ((Math.pow(1 + rate, years) - 1) / rate);
}

/**
 * Build fun-equivalent comparisons based on yearly savings.
 */
function buildFunEquivalents(yearlySavings: number, currency: Currency): readonly FunEquivalent[] {
  // Approximate prices by currency
  const prices: Record<Currency, { netflix: number; flight: number; dinner: number }> = {
    USD: { netflix: 15.49, flight: 500, dinner: 100 },
    GBP: { netflix: 10.99, flight: 400, dinner: 80 },
    EUR: { netflix: 13.99, flight: 450, dinner: 90 },
  };

  const p = prices[currency];
  const netflixYearly = p.netflix * 12;

  const equivalents: FunEquivalent[] = [
    { label: 'Netflix subscriptions', count: Math.floor(yearlySavings / netflixYearly) },
    { label: 'flights to Europe', count: Math.floor(yearlySavings / p.flight) },
    { label: 'fancy dinners', count: Math.floor(yearlySavings / p.dinner) },
  ];

  return equivalents.filter((e) => e.count > 0);
}

/**
 * Calculate all coffee spending metrics from inputs.
 */
export function calculateCoffeeSpend(inputs: CoffeeSpendInputs): CoffeeSpendResult {
  const {
    currency,
    coffeesPerDay,
    pricePerCoffee,
    homeBrewCostPerCup,
    workDaysPerWeek,
    investmentReturnRate,
  } = inputs;

  const weeksPerYear = 52;
  const workDaysPerYear = workDaysPerWeek * weeksPerYear;

  const dailySpend = coffeesPerDay * pricePerCoffee;
  const weeklySpend = dailySpend * workDaysPerWeek;
  const monthlySpend = (dailySpend * workDaysPerYear) / 12;
  const yearlySpend = dailySpend * workDaysPerYear;

  const homeBrewDaily = coffeesPerDay * homeBrewCostPerCup;
  const homeBrewYearlyCost = homeBrewDaily * workDaysPerYear;

  const yearlySavings = yearlySpend - homeBrewYearlyCost;

  const rate = investmentReturnRate / 100;
  const savingsOver10Years = Math.round(futureValueOfAnnuity(yearlySavings, rate, 10) * 100) / 100;
  const savingsOver20Years = Math.round(futureValueOfAnnuity(yearlySavings, rate, 20) * 100) / 100;
  const savingsOver30Years = Math.round(futureValueOfAnnuity(yearlySavings, rate, 30) * 100) / 100;

  const funEquivalents = buildFunEquivalents(yearlySavings, currency);

  return {
    dailySpend: Math.round(dailySpend * 100) / 100,
    weeklySpend: Math.round(weeklySpend * 100) / 100,
    monthlySpend: Math.round(monthlySpend * 100) / 100,
    yearlySpend: Math.round(yearlySpend * 100) / 100,
    homeBrewYearlyCost: Math.round(homeBrewYearlyCost * 100) / 100,
    yearlySavings: Math.round(yearlySavings * 100) / 100,
    savingsOver10Years,
    savingsOver20Years,
    savingsOver30Years,
    funEquivalents,
  };
}

export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  return formatCurrencyByRegion(value, currency, 2);
}

export function formatCurrencyWhole(value: number, currency: Currency = 'USD'): string {
  return formatCurrencyByRegion(value, currency, 0);
}
