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
 * Floor a numeric input so a non-finite value (NaN from a cleared or
 * partial field like "-" / "1e" / "abc") becomes 0. Valid numbers pass
 * through unchanged.
 */
const safe = (v: number): number => (Number.isFinite(v) ? Math.max(0, v) : 0);

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
  const safeInputs: HeartRateZoneInputs = {
    ...inputs,
    age: safe(inputs.age),
    restingHeartRate: safe(inputs.restingHeartRate),
    maxHeartRate: safe(inputs.maxHeartRate),
  };

  const maxHR = resolveMaxHR(safeInputs);
  const zones = buildZones(safeInputs, maxHR);

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
