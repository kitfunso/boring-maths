/**
 * Region and Currency Configuration
 *
 * Provides region-specific defaults for tax rates, vacation days,
 * public holidays, and currency formatting across all calculators.
 */

/**
 * Supported currencies
 */
export type Currency = 'USD' | 'GBP' | 'EUR';

/**
 * Supported regions
 */
export type Region = 'US' | 'UK' | 'EU';

/**
 * Currency metadata
 */
export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
  region: Region;
}

/**
 * Region-specific defaults
 */
export interface RegionDefaults {
  region: Region;
  currency: Currency;
  /** Typical combined tax rate (income + self-employment/national insurance) */
  typicalTaxRate: number;
  /** Statutory minimum vacation days */
  statutoryVacationDays: number;
  /** Typical public holidays */
  publicHolidays: number;
  /** Standard weekdays per year */
  weekdaysPerYear: number;
  /** Average working days per month */
  workingDaysPerMonth: number;
  /** Tax rate description for UI */
  taxRateDescription: string;
  /** Vacation days description for UI */
  vacationDescription: string;
}

/**
 * Currency configurations
 */
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
    locale: 'de-DE', // Using German locale for EUR formatting
    region: 'EU',
  },
};

/**
 * Region-specific default values
 *
 * US: Higher tax for self-employed, no statutory vacation
 * UK: National Insurance + Income Tax, 28 days statutory (including holidays)
 * EU: Varies by country, using average values (Germany/France baseline)
 */
export const REGION_DEFAULTS: Record<Region, RegionDefaults> = {
  US: {
    region: 'US',
    currency: 'USD',
    // Federal (22%) + State avg (5%) + Self-employment (15.3%) = ~30-35%
    // Using 30% as reasonable estimate for freelancers
    typicalTaxRate: 0.30,
    // No statutory minimum, but typical is 10-15 days
    statutoryVacationDays: 15,
    // Federal holidays (11) but freelancers often work some
    publicHolidays: 10,
    weekdaysPerYear: 260,
    workingDaysPerMonth: 21.67,
    taxRateDescription: 'Federal + State + Self-Employment Tax (typically 25-35%)',
    vacationDescription: 'No statutory minimum in US, 15 days is typical',
  },
  UK: {
    region: 'UK',
    currency: 'GBP',
    // Basic rate (20%) + National Insurance (12% employee equiv, but as self-employed: 9% Class 4)
    // Higher rate starts at £50,270. Average freelancer: ~25-30%
    typicalTaxRate: 0.28,
    // UK statutory: 28 days including bank holidays, or 20 days + 8 bank holidays
    // For freelancers, we separate these
    statutoryVacationDays: 20,
    // 8 bank holidays in England/Wales
    publicHolidays: 8,
    weekdaysPerYear: 260,
    workingDaysPerMonth: 21.67,
    taxRateDescription: 'Income Tax + National Insurance Class 2 & 4 (typically 25-30%)',
    vacationDescription: 'UK statutory minimum: 28 days (including bank holidays)',
  },
  EU: {
    region: 'EU',
    currency: 'EUR',
    // EU average: Income tax varies widely (30-45% for higher earners)
    // Using 32% as a middle estimate (Germany/France average for freelancers)
    typicalTaxRate: 0.32,
    // EU minimum: 20 working days (4 weeks), many countries offer more
    // Germany: 20 min, France: 25, Netherlands: 20
    statutoryVacationDays: 25,
    // Varies: Germany 9-13, France 11, average ~10
    publicHolidays: 10,
    weekdaysPerYear: 260,
    workingDaysPerMonth: 21.67,
    taxRateDescription: 'Income Tax + Social Contributions (varies by country, typically 30-40%)',
    vacationDescription: 'EU minimum: 20 days, many countries offer 25-30 days',
  },
};

/**
 * Get region from currency
 */
export function getRegionFromCurrency(currency: Currency): Region {
  return CURRENCIES[currency].region;
}

/**
 * Get defaults for a currency/region
 */
export function getRegionDefaults(currency: Currency): RegionDefaults {
  const region = getRegionFromCurrency(currency);
  return REGION_DEFAULTS[region];
}

/**
 * Format a number as currency
 *
 * @param value - Number to format
 * @param currency - Currency code
 * @param decimals - Decimal places (default: 0 for whole units)
 * @returns Formatted currency string
 */
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

/**
 * Format a number as compact currency (e.g., $75K)
 *
 * @param value - Number to format
 * @param currency - Currency code
 * @returns Formatted compact currency string
 */
export function formatCompactCurrency(
  value: number,
  currency: Currency = 'USD'
): string {
  const config = CURRENCIES[currency];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCIES[currency].symbol;
}

/**
 * Format percentage
 *
 * @param value - Decimal value (0.25 = 25%)
 * @param decimals - Decimal places (default: 0)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Currency options for select dropdown
 */
export const CURRENCY_OPTIONS: Array<{
  value: Currency;
  label: string;
  flag: string;
}> = [
  { value: 'USD', label: 'USD ($)', flag: '🇺🇸' },
  { value: 'GBP', label: 'GBP (£)', flag: '🇬🇧' },
  { value: 'EUR', label: 'EUR (€)', flag: '🇪🇺' },
];

/**
 * Example salary ranges by region (for placeholder values)
 */
export const SALARY_EXAMPLES: Record<Region, { low: number; mid: number; high: number }> = {
  US: { low: 50000, mid: 75000, high: 120000 },
  UK: { low: 35000, mid: 50000, high: 80000 },
  EU: { low: 40000, mid: 55000, high: 90000 },
};

/**
 * Get a sensible default salary for a region
 */
export function getDefaultSalary(currency: Currency): number {
  const region = getRegionFromCurrency(currency);
  return SALARY_EXAMPLES[region].mid;
}
