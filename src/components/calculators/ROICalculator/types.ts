import type { Currency } from '../../../lib/regions';

export type InputMode = 'finalValue' | 'gainAmount';

export type TimePeriodUnit = 'years' | 'months';

export interface ROICalculatorInputs {
  currency: Currency;

  initialInvestment: number;

  inputMode: InputMode;

  finalValue: number;

  gainAmount: number;

  timePeriod: number;

  timePeriodUnit: TimePeriodUnit;
}

export interface ROICalculatorResult {
  currency: Currency;

  totalGainLoss: number;

  finalValue: number;

  roiPercentage: number;

  annualisedROI: number;

  timeInYears: number;

  isGain: boolean;

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
