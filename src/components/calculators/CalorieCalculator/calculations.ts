/**
 * Calorie/TDEE Calculator - Calculation Logic
 *
 * Uses Mifflin-St Jeor equation (most accurate for modern populations)
 */

import type { CalorieInputs, CalorieResult } from './types';
import { ACTIVITY_LEVELS, GOALS } from './types';

/**
 * Calculate BMR using Mifflin-St Jeor equation
 * More accurate than Harris-Benedict for most people
 */
function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female'
): number {
  // Mifflin-St Jeor: BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) + s
  // s = +5 for males, −161 for females
  const s = gender === 'male' ? 5 : -161;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + s;
}

/**
 * Main calculation function
 */
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

  // Convert to metric if needed
  const height = unitSystem === 'metric' ? heightCm : (heightFeet * 12 + heightInches) * 2.54;
  const weight = unitSystem === 'metric' ? weightKg : weightLbs * 0.453592;

  // Calculate BMR
  const bmr = Math.round(calculateBMR(weight, height, age, gender));

  // Calculate TDEE
  const activityMultiplier =
    ACTIVITY_LEVELS.find((a) => a.value === activityLevel)?.multiplier || 1.55;
  const tdee = Math.round(bmr * activityMultiplier);

  // Apply goal adjustment
  const goalAdjustment = GOALS.find((g) => g.value === goal)?.adjustment || 0;
  const goalCalories = Math.round(tdee + goalAdjustment);

  // Calculate macros (simplified ranges)
  // Protein: 0.8-1g per lb bodyweight for active individuals
  const weightInLbs = unitSystem === 'metric' ? weightKg * 2.20462 : weightLbs;
  const protein = {
    min: Math.round(weightInLbs * 0.7),
    max: Math.round(weightInLbs * 1.0),
  };

  // Carbs: 40-50% of calories (4 cal/g)
  const carbs = {
    min: Math.round((goalCalories * 0.4) / 4),
    max: Math.round((goalCalories * 0.5) / 4),
  };

  // Fat: 25-35% of calories (9 cal/g)
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
