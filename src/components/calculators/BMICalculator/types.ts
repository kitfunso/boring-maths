/**
 * BMI Calculator - Type Definitions
 *
 * Calculates Body Mass Index with health category classifications.
 */

export type UnitSystem = 'metric' | 'imperial';

export interface BMIInputs {
  unitSystem: UnitSystem;
  /** Height in cm (metric) or feet & inches (imperial) */
  heightCm: number;
  heightFeet: number;
  heightInches: number;
  /** Weight in kg (metric) or lbs (imperial) */
  weightKg: number;
  weightLbs: number;
}

export interface BMICategory {
  name: string;
  range: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
  min: number;
  max: number;
}

export interface BMIResult {
  bmi: number;
  category: string;
  categoryColor: 'blue' | 'green' | 'yellow' | 'red';
  healthyWeightRange: { min: number; max: number };
  weightToHealthy: number; // positive = lose, negative = gain
  isHealthy: boolean;
}

export const BMI_CATEGORIES: BMICategory[] = [
  { name: 'Underweight', range: 'Below 18.5', color: 'blue', min: 0, max: 18.5 },
  { name: 'Normal', range: '18.5 - 24.9', color: 'green', min: 18.5, max: 25 },
  { name: 'Overweight', range: '25 - 29.9', color: 'yellow', min: 25, max: 30 },
  { name: 'Obese', range: '30+', color: 'red', min: 30, max: 100 },
];

export function getDefaultInputs(): BMIInputs {
  return {
    unitSystem: 'metric',
    heightCm: 170,
    heightFeet: 5,
    heightInches: 7,
    weightKg: 70,
    weightLbs: 154,
  };
}

export const DEFAULT_INPUTS: BMIInputs = getDefaultInputs();
