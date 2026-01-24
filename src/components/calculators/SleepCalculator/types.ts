/**
 * Sleep Calculator - Type Definitions
 */

export type CalculationMode = 'wakeTime' | 'bedTime' | 'napTime';
export type AgeGroup = 'teen' | 'adult' | 'senior';

export interface SleepInputs {
  mode: CalculationMode;
  wakeTime: string; // HH:MM format for when you need to wake
  bedTime: string; // HH:MM format for when you're going to bed
  ageGroup: AgeGroup;
  fallAsleepMinutes: number; // Time to fall asleep (default 15)
}

export interface SleepCycle {
  cycles: number;
  wakeTime: string;
  bedTime: string;
  sleepDuration: string;
  quality: 'optimal' | 'good' | 'fair';
}

export interface SleepResult {
  recommendations: SleepCycle[];
  optimalSleep: string;
  cycleLength: number; // 90 minutes
  tipOfTheDay: string;
}

export interface NapResult {
  wakeTime: string;
  napDuration: string;
  napType: 'power' | 'short' | 'full';
  benefit: string;
}

export const AGE_SLEEP_NEEDS = {
  teen: { min: 8, max: 10, optimal: 9 },
  adult: { min: 7, max: 9, optimal: 8 },
  senior: { min: 7, max: 8, optimal: 7.5 },
};

export function getDefaultInputs(): SleepInputs {
  return {
    mode: 'wakeTime',
    wakeTime: '07:00',
    bedTime: '23:00',
    ageGroup: 'adult',
    fallAsleepMinutes: 15,
  };
}

export const DEFAULT_INPUTS: SleepInputs = getDefaultInputs();
