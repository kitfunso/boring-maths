/**
 * Fragrance Load Calculator Calculations
 */

import type { FragranceInputs, FragranceResults } from './types';
import { WAX_TYPES } from './types';

/**
 * Convert weight to ounces (base unit for calculations)
 */
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

/**
 * Convert from ounces to target unit
 */
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

/**
 * Calculate fragrance amounts
 */
export function calculateFragrance(inputs: FragranceInputs): FragranceResults {
  const { waxWeight, weightUnit, fragranceLoad, waxType, numberOfCandles } = inputs;

  // Get wax type info
  const wax = WAX_TYPES.find((w) => w.value === waxType);
  const maxAllowed = wax?.maxFragrance || 10;

  // Check if within limit
  const isWithinLimit = fragranceLoad <= maxAllowed;

  // Convert wax weight to ounces for calculation
  const waxWeightOz = toOunces(waxWeight, weightUnit);

  // Calculate fragrance amount
  // Formula: Fragrance = Wax Weight × (Fragrance Load% / 100)
  const fragranceOz = waxWeightOz * (fragranceLoad / 100);

  // Total weight
  const totalWeightOz = waxWeightOz + fragranceOz;

  // Per candle amounts
  const fragrancePerCandleOz = fragranceOz / numberOfCandles;
  const waxPerCandleOz = waxWeightOz / numberOfCandles;

  // Cost estimate (assuming $2/oz for fragrance oil average)
  const costEstimate = fragranceOz * 2;

  // Convert results back to original unit
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

/**
 * Calculate how much wax is needed for containers
 */
export function calculateWaxForContainers(
  containerWaxOz: number,
  numberOfContainers: number,
  fragranceLoad: number
): { waxNeeded: number; fragranceNeeded: number; totalNeeded: number } {
  // Container capacity is for wax + fragrance combined
  // So we need to back-calculate the wax amount
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
