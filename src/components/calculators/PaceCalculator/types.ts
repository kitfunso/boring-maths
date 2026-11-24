export type PaceMode = 'pace' | 'time' | 'distance';

export type DistanceUnit = 'km' | 'miles';

export const MODE_OPTIONS: { value: PaceMode; label: string }[] = [
  { value: 'pace', label: 'Calculate Pace' },
  { value: 'time', label: 'Calculate Time' },
  { value: 'distance', label: 'Calculate Distance' },
];

export const RACE_DISTANCES = [
  { label: '1 km', km: 1 },
  { label: '5 km', km: 5 },
  { label: '10 km', km: 10 },
  { label: 'Half Marathon', km: 21.0975 },
  { label: 'Marathon', km: 42.195 },
];

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

export interface SplitTime {
  label: string;
  km: number;
  time: string;
}

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
