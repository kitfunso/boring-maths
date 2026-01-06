/**
 * Unit Converter - Calculation Logic
 */

import type { UnitConverterInputs, UnitConverterResult, UnitCategory } from './types';
import { UNITS } from './types';

function round(value: number, decimals: number = 6): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Get appropriate decimal places based on magnitude
 */
function getDecimals(value: number): number {
  if (value === 0) return 0;
  const absVal = Math.abs(value);
  if (absVal >= 1000) return 2;
  if (absVal >= 1) return 4;
  if (absVal >= 0.001) return 6;
  return 8;
}

/**
 * Format number with appropriate precision
 */
function formatValue(value: number): string {
  const decimals = getDecimals(value);
  const rounded = round(value, decimals);

  // Use scientific notation for very large or very small numbers
  if (Math.abs(rounded) >= 1e9 || (Math.abs(rounded) < 0.0001 && rounded !== 0)) {
    return rounded.toExponential(4);
  }

  return rounded.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Convert between units
 */
export function convert(inputs: UnitConverterInputs): UnitConverterResult {
  const { category, fromUnit, toUnit, value } = inputs;

  const units = UNITS[category];
  const from = units.find(u => u.value === fromUnit);
  const to = units.find(u => u.value === toUnit);

  if (!from || !to) {
    return {
      value: 0,
      fromUnit,
      toUnit,
      formatted: '0',
    };
  }

  // Convert to base unit, then to target unit
  const baseValue = from.toBase(value);
  const result = to.fromBase(baseValue);

  return {
    value: result,
    fromUnit,
    toUnit,
    formatted: formatValue(result),
  };
}

/**
 * Get all conversions for a value
 */
export function getAllConversions(
  value: number,
  fromUnit: string,
  category: UnitCategory
): Array<{ unit: string; label: string; value: string }> {
  const units = UNITS[category];
  const from = units.find(u => u.value === fromUnit);

  if (!from) return [];

  const baseValue = from.toBase(value);

  return units
    .filter(u => u.value !== fromUnit)
    .map(u => ({
      unit: u.value,
      label: u.label,
      value: formatValue(u.fromBase(baseValue)),
    }));
}
