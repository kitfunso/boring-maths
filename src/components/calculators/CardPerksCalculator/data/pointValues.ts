/** Default pence-per-point valuations and lounge/insurance/voucher assumptions.
 *  Each figure is cited inline; users can override every one in the calculator UI. */

import type { PointCurrency, DefaultAssumptions } from '../types';
import type { Destination } from '../../AviosDestinationFinder/types';
import { NOT_OFFERED } from '../../AviosDestinationFinder/types';
import { DESTINATIONS } from '../../AviosDestinationFinder/data/destinations';
import { CARDS } from './cards';

export const DEFAULT_POINT_VALUE_PENCE: Readonly<Record<PointCurrency, number>> = {
  // https://www.headforpoints.com/2026/05/30/what-is-an-avios-point-worth-8/ (fetched 2026-09-02): "we use 1p as a ball-park figure".
  avios: 1.0,
  // https://awardtravelfinder.com/amex-points-value (fetched 2026-09-02): Amex Travel portal value fixed at 1.0 cent/point.
  membershipRewards: 1.0,
  // https://rewardflights.co.uk/guides/how-much-are-virgin-points-worth (fetched 2026-09-02): realistic redemptions run 1.0p-2.5p; low end used.
  virginPoints: 1.0,
  // https://help.nectar.com/help/faqs/points (fetched 2026-09-02): "2,000 Nectar points are worth GBP10" = 0.5p/point.
  nectar: 0.5,
  // https://www.moneysavingexpert.com/reclaim/reclaim-tesco-vouchers/ (fetched 2026-09-02): "Each point is worth 1p to spend in Tesco".
  clubcard: 1.0,
  // https://revpointsguide.com/how-to-convert-revpoint-to-avios-british-airways (fetched 2026-09-02): "1 RevPoint becomes 1 Avios", so priced at the Avios rate above.
  revpoints: 1.0,
  // Definitional: types.ts defines cashback as pence of cash back per unit, so 1 unit is always 1p.
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

// https://www.barclaycard.co.uk/personal/credit-cards/avios-plus and https://monzo.com/current-account/max
// (both fetched 2026-09-02, see cards.ts lounge fields): GBP24 is the shared discounted per-visit lounge price.
export const DEFAULT_LOUNGE_VISIT_VALUE = 24;

// https://www.moneysupermarket.com/travel-insurance/annual-multi-trip/ (fetched 2026-09-02): "typical cost ... GBP32.17 on average".
export const DEFAULT_INSURANCE_VALUE = 32.17;

export const VOUCHER_BENCHMARK = { city: 'New York', cabin: 'economy', legs: 2 } as const;

/** Off-peak Avios for VOUCHER_BENCHMARK.cabin to VOUCHER_BENCHMARK.city, times legs; throws by name if the row or cabin is missing. */
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

// Two-leg New York economy off-peak Avios priced at the Avios point value above, rounded to the nearest GBP.
export const DEFAULT_VOUCHER_VALUE = Math.round(
  (VOUCHER_BENCHMARK_AVIOS * DEFAULT_POINT_VALUE_PENCE.avios) / 100
);

export const DEFAULT_ASSUMPTIONS: DefaultAssumptions = {
  pointValuePence: DEFAULT_POINT_VALUE_PENCE,
  loungeVisitValue: DEFAULT_LOUNGE_VISIT_VALUE,
  insuranceValue: DEFAULT_INSURANCE_VALUE,
  voucherValue: DEFAULT_VOUCHER_VALUE,
};

/** Max lastVerified across CARDS, shown in the UI as the dataset freshness date. */
export const DATA_LAST_VERIFIED = CARDS.reduce(
  (max, card) => (card.lastVerified > max ? card.lastVerified : max),
  CARDS[0].lastVerified
);
