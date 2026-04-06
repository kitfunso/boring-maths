/**
 * Heart Rate Zone Calculator - Type Definitions
 */

export type CalculationMethod = 'percentage' | 'karvonen';

export interface HeartRateZoneInputs {
  readonly age: number;
  readonly restingHeartRate: number;
  readonly maxHeartRate: number;
  readonly useCustomMaxHR: boolean;
  readonly method: CalculationMethod;
}

export interface HeartRateZone {
  readonly zone: number;
  readonly name: string;
  readonly description: string;
  readonly minBPM: number;
  readonly maxBPM: number;
  readonly minPercent: number;
  readonly maxPercent: number;
}

export interface HeartRateZoneResult {
  readonly maxHR: number;
  readonly zones: readonly HeartRateZone[];
  readonly targetZoneForGoal: {
    readonly weightLoss: number;
    readonly endurance: number;
    readonly performance: number;
    readonly recovery: number;
  };
}

export const ZONE_DEFINITIONS: readonly {
  zone: number;
  name: string;
  description: string;
  minPercent: number;
  maxPercent: number;
}[] = [
  {
    zone: 1,
    name: 'Recovery',
    description: 'Very light effort. Improves overall health and aids recovery.',
    minPercent: 50,
    maxPercent: 60,
  },
  {
    zone: 2,
    name: 'Fat Burn',
    description: 'Light effort. Builds base endurance and burns fat efficiently.',
    minPercent: 60,
    maxPercent: 70,
  },
  {
    zone: 3,
    name: 'Aerobic',
    description: 'Moderate effort. Improves cardiovascular fitness and stamina.',
    minPercent: 70,
    maxPercent: 80,
  },
  {
    zone: 4,
    name: 'Anaerobic',
    description: 'Hard effort. Increases speed and lactate threshold.',
    minPercent: 80,
    maxPercent: 90,
  },
  {
    zone: 5,
    name: 'VO2 Max',
    description: 'Maximum effort. Develops peak power and speed.',
    minPercent: 90,
    maxPercent: 100,
  },
];

export const METHOD_OPTIONS: readonly { value: CalculationMethod; label: string }[] = [
  { value: 'percentage', label: 'Max HR %' },
  { value: 'karvonen', label: 'Karvonen' },
];

export function getDefaultInputs(): HeartRateZoneInputs {
  return {
    age: 30,
    restingHeartRate: 65,
    maxHeartRate: 190,
    useCustomMaxHR: false,
    method: 'percentage',
  };
}
