import type { PrimingSugarInputs, PrimingSugarResults } from './types';
import { SUGAR_TYPES, RESIDUAL_CO2_TABLE } from './types';

function getResidualCO2(tempF: number): number {
  const clampedTemp = Math.max(32, Math.min(80, tempF));

  const lowerTemp = Math.floor(clampedTemp / 2) * 2;
  const upperTemp = lowerTemp + 2;

  const lowerCO2 = RESIDUAL_CO2_TABLE[lowerTemp] || 0.85;
  const upperCO2 = RESIDUAL_CO2_TABLE[upperTemp] || 0.85;

  const fraction = (clampedTemp - lowerTemp) / 2;
  return lowerCO2 + (upperCO2 - lowerCO2) * fraction;
}

function toFahrenheit(temp: number, unit: 'fahrenheit' | 'celsius'): number {
  if (unit === 'celsius') {
    return (temp * 9) / 5 + 32;
  }
  return temp;
}

export function calculatePrimingSugar(inputs: PrimingSugarInputs): PrimingSugarResults {
  let volumeGallons = inputs.batchVolume;
  if (inputs.volumeUnit === 'liters') {
    volumeGallons = inputs.batchVolume / 3.78541;
  }

  const tempF = toFahrenheit(inputs.beerTemp, inputs.tempUnit);

  const residualCO2 = getResidualCO2(tempF);

  const addedCO2 = Math.max(0, inputs.targetCO2 - residualCO2);

  const sugarType = SUGAR_TYPES.find((s) => s.value === inputs.sugarType);
  const gramsPerGalVol = sugarType?.gramsPerGalVol || 4.0;

  const sugarGrams = volumeGallons * addedCO2 * gramsPerGalVol;

  const bottlesPerBatch = volumeGallons / 0.03125;
  const gramsPerBottle = sugarGrams / bottlesPerBatch;

  const sugarAlternatives = SUGAR_TYPES.filter((s) => s.value !== inputs.sugarType)
    .slice(0, 4)
    .map((s) => ({
      name: s.label,
      amount: Math.round(volumeGallons * addedCO2 * s.gramsPerGalVol * 10) / 10,
      unit: 'g',
    }));

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

  let sugarAmount = sugarGrams;
  let sugarUnit = 'g';
  const gramsPerBottleValue = gramsPerBottle;

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

export function formatCO2(volumes: number): string {
  return `${volumes.toFixed(2)} vol`;
}
