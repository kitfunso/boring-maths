# Avios Destination Finder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** A static client-side finder answering "where can my Avios take me?" — search every BA destination at once by Avios budget, date range, region, and holiday type, ranked and sortable, with companion-voucher support.

**Architecture:** New Preact island `AviosDestinationFinder` following the `TippingGuideCalculator` pattern (useCalculatorBase hook, ui/ kit, data-in-TS-files). Pricing is BA's published per-destination Reward Flight Saver table (post-15-Dec-2025, one-way from London, lowest-cash combo), peak/off-peak resolved from BA's 2026 calendar. No live availability — computed guide prices only, disclosed in UI.

**Tech Stack:** Astro 5 + Preact + Tailwind 4, Vitest, existing ui/ design system. No new dependencies.

**Verified data sources (all fetched 2026-07-19, capture doc: session scratchpad `DATA-VERIFICATION.md`, reproduced inline below where needed):**
- Pricing table: https://www.headforpoints.com/2025/12/16/how-many-avios-do-i-need-to-fly-to-4/ (per-destination, one-way, London, Econ/PE/Business x peak/off-peak, "+£N" = lowest-cash RFS combo; fixed pricing, not dynamic; First class excluded → v2)
- Peak calendar 2026: https://awardwallet.com/airlines/avios-peak-calendar/ (day-level), corroborated by https://www.aviosintelligence.com/reports/avios-peak-off-peak-dates (2027 unpublished in text → treat as both-seasons + provisional note)
- Companion voucher: https://www.headforpoints.com/2026/01/03/how-do-british-airways-american-express-241-companion-vouchers-work/ + BA T&Cs: 2-for-1 second seat on BA/Iberia/Aer Lingus reward bookings, no codeshares; free-card voucher economy-only valid 1yr; Premium Plus all cabins 2yr; taxes/fees payable for both passengers. Solo 50% variant exists but is OUT OF SCOPE v1.

**Out of scope v1 (signed off):** First class cabin, solo-voucher 50% discount, RFS multi-combo tiers (we quote the lowest-cash combo only), per-destination ba.com deep links (generic link only), shareable-search URLs, embed route, summary-strip insights.

**Conventions that bind every task:** registry `href` has trailing slash; page `canonicalURL` const is slash-less; icon must be from the existing IconName union (`'trending'`); tests in `tests/calculations/` kebab-named; NEVER `--no-verify`; commit messages contain no em dashes, written via the Write tool and passed with `git commit -F`.

**Post-review amendment (applied after Tasks 0-3 quality review):** helpers are verb-first — `resolveSeasonsForRange` and `calculatePartyTotals`; `calculatePartyTotals` takes a single `PartyTotalsInputs` object (`{ oneWayAvios, oneWayCash, travellers, companionVoucher, tripType }`); `PartyPricing`/`PartyTotalsInputs` live in `types.ts`; ranges longer than 730 days return the widest honest answer (both seasons) instead of a truncated result; `beyondCalendar` short-circuits before the day loop. Task 5's code below reflects this contract.

---

### Task 0: Branch

**Step 1:** Verify current branch and create feature branch:

```bash
git -C C:/Users/skf_s/boring-maths branch --show-current
```
Expected: `master`

```bash
git -C C:/Users/skf_s/boring-maths checkout -b feat/avios-destination-finder
```
Expected: `Switched to a new branch 'feat/avios-destination-finder'`

---

### Task 1: Types

**Files:**
- Create: `src/components/calculators/AviosDestinationFinder/types.ts`

**Step 1: Write the file** (complete code):

```ts
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
```

**Step 2: Typecheck via lint** — Run: `npm run lint` (from repo root). Expected: no new errors.

**Step 3: Commit**

Write `.git-msg.txt` via the Write tool:
```
feat: add Avios Destination Finder types
```
```bash
git add src/components/calculators/AviosDestinationFinder/types.ts
git commit -F .git-msg.txt
```

---

### Task 2: Peak calendar data + season resolution (TDD)

**Files:**
- Create: `src/components/calculators/AviosDestinationFinder/data/peakCalendar.ts`
- Create: `src/components/calculators/AviosDestinationFinder/calculations.ts`
- Test: `tests/calculations/avios-destination-finder.test.ts`

**Step 1: Write the failing tests** (start the test file):

```ts
/**
 * Avios Destination Finder - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { seasonsForRange } from '../../src/components/calculators/AviosDestinationFinder/calculations';

describe('AviosDestinationFinder', () => {
  describe('seasonsForRange', () => {
    it('treats unset dates as both seasons', () => {
      const s = seasonsForRange('', '');
      expect(s).toEqual({ hasOffPeak: true, hasPeak: true, beyondCalendar: false });
    });

    it('resolves an off-peak-only range (June midweek)', () => {
      const s = seasonsForRange('2026-06-08', '2026-06-11');
      expect(s).toEqual({ hasOffPeak: true, hasPeak: false, beyondCalendar: false });
    });

    it('resolves a peak-only range (all August is peak)', () => {
      const s = seasonsForRange('2026-08-03', '2026-08-14');
      expect(s).toEqual({ hasOffPeak: false, hasPeak: true, beyondCalendar: false });
    });

    it('resolves a spanning range (late June into July peak)', () => {
      const s = seasonsForRange('2026-06-29', '2026-07-05');
      expect(s.hasOffPeak).toBe(true);
      expect(s.hasPeak).toBe(true);
      expect(s.beyondCalendar).toBe(false);
    });

    it('handles a single peak day (1 Nov 2026)', () => {
      const s = seasonsForRange('2026-11-01', '2026-11-01');
      expect(s).toEqual({ hasOffPeak: false, hasPeak: true, beyondCalendar: false });
    });

    it('flags ranges beyond the published calendar as both + provisional', () => {
      const s = seasonsForRange('2027-02-01', '2027-02-10');
      expect(s.hasOffPeak).toBe(true);
      expect(s.hasPeak).toBe(true);
      expect(s.beyondCalendar).toBe(true);
    });

    it('treats an invalid range (from after to) as both seasons', () => {
      const s = seasonsForRange('2026-06-20', '2026-06-01');
      expect(s).toEqual({ hasOffPeak: true, hasPeak: true, beyondCalendar: false });
    });
  });
});
```

