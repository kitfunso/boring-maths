/**
 * Avios Destination Finder - Type Definitions
 *
 * Data model for BA reward-flight guide pricing. All pricing figures are
 * the lowest-cash Reward Flight Saver combination, one-way, to/from London,
 * post 15-Dec-2025 devaluation.
 * Source: headforpoints.com/2025/12/16/how-many-avios-do-i-need-to-fly-to-4/
 * (verified 2026-07-19). Guide prices only - reward seats are limited and
 * availability must be checked with the airline.
 */

export const REGIONS = [
  'Europe',
  'North America',
  'Caribbean & Central America',
  'South America',
  'Africa',
  'Middle East',
  'South Asia',
  'East & Southeast Asia',
  'Oceania',
] as const;
export type Region = (typeof REGIONS)[number];

export const HOLIDAY_TYPES = [
  'beach',
  'city',
  'winter-sun',
  'ski',
  'adventure',
  'island',
  'culture',
] as const;
export type HolidayType = (typeof HOLIDAY_TYPES)[number];

export const HOLIDAY_TYPE_LABELS: Readonly<Record<HolidayType, string>> = {
  beach: 'Beach',
  city: 'City break',
  'winter-sun': 'Winter sun',
  ski: 'Ski',
  adventure: 'Adventure & safari',
  island: 'Island',
  culture: 'Culture & history',
};

export type Cabin = 'economy' | 'premiumEconomy' | 'business';

export const CABIN_LABELS: Readonly<Record<Cabin, string>> = {
  economy: 'Economy',
  premiumEconomy: 'Premium Economy',
  business: 'Business (Club)',
};

export type TripType = 'return' | 'oneWay';
export type SortKey = 'avios' | 'distance' | 'name';

/** One-way Avios prices for a cabin plus the fixed GBP cash element. */
export interface SeasonalAvios {
  readonly offPeak: number;
  readonly peak: number;
  /** GBP per person per one-way leg (lowest-cash RFS combo). */
  readonly cash: number;
}

export const NOT_OFFERED = 'not_offered' as const;
export type CabinPricing = SeasonalAvios | typeof NOT_OFFERED;

export interface Destination {
  readonly city: string;
  /** Primary IATA airport code - stable row key. */
  readonly iata: string;
  readonly country: string;
  readonly region: Region;
  readonly holidayTypes: readonly HolidayType[];
  readonly economy: CabinPricing;
  readonly premiumEconomy: CabinPricing;
  readonly business: CabinPricing;
}

export interface AviosFinderInputs {
  readonly aviosBudget: number;
  /** ISO yyyy-mm-dd or '' for unset. */
  readonly dateFrom: string;
  readonly dateTo: string;
  /** Empty array = all regions. */
  readonly regions: readonly Region[];
  /** Empty array = all types. */
  readonly holidayTypes: readonly HolidayType[];
  readonly cabin: Cabin;
  readonly travellers: 1 | 2;
  readonly companionVoucher: boolean;
  readonly tripType: TripType;
  readonly sortKey: SortKey;
  readonly showOverBudget: boolean;
}

export interface SeasonWindow {
  readonly hasOffPeak: boolean;
  readonly hasPeak: boolean;
  /** Date range extends past the published calendar (2027+). */
  readonly beyondCalendar: boolean;
}

export interface DestinationResult {
  readonly destination: Destination;
  /** Total Avios for the whole party and trip; null if that season is outside the chosen dates. */
  readonly aviosOffPeak: number | null;
  readonly aviosPeak: number | null;
  /** Total GBP cash element for the whole party and trip. */
  readonly cashTotal: number;
  /** Ranking basis: cheapest applicable season total. */
  readonly rankAvios: number;
  readonly withinBudget: boolean;
  /** rankAvios as % of budget (0 budget -> 0). */
  readonly budgetPercent: number;
}

export interface AviosFinderResult {
  readonly affordable: readonly DestinationResult[];
  readonly overBudget: readonly DestinationResult[];
  /** Destinations hidden because the chosen cabin is not offered. */
  readonly notOfferedCount: number;
  readonly seasons: SeasonWindow;
  readonly totalDestinations: number;
}

export function getDefaultInputs(): AviosFinderInputs {
  return {
    aviosBudget: 50000,
    dateFrom: '',
    dateTo: '',
    regions: [],
    holidayTypes: [],
    cabin: 'economy',
    travellers: 2,
    companionVoucher: false,
    tripType: 'return',
    sortKey: 'avios',
    showOverBudget: true,
  };
}
