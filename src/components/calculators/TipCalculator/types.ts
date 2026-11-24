import type { Currency } from '../../../lib/regions';

export interface TipCalculatorInputs {
  currency: Currency;

  billAmount: number;

  tipPercentage: number;

  splitCount: number;

  useCustomSplit: boolean;
}

export interface TipCalculatorResult {
  currency: Currency;

  tipAmount: number;

  totalAmount: number;

  perPersonTotal: number;

  perPersonTip: number;

  perPersonBill: number;

  suggestions: {
    percentage: number;
    tipAmount: number;
    totalAmount: number;
    perPerson: number;
  }[];
}

export function getDefaultInputs(currency: Currency = 'USD'): TipCalculatorInputs {
  return {
    currency,
    billAmount: currency === 'GBP' ? 50 : currency === 'EUR' ? 60 : 50,
    tipPercentage: 0.18,
    splitCount: 1,
    useCustomSplit: false,
  };
}

export const DEFAULT_INPUTS: TipCalculatorInputs = getDefaultInputs('USD');
