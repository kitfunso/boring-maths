import type { CandleWaxInputs, CandleWaxResults } from './types';
import { WAX_TYPES, WICK_GUIDE } from './types';

function calculateContainerVolume(
  diameter: number,
  height: number,
  shape: string,
  ovalWidth: number = 0
): number {
  switch (shape) {
    case 'cylinder': {
      const radius = diameter / 2;
      return Math.PI * radius * radius * height;
    }
    case 'square':
      return diameter * diameter * height;
    case 'oval':
      return Math.PI * (diameter / 2) * (ovalWidth / 2) * height;
    default:
      return 0;
  }
}

function cubicInchesToFlOz(cubicInches: number): number {
  return cubicInches * 0.554113;
}

function flOzToMl(flOz: number): number {
  return flOz * 29.5735;
}

function getWickRecommendation(diameter: number): string {
  const recommendation = WICK_GUIDE.find((w) => diameter <= w.maxDiameter);
  return recommendation?.wickSize || 'Multi-wick recommended';
}

export function calculateCandleWax(inputs: CandleWaxInputs): CandleWaxResults {
  const wax = WAX_TYPES.find((w) => w.value === inputs.waxType);
  const waxDensity = wax?.density || 0.86;
  const burnRate = wax?.burnRate || 0.12;

  let containerVolumeOz: number;
  let diameter: number;

  if (inputs.calculationMode === 'dimensions') {
    const volumeCubicInches = calculateContainerVolume(
      inputs.containerDiameter,
      inputs.containerHeight,
      inputs.containerShape,
      inputs.ovalWidth
    );
    containerVolumeOz = cubicInchesToFlOz(volumeCubicInches);
    diameter = inputs.containerDiameter;
  } else {
    if (inputs.volumeUnit === 'ml') {
      containerVolumeOz = inputs.directVolume / 29.5735;
    } else {
      containerVolumeOz = inputs.directVolume;
    }
    const estimatedRadius = Math.pow(containerVolumeOz / (2 * Math.PI * 0.554113), 1 / 3);
    diameter = estimatedRadius * 2;
  }

  const usableVolumeOz = containerVolumeOz * (inputs.fillPercentage / 100);

  const waxWeightOz = usableVolumeOz * waxDensity;

  const totalWaxWeight = waxWeightOz * inputs.numberOfContainers;

  const wickedWeight = totalWaxWeight * 0.98;

  const waxWithOverpour = totalWaxWeight * 1.1;

  let displayWeight: number;
  let weightPerContainer: number;
  let weightUnit: string;

  switch (inputs.weightUnit) {
    case 'grams':
      displayWeight = totalWaxWeight * 28.3495;
      weightPerContainer = waxWeightOz * 28.3495;
      weightUnit = 'g';
      break;
    case 'pounds':
      displayWeight = totalWaxWeight / 16;
      weightPerContainer = waxWeightOz / 16;
      weightUnit = 'lbs';
      break;
    default:
      displayWeight = totalWaxWeight;
      weightPerContainer = waxWeightOz;
      weightUnit = 'oz';
  }

  const burnTime = waxWeightOz / burnRate;

  const suggestedWickSize = getWickRecommendation(diameter);

  let displayVolume = containerVolumeOz;
  if (inputs.volumeUnit === 'ml') {
    displayVolume = flOzToMl(containerVolumeOz);
  }

  return {
    containerVolume: Math.round(displayVolume * 10) / 10,
    usableVolume:
      Math.round((inputs.volumeUnit === 'ml' ? flOzToMl(usableVolumeOz) : usableVolumeOz) * 10) /
      10,
    waxWeight: Math.round(displayWeight * 10) / 10,
    waxWeightPerContainer: Math.round(weightPerContainer * 10) / 10,
    wickedWeight:
      Math.round(
        (inputs.weightUnit === 'grams'
          ? wickedWeight * 28.3495
          : inputs.weightUnit === 'pounds'
            ? wickedWeight / 16
            : wickedWeight) * 10
      ) / 10,
    suggestedWickSize,
    burnTime: Math.round(burnTime),
    waxNeededWithOverpour:
      Math.round(
        (inputs.weightUnit === 'grams'
          ? waxWithOverpour * 28.3495
          : inputs.weightUnit === 'pounds'
            ? waxWithOverpour / 16
            : waxWithOverpour) * 10
      ) / 10,
    weightUnit,
  };
}

export function formatBurnTime(hours: number): string {
  if (hours < 1) {
    return `~${Math.round(hours * 60)} min`;
  }
  return `~${hours} hours`;
}
