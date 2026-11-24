import type { PointCurrency, DefaultAssumptions } from '../types';
import type { Destination } from '../../AviosDestinationFinder/types';
import { NOT_OFFERED } from '../../AviosDestinationFinder/types';
import { DESTINATIONS } from '../../AviosDestinationFinder/data/destinations';
import { CARDS } from './cards';

export const DEFAULT_POINT_VALUE_PENCE: Readonly<Record<PointCurrency, number>> = {
  avios: 1.0,
  membershipRewards: 1.0,
  virginPoints: 1.0,
  nectar: 0.5,
  clubcard: 1.0,
  revpoints: 1.0,
  cashback: 1.0,
  none: 0,
};

export const POINT_VALUE_SOURCES: Readonly<
  Record<PointCurrency, { readonly url: string; readonly verified: string; readonly note: string }>
> = {
  avios: {
    url: 'https://www.headforpoints.com/2026/05/30/what-is-an-avios-point-worth-8/',
    verified: '2026-09-02',
    note: 'Head for Points ball-park baseline.',
  },
  membershipRewards: {
    url: 'https://awardtravelfinder.com/amex-points-value',
    verified: '2026-09-02',
    note: 'Amex Travel portal fixed value.',
  },
  virginPoints: {
    url: 'https://rewardflights.co.uk/guides/how-much-are-virgin-points-worth',
    verified: '2026-09-02',
    note: 'Low end of the stated realistic-redemption range.',
  },
  nectar: {
    url: 'https://help.nectar.com/help/faqs/points',
    verified: '2026-09-02',
    note: 'Nectar Help Centre: 2,000 points = GBP10.',
  },
  clubcard: {
    url: 'https://www.moneysavingexpert.com/reclaim/reclaim-tesco-vouchers/',
    verified: '2026-09-02',
    note: 'Base in-store rate, excludes Reward Partner doubling.',
  },
  revpoints: {
    url: 'https://revpointsguide.com/how-to-convert-revpoint-to-avios-british-airways',
    verified: '2026-09-02',
    note: 'Priced at the 1:1 Avios transfer rate.',
  },
  cashback: { url: '', verified: '2026-09-02', note: 'Definitional: 1 unit = 1p per types.ts.' },
  none: { url: '', verified: '2026-09-02', note: 'No rewards currency.' },
};

export const DEFAULT_LOUNGE_VISIT_VALUE = 24;

export const DEFAULT_INSURANCE_VALUE = 32.17;

export const VOUCHER_BENCHMARK = { city: 'New York', cabin: 'economy', legs: 2 } as const;

export function resolveVoucherBenchmarkAvios(destinations: readonly Destination[]): number {
  const row = destinations.find((d) => d.city === VOUCHER_BENCHMARK.city);
  if (!row) {
    throw new Error(
      `Voucher benchmark destination "${VOUCHER_BENCHMARK.city}" not found in DESTINATIONS.`
    );
  }
  const pricing = row[VOUCHER_BENCHMARK.cabin];
  if (pricing === NOT_OFFERED) {
    throw new Error(
      `Voucher benchmark cabin "${VOUCHER_BENCHMARK.cabin}" not offered for "${VOUCHER_BENCHMARK.city}".`
    );
  }
  return pricing.offPeak * VOUCHER_BENCHMARK.legs;
}

export const VOUCHER_BENCHMARK_AVIOS = resolveVoucherBenchmarkAvios(DESTINATIONS);

export const DEFAULT_VOUCHER_VALUE = Math.round(
  (VOUCHER_BENCHMARK_AVIOS * DEFAULT_POINT_VALUE_PENCE.avios) / 100
);

export const DEFAULT_ASSUMPTIONS: DefaultAssumptions = {
  pointValuePence: DEFAULT_POINT_VALUE_PENCE,
  loungeVisitValue: DEFAULT_LOUNGE_VISIT_VALUE,
  insuranceValue: DEFAULT_INSURANCE_VALUE,
  voucherValue: DEFAULT_VOUCHER_VALUE,
};

export const DATA_LAST_VERIFIED = CARDS.reduce(
  (max, card) => (card.lastVerified > max ? card.lastVerified : max),
  CARDS[0].lastVerified
);
