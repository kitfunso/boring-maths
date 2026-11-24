import type { CalorieInputs, CalorieResult } from './types';
import { ACTIVITY_LEVELS, GOALS } from './types';

function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female'
): number {
  const s = gender === 'male' ? 5 : -161;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + s;
}

export function calculateCalories(inputs: CalorieInputs): CalorieResult {
  const {
    unitSystem,
    gender,
    age,
    heightCm,
    heightFeet,
    heightInches,
    weightKg,
    weightLbs,
    activityLevel,
    goal,
  } = inputs;

  const height = unitSystem === 'metric' ? heightCm : (heightFeet * 12 + heightInches) * 2.54;
  const weight = unitSystem === 'metric' ? weightKg : weightLbs * 0.453592;

  const bmr = Math.round(calculateBMR(weight, height, age, gender));

  const activityMultiplier =
    ACTIVITY_LEVELS.find((a) => a.value === activityLevel)?.multiplier || 1.55;
  const tdee = Math.round(bmr * activityMultiplier);

  const goalAdjustment = GOALS.find((g) => g.value === goal)?.adjustment || 0;
  const goalCalories = Math.round(tdee + goalAdjustment);

  const weightInLbs = unitSystem === 'metric' ? weightKg * 2.20462 : weightLbs;
  const protein = {
    min: Math.round(weightInLbs * 0.7),
    max: Math.round(weightInLbs * 1.0),
  };

  const carbs = {
    min: Math.round((goalCalories * 0.4) / 4),
    max: Math.round((goalCalories * 0.5) / 4),
  };

  const fat = {
    min: Math.round((goalCalories * 0.25) / 9),
    max: Math.round((goalCalories * 0.35) / 9),
  };

  return {
    bmr,
    tdee,
    goalCalories,
    protein,
    carbs,
    fat,
  };
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}
