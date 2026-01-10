/**
 * Percentage Calculator - Type Definitions
 *
 * Handles multiple percentage calculation modes.
 */

/**
 * Calculation modes
 */
export type CalculationMode =
  | 'percentOf' // What is X% of Y?
  | 'whatPercent' // X is what % of Y?
  | 'percentChange' // % change from X to Y
  | 'increaseDecrease'; // X +/- Y%

/**
 * Input values for the Percentage Calculator
 */
export interface PercentageCalculatorInputs {
  mode: CalculationMode;

  // For percentOf: "What is [percentage]% of [value]?"
  percentOf_percentage: number;
  percentOf_value: number;

  // For whatPercent: "[partValue] is what % of [wholeValue]?"
  whatPercent_partValue: number;
  whatPercent_wholeValue: number;

  // For percentChange: "% change from [fromValue] to [toValue]"
  percentChange_fromValue: number;
  percentChange_toValue: number;

  // For increaseDecrease: "[value] +/- [percentage]%"
  increaseDecrease_value: number;
  increaseDecrease_percentage: number;
  increaseDecrease_isIncrease: boolean;
}

/**
 * Calculated results
 */
export interface PercentageCalculatorResult {
  mode: CalculationMode;

  // Main result (depends on mode)
  primaryResult: number;
  primaryLabel: string;

  // Additional context
  secondaryResult?: number;
  secondaryLabel?: string;

  // Formatted strings
  formattedPrimary: string;
  formattedSecondary?: string;

  // For percentOf mode - common percentages
  commonPercentages?: {
    percentage: number;
    result: number;
    formatted: string;
  }[];
}

/**
 * Mode configuration for UI
 */
export interface ModeConfig {
  value: CalculationMode;
  label: string;
  question: string;
  icon: string;
}

export const MODE_OPTIONS: ModeConfig[] = [
  {
    value: 'percentOf',
    label: 'X% of Y',
    question: 'What is X% of Y?',
    icon: '%',
  },
  {
    value: 'whatPercent',
    label: 'X is ?% of Y',
    question: 'X is what percent of Y?',
    icon: '?',
  },
  {
    value: 'percentChange',
    label: '% Change',
    question: 'Percent change from X to Y',
    icon: '±',
  },
  {
    value: 'increaseDecrease',
    label: 'X ± Y%',
    question: 'Increase or decrease X by Y%',
    icon: '↕',
  },
];

/**
 * Get default input values
 */
export function getDefaultInputs(): PercentageCalculatorInputs {
  return {
    mode: 'percentOf',
    percentOf_percentage: 15,
    percentOf_value: 200,
    whatPercent_partValue: 30,
    whatPercent_wholeValue: 150,
    percentChange_fromValue: 100,
    percentChange_toValue: 125,
    increaseDecrease_value: 100,
    increaseDecrease_percentage: 20,
    increaseDecrease_isIncrease: true,
  };
}
