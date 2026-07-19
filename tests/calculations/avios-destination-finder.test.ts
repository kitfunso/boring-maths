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
