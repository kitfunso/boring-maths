/**
 * Clay Shrinkage Calculator - Calculation Logic
 */

import type { ClayShrinkageInputs, ClayShrinkageResult } from './types';
import { CLAY_TYPES } from './types';

export function calculateClayShrinkage(inputs: ClayShrinkageInputs): ClayShrinkageResult {
  const { calculationMode, knownSize, shrinkagePercent, clayType } = inputs;

  // Get clay shrinkage data
  const clayData = CLAY_TYPES.find(c => c.value === clayType);
  const totalShrinkage = clayType === 'custom' ? shrinkagePercent : (clayData?.totalShrinkage || shrinkagePercent);
  const dryShrinkage = clayData?.dryShrinkage || totalShrinkage * 0.5;
  const firingShrinkage = totalShrinkage - dryShrinkage;

  // Shrinkage factor (what remains after shrinking)
  const shrinkageFactor = 1 - (totalShrinkage / 100);

  let resultSize: number;
  let sizeChange: number;

  if (calculationMode === 'thrown-to-fired') {
    // Known size is thrown (wet), calculate fired size
    // Fired Size = Thrown Size × (1 - Shrinkage%)
    resultSize = knownSize * shrinkageFactor;
    sizeChange = knownSize - resultSize;
  } else {
    // Known size is fired, calculate thrown (wet) size
    // Thrown Size = Fired Size / (1 - Shrinkage%)
    resultSize = knownSize / shrinkageFactor;
    sizeChange = resultSize - knownSize;
  }

  return {
    resultSize: Math.round(resultSize * 1000) / 1000,
    totalShrinkage,
    dryShrinkage,
    firingShrinkage,
    shrinkageFactor: Math.round(shrinkageFactor * 1000) / 1000,
    sizeChange: Math.round(sizeChange * 1000) / 1000,
  };
}

export function formatSize(value: number, unit: string): string {
  if (unit === 'cm') {
    return `${value.toFixed(2)} cm`;
  }
  // For inches, show fractions for common sizes
  const wholePart = Math.floor(value);
  const fractionPart = value - wholePart;

  if (fractionPart < 0.0625) {
    return `${wholePart}"`;
  }

  // Common fractions
  const fractions = [
    { decimal: 0.125, display: '⅛' },
    { decimal: 0.25, display: '¼' },
    { decimal: 0.375, display: '⅜' },
    { decimal: 0.5, display: '½' },
    { decimal: 0.625, display: '⅝' },
    { decimal: 0.75, display: '¾' },
    { decimal: 0.875, display: '⅞' },
  ];

  const closest = fractions.reduce((prev, curr) =>
    Math.abs(curr.decimal - fractionPart) < Math.abs(prev.decimal - fractionPart) ? curr : prev
  );

  if (wholePart === 0) {
    return `${closest.display}"`;
  }
  return `${wholePart}${closest.display}"`;
}

export function getShrinkageCategory(percent: number): { label: string; color: string } {
  if (percent < 8) return { label: 'Low Shrinkage', color: 'text-green-400' };
  if (percent < 11) return { label: 'Moderate Shrinkage', color: 'text-blue-400' };
  if (percent < 14) return { label: 'Standard Shrinkage', color: 'text-yellow-400' };
  return { label: 'High Shrinkage', color: 'text-orange-400' };
}

// Generate shrinkage table for common sizes
export function generateShrinkageTable(shrinkagePercent: number, unit: string): { thrown: number; fired: number }[] {
  const factor = 1 - (shrinkagePercent / 100);
  const sizes = unit === 'cm'
    ? [5, 10, 15, 20, 25, 30, 40, 50]
    : [2, 3, 4, 5, 6, 8, 10, 12];

  return sizes.map(thrown => ({
    thrown,
    fired: Math.round(thrown * factor * 100) / 100,
  }));
}