**Step 2: Run to verify failure** — Run: `npm test -- tests/calculations/avios-destination-finder.test.ts`
Expected: FAIL (cannot resolve `calculations`).

**Step 3: Write the data file** `data/peakCalendar.ts` (complete code; dates verbatim from awardwallet.com/airlines/avios-peak-calendar/, corroborated by aviosintelligence.com, both fetched 2026-07-19):

```ts
/**
 * BA peak / off-peak calendar for Avios reward flights - 2026.
 * PEAK dates below; every other 2026 date is off-peak.
 * Source: https://awardwallet.com/airlines/avios-peak-calendar/ (fetched 2026-07-19),
 * corroborated by https://www.aviosintelligence.com/reports/avios-peak-off-peak-dates.
 * 2027 calendar is not yet published in text form - dates beyond
 * CALENDAR_PUBLISHED_THROUGH are treated as "could be either season".
 */

export interface DateRange {
  readonly from: string; // ISO yyyy-mm-dd inclusive
  readonly to: string; // ISO yyyy-mm-dd inclusive
}

export const PEAK_RANGES_2026: readonly DateRange[] = [
  { from: '2026-01-01', to: '2026-01-04' },
  { from: '2026-02-13', to: '2026-02-15' },
  { from: '2026-02-20', to: '2026-02-22' },
  { from: '2026-03-27', to: '2026-03-30' },
  { from: '2026-04-02', to: '2026-04-06' },
  { from: '2026-04-09', to: '2026-04-12' },
  { from: '2026-05-01', to: '2026-05-04' },
  { from: '2026-05-22', to: '2026-05-31' },
  { from: '2026-06-06', to: '2026-06-07' },
  { from: '2026-06-12', to: '2026-06-14' },
  { from: '2026-06-19', to: '2026-06-21' },
  { from: '2026-06-26', to: '2026-06-28' },
  { from: '2026-07-03', to: '2026-07-13' },
  { from: '2026-07-15', to: '2026-07-20' },
  { from: '2026-07-22', to: '2026-07-31' },
  { from: '2026-08-01', to: '2026-08-31' },
  { from: '2026-09-01', to: '2026-09-01' },
  { from: '2026-09-04', to: '2026-09-06' },
  { from: '2026-09-11', to: '2026-09-13' },
  { from: '2026-09-18', to: '2026-09-20' },
  { from: '2026-09-25', to: '2026-09-27' },
  { from: '2026-10-23', to: '2026-10-25' },
  { from: '2026-10-30', to: '2026-10-31' },
  { from: '2026-11-01', to: '2026-11-01' },
  { from: '2026-11-21', to: '2026-11-21' },
  { from: '2026-11-29', to: '2026-11-29' },
  { from: '2026-12-12', to: '2026-12-13' },
  { from: '2026-12-18', to: '2026-12-24' },
  { from: '2026-12-26', to: '2026-12-31' },
];

export const CALENDAR_PUBLISHED_THROUGH = '2026-12-31';

/** Shown in the UI so users know how fresh the guide data is. */
export const DATA_LAST_VERIFIED = '2026-07-19';
```

**Step 4: Write `seasonsForRange` in `calculations.ts`:**

```ts
/**
 * Avios Destination Finder - Calculation Logic
 *
 * Pure functions. No live availability - guide prices from BA's published
 * Reward Flight Saver table (see data/ file headers for sources).
 */

import type {
  AviosFinderInputs,
  AviosFinderResult,
  CabinPricing,
  Destination,
  DestinationResult,
  SeasonWindow,
  TripType,
} from './types';
import { NOT_OFFERED } from './types';
import { CALENDAR_PUBLISHED_THROUGH, PEAK_RANGES_2026 } from './data/peakCalendar';

const MS_PER_DAY = 86_400_000;
/** Safety cap so a pathological range cannot spin the day loop. */
const MAX_RANGE_DAYS = 730;

function toUtc(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

const PEAK_INTERVALS: readonly { start: number; end: number }[] = PEAK_RANGES_2026.map((r) => ({
  start: toUtc(r.from),
  end: toUtc(r.to),
}));

function isPeakDay(t: number): boolean {
  return PEAK_INTERVALS.some((p) => t >= p.start && t <= p.end);
}

const BOTH_SEASONS: SeasonWindow = { hasOffPeak: true, hasPeak: true, beyondCalendar: false };

/**
 * Resolve a date range to the seasons it can contain.
 * Unset or invalid ranges resolve to "both" so the finder still works
 * without dates. Days past the published calendar count as both seasons
 * and set beyondCalendar so the UI can show a "provisional" note.
 */
export function seasonsForRange(dateFrom: string, dateTo: string): SeasonWindow {
  if (!dateFrom || !dateTo) return BOTH_SEASONS;
  const from = toUtc(dateFrom);
  const to = toUtc(dateTo);
  if (Number.isNaN(from) || Number.isNaN(to) || from > to) return BOTH_SEASONS;

  const publishedEnd = toUtc(CALENDAR_PUBLISHED_THROUGH);
  const beyondCalendar = to > publishedEnd;
  const cappedTo = Math.min(to, publishedEnd, from + MAX_RANGE_DAYS * MS_PER_DAY);

  let hasOffPeak = false;
  let hasPeak = false;
  for (let t = from; t <= cappedTo; t += MS_PER_DAY) {
    if (isPeakDay(t)) hasPeak = true;
    else hasOffPeak = true;
    if (hasPeak && hasOffPeak) break;
  }
  if (beyondCalendar) return { hasOffPeak: true, hasPeak: true, beyondCalendar: true };
  return { hasOffPeak, hasPeak, beyondCalendar: false };
}
```

