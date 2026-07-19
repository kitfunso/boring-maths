/**
 * Avios Destination Finder - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  resolveSeasonsForRange,
  calculatePartyTotals,
  computeResults,
} from '../../src/components/calculators/AviosDestinationFinder/calculations';
import { DESTINATIONS } from '../../src/components/calculators/AviosDestinationFinder/data/destinations';
import { REGIONS, getDefaultInputs } from '../../src/components/calculators/AviosDestinationFinder/types';

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
});
