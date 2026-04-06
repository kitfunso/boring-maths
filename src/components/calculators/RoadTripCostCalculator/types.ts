/**
 * Road Trip Cost Calculator - Type Definitions
 */

import type { Currency } from '../../../lib/regions';

export type DistanceUnit = 'miles' | 'km';
export type FuelUnit = 'mpg' | 'l100km' | 'kmpl';

export interface RoadTripInputs {
  currency: Currency;
  totalDistance: number;
  unit: DistanceUnit;
  fuelEconomy: number;
  fuelUnit: FuelUnit;
  fuelPrice: number;
  passengers: number;
  tolls: number;
  foodBudgetPerDay: number;
  hotelPerNight: number;
  tripDays: number;
}

export interface RoadTripResult {
  totalFuelCost: number;
  fuelVolume: number;
  fuelVolumeLabel: string;
  costPerPerson: number;
  totalTripCost: number;
  costPerMile: number;
  costPerMileLabel: string;
  dailyCost: number;
  co2Emissions: number;
  treesNeeded: number;
  comparisonToFlying: number;
  totalFoodCost: number;
  totalHotelCost: number;
}

/** Default fuel prices by currency */
const DEFAULT_FUEL_PRICES: Record<Currency, number> = {
  USD: 3.5,
  GBP: 1.5,
  EUR: 1.8,
};

/** Default food budgets by currency */
const DEFAULT_FOOD_BUDGETS: Record<Currency, number> = {
  USD: 50,
  GBP: 35,
  EUR: 40,
};

/** Default hotel costs by currency */
const DEFAULT_HOTEL_COSTS: Record<Currency, number> = {
  USD: 100,
  GBP: 80,
  EUR: 90,
};

export function getDefaultInputs(currency: Currency = 'USD'): RoadTripInputs {
  const isMetric = currency !== 'USD';

  return {
    currency,
    totalDistance: isMetric ? 800 : 500,
    unit: isMetric ? 'km' : 'miles',
    fuelEconomy: isMetric ? 8 : 25,
    fuelUnit: isMetric ? 'l100km' : 'mpg',
    fuelPrice: DEFAULT_FUEL_PRICES[currency],
    passengers: 2,
    tolls: 0,
    foodBudgetPerDay: DEFAULT_FOOD_BUDGETS[currency],
    hotelPerNight: DEFAULT_HOTEL_COSTS[currency],
    tripDays: 3,
  };
}
