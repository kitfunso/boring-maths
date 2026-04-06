/**
 * Business Mileage Calculator - Type Definitions
 *
 * Supports UK HMRC Approved Mileage Allowance Payments (AMAP)
 * and US IRS Standard Mileage Rate deductions.
 */

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

// ---------------------------------------------------------------------------
// UK HMRC AMAP Rates (2024/25 tax year, unchanged since 2011)
// ---------------------------------------------------------------------------

/** Pence per mile for first 10,000 business miles (car) */
export const UK_CAR_RATE_FIRST_10K = 0.45;
/** Pence per mile above 10,000 business miles (car) */
export const UK_CAR_RATE_OVER_10K = 0.25;
/** Pence per mile for motorcycles (flat rate) */
export const UK_MOTORCYCLE_RATE = 0.24;
/** Pence per mile for bicycles (flat rate) */
export const UK_BICYCLE_RATE = 0.2;

// ---------------------------------------------------------------------------
// US IRS Standard Mileage Rate (2025)
// ---------------------------------------------------------------------------

/** Cents per mile for business use (2025 IRS rate: 67 cents) */
export const US_IRS_RATE_2025 = 0.67;

// ---------------------------------------------------------------------------
// Estimated marginal tax rates (for tax saving calculation)
// ---------------------------------------------------------------------------

export const ESTIMATED_TAX_RATES: Record<MileageRegion, number> = {
  UK: 0.2, // Basic rate income tax
  US: 0.22, // Federal 22% bracket (typical self-employed)
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
