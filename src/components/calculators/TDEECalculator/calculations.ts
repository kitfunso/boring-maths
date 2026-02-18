/**
 * TDEE Calculator - Calculation Logic
 *
 * Uses Mifflin-St Jeor equation (most accurate for most people):
 * Male: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 5 + 5
 * Female: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
 */

import { ACTIVITY_LEVELS, type TDEEInputs, type TDEEResult, type MacroSplit } from './types';

function round(value: number): number {
  return Math.round(value);
}

function getWeightKg(inputs: TDEEInputs): number {
  return inputs.unitSystem === 'metric' ? inputs.weightKg : inputs.weightLbs * 0.453592;
}

function getHeightCm(inputs: TDEEInputs): number {
  return inputs.unitSystem === 'metric'
    ? inputs.heightCm
    : inputs.heightFeet * 30.48 + inputs.heightInches * 2.54;
}

function calculateMacroSplits(tdee: number): MacroSplit[] {
  const calPerGProtein = 4;
  const calPerGCarb = 4;
  const calPerGFat = 9;

  const splits = [
    { name: 'Balanced', proteinPct: 30, carbsPct: 40, fatPct: 30 },
    { name: 'Low Carb', proteinPct: 40, carbsPct: 20, fatPct: 40 },
    { name: 'High Carb', proteinPct: 25, carbsPct: 55, fatPct: 20 },
    { name: 'Keto', proteinPct: 25, carbsPct: 5, fatPct: 70 },
  ];

  return splits.map((s) => ({
    name: s.name,
    protein: round((tdee * s.proteinPct) / 100 / calPerGProtein),
    carbs: round((tdee * s.carbsPct) / 100 / calPerGCarb),
    fat: round((tdee * s.fatPct) / 100 / calPerGFat),
    proteinPct: s.proteinPct,
    carbsPct: s.carbsPct,
    fatPct: s.fatPct,
  }));
}

export function calculateTDEE(inputs: TDEEInputs): TDEEResult {
  const weightKg = getWeightKg(inputs);
  const heightCm = getHeightCm(inputs);
  const { sex, age, activityLevel } = inputs;

  // Mifflin-St Jeor
  const bmr =
    sex === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const multiplier = ACTIVITY_LEVELS[activityLevel].multiplier;
  const tdee = bmr * multiplier;

  return {
    bmr: round(bmr),
    tdee: round(tdee),
    activityMultiplier: multiplier,
    macroSplits: calculateMacroSplits(round(tdee)),
    goalCalories: {
      lose: round(tdee - 500),
      maintain: round(tdee),
      gain: round(tdee + 500),
    },
  };
}