**Step 5: Run tests** — Run: `npm test -- tests/calculations/avios-destination-finder.test.ts`
Expected: PASS (7 tests).

**Step 6: Commit** — message `feat: add BA peak calendar data and season resolution`; `git add` the three files, `git commit -F .git-msg.txt`.

---

### Task 3: Voucher rules + party totals (TDD)

**Files:**
- Create: `src/components/calculators/AviosDestinationFinder/data/voucherRules.ts`
- Modify: `src/components/calculators/AviosDestinationFinder/calculations.ts` (append)
- Test: append to `tests/calculations/avios-destination-finder.test.ts`

**Step 1: Failing tests** (append inside the top-level describe):

```ts
  describe('partyTotals', () => {
    // Amsterdam economy off-peak anchor: 10,000 Avios + £1 one-way per person.
    it('doubles Avios and cash for 2 travellers without a voucher, return', () => {
      const t = partyTotals(10000, 1, 2, false, 'return');
      expect(t.avios).toBe(40000); // 10,000 x 2 pax x 2 legs
      expect(t.cash).toBe(4); // £1 x 2 pax x 2 legs
    });

    it('halves the Avios (not the cash) with a companion voucher for 2', () => {
      const t = partyTotals(10000, 1, 2, true, 'return');
      expect(t.avios).toBe(20000); // second seat costs no Avios
      expect(t.cash).toBe(4); // taxes/fees still due for both passengers
    });

    it('ignores the voucher for a single traveller (solo variant is out of scope v1)', () => {
      const t = partyTotals(10000, 1, 1, true, 'oneWay');
      expect(t.avios).toBe(10000);
      expect(t.cash).toBe(1);
    });

    it('one-way is half of return', () => {
      const ret = partyTotals(27500, 60, 1, false, 'return');
      const ow = partyTotals(27500, 60, 1, false, 'oneWay');
      expect(ret.avios).toBe(ow.avios * 2);
      expect(ret.cash).toBe(ow.cash * 2);
    });
  });
```

Add `partyTotals` to the test file's import list.

**Step 2: Run to verify failure** — Expected: FAIL (`partyTotals` not exported).

**Step 3: Write `data/voucherRules.ts`** (provenance-bearing data referenced by UI copy):

```ts
/**
 * BA Amex Companion Voucher rules used by this finder.
 * Sources (fetched 2026-07-19):
 * - https://www.headforpoints.com/2026/01/03/how-do-british-airways-american-express-241-companion-vouchers-work/
 * - BA T&Cs: britishairways.com .../gb-companion-voucher-terms
 * v1 models the 2-traveller 2-for-1 only; the solo 50% variant is v2.
 */
export const VOUCHER_RULES = {
  /** Second seat on the same reward booking costs no Avios. */
  secondSeatAviosFree: true,
  /** Taxes, fees and charges remain payable for BOTH passengers. */
  cashPayableForBoth: true,
  /** Works on British Airways, Iberia and Aer Lingus reward seats; not codeshares. */
  airlines: ['British Airways', 'Iberia', 'Aer Lingus'] as const,
  /** Free BA Amex voucher: economy only, valid 1 year. Premium Plus: all cabins, 2 years. */
  freeCardEconomyOnly: true,
  premiumPlusAllCabins: true,
} as const;
```

**Step 4: Append to `calculations.ts`:**

```ts
export interface PartyPricing {
  readonly avios: number;
  readonly cash: number;
}

/**
 * Total Avios + cash for the whole party and trip.
 * Companion voucher (2 travellers): second seat costs no Avios, but the
 * cash element is always payable per person (VOUCHER_RULES).
 */
export function partyTotals(
  oneWayAvios: number,
  oneWayCash: number,
  travellers: 1 | 2,
  companionVoucher: boolean,
  tripType: TripType
): PartyPricing {
  const legs = tripType === 'return' ? 2 : 1;
  const aviosSeats = travellers === 2 && companionVoucher ? 1 : travellers;
  return {
    avios: oneWayAvios * aviosSeats * legs,
    cash: oneWayCash * travellers * legs,
  };
}
```

**Step 5: Run tests** — Expected: PASS (11 tests).

**Step 6: Commit** — `feat: add companion voucher rules and party totals`.

---

### Task 4: Destination data capture (integrity-tests-first)

This is the No-Fabrication-critical task. The full per-destination table is captured from the verified source, chunk by chunk, and locked to the 10 anchor rows below. **No number may be typed from memory.**

**Files:**
- Create: `src/components/calculators/AviosDestinationFinder/data/destinations.ts`
- Test: append to `tests/calculations/avios-destination-finder.test.ts`

**Step 1: Write the failing integrity tests first** (append):

