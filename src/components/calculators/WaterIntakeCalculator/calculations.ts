/**
 * Water Intake Calculator - Calculation Logic
 */

import type { WaterIntakeInputs, WaterIntakeResult } from './types';

const ML_PER_OZ = 29.5735;
const ML_PER_CUP = 236.588;
const EIGHT_GLASSES_ML = 8 * ML_PER_CUP; // ~1893ml
const WAKING_HOURS = 16;

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.0,
  light: 1.1,
  moderate: 1.2,
  active: 1.4,
  veryActive: 1.6,
};

const CLIMATE_ADDITIONS_ML: Record<string, number> = {
  temperate: 0,
  hot: 500,
  cold: 0,
  humid: 300,
};

/**
 * Calculate daily water intake recommendation.
 *
 * Base formula: 35ml per kg of body weight.
 * Adjusted for activity level, climate, and pregnancy/breastfeeding.
 */
export function calculateWaterIntake(inputs: WaterIntakeInputs): WaterIntakeResult {
  const { bodyWeight, unit, activityLevel, climate, isPregnant, isBreastfeeding } = inputs;

  // Convert to kg if needed
  const weightKg = unit === 'lbs' ? bodyWeight * 0.453592 : bodyWeight;

  // Base intake: 35ml per kg
  const baseMl = weightKg * 35;

  // Activity multiplier
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.0;
  const afterActivityMl = baseMl * activityMultiplier;

  // Exercise addition (difference from base)
  const exerciseAdditionMl = Math.round(afterActivityMl - baseMl);

  // Climate addition
  const climateAdditionMl = CLIMATE_ADDITIONS_ML[climate] ?? 0;

  // Pregnancy / breastfeeding additions
  let pregnancyAdditionMl = 0;
  if (isPregnant) pregnancyAdditionMl += 300;
  if (isBreastfeeding) pregnancyAdditionMl += 700;

  // Total daily intake
  const dailyIntakeMl = Math.round(afterActivityMl + climateAdditionMl + pregnancyAdditionMl);

  // Conversions
  const dailyIntakeOz = Math.round((dailyIntakeMl / ML_PER_OZ) * 10) / 10;
  const dailyIntakeCups = Math.round((dailyIntakeMl / ML_PER_CUP) * 10) / 10;

  // Hourly intake (spread over waking hours)
  const hourlyIntakeMl = Math.round(dailyIntakeMl / WAKING_HOURS);

  // Total including exercise component (for display breakdown)
  const totalWithExerciseMl = dailyIntakeMl;

  // Compared to the "8 glasses a day" recommendation
  const comparedToEightGlasses = Math.round((dailyIntakeMl / EIGHT_GLASSES_ML) * 100);

  // Generate contextual tips
  const hydrationTips = generateTips(inputs, dailyIntakeMl);

  return {
    dailyIntakeMl,
    dailyIntakeOz,
    dailyIntakeCups,
    hourlyIntakeMl,
    exerciseAdditionMl,
    pregnancyAdditionMl,
    totalWithExerciseMl,
    comparedToEightGlasses,
    hydrationTips,
  };
}

function generateTips(inputs: WaterIntakeInputs, dailyMl: number): string[] {
  const tips: string[] = [];

  tips.push('Drink a glass of water first thing in the morning to kickstart hydration.');

  if (inputs.activityLevel === 'active' || inputs.activityLevel === 'veryActive') {
    tips.push('Drink 200-300ml of water 30 minutes before exercise and sip during workouts.');
  }

  if (inputs.climate === 'hot' || inputs.climate === 'humid') {
    tips.push('In hot or humid weather, increase intake and watch for signs of dehydration.');
  }

  tips.push('Pale yellow urine is a good sign of adequate hydration.');

  if (dailyMl > 3000) {
    tips.push('Spread your intake throughout the day rather than drinking large amounts at once.');
  }

  tips.push('Foods like watermelon, cucumber, and oranges contribute to your daily water intake.');

  if (inputs.isPregnant || inputs.isBreastfeeding) {
    tips.push('Keep a water bottle nearby during feeding times to maintain hydration.');
  }

  return tips;
}

/**
 * Format milliliters for display.
 */
export function formatMl(value: number): string {
  if (value >= 1000) {
    const liters = value / 1000;
    return `${liters.toFixed(1)}L`;
  }
  return `${value}ml`;
}

/**
 * Format ounces for display.
 */
export function formatOz(value: number): string {
  return `${value} oz`;
}

/**
 * Format cups for display.
 */
export function formatCups(value: number): string {
  return `${value} cups`;
}
