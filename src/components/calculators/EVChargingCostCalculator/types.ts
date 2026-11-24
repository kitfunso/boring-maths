import type { Currency } from '../../../lib/regions';

export interface EVChargingCostCalculatorInputs {
  currency: Currency;

  batterySize: number;
  currentCharge: number;
  targetCharge: number;
  ratePence: number;
  chargingEfficiency: number;
  milesPerKwh: number;
}

export interface EVChargingCostCalculatorResult {
  currency: Currency;

  isValid: boolean;

  energyAddedKwh: number;
  energyDrawnKwh: number;

  costGBP: number;
  costPerMileGBP: number;
  fullChargeCostGBP: number;
}

export function getDefaultInputs(): EVChargingCostCalculatorInputs {
  return {
    currency: 'GBP',
    batterySize: 60,
    currentCharge: 20,
    targetCharge: 80,
    ratePence: 28,
    chargingEfficiency: 90,
    milesPerKwh: 3.5,
  };
}

export const DEFAULT_INPUTS: EVChargingCostCalculatorInputs = getDefaultInputs();
