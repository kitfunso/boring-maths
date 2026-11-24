export type Currency = 'USD' | 'GBP' | 'EUR';

export type Region = 'US' | 'UK' | 'EU';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
  region: Region;
}

export interface RegionDefaults {
  region: Region;
  currency: Currency;
  typicalTaxRate: number;
  statutoryVacationDays: number;
  publicHolidays: number;
  weekdaysPerYear: number;
  workingDaysPerMonth: number;
  taxRateDescription: string;
  vacationDescription: string;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    region: 'US',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    region: 'UK',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    region: 'EU',
  },
};

export const REGION_DEFAULTS: Record<Region, RegionDefaults> = {
  US: {
    region: 'US',
    currency: 'USD',
    typicalTaxRate: 0.3,
    statutoryVacationDays: 15,
    publicHolidays: 10,
    weekdaysPerYear: 260,
    workingDaysPerMonth: 21.67,
    taxRateDescription: 'Federal + State + Self-Employment Tax (typically 25-35%)',
    vacationDescription: 'No statutory minimum in US, 15 days is typical',
  },
  UK: {
    region: 'UK',
    currency: 'GBP',
    typicalTaxRate: 0.28,
    statutoryVacationDays: 20,
    publicHolidays: 8,
    weekdaysPerYear: 260,
    workingDaysPerMonth: 21.67,
    taxRateDescription: 'Income Tax + National Insurance Class 2 & 4 (typically 25-30%)',
    vacationDescription: 'UK statutory minimum: 28 days (including bank holidays)',
  },
  EU: {
    region: 'EU',
    currency: 'EUR',
    typicalTaxRate: 0.32,
    statutoryVacationDays: 25,
    publicHolidays: 10,
    weekdaysPerYear: 260,
    workingDaysPerMonth: 21.67,
    taxRateDescription: 'Income Tax + Social Contributions (varies by country, typically 30-40%)',
    vacationDescription: 'EU minimum: 20 days, many countries offer 25-30 days',
  },
};

export function getRegionFromCurrency(currency: Currency): Region {
  return CURRENCIES[currency].region;
}

export function getRegionDefaults(currency: Currency): RegionDefaults {
  const region = getRegionFromCurrency(currency);
  return REGION_DEFAULTS[region];
}

export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  const config = CURRENCIES[currency];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCompactCurrency(value: number, currency: Currency = 'USD'): string {
  const config = CURRENCIES[currency];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCIES[currency].symbol;
}

export function formatPercentage(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export const CURRENCY_OPTIONS: Array<{
  value: Currency;
  label: string;
  flag: string;
}> = [
  { value: 'USD', label: 'USD ($)', flag: '🇺🇸' },
  { value: 'GBP', label: 'GBP (£)', flag: '🇬🇧' },
  { value: 'EUR', label: 'EUR (€)', flag: '🇪🇺' },
];

export const SALARY_EXAMPLES: Record<Region, { low: number; mid: number; high: number }> = {
  US: { low: 50000, mid: 75000, high: 120000 },
  UK: { low: 35000, mid: 50000, high: 80000 },
  EU: { low: 40000, mid: 55000, high: 90000 },
};

export function getDefaultSalary(currency: Currency): number {
  const region = getRegionFromCurrency(currency);
  return SALARY_EXAMPLES[region].mid;
}

const CURRENCY_STORAGE_KEY = 'boring-math-currency';

export function getInitialCurrency(fallback: Currency = 'USD'): Currency {
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored && ['USD', 'GBP', 'EUR'].includes(stored)) {
      return stored as Currency;
    }
  } catch {
  }
  return fallback;
}
