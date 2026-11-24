export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose' | 'maintain' | 'gain';
export type UnitSystem = 'imperial' | 'metric';

export interface MacroCalculatorInputs {
  unitSystem: UnitSystem;
  gender: Gender;
  age: number;
  weight: number;
  heightFeet: number;
  heightInches: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  proteinRatio: number;
}

export interface MacroCalculatorResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinCalories: number;
  carbsCalories: number;
  fatCalories: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
}

export const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const activityLabels: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little or no exercise)',
  light: 'Lightly Active (1-3 days/week)',
  moderate: 'Moderately Active (3-5 days/week)',
  active: 'Very Active (6-7 days/week)',
  very_active: 'Extra Active (physical job + training)',
};

export const goalLabels: Record<Goal, string> = {
  lose: 'Lose Weight',
  maintain: 'Maintain Weight',
  gain: 'Build Muscle',
};

export const goalCalorieAdjustment: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export function getDefaultInputs(): MacroCalculatorInputs {
  return {
    unitSystem: 'imperial',
    gender: 'male',
    age: 30,
    weight: 180,
    heightFeet: 5,
    heightInches: 10,
    activityLevel: 'moderate',
    goal: 'maintain',
    proteinRatio: 0.8,
  };
}
