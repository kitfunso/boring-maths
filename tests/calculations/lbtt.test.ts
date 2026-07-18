/**
 * LBTTCalculator (Scotland Land and Buildings Transaction Tax) - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateLBTT } from '../../src/components/calculators/LBTTCalculator/calculations';

describe('LBTTCalculator', () => {
  describe('calculateLBTT', () => {
    it('should calculate standard bands on a value crossing multiple bands', () => {
      // £400,000, home-mover (standard bands: 0-145k@0%, 145,001-250k@2%,
      // 250,001-325k@5%, 325,001-750k@10%, >750k@12%). Band tax uses
      // (min(price,to) - from + 1) * rate, rounded per band:
      // band1: (145000-0+1)*0 = 0
      // band2: (250000-145001+1)*0.02 = 105000*0.02 = 2100
      // band3: (325000-250001+1)*0.05 = 75000*0.05 = 3750
      // band4: (400000-325001+1)*0.10 = 75000*0.10 = 7500
      // total = 0+2100+3750+7500 = 13350
      const result = calculateLBTT({
        propertyPrice: 400000,
        buyerType: 'home-mover',
        isNonResident: false,
      });

      expect(result.totalTax).toBe(13350);
      expect(result.effectiveRate).toBeCloseTo(3.3375, 4);
      expect(result.adsSurcharge).toBe(0);
      expect(result.nonResidentSurcharge).toBe(0);
      expect(result.firstTimeBuyerSaving).toBe(0);
      expect(result.bands).toEqual([
        { from: 0, to: 145000, rate: 0, taxDue: 0 },
        { from: 145001, to: 250000, rate: 0.02, taxDue: 2100 },
        { from: 250001, to: 325000, rate: 0.05, taxDue: 3750 },
        { from: 325001, to: 400000, rate: 0.1, taxDue: 7500 },
      ]);
    });

    it('should apply the 8% ADS surcharge for an additional property', () => {
      // £300,000, buyerType 'additional' uses standard bands:
      // band1: (145000-0+1)*0 = 0
      // band2: (250000-145001+1)*0.02 = 105000*0.02 = 2100
      // band3: (300000-250001+1)*0.05 = 50000*0.05 = 2500
      // base tax = 0+2100+2500 = 4600
      // ADS = round(300000 * 0.08) = 24000
      // total = 4600 + 24000 = 28600
      const result = calculateLBTT({
        propertyPrice: 300000,
        buyerType: 'additional',
        isNonResident: false,
      });

      expect(result.adsSurcharge).toBe(24000);
      expect(result.totalTax).toBe(28600);
      expect(result.effectiveRate).toBeCloseTo(9.5333, 3);
      expect(result.firstTimeBuyerSaving).toBe(0);
    });

    it('should give a first-time buyer the higher nil-rate band', () => {
      // £150,000 falls entirely in the first-time-buyer nil band (0-175,000@0%),
      // so base tax = 0. Under standard bands (0-145,000@0%, then 2% above),
      // taxable-in-band2 = (150000-145001+1)*0.02 = 5000*0.02 = 100, so the
      // FTB saving is 100.
      const result = calculateLBTT({
        propertyPrice: 150000,
        buyerType: 'first-time',
        isNonResident: false,
      });

      expect(result.totalTax).toBe(0);
      expect(result.effectiveRate).toBe(0);
      expect(result.firstTimeBuyerSaving).toBe(100);
      expect(result.bands).toEqual([{ from: 0, to: 150000, rate: 0, taxDue: 0 }]);
    });
  });
});
