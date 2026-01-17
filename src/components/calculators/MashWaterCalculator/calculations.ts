/**
 * Mash Water Calculator Calculations
 * Strike water temperature and sparge volume calculations
 */

import type { MashWaterInputs, MashWaterResults } from './types';

/**
 * Calculate strike water temperature
 * Formula: Strike Temp = ((R × (T2 - T1)) / R) + T2
 * Where R = ratio of water to grain (qt/lb), T1 = grain temp, T2 = target mash temp
 * Simplified: Strike = (0.2 / R) × (T2 - T1) + T2
 * The 0.2 is the thermal mass ratio of grain to water
 */
function calculateStrikeTemp(
  targetMashTemp: number,
  grainTemp: number,
  mashThickness: number
): number {
  // Strike water temp formula
  // The constant 0.2 represents grain's thermal mass relative to water
  const strikeTemp = ((0.2 / mashThickness) * (targetMashTemp - grainTemp)) + targetMashTemp;
  return strikeTemp;
}

/**
 * Convert temperature between F and C
 */
function convertTemp(temp: number, from: 'fahrenheit' | 'celsius', to: 'fahrenheit' | 'celsius'): number {
  if (from === to) return temp;
  if (from === 'fahrenheit') return (temp - 32) * 5 / 9;
  return (temp * 9 / 5) + 32;
}

/**
 * Main mash water calculation
 */
export function calculateMashWater(inputs: MashWaterInputs): MashWaterResults {
  // Work in imperial units internally (qt/lb, gallons, Fahrenheit)
  let grainWeight = inputs.grainWeight;
  let grainTemp = inputs.grainTemp;
  let targetMashTemp = inputs.targetMashTemp;
  let mashThickness = inputs.mashThickness;
  let grainAbsorption = inputs.grainAbsorption;
  let equipmentLoss = inputs.equipmentLoss;
  let evaporationRate = inputs.evaporationRate;
  let preboilVolume = inputs.preboilVolume;

  // Convert to imperial if needed
  if (inputs.weightUnit === 'kg') {
    grainWeight = grainWeight * 2.20462; // kg to lbs
  }
  if (inputs.tempUnit === 'celsius') {
    grainTemp = convertTemp(grainTemp, 'celsius', 'fahrenheit');
    targetMashTemp = convertTemp(targetMashTemp, 'celsius', 'fahrenheit');
  }
  if (inputs.volumeUnit === 'liters') {
    equipmentLoss = equipmentLoss * 0.264172; // L to gal
    evaporationRate = evaporationRate * 0.264172;
    preboilVolume = preboilVolume * 0.264172;
    // Convert L/kg to qt/lb
    mashThickness = mashThickness * 0.479306;
    grainAbsorption = grainAbsorption * 0.479306;
  }

  // Calculate strike water temperature
  const strikeWaterTemp = calculateStrikeTemp(targetMashTemp, grainTemp, mashThickness);

  // Calculate strike water volume (quarts, then convert to gallons)
  const strikeWaterQuarts = grainWeight * mashThickness;
  const strikeWaterVolume = strikeWaterQuarts / 4; // convert to gallons

  // Total mash volume (approximate - grain displacement)
  // Grain displaces about 0.08 gal/lb
  const grainDisplacement = grainWeight * 0.08;
  const totalMashVolume = strikeWaterVolume + grainDisplacement;

  // Water absorbed by grain
  const waterAbsorbedQuarts = grainWeight * grainAbsorption;
  const waterAbsorbedByGrain = waterAbsorbedQuarts / 4;

  // First runnings (after draining mash)
  const firstRunningsVolume = strikeWaterVolume - waterAbsorbedByGrain - equipmentLoss;

  // Calculate boil-off
  const boilOff = evaporationRate * (inputs.boilTime / 60);

  // Post-boil volume target
  const postBoilVolume = preboilVolume - boilOff;

  // Sparge water needed
  let spargeWaterVolume = 0;
  let spargeWaterPerBatch = 0;

  if (inputs.spargeType !== 'no-sparge') {
    // Need enough to hit pre-boil target
    spargeWaterVolume = preboilVolume - firstRunningsVolume;
    spargeWaterVolume = Math.max(0, spargeWaterVolume);

    if (inputs.spargeType === 'batch' && inputs.batchSpargeCount > 0) {
      spargeWaterPerBatch = spargeWaterVolume / inputs.batchSpargeCount;
    }
  }

  // Total water needed
  const totalWaterNeeded = strikeWaterVolume + spargeWaterVolume;

  // Convert results back to user's units
  let resultStrikeTemp = strikeWaterTemp;
  let resultStrikeVolume = strikeWaterVolume;
  let resultMashVolume = totalMashVolume;
  let resultAbsorbed = waterAbsorbedByGrain;
  let resultFirstRunnings = firstRunningsVolume;
  let resultSpargeVolume = spargeWaterVolume;
  let resultSpargePerBatch = spargeWaterPerBatch;
  let resultTotalWater = totalWaterNeeded;
  let resultPostBoil = postBoilVolume;

  if (inputs.tempUnit === 'celsius') {
    resultStrikeTemp = convertTemp(strikeWaterTemp, 'fahrenheit', 'celsius');
  }

  if (inputs.volumeUnit === 'liters') {
    resultStrikeVolume = strikeWaterVolume * 3.78541;
    resultMashVolume = totalMashVolume * 3.78541;
    resultAbsorbed = waterAbsorbedByGrain * 3.78541;
    resultFirstRunnings = firstRunningsVolume * 3.78541;
    resultSpargeVolume = spargeWaterVolume * 3.78541;
    resultSpargePerBatch = spargeWaterPerBatch * 3.78541;
    resultTotalWater = totalWaterNeeded * 3.78541;
    resultPostBoil = postBoilVolume * 3.78541;
  }

  return {
    strikeWaterTemp: Math.round(resultStrikeTemp * 10) / 10,
    strikeWaterVolume: Math.round(resultStrikeVolume * 100) / 100,
    totalMashVolume: Math.round(resultMashVolume * 100) / 100,
    waterAbsorbedByGrain: Math.round(resultAbsorbed * 100) / 100,
    firstRunningsVolume: Math.round(resultFirstRunnings * 100) / 100,
    spargeWaterVolume: Math.round(resultSpargeVolume * 100) / 100,
    spargeWaterPerBatch: Math.round(resultSpargePerBatch * 100) / 100,
    totalWaterNeeded: Math.round(resultTotalWater * 100) / 100,
    postBoilVolume: Math.round(resultPostBoil * 100) / 100,
    tempUnit: inputs.tempUnit === 'celsius' ? '°C' : '°F',
    volumeUnit: inputs.volumeUnit === 'liters' ? 'L' : 'gal',
  };
}

/**
 * Format temperature with unit
 */
export function formatTemp(temp: number, unit: string): string {
  return `${temp}${unit}`;
}

/**
 * Format volume with unit
 */
export function formatVolume(volume: number, unit: string): string {
  return `${volume} ${unit}`;
}
