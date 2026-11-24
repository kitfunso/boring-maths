import type { GravelCalculatorInputs, GravelCalculatorResult } from './types';
import { BULK_BAG_TONNES } from './types';

const FT_TO_M = 0.3048;

const safe = (v: number): number => (Number.isFinite(v) ? Math.max(0, v) : 0);

export function calculateGravelCalculator(inputs: GravelCalculatorInputs): GravelCalculatorResult {
  const { currency } = inputs;

  const length = safe(inputs.length);
  const width = safe(inputs.width);
  const depth = safe(inputs.depth);
  const density = safe(inputs.density);
  const wastePct = safe(inputs.wastePct);
  const pricePerTonne = safe(inputs.pricePerTonne);

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

  const volumeM3 = lengthM * widthM * depthM;

  const tonnes = volumeM3 * density * (1 + wastePct / 100);

  const bulkBags = volumeM3 > 0 ? Math.ceil(tonnes / BULK_BAG_TONNES) : 0;

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
