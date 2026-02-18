/**
 * TDEE Calculator - Type Definitions
 *
 * Total Daily Energy Expenditure using Mifflin-St Jeor equation.
 */

export type UnitSystem = 'metric' | 'imperial';
export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

export interface TDEEInputs {
  unitSystem: UnitSystem;
  sex: Sex;
  age: number;
  heightCm: number;
  heightFeet: number;
  heightInches: number;
  weightKg: number;
  weightLbs: number;
  activityLevel: ActivityLevel;
}

export interface MacroSplit {
  name: string;
  protein: number; // grams
  carbs: number;
  fat: number;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

export interface TDEEResult {
  bmr: number;
  tdee: number;
  activityMultiplier: number;
  macroSplits: MacroSplit[];
  goalCalories: {
    lose: number;
    maintain: number;
    gain: number;
  };
}

export const ACTIVITY_LEVELS: Record<
  ActivityLevel,
  { label: string; multiplier: number; description: string }
> = {
  sedentary: {
    label: 'Sedentary',
    multiplier: 1.2,
    description: 'Little or no exercise, desk job',
  },
  light: {
    label: 'Lightly Active',
    multiplier: 1.375,
    description: 'Light exercise 1-3 days/week',
  },
  moderate: {
    label: 'Moderately Active',
    multiplier: 1.55,
    description: 'Moderate exercise 3-5 days/week',
  },
  active: { label: 'Very Active', multiplier: 1.725, description: 'Hard exercise 6-7 days/week' },
  veryActive: {
    label: 'Extra Active',
    multiplier: 1.9,
    description: 'Very hard exercise, physical job',
  },
};

export function getDefaultInputs(): TDEEInputs {
  return {
    unitSystem: 'metric',
    sex: 'male',
    age: 30,
    heightCm: 175,
    heightFeet: 5,
    heightInches: 9,
    weightKg: 75,
    weightLbs: 165,
    activityLevel: 'moderate',
  };
}
