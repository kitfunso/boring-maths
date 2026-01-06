/**
 * BMI Calculator - Calculation Logic
 *
 * BMI = weight (kg) / height (m)^2
 */

import type { BMIInputs, BMIResult, BMICategory } from './types';
import { BMI_CATEGORIES } from './types';

function round(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Convert imperial height to cm
 */
function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return totalInches * 2.54;
}

/**
 * Convert lbs to kg
 */
function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

/**
 * Convert kg to lbs
 */
function kgToLbs(kg: number): number {
  return kg / 0.453592;
}

/**
 * Get BMI category from value
 */
function getCategory(bmi: number): BMICategory {
  for (const category of BMI_CATEGORIES) {
    if (bmi >= category.min && bmi < category.max) {
      return category;
    }
  }
  return BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}

/**
 * Calculate BMI and health metrics
 */
export function calculateBMI(inputs: BMIInputs): BMIResult {
  const { unitSystem, heightCm, heightFeet, heightInches, weightKg, weightLbs } = inputs;

  // Convert to metric for calculation
  let heightM: number;
  let weight: number;

  if (unitSystem === 'metric') {
    heightM = heightCm / 100;
    weight = weightKg;
  } else {
    heightM = feetInchesToCm(heightFeet, heightInches) / 100;
    weight = lbsToKg(weightLbs);
  }

  // Calculate BMI
  const bmi = weight / (heightM * heightM);

  // Get category
  const category = getCategory(bmi);

  // Calculate healthy weight range (BMI 18.5-24.9)
  const healthyMinKg = 18.5 * heightM * heightM;
  const healthyMaxKg = 24.9 * heightM * heightM;

  // Convert back to user's unit system
  let healthyMin: number;
  let healthyMax: number;
  let weightToHealthy: number;

  if (unitSystem === 'metric') {
    healthyMin = round(healthyMinKg, 1);
    healthyMax = round(healthyMaxKg, 1);
    if (weight < healthyMinKg) {
      weightToHealthy = round(healthyMinKg - weight, 1);
    } else if (weight > healthyMaxKg) {
      weightToHealthy = round(weight - healthyMaxKg, 1);
    } else {
      weightToHealthy = 0;
    }
  } else {
    healthyMin = round(kgToLbs(healthyMinKg), 1);
    healthyMax = round(kgToLbs(healthyMaxKg), 1);
    if (weight < healthyMinKg) {
      weightToHealthy = round(kgToLbs(healthyMinKg - weight), 1);
    } else if (weight > healthyMaxKg) {
      weightToHealthy = round(kgToLbs(weight - healthyMaxKg), 1);
    } else {
      weightToHealthy = 0;
    }
  }

  return {
    bmi: round(bmi, 1),
    category: category.name,
    categoryColor: category.color,
    healthyWeightRange: { min: healthyMin, max: healthyMax },
    weightToHealthy,
    isHealthy: category.name === 'Normal',
  };
}
