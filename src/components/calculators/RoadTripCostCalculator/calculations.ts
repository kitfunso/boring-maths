/**
 * Road Trip Cost Calculator - Calculation Logic
 */

import type { RoadTripInputs, RoadTripResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/** CO2 per gallon of gasoline in kg */
const CO2_PER_GALLON_KG = 8.887;

/** CO2 per liter of gasoline in kg */
const CO2_PER_LITER_KG = 2.348;

/** Average CO2 a tree absorbs per year in kg */
const CO2_PER_TREE_PER_YEAR_KG = 22;

/** Miles per km conversion */
const KM_PER_MILE = 1.60934;

/** Liters per US gallon */
const LITERS_PER_GALLON = 3.78541;

/**
 * Convert distance to miles for internal calculation
 */
function toMiles(distance: number, unit: 'miles' | 'km'): number {
  return unit === 'km' ? distance / KM_PER_MILE : distance;
}

/**
 * Calculate fuel volume in gallons from inputs
 */
function calculateFuelGallons(
  distanceMiles: number,
  fuelEconomy: number,
  fuelUnit: 'mpg' | 'l100km' | 'kmpl'
): number {
  if (fuelEconomy <= 0) return 0;

  switch (fuelUnit) {
    case 'mpg':
      return distanceMiles / fuelEconomy;
    case 'l100km': {
      // Convert miles to km, then liters = (km / 100) * l100km, then to gallons
      const km = distanceMiles * KM_PER_MILE;
      const liters = (km / 100) * fuelEconomy;
      return liters / LITERS_PER_GALLON;
    }
    case 'kmpl': {
      // Convert miles to km, then liters = km / kmpl, then to gallons
      const km = distanceMiles * KM_PER_MILE;
      const liters = km / fuelEconomy;
      return liters / LITERS_PER_GALLON;
    }
    default:
      return 0;
  }
}

/**
 * Calculate fuel cost based on fuel unit and price
 * Price is per gallon for mpg, per liter for l100km and kmpl
 */
function calculateFuelCost(
  distanceMiles: number,
  fuelEconomy: number,
  fuelUnit: 'mpg' | 'l100km' | 'kmpl',
  fuelPrice: number
): { cost: number; volume: number; volumeLabel: string } {
  if (fuelEconomy <= 0) return { cost: 0, volume: 0, volumeLabel: 'gal' };

  switch (fuelUnit) {
    case 'mpg': {
      const gallons = distanceMiles / fuelEconomy;
      return {
        cost: gallons * fuelPrice,
        volume: gallons,
        volumeLabel: 'gal',
      };
    }
    case 'l100km': {
      const km = distanceMiles * KM_PER_MILE;
      const liters = (km / 100) * fuelEconomy;
      return {
        cost: liters * fuelPrice,
        volume: liters,
        volumeLabel: 'L',
      };
    }
    case 'kmpl': {
      const km = distanceMiles * KM_PER_MILE;
      const liters = km / fuelEconomy;
      return {
        cost: liters * fuelPrice,
        volume: liters,
        volumeLabel: 'L',
      };
    }
    default:
      return { cost: 0, volume: 0, volumeLabel: 'gal' };
  }
}

/**
 * Estimate a rough flight cost based on distance
 * Uses approximate per-mile pricing for economy class
 */
function estimateFlightCost(distanceMiles: number, passengers: number, currency: Currency): number {
  // Base fare + per-mile rate (rough economy estimate)
  const baseFare: Record<Currency, number> = { USD: 80, GBP: 60, EUR: 70 };
  const perMileRate: Record<Currency, number> = { USD: 0.12, GBP: 0.09, EUR: 0.1 };

  const costPerPassenger = baseFare[currency] + distanceMiles * perMileRate[currency];
  return costPerPassenger * passengers;
}

/**
 * Main calculation function
 */
export function calculateRoadTripCost(inputs: RoadTripInputs): RoadTripResult {
  const {
    currency,
    totalDistance,
    unit,
    fuelEconomy,
    fuelUnit,
    fuelPrice,
    passengers,
    tolls,
    foodBudgetPerDay,
    hotelPerNight,
    tripDays,
  } = inputs;

  const distanceMiles = toMiles(totalDistance, unit);
  const effectivePassengers = Math.max(1, passengers);
  const effectiveDays = Math.max(1, tripDays);

  // Fuel
  const fuel = calculateFuelCost(distanceMiles, fuelEconomy, fuelUnit, fuelPrice);
  const totalFuelCost = round2(fuel.cost);
  const fuelVolume = round2(fuel.volume);

  // Other costs
  const totalFoodCost = round2(foodBudgetPerDay * effectiveDays * effectivePassengers);
  const totalHotelCost = round2(hotelPerNight * Math.max(0, effectiveDays - 1));

  // Total
  const totalTripCost = round2(totalFuelCost + tolls + totalFoodCost + totalHotelCost);

  // Per-person
  const costPerPerson = round2(totalTripCost / effectivePassengers);

  // Per distance unit
  const costPerMile = totalDistance > 0 ? round2(totalTripCost / totalDistance) : 0;
  const costPerMileLabel = unit === 'km' ? '/km' : '/mi';

  // Daily cost
  const dailyCost = round2(totalTripCost / effectiveDays);

  // CO2 emissions
  const fuelGallons = calculateFuelGallons(distanceMiles, fuelEconomy, fuelUnit);
  const co2Emissions = round2(fuelGallons * CO2_PER_GALLON_KG);
  const treesNeeded = Math.ceil(co2Emissions / CO2_PER_TREE_PER_YEAR_KG);

  // Flight comparison
  const comparisonToFlying = round2(
    estimateFlightCost(distanceMiles, effectivePassengers, currency)
  );

  return {
    totalFuelCost,
    fuelVolume,
    fuelVolumeLabel: fuel.volumeLabel,
    costPerPerson,
    totalTripCost,
    costPerMile,
    costPerMileLabel,
    dailyCost,
    co2Emissions,
    treesNeeded,
    comparisonToFlying,
    totalFoodCost,
    totalHotelCost,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  return formatCurrencyByRegion(value, currency, 2);
}

export function formatNumber(value: number, decimals: number = 1): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
