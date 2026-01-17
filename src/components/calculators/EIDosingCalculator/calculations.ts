/**
 * EI Dosing Calculator Calculations
 * Estimative Index fertilization for planted aquariums
 */

import type { EIDosingInputs, EIDosingResults } from './types';
import { FERTILIZERS, DOSING_SCHEDULES } from './types';

/**
 * Calculate grams of fertilizer needed for target ppm
 * Formula: grams = (ppm × liters) / (nutrient% × 1000)
 */
function gramsForPpm(targetPpm: number, liters: number, nutrientPercent: number): number {
  return (targetPpm * liters) / (nutrientPercent * 10);
}

/**
 * Calculate ppm achieved from grams of fertilizer
 */
function ppmFromGrams(grams: number, liters: number, nutrientPercent: number): number {
  return (grams * nutrientPercent * 10) / liters;
}

/**
 * Main EI dosing calculation
 */
export function calculateEIDosing(inputs: EIDosingInputs): EIDosingResults {
  // Convert to liters for calculations
  let liters = inputs.tankVolume;
  if (inputs.volumeUnit === 'gallons') {
    liters = inputs.tankVolume * 3.78541;
  }

  // Get target ppms from schedule or custom
  const schedule = DOSING_SCHEDULES.find((s) => s.value === inputs.dosingSched);
  const no3Target = inputs.dosingSched === 'custom' ? inputs.nitrateTarget : schedule?.no3 || 20;
  const po4Target = inputs.dosingSched === 'custom' ? inputs.phosphateTarget : schedule?.po4 || 2;
  const kTarget = inputs.dosingSched === 'custom' ? inputs.potassiumTarget : schedule?.k || 20;
  const feTarget = inputs.dosingSched === 'custom' ? inputs.ironTarget : schedule?.fe || 0.3;

  // Calculate weekly amounts needed
  // KNO3 for nitrate (also contributes K)
  const kno3Weekly = gramsForPpm(no3Target, liters, FERTILIZERS.kno3.no3Percent);
  const kFromKno3 = ppmFromGrams(kno3Weekly, liters, FERTILIZERS.kno3.kPercent);

  // KH2PO4 for phosphate (also contributes K)
  const kh2po4Weekly = gramsForPpm(po4Target, liters, FERTILIZERS.kh2po4.po4Percent);
  const kFromKh2po4 = ppmFromGrams(kh2po4Weekly, liters, FERTILIZERS.kh2po4.kPercent);

  // K2SO4 for remaining potassium
  const remainingK = Math.max(0, kTarget - kFromKno3 - kFromKh2po4);
  const k2so4Weekly = gramsForPpm(remainingK, liters, FERTILIZERS.k2so4.kPercent);

  // MgSO4 - typically 5-10 ppm Mg per week (standard EI)
  const mgTarget = 5; // ppm
  const mgso4Weekly = gramsForPpm(mgTarget, liters, FERTILIZERS.mgso4.mgPercent);

  // CSM+B for iron (and other traces)
  const csmBWeekly = gramsForPpm(feTarget, liters, FERTILIZERS.csmB.fePercent);

  // EI dosing is 3x per week for macros, 3x for micros (alternating days)
  // Some people dose macros and micros on same days (3x)
  const dosesPerWeek = 3;

  const kno3PerDose = kno3Weekly / dosesPerWeek;
  const kh2po4PerDose = kh2po4Weekly / dosesPerWeek;
  const k2so4PerDose = k2so4Weekly / dosesPerWeek;
  const mgso4PerDose = mgso4Weekly / dosesPerWeek;
  const csmBPerDose = csmBWeekly / dosesPerWeek;

  // Calculate actual ppm achieved
  const nitrateAchieved = ppmFromGrams(kno3Weekly, liters, FERTILIZERS.kno3.no3Percent);
  const phosphateAchieved = ppmFromGrams(kh2po4Weekly, liters, FERTILIZERS.kh2po4.po4Percent);
  const potassiumAchieved =
    kFromKno3 + kFromKh2po4 + ppmFromGrams(k2so4Weekly, liters, FERTILIZERS.k2so4.kPercent);
  const ironAchieved = ppmFromGrams(csmBWeekly, liters, FERTILIZERS.csmB.fePercent);

  // Determine display unit
  const doseUnit = inputs.fertilizerType === 'dry' ? 'grams' : 'mL';

  return {
    kno3PerDose: Math.round(kno3PerDose * 100) / 100,
    kh2po4PerDose: Math.round(kh2po4PerDose * 100) / 100,
    k2so4PerDose: Math.round(k2so4PerDose * 100) / 100,
    mgso4PerDose: Math.round(mgso4PerDose * 100) / 100,
    csmBPerDose: Math.round(csmBPerDose * 100) / 100,
    kno3Weekly: Math.round(kno3Weekly * 100) / 100,
    kh2po4Weekly: Math.round(kh2po4Weekly * 100) / 100,
    k2so4Weekly: Math.round(k2so4Weekly * 100) / 100,
    mgso4Weekly: Math.round(mgso4Weekly * 100) / 100,
    csmBWeekly: Math.round(csmBWeekly * 100) / 100,
    nitrateAchieved: Math.round(nitrateAchieved * 10) / 10,
    phosphateAchieved: Math.round(phosphateAchieved * 100) / 100,
    potassiumAchieved: Math.round(potassiumAchieved * 10) / 10,
    ironAchieved: Math.round(ironAchieved * 100) / 100,
    doseUnit,
  };
}

/**
 * Convert grams to teaspoons for common fertilizers
 */
export function gramsToTeaspoons(grams: number, fertilizer: keyof typeof FERTILIZERS): number {
  const gramsPerTsp = FERTILIZERS[fertilizer].gramsPerTsp;
  return Math.round((grams / gramsPerTsp) * 100) / 100;
}

/**
 * Format dose with teaspoon equivalent
 */
export function formatDose(grams: number, fertilizer: keyof typeof FERTILIZERS): string {
  const tsp = gramsToTeaspoons(grams, fertilizer);
  if (tsp < 0.1) {
    return `${grams.toFixed(2)}g (${(tsp * 4).toFixed(2)} ¼tsp)`;
  }
  return `${grams.toFixed(2)}g (~${tsp.toFixed(2)} tsp)`;
}
