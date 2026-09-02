/**
 * Avios Destination Finder - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  resolveSeasonsForRange,
  calculatePartyTotals,
  computeResults,
  voucherApplies,
} from '../../src/components/calculators/AviosDestinationFinder/calculations';
import { DESTINATIONS } from '../../src/components/calculators/AviosDestinationFinder/data/destinations';
import {
  DISTANCE_MILES_FROM_LONDON,
  assertDistanceCoverage,
} from '../../src/components/calculators/AviosDestinationFinder/data/distances';
import {
  REGIONS,
  getDefaultInputs,
} from '../../src/components/calculators/AviosDestinationFinder/types';

describe('AviosDestinationFinder', () => {
  describe('resolveSeasonsForRange', () => {
    it('treats unset dates as both seasons', () => {
      const s = resolveSeasonsForRange('', '');
      expect(s).toEqual({ hasOffPeak: true, hasPeak: true, beyondCalendar: false });
    });

    it('resolves an off-peak-only range (June midweek)', () => {
      const s = resolveSeasonsForRange('2026-06-08', '2026-06-11');
      expect(s).toEqual({ hasOffPeak: true, hasPeak: false, beyondCalendar: false });
    });

    it('resolves a peak-only range (all August is peak)', () => {
      const s = resolveSeasonsForRange('2026-08-03', '2026-08-14');
      expect(s).toEqual({ hasOffPeak: false, hasPeak: true, beyondCalendar: false });
    });

    it('resolves a spanning range (late June into July peak)', () => {
      const s = resolveSeasonsForRange('2026-06-29', '2026-07-05');
      expect(s.hasOffPeak).toBe(true);
      expect(s.hasPeak).toBe(true);
      expect(s.beyondCalendar).toBe(false);
    });

    it('handles a single peak day (1 Nov 2026)', () => {
      const s = resolveSeasonsForRange('2026-11-01', '2026-11-01');
      expect(s).toEqual({ hasOffPeak: false, hasPeak: true, beyondCalendar: false });
    });

    it('flags ranges beyond the published calendar as both + provisional', () => {
      const s = resolveSeasonsForRange('2027-02-01', '2027-02-10');
      expect(s.hasOffPeak).toBe(true);
      expect(s.hasPeak).toBe(true);
      expect(s.beyondCalendar).toBe(true);
    });

    it('treats an invalid range (from after to) as both seasons', () => {
      const s = resolveSeasonsForRange('2026-06-20', '2026-06-01');
      expect(s).toEqual({ hasOffPeak: true, hasPeak: true, beyondCalendar: false });
    });

    it('treats invalid, unparseable date strings as both seasons', () => {
      const s1 = resolveSeasonsForRange('not-a-date', '2026-06-01');
      expect(s1).toEqual({ hasOffPeak: true, hasPeak: true, beyondCalendar: false });

      const s2 = resolveSeasonsForRange('2026-01-01', '2026-13-99');
      expect(s2).toEqual({ hasOffPeak: true, hasPeak: true, beyondCalendar: false });
    });

    it('treats a one-sided range (no end date) as both seasons', () => {
      const s = resolveSeasonsForRange('2026-06-01', '');
      expect(s).toEqual({ hasOffPeak: true, hasPeak: true, beyondCalendar: false });
    });

    it('returns the widest honest answer for a range longer than 730 days', () => {
      const s = resolveSeasonsForRange('0001-01-01', '2026-12-31');
      expect(s.hasOffPeak).toBe(true);
      expect(s.hasPeak).toBe(true);
      expect(s.beyondCalendar).toBe(false);
    });
  });

  describe('calculatePartyTotals', () => {
    // Amsterdam economy off-peak anchor: 10,000 Avios + £1 one-way per person.
    it('doubles Avios and cash for 2 travellers without a voucher, return', () => {
      const t = calculatePartyTotals({
        oneWayAvios: 10000,
        oneWayCash: 1,
        travellers: 2,
        companionVoucher: false,
        tripType: 'return',
      });
      expect(t.avios).toBe(40000); // 10,000 x 2 pax x 2 legs
      expect(t.cash).toBe(4); // £1 x 2 pax x 2 legs
    });

    it('halves the Avios (not the cash) with a companion voucher for 2', () => {
      const t = calculatePartyTotals({
        oneWayAvios: 10000,
        oneWayCash: 1,
        travellers: 2,
        companionVoucher: true,
        tripType: 'return',
      });
      expect(t.avios).toBe(20000); // second seat costs no Avios
      expect(t.cash).toBe(4); // taxes/fees still due for both passengers
    });

    it('ignores the voucher for a single traveller (solo variant is out of scope v1)', () => {
      const t = calculatePartyTotals({
        oneWayAvios: 10000,
        oneWayCash: 1,
        travellers: 1,
        companionVoucher: true,
        tripType: 'oneWay',
      });
      expect(t.avios).toBe(10000);
      expect(t.cash).toBe(1);
    });

    it('one-way is half of return', () => {
      const ret = calculatePartyTotals({
        oneWayAvios: 27500,
        oneWayCash: 60,
        travellers: 1,
        companionVoucher: false,
        tripType: 'return',
      });
      const ow = calculatePartyTotals({
        oneWayAvios: 27500,
        oneWayCash: 60,
        travellers: 1,
        companionVoucher: false,
        tripType: 'oneWay',
      });
      expect(ret.avios).toBe(ow.avios * 2);
      expect(ret.cash).toBe(ow.cash * 2);
    });
  });

  describe('destination data integrity', () => {
    const byCity = (city: string) => DESTINATIONS.find((d) => d.city === city);

    it('has a meaningful catalogue size', () => {
      expect(DESTINATIONS.length).toBeGreaterThanOrEqual(100);
    });

    it('has unique IATA keys', () => {
      const codes = DESTINATIONS.map((d) => d.iata);
      expect(new Set(codes).size).toBe(codes.length);
    });

    it('every IATA code is a 3-letter uppercase code', () => {
      for (const d of DESTINATIONS) {
        expect(d.iata).toMatch(/^[A-Z]{3}$/);
      }
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
    interface CabinAmount {
      readonly offPeak: number;
      readonly peak: number;
      readonly cash: number;
    }

    interface Anchor {
      readonly city: string;
      readonly economy: CabinAmount;
      readonly premiumEconomy: CabinAmount | 'not_offered';
      readonly business: CabinAmount;
    }

    const ANCHORS: readonly Anchor[] = [
      // Short-haul: premium economy is not offered on these routes.
      {
        city: 'Amsterdam',
        economy: { offPeak: 10000, peak: 10750, cash: 1 },
        premiumEconomy: 'not_offered',
        business: { offPeak: 16500, peak: 18000, cash: 15 },
      },
      {
        city: 'Malaga',
        economy: { offPeak: 13000, peak: 14000, cash: 1 },
        premiumEconomy: 'not_offered',
        business: { offPeak: 22000, peak: 24500, cash: 15 },
      },
      {
        city: 'Athens',
        economy: { offPeak: 15000, peak: 16750, cash: 1 },
        premiumEconomy: 'not_offered',
        business: { offPeak: 26750, peak: 30000, cash: 15 },
      },
      // Long-haul: premium economy is offered on these routes.
      {
        city: 'Dubai',
        economy: { offPeak: 27500, peak: 33000, cash: 60 },
        premiumEconomy: { offPeak: 46750, peak: 66000, cash: 175 },
        business: { offPeak: 88000, peak: 99000, cash: 199.5 },
      },
      {
        city: 'New York',
        economy: { offPeak: 27500, peak: 33000, cash: 60 },
        premiumEconomy: { offPeak: 46750, peak: 66000, cash: 175 },
        business: { offPeak: 88000, peak: 99000, cash: 199.5 },
      },
      {
        city: 'Miami',
        economy: { offPeak: 33000, peak: 38500, cash: 85 },
        premiumEconomy: { offPeak: 52250, peak: 74250, cash: 200 },
        business: { offPeak: 99000, peak: 110000, cash: 249.5 },
      },
      {
        city: 'Cape Town',
        economy: { offPeak: 33000, peak: 38500, cash: 85 },
        premiumEconomy: { offPeak: 52250, peak: 74250, cash: 200 },
        business: { offPeak: 99000, peak: 110000, cash: 249.5 },
      },
      {
        city: 'Tokyo',
        economy: { offPeak: 38500, peak: 44000, cash: 110 },
        premiumEconomy: { offPeak: 55000, peak: 85250, cash: 225 },
        business: { offPeak: 110000, peak: 121000, cash: 299.5 },
      },
      {
        city: 'Singapore',
        economy: { offPeak: 44000, peak: 49500, cash: 135 },
        premiumEconomy: { offPeak: 60500, peak: 88000, cash: 250 },
        business: { offPeak: 121000, peak: 132000, cash: 335 },
      },
      {
        city: 'Sydney',
        economy: { offPeak: 55000, peak: 60500, cash: 160 },
        premiumEconomy: { offPeak: 88000, peak: 126500, cash: 275 },
        business: { offPeak: 159500, peak: 187000, cash: 399.5 },
      },
    ];

    it.each(ANCHORS)('$city matches the verified source row', (anchor) => {
      const d = byCity(anchor.city);
      expect(d).toBeDefined();
      expect(d!.economy).toEqual(anchor.economy);
      expect(d!.premiumEconomy).toEqual(anchor.premiumEconomy);
      expect(d!.business).toEqual(anchor.business);
    });

    // Pinned tier list: hand-transcribed from the verified capture, independent
    // of data/destinations.ts. A destination whose price does not match any
    // tuple here means either this pin list or the data file has drifted from
    // the verified source - it is not something to "fix" by editing the pin.
    type Tier = readonly [number, number, number];

    const ECONOMY_TIERS: readonly Tier[] = [
      [10000, 10750, 1],
      [13000, 14000, 1],
      [15000, 16750, 1],
      [15000, 16750, 51],
      [24750, 30250, 50],
      [27500, 33000, 60],
      [33000, 38500, 85],
      [38500, 44000, 110],
      [44000, 49500, 135],
      [55000, 60500, 160],
    ];

    const BUSINESS_TIERS: readonly Tier[] = [
      [16500, 18000, 15],
      [22000, 24500, 15],
      [26750, 30000, 15],
      [26750, 30000, 125],
      [77000, 88000, 125],
      [88000, 99000, 199.5],
      [99000, 110000, 249.5],
      [110000, 121000, 299.5],
      [121000, 132000, 335],
      [159500, 187000, 399.5],
    ];

    const PE_TIERS: readonly Tier[] = [
      [41250, 52250, 100],
      [46750, 66000, 175],
      [52250, 74250, 200],
      [55000, 85250, 225],
      [60500, 88000, 250],
      [88000, 126500, 275],
    ];

    const matchesATier = (cabin: CabinAmount, tiers: readonly Tier[]) =>
      tiers.some(
        ([offPeak, peak, cash]) =>
          cabin.offPeak === offPeak && cabin.peak === peak && cabin.cash === cash
      );

    it('every economy price matches a pinned verified tier', () => {
      for (const d of DESTINATIONS) {
        if (d.economy !== 'not_offered') {
          expect(matchesATier(d.economy, ECONOMY_TIERS)).toBe(true);
        }
      }
    });

    it('every business price matches a pinned verified tier', () => {
      for (const d of DESTINATIONS) {
        if (d.business !== 'not_offered') {
          expect(matchesATier(d.business, BUSINESS_TIERS)).toBe(true);
        }
      }
    });

    it('every offered premium economy price matches a pinned verified tier', () => {
      for (const d of DESTINATIONS) {
        if (d.premiumEconomy !== 'not_offered') {
          expect(matchesATier(d.premiumEconomy, PE_TIERS)).toBe(true);
        }
      }
    });
  });

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
        voucher: 'premiumPlus',
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

    describe('ranked: global sort order across the budget split', () => {
      // Real data, computed via: npx vitest run tests/calculations/avios-destination-finder.test.ts
      // budget=45000, travellers=1, oneWay, sortKey='name', cabin='economy' (default), no dates
      // -> rankAvios is economy.offPeak (both seasons apply, off-peak used). Exactly 2 of the
      // 199 filtered destinations exceed 45000: Melbourne and Sydney (both 55,000), everything
      // else is <= 44,000. This is a real split in the shipped dataset, not a hand-picked one.
      const r = computeResults({
        ...base,
        aviosBudget: 45000,
        travellers: 1,
        tripType: 'oneWay',
        sortKey: 'name',
      });
      const rankedNames = r.ranked.map((x) => x.destination.city);

      it('sorts the whole ranked list globally by name, affordable and over-budget together', () => {
        expect(r.overBudget.map((x) => x.destination.city)).toEqual(['Melbourne', 'Sydney']);
        expect(rankedNames).toEqual([...rankedNames].sort((a, b) => a.localeCompare(b)));
      });

      it('interleaves an over-budget row in its correct alphabetical position (Melbourne)', () => {
        const i = rankedNames.indexOf('Melbourne');
        expect(rankedNames[i - 1]).toBe('Mauritius');
        expect(rankedNames[i + 1]).toBe('Menorca');
        expect(r.ranked[i].withinBudget).toBe(false);
      });

      it('interleaves an over-budget row in its correct alphabetical position (Sydney)', () => {
        const i = rankedNames.indexOf('Sydney');
        expect(rankedNames[i - 1]).toBe('Stockholm');
        expect(rankedNames[i + 1]).toBe('Tampa');
        expect(r.ranked[i].withinBudget).toBe(false);
      });

      it('would NOT match the naive affordable-then-overBudget concatenation the component used to build', () => {
        // This is the bug the fix closes: the old component built `shown` as
        // [...affordable, ...overBudget], which pushes every over-budget row to
        // the end regardless of sortKey. `ranked` must differ from that shape
        // whenever a global sort (like 'name') disagrees with the budget split.
        const naiveConcat = [...r.affordable, ...r.overBudget].map((x) => x.destination.city);
        expect(rankedNames).not.toEqual(naiveConcat);
      });

      it('ranked is exactly the union of affordable and over-budget, order preserved', () => {
        expect(r.ranked.length).toBe(r.affordable.length + r.overBudget.length);
        expect(r.affordable.every((x) => x.withinBudget)).toBe(true);
        expect(r.overBudget.every((x) => !x.withinBudget)).toBe(true);
      });
    });
  });

  // --- Task 1: real distances, value metrics, new sort keys -----------------

  describe('DISTANCE_MILES_FROM_LONDON and assertDistanceCoverage', () => {
    it('has a positive distance entry for every destination (closes the regex-extraction loophole)', () => {
      for (const d of DESTINATIONS) {
        expect(DISTANCE_MILES_FROM_LONDON[d.iata]).toBeGreaterThan(0);
      }
    });

    it('assertDistanceCoverage does not throw for the full destination list', () => {
      expect(() => assertDistanceCoverage(DESTINATIONS)).not.toThrow();
    });

    it('assertDistanceCoverage throws listing a destination with no distance entry', () => {
      const withGap = [...DESTINATIONS, { iata: 'ZZZ', city: 'Nowhere' }];
      expect(() => assertDistanceCoverage(withGap)).toThrow(/Nowhere \(ZZZ\)/);
    });

    // Distance sanity anchor: verbatim OurAirports CSV rows (fetched 2026-07-19,
    // https://davidmegginson.github.io/ourairports-data/airports.csv), columns
    // "id","ident","type","name","latitude_deg","longitude_deg",...,"iata_code",...
    //   2434,"EGLL","large_airport","London Heathrow Airport",51.470748,-0.459909,83,"EU","GB","GB-ENG","London","yes","EGLL","LHR","EGLL",,"http://www.heathrow.com/",...
    //   3622,"KJFK","large_airport","John F. Kennedy International Airport",40.639447,-73.779317,13,"NA","US","US-NY","New York","yes","KJFK","JFK","KJFK","JFK",...
    //   27145,"YSSY","large_airport","Sydney Kingsford Smith International Airport",-33.946098,151.177002,21,"OC","AU","AU-NSW","Sydney (Mascot)","yes","YSSY","SYD","YSSY",,...
    // Haversine below is computed independently of the generator script, from
    // these hardcoded coordinates, to sanity-check the generated table without
    // trusting any distance figure from memory.
    it('LHR -> JFK and LHR -> SYD are within 1% of an independently computed haversine', () => {
      const EARTH_RADIUS_MILES = 3958.7613;
      const toRadians = (deg: number) => (deg * Math.PI) / 180;
      const haversineMiles = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
        return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };

      const LHR = { lat: 51.470748, lon: -0.459909 };
      const JFK = { lat: 40.639447, lon: -73.779317 };
      const SYD = { lat: -33.946098, lon: 151.177002 };

      const jfkComputed = haversineMiles(LHR.lat, LHR.lon, JFK.lat, JFK.lon);
      const sydComputed = haversineMiles(LHR.lat, LHR.lon, SYD.lat, SYD.lon);

      expect(Math.abs(DISTANCE_MILES_FROM_LONDON.JFK - jfkComputed) / jfkComputed).toBeLessThan(
        0.01
      );
      expect(Math.abs(DISTANCE_MILES_FROM_LONDON.SYD - sydComputed) / sydComputed).toBeLessThan(
        0.01
      );
    });
  });

  describe('valuePer1k', () => {
    const base = getDefaultInputs();

    it('doubles for 2 travellers when the companion voucher is applied to the same row', () => {
      // New York anchor (both seasons apply with no dates set, so rankAvios
      // uses the off-peak column for both calls): voucher only changes
      // aviosSeats, so partyMiles is identical and valuePer1k should double.
      const noVoucher = computeResults({ ...base, voucher: 'none' });
      const withVoucher = computeResults({ ...base, voucher: 'premiumPlus' });
      const nyNoVoucher = noVoucher.ranked.find((x) => x.destination.city === 'New York')!;
      const nyWithVoucher = withVoucher.ranked.find((x) => x.destination.city === 'New York')!;
      expect(nyWithVoucher.valuePer1k).toBeCloseTo(nyNoVoucher.valuePer1k * 2, 5);
    });
  });

  describe('peakSavingPct', () => {
    const base = getDefaultInputs();

    it('is null for every row when the date range is off-peak only', () => {
      const r = computeResults({ ...base, dateFrom: '2026-06-08', dateTo: '2026-06-11' });
      expect(r.ranked.every((x) => x.peakSavingPct === null)).toBe(true);
    });

    it('is null for every row when the date range is peak only', () => {
      const r = computeResults({ ...base, dateFrom: '2026-08-03', dateTo: '2026-08-14' });
      expect(r.ranked.every((x) => x.peakSavingPct === null)).toBe(true);
    });

    it('is a non-negative whole percentage when both seasons apply', () => {
      const r = computeResults({ ...base });
      for (const x of r.ranked) {
        expect(x.peakSavingPct).not.toBeNull();
        expect(Number.isInteger(x.peakSavingPct)).toBe(true);
        expect(x.peakSavingPct!).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('new sort keys: value, cash, peakSaving', () => {
    const base = getDefaultInputs();

    it('sorts by value descending, ties broken by rankAvios ascending', () => {
      const r = computeResults({ ...base, aviosBudget: 1000000, sortKey: 'value' });
      for (let i = 1; i < r.ranked.length; i++) {
        const prev = r.ranked[i - 1];
        const curr = r.ranked[i];
        if (prev.valuePer1k === curr.valuePer1k) {
          expect(curr.rankAvios).toBeGreaterThanOrEqual(prev.rankAvios);
        } else {
          expect(curr.valuePer1k).toBeLessThanOrEqual(prev.valuePer1k);
        }
      }
    });

    it('sorts by cash ascending, ties broken by rankAvios ascending', () => {
      const r = computeResults({ ...base, aviosBudget: 1000000, sortKey: 'cash' });
      for (let i = 1; i < r.ranked.length; i++) {
        const prev = r.ranked[i - 1];
        const curr = r.ranked[i];
        if (prev.cashTotal === curr.cashTotal) {
          expect(curr.rankAvios).toBeGreaterThanOrEqual(prev.rankAvios);
        } else {
          expect(curr.cashTotal).toBeGreaterThanOrEqual(prev.cashTotal);
        }
      }
    });

    it('sorts by peakSaving descending when every row has a value', () => {
      const r = computeResults({ ...base, aviosBudget: 1000000, sortKey: 'peakSaving' });
      for (let i = 1; i < r.ranked.length; i++) {
        expect(r.ranked[i].peakSavingPct!).toBeLessThanOrEqual(r.ranked[i - 1].peakSavingPct!);
      }
    });

    it('falls back to rankAvios ascending when peakSavingPct is null for every row (nulls-last total order)', () => {
      // Off-peak-only range (see peakSavingPct describe above): peakSavingPct
      // is null for every row, so the null-safe comparator's both-null branch
      // applies uniformly, collapsing the sort to rankAvios ascending.
      const r = computeResults({
        ...base,
        aviosBudget: 1000000,
        dateFrom: '2026-06-08',
        dateTo: '2026-06-11',
        sortKey: 'peakSaving',
      });
      const ranks = r.ranked.map((x) => x.rankAvios);
      expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
    });
  });

  describe('voucherSavingAvios', () => {
    const base = getDefaultInputs();

    it('equals the cheapest affordable rankAvios delta between no-voucher and voucher', () => {
      const withVoucher = computeResults({
        ...base,
        aviosBudget: 1000000,
        voucher: 'premiumPlus',
        travellers: 2,
      });
      const cheapest = withVoucher.affordable.reduce((min, x) =>
        x.rankAvios < min.rankAvios ? x : min
      );
      const withoutVoucher = computeResults({
        ...base,
        aviosBudget: 1000000,
        voucher: 'none',
        travellers: 2,
      });
      const cheapestNoVoucher = withoutVoucher.ranked.find(
        (x) => x.destination.iata === cheapest.destination.iata
      )!;
      expect(withVoucher.voucherSavingAvios).toBe(cheapestNoVoucher.rankAvios - cheapest.rankAvios);
      expect(withVoucher.voucherSavingAvios).toBeGreaterThan(0);
    });

    it('is 0 when the companion voucher is off', () => {
      const r = computeResults({ ...base, voucher: 'none' });
      expect(r.voucherSavingAvios).toBe(0);
    });

    it('is 0 for a single traveller even with the voucher flag set', () => {
      const r = computeResults({ ...base, voucher: 'premiumPlus', travellers: 1 });
      expect(r.voucherSavingAvios).toBe(0);
    });

    it('is 0 when nothing is affordable', () => {
      const r = computeResults({ ...base, aviosBudget: 1, voucher: 'premiumPlus', travellers: 2 });
      expect(r.affordable.length).toBe(0);
      expect(r.voucherSavingAvios).toBe(0);
    });
  });

  describe('voucherApplies', () => {
    it('needs two travellers', () => {
      expect(voucherApplies('premiumPlus', 'business', 1)).toBe(false);
      expect(voucherApplies('free', 'economy', 1)).toBe(false);
    });

    it('free voucher is economy only', () => {
      expect(voucherApplies('free', 'economy', 2)).toBe(true);
      expect(voucherApplies('free', 'premiumEconomy', 2)).toBe(false);
      expect(voucherApplies('free', 'business', 2)).toBe(false);
    });

    it('Premium Plus voucher covers every cabin', () => {
      expect(voucherApplies('premiumPlus', 'economy', 2)).toBe(true);
      expect(voucherApplies('premiumPlus', 'premiumEconomy', 2)).toBe(true);
      expect(voucherApplies('premiumPlus', 'business', 2)).toBe(true);
    });

    it('none never applies', () => {
      expect(voucherApplies('none', 'economy', 2)).toBe(false);
    });
  });

  describe('voucher types in computeResults', () => {
    const base = { ...getDefaultInputs(), aviosBudget: 1_000_000, cabin: 'business' as const };
    const ny = (r: ReturnType<typeof computeResults>) =>
      r.ranked.find((x) => x.destination.city === 'New York')!;

    it('free voucher in Business prices two full seats', () => {
      const none = computeResults({ ...base, voucher: 'none' });
      const free = computeResults({ ...base, voucher: 'free' });
      expect(free.voucherApplied).toBe(false);
      expect(free.voucherSavingAvios).toBe(0);
      expect(ny(free).rankAvios).toBe(ny(none).rankAvios);
    });

    it('Premium Plus voucher in Business halves the Avios and keeps the cash', () => {
      const none = computeResults({ ...base, voucher: 'none' });
      const plus = computeResults({ ...base, voucher: 'premiumPlus' });
      expect(plus.voucherApplied).toBe(true);
      expect(ny(plus).rankAvios).toBe(ny(none).rankAvios / 2);
      expect(ny(plus).cashTotal).toBe(ny(none).cashTotal);
    });

    it('free voucher applies in Economy', () => {
      const free = computeResults({ ...base, cabin: 'economy', voucher: 'free' });
      expect(free.voucherApplied).toBe(true);
    });
  });
});
