/** Mulch Calculator - Type Definitions: how much mulch a garden bed needs. */

import type { Currency } from '../../../lib/regions';

export type MulchType = 'wood-chips' | 'bark' | 'rubber' | 'stone' | 'straw';

/** Bag size, cubic feet. */
export type BagSize = 2 | 3;

export interface MulchCalculatorInputs {
  currency: Currency;

  /** Length, feet. */
  length: number;

  /** Width, feet. */
  width: number;

  /** Depth, inches (2-4 typical). */
  depth: number;

  mulchType: MulchType;

  pricePerCubicYard: number;

  pricePer2CuFtBag: number;

  pricePer3CuFtBag: number;

  includeDelivery: boolean;

  deliveryFee: number;
}

export interface MulchCalculatorResult {
  currency: Currency;

  areaSqFt: number;

  volumeCuFt: number;

  volumeCuYards: number;

  bags2CuFt: number;

  bags3CuFt: number;

  /** Weight estimate, pounds (varies by mulch type). */
  estimatedWeight: number;

  bulkCost: number;

  bags2CuFtCost: number;

  bags3CuFtCost: number;

  bestValue: 'bulk' | '2cuft' | '3cuft';

  refreshMonths: number;

  mulchTypeName: string;
}

export interface MulchTypeConfig {
  name: string;
  densityLbsPerCuFt: number;
  defaultPricePerCuYard: Record<Currency, number>;
  defaultPricePer2CuFtBag: Record<Currency, number>;
  defaultPricePer3CuFtBag: Record<Currency, number>;
  refreshMonths: number;
  description: string;
}

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

export const DEFAULT_INPUTS: MulchCalculatorInputs = getDefaultInputs('USD');
