import type { Currency } from '../../../lib/regions';

export type ChildcareType = 'none' | 'daycare' | 'nanny' | 'family';
export type FeedingMethod = 'breastfeeding' | 'formula' | 'combination';
export type DiaperPreference = 'disposable' | 'cloth' | 'hybrid';

export interface BabyCostInputs {
  currency: Currency;

  childcareType: ChildcareType;
  childcareMonths: number;
  feedingMethod: FeedingMethod;

  diaperPreference: DiaperPreference;

  hasHealthInsurance: boolean;
  deductible: number;
  copayPercent: number;

  buyNewGear: boolean;
  nurseryBudget: number;

  maternityLeaveWeeks: number;
  paternityLeaveWeeks: number;
  paidLeavePercent: number;
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

  totalFirstYearCost: number;
  monthlyAverage: number;

  categories: CostCategory[];

  childcareCost: number;
  feedingCost: number;
  diaperCost: number;
  healthcareCost: number;
  gearCost: number;
  lostIncomeCost: number;
  miscCost: number;

  biggestExpense: string;
  savingsOpportunities: string[];
  monthlyBudgetNeeded: number;
}

export const REGIONAL_COSTS = {
  USD: {
    daycare: 15000,
    nanny: 35000,
    formula: 1800,
    disposableDiapers: 900,
    clothDiapers: 400,
    newGear: 3000,
    usedGear: 800,
    delivery: 3000,
    pediatricVisits: 500,
    clothing: 600,
    toys: 300,
    babyFood: 600,
  },
  GBP: {
    daycare: 12000,
    nanny: 28000,
    formula: 1200,
    disposableDiapers: 700,
    clothDiapers: 300,
    newGear: 2000,
    usedGear: 500,
    delivery: 0,
    pediatricVisits: 0,
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
    childcareMonths: 6,
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
