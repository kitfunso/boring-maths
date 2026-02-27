/**
 * Fuel Cost Calculator - Type Definitions
 *
 * Calculate the cost of a journey based on distance, fuel efficiency,
 * and fuel price. Supports miles/km and mpg/L per 100km with UK defaults.
 */

import type { Currency } from '../../../lib/regions';

/** Distance unit */
export type DistanceUnit = 'miles' | 'km';

/** Fuel efficiency unit */
export type EfficiencyUnit = 'mpg' | 'l100km';

/** Fuel price unit */
export type FuelPriceUnit = 'pence-per-litre' | 'pounds-per-litre' | 'per-gallon';

/** Gallon type: UK (4.546L) or US (3.785L) */
export type GallonType = 'uk' | 'us';

/**
 * Input values for the Fuel Cost Calculator
 */
export interface FuelCostInputs {
  /** Selected currency */
  currency: Currency;

  /** Journey distance */
  distance: number;

  /** Distance unit */
  distanceUnit: DistanceUnit;

  /** Fuel efficiency value */
  efficiency: number;

  /** Fuel efficiency unit */
  efficiencyUnit: EfficiencyUnit;

  /** Fuel price in minor or major currency units depending on fuelPriceUnit */
  fuelPrice: number;

  /** Fuel price unit */
  fuelPriceUnit: FuelPriceUnit;

  /** Whether to double distance for a round trip */
  roundTrip: boolean;

  /** Which gallon standard to use (UK for GBP/EUR, US for USD) */
  gallonType: GallonType;
}

/**
 * Calculated results from the Fuel Cost Calculator
 */
export interface FuelCostResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Effective distance (doubled if round trip) */
  effectiveDistance: number;

  /** Distance unit for display */
  distanceUnit: DistanceUnit;

  /** Total fuel needed in litres */
  fuelNeededLitres: number;

  /** Total fuel needed in UK gallons */
  fuelNeededGallons: number;

  /** Total cost in major currency units (pounds/dollars/euros) */
  totalCost: number;

  /** Cost per mile */
  costPerMile: number;

  /** Cost per kilometre */
  costPerKm: number;
}

/** Conversion constants */
export const MILES_TO_KM = 1.60934;
export const UK_GALLON_TO_LITRES = 4.54609;
export const US_GALLON_TO_LITRES = 3.78541;

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'GBP'): FuelCostInputs {
  if (currency === 'USD') {
    return {
      currency,
      distance: 50,
      distanceUnit: 'miles',
      efficiency: 30,
      efficiencyUnit: 'mpg',
      fuelPrice: 3.5,
      fuelPriceUnit: 'per-gallon',
      roundTrip: false,
      gallonType: 'us' as GallonType,
    };
  }

  if (currency === 'EUR') {
    return {
      currency,
      distance: 80,
      distanceUnit: 'km',
      efficiency: 7,
      efficiencyUnit: 'l100km',
      fuelPrice: 1.75,
      fuelPriceUnit: 'pounds-per-litre',
      roundTrip: false,
      gallonType: 'uk' as GallonType,
    };
  }

  // UK defaults
  return {
    currency,
    distance: 50,
    distanceUnit: 'miles',
    efficiency: 40,
    efficiencyUnit: 'mpg',
    fuelPrice: 145,
    fuelPriceUnit: 'pence-per-litre',
    roundTrip: false,
    gallonType: 'uk' as GallonType,
  };
}

/**
 * Default input values (UK)
 */
export const DEFAULT_INPUTS: FuelCostInputs = getDefaultInputs('GBP');
