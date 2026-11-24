import type { ABVInputs, ABVResult } from './types';

export function calculateABV(inputs: ABVInputs): ABVResult {
  const { temperatureCorrection, measurementTemp, calibrationTemp } = inputs;
  let { originalGravity, finalGravity } = inputs;

  if (temperatureCorrection) {
    originalGravity = correctGravity(originalGravity, measurementTemp, calibrationTemp);
    finalGravity = correctGravity(finalGravity, measurementTemp, calibrationTemp);
  }

  const abv = (originalGravity - finalGravity) * 131.25;

  const abw = abv * 0.79336;

  const originalPlato = sgToPlato(originalGravity);
  const finalPlato = sgToPlato(finalGravity);

  const apparentAttenuation = ((originalGravity - finalGravity) / (originalGravity - 1)) * 100;

  const realExtract = 0.1808 * originalPlato + 0.8192 * finalPlato;
  const realAttenuation = ((originalPlato - realExtract) / originalPlato) * 100;

  const residualSugar = Math.max(0, (finalGravity - 1) * 1000);

  const caloriesPerOz = (6.9 * abw + 4 * (realExtract - 0.1)) * finalGravity;
  const caloriesPerServing = Math.round(caloriesPerOz * 12);
  const calories = Math.round(caloriesPerOz * 100) / 100;

  return {
    abv: Math.round(abv * 100) / 100,
    abw: Math.round(abw * 100) / 100,
    apparentAttenuation: Math.round(apparentAttenuation * 10) / 10,
    realAttenuation: Math.round(realAttenuation * 10) / 10,
    calories,
    caloriesPerServing,
    residualSugar: Math.round(residualSugar * 10) / 10,
    originalPlato: Math.round(originalPlato * 10) / 10,
    finalPlato: Math.round(finalPlato * 10) / 10,
  };
}

function correctGravity(sg: number, measuredTemp: number, calibrationTemp: number): number {
  const correction =
    0.00130346 -
    0.000134722124 * measuredTemp +
    0.00000204052596 * Math.pow(measuredTemp, 2) -
    0.00000000232820948 * Math.pow(measuredTemp, 3);

  const calibrationCorrection =
    0.00130346 -
    0.000134722124 * calibrationTemp +
    0.00000204052596 * Math.pow(calibrationTemp, 2) -
    0.00000000232820948 * Math.pow(calibrationTemp, 3);

  return sg + (correction - calibrationCorrection);
}

function sgToPlato(sg: number): number {
  return -1 * 616.868 + 1111.14 * sg - 630.272 * Math.pow(sg, 2) + 135.997 * Math.pow(sg, 3);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatABV(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function getABVCategory(abv: number): { label: string; color: string } {
  if (abv < 3.5) return { label: 'Session Strength', color: 'text-blue-400' };
  if (abv < 5.5) return { label: 'Standard Strength', color: 'text-green-400' };
  if (abv < 8) return { label: 'Strong', color: 'text-yellow-400' };
  if (abv < 12) return { label: 'Very Strong', color: 'text-orange-400' };
  return { label: 'Wine Strength', color: 'text-red-400' };
}

export function getAttenuationRating(attenuation: number): { label: string; color: string } {
  if (attenuation < 65) return { label: 'Low (sweet finish)', color: 'text-purple-400' };
  if (attenuation < 75) return { label: 'Medium', color: 'text-green-400' };
  if (attenuation < 85) return { label: 'High (dry finish)', color: 'text-yellow-400' };
  return { label: 'Very High (very dry)', color: 'text-orange-400' };
}
