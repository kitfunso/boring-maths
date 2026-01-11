/**
 * Mulch Calculator - Type Definitions
 *
 * Calculator to determine how much mulch you need for garden beds.
 * Target Keyword: "how much mulch do I need calculator"
 */

import type { Currency } from '../../../lib/regions';

/**
 * Mulch types with different density characteristics
 */
export type MulchType = 'wood-chips' | 'bark' | 'rubber' | 'stone' | 'straw';

/**
 * Bag size options in cubic feet
 */
export type BagSize = 2 | 3;

/**
 * Input values for the Mulch Calculator
 */
export interface MulchCalculatorInputs {
  /** Selected currency (for cost estimates) */
  currency: Currency;

  /** Garden bed length in feet */
  length: number;

  /** Garden bed width in feet */
  width: number;

  /** Desired mulch depth in inches (2-4 inches typical) */
  depth: number;

  /** Type of mulch material */
  mulchType: MulchType;

  /** Price per cubic yard (bulk) */
  pricePerCubicYard: number;

  /** Price per 2 cu ft bag */
  pricePer2CuFtBag: number;

  /** Price per 3 cu ft bag */
  pricePer3CuFtBag: number;

  /** Include delivery fee for bulk orders */
  includeDelivery: boolean;

  /** Delivery fee amount */
  deliveryFee: number;
}

/**
 * Calculated results from the Mulch Calculator
 */
export interface MulchCalculatorResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Area to cover in square feet */
  areaSqFt: number;

  /** Volume needed in cubic feet */
  volumeCuFt: number;

  /** Volume needed in cubic yards */
  volumeCuYards: number;

  /** Number of 2 cu ft bags needed */
  bags2CuFt: number;

  /** Number of 3 cu ft bags needed */
  bags3CuFt: number;

  /** Weight estimate in pounds (varies by mulch type) */
  estimatedWeight: number;

  /** Cost for bulk purchase (cubic yards) */
  bulkCost: number;

  /** Cost for 2 cu ft bags */
  bags2CuFtCost: number;

  /** Cost for 3 cu ft bags */
  bags3CuFtCost: number;

  /** Best value option */
  bestValue: 'bulk' | '2cuft' | '3cuft';

  /** Recommended refresh frequency in months */
  refreshMonths: number;

  /** Mulch type name for display */
  mulchTypeName: string;
}

/**
 * Mulch type configuration with density and characteristics
 */
export interface MulchTypeConfig {
  name: string;
  /** Weight in pounds per cubic foot */
  densityLbsPerCuFt: number;
  /** Default price per cubic yard by currency */
  defaultPricePerCuYard: Record<Currency, number>;
  /** Default price per 2 cu ft bag by currency */
  defaultPricePer2CuFtBag: Record<Currency, number>;
  /** Default price per 3 cu ft bag by currency */
  defaultPricePer3CuFtBag: Record<Currency, number>;
  /** Recommended refresh interval in months */
  refreshMonths: number;
  /** Description of the mulch type */
  description: string;
}

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): MulchCalculatorInputs {
  const priceMultiplier = currency === 'USD' ? 1 : currency === 'GBP' ? 0.8 : 0.9;

  return {
    currency,
    length: 10,
    width: 4,
    depth: 3,
    mulchType: 'wood-chips',
    pricePerCubicYard: Math.round(35 * priceMultiplier),
    pricePer2CuFtBag: Math.round(4 * priceMultiplier * 100) / 100,
    pricePer3CuFtBag: Math.round(5 * priceMultiplier * 100) / 100,
    includeDelivery: false,
    deliveryFee: Math.round(50 * priceMultiplier),
  };
}

/**
 * Default input values
 */
export const DEFAULT_INPUTS: MulchCalculatorInputs = getDefaultInputs('USD');
