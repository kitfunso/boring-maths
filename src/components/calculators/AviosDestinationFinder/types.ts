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

export const TRIP_TYPES = ['return', 'oneWay'] as const;
export type TripType = (typeof TRIP_TYPES)[number];
export const SORT_KEYS = ['avios', 'value', 'cash', 'peakSaving', 'distance', 'name'] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const VOUCHER_TYPES = ['none', 'free', 'premiumPlus'] as const;
export type VoucherType = (typeof VOUCHER_TYPES)[number];

export const VOUCHER_LABELS: Readonly<Record<VoucherType, string>> = {
  none: 'None',
  free: 'Free BA Amex voucher',
  premiumPlus: 'BA Premium Plus voucher',
};

export interface PartyTotalsInputs {
  readonly oneWayAvios: number;
  readonly oneWayCash: number;
  readonly travellers: 1 | 2;
  readonly companionVoucher: boolean;
  readonly tripType: TripType;
}

export interface PartyPricing {
  readonly avios: number;
  readonly cash: number;
}

export interface SeasonalAvios {
  readonly offPeak: number;
  readonly peak: number;
  readonly cash: number;
}

export const NOT_OFFERED = 'not_offered' as const;
export type CabinPricing = SeasonalAvios | typeof NOT_OFFERED;

export interface Destination {
  readonly city: string;
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
  readonly dateFrom: string;
  readonly dateTo: string;
  readonly regions: readonly Region[];
  readonly holidayTypes: readonly HolidayType[];
  readonly cabin: Cabin;
  readonly travellers: 1 | 2;
  readonly voucher: VoucherType;
  readonly tripType: TripType;
  readonly sortKey: SortKey;
  readonly showOverBudget: boolean;
}

export interface SeasonWindow {
  readonly hasOffPeak: boolean;
  readonly hasPeak: boolean;
  readonly beyondCalendar: boolean;
}

export interface DestinationResult {
  readonly destination: Destination;
  readonly aviosOffPeak: number | null;
  readonly aviosPeak: number | null;
  readonly cashTotal: number;
  readonly rankAvios: number;
  readonly withinBudget: boolean;
  readonly budgetPercent: number;
  readonly distanceMiles: number;
  readonly valuePer1k: number;
  readonly peakSavingPct: number | null;
}

export interface AviosFinderResult {
  readonly ranked: readonly DestinationResult[];
  readonly affordable: readonly DestinationResult[];
  readonly overBudget: readonly DestinationResult[];
  readonly notOfferedCount: number;
  readonly seasons: SeasonWindow;
  readonly totalDestinations: number;
  readonly voucherApplied: boolean;
  readonly voucherSavingAvios: number;
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
    voucher: 'none',
    tripType: 'return',
    sortKey: 'avios',
    showOverBudget: true,
  };
}
