/**
 * Coffee Spend Calculator - Type Definitions
 */

import type { Currency } from '../../../lib/regions';

export interface CoffeeSpendInputs {
  currency: Currency;
  coffeesPerDay: number;
  pricePerCoffee: number;
  homeBrewCostPerCup: number;
  workDaysPerWeek: number;
  investmentReturnRate: number;
}

export interface FunEquivalent {
  readonly label: string;
  readonly count: number;
}

export interface CoffeeSpendResult {
  dailySpend: number;
  weeklySpend: number;
  monthlySpend: number;
  yearlySpend: number;
  homeBrewYearlyCost: number;
  yearlySavings: number;
  savingsOver10Years: number;
  savingsOver20Years: number;
  savingsOver30Years: number;
  funEquivalents: readonly FunEquivalent[];
}

export function getDefaultInputs(currency: Currency = 'USD'): CoffeeSpendInputs {
  const prices: Record<Currency, { perCoffee: number; homeBrew: number }> = {
    USD: { perCoffee: 5, homeBrew: 0.5 },
    GBP: { perCoffee: 4, homeBrew: 0.4 },
    EUR: { perCoffee: 4.5, homeBrew: 0.45 },
  };

  const p = prices[currency];

  return {
    currency,
    coffeesPerDay: 2,
    pricePerCoffee: p.perCoffee,
    homeBrewCostPerCup: p.homeBrew,
    workDaysPerWeek: 5,
    investmentReturnRate: 7,
  };
}
