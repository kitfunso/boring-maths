/**
 * EV Charging Cost Calculator - Type Definitions
 *
 * Estimate the cost to charge an electric vehicle from a current
 * charge level to a target level at a given electricity rate.
 */

import type { Currency } from '../../../lib/regions';

export interface EVChargingCostCalculatorInputs {
  /** EV money is always shown in GBP (UK-first per spec). */
  currency: Currency;

  /** Usable battery capacity in kWh. */
  batterySize: number;
  /** Current state of charge as a percentage (0-100). */
  currentCharge: number;
  /** Target state of charge as a percentage (0-100). */
  targetCharge: number;
  /** Electricity rate in pence per kWh. */
  ratePence: number;
  /** Charging efficiency as a percentage (energy delivered to battery vs drawn from the grid). */
  chargingEfficiency: number;
  /** Real-world driving efficiency in miles per kWh. */
  milesPerKwh: number;
}

export interface EVChargingCostCalculatorResult {
  currency: Currency;

  /** Whether the inputs describe a valid charge (target above current). */
  isValid: boolean;

  /** Energy added to the battery for this charge, in kWh. */
  energyAddedKwh: number;
  /** Energy drawn from the grid (accounts for charging losses), in kWh. */
  energyDrawnKwh: number;

  /** Cost in GBP for this specific charge. */
  costGBP: number;
  /** Cost in GBP to drive one mile at this rate and efficiency. */
  costPerMileGBP: number;
  /** Cost in GBP for a full 0-100% charge (grid energy, including losses). */
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
