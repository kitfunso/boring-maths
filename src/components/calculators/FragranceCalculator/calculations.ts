import type { FragranceInputs, FragranceResults } from './types';
import { WAX_TYPES } from './types';

function toOunces(weight: number, unit: string): number {
  switch (unit) {
    case 'grams':
      return weight / 28.3495;
    case 'pounds':
      return weight * 16;
    default:
      return weight;
  }
}

function fromOunces(weightOz: number, unit: string): number {
  switch (unit) {
    case 'grams':
      return weightOz * 28.3495;
    case 'pounds':
      return weightOz / 16;
    default:
      return weightOz;
  }
}

export function calculateFragrance(inputs: FragranceInputs): FragranceResults {
  const { waxWeight, weightUnit, fragranceLoad, waxType, numberOfCandles } = inputs;

  const wax = WAX_TYPES.find((w) => w.value === waxType);
  const maxAllowed = wax?.maxFragrance || 10;

  const isWithinLimit = fragranceLoad <= maxAllowed;

  const waxWeightOz = toOunces(waxWeight, weightUnit);

  const fragranceOz = waxWeightOz * (fragranceLoad / 100);

  const totalWeightOz = waxWeightOz + fragranceOz;

  const fragrancePerCandleOz = fragranceOz / numberOfCandles;
  const waxPerCandleOz = waxWeightOz / numberOfCandles;

  const costEstimate = fragranceOz * 2;

  const fragranceAmount = fromOunces(fragranceOz, weightUnit);
  const totalWeight = fromOunces(totalWeightOz, weightUnit);
  const fragrancePerCandle = fromOunces(fragrancePerCandleOz, weightUnit);
  const waxPerCandle = fromOunces(waxPerCandleOz, weightUnit);

  return {
    fragranceAmount: Math.round(fragranceAmount * 100) / 100,
    totalWeight: Math.round(totalWeight * 100) / 100,
    fragrancePerCandle: Math.round(fragrancePerCandle * 100) / 100,
    waxPerCandle: Math.round(waxPerCandle * 100) / 100,
    costEstimate: Math.round(costEstimate * 100) / 100,
    isWithinLimit,
    maxAllowed,
  };
}

export function calculateWaxForContainers(
  containerWaxOz: number,
  numberOfContainers: number,
  fragranceLoad: number
): { waxNeeded: number; fragranceNeeded: number; totalNeeded: number } {
  const fragranceRatio = fragranceLoad / 100;
  const waxRatio = 1 / (1 + fragranceRatio);

  const totalNeeded = containerWaxOz * numberOfContainers;
  const waxNeeded = totalNeeded * waxRatio;
  const fragranceNeeded = totalNeeded - waxNeeded;

  return {
    waxNeeded: Math.round(waxNeeded * 100) / 100,
    fragranceNeeded: Math.round(fragranceNeeded * 100) / 100,
    totalNeeded: Math.round(totalNeeded * 100) / 100,
  };
}
