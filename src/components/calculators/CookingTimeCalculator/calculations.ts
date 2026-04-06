/**
 * Cooking Time Calculator - Calculation Logic
 */

import type { CookingTimeInputs, CookingTimeResult } from './types';
import { COOKING_DATA, DONENESS_MEATS, DONENESS_INTERNAL_TEMPS } from './types';

const LBS_PER_KG = 2.20462;

function fToC(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

/**
 * Calculate cooking time and temperatures from inputs.
 */
export function calculateCookingTime(inputs: CookingTimeInputs): CookingTimeResult {
  const { meatType, weight, weightUnit, cookingMethod, doneness } = inputs;

  // Convert to pounds for calculation
  const weightLbs = weightUnit === 'kg' ? weight * LBS_PER_KG : weight;

  const data = COOKING_DATA[meatType][cookingMethod];

  // Determine internal temperature
  let internalTempF = data.internalTempF;
  if (DONENESS_MEATS.includes(meatType)) {
    internalTempF = DONENESS_INTERNAL_TEMPS[doneness];
  }

  // Adjust minutes per pound based on doneness for beef/lamb
  let minutesPerPound = data.minutesPerPound;
  if (DONENESS_MEATS.includes(meatType)) {
    const donenessMultiplier: Record<string, number> = {
      'rare': 0.75,
      'medium-rare': 0.85,
      'medium': 1.0,
      'medium-well': 1.1,
      'well-done': 1.25,
    };
    minutesPerPound = Math.round(data.minutesPerPound * (donenessMultiplier[doneness] ?? 1));
  }

  const totalMinutes = Math.max(1, Math.round(minutesPerPound * weightLbs));
  const hours = totalMinutes / 60;

  const ovenTempF = data.ovenTempF;
  const ovenTempC = ovenTempF > 0 ? fToC(ovenTempF) : 0;

  // Build method-specific notes
  const notes: string[] = [...data.notes];

  if (cookingMethod === 'slow-cooker') {
    const slowCookerHours = Math.round(hours * 10) / 10;
    if (slowCookerHours > 2) {
      notes.unshift(`Total slow cooker time: approximately ${slowCookerHours.toFixed(1)} hours on LOW.`);
    }
  }

  if (DONENESS_MEATS.includes(meatType)) {
    notes.push(`Pull at ${internalTempF}F (${fToC(internalTempF)}C) internal; temperature rises during rest.`);
  }

  return {
    totalMinutes,
    hours: Math.round(hours * 100) / 100,
    temperatureF: ovenTempF,
    temperatureC: ovenTempC,
    internalTempF,
    internalTempC: fToC(internalTempF),
    restingMinutes: data.restingMinutes,
    minutesPerPound,
    notes,
  };
}

/**
 * Format total minutes as a human-readable time string.
 */
export function formatTime(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (m === 0) {
    return `${h} hr`;
  }
  return `${h} hr ${m} min`;
}
