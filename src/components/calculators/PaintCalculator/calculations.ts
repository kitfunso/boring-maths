/**
 * Paint Calculator - Calculation Logic
 *
 * Pure functions for calculating paint quantities.
 */

import type { PaintCalculatorInputs, PaintCalculatorResult, PaintQuality } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/** Average door area in square feet */
const DOOR_AREA = 21;

/** Average window area in square feet */
const WINDOW_AREA = 15;

/** Coverage per gallon in square feet */
const COVERAGE_PER_GALLON = 350;

/** Waste factor (10% extra) */
const WASTE_FACTOR = 1.1;

/** Paint prices by quality and currency */
const PAINT_PRICES: Record<Currency, Record<PaintQuality, number>> = {
  USD: { economy: 25, standard: 40, premium: 65 },
  GBP: { economy: 20, standard: 35, premium: 55 },
  EUR: { economy: 22, standard: 38, premium: 60 },
};

/** Primer price per gallon by currency */
const PRIMER_PRICES: Record<Currency, number> = {
  USD: 20,
  GBP: 15,
  EUR: 18,
};

/** Trim paint price per quart by currency */
const TRIM_PRICES: Record<Currency, number> = {
  USD: 18,
  GBP: 14,
  EUR: 16,
};

/** Hours per 100 sq ft */
const HOURS_PER_100_SQFT = 0.5;

/**
 * Calculate paint requirements
 */
export function calculatePaint(inputs: PaintCalculatorInputs): PaintCalculatorResult {
  const {
    currency,
    roomLength,
    roomWidth,
    wallHeight,
    doorCount,
    windowCount,
    coats,
    paintQuality,
    includePrimer,
    includeTrim,
  } = inputs;

  // Calculate wall perimeter and area
  const perimeter = 2 * (roomLength + roomWidth);
  const totalWallArea = perimeter * wallHeight;

  // Subtract doors and windows
  const doorArea = doorCount * DOOR_AREA;
  const windowArea = windowCount * WINDOW_AREA;
  const subtractedArea = doorArea + windowArea;
  const paintableArea = Math.max(0, totalWallArea - subtractedArea);

  // Calculate paint needed (with waste factor)
  const areaPerCoat = paintableArea * coats;
  const rawGallons = (areaPerCoat / COVERAGE_PER_GALLON) * WASTE_FACTOR;
  const gallonsNeeded = Math.ceil(rawGallons);

  // Primer (one coat, same coverage)
  const rawPrimerGallons = includePrimer
    ? (paintableArea / COVERAGE_PER_GALLON) * WASTE_FACTOR
    : 0;
  const primerGallons = Math.ceil(rawPrimerGallons);

  // Trim paint (estimate based on room perimeter)
  // Assume ~20 linear feet of trim per quart
  const trimQuarts = includeTrim ? Math.ceil(perimeter / 20) : 0;

  // Calculate costs
  const paintPrice = PAINT_PRICES[currency][paintQuality];
  const paintCost = gallonsNeeded * paintPrice;
  const primerCost = primerGallons * PRIMER_PRICES[currency];
  const trimCost = trimQuarts * TRIM_PRICES[currency];
  const estimatedCost = paintCost + primerCost + trimCost;

  // Time estimate
  const baseTime = (paintableArea / 100) * HOURS_PER_100_SQFT * coats;
  const prepTime = 1; // 1 hour for prep
  const primerTime = includePrimer ? (paintableArea / 100) * HOURS_PER_100_SQFT : 0;
  const trimTime = includeTrim ? perimeter * 0.02 : 0; // 0.02 hours per linear foot
  const timeEstimate = Math.round((baseTime + prepTime + primerTime + trimTime) * 10) / 10;

  // Build shopping list
  const shoppingList: PaintCalculatorResult['shoppingList'] = [];

  if (primerGallons > 0) {
    shoppingList.push({
      item: 'Primer',
      quantity: primerGallons,
      unit: primerGallons === 1 ? 'gallon' : 'gallons',
      estimatedPrice: primerCost,
    });
  }

  shoppingList.push({
    item: `${paintQuality.charAt(0).toUpperCase() + paintQuality.slice(1)} Paint`,
    quantity: gallonsNeeded,
    unit: gallonsNeeded === 1 ? 'gallon' : 'gallons',
    estimatedPrice: paintCost,
  });

  if (trimQuarts > 0) {
    shoppingList.push({
      item: 'Trim Paint',
      quantity: trimQuarts,
      unit: trimQuarts === 1 ? 'quart' : 'quarts',
      estimatedPrice: trimCost,
    });
  }

  return {
    currency,
    totalWallArea: Math.round(totalWallArea),
    subtractedArea: Math.round(subtractedArea),
    paintableArea: Math.round(paintableArea),
    gallonsNeeded,
    primerGallons,
    trimQuarts,
    estimatedCost: Math.round(estimatedCost),
    timeEstimate,
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
