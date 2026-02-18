/**
 * Body Fat Calculator - Calculation Logic
 *
 * U.S. Navy Method:
 * Male: 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
 * Female: 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
 */

import { BODY_FAT_CATEGORIES, type BodyFatInputs, type BodyFatResult } from './types';

function toCm(inches: number): number {
  return inches * 2.54;
}

function round(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function calculateBodyFat(inputs: BodyFatInputs): BodyFatResult {
  const { unitSystem, sex } = inputs;

  // Convert everything to cm
  const height =
    unitSystem === 'metric' ? inputs.heightCm : toCm(inputs.heightFeet * 12 + inputs.heightInches);
  const waist = unitSystem === 'metric' ? inputs.waistCm : toCm(inputs.waistInches);
  const neck = unitSystem === 'metric' ? inputs.neckCm : toCm(inputs.neckInches);
  const hip = unitSystem === 'metric' ? inputs.hipCm : toCm(inputs.hipInches);

  let bodyFatPct: number;

  if (sex === 'male') {
    bodyFatPct = 86.01 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  } else {
    bodyFatPct = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
  }

  bodyFatPct = Math.max(2, Math.min(bodyFatPct, 60));

  // Determine category
  let category = 'Average';
  let categoryColor: BodyFatResult['categoryColor'] = 'yellow';

  for (const cat of BODY_FAT_CATEGORIES) {
    const range = sex === 'male' ? cat.maleRange : cat.femaleRange;
    if (bodyFatPct >= range[0] && bodyFatPct < range[1]) {
      category = cat.name;
      categoryColor = cat.color;
      break;
    }
  }

  // Fat/lean mass — need weight, but we don't have it. Use generic estimate based on height.
  // Actually, let's just return percentages; we don't ask for weight.
  // We can approximate weight from height for display, or just skip mass.
  // Better: return 0 and only show percentage.
  return {
    bodyFatPct: round(bodyFatPct),
    fatMass: 0,
    leanMass: 0,
    category,
    categoryColor,
  };
}