```ts
  describe('destination data integrity', () => {
    const byCity = (city: string) => DESTINATIONS.find((d) => d.city === city);

    it('has a meaningful catalogue size', () => {
      expect(DESTINATIONS.length).toBeGreaterThanOrEqual(100);
    });

    it('has unique IATA keys', () => {
      const codes = DESTINATIONS.map((d) => d.iata);
      expect(new Set(codes).size).toBe(codes.length);
    });

    it('every destination has a region, at least one holiday type, and economy pricing', () => {
      for (const d of DESTINATIONS) {
        expect(REGIONS).toContain(d.region);
        expect(d.holidayTypes.length).toBeGreaterThan(0);
        expect(d.economy).not.toBe('not_offered');
      }
    });

    it('off-peak never exceeds peak for any offered cabin', () => {
      for (const d of DESTINATIONS) {
        for (const cabin of [d.economy, d.premiumEconomy, d.business]) {
          if (cabin !== 'not_offered') {
            expect(cabin.offPeak).toBeLessThanOrEqual(cabin.peak);
            expect(cabin.cash).toBeGreaterThanOrEqual(0);
          }
        }
      }
    });

    // Anchor rows: verbatim from headforpoints.com table (fetched 2026-07-19).
    // These lock the captured dataset to the verified source.
    const ANCHORS: ReadonlyArray<
      [string, number, number, number, number, number, number]
    > = [
      // [city, econOff, econPeak, econCash, bizOff, bizPeak, bizCash]
      ['Amsterdam', 10000, 10750, 1, 16500, 18000, 15],
      ['Malaga', 13000, 14000, 1, 22000, 24500, 15],
      ['Athens', 15000, 16750, 1, 26750, 30000, 15],
      ['Dubai', 27500, 33000, 60, 88000, 99000, 199.5],
      ['New York', 27500, 33000, 60, 88000, 99000, 199.5],
      ['Miami', 33000, 38500, 85, 99000, 110000, 249.5],
      ['Cape Town', 33000, 38500, 85, 99000, 110000, 249.5],
      ['Tokyo', 38500, 44000, 110, 110000, 121000, 299.5],
      ['Singapore', 44000, 49500, 135, 121000, 132000, 335],
      ['Sydney', 55000, 60500, 160, 159500, 187000, 399.5],
    ];

    it.each(ANCHORS)(
      '%s matches the verified source row',
      (city, econOff, econPeak, econCash, bizOff, bizPeak, bizCash) => {
        const d = byCity(city);
        expect(d).toBeDefined();
        expect(d!.economy).toEqual({ offPeak: econOff, peak: econPeak, cash: econCash });
        expect(d!.business).toEqual({ offPeak: bizOff, peak: bizPeak, cash: bizCash });
      }
    );
  });
```

Add imports: `DESTINATIONS` from the data file, `REGIONS` from types.

**Step 2: Run to verify failure** — Expected: FAIL (data file missing).

**Step 3: Capture the table in chunks.** Dispatch parallel WebFetch calls against `https://www.headforpoints.com/2025/12/16/how-many-avios-do-i-need-to-fly-to-4/` with prompts of the form:

> "From the pricing table, list VERBATIM every destination row whose name starts with A-C [then D-I, J-M, N-R, S-Z]: destination name, Economy off-peak, Economy peak, Premium Economy off-peak, Premium Economy peak, Business off-peak, Business peak, including the +£ cash figure on each. Do not summarise; reproduce every row."

Rules for building `data/destinations.ts` from the chunks:
- File header comment: source URL + fetch date + "lowest-cash RFS combo, one-way, London" + DATA_LAST_VERIFIED.
- One `Destination` object per row. `iata`: the destination's primary airport code (executor knowledge is fine for airport codes - they are stable public facts; when unsure use the city's main international airport code).
- `region` and `holidayTypes`: editorial curation, coarse and defensible (e.g. Malaga: Europe, beach + winter-sun; Tokyo: East & Southeast Asia, city + culture).
- Premium Economy short-haul: HfP table has no PE figures for short-haul (no PE cabin flies there) → `NOT_OFFERED`.
- Any row the fetch returns ambiguously: SKIP it and note it in the file's header comment rather than guessing numbers.
- Multi-airport cities (New York JFK/EWR): one row, primary airport (JFK).

**Step 4: Run tests** — Expected: PASS, including all 10 anchor rows and size >= 100. If an anchor fails, the capture is wrong: re-fetch that chunk; do NOT edit the anchor.

**Step 5: Commit** — `feat: add BA destination pricing dataset (verified 2026-07-19)`.

---

### Task 5: computeResults (TDD)

**Files:**
- Modify: `src/components/calculators/AviosDestinationFinder/calculations.ts` (append)
- Test: append to `tests/calculations/avios-destination-finder.test.ts`

**Step 1: Failing tests** (append; uses real captured data via city lookups):

