/**
 * Electricity Cost Calculator - Calculation Logic
 *
 * Pure functions for calculating electricity costs.
 */

import type { ElectricityCostInputs, ElectricityCostResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Calculate electricity costs
 */
export function calculateElectricityCost(inputs: ElectricityCostInputs): ElectricityCostResult {
  const { currency, watts, hoursPerDay, daysPerMonth, ratePerKwh } = inputs;

  // Convert watts to kilowatts
  const kilowatts = watts / 1000;

  // Calculate kWh usage
  const kwhPerDay = kilowatts * hoursPerDay;
  const kwhPerMonth = kwhPerDay * daysPerMonth;
  const kwhPerYear = kwhPerMonth * 12;

  // Calculate costs
  const costPerHour = kilowatts * ratePerKwh;
  const costPerDay = kwhPerDay * ratePerKwh;
  const costPerMonth = kwhPerMonth * ratePerKwh;
  const costPerYear = kwhPerYear * ratePerKwh;

  return {
    currency,
    kwhPerDay: round(kwhPerDay, 2),
    kwhPerMonth: round(kwhPerMonth, 1),
    kwhPerYear: round(kwhPerYear, 0),
    costPerHour: round(costPerHour, 3),
    costPerDay: round(costPerDay, 2),
    costPerMonth: round(costPerMonth, 2),
    costPerYear: round(costPerYear, 0),
  };
}

/**
 * Round to specified decimal places
 */
function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 2
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
