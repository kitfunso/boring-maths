/**
 * Baby Cost Calculator - Type Definitions
 *
 * Estimate first-year costs of having a baby.
 */

import type { Currency } from '../../../lib/regions';

export type ChildcareType = 'none' | 'daycare' | 'nanny' | 'family';
export type FeedingMethod = 'breastfeeding' | 'formula' | 'combination';
export type DiaperPreference = 'disposable' | 'cloth' | 'hybrid';

export interface BabyCostInputs {
  currency: Currency;

  // Childcare
  childcareType: ChildcareType;
  childcareMonths: number; // months of childcare in first year (0-12)

  // Feeding
  feedingMethod: FeedingMethod;

  // Diapers
  diaperPreference: DiaperPreference;

  // Health
  hasHealthInsurance: boolean;
  deductible: number;
  copayPercent: number;

  // Gear & Setup
  buyNewGear: boolean; // new vs used/hand-me-downs
  nurseryBudget: number;

  // Lost Income
  maternityLeaveWeeks: number;
  paternityLeaveWeeks: number;
  paidLeavePercent: number; // percent of salary paid during leave
  primaryEarnerSalary: number;
  secondaryEarnerSalary: number;
}

export interface CostCategory {
  name: string;
  amount: number;
  description: string;
  breakdown?: { item: string; cost: number }[];
}

export interface BabyCostResult {
  currency: Currency;

  // Summary
  totalFirstYearCost: number;
  monthlyAverage: number;

  // Categories
  categories: CostCategory[];

  // Key costs
  childcareCost: number;
  feedingCost: number;
  diaperCost: number;
  healthcareCost: number;
  gearCost: number;
  lostIncomeCost: number;
  miscCost: number;

  // Insights
  biggestExpense: string;
  savingsOpportunities: string[];
  monthlyBudgetNeeded: number;
}

/**
 * Default costs by region (approximate annual amounts)
 */
export const REGIONAL_COSTS = {
  USD: {
    daycare: 15000, // $15k/year average US daycare
    nanny: 35000, // $35k/year full-time nanny
    formula: 1800, // $150/month
    disposableDiapers: 900, // $75/month
    clothDiapers: 400, // upfront + washing
    newGear: 3000, // crib, stroller, car seat, etc.
    usedGear: 800,
    delivery: 3000, // average out-of-pocket with insurance
    pediatricVisits: 500, // copays for well-baby visits
    clothing: 600, // $50/month
    toys: 300,
    babyFood: 600, // months 6-12
  },
  GBP: {
    daycare: 12000,
    nanny: 28000,
    formula: 1200,
    disposableDiapers: 700,
    clothDiapers: 300,
    newGear: 2000,
    usedGear: 500,
    delivery: 0, // NHS
    pediatricVisits: 0, // NHS
    clothing: 400,
    toys: 200,
    babyFood: 400,
  },
  EUR: {
    daycare: 10000,
    nanny: 25000,
    formula: 1400,
    disposableDiapers: 750,
    clothDiapers: 350,
    newGear: 2200,
    usedGear: 600,
    delivery: 500,
    pediatricVisits: 200,
    clothing: 450,
    toys: 250,
    babyFood: 450,
  },
};

export function getDefaultInputs(currency: Currency = 'USD'): BabyCostInputs {
  const salary = currency === 'GBP' ? 35000 : currency === 'EUR' ? 40000 : 60000;
  const deductible = currency === 'USD' ? 2000 : 0;

  return {
    currency,
    childcareType: 'daycare',
    childcareMonths: 6, // assume return to work at 6 months
    feedingMethod: 'combination',
    diaperPreference: 'disposable',
    hasHealthInsurance: true,
    deductible,
    copayPercent: currency === 'USD' ? 0.2 : 0,
    buyNewGear: true,
    nurseryBudget: currency === 'GBP' ? 500 : currency === 'EUR' ? 600 : 1000,
    maternityLeaveWeeks: currency === 'USD' ? 12 : currency === 'GBP' ? 39 : 16,
    paternityLeaveWeeks: currency === 'USD' ? 2 : currency === 'GBP' ? 2 : 4,
    paidLeavePercent: currency === 'USD' ? 0 : 0.6,
    primaryEarnerSalary: salary,
    secondaryEarnerSalary: salary * 0.8,
  };
}

export const DEFAULT_INPUTS: BabyCostInputs = getDefaultInputs('USD');