```ts
  describe('computeResults', () => {
    const base = getDefaultInputs();

    it('ranks affordable destinations by Avios ascending by default', () => {
      const r = computeResults({ ...base, aviosBudget: 60000 });
      const ranks = r.affordable.map((x) => x.rankAvios);
      expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
      expect(r.affordable.length).toBeGreaterThan(0);
    });

    it('marks destinations over budget and excludes them from affordable', () => {
      const r = computeResults({ ...base, aviosBudget: 30000, travellers: 1 });
      for (const x of r.affordable) expect(x.rankAvios).toBeLessThanOrEqual(30000);
      for (const x of r.overBudget) expect(x.rankAvios).toBeGreaterThan(30000);
      expect(r.affordable.length + r.overBudget.length + r.notOfferedCount).toBe(
        r.totalDestinations
      );
    });

    it('budget boundary: exactly-equal totals count as affordable', () => {
      // Amsterdam economy off-peak, 1 pax one-way = 10,000 (anchor row)
      const r = computeResults({
        ...base,
        aviosBudget: 10000,
        travellers: 1,
        tripType: 'oneWay',
        dateFrom: '2026-06-08',
        dateTo: '2026-06-11',
      });
      expect(r.affordable.some((x) => x.destination.city === 'Amsterdam')).toBe(true);
    });

    it('companion voucher brings a return within reach at half the Avios', () => {
      // New York economy off-peak return for 2: no voucher = 110,000; voucher = 55,000
      const withVoucher = computeResults({
        ...base,
        aviosBudget: 55000,
        companionVoucher: true,
        dateFrom: '2026-06-08',
        dateTo: '2026-06-11',
      });
      const ny = withVoucher.affordable.find((x) => x.destination.city === 'New York');
      expect(ny).toBeDefined();
      expect(ny!.rankAvios).toBe(55000);
      expect(ny!.cashTotal).toBe(240); // £60 x 2 pax x 2 legs - cash is never halved
    });

    it('filters by region and holiday type', () => {
      const r = computeResults({ ...base, regions: ['Europe'], holidayTypes: ['beach'] });
      for (const x of [...r.affordable, ...r.overBudget]) {
        expect(x.destination.region).toBe('Europe');
        expect(x.destination.holidayTypes).toContain('beach');
      }
    });

    it('peak-only ranges price at peak and blank the off-peak column', () => {
      const r = computeResults({
        ...base,
        aviosBudget: 1000000,
        dateFrom: '2026-08-03',
        dateTo: '2026-08-14',
      });
      const ams = [...r.affordable, ...r.overBudget].find(
        (x) => x.destination.city === 'Amsterdam'
      );
      expect(ams!.aviosOffPeak).toBeNull();
      expect(ams!.aviosPeak).toBe(43000); // 10,750 x 2 pax x 2 legs
      expect(ams!.rankAvios).toBe(43000);
    });

    it('counts not-offered cabins instead of rendering them', () => {
      const r = computeResults({ ...base, cabin: 'premiumEconomy' });
      expect(r.notOfferedCount).toBeGreaterThan(0); // short-haul has no PE cabin
    });

    it('sorts by name when requested', () => {
      const r = computeResults({ ...base, aviosBudget: 1000000, sortKey: 'name' });
      const names = r.affordable.map((x) => x.destination.city);
      expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names);
    });
  });
```

Add imports: `computeResults`, `getDefaultInputs`.

**Step 2: Run to verify failure** — Expected: FAIL (`computeResults` not exported).

**Step 3: Append to `calculations.ts`:**

```ts
import { DESTINATIONS } from './data/destinations';

function cabinPricing(d: Destination, cabin: AviosFinderInputs['cabin']): CabinPricing {
  if (cabin === 'economy') return d.economy;
  if (cabin === 'premiumEconomy') return d.premiumEconomy;
  return d.business;
}

/**
 * "Distance" sorting proxy: economy off-peak one-way Avios is monotone with
 * BA's distance banding, so it orders rows near-to-far without needing a
 * separately curated distance dataset.
 */
function distanceProxy(d: Destination): number {
  return d.economy === NOT_OFFERED ? Number.MAX_SAFE_INTEGER : d.economy.offPeak;
}

export function computeResults(inputs: AviosFinderInputs): AviosFinderResult {
  const seasons = resolveSeasonsForRange(inputs.dateFrom, inputs.dateTo);

  const filtered = DESTINATIONS.filter(
    (d) =>
      (inputs.regions.length === 0 || inputs.regions.includes(d.region)) &&
      (inputs.holidayTypes.length === 0 ||
        d.holidayTypes.some((t) => inputs.holidayTypes.includes(t)))
  );

  let notOfferedCount = 0;
  const rows: DestinationResult[] = [];

  for (const d of filtered) {
    const pricing = cabinPricing(d, inputs.cabin);
    if (pricing === NOT_OFFERED) {
      notOfferedCount += 1;
      continue;
    }

    const partyBase = {
      oneWayCash: pricing.cash,
      travellers: inputs.travellers,
      companionVoucher: inputs.companionVoucher,
      tripType: inputs.tripType,
    };
    const off = seasons.hasOffPeak
      ? calculatePartyTotals({ ...partyBase, oneWayAvios: pricing.offPeak })
      : null;
    const peak = seasons.hasPeak
      ? calculatePartyTotals({ ...partyBase, oneWayAvios: pricing.peak })
      : null;

    const rankAvios = off ? off.avios : peak!.avios;
    const cashTotal = (off ?? peak)!.cash;

    rows.push({
      destination: d,
      aviosOffPeak: off ? off.avios : null,
      aviosPeak: peak ? peak.avios : null,
      cashTotal,
      rankAvios,
      withinBudget: rankAvios <= inputs.aviosBudget,
      budgetPercent:
        inputs.aviosBudget > 0 ? Math.round((rankAvios / inputs.aviosBudget) * 100) : 0,
    });
  }

  const comparators: Record<AviosFinderInputs['sortKey'], (a: DestinationResult, b: DestinationResult) => number> = {
    avios: (a, b) => a.rankAvios - b.rankAvios,
    distance: (a, b) => distanceProxy(a.destination) - distanceProxy(b.destination),
    name: (a, b) => a.destination.city.localeCompare(b.destination.city),
  };
  rows.sort(comparators[inputs.sortKey]);

  return {
    affordable: rows.filter((r) => r.withinBudget),
    overBudget: rows.filter((r) => !r.withinBudget),
    notOfferedCount,
    seasons,
    totalDestinations: filtered.length,
  };
}
```

Note: `calculatePartyTotals` and `resolveSeasonsForRange` already exist from Tasks 2-3 (post-review names). Keep all imports at the top of the file (move the `DESTINATIONS` import up).

