/**
 * Body Fat Calculator - Type Definitions
 *
 * Uses U.S. Navy method for body fat percentage estimation.
 */

export type UnitSystem = 'metric' | 'imperial';
export type Sex = 'male' | 'female';

export interface BodyFatInputs {
  unitSystem: UnitSystem;
  sex: Sex;
  heightCm: number;
  heightFeet: number;
  heightInches: number;
  waistCm: number;
  waistInches: number;
  neckCm: number;
  neckInches: number;
  hipCm: number; // required for female
  hipInches: number;
}

export interface BodyFatResult {
  bodyFatPct: number;
  fatMass: number; // kg or lbs
  leanMass: number;
  category: string;
  categoryColor: 'blue' | 'green' | 'yellow' | 'red';
}

export interface BodyFatCategory {
  name: string;
  maleRange: [number, number];
  femaleRange: [number, number];
  color: 'blue' | 'green' | 'yellow' | 'red';
}

export const BODY_FAT_CATEGORIES: BodyFatCategory[] = [
  { name: 'Essential Fat', maleRange: [2, 6], femaleRange: [10, 14], color: 'blue' },
  { name: 'Athletic', maleRange: [6, 14], femaleRange: [14, 21], color: 'green' },
  { name: 'Fitness', maleRange: [14, 18], femaleRange: [21, 25], color: 'green' },
  { name: 'Average', maleRange: [18, 25], femaleRange: [25, 32], color: 'yellow' },
  { name: 'Obese', maleRange: [25, 100], femaleRange: [32, 100], color: 'red' },
];

export function getDefaultInputs(): BodyFatInputs {
  return {
    unitSystem: 'metric',
    sex: 'male',
    heightCm: 175,
    heightFeet: 5,
    heightInches: 9,
    waistCm: 85,
    waistInches: 33,
    neckCm: 38,
    neckInches: 15,
    hipCm: 95,
    hipInches: 37,
  };
}
