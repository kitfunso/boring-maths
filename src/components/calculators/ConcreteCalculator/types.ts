/**
 * Concrete Calculator - Type Definitions
 *
 * Estimates how many bags of concrete (and total volume) you need for a
 * slab, footing, or column pour, including a waste allowance.
 */

import type { Currency } from '../../../lib/regions';

export type ConcreteShape = 'slab' | 'footing' | 'column';
export type ConcreteUnit = 'm' | 'ft';

export interface ConcreteCalculatorInputs {
  currency: Currency;

  /** Pour shape: slab, footing, or column. */
  shape: ConcreteShape;

  /** Length (slab/footing). Unused for column. */
  length: number;
  /** Width (slab/footing) OR diameter (column). */
  width: number;
  /** Depth (slab/footing) OR height (column). */
  depth: number;

  /** Measurement unit for the dimensions above. */
  unit: ConcreteUnit;

  /** Extra material allowance, percent (default 10). */
  wastePct: number;

  /** Yield of one bag in cubic metres (default 0.011 = a 25kg bag). */
  bagYield: number;

  /** Optional price per bag in the selected currency. */
  bagPrice: number;
}

export interface ConcreteCalculatorResult {
  currency: Currency;

  /** Raw volume of the pour in cubic metres (no waste). */
  volumeM3: number;
  /** Volume including the waste allowance, cubic metres. */
  volumeWithWasteM3: number;
  /** Volume including waste expressed in cubic yards. */
  cubicYards: number;
  /** Whole bags needed (ceil of volumeWithWaste / bagYield). */
  bags: number;
  /** Estimated cost (bags * bagPrice). */
  cost: number;
  /** True when any dimension is non-positive (degenerate pour). */
  isInvalid: boolean;
}

/** Conversion: one foot in metres. */
export const FEET_TO_METRES = 0.3048;
/** Conversion: one cubic metre in cubic yards. */
export const M3_TO_CUBIC_YARDS = 1.30795;
/** Default bag yield: a 25kg pre-mix bag yields ~0.011 m3. */
export const DEFAULT_BAG_YIELD_M3 = 0.011;

export function getDefaultInputs(currency: Currency = 'GBP'): ConcreteCalculatorInputs {
  return {
    currency,
    shape: 'slab',
    length: 4,
    width: 3,
    depth: 0.1,
    unit: 'm',
    wastePct: 10,
    bagYield: DEFAULT_BAG_YIELD_M3,
    bagPrice: currency === 'USD' ? 6 : currency === 'EUR' ? 5.5 : 5,
  };
}

export const DEFAULT_INPUTS: ConcreteCalculatorInputs = getDefaultInputs('GBP');
