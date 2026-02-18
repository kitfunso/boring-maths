/**
 * Currency Converter - Calculation Logic
 */

import { USD_RATES, type CurrencyConverterInputs, type CurrencyConverterResult } from './types';

function round(value: number, decimals: number = 4): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function convertCurrency(inputs: CurrencyConverterInputs): CurrencyConverterResult {
  const { amount, fromCurrency, toCurrency } = inputs;

  const fromRate = USD_RATES[fromCurrency] || 1;
  const toRate = USD_RATES[toCurrency] || 1;

  // Convert: from -> USD -> to
  const rate = toRate / fromRate;
  const convertedAmount = amount * rate;

  return {
    convertedAmount: round(convertedAmount, 2),
    rate: round(rate, 6),
    inverseRate: round(1 / rate, 6),
    fromCurrency,
    toCurrency,
  };
}
