/**
 * Candle Wax Calculator Calculations
 * Calculate wax weight from container dimensions
 */

import type { CandleWaxInputs, CandleWaxResults } from './types';
import { WAX_TYPES, WICK_GUIDE } from './types';

/**
 * Calculate container volume based on shape and dimensions
 * All dimensions in inches, returns cubic inches
 */
function calculateContainerVolume(
  diameter: number,
  height: number,
  shape: string,
  ovalWidth: number = 0
): number {
  switch (shape) {
    case 'cylinder': {
      // V = πr²h
      const radius = diameter / 2;
      return Math.PI * radius * radius * height;
    }
    case 'square':
      // V = s²h (using diameter as side length)
      return diameter * diameter * height;
    case 'oval':
      // V = π × (a/2) × (b/2) × h (approximation)
      return Math.PI * (diameter / 2) * (ovalWidth / 2) * height;
    default:
      return 0;
  }
}

/**
 * Convert cubic inches to fluid ounces
 * 1 cubic inch = 0.554113 fluid ounces
 */
function cubicInchesToFlOz(cubicInches: number): number {
  return cubicInches * 0.554113;
}

/**
 * Convert fluid ounces to grams (water weight)
 * 1 fl oz = 29.5735 mL = 29.5735 grams water
 */
function flOzToMl(flOz: number): number {
  return flOz * 29.5735;
}

/**
 * Get wick recommendation based on diameter
 */
function getWickRecommendation(diameter: number): string {
  const recommendation = WICK_GUIDE.find(w => diameter <= w.maxDiameter);
  return recommendation?.wickSize || 'Multi-wick recommended';
}

/**
 * Main wax calculation
 */
export function calculateCandleWax(inputs: CandleWaxInputs): CandleWaxResults {
  const wax = WAX_TYPES.find(w => w.value === inputs.waxType);
  const waxDensity = wax?.density || 0.86;
  const burnRate = wax?.burnRate || 0.12; // oz per hour

  let containerVolumeOz: number;
  let diameter: number;

  if (inputs.calculationMode === 'dimensions') {
    // Calculate from dimensions
    const volumeCubicInches = calculateContainerVolume(
      inputs.containerDiameter,
      inputs.containerHeight,
      inputs.containerShape,
      inputs.ovalWidth
    );
    containerVolumeOz = cubicInchesToFlOz(volumeCubicInches);
    diameter = inputs.containerDiameter;
  } else {
    // Use direct volume input
    if (inputs.volumeUnit === 'ml') {
      containerVolumeOz = inputs.directVolume / 29.5735;
    } else {
      containerVolumeOz = inputs.directVolume;
    }
    // Estimate diameter from volume (assume cylinder with height = diameter)
    // V = πr²h, if h = 2r, then V = 2πr³, so r = (V/(2π))^(1/3)
    const estimatedRadius = Math.pow(containerVolumeOz / (2 * Math.PI * 0.554113), 1/3);
    diameter = estimatedRadius * 2;
  }

  // Calculate usable volume based on fill percentage
  const usableVolumeOz = containerVolumeOz * (inputs.fillPercentage / 100);

  // Calculate wax weight
  // Wax weight = Volume × Density
  // For candles, density is ratio of wax weight to water weight
  const waxWeightOz = usableVolumeOz * waxDensity;

  // Total for all containers
  const totalWaxWeight = waxWeightOz * inputs.numberOfContainers;

  // Account for wick displacement (~2% less wax needed)
  const wickedWeight = totalWaxWeight * 0.98;

  // Add 10% overpour for pour pot residue and testing
  const waxWithOverpour = totalWaxWeight * 1.10;

  // Convert to desired unit
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

  // Estimate burn time (hours)
  // Burn time ≈ wax weight / burn rate
  const burnTime = waxWeightOz / burnRate;

  // Get wick recommendation
  const suggestedWickSize = getWickRecommendation(diameter);

  // Format container volume for display
  let displayVolume = containerVolumeOz;
  if (inputs.volumeUnit === 'ml') {
    displayVolume = flOzToMl(containerVolumeOz);
  }

  return {
    containerVolume: Math.round(displayVolume * 10) / 10,
    usableVolume: Math.round((inputs.volumeUnit === 'ml' ? flOzToMl(usableVolumeOz) : usableVolumeOz) * 10) / 10,
    waxWeight: Math.round(displayWeight * 10) / 10,
    waxWeightPerContainer: Math.round(weightPerContainer * 10) / 10,
    wickedWeight: Math.round((inputs.weightUnit === 'grams' ? wickedWeight * 28.3495 : inputs.weightUnit === 'pounds' ? wickedWeight / 16 : wickedWeight) * 10) / 10,
    suggestedWickSize,
    burnTime: Math.round(burnTime),
    waxNeededWithOverpour: Math.round((inputs.weightUnit === 'grams' ? waxWithOverpour * 28.3495 : inputs.weightUnit === 'pounds' ? waxWithOverpour / 16 : waxWithOverpour) * 10) / 10,
    weightUnit,
  };
}

/**
 * Format burn time
 */
export function formatBurnTime(hours: number): string {
  if (hours < 1) {
    return `~${Math.round(hours * 60)} min`;
  }
  return `~${hours} hours`;
}
