import type { MashWaterInputs, MashWaterResults } from './types';

function calculateStrikeTemp(
  targetMashTemp: number,
  grainTemp: number,
  mashThickness: number
): number {
  const strikeTemp = (0.2 / mashThickness) * (targetMashTemp - grainTemp) + targetMashTemp;
  return strikeTemp;
}

function convertTemp(
  temp: number,
  from: 'fahrenheit' | 'celsius',
  to: 'fahrenheit' | 'celsius'
): number {
  if (from === to) return temp;
  if (from === 'fahrenheit') return ((temp - 32) * 5) / 9;
  return (temp * 9) / 5 + 32;
}

export function calculateMashWater(inputs: MashWaterInputs): MashWaterResults {
  let grainWeight = inputs.grainWeight;
  let grainTemp = inputs.grainTemp;
  let targetMashTemp = inputs.targetMashTemp;
  let mashThickness = inputs.mashThickness;
  let grainAbsorption = inputs.grainAbsorption;
  let equipmentLoss = inputs.equipmentLoss;
  let evaporationRate = inputs.evaporationRate;
  let preboilVolume = inputs.preboilVolume;

  if (inputs.weightUnit === 'kg') {
    grainWeight = grainWeight * 2.20462;
  }
  if (inputs.tempUnit === 'celsius') {
    grainTemp = convertTemp(grainTemp, 'celsius', 'fahrenheit');
    targetMashTemp = convertTemp(targetMashTemp, 'celsius', 'fahrenheit');
  }
  if (inputs.volumeUnit === 'liters') {
    equipmentLoss = equipmentLoss * 0.264172;
    evaporationRate = evaporationRate * 0.264172;
    preboilVolume = preboilVolume * 0.264172;
    mashThickness = mashThickness * 0.479306;
    grainAbsorption = grainAbsorption * 0.479306;
  }

  const strikeWaterTemp = calculateStrikeTemp(targetMashTemp, grainTemp, mashThickness);

  const strikeWaterQuarts = grainWeight * mashThickness;
  const strikeWaterVolume = strikeWaterQuarts / 4;
  const grainDisplacement = grainWeight * 0.08;
  const totalMashVolume = strikeWaterVolume + grainDisplacement;

  const waterAbsorbedQuarts = grainWeight * grainAbsorption;
  const waterAbsorbedByGrain = waterAbsorbedQuarts / 4;

  const firstRunningsVolume = strikeWaterVolume - waterAbsorbedByGrain - equipmentLoss;

  const boilOff = evaporationRate * (inputs.boilTime / 60);

  const postBoilVolume = preboilVolume - boilOff;

  let spargeWaterVolume = 0;
  let spargeWaterPerBatch = 0;

  if (inputs.spargeType !== 'no-sparge') {
    spargeWaterVolume = preboilVolume - firstRunningsVolume;
    spargeWaterVolume = Math.max(0, spargeWaterVolume);

    if (inputs.spargeType === 'batch' && inputs.batchSpargeCount > 0) {
      spargeWaterPerBatch = spargeWaterVolume / inputs.batchSpargeCount;
    }
  }

  const totalWaterNeeded = strikeWaterVolume + spargeWaterVolume;

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

export function formatTemp(temp: number, unit: string): string {
  return `${temp}${unit}`;
}

export function formatVolume(volume: number, unit: string): string {
  return `${volume} ${unit}`;
}
