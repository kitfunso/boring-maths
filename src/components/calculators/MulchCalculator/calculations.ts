/**
 * Mulch Calculator - Calculation Logic
 *
 * Pure functions for calculating mulch quantities.
 * Unique angle: Different mulch types (wood chips, bark, rubber, stone) with density differences.
 */

import type {
  MulchCalculatorInputs,
  MulchCalculatorResult,
  MulchType,
  MulchTypeConfig,
} from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Cubic feet per cubic yard
 */
const CUBIC_FEET_PER_YARD = 27;

/**
 * Mulch type configurations with density and pricing
 *
 * Density values (lbs per cubic foot):
 * - Wood chips: 15-20 lbs (fresh), using 18 as average
 * - Bark mulch: 15-25 lbs, using 20 as average
 * - Rubber mulch: 35-40 lbs, using 38 as average
 * - Stone/gravel: 80-100 lbs, using 90 as average
 * - Straw: 4-8 lbs, using 6 as average
 */
export const MULCH_TYPE_CONFIGS: Record<MulchType, MulchTypeConfig> = {
  'wood-chips': {
    name: 'Wood Chips',
    densityLbsPerCuFt: 18,
    defaultPricePerCuYard: { USD: 30, GBP: 25, EUR: 28 },
    defaultPricePer2CuFtBag: { USD: 3.5, GBP: 3, EUR: 3.25 },
    defaultPricePer3CuFtBag: { USD: 4.5, GBP: 4, EUR: 4.25 },
    refreshMonths: 12,
    description: 'Economical, decomposes to enrich soil, needs annual replacement',
  },
  bark: {
    name: 'Bark Mulch',
    densityLbsPerCuFt: 20,
    defaultPricePerCuYard: { USD: 40, GBP: 35, EUR: 38 },
    defaultPricePer2CuFtBag: { USD: 4, GBP: 3.5, EUR: 3.75 },
    defaultPricePer3CuFtBag: { USD: 5.5, GBP: 5, EUR: 5.25 },
    refreshMonths: 18,
    description: 'Attractive appearance, longer lasting than wood chips',
  },
  rubber: {
    name: 'Rubber Mulch',
    densityLbsPerCuFt: 38,
    defaultPricePerCuYard: { USD: 90, GBP: 75, EUR: 85 },
    defaultPricePer2CuFtBag: { USD: 8, GBP: 7, EUR: 7.5 },
    defaultPricePer3CuFtBag: { USD: 11, GBP: 9.5, EUR: 10 },
    refreshMonths: 120, // 10 years
    description: 'Long-lasting, great for playgrounds, does not decompose',
  },
  stone: {
    name: 'Decorative Stone',
    densityLbsPerCuFt: 90,
    defaultPricePerCuYard: { USD: 65, GBP: 55, EUR: 60 },
    defaultPricePer2CuFtBag: { USD: 6, GBP: 5, EUR: 5.5 },
    defaultPricePer3CuFtBag: { USD: 8, GBP: 7, EUR: 7.5 },
    refreshMonths: 0, // Permanent
    description: 'Permanent solution, low maintenance, excellent drainage',
  },
  straw: {
    name: 'Straw',
    densityLbsPerCuFt: 6,
    defaultPricePerCuYard: { USD: 25, GBP: 20, EUR: 22 },
    defaultPricePer2CuFtBag: { USD: 3, GBP: 2.5, EUR: 2.75 },
    defaultPricePer3CuFtBag: { USD: 4, GBP: 3.5, EUR: 3.75 },
    refreshMonths: 6,
    description: 'Best for vegetable gardens, decomposes quickly to add nutrients',
  },
};

/**
 * Mulch type display names
 */
export const MULCH_TYPE_NAMES: Record<MulchType, string> = {
  'wood-chips': 'Wood Chips',
  bark: 'Bark Mulch',
  rubber: 'Rubber Mulch',
  stone: 'Decorative Stone',
  straw: 'Straw',
};

/**
 * Calculate mulch requirements
 */
export function calculateMulch(inputs: MulchCalculatorInputs): MulchCalculatorResult {
  const {
    currency,
    length,
    width,
    depth,
    mulchType,
    pricePerCubicYard,
    pricePer2CuFtBag,
    pricePer3CuFtBag,
    includeDelivery,
    deliveryFee,
  } = inputs;

  // Get mulch type config
  const config = MULCH_TYPE_CONFIGS[mulchType];

  // Calculate area in square feet
  const areaSqFt = length * width;

  // Convert depth from inches to feet
  const depthFt = depth / 12;

  // Calculate volume in cubic feet
  const volumeCuFt = areaSqFt * depthFt;

  // Convert to cubic yards
  const volumeCuYards = volumeCuFt / CUBIC_FEET_PER_YARD;

  // Calculate bags needed (round up)
  const bags2CuFt = Math.ceil(volumeCuFt / 2);
  const bags3CuFt = Math.ceil(volumeCuFt / 3);

  // Calculate weight estimate
  const estimatedWeight = Math.round(volumeCuFt * config.densityLbsPerCuFt);

  // Calculate costs
  const bulkCostBase = volumeCuYards * pricePerCubicYard;
  const bulkCost =
    Math.round((includeDelivery ? bulkCostBase + deliveryFee : bulkCostBase) * 100) / 100;
  const bags2CuFtCost = Math.round(bags2CuFt * pricePer2CuFtBag * 100) / 100;
  const bags3CuFtCost = Math.round(bags3CuFt * pricePer3CuFtBag * 100) / 100;

  // Determine best value
  let bestValue: 'bulk' | '2cuft' | '3cuft' = '3cuft';
  const minCost = Math.min(bulkCost, bags2CuFtCost, bags3CuFtCost);
  if (minCost === bulkCost) {
    bestValue = 'bulk';
  } else if (minCost === bags2CuFtCost) {
    bestValue = '2cuft';
  }

  return {
    currency,
    areaSqFt: Math.round(areaSqFt * 10) / 10,
    volumeCuFt: Math.round(volumeCuFt * 10) / 10,
    volumeCuYards: Math.round(volumeCuYards * 100) / 100,
    bags2CuFt,
    bags3CuFt,
    estimatedWeight,
    bulkCost,
    bags2CuFtCost,
    bags3CuFtCost,
    bestValue,
    refreshMonths: config.refreshMonths,
    mulchTypeName: config.name,
  };
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}

/**
 * Format volume for display
 */
export function formatVolume(cuYards: number): string {
  if (cuYards < 1) {
    return `${Math.round(cuYards * CUBIC_FEET_PER_YARD)} cu ft`;
  }
  return `${cuYards.toFixed(2)} cu yds`;
}

/**
 * Format area for display
 */
export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString()} sq ft`;
}

/**
 * Format weight for display
 */
export function formatWeight(lbs: number): string {
  if (lbs >= 2000) {
    return `${(lbs / 2000).toFixed(1)} tons`;
  }
  return `${lbs.toLocaleString()} lbs`;
}

/**
 * Get refresh interval description
 */
export function getRefreshDescription(months: number): string {
  if (months === 0) {
    return 'Permanent - no replacement needed';
  }
  if (months >= 120) {
    return `${Math.round(months / 12)}+ years before replacement`;
  }
  if (months >= 12) {
    const years = months / 12;
    return years === 1 ? 'Replace annually' : `Replace every ${years} years`;
  }
  return `Replace every ${months} months`;
}
