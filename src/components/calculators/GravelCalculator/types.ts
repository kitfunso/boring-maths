import type { Currency } from '../../../lib/regions';

export type GravelUnit = 'm' | 'ft';

export type GravelType =
  | 'pea-gravel'
  | 'crushed-stone'
  | 'gravel-sand'
  | 'limestone'
  | 'ballast'
  | 'custom';

export interface GravelCalculatorInputs {
  currency: Currency;

  length: number;
  width: number;
  depth: number;
  unit: GravelUnit;

  gravelType: GravelType;
  density: number;

  wastePct: number;

  pricePerTonne: number;
}

export interface GravelCalculatorResult {
  currency: Currency;

  volumeM3: number;

  tonnes: number;

  bulkBags: number;

  cost: number;

  isInvalid: boolean;
}

export const BULK_BAG_TONNES = 0.85;

export const GRAVEL_TYPES: Record<GravelType, { label: string; density: number }> = {
  'pea-gravel': { label: 'Pea gravel', density: 1.5 },
  'crushed-stone': { label: 'Crushed stone', density: 1.6 },
  'gravel-sand': { label: 'Gravel and sand mix', density: 1.7 },
  limestone: { label: 'Limestone chippings', density: 1.5 },
  ballast: { label: 'Ballast', density: 1.6 },
  custom: { label: 'Custom density', density: 1.5 },
};

export function getDefaultInputs(currency: Currency = 'GBP'): GravelCalculatorInputs {
  return {
    currency,
    length: 5,
    width: 3,
    depth: 0.05,
    unit: 'm',
    gravelType: 'pea-gravel',
    density: 1.5,
    wastePct: 5,
    pricePerTonne: currency === 'USD' ? 45 : currency === 'EUR' ? 42 : 40,
  };
}

export const DEFAULT_INPUTS: GravelCalculatorInputs = getDefaultInputs('GBP');
