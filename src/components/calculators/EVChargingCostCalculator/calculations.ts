/**
 * EV Charging Cost Calculator - Calculation Logic
 *
 * Pure function. NaN-safe on every numeric input. No JSX.
 *
 * Units note: ratePence is PENCE per kWh, so all GBP costs divide by 100.
 */

import type { EVChargingCostCalculatorInputs, EVChargingCostCalculatorResult } from './types';

/** Clamp any non-finite or negative numeric input to a safe non-negative value. */
const safe = (v: number): number => (Number.isFinite(v) ? Math.max(0, v) : 0);

export function calculateEVChargingCostCalculator(
  inputs: EVChargingCostCalculatorInputs
): EVChargingCostCalculatorResult {
  const { currency } = inputs;

  const batterySize = safe(inputs.batterySize);
  // Charge percentages are clamped to 0-100: a typed/persisted value above 100
  // (e.g. 150) must not compute an impossible amount of energy added.
  const currentCharge = Math.min(100, safe(inputs.currentCharge));
  const targetCharge = Math.min(100, safe(inputs.targetCharge));
  const ratePence = safe(inputs.ratePence);
  // Efficiency cannot exceed 100%: a typed/persisted value above 100 would
  // understate grid energy and cost, so clamp it (as the charge % are clamped).
  const chargingEfficiency = Math.min(100, safe(inputs.chargingEfficiency));
  const milesPerKwh = safe(inputs.milesPerKwh);

  // Rate in pounds per kWh (pence / 100).
  const ratePerKwhGBP = ratePence / 100;

  // Efficiency as a fraction (0-1). A non-positive efficiency is treated as a
  // degenerate state and yields zero drawn energy rather than dividing by zero.
  const efficiencyFraction = chargingEfficiency / 100;

  const isValid = targetCharge > currentCharge;

  // Energy added to the battery for this charge.
  const energyAddedKwh = isValid ? batterySize * ((targetCharge - currentCharge) / 100) : 0;

  // Energy drawn from the grid includes charging losses.
  const energyDrawnKwh = efficiencyFraction > 0 ? energyAddedKwh / efficiencyFraction : 0;

  // Cost for this charge in GBP.
  const costGBP = energyDrawnKwh * ratePerKwhGBP;

  // Cost to drive one mile in GBP. Uses GRID energy (includes charging losses)
  // so it is consistent with the per-charge and full-charge figures: grid energy
  // per battery-kWh is 1/efficiencyFraction, and the car does milesPerKwh per
  // battery-kWh, so cost/mile = (ratePerKwhGBP / efficiencyFraction) / milesPerKwh.
  const costPerMileGBP =
    milesPerKwh > 0 && efficiencyFraction > 0
      ? ratePerKwhGBP / efficiencyFraction / milesPerKwh
      : 0;

  // Cost of a full 0-100% charge (grid energy including losses) in GBP.
  const fullChargeGridKwh = efficiencyFraction > 0 ? batterySize / efficiencyFraction : 0;
  const fullChargeCostGBP = fullChargeGridKwh * ratePerKwhGBP;

  return {
    currency,
    isValid,
    energyAddedKwh,
    energyDrawnKwh,
    costGBP,
    costPerMileGBP,
    fullChargeCostGBP,
  };
}

export default calculateEVChargingCostCalculator;
