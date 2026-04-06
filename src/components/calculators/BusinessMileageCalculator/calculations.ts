/**
 * Business Mileage Calculator - Calculation Logic
 *
 * UK: HMRC Approved Mileage Allowance Payments (AMAP)
 *   - Car/Van: 45p first 10,000 miles, 25p thereafter
 *   - Motorcycle: 24p flat
 *   - Bicycle: 20p flat
 *
 * US: IRS Standard Mileage Rate
 *   - 67 cents per mile (2025)
 */

import type {
  BusinessMileageInputs,
  BusinessMileageResult,
  RateBreakdownLine,
} from './types';
import {
  UK_CAR_RATE_FIRST_10K,
  UK_CAR_RATE_OVER_10K,
  UK_MOTORCYCLE_RATE,
  UK_BICYCLE_RATE,
  US_IRS_RATE_2025,
  ESTIMATED_TAX_RATES,
} from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Calculate UK HMRC mileage deduction
 */
function calculateUKDeduction(
  annualMiles: number,
  vehicleType: BusinessMileageInputs['vehicleType']
): { deduction: number; breakdown: RateBreakdownLine[] } {
  const breakdown: RateBreakdownLine[] = [];

  if (vehicleType === 'motorcycle') {
    const amount = round2(annualMiles * UK_MOTORCYCLE_RATE);
    breakdown.push({
      label: 'Motorcycle rate',
      miles: annualMiles,
      rate: UK_MOTORCYCLE_RATE,
      amount,
    });
    return { deduction: amount, breakdown };
  }

  if (vehicleType === 'bicycle') {
    const amount = round2(annualMiles * UK_BICYCLE_RATE);
    breakdown.push({
      label: 'Bicycle rate',
      miles: annualMiles,
      rate: UK_BICYCLE_RATE,
      amount,
    });
    return { deduction: amount, breakdown };
  }

  // Car / Van: tiered rates
  const milesAtHighRate = Math.min(annualMiles, 10_000);
  const milesAtLowRate = Math.max(annualMiles - 10_000, 0);

  const highAmount = round2(milesAtHighRate * UK_CAR_RATE_FIRST_10K);
  const lowAmount = round2(milesAtLowRate * UK_CAR_RATE_OVER_10K);

  breakdown.push({
    label: 'First 10,000 miles',
    miles: milesAtHighRate,
    rate: UK_CAR_RATE_FIRST_10K,
    amount: highAmount,
  });

  if (milesAtLowRate > 0) {
    breakdown.push({
      label: 'Above 10,000 miles',
      miles: milesAtLowRate,
      rate: UK_CAR_RATE_OVER_10K,
      amount: lowAmount,
    });
  }

  return { deduction: round2(highAmount + lowAmount), breakdown };
}

/**
 * Calculate US IRS standard mileage deduction
 */
function calculateUSDeduction(annualMiles: number): {
  deduction: number;
  breakdown: RateBreakdownLine[];
} {
  const amount = round2(annualMiles * US_IRS_RATE_2025);
  return {
    deduction: amount,
    breakdown: [
      {
        label: 'IRS standard rate (2025)',
        miles: annualMiles,
        rate: US_IRS_RATE_2025,
        amount,
      },
    ],
  };
}

function getElectricNote(
  region: BusinessMileageInputs['region'],
  vehicleType: BusinessMileageInputs['vehicleType'],
  isElectric: boolean
): string {
  if (!isElectric) return '';
  if (vehicleType !== 'car') return '';

  if (region === 'UK') {
    return 'UK HMRC mileage rates are the same for electric and petrol/diesel cars. You can claim 45p/25p regardless of fuel type.';
  }
  return 'The IRS standard mileage rate of 67c applies to all vehicles including EVs. You cannot also deduct electricity charging costs if using the standard rate.';
}

/**
 * Main calculation function
 */
export function calculateBusinessMileage(
  inputs: BusinessMileageInputs
): BusinessMileageResult {
  const { region, milesPerWeek, weeksPerYear, vehicleType, isElectric } = inputs;

  const annualMiles = Math.round(milesPerWeek * weeksPerYear);

  const { deduction, breakdown } =
    region === 'UK'
      ? calculateUKDeduction(annualMiles, vehicleType)
      : calculateUSDeduction(annualMiles);

  const estimatedTaxRate = ESTIMATED_TAX_RATES[region];
  const annualTaxSaving = round2(deduction * estimatedTaxRate);
  const monthlyEquivalent = round2(deduction / 12);

  return {
    annualMiles,
    taxDeduction: deduction,
    ukRateFirst10k: UK_CAR_RATE_FIRST_10K,
    ukRateOver10k: UK_CAR_RATE_OVER_10K,
    usIRSRate: US_IRS_RATE_2025,
    annualTaxSaving,
    monthlyEquivalent,
    electricVehicleNote: getElectricNote(region, vehicleType, isElectric),
    rateBreakdown: breakdown,
    estimatedTaxRate,
  };
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  return formatCurrencyByRegion(value, currency, 2);
}

export function formatPenceOrCents(
  value: number,
  region: BusinessMileageInputs['region']
): string {
  if (region === 'UK') {
    return `${Math.round(value * 100)}p`;
  }
  return `${Math.round(value * 100)}c`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}
