/**
 * Paint Calculator - Type Definitions
 *
 * Calculator to determine how much paint you need for a room.
 */

import type { Currency } from '../../../lib/regions';

export type PaintQuality = 'economy' | 'standard' | 'premium';

/**
 * Input values for the Paint Calculator
 */
export interface PaintCalculatorInputs {
  /** Selected currency (for cost estimates) */
  currency: Currency;

  /** Room length in feet */
  roomLength: number;

  /** Room width in feet */
  roomWidth: number;

  /** Wall height in feet */
  wallHeight: number;

  /** Number of doors to subtract */
  doorCount: number;

  /** Number of windows to subtract */
  windowCount: number;

  /** Number of coats to apply */
  coats: number;

  /** Paint quality level */
  paintQuality: PaintQuality;

  /** Include primer */
  includePrimer: boolean;

  /** Include trim paint */
  includeTrim: boolean;
}

/**
 * Calculated results from the Paint Calculator
 */
export interface PaintCalculatorResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Total wall area in square feet */
  totalWallArea: number;

  /** Area to subtract (doors, windows) */
  subtractedArea: number;

  /** Paintable area in square feet */
  paintableArea: number;

  /** Gallons of wall paint needed */
  gallonsNeeded: number;

  /** Primer gallons (if included) */
  primerGallons: number;

  /** Trim paint quarts (if included) */
  trimQuarts: number;

  /** Estimated cost */
  estimatedCost: number;

  /** Time estimate in hours */
  timeEstimate: number;

  /** Breakdown of what to buy */
  shoppingList: {
    item: string;
    quantity: number;
    unit: string;
    estimatedPrice: number;
  }[];
}

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): PaintCalculatorInputs {
  return {
    currency,
    roomLength: 12,
    roomWidth: 10,
    wallHeight: 8,
    doorCount: 1,
    windowCount: 2,
    coats: 2,
    paintQuality: 'standard',
    includePrimer: true,
    includeTrim: false,
  };
}

/**
 * Default input values
 */
export const DEFAULT_INPUTS: PaintCalculatorInputs = getDefaultInputs('USD');