**Step 4: Run the full test file** — Expected: PASS (all tests).

**Step 5: Commit** — `feat: add Avios finder result computation`.

---

### Task 6: MultiSelectChips component

**Files:**
- Create: `src/components/calculators/AviosDestinationFinder/MultiSelectChips.tsx`

**Step 1: Write the component** (complete code; local to this calculator per YAGNI — promote to ui/ only when a second calculator needs it):

```tsx
/**
 * MultiSelectChips - toggleable chip group for multi-select filters.
 * Empty selection means "all" by convention of this calculator.
 */

interface ChipOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

interface MultiSelectChipsProps<T extends string> {
  readonly options: readonly ChipOption<T>[];
  readonly selected: readonly T[];
  readonly onChange: (next: T[]) => void;
  readonly ariaLabel: string;
}

export default function MultiSelectChips<T extends string>({
  options,
  selected,
  onChange,
  ariaLabel,
}: MultiSelectChipsProps<T>) {
  const toggle = (value: T) => {
    onChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    );
  };

  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              active
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-[var(--color-muted)] hover:bg-white/10'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
```

Adapt chip colors to the site's token conventions if `bg-blue-600` clashes — check how `ButtonGroup` styles its active state (`src/components/ui/primitives/ButtonGroup.tsx`) and mirror it.

**Step 2:** `npm run lint` — Expected: clean.

**Step 3: Commit** — `feat: add MultiSelectChips filter component`.

---

### Task 7: Main component

**Files:**
- Create: `src/components/calculators/AviosDestinationFinder/AviosDestinationFinder.tsx`
- Create: `src/components/calculators/AviosDestinationFinder/index.ts`

**Step 0: Read before writing** (contracts to honour, adapt cosmetic details to what you find):
- `src/components/ui/primitives/Input.tsx` — supported props/variants (budget input; date inputs may need native `<input type="date">` with matching classes if Input has no date variant).
- `src/components/ui/primitives/ButtonGroup.tsx` and `Toggle.tsx` — option/onChange contracts.
- `src/components/ui/ShareResults.tsx` — props (`result`, `calculatorName`; scalars only — we pass a text summary, no inputs record).

**Step 1: Write the component.** Reference implementation (adapt prop details to the contracts read in Step 0):

