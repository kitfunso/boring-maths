/**
 * Percentage Calculator - Calculation Logic
 *
 * Pure functions for all percentage calculations.
 */

import type { PercentageCalculatorInputs, PercentageCalculatorResult } from './types';

/** Common percentages for quick reference */
const COMMON_PERCENTAGES = [5, 10, 15, 20, 25, 30, 50, 75, 100];

/**
 * Round to specified decimal places
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Format number with commas
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format as percentage string
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Calculate: What is X% of Y?
 */
function calculatePercentOf(percentage: number, value: number): number {
  return (percentage / 100) * value;
}

/**
 * Calculate: X is what % of Y?
 */
function calculateWhatPercent(part: number, whole: number): number {
  if (whole === 0) return 0;
  return (part / whole) * 100;
}

/**
 * Calculate: % change from X to Y
 */
function calculatePercentChange(from: number, to: number): number {
  if (from === 0) return to === 0 ? 0 : Infinity;
  return ((to - from) / Math.abs(from)) * 100;
}

/**
 * Calculate: X increased/decreased by Y%
 */
function calculateIncreaseDecrease(value: number, percentage: number, isIncrease: boolean): number {
  const multiplier = isIncrease ? (1 + percentage / 100) : (1 - percentage / 100);
  return value * multiplier;
}

/**
 * Main calculation function
 */
export function calculate(inputs: PercentageCalculatorInputs): PercentageCalculatorResult {
  const { mode } = inputs;

  switch (mode) {
    case 'percentOf': {
      const { percentOf_percentage, percentOf_value } = inputs;
      const result = calculatePercentOf(percentOf_percentage, percentOf_value);

      // Generate common percentages table
      const commonPercentages = COMMON_PERCENTAGES.map((pct) => ({
        percentage: pct,
        result: round(calculatePercentOf(pct, percentOf_value)),
        formatted: formatNumber(calculatePercentOf(pct, percentOf_value)),
      }));

      return {
        mode,
        primaryResult: round(result),
        primaryLabel: `${percentOf_percentage}% of ${formatNumber(percentOf_value)}`,
        formattedPrimary: formatNumber(result),
        commonPercentages,
      };
    }

    case 'whatPercent': {
      const { whatPercent_partValue, whatPercent_wholeValue } = inputs;
      const result = calculateWhatPercent(whatPercent_partValue, whatPercent_wholeValue);

      return {
        mode,
        primaryResult: round(result),
        primaryLabel: `${formatNumber(whatPercent_partValue)} is what % of ${formatNumber(whatPercent_wholeValue)}`,
        formattedPrimary: formatPercent(result),
        secondaryResult: whatPercent_wholeValue - whatPercent_partValue,
        secondaryLabel: 'Remaining',
        formattedSecondary: formatNumber(whatPercent_wholeValue - whatPercent_partValue),
      };
    }

    case 'percentChange': {
      const { percentChange_fromValue, percentChange_toValue } = inputs;
      const result = calculatePercentChange(percentChange_fromValue, percentChange_toValue);
      const difference = percentChange_toValue - percentChange_fromValue;

      return {
        mode,
        primaryResult: round(result),
        primaryLabel: `Change from ${formatNumber(percentChange_fromValue)} to ${formatNumber(percentChange_toValue)}`,
        formattedPrimary: result === Infinity ? '∞' : formatPercent(result),
        secondaryResult: difference,
        secondaryLabel: result >= 0 ? 'Increase' : 'Decrease',
        formattedSecondary: formatNumber(Math.abs(difference)),
      };
    }

    case 'increaseDecrease': {
      const { increaseDecrease_value, increaseDecrease_percentage, increaseDecrease_isIncrease } = inputs;
      const result = calculateIncreaseDecrease(
        increaseDecrease_value,
        increaseDecrease_percentage,
        increaseDecrease_isIncrease
      );
      const difference = Math.abs(result - increaseDecrease_value);

      return {
        mode,
        primaryResult: round(result),
        primaryLabel: `${formatNumber(increaseDecrease_value)} ${increaseDecrease_isIncrease ? '+' : '-'} ${increaseDecrease_percentage}%`,
        formattedPrimary: formatNumber(result),
        secondaryResult: difference,
        secondaryLabel: increaseDecrease_isIncrease ? 'Added' : 'Subtracted',
        formattedSecondary: formatNumber(difference),
      };
    }

    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}
