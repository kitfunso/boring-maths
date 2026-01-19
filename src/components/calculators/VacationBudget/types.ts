/**
 * Vacation Budget Planner - Type Definitions
 */

import type { Currency } from '../../../lib/regions';

export type TravelStyle = 'budget' | 'moderate' | 'luxury';
export type DestinationType =
  | 'domestic'
  | 'international_cheap'
  | 'international_moderate'
  | 'international_expensive';

export interface VacationBudgetInputs {
  currency: Currency;
  travelers: number;
  nights: number;
  destinationType: DestinationType;
  travelStyle: TravelStyle;

  // Transportation
  flightCost: number;
  needsCarRental: boolean;
  carRentalPerDay: number;

  // Accommodation
  accommodationPerNight: number;

  // Daily expenses
  mealsPerDay: number;
  activitiesPerDay: number;
  localTransportPerDay: number;

  // Other
  travelInsurance: boolean;
  souvenirBudget: number;
}

export interface BudgetCategory {
  category: string;
  amount: number;
  perPerson: number;
  perDay: number;
  notes: string;
}

export interface VacationBudgetResult {
  currency: Currency;

  // Summary
  totalBudget: number;
  perPerson: number;
  perDay: number;
  perPersonPerDay: number;

  // Breakdown
  categories: BudgetCategory[];

  // Key totals
  transportationTotal: number;
  accommodationTotal: number;
  foodTotal: number;
  activitiesTotal: number;
  otherTotal: number;

  // Savings target
  weeksToSave: number; // at 10% of median income
  monthlyTarget: number;

  // Tips
  savingsTips: string[];
}

export const STYLE_MULTIPLIERS: Record<TravelStyle, number> = {
  budget: 0.6,
  moderate: 1.0,
  luxury: 2.0,
};

export const DESTINATION_COSTS: Record<
  Currency,
  Record<
    DestinationType,
    {
      accommodation: number;
      meals: number;
      activities: number;
      transport: number;
    }
  >
> = {
  USD: {
    domestic: { accommodation: 150, meals: 60, activities: 50, transport: 20 },
    international_cheap: { accommodation: 50, meals: 25, activities: 30, transport: 10 },
    international_moderate: { accommodation: 150, meals: 60, activities: 60, transport: 25 },
    international_expensive: { accommodation: 300, meals: 120, activities: 100, transport: 40 },
  },
  GBP: {
    domestic: { accommodation: 100, meals: 45, activities: 40, transport: 15 },
    international_cheap: { accommodation: 35, meals: 18, activities: 25, transport: 8 },
    international_moderate: { accommodation: 120, meals: 50, activities: 50, transport: 20 },
    international_expensive: { accommodation: 250, meals: 100, activities: 80, transport: 35 },
  },
  EUR: {
    domestic: { accommodation: 120, meals: 50, activities: 45, transport: 18 },
    international_cheap: { accommodation: 40, meals: 20, activities: 28, transport: 9 },
    international_moderate: { accommodation: 140, meals: 55, activities: 55, transport: 22 },
    international_expensive: { accommodation: 280, meals: 110, activities: 90, transport: 38 },
  },
};

export function getDefaultInputs(currency: Currency = 'USD'): VacationBudgetInputs {
  const costs = DESTINATION_COSTS[currency].domestic;

  return {
    currency,
    travelers: 2,
    nights: 7,
    destinationType: 'domestic',
    travelStyle: 'moderate',
    flightCost: currency === 'GBP' ? 200 : currency === 'EUR' ? 250 : 300,
    needsCarRental: true,
    carRentalPerDay: currency === 'GBP' ? 40 : currency === 'EUR' ? 45 : 50,
    accommodationPerNight: costs.accommodation,
    mealsPerDay: costs.meals,
    activitiesPerDay: costs.activities,
    localTransportPerDay: costs.transport,
    travelInsurance: true,
    souvenirBudget: currency === 'GBP' ? 100 : currency === 'EUR' ? 120 : 150,
  };
}

export const DEFAULT_INPUTS: VacationBudgetInputs = getDefaultInputs('USD');