```tsx
/**
 * Avios Destination Finder - Preact Component
 *
 * Searches every BA destination at once by Avios budget, dates, region and
 * holiday type. Guide prices from BA's published reward table - NOT live
 * seat availability.
 */
import { computeResults } from './calculations';
import {
  CABIN_LABELS,
  HOLIDAY_TYPES,
  HOLIDAY_TYPE_LABELS,
  REGIONS,
  getDefaultInputs,
  type AviosFinderInputs,
  type AviosFinderResult,
  type Cabin,
  type DestinationResult,
  type HolidayType,
  type Region,
  type SortKey,
  type TripType,
} from './types';
import { DATA_LAST_VERIFIED } from './data/peakCalendar';
import MultiSelectChips from './MultiSelectChips';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Select,
  ButtonGroup,
  Toggle,
  Grid,
  Divider,
  Alert,
  MetricCard,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';

const REGION_OPTIONS = REGIONS.map((r) => ({ value: r, label: r }));
const HOLIDAY_OPTIONS = HOLIDAY_TYPES.map((t) => ({ value: t, label: HOLIDAY_TYPE_LABELS[t] }));
const CABIN_OPTIONS = (Object.keys(CABIN_LABELS) as Cabin[]).map((c) => ({
  value: c,
  label: CABIN_LABELS[c],
}));
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'avios', label: 'Fewest Avios first' },
  { value: 'distance', label: 'Shortest flights first' },
  { value: 'name', label: 'A to Z' },
];

const nf = new Intl.NumberFormat('en-GB');

function formatAvios(v: number | null): string {
  return v === null ? '-' : nf.format(v);
}

function ResultRow({ row, cabin }: { row: DestinationResult; cabin: Cabin }) {
  const d = row.destination;
  return (
    <tr key={d.iata} className={row.withinBudget ? '' : 'opacity-50'}>
      <td className="py-2">
        <span className="font-medium">{d.city}</span>{' '}
        <span className="text-[var(--color-muted)]">{d.country}</span>
        <div className="text-xs text-[var(--color-muted)]">
          {d.holidayTypes.map((t) => HOLIDAY_TYPE_LABELS[t]).join(' | ')}
        </div>
      </td>
      <td className="text-right py-2 tabular-nums">{formatAvios(row.aviosOffPeak)}</td>
      <td className="text-right py-2 tabular-nums">{formatAvios(row.aviosPeak)}</td>
      <td className="text-right py-2 tabular-nums">£{row.cashTotal.toFixed(2)}</td>
      <td className="text-right py-2 tabular-nums">{row.budgetPercent}%</td>
    </tr>
  );
}

export default function AviosDestinationFinder() {
  const { inputs, result, updateInput } = useCalculatorBase<AviosFinderInputs, AviosFinderResult>({
    name: 'Avios Destination Finder',
    slug: 'calc-avios-finder-inputs',
    defaults: getDefaultInputs,
    compute: computeResults,
  });

  const shown = inputs.showOverBudget
    ? [...result.affordable, ...result.overBudget]
    : result.affordable;

  const summary = `${nf.format(inputs.aviosBudget)} Avios (${CABIN_LABELS[inputs.cabin]}, ${
    inputs.travellers
  } traveller${inputs.travellers === 2 ? 's' : ''}${
    inputs.companionVoucher ? ' + companion voucher' : ''
  }): ${result.affordable.length} destinations within budget. Top picks: ${result.affordable
    .slice(0, 3)
    .map((r) => r.destination.city)
    .join(', ')}`;

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Avios Destination Finder"
          subtitle="Unofficial guide - see every BA destination your Avios can reach"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div>
                <Label htmlFor="aviosBudget" required>
                  Avios to spend
                </Label>
                <Input
                  id="aviosBudget"
                  type="number"
                  min={0}
                  step={1000}
                  value={inputs.aviosBudget}
                  onChange={(e) => updateInput('aviosBudget', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="dateFrom">Travel dates (optional)</Label>
                <div className="flex gap-2">
                  <input
                    id="dateFrom"
                    type="date"
                    value={inputs.dateFrom}
                    onChange={(e) => updateInput('dateFrom', (e.target as HTMLInputElement).value)}
                    className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm"
                  />
                  <input
                    id="dateTo"
                    type="date"
                    value={inputs.dateTo}
                    onChange={(e) => updateInput('dateTo', (e.target as HTMLInputElement).value)}
                    className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </Grid>

            <div>
              <Label>Where in the world?</Label>
              <MultiSelectChips<Region>
                options={REGION_OPTIONS}
                selected={inputs.regions}
                onChange={(v) => updateInput('regions', v)}
                ariaLabel="Filter by region"
              />
            </div>

            <div>
              <Label>Type of holiday</Label>
              <MultiSelectChips<HolidayType>
                options={HOLIDAY_OPTIONS}
                selected={inputs.holidayTypes}
                onChange={(v) => updateInput('holidayTypes', v)}
                ariaLabel="Filter by holiday type"
              />
            </div>

            <Grid responsive={{ sm: 1, md: 3 }} gap="md">
              <div>
                <Label htmlFor="cabin">Cabin</Label>
                <Select
                  id="cabin"
                  value={inputs.cabin}
                  onChange={(e) => updateInput('cabin', e.target.value as Cabin)}
                  options={CABIN_OPTIONS}
                />
              </div>
              <div>
                <Label>Travellers</Label>
                <ButtonGroup
                  value={String(inputs.travellers)}
                  onChange={(v: string) => updateInput('travellers', Number(v) as 1 | 2)}
                  options={[
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                  ]}
                />
              </div>
              <div>
                <Label>Trip</Label>
                <ButtonGroup
                  value={inputs.tripType}
                  onChange={(v: string) => updateInput('tripType', v as TripType)}
                  options={[
                    { value: 'return', label: 'Return' },
                    { value: 'oneWay', label: 'One-way' },
                  ]}
                />
              </div>
            </Grid>

            {inputs.travellers === 2 && (
              <div>
                <Toggle
                  id="companionVoucher"
                  checked={inputs.companionVoucher}
                  onChange={(v: boolean) => updateInput('companionVoucher', v)}
                  label="I have a BA Amex Companion Voucher (2-for-1)"
                />
                {inputs.companionVoucher && inputs.cabin !== 'economy' && (
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    Vouchers from the free BA Amex card are economy-only; the Premium Plus
                    voucher works in all cabins. Taxes and fees are payable for both travellers.
                  </p>
                )}
              </div>
            )}
          </div>

          <Divider />

          <div className="space-y-6">
            <Alert variant="info" title="Guide prices, not live availability">
              Prices are BA's published reward flight figures (lowest-cash option, last
              verified {DATA_LAST_VERIFIED}). Reward seats are limited and sell out - always
              check availability and final taxes on ba.com before planning. This site is not
              affiliated with British Airways; Avios is a trademark of its owner.
            </Alert>

            {result.seasons.beyondCalendar && (
              <Alert variant="warning" title="2027 dates are provisional">
                BA has not yet published the 2027 peak calendar, so both peak and off-peak
                prices are shown for dates beyond 2026.
              </Alert>
            )}

            <Grid responsive={{ sm: 2, md: 3 }} gap="md">
              <MetricCard
                label="Within budget"
                value={String(result.affordable.length)}
                sublabel={`of ${result.totalDestinations} destinations`}
                valueColor="success"
              />
              <MetricCard
                label="Your budget"
                value={`${nf.format(inputs.aviosBudget)} Avios`}
                sublabel={inputs.companionVoucher ? 'with companion voucher' : undefined}
              />
              <MetricCard
                label="Cabin"
                value={CABIN_LABELS[inputs.cabin]}
                sublabel={
                  result.notOfferedCount > 0
                    ? `${result.notOfferedCount} destinations not offered`
                    : undefined
                }
              />
            </Grid>

            <div className="flex items-center justify-between gap-4">
              <div className="w-56">
                <Label htmlFor="sortKey">Sort by</Label>
                <Select
                  id="sortKey"
                  value={inputs.sortKey}
                  onChange={(e) => updateInput('sortKey', e.target.value as SortKey)}
                  options={SORT_OPTIONS}
                />
              </div>
              <Toggle
                id="showOverBudget"
                checked={inputs.showOverBudget}
                onChange={(v: boolean) => updateInput('showOverBudget', v)}
                label="Show over-budget destinations"
              />
            </div>

            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Destinations ranked by Avios cost">
                  <thead>
                    <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider">
                      <th scope="col" className="text-left py-2">
                        Destination
                      </th>
                      <th scope="col" className="text-right py-2">
                        Off-peak Avios
                      </th>
                      <th scope="col" className="text-right py-2">
                        Peak Avios
                      </th>
                      <th scope="col" className="text-right py-2">
                        + cash from
                      </th>
                      <th scope="col" className="text-right py-2">
                        % of budget
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {shown.map((row) => (
                      <ResultRow key={row.destination.iata} row={row} cabin={inputs.cabin} />
                    ))}
                  </tbody>
                </table>
                {shown.length === 0 && (
                  <p className="text-[var(--color-muted)] text-sm py-4">
                    No destinations match these filters. Widen the region or holiday-type
                    selection, or increase the budget.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <ShareResults result={summary} calculatorName="Avios Destination Finder" />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
```

