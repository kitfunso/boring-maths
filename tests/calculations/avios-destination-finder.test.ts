/**
 * Avios Destination Finder - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  resolveSeasonsForRange,
  calculatePartyTotals,
} from '../../src/components/calculators/AviosDestinationFinder/calculations';

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
});
