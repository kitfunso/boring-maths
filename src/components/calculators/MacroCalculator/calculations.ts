/**
 * Macro Calculator Calculations
 *
 * Calculate BMR, TDEE, and macronutrient targets based on user inputs.
 */

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

  // Convert to metric for calculations
  let weightKg: number;
  let heightCm: number;

  if (unitSystem === 'imperial') {
    weightKg = weight * 0.453592;
    heightCm = (heightFeet * 12 + heightInches) * 2.54;
  } else {
    weightKg = weight;
    heightCm = heightFeet; // In metric mode, heightFeet stores cm
  }

  // Calculate BMR using Mifflin-St Jeor Equation (most accurate for modern populations)
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  // Calculate TDEE (Total Daily Energy Expenditure)
  const tdee = bmr * activityMultipliers[activityLevel];

  // Adjust calories based on goal
  const targetCalories = Math.max(1200, tdee + goalCalorieAdjustment[goal]);

  // Calculate protein based on body weight
  // proteinRatio is grams per lb (imperial) or grams per kg (metric)
  let protein: number;
  if (unitSystem === 'imperial') {
    protein = weight * proteinRatio;
  } else {
    protein = weight * proteinRatio;
  }

  // Protein provides 4 calories per gram
  const proteinCalories = protein * 4;

  // Fat should be 25-35% of calories, we'll use 30% for balanced approach
  // Adjusted based on goal
  let fatPercent: number;
  if (goal === 'lose') {
    fatPercent = 0.25; // Lower fat when cutting
  } else if (goal === 'gain') {
    fatPercent = 0.30; // Moderate fat when bulking
  } else {
    fatPercent = 0.28; // Balanced for maintenance
  }

  const fatCalories = targetCalories * fatPercent;
  const fat = fatCalories / 9; // Fat provides 9 calories per gram

  // Remaining calories go to carbs
  const carbsCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = carbsCalories / 4; // Carbs provide 4 calories per gram

  // Calculate actual percentages
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
