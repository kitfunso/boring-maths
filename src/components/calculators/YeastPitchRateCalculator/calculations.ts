import type { YeastPitchRateInputs, YeastPitchRateResults } from './types';
import { PITCH_RATES, YEAST_FORMATS, STARTER_GROWTH } from './types';

function sgToPlato(sg: number): number {
  return -616.868 + 1111.14 * sg - 630.272 * sg * sg + 135.997 * sg * sg * sg;
}

function calculateViability(format: string, ageDays: number): number {
  const yeastType = YEAST_FORMATS.find((f) => f.value === format);
  if (!yeastType) return 0;

  const effectiveAge = Math.min(ageDays, yeastType.maxAge);

  const viabilityLoss = effectiveAge * yeastType.viabilityRate;
  const viability = Math.max(0, 100 - viabilityLoss);

  return viability;
}

function calculateStarterGrowth(
  initialCells: number,
  starterLiters: number,
  starterType: 'simple' | 'stir-plate' | 'shaken'
): number {
  const growth = STARTER_GROWTH[starterType];

  const starterML = starterLiters * 1000;
  const inoculationRate = (initialCells * 1000) / starterML;
  let growthMultiplier = growth.growthFactor;

  if (inoculationRate < 25) {
    growthMultiplier *= 0.8;
  } else if (inoculationRate > 200) {
    growthMultiplier *= 0.6;
  }

  const newCells = initialCells * growthMultiplier;

  return Math.min(newCells, initialCells + growth.maxGrowth);
}

export function calculateYeastPitchRate(inputs: YeastPitchRateInputs): YeastPitchRateResults {
  let volumeL = inputs.batchVolume;
  if (inputs.volumeUnit === 'gallons') {
    volumeL = inputs.batchVolume * 3.78541;
  }

  const volumeML = volumeL * 1000;

  const plato = sgToPlato(inputs.originalGravity);

  const targetRate = PITCH_RATES[inputs.beerType].standard;

  const cellsNeededMillions = targetRate * volumeML * plato;
  const cellsNeeded = cellsNeededMillions / 1000;
  const viability = calculateViability(inputs.yeastFormat, inputs.yeastAge);

  const yeastType = YEAST_FORMATS.find((f) => f.value === inputs.yeastFormat);
  const cellsPerPackage = inputs.cellsPerPackage || yeastType?.cellsPerPackage || 100;
  const viableCellsPerPackage = cellsPerPackage * (viability / 100);
  const cellsFromPackages = viableCellsPerPackage * inputs.packagesAvailable;

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

  const actualPitchRate = (totalCellsWithStarter * 1000) / volumeML / plato;

  const isPitchRateAdequate = totalCellsWithStarter >= cellsNeeded * 0.9;
  const underpitchPercent =
    totalCellsWithStarter < cellsNeeded
      ? ((cellsNeeded - totalCellsWithStarter) / cellsNeeded) * 100
      : 0;

  const packagesNeeded = Math.ceil(cellsNeeded / viableCellsPerPackage);

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

export function formatCells(billions: number): string {
  if (billions >= 1000) {
    return `${(billions / 1000).toFixed(1)} trillion`;
  }
  return `${billions} billion`;
}
