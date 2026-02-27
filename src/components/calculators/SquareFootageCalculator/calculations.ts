/**
 * Square Footage Calculator - Calculation Logic
 *
 * Pure functions for calculating area across different room shapes
 * with unit conversions and cost estimation.
 */

import type { SquareFootageCalculatorInputs, SquareFootageCalculatorResult } from './types';

/** Conversion constants */
const SQ_FT_TO_SQ_M = 0.092903;
const SQ_FT_PER_SQ_YD = 9;
const FT_PER_METRE = 1 / 0.3048;

/**
 * Round to specified decimal places
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Convert a main + inches pair to total feet (imperial) or
 * convert metres to feet (metric)
 */
function toFeet(main: number, inches: number, isMetric: boolean): number {
  if (isMetric) {
    return main * FT_PER_METRE;
  }
  return main + inches / 12;
}

/**
 * Calculate area based on shape and inputs.
 * Returns area in square feet.
 */
function calculateAreaSqFt(inputs: SquareFootageCalculatorInputs): number {
  const isMetric = inputs.unitSystem === 'metric';

  switch (inputs.shape) {
    case 'rectangle': {
      const length = toFeet(inputs.rectLengthMain, inputs.rectLengthInches, isMetric);
      const width = toFeet(inputs.rectWidthMain, inputs.rectWidthInches, isMetric);
      return length * width;
    }

    case 'circle': {
      let radiusFt: number;
      const measurement = toFeet(inputs.circleMain, inputs.circleInches, isMetric);
      if (inputs.circleMode === 'diameter') {
        radiusFt = measurement / 2;
      } else {
        radiusFt = measurement;
      }
      return Math.PI * radiusFt * radiusFt;
    }

    case 'triangle': {
      const base = toFeet(inputs.triBaseMain, inputs.triBaseInches, isMetric);
      const height = toFeet(inputs.triHeightMain, inputs.triHeightInches, isMetric);
      return 0.5 * base * height;
    }

    case 'l-shape': {
      const l1 = toFeet(inputs.lLength1Main, inputs.lLength1Inches, isMetric);
      const w1 = toFeet(inputs.lWidth1Main, inputs.lWidth1Inches, isMetric);
      const l2 = toFeet(inputs.lLength2Main, inputs.lLength2Inches, isMetric);
      const w2 = toFeet(inputs.lWidth2Main, inputs.lWidth2Inches, isMetric);
      return l1 * w1 + l2 * w2;
    }

    default:
      return 0;
  }
}

/**
 * Calculate square footage and all conversions
 */
export function calculateSquareFootage(
  inputs: SquareFootageCalculatorInputs
): SquareFootageCalculatorResult {
  const sqFt = Math.max(0, calculateAreaSqFt(inputs));
  const sqM = sqFt * SQ_FT_TO_SQ_M;
  const sqYd = sqFt / SQ_FT_PER_SQ_YD;

  // Cost calculation: price is per sq ft (imperial) or per sq m (metric)
  const costArea = inputs.unitSystem === 'metric' ? sqM : sqFt;
  const totalCost = costArea * inputs.pricePerUnit;

  return {
    currency: inputs.currency,
    sqFt: round(sqFt),
    sqM: round(sqM),
    sqYd: round(sqYd),
    totalCost: round(totalCost),
    costUnitSystem: inputs.unitSystem,
    pricePerUnit: inputs.pricePerUnit,
  };
}

/**
 * Format area value with locale
 */
export function formatArea(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