**Step 2: Write `index.ts`:**

```ts
export { default } from './AviosDestinationFinder';
```

**Step 3:** `npm run lint` — Expected: clean. Fix any prop-contract mismatches against the files read in Step 0 (the tipping calculator is the style reference).

**Step 4: Commit** — `feat: add Avios Destination Finder component`.

---

### Task 8: Page

**Files:**
- Create: `src/pages/calculators/avios-destination-finder.astro`

**Step 1: Write the page.** Mirror `src/pages/calculators/tipping-guide-calculator.astro` structure exactly (SEOHead slot, HeroSection, calculator island `client:load`, ContentSections, FAQSection). Key constants:

```astro
const title = 'Avios Destination Finder (Unofficial) | Boring Math';
const description =
  'See every British Airways destination your Avios can reach. Search by points budget, dates, region and holiday type, with companion voucher support. Free, instant, unofficial guide.';
const keywords =
  'where can I go with my avios, avios destination finder, 50000 avios where can I fly, avios flights from london, companion voucher destinations, BA reward flight guide, avios peak off-peak calculator';
const canonicalURL = '/calculators/avios-destination-finder';
```

Content sections (write full prose at execute time, staying within these verified facts ONLY):
1. **How to use** — budget, dates (peak/off-peak explained: BA publishes a calendar; two-thirds of the year is off-peak), region + holiday chips, cabin, voucher toggle.
2. **How BA prices reward flights** — fixed published table per destination; peak/off-peak; the quoted figure is the lowest-cash Reward Flight Saver option (more-cash/fewer-Avios combos exist on ba.com); prices reflect the 15 Dec 2025 update; one-way from London; this tool shows guide prices, NOT live seat availability.
3. **Companion voucher explainer** — the verified rules from `data/voucherRules.ts` only.

FAQs (7, all answerable from verified facts): what is this / is it official (no - independent, not affiliated, availability on ba.com); how accurate are prices (published table, last-verified date, RFS combos vary); what are peak and off-peak dates; how does the companion voucher work; why is my cabin not offered to some destinations (short-haul has no PE; First not covered v1); do Avios cover taxes (no - cash element per person, both passengers with voucher); can I book here (no - guide only, book at ba.com).

Related calculators: Vacation Budget (`/calculators/vacation-budget-calculator/`), Tipping Guide (`/calculators/tipping-guide-calculator/`), Currency Converter (`/calculators/currency-converter/`).

NO financial-advice language anywhere (no "best credit card", no "you should get"). NO affiliate links.

**Step 2:** `npm run build` — Expected: builds clean, page in `dist/calculators/avios-destination-finder/index.html`.

**Step 3: Commit** — `feat: add Avios Destination Finder page`.

---

### Task 9: Registry entry

**Files:**
- Modify: `src/lib/calculators.ts` (insert alphabetically by title — find the right spot with a grep for neighbouring titles)

**Step 1: Insert** (exact shape per existing entries, e.g. calculators.ts:1381-1389):

```ts
  {
    title: 'Avios Destination Finder',
    description:
      'See every BA destination your Avios can reach, filtered by budget, dates, region, and holiday type.',
    href: '/calculators/avios-destination-finder/',
    icon: 'trending',
    color: 'blue',
    category: 'Everyday',
    mostUsed: false,
  },
```

Trailing slash on `href` is mandatory. `icon` must exist in the IconName union — verify `'trending'` is a member before committing (grep the union); if not, pick a member that is.

**Step 2:** `npm test` then `npm run build` — Expected: both clean (build's `validate:shared-data` prebuild + postbuild link checks pass; homepage count auto-increments to 168).

**Step 3: Commit** — `feat: register Avios Destination Finder (168 calculators)`.

---

### Task 10: Full QA gate

**Step 1:** Run: `npm run qa` (format:check + lint + unit tests + build with link checks).
Expected: all green. Fix forward anything red; re-run until green. Do not skip hooks.

**Step 2:** Visual sanity: `npm run dev`, load `/calculators/avios-destination-finder/`, exercise: budget slider-to-zero (empty affordable list + over-budget section), each chip filter, voucher toggle halving Avios, August dates blanking off-peak column, sort switches. Screenshot for the PR.

**Step 3: Commit** any fixes — `fix: QA polish for Avios Destination Finder`.

---

### Task 11: PR

**Step 1:** Confirm git identity: `git config user.email` must be `skfsk27@gmail.com`.

**Step 2:** Push branch, open PR titled `feat: Avios Destination Finder` (no em dashes) with: summary, screenshot, verified-data provenance table (source URLs + fetch date), test plan checkboxes (unit suite, anchors, build, manual QA list from Task 10), and the explicit note that live seat availability is out of scope by design.

---

## Execution notes for the implementer

- **No number from memory.** Every Avios/cash/date figure must trace to Task 4's fetched chunks, the anchor table, or the calendar data above. If a fetch is ambiguous, skip the row and log it — never guess.
- The dataset is the risk; the code is routine. Anchors are the checksum: if an anchor test fails, the capture is wrong, not the anchor.
- `hippo remember` any surprises (source layout changes, HfP table quirks) as you go.
- Site non-negotiables in `CLAUDE.md` bind throughout: free forever, no affiliate links without disclosure (we ship none), no financial advice, registry is source of truth, AdSense only via the normal layout.
