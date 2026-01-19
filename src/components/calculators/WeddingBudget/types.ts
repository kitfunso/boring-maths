/**
 * Wedding Budget Calculator - Type Definitions
 */

import type { Currency } from '../../../lib/regions';

export type WeddingStyle = 'budget' | 'moderate' | 'upscale' | 'luxury';
export type Priority = 'low' | 'medium' | 'high' | 'splurge';

export interface CategoryPriority {
  venue: Priority;
  catering: Priority;
  photography: Priority;
  flowers: Priority;
  music: Priority;
  attire: Priority;
  decor: Priority;
}

export interface WeddingBudgetInputs {
  currency: Currency;
  totalBudget: number;
  guestCount: number;
  weddingStyle: WeddingStyle;
  priorities: CategoryPriority;
}

export interface CategoryAllocation {
  category: string;
  percentage: number;
  amount: number;
  perGuestCost: number;
  priority: Priority;
  typicalRange: { min: number; max: number };
  tips: string[];
}

export interface WeddingBudgetResult {
  currency: Currency;
  totalBudget: number;
  guestCount: number;

  // Per guest metrics
  costPerGuest: number;
  industryAveragePerGuest: number;

  // Allocations
  allocations: CategoryAllocation[];

  // Summary
  venueAndCatering: number;
  vendorServices: number;
  personalTouches: number;
  contingency: number;

  // Insights
  budgetTier: WeddingStyle;
  warnings: string[];
  savingsTips: string[];
}

// Base percentages for each category (adds to 95%, leaving 5% contingency)
export const BASE_PERCENTAGES: Record<string, number> = {
  venue: 15,
  catering: 30,
  photography: 12,
  flowers: 8,
  music: 8,
  attire: 8,
  decor: 6,
  stationery: 3,
  transportation: 2,
  favors: 2,
  officiant: 1,
};

// Priority multipliers
export const PRIORITY_MULTIPLIERS: Record<Priority, number> = {
  low: 0.6,
  medium: 1.0,
  high: 1.4,
  splurge: 2.0,
};

// Average cost per guest by region
export const AVERAGE_PER_GUEST: Record<Currency, number> = {
  USD: 250,
  GBP: 180,
  EUR: 200,
};

export function getDefaultInputs(currency: Currency = 'USD'): WeddingBudgetInputs {
  const budget = currency === 'GBP' ? 20000 : currency === 'EUR' ? 25000 : 30000;

  return {
    currency,
    totalBudget: budget,
    guestCount: 100,
    weddingStyle: 'moderate',
    priorities: {
      venue: 'medium',
      catering: 'high',
      photography: 'high',
      flowers: 'medium',
      music: 'medium',
      attire: 'medium',
      decor: 'low',
    },
  };
}

export const DEFAULT_INPUTS: WeddingBudgetInputs = getDefaultInputs('USD');
