import type { ConcreteCalculatorInputs, ConcreteCalculatorResult } from './types';
import { FEET_TO_METRES, M3_TO_CUBIC_YARDS } from './types';

const safe = (v: number): number => (Number.isFinite(v) ? Math.max(0, v) : 0);

export function calculateConcreteCalculator(
  inputs: ConcreteCalculatorInputs
): ConcreteCalculatorResult {
  const { currency, shape, unit } = inputs;

  const length = safe(inputs.length);
  const width = safe(inputs.width);
  const depth = safe(inputs.depth);
  const wastePct = safe(inputs.wastePct);
  const bagYield = safe(inputs.bagYield);
  const bagPrice = safe(inputs.bagPrice);

  const factor = unit === 'ft' ? FEET_TO_METRES : 1;
  const lengthM = length * factor;
  const widthM = width * factor;
  const depthM = depth * factor;
  let volumeM3: number;
  if (shape === 'column') {
    const radiusM = widthM / 2;
    volumeM3 = Math.PI * radiusM * radiusM * depthM;
  } else {
    volumeM3 = lengthM * widthM * depthM;
  }

  const isInvalid = volumeM3 <= 0 || bagYield <= 0;

  const volumeWithWasteM3 = volumeM3 * (1 + wastePct / 100);
  const cubicYards = volumeWithWasteM3 * M3_TO_CUBIC_YARDS;

  const bags =
    volumeM3 > 0 && bagYield > 0
      ? Math.ceil(Math.round((volumeWithWasteM3 / bagYield) * 1e6) / 1e6)
      : 0;
  const cost = bags * bagPrice;

  const round = (v: number, dp: number): number => {
    const m = 10 ** dp;
    return Math.round(v * m) / m;
  };

  return {
    currency,
    volumeM3: round(volumeM3, 3),
    volumeWithWasteM3: round(volumeWithWasteM3, 3),
    cubicYards: round(cubicYards, 2),
    bags,
    cost: round(cost, 2),
    isInvalid,
  };
}

export default calculateConcreteCalculator;
