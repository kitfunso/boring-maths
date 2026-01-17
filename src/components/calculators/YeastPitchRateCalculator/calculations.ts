/**
 * Yeast Pitch Rate Calculator Calculations
 * Based on industry-standard pitching rate formulas
 */

import type { YeastPitchRateInputs, YeastPitchRateResults } from './types';
import { PITCH_RATES, YEAST_FORMATS, STARTER_GROWTH } from './types';

/**
 * Convert SG to degrees Plato
 * Formula: °P = -616.868 + 1111.14 × SG - 630.272 × SG² + 135.997 × SG³
 */
function sgToPlato(sg: number): number {
  return -616.868 + 1111.14 * sg - 630.272 * sg * sg + 135.997 * sg * sg * sg;
}

/**
 * Calculate yeast viability based on age
 * Liquid yeast loses ~21% viability per month
 * Dry yeast is very stable
 */
function calculateViability(format: string, ageDays: number): number {
  const yeastType = YEAST_FORMATS.find((f) => f.value === format);
  if (!yeastType) return 0;

  // Cap age at max
  const effectiveAge = Math.min(ageDays, yeastType.maxAge);

  // Calculate viability loss
  const viabilityLoss = effectiveAge * yeastType.viabilityRate;
  const viability = Math.max(0, 100 - viabilityLoss);

  return viability;
}

/**
 * Calculate cells produced in a starter
 * Based on starter volume and method
 */
function calculateStarterGrowth(
  initialCells: number,
  starterLiters: number,
  starterType: 'simple' | 'stir-plate' | 'shaken'
): number {
  const growth = STARTER_GROWTH[starterType];

  // Inoculation rate affects growth
  // Optimal is ~25-100 million cells/mL for starter
  const starterML = starterLiters * 1000;
  const inoculationRate = (initialCells * 1000) / starterML; // millions/mL

  // Growth calculation - simplified Braukaiser model
  // Growth is maximized at certain inoculation rates
  let growthMultiplier = growth.growthFactor;

  // Adjust for over/under inoculation
  if (inoculationRate < 25) {
    // Under-inoculated - less growth
    growthMultiplier *= 0.8;
  } else if (inoculationRate > 200) {
    // Over-inoculated - reduced growth
    growthMultiplier *= 0.6;
  }

  // Calculate new cells
  const newCells = initialCells * growthMultiplier;

  // Cap at maximum growth for method
  return Math.min(newCells, initialCells + growth.maxGrowth);
}

/**
 * Calculate yeast pitch rate and requirements
 */
export function calculateYeastPitchRate(inputs: YeastPitchRateInputs): YeastPitchRateResults {
  // Convert volume to liters
  let volumeL = inputs.batchVolume;
  if (inputs.volumeUnit === 'gallons') {
    volumeL = inputs.batchVolume * 3.78541;
  }

  // Convert to mL for calculations
  const volumeML = volumeL * 1000;

  // Get degrees Plato
  const plato = sgToPlato(inputs.originalGravity);

  // Get target pitch rate (million cells / mL / °P)
  const targetRate = PITCH_RATES[inputs.beerType].standard;

  // Calculate cells needed (in billions)
  // Formula: cells (millions) = pitch_rate × volume (mL) × °Plato
  const cellsNeededMillions = targetRate * volumeML * plato;
  const cellsNeeded = cellsNeededMillions / 1000; // convert to billions

  // Calculate viability
  const viability = calculateViability(inputs.yeastFormat, inputs.yeastAge);

  // Calculate available cells from packages
  const yeastType = YEAST_FORMATS.find((f) => f.value === inputs.yeastFormat);
  const cellsPerPackage = inputs.cellsPerPackage || yeastType?.cellsPerPackage || 100;
  const viableCellsPerPackage = cellsPerPackage * (viability / 100);
  const cellsFromPackages = viableCellsPerPackage * inputs.packagesAvailable;

  // Calculate starter contribution if applicable
  let starterCellsProduced = 0;
  let totalCellsWithStarter = cellsFromPackages;

  if (inputs.useStarter && inputs.starterVolume > 0) {
    totalCellsWithStarter = calculateStarterGrowth(
      cellsFromPackages,
      inputs.starterVolume,
      inputs.starterType
    );
    starterCellsProduced = totalCellsWithStarter - cellsFromPackages;
  }

  // Calculate actual pitch rate achieved
  const actualPitchRate = (totalCellsWithStarter * 1000) / volumeML / plato;

  // Check if adequate
  const isPitchRateAdequate = totalCellsWithStarter >= cellsNeeded * 0.9; // 90% is acceptable
  const underpitchPercent =
    totalCellsWithStarter < cellsNeeded
      ? ((cellsNeeded - totalCellsWithStarter) / cellsNeeded) * 100
      : 0;

  // Calculate packages needed (without starter)
  const packagesNeeded = Math.ceil(cellsNeeded / viableCellsPerPackage);

  // Generate recommendations
  const recommendations: string[] = [];
  const warnings: string[] = [];

  if (underpitchPercent > 0) {
    if (underpitchPercent > 50) {
      warnings.push(`Severely underpitched by ${Math.round(underpitchPercent)}%`);
      recommendations.push('Consider making a larger starter or using more yeast packages');
    } else if (underpitchPercent > 20) {
      warnings.push(`Underpitched by ${Math.round(underpitchPercent)}%`);
      recommendations.push('A starter is recommended to reach target pitch rate');
    } else {
      recommendations.push(
        `Slightly under target (${Math.round(underpitchPercent)}%) - acceptable for most ales`
      );
    }
  }

  if (inputs.yeastFormat === 'liquid' && inputs.yeastAge > 30 && !inputs.useStarter) {
    recommendations.push('Liquid yeast over 30 days old benefits from a starter');
  }

  if (inputs.beerType === 'lager' && !inputs.useStarter) {
    recommendations.push('Lagers typically require a starter or multiple packages');
  }

  if (inputs.originalGravity > 1.075 && !inputs.useStarter) {
    recommendations.push('High gravity beers need more yeast - consider a starter');
  }

  if (viability < 50) {
    warnings.push('Low yeast viability - starter strongly recommended');
  }

  if (inputs.useStarter && inputs.starterVolume < 1) {
    recommendations.push('Larger starters (1-2L) produce more cells');
  }

  if (inputs.yeastFormat === 'dry') {
    recommendations.push('Rehydrate dry yeast in warm water (95-105°F) before pitching');
  }

  if (isPitchRateAdequate && recommendations.length === 0) {
    recommendations.push('Pitch rate is adequate for healthy fermentation');
  }

  return {
    cellsNeeded: Math.round(cellsNeeded),
    cellsAvailable: Math.round(totalCellsWithStarter),
    viability: Math.round(viability),
    packagesNeeded,
    pitchRate: Math.round(actualPitchRate * 100) / 100,
    targetPitchRate: targetRate,
    starterCellsProduced: Math.round(starterCellsProduced),
    totalCellsWithStarter: Math.round(totalCellsWithStarter),
    isPitchRateAdequate,
    underpitchPercent: Math.round(underpitchPercent),
    recommendations,
    warnings,
  };
}

/**
 * Format cell count for display
 */
export function formatCells(billions: number): string {
  if (billions >= 1000) {
    return `${(billions / 1000).toFixed(1)} trillion`;
  }
  return `${billions} billion`;
}
