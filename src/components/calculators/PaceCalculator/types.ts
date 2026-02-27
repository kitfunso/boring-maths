/**
 * Pace Calculator - Type Definitions
 *
 * Running/walking pace calculator with three modes:
 * Calculate Pace, Calculate Time, or Calculate Distance.
 */

/** Calculation mode */
export type PaceMode = 'pace' | 'time' | 'distance';

/** Distance unit */
export type DistanceUnit = 'km' | 'miles';

/** Mode options for ButtonGroup */
export const MODE_OPTIONS: { value: PaceMode; label: string }[] = [
  { value: 'pace', label: 'Calculate Pace' },
  { value: 'time', label: 'Calculate Time' },
  { value: 'distance', label: 'Calculate Distance' },
];

/** Common race distances in km */
export const RACE_DISTANCES = [
  { label: '1 km', km: 1 },
  { label: '5 km', km: 5 },
  { label: '10 km', km: 10 },
  { label: 'Half Marathon', km: 21.0975 },
  { label: 'Marathon', km: 42.195 },
];

/** Input values for the Pace Calculator */
export interface PaceCalculatorInputs {
  mode: PaceMode;
  distanceUnit: DistanceUnit;
  distance: number;
  hours: number;
  minutes: number;
  seconds: number;
  paceMinutes: number;
  paceSeconds: number;
}

/** Split time for a race distance */
export interface SplitTime {
  label: string;
  km: number;
  time: string;
}

/** Calculated results */
export interface PaceCalculatorResult {
  valid: boolean;
  pacePerKm: string;
  pacePerMile: string;
  speedKmh: string;
  speedMph: string;
  totalTime: string;
  totalDistance: string;
  totalDistanceUnit: DistanceUnit;
  splits: SplitTime[];
}

/** Get default input values */
export function getDefaultInputs(): PaceCalculatorInputs {
  return {
    mode: 'pace',
    distanceUnit: 'km',
    distance: 10,
    hours: 0,
    minutes: 50,
    seconds: 0,
    paceMinutes: 5,
    paceSeconds: 0,
  };
}
