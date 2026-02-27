/**
 * ROI Calculator - Type Definitions
 *
 * Return on Investment calculator with annualised ROI
 * and flexible input modes (final value or gain amount).
 */

import type { Currency } from '../../../lib/regions';

/** Whether the user enters a final value or a gain amount */
export type InputMode = 'finalValue' | 'gainAmount';

/** Whether the time period is in years or months */
export type TimePeriodUnit = 'years' | 'months';

/**
 * Input values for the ROI Calculator
 */
export interface ROICalculatorInputs {
  /** Selected currency */
  currency: Currency;

  /** Initial investment amount */
  initialInvestment: number;

  /** Toggle between entering final value or gain amount */
  inputMode: InputMode;

  /** Final value of the investment (used when inputMode is 'finalValue') */
  finalValue: number;

  /** Gain or loss amount (used when inputMode is 'gainAmount') */
  gainAmount: number;

  /** Time period numeric value */
  timePeriod: number;

  /** Time period unit */
  timePeriodUnit: TimePeriodUnit;
}

/**
 * Calculated results from the ROI Calculator
 */
export interface ROICalculatorResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Total gain or loss in currency */
  totalGainLoss: number;

  /** Final value of the investment */
  finalValue: number;

  /** ROI as a percentage (e.g. 25 means 25%) */
  roiPercentage: number;

  /** Annualised ROI as a percentage */
  annualisedROI: number;

  /** Time period in years */
  timeInYears: number;

  /** Whether the investment is a gain or loss */
  isGain: boolean;

  /** Whether the result is valid (non-zero initial investment, positive time) */
  isValid: boolean;
}

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'GBP'): ROICalculatorInputs {
  return {
    currency,
    initialInvestment: currency === 'GBP' ? 10000 : currency === 'EUR' ? 10000 : 10000,
    inputMode: 'finalValue',
    finalValue: currency === 'GBP' ? 15000 : currency === 'EUR' ? 15000 : 15000,
    gainAmount: 5000,
    timePeriod: 3,
    timePeriodUnit: 'years',
  };
}

/**
 * Default input values (GBP)
 */
export const DEFAULT_INPUTS: ROICalculatorInputs = getDefaultInputs('GBP');
