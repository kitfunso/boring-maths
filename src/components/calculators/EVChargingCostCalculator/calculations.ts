/** EV Charging Cost Calculator: pure, NaN-safe function. Units: ratePence is PENCE per kWh, so all GBP costs divide by 100. */

import type { EVChargingCostCalculatorInputs, EVChargingCostCalculatorResult } from './types';

/** Clamp any non-finite or negative numeric input to a safe non-negative value. */
const safe = (v: number): number => (Number.isFinite(v) ? Math.max(0, v) : 0);

export function calculateEVChargingCostCalculator(
  inputs: EVChargingCostCalculatorInputs
): EVChargingCostCalculatorResult {
  const { currency } = inputs;

  const batterySize = safe(inputs.batterySize);
  // Clamped to 0-100: a typed/persisted value above 100 must not compute an impossible amount of energy added.
  const currentCharge = Math.min(100, safe(inputs.currentCharge));
  const targetCharge = Math.min(100, safe(inputs.targetCharge));
  const ratePence = safe(inputs.ratePence);
  // Efficiency cannot exceed 100%: a value above 100 would understate grid energy and cost.
  const chargingEfficiency = Math.min(100, safe(inputs.chargingEfficiency));
  const milesPerKwh = safe(inputs.milesPerKwh);

  // Rate in pounds per kWh (pence / 100).
  const ratePerKwhGBP = ratePence / 100;

  // Efficiency as a fraction (0-1); non-positive is treated as degenerate and yields zero rather than dividing by zero.
  const efficiencyFraction = chargingEfficiency / 100;

  const isValid = targetCharge > currentCharge;

  const energyAddedKwh = isValid ? batterySize * ((targetCharge - currentCharge) / 100) : 0;

  // Energy drawn from the grid includes charging losses.
  const energyDrawnKwh = efficiencyFraction > 0 ? energyAddedKwh / efficiencyFraction : 0;

  const costGBP = energyDrawnKwh * ratePerKwhGBP;

  // Cost per mile uses GRID energy (consistent with the other figures): cost/mile = (ratePerKwhGBP / efficiencyFraction) / milesPerKwh.
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
