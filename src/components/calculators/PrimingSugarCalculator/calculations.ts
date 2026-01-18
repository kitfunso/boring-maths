/**
 * Priming Sugar Calculator Calculations
 * Based on standard carbonation formulas
 */

import type { PrimingSugarInputs, PrimingSugarResults } from './types';
import { SUGAR_TYPES, RESIDUAL_CO2_TABLE } from './types';

/**
 * Get residual CO2 from temperature
 * Uses linear interpolation between table values
 */
function getResidualCO2(tempF: number): number {
  // Clamp to table range
  const clampedTemp = Math.max(32, Math.min(80, tempF));

  // Find surrounding values
  const lowerTemp = Math.floor(clampedTemp / 2) * 2;
  const upperTemp = lowerTemp + 2;

  const lowerCO2 = RESIDUAL_CO2_TABLE[lowerTemp] || 0.85;
  const upperCO2 = RESIDUAL_CO2_TABLE[upperTemp] || 0.85;

  // Linear interpolation
  const fraction = (clampedTemp - lowerTemp) / 2;
  return lowerCO2 + (upperCO2 - lowerCO2) * fraction;
}

/**
 * Convert temperature to Fahrenheit
 */
function toFahrenheit(temp: number, unit: 'fahrenheit' | 'celsius'): number {
  if (unit === 'celsius') {
    return (temp * 9) / 5 + 32;
  }
  return temp;
}

/**
 * Calculate priming sugar amount
 */
export function calculatePrimingSugar(inputs: PrimingSugarInputs): PrimingSugarResults {
  // Convert to standard units (gallons, Fahrenheit)
  let volumeGallons = inputs.batchVolume;
  if (inputs.volumeUnit === 'liters') {
    volumeGallons = inputs.batchVolume / 3.78541;
  }

  const tempF = toFahrenheit(inputs.beerTemp, inputs.tempUnit);

  // Get residual CO2 based on beer temperature
  const residualCO2 = getResidualCO2(tempF);

  // Calculate additional CO2 needed
  const addedCO2 = Math.max(0, inputs.targetCO2 - residualCO2);

  // Get sugar factor
  const sugarType = SUGAR_TYPES.find((s) => s.value === inputs.sugarType);
  const gramsPerGalVol = sugarType?.gramsPerGalVol || 4.0;

  // Calculate sugar needed (grams)
  // Formula: grams = gallons × volumes_needed × grams_per_gal_vol
  const sugarGrams = volumeGallons * addedCO2 * gramsPerGalVol;

  // Calculate sugar per bottle (assuming 12oz bottles, ~0.03125 gal)
  const bottlesPerBatch = volumeGallons / 0.03125; // approximately 32 per gallon
  const gramsPerBottle = sugarGrams / bottlesPerBatch;

  // Calculate alternatives
  const sugarAlternatives = SUGAR_TYPES.filter((s) => s.value !== inputs.sugarType)
    .slice(0, 4)
    .map((s) => ({
      name: s.label,
      amount: Math.round(volumeGallons * addedCO2 * s.gramsPerGalVol * 10) / 10,
      unit: 'g',
    }));

  // Generate warnings
  const warnings: string[] = [];

  if (inputs.targetCO2 > 3.5) {
    warnings.push('High carbonation level - ensure bottles can handle pressure');
  }

  if (inputs.targetCO2 > 4.0) {
    warnings.push('Very high CO2 - risk of bottle bombs, consider Belgian bottles');
  }

  if (addedCO2 <= 0) {
    warnings.push('Beer already has sufficient CO2 at this temperature');
  }

  if (tempF > 70) {
    warnings.push('Warm beer may not carbonate evenly - consider chilling first');
  }

  if (inputs.containerType === 'keg') {
    warnings.push('For kegs, consider force carbonating instead of priming');
  }

  // Determine units for display
  let sugarAmount = sugarGrams;
  let sugarUnit = 'g';
  const gramsPerBottleValue = gramsPerBottle;

  // Convert to oz if amount is large enough
  if (sugarGrams > 100) {
    sugarAmount = sugarGrams / 28.3495;
    sugarUnit = 'oz';
  }

  return {
    sugarAmount: Math.round(sugarAmount * 10) / 10,
    sugarUnit,
    sugarPerBottle: Math.round(gramsPerBottleValue * 100) / 100,
    bottleUnit: 'g',
    residualCO2: Math.round(residualCO2 * 100) / 100,
    addedCO2: Math.round(addedCO2 * 100) / 100,
    totalCO2: Math.round(inputs.targetCO2 * 100) / 100,
    sugarAlternatives,
    warnings,
  };
}

/**
 * Format CO2 volumes
 */
export function formatCO2(volumes: number): string {
  return `${volumes.toFixed(2)} vol`;
}
