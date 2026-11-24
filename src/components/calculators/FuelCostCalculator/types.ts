import type { Currency } from '../../../lib/regions';

export type DistanceUnit = 'miles' | 'km';

export type EfficiencyUnit = 'mpg' | 'l100km';

export type FuelPriceUnit = 'pence-per-litre' | 'pounds-per-litre' | 'per-gallon';

export type GallonType = 'uk' | 'us';

export interface FuelCostInputs {
  currency: Currency;

  distance: number;

  distanceUnit: DistanceUnit;

  efficiency: number;

  efficiencyUnit: EfficiencyUnit;

  fuelPrice: number;

  fuelPriceUnit: FuelPriceUnit;

  roundTrip: boolean;

  gallonType: GallonType;
}

export interface FuelCostResult {
  currency: Currency;

  effectiveDistance: number;

  distanceUnit: DistanceUnit;

  fuelNeededLitres: number;

  fuelNeededGallons: number;

  totalCost: number;

  costPerMile: number;

  costPerKm: number;
}

export const MILES_TO_KM = 1.60934;
export const UK_GALLON_TO_LITRES = 4.54609;
export const US_GALLON_TO_LITRES = 3.78541;

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

export const DEFAULT_INPUTS: FuelCostInputs = getDefaultInputs('GBP');
