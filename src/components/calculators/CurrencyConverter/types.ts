/**
 * Currency Converter - Type Definitions
 */

export interface CurrencyConverterInputs {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

export interface CurrencyConverterResult {
  convertedAmount: number;
  rate: number;
  inverseRate: number;
  fromCurrency: string;
  toCurrency: string;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
];

// Static rates relative to USD (approximate as of early 2026)
// Good enough for an educational calculator; updated periodically
export const USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.4,
  NZD: 1.63,
  SEK: 10.45,
  SGD: 1.34,
  HKD: 7.82,
  NOK: 10.55,
  MXN: 17.15,
  ZAR: 18.65,
  KRW: 1320,
  BRL: 4.97,
  AED: 3.67,
  PLN: 4.02,
};

export function getDefaultInputs(): CurrencyConverterInputs {
  return {
    amount: 100,
    fromCurrency: 'USD',
    toCurrency: 'GBP',
  };
}
