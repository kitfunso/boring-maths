/**
 * Lye Calculator - Calculation Logic
 */

import type { LyeCalculatorInputs, LyeCalculatorResult } from './types';
import { OILS, LYE_TYPES } from './types';

export function calculateLye(inputs: LyeCalculatorInputs): LyeCalculatorResult {
  const { lyeType, superfatPercent, waterRatio, unit, oils } = inputs;

  // Get lye multiplier (KOH needs more than NaOH)
  const lyeMultiplier = LYE_TYPES.find((l) => l.value === lyeType)?.multiplier || 1.0;

  // Convert to grams for calculation (then convert back if needed)
  const gramsPerOz = 28.3495;
  const toGrams = (weight: number) => (unit === 'oz' ? weight * gramsPerOz : weight);
  const fromGrams = (weight: number) => (unit === 'oz' ? weight / gramsPerOz : weight);

  // Calculate total oil weight
  const totalOilWeight = oils.reduce((sum, o) => sum + o.weight, 0);

  // Calculate lye needed for each oil
  const oilBreakdown = oils.map((oilEntry) => {
    const oilData = OILS.find((o) => o.value === oilEntry.oil);
    const sapValue = oilData?.sapNaOH || 0.135;
    const weightGrams = toGrams(oilEntry.weight);
    const lyeNeededGrams = weightGrams * sapValue * lyeMultiplier;
    const percent = totalOilWeight > 0 ? (oilEntry.weight / totalOilWeight) * 100 : 0;

    return {
      name: oilData?.label || oilEntry.oil,
      weight: oilEntry.weight,
      lyeNeeded: fromGrams(lyeNeededGrams),
      percent: Math.round(percent * 10) / 10,
    };
  });

  // Total lye before superfat
  const totalLyeBeforeSF = oilBreakdown.reduce((sum, o) => sum + o.lyeNeeded, 0);

  // Apply superfat reduction
  const superfatMultiplier = 1 - superfatPercent / 100;
  const lyeAmount = totalLyeBeforeSF * superfatMultiplier;

  // Calculate water
  const lyeAmountGrams = toGrams(lyeAmount);
  const waterAmountGrams = lyeAmountGrams * waterRatio;
  const waterAmount = fromGrams(waterAmountGrams);

  // Total batch weight
  const totalBatchWeight = totalOilWeight + lyeAmount + waterAmount;

  // Superfat amount (oil that won't be saponified)
  const superfatAmount = totalOilWeight * (superfatPercent / 100);

  // Lye concentration (lye / (lye + water) × 100)
  const lyeConcentration = (lyeAmount / (lyeAmount + waterAmount)) * 100;

  return {
    totalOilWeight: Math.round(totalOilWeight * 100) / 100,
    lyeAmount: Math.round(lyeAmount * 100) / 100,
    waterAmount: Math.round(waterAmount * 100) / 100,
    totalBatchWeight: Math.round(totalBatchWeight * 100) / 100,
    superfatAmount: Math.round(superfatAmount * 100) / 100,
    lyeConcentration: Math.round(lyeConcentration * 10) / 10,
    oilBreakdown,
  };
}

export function formatWeight(value: number, unit: string): string {
  return `${value.toFixed(2)} ${unit}`;
}

export function getLyeConcentrationWarning(concentration: number): string | null {
  if (concentration > 35) {
    return 'High lye concentration - may cause faster trace and more heat. Add more water.';
  }
  if (concentration < 25) {
    return 'Low lye concentration - longer cure time needed. Consider reducing water.';
  }
  return null;
}

export function getRecipeWarnings(oils: { name: string; percent: number }[]): string[] {
  const warnings: string[] = [];

  // Check coconut oil percentage
  const coconut = oils.find((o) => o.name.toLowerCase().includes('coconut'));
  if (coconut && coconut.percent > 30) {
    warnings.push('Coconut oil over 30% may be drying. Consider using superfat of 15%+.');
  }

  // Check olive oil for Castile
  const olive = oils.find((o) => o.name.toLowerCase().includes('olive'));
  if (olive && olive.percent === 100) {
    warnings.push('100% Olive oil (Castile) soap needs 6-12 months cure time.');
  }

  // Check for hard oil balance
  const hardOils = ['coconut', 'palm', 'tallow', 'lard', 'cocoa', 'babassu'];
  const hardOilPercent = oils.reduce((sum, o) => {
    const isHard = hardOils.some((h) => o.name.toLowerCase().includes(h));
    return sum + (isHard ? o.percent : 0);
  }, 0);

  if (hardOilPercent < 30) {
    warnings.push('Less than 30% hard oils - soap may be soft. Add more coconut, palm, or tallow.');
  }

  return warnings;
}
