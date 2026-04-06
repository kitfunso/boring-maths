/**
 * Heart Rate Zone Calculator - Calculation Logic
 *
 * Two methods:
 * - Percentage: zone% x maxHR
 * - Karvonen:   zone% x (maxHR - restingHR) + restingHR
 */

import type { HeartRateZoneInputs, HeartRateZoneResult, HeartRateZone } from './types';
import { ZONE_DEFINITIONS } from './types';

/**
 * Calculate max heart rate using the standard 220-age formula,
 * or use the user-provided value if custom is enabled.
 */
function resolveMaxHR(inputs: HeartRateZoneInputs): number {
  if (inputs.useCustomMaxHR && inputs.maxHeartRate > 0) {
    return inputs.maxHeartRate;
  }
  return Math.max(220 - inputs.age, 0);
}

/**
 * Calculate BPM for a given percentage using the percentage method.
 * Formula: percent × maxHR
 */
function percentageBPM(percent: number, maxHR: number): number {
  return Math.round((percent / 100) * maxHR);
}

/**
 * Calculate BPM for a given percentage using the Karvonen method.
 * Formula: percent × (maxHR - restingHR) + restingHR
 */
function karvonenBPM(percent: number, maxHR: number, restingHR: number): number {
  const heartRateReserve = maxHR - restingHR;
  return Math.round((percent / 100) * heartRateReserve + restingHR);
}

/**
 * Build all 5 heart rate zones from the inputs.
 */
function buildZones(inputs: HeartRateZoneInputs, maxHR: number): readonly HeartRateZone[] {
  const { method, restingHeartRate } = inputs;

  return ZONE_DEFINITIONS.map((def) => {
    const minBPM =
      method === 'karvonen'
        ? karvonenBPM(def.minPercent, maxHR, restingHeartRate)
        : percentageBPM(def.minPercent, maxHR);

    const maxBPM =
      method === 'karvonen'
        ? karvonenBPM(def.maxPercent, maxHR, restingHeartRate)
        : percentageBPM(def.maxPercent, maxHR);

    return {
      zone: def.zone,
      name: def.name,
      description: def.description,
      minBPM,
      maxBPM,
      minPercent: def.minPercent,
      maxPercent: def.maxPercent,
    };
  });
}

/**
 * Main calculation entry point.
 */
export function calculateHeartRateZones(inputs: HeartRateZoneInputs): HeartRateZoneResult {
  const maxHR = resolveMaxHR(inputs);
  const zones = buildZones(inputs, maxHR);

  return {
    maxHR,
    zones,
    targetZoneForGoal: {
      weightLoss: 2,
      endurance: 3,
      performance: 4,
      recovery: 1,
    },
  };
}
