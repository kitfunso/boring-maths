/**
 * Gravel Calculator - Type Definitions
 *
 * Calculator to determine how many tonnes of gravel you need for a
 * driveway, path, or bed, plus volume, bulk bags, and optional cost.
 * Target Keyword: "how much gravel do I need calculator"
 */

import type { Currency } from '../../../lib/regions';

/** Length unit for the dimension inputs. */
export type GravelUnit = 'm' | 'ft';

/**
 * Common gravel / aggregate types mapped to a typical bulk density in t/m3.
 * Most loose gravels sit between 1.4 and 1.7 t/m3.
 * The 'custom' option lets the user enter their own density.
 */
export type GravelType =
  | 'pea-gravel'
  | 'crushed-stone'
  | 'gravel-sand'
  | 'limestone'
  | 'ballast'
  | 'custom';

export interface GravelCalculatorInputs {
  /** Selected currency (for optional cost estimate). */
  currency: Currency;

  /** Coverage length. */
  length: number;
  /** Coverage width. */
  width: number;
  /** Gravel depth. */
  depth: number;
  /** Length unit for length, width, and depth. */
  unit: GravelUnit;

  /** Selected gravel type (drives density unless 'custom'). */
  gravelType: GravelType;
  /** Bulk density in tonnes per cubic metre. */
  density: number;

  /** Extra material allowance as a percentage (default 5). */
  wastePct: number;

  /** Optional price per tonne for the cost estimate. */
  pricePerTonne: number;
}

export interface GravelCalculatorResult {
  /** Selected currency for formatting. */
  currency: Currency;

  /** Coverage volume in cubic metres (before waste). */
  volumeM3: number;

  /** Tonnes needed including waste allowance. */
  tonnes: number;

  /** Number of bulk bags needed (0.85 tonne per bag). */
  bulkBags: number;

  /** Estimated cost (tonnes x pricePerTonne), 0 when no price entered. */
  cost: number;

  /** True when dimensions are degenerate (any dimension <= 0). */
  isInvalid: boolean;
}

/** Weight per standard bulk bag of gravel, in tonnes. */
export const BULK_BAG_TONNES = 0.85;

/** Display name and typical density (t/m3) for each gravel type. */
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
