/** ROI Calculator: return on investment with annualised ROI, entering either a final value or a gain amount over years or months. */

import type { Currency } from '../../../lib/regions';

/** Whether the user enters a final value or a gain amount */
export type InputMode = 'finalValue' | 'gainAmount';

/** Whether the time period is in years or months */
export type TimePeriodUnit = 'years' | 'months';

export interface ROICalculatorInputs {
  currency: Currency;

  initialInvestment: number;

  inputMode: InputMode;

  /** Final value of the investment (used when inputMode is 'finalValue') */
  finalValue: number;

  /** Gain or loss amount (used when inputMode is 'gainAmount') */
  gainAmount: number;

  timePeriod: number;

  timePeriodUnit: TimePeriodUnit;
}

export interface ROICalculatorResult {
  currency: Currency;

  totalGainLoss: number;

  finalValue: number;

  /** ROI as a percentage (e.g. 25 means 25%) */
  roiPercentage: number;

  /** Annualised ROI as a percentage */
  annualisedROI: number;

  timeInYears: number;

  isGain: boolean;

  /** Whether the result is valid (non-zero initial investment, positive time) */
  isValid: boolean;
}

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

export const DEFAULT_INPUTS: ROICalculatorInputs = getDefaultInputs('GBP');
