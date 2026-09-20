/** BSD bands eff. 15 Feb 2023 (1/2/3/4/5/6% marginal), ABSD flat rates eff. 27 Apr 2023 by profile + property count. */

import { describe, it, expect } from 'vitest';
import { calculateSingaporeStampDuty } from '../../src/components/calculators/SingaporeStampDuty/calculations';

describe('SingaporeStampDuty', () => {
  describe('calculateSingaporeStampDuty', () => {
    it('computes BSD and zero ABSD for a 1,000,000 citizen 1st property', () => {
      // BSD: 180000*1% + 180000*2% + 640000*3% = 1800 + 3600 + 19200 = 24600
      const result = calculateSingaporeStampDuty({
        purchasePrice: 1_000_000,
        buyerProfile: 'citizen',
        propertiesOwned: 0,
      });
      expect(result.bsd).toBeCloseTo(24_600, 2);
      expect(result.absd).toBe(0);
      expect(result.totalDuty).toBeCloseTo(24_600, 2);
    });

    it('computes BSD and 20% ABSD for a 1,500,000 citizen 2nd property', () => {
      // BSD: 1800 + 3600 + 640000*3% (19200) + 500000*4% (20000) = 44600
      const result = calculateSingaporeStampDuty({
        purchasePrice: 1_500_000,
        buyerProfile: 'citizen',
        propertiesOwned: 1,
      });
      expect(result.bsd).toBeCloseTo(44_600, 2);
      expect(result.absd).toBeCloseTo(300_000, 2);
      expect(result.totalDuty).toBeCloseTo(344_600, 2);
    });

    it('computes BSD and 60% ABSD for a 2,000,000 foreigner, any property count', () => {
      // BSD: 1800 + 3600 + 19200 + 20000 + 500000*5% (25000) = 69600
      const result = calculateSingaporeStampDuty({
        purchasePrice: 2_000_000,
        buyerProfile: 'foreigner',
        propertiesOwned: 0,
      });
      expect(result.bsd).toBeCloseTo(69_600, 2);
      expect(result.absd).toBeCloseTo(1_200_000, 2);
    });

    it('exercises the top 6% BSD band and 65% entity ABSD on a 4,000,000 purchase', () => {
      // BSD: 1800 + 3600 + 19200 + 20000 + 1500000*5% (75000) + 1000000*6% (60000) = 179600
      const result = calculateSingaporeStampDuty({
        purchasePrice: 4_000_000,
        buyerProfile: 'entity',
        propertiesOwned: 0,
      });
      expect(result.bsd).toBeCloseTo(179_600, 2);
      expect(result.absd).toBeCloseTo(2_600_000, 2);
      expect(result.totalDuty).toBeCloseTo(2_779_600, 2);
    });

    it('applies only the first band for a 150,000 purchase', () => {
      const result = calculateSingaporeStampDuty({
        purchasePrice: 150_000,
        buyerProfile: 'citizen',
        propertiesOwned: 0,
      });
      expect(result.bsd).toBeCloseTo(1_500, 2);
      expect(result.bsdBreakdown).toHaveLength(1);
    });

    it('returns zero for a zero purchase price without crashing', () => {
      const result = calculateSingaporeStampDuty({
        purchasePrice: 0,
        buyerProfile: 'foreigner',
        propertiesOwned: 2,
      });
      expect(result.bsd).toBe(0);
      expect(result.absd).toBe(0);
      expect(result.totalDuty).toBe(0);
      expect(result.totalRatePercent).toBe(0);
    });

    it('charges 30% ABSD for a citizen 3rd or subsequent property', () => {
      const result = calculateSingaporeStampDuty({
        purchasePrice: 1_000_000,
        buyerProfile: 'citizen',
        propertiesOwned: 2,
      });
      expect(result.absd).toBeCloseTo(300_000, 2);
    });

    it('charges 25% ABSD for a PR 2nd property', () => {
      const result = calculateSingaporeStampDuty({
        purchasePrice: 1_000_000,
        buyerProfile: 'pr',
        propertiesOwned: 1,
      });
      expect(result.absd).toBeCloseTo(250_000, 2);
    });
  });
});
