/**
 * Avios Destination Finder - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  resolveSeasonsForRange,
  calculatePartyTotals,
} from '../../src/components/calculators/AviosDestinationFinder/calculations';
import { DESTINATIONS } from '../../src/components/calculators/AviosDestinationFinder/data/destinations';
import { REGIONS } from '../../src/components/calculators/AviosDestinationFinder/types';

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
    const ANCHORS: ReadonlyArray<[string, number, number, number, number, number, number]> = [
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
});
