import type { HeartRateZoneInputs, HeartRateZoneResult, HeartRateZone } from './types';
import { ZONE_DEFINITIONS } from './types';

const safe = (v: number): number => (Number.isFinite(v) ? Math.max(0, v) : 0);

function resolveMaxHR(inputs: HeartRateZoneInputs): number {
  if (inputs.useCustomMaxHR && inputs.maxHeartRate > 0) {
    return inputs.maxHeartRate;
  }
  return Math.max(220 - inputs.age, 0);
}

function percentageBPM(percent: number, maxHR: number): number {
  return Math.round((percent / 100) * maxHR);
}

function karvonenBPM(percent: number, maxHR: number, restingHR: number): number {
  const heartRateReserve = maxHR - restingHR;
  return Math.round((percent / 100) * heartRateReserve + restingHR);
}

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
