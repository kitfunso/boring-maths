import type { EVChargingCostCalculatorInputs, EVChargingCostCalculatorResult } from './types';

const safe = (v: number): number => (Number.isFinite(v) ? Math.max(0, v) : 0);

export function calculateEVChargingCostCalculator(
  inputs: EVChargingCostCalculatorInputs
): EVChargingCostCalculatorResult {
  const { currency } = inputs;

  const batterySize = safe(inputs.batterySize);
  const currentCharge = Math.min(100, safe(inputs.currentCharge));
  const targetCharge = Math.min(100, safe(inputs.targetCharge));
  const ratePence = safe(inputs.ratePence);
  const chargingEfficiency = Math.min(100, safe(inputs.chargingEfficiency));
  const milesPerKwh = safe(inputs.milesPerKwh);

  const ratePerKwhGBP = ratePence / 100;

  const efficiencyFraction = chargingEfficiency / 100;

  const isValid = targetCharge > currentCharge;

  const energyAddedKwh = isValid ? batterySize * ((targetCharge - currentCharge) / 100) : 0;

  const energyDrawnKwh = efficiencyFraction > 0 ? energyAddedKwh / efficiencyFraction : 0;

  const costGBP = energyDrawnKwh * ratePerKwhGBP;

  const costPerMileGBP =
    milesPerKwh > 0 && efficiencyFraction > 0
      ? ratePerKwhGBP / efficiencyFraction / milesPerKwh
      : 0;

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
