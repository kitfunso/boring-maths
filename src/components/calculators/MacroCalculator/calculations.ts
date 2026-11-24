import type { MacroCalculatorInputs, MacroCalculatorResult } from './types';
import { activityMultipliers, goalCalorieAdjustment } from './types';

export function calculateMacros(inputs: MacroCalculatorInputs): MacroCalculatorResult {
  const {
    unitSystem,
    gender,
    age,
    weight,
    heightFeet,
    heightInches,
    activityLevel,
    goal,
    proteinRatio,
  } = inputs;

  let weightKg: number;
  let heightCm: number;

  if (unitSystem === 'imperial') {
    weightKg = weight * 0.453592;
    heightCm = (heightFeet * 12 + heightInches) * 2.54;
  } else {
    weightKg = weight;
    heightCm = heightFeet;
  }

  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const tdee = bmr * activityMultipliers[activityLevel];

  const targetCalories = Math.max(1200, tdee + goalCalorieAdjustment[goal]);

  let protein: number;
  if (unitSystem === 'imperial') {
    protein = weight * proteinRatio;
  } else {
    protein = weight * proteinRatio;
  }

  const proteinCalories = protein * 4;

  let fatPercent: number;
  if (goal === 'lose') {
    fatPercent = 0.25;
  } else if (goal === 'gain') {
    fatPercent = 0.3;
  } else {
    fatPercent = 0.28;
  }

  const fatCalories = targetCalories * fatPercent;
  const fat = fatCalories / 9;
  const carbsCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = carbsCalories / 4;
  const actualProteinPercent = (proteinCalories / targetCalories) * 100;
  const actualCarbsPercent = (carbsCalories / targetCalories) * 100;
  const actualFatPercent = (fatCalories / targetCalories) * 100;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    protein: Math.round(protein),
    carbs: Math.max(0, Math.round(carbs)),
    fat: Math.round(fat),
    proteinCalories: Math.round(proteinCalories),
    carbsCalories: Math.max(0, Math.round(carbsCalories)),
    fatCalories: Math.round(fatCalories),
    proteinPercent: Math.round(actualProteinPercent),
    carbsPercent: Math.max(0, Math.round(actualCarbsPercent)),
    fatPercent: Math.round(actualFatPercent),
  };
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
