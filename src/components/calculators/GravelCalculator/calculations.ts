/**
 * Gravel Calculator - Calculation Logic
 *
 * Pure functions only. No JSX, no side effects.
 */

import type { GravelCalculatorInputs, GravelCalculatorResult } from './types';
import { BULK_BAG_TONNES } from './types';

/** Metres per foot, for unit conversion. */
const FT_TO_M = 0.3048;

/** Clamp any numeric input to a finite, non-negative value (NaN-safe). */
const safe = (v: number): number => (Number.isFinite(v) ? Math.max(0, v) : 0);

export function calculateGravelCalculator(inputs: GravelCalculatorInputs): GravelCalculatorResult {
  const { currency } = inputs;

  const length = safe(inputs.length);
  const width = safe(inputs.width);
  const depth = safe(inputs.depth);
  const density = safe(inputs.density);
  const wastePct = safe(inputs.wastePct);
  const pricePerTonne = safe(inputs.pricePerTonne);

  // Convert every dimension to metres when entered in feet.
  const factor = inputs.unit === 'ft' ? FT_TO_M : 1;
  const lengthM = length * factor;
  const widthM = width * factor;
  const depthM = depth * factor;

  const isInvalid = lengthM <= 0 || widthM <= 0 || depthM <= 0;

  if (isInvalid) {
    return {
      currency,
      volumeM3: 0,
      tonnes: 0,
      bulkBags: 0,
      cost: 0,
      isInvalid: true,
    };
  }

  // Coverage volume in cubic metres (before waste allowance).
  const volumeM3 = lengthM * widthM * depthM;

  // Tonnes needed, including the waste allowance.
  const tonnes = volumeM3 * density * (1 + wastePct / 100);

  // Bulk bags are 0.85 tonne each; round up to whole bags.
  const bulkBags = volumeM3 > 0 ? Math.ceil(tonnes / BULK_BAG_TONNES) : 0;

  // Optional cost estimate.
  const cost = tonnes * pricePerTonne;

  return {
    currency,
    volumeM3: Math.round(volumeM3 * 1000) / 1000,
    tonnes: Math.round(tonnes * 100) / 100,
    bulkBags,
    cost: Math.round(cost * 100) / 100,
    isInvalid: false,
  };
}

export default calculateGravelCalculator;
