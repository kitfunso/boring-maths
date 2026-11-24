import type { Currency } from '../../../lib/regions';

export type MileageRegion = 'UK' | 'US';

export type VehicleType = 'car' | 'motorcycle' | 'bicycle';

export interface BusinessMileageInputs {
  readonly currency: Currency;
  readonly region: MileageRegion;
  readonly milesPerWeek: number;
  readonly weeksPerYear: number;
  readonly vehicleType: VehicleType;
  readonly isElectric: boolean;
}

export interface BusinessMileageResult {
  readonly annualMiles: number;
  readonly taxDeduction: number;
  readonly ukRateFirst10k: number;
  readonly ukRateOver10k: number;
  readonly usIRSRate: number;
  readonly annualTaxSaving: number;
  readonly monthlyEquivalent: number;
  readonly electricVehicleNote: string;
  readonly rateBreakdown: readonly RateBreakdownLine[];
  readonly estimatedTaxRate: number;
}

export interface RateBreakdownLine {
  readonly label: string;
  readonly miles: number;
  readonly rate: number;
  readonly amount: number;
}

export const UK_CAR_RATE_FIRST_10K = 0.55;
export const UK_CAR_RATE_OVER_10K = 0.25;
export const UK_MOTORCYCLE_RATE = 0.24;
export const UK_BICYCLE_RATE = 0.2;

export const US_IRS_RATE_JAN_JUN = 0.725;
export const US_IRS_RATE = 0.76;
export const US_IRS_RATE_LABEL = '72.5c to 30 June, 76c from 1 July 2026';

export const ESTIMATED_TAX_RATES: Record<MileageRegion, number> = {
  UK: 0.2,
  US: 0.22,
};

export const VEHICLE_TYPE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'car', label: 'Car / Van' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'bicycle', label: 'Bicycle' },
];

export function getDefaultInputs(currency: Currency = 'USD'): BusinessMileageInputs {
  const region: MileageRegion = currency === 'GBP' ? 'UK' : 'US';

  return {
    currency,
    region,
    milesPerWeek: 100,
    weeksPerYear: 48,
    vehicleType: 'car',
    isElectric: false,
  };
}
