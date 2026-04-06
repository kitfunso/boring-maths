/**
 * Water Intake Calculator - Type Definitions
 */

export type WeightUnit = 'kg' | 'lbs';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

export type Climate = 'temperate' | 'hot' | 'cold' | 'humid';

export interface WaterIntakeInputs {
  bodyWeight: number;
  unit: WeightUnit;
  activityLevel: ActivityLevel;
  climate: Climate;
  isPregnant: boolean;
  isBreastfeeding: boolean;
}

export interface WaterIntakeResult {
  dailyIntakeMl: number;
  dailyIntakeOz: number;
  dailyIntakeCups: number;
  hourlyIntakeMl: number;
  exerciseAdditionMl: number;
  pregnancyAdditionMl: number;
  totalWithExerciseMl: number;
  comparedToEightGlasses: number;
  hydrationTips: string[];
}

export const ACTIVITY_LEVELS: {
  value: ActivityLevel;
  label: string;
  description: string;
}[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
  { value: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Active', description: 'Hard exercise 6-7 days/week' },
  { value: 'veryActive', label: 'Very Active', description: 'Intense exercise or physical job' },
];

export const CLIMATE_OPTIONS: {
  value: Climate;
  label: string;
  description: string;
}[] = [
  { value: 'temperate', label: 'Temperate', description: 'Mild, comfortable climate' },
  { value: 'hot', label: 'Hot', description: 'Hot or dry climate' },
  { value: 'cold', label: 'Cold', description: 'Cold climate' },
  { value: 'humid', label: 'Humid', description: 'Hot and humid climate' },
];

export function getDefaultInputs(): WaterIntakeInputs {
  return {
    bodyWeight: 70,
    unit: 'kg',
    activityLevel: 'moderate',
    climate: 'temperate',
    isPregnant: false,
    isBreastfeeding: false,
  };
}
