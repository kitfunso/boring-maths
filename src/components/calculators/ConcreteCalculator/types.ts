import type { Currency } from '../../../lib/regions';

export type ConcreteShape = 'slab' | 'footing' | 'column';
export type ConcreteUnit = 'm' | 'ft';

export interface ConcreteCalculatorInputs {
  currency: Currency;

  shape: ConcreteShape;

  length: number;
  width: number;
  depth: number;

  unit: ConcreteUnit;

  wastePct: number;

  bagYield: number;

  bagPrice: number;
}

export interface ConcreteCalculatorResult {
  currency: Currency;

  volumeM3: number;
  volumeWithWasteM3: number;
  cubicYards: number;
  bags: number;
  cost: number;
  isInvalid: boolean;
}

export const FEET_TO_METRES = 0.3048;
export const M3_TO_CUBIC_YARDS = 1.30795;
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
