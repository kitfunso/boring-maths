/**
 * Calorie/TDEE Calculator - Type Definitions
 */

export type UnitSystem = 'metric' | 'imperial';
export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
export type Goal = 'lose' | 'maintain' | 'gain';

export interface CalorieInputs {
  unitSystem: UnitSystem;
  gender: Gender;
  age: number;
  heightCm: number;
  heightFeet: number;
  heightInches: number;
  weightKg: number;
  weightLbs: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface CalorieResult {
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  goalCalories: number;
  protein: { min: number; max: number };
  carbs: { min: number; max: number };
  fat: { min: number; max: number };
}

export const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; description: string; multiplier: number }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise, desk job', multiplier: 1.2 },
  { value: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days/week', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week', multiplier: 1.55 },
  { value: 'active', label: 'Very Active', description: 'Hard exercise 6-7 days/week', multiplier: 1.725 },
  { value: 'veryActive', label: 'Extremely Active', description: 'Very hard exercise, physical job', multiplier: 1.9 },
];

export const GOALS: { value: Goal; label: string; adjustment: number }[] = [
  { value: 'lose', label: 'Lose Weight', adjustment: -500 },
  { value: 'maintain', label: 'Maintain Weight', adjustment: 0 },
  { value: 'gain', label: 'Gain Muscle', adjustment: 300 },
];

export function getDefaultInputs(): CalorieInputs {
  return {
    unitSystem: 'imperial',
    gender: 'male',
    age: 30,
    heightCm: 175,
    heightFeet: 5,
    heightInches: 9,
    weightKg: 75,
    weightLbs: 165,
    activityLevel: 'moderate',
    goal: 'maintain',
  };
}
