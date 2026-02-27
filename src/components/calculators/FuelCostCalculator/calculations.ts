/**
 * Fuel Cost Calculator - Calculation Logic
 *
 * Pure functions for computing fuel costs based on distance,
 * efficiency, and fuel price. All conversions use UK gallons by default.
 */

import type { FuelCostInputs, FuelCostResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';
import { MILES_TO_KM, UK_GALLON_TO_LITRES, US_GALLON_TO_LITRES } from './types';
import type { GallonType } from './types';

/**
 * Round to 2 decimal places
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Convert distance to kilometres
 */
function toKm(distance: number, unit: 'miles' | 'km'): number {
  return unit === 'miles' ? distance * MILES_TO_KM : distance;
}

/**
 * Get fuel consumption in litres per 100 km
 */
function toLitresPer100Km(
  efficiency: number,
  unit: 'mpg' | 'l100km',
  gallonType: GallonType = 'uk'
): number {
  if (unit === 'l100km') return efficiency;
  // mpg -> L/100km
  // Use the correct gallon size: UK (4.546L) or US (3.785L)
  const gallonLitres = gallonType === 'us' ? US_GALLON_TO_LITRES : UK_GALLON_TO_LITRES;
  const litresPerMile = gallonLitres / efficiency;
  const litresPerKm = litresPerMile / MILES_TO_KM;
  return litresPerKm * 100;
}

/**
 * Get fuel price in pounds/dollars/euros per litre (major currency units)
 */
function toPricePerLitre(
  price: number,
  unit: 'pence-per-litre' | 'pounds-per-litre' | 'per-gallon',
  gallonType: GallonType = 'uk'
): number {
  switch (unit) {
    case 'pence-per-litre':
      return price / 100;
    case 'pounds-per-litre':
      return price;
    case 'per-gallon': {
      // Convert gallon price to per-litre using the correct gallon size
      const gallonLitres = gallonType === 'us' ? US_GALLON_TO_LITRES : UK_GALLON_TO_LITRES;
      return price / gallonLitres;
    }
  }
}

/**
 * Calculate fuel cost for a journey
 */
export function calculateFuelCost(inputs: FuelCostInputs): FuelCostResult {
  const {
    currency,
    distance,
    distanceUnit,
    efficiency,
    efficiencyUnit,
    fuelPrice,
    fuelPriceUnit,
    roundTrip,
    gallonType,
  } = inputs;

  const effectiveDistance = roundTrip ? distance * 2 : distance;
  const distanceKm = toKm(effectiveDistance, distanceUnit);
  const litresPer100Km = toLitresPer100Km(efficiency, efficiencyUnit, gallonType);
  const pricePerLitre = toPricePerLitre(fuelPrice, fuelPriceUnit, gallonType);

  const fuelNeededLitres = (distanceKm / 100) * litresPer100Km;
  const gallonLitres = gallonType === 'us' ? US_GALLON_TO_LITRES : UK_GALLON_TO_LITRES;
  const fuelNeededGallons = fuelNeededLitres / gallonLitres;
  const totalCost = fuelNeededLitres * pricePerLitre;

  const distanceMiles =
    distanceUnit === 'miles' ? effectiveDistance : effectiveDistance / MILES_TO_KM;
  const costPerMile = distanceMiles > 0 ? totalCost / distanceMiles : 0;
  const costPerKm = distanceKm > 0 ? totalCost / distanceKm : 0;

  return {
    currency,
    effectiveDistance,
    distanceUnit,
    fuelNeededLitres: round(fuelNeededLitres),
    fuelNeededGallons: round(fuelNeededGallons),
    totalCost: round(totalCost),
    costPerMile: round(costPerMile),
    costPerKm: round(costPerKm),
  };
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'GBP',
  decimals: number = 2
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}

/**
 * Format a number with locale-appropriate grouping
 */
export function formatNumber(value: number, decimals: number = 1): string {
  return value.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
