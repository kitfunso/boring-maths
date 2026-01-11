/**
 * Flooring Calculator - Type Definitions
 *
 * Calculator to determine how much flooring you need for a room.
 * Target Keyword: "how much flooring do I need calculator with waste"
 */

import type { Currency } from '../../../lib/regions';

/**
 * Flooring types with different characteristics
 */
export type FlooringType = 'hardwood' | 'laminate' | 'vinyl' | 'tile' | 'carpet';

/**
 * Installation patterns that affect waste percentage
 */
export type InstallPattern = 'straight' | 'diagonal' | 'herringbone' | 'chevron';

/**
 * Input values for the Flooring Calculator
 */
export interface FlooringCalculatorInputs {
  /** Selected currency (for cost estimates) */
  currency: Currency;

  /** Room length in feet */
  roomLength: number;

  /** Room width in feet */
  roomWidth: number;

  /** Type of flooring material */
  flooringType: FlooringType;

  /** Installation pattern */
  pattern: InstallPattern;

  /** Square feet per box (common: 20-25 sq ft) */
  sqftPerBox: number;

  /** Price per square foot */
  pricePerSqft: number;

  /** Number of closets to include */
  closetCount: number;

  /** Average closet size in sq ft */
  closetSize: number;

  /** Include stairs (number of steps) */
  stairSteps: number;

  /** Include underlayment/padding */
  includeUnderlayment: boolean;

  /** Include transition strips */
  includeTransitions: boolean;

  /** Number of doorways/transitions */
  transitionCount: number;
}

/**
 * Calculated results from the Flooring Calculator
 */
export interface FlooringCalculatorResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Base room area in square feet */
  baseArea: number;

  /** Additional area from closets */
  closetArea: number;

  /** Additional area from stairs */
  stairArea: number;

  /** Total area before waste */
  totalArea: number;

  /** Waste percentage applied */
  wastePercentage: number;

  /** Area including waste factor */
  areaWithWaste: number;

  /** Number of boxes to buy */
  boxesNeeded: number;

  /** Actual coverage from boxes */
  actualCoverage: number;

  /** Flooring material cost */
  flooringCost: number;

  /** Underlayment cost (if included) */
  underlaymentCost: number;

  /** Transition strip cost (if included) */
  transitionCost: number;

  /** Total estimated cost */
  totalCost: number;

  /** Breakdown of what to buy */
  shoppingList: {
    item: string;
    quantity: number;
    unit: string;
    estimatedPrice: number;
  }[];
}

/**
 * Flooring type configurations
 */
export interface FlooringTypeConfig {
  name: string;
  defaultPricePerSqft: Record<Currency, number>;
  defaultSqftPerBox: number;
  description: string;
}

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): FlooringCalculatorInputs {
  return {
    currency,
    roomLength: 15,
    roomWidth: 12,
    flooringType: 'laminate',
    pattern: 'straight',
    sqftPerBox: 22,
    pricePerSqft: currency === 'USD' ? 3 : currency === 'GBP' ? 2.5 : 2.75,
    closetCount: 1,
    closetSize: 12,
    stairSteps: 0,
    includeUnderlayment: true,
    includeTransitions: true,
    transitionCount: 2,
  };
}

/**
 * Default input values
 */
export const DEFAULT_INPUTS: FlooringCalculatorInputs = getDefaultInputs('USD');
