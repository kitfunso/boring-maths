import type { RoadTripInputs, RoadTripResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

const CO2_PER_GALLON_KG = 8.887;

const CO2_PER_TREE_PER_YEAR_KG = 22;

const KM_PER_MILE = 1.60934;

const LITERS_PER_GALLON = 3.78541;

function toMiles(distance: number, unit: 'miles' | 'km'): number {
  return unit === 'km' ? distance / KM_PER_MILE : distance;
}

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
      const km = distanceMiles * KM_PER_MILE;
      const liters = (km / 100) * fuelEconomy;
      return liters / LITERS_PER_GALLON;
    }
    case 'kmpl': {
      const km = distanceMiles * KM_PER_MILE;
      const liters = km / fuelEconomy;
      return liters / LITERS_PER_GALLON;
    }
    default:
      return 0;
  }
}

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

function estimateFlightCost(distanceMiles: number, passengers: number, currency: Currency): number {
  const baseFare: Record<Currency, number> = { USD: 80, GBP: 60, EUR: 70 };
  const perMileRate: Record<Currency, number> = { USD: 0.12, GBP: 0.09, EUR: 0.1 };

  const costPerPassenger = baseFare[currency] + distanceMiles * perMileRate[currency];
  return costPerPassenger * passengers;
}

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

  const fuel = calculateFuelCost(distanceMiles, fuelEconomy, fuelUnit, fuelPrice);
  const totalFuelCost = round2(fuel.cost);
  const fuelVolume = round2(fuel.volume);

  const totalFoodCost = round2(foodBudgetPerDay * effectiveDays * effectivePassengers);
  const totalHotelCost = round2(hotelPerNight * Math.max(0, effectiveDays - 1));

  const totalTripCost = round2(totalFuelCost + tolls + totalFoodCost + totalHotelCost);

  const costPerPerson = round2(totalTripCost / effectivePassengers);

  const costPerMile = totalDistance > 0 ? round2(totalTripCost / totalDistance) : 0;
  const costPerMileLabel = unit === 'km' ? '/km' : '/mi';

  const dailyCost = round2(totalTripCost / effectiveDays);

  const fuelGallons = calculateFuelGallons(distanceMiles, fuelEconomy, fuelUnit);
  const co2Emissions = round2(fuelGallons * CO2_PER_GALLON_KG);
  const treesNeeded = Math.ceil(co2Emissions / CO2_PER_TREE_PER_YEAR_KG);

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
