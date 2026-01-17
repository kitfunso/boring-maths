/**
 * Flooring Calculator - Calculation Logic
 *
 * Pure functions for calculating flooring quantities.
 * Unique angle: Different waste factors for different installation patterns.
 */

import type {
  FlooringCalculatorInputs,
  FlooringCalculatorResult,
  FlooringType,
  InstallPattern,
} from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Waste percentages by installation pattern
 * - Straight: 10% - standard parallel installation
 * - Diagonal: 15% - 45-degree angle requires more cuts at walls
 * - Herringbone: 20% - complex pattern with many angled cuts
 * - Chevron: 25% - pre-angled pieces, most waste at edges
 */
const WASTE_PERCENTAGES: Record<InstallPattern, number> = {
  straight: 0.1,
  diagonal: 0.15,
  herringbone: 0.2,
  chevron: 0.25,
};

/**
 * Underlayment price per sq ft by currency
 */
const UNDERLAYMENT_PRICES: Record<Currency, number> = {
  USD: 0.5,
  GBP: 0.4,
  EUR: 0.45,
};

/**
 * Transition strip price each by currency
 */
const TRANSITION_PRICES: Record<Currency, number> = {
  USD: 15,
  GBP: 12,
  EUR: 14,
};

/**
 * Square feet per stair step (tread + riser)
 */
const SQFT_PER_STAIR = 3.5;

/**
 * Flooring type display names
 */
export const FLOORING_TYPE_NAMES: Record<FlooringType, string> = {
  hardwood: 'Hardwood',
  laminate: 'Laminate',
  vinyl: 'Luxury Vinyl',
  tile: 'Tile',
  carpet: 'Carpet',
};

/**
 * Pattern display names
 */
export const PATTERN_NAMES: Record<InstallPattern, string> = {
  straight: 'Straight/Parallel',
  diagonal: 'Diagonal (45°)',
  herringbone: 'Herringbone',
  chevron: 'Chevron',
};

/**
 * Calculate flooring requirements
 */
export function calculateFlooring(inputs: FlooringCalculatorInputs): FlooringCalculatorResult {
  const {
    currency,
    roomLength,
    roomWidth,
    flooringType,
    pattern,
    sqftPerBox,
    pricePerSqft,
    closetCount,
    closetSize,
    stairSteps,
    includeUnderlayment,
    includeTransitions,
    transitionCount,
  } = inputs;

  // Calculate base room area
  const baseArea = roomLength * roomWidth;

  // Calculate closet area
  const closetArea = closetCount * closetSize;

  // Calculate stair area
  const stairArea = stairSteps * SQFT_PER_STAIR;

  // Total area before waste
  const totalArea = baseArea + closetArea + stairArea;

  // Get waste percentage for pattern
  const wastePercentage = WASTE_PERCENTAGES[pattern];

  // Calculate area with waste factor
  const areaWithWaste = totalArea * (1 + wastePercentage);

  // Calculate boxes needed (round up)
  const boxesNeeded = Math.ceil(areaWithWaste / sqftPerBox);

  // Actual coverage from boxes purchased
  const actualCoverage = boxesNeeded * sqftPerBox;

  // Calculate costs
  const flooringCost = actualCoverage * pricePerSqft;

  // Underlayment (covers same area as flooring)
  // Not needed for carpet (usually has attached pad) or tile (uses different substrate)
  const needsUnderlayment = includeUnderlayment && !['carpet', 'tile'].includes(flooringType);
  const underlaymentCost = needsUnderlayment ? actualCoverage * UNDERLAYMENT_PRICES[currency] : 0;

  // Transition strips
  const transitionCost = includeTransitions ? transitionCount * TRANSITION_PRICES[currency] : 0;

  // Total cost
  const totalCost = flooringCost + underlaymentCost + transitionCost;

  // Build shopping list
  const shoppingList: FlooringCalculatorResult['shoppingList'] = [];

  // Flooring
  shoppingList.push({
    item: `${FLOORING_TYPE_NAMES[flooringType]} Flooring`,
    quantity: boxesNeeded,
    unit: boxesNeeded === 1 ? 'box' : 'boxes',
    estimatedPrice: flooringCost,
  });

  // Underlayment
  if (needsUnderlayment) {
    // Underlayment usually comes in 100 sq ft rolls
    const underlaymentRolls = Math.ceil(actualCoverage / 100);
    shoppingList.push({
      item: 'Underlayment/Padding',
      quantity: underlaymentRolls,
      unit: underlaymentRolls === 1 ? 'roll' : 'rolls',
      estimatedPrice: underlaymentCost,
    });
  }

  // Transition strips
  if (includeTransitions && transitionCount > 0) {
    shoppingList.push({
      item: 'Transition Strips',
      quantity: transitionCount,
      unit: transitionCount === 1 ? 'strip' : 'strips',
      estimatedPrice: transitionCost,
    });
  }

  return {
    currency,
    baseArea: Math.round(baseArea),
    closetArea: Math.round(closetArea),
    stairArea: Math.round(stairArea * 10) / 10,
    totalArea: Math.round(totalArea),
    wastePercentage,
    areaWithWaste: Math.round(areaWithWaste),
    boxesNeeded,
    actualCoverage,
    flooringCost: Math.round(flooringCost),
    underlaymentCost: Math.round(underlaymentCost),
    transitionCost: Math.round(transitionCost),
    totalCost: Math.round(totalCost),
    shoppingList,
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
 * Format square feet
 */
export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString()} sq ft`;
}

/**
 * Format percentage for display
 */
export function formatWastePercentage(decimal: number): string {
  return `${Math.round(decimal * 100)}%`;
}
