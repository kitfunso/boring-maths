/**
 * Electricity Cost Calculator - Calculation Logic
 *
 * Pure functions for calculating electricity costs.
 */

import type { ElectricityCostInputs, ElectricityCostResult, SelectedAppliance } from './types';
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

/**
 * Calculate costs for a single appliance
 */
export function calculateApplianceCost(
  appliance: SelectedAppliance,
  daysPerMonth: number,
  ratePerKwh: number,
  _currency: Currency
): {
  name: string;
  watts: number;
  hoursPerDay: number;
  kwhPerMonth: number;
  costPerMonth: number;
  costPerYear: number;
} {
  const kilowatts = appliance.watts / 1000;
  const kwhPerDay = kilowatts * appliance.hoursPerDay;
  const kwhPerMonth = kwhPerDay * daysPerMonth;
  const costPerMonth = kwhPerMonth * ratePerKwh;
  const costPerYear = costPerMonth * 12;

  return {
    name: appliance.name,
    watts: appliance.watts,
    hoursPerDay: appliance.hoursPerDay,
    kwhPerMonth: round(kwhPerMonth, 1),
    costPerMonth: round(costPerMonth, 2),
    costPerYear: round(costPerYear, 0),
  };
}

/**
 * Calculate total household electricity costs
 */
export function calculateHouseholdCost(
  appliances: SelectedAppliance[],
  daysPerMonth: number,
  ratePerKwh: number,
  currency: Currency
): {
  appliances: ReturnType<typeof calculateApplianceCost>[];
  totalWatts: number;
  totalKwhPerMonth: number;
  totalCostPerMonth: number;
  totalCostPerYear: number;
} {
  const calculatedAppliances = appliances.map((a) =>
    calculateApplianceCost(a, daysPerMonth, ratePerKwh, currency)
  );

  const totalWatts = appliances.reduce((sum, a) => sum + a.watts, 0);
  const totalKwhPerMonth = calculatedAppliances.reduce((sum, a) => sum + a.kwhPerMonth, 0);
  const totalCostPerMonth = calculatedAppliances.reduce((sum, a) => sum + a.costPerMonth, 0);
  const totalCostPerYear = calculatedAppliances.reduce((sum, a) => sum + a.costPerYear, 0);

  return {
    appliances: calculatedAppliances,
    totalWatts,
    totalKwhPerMonth: round(totalKwhPerMonth, 1),
    totalCostPerMonth: round(totalCostPerMonth, 2),
    totalCostPerYear: round(totalCostPerYear, 0),
  };
}
