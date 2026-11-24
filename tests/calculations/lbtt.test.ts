import { describe, it, expect } from 'vitest';
import { calculateLBTT } from '../../src/components/calculators/LBTTCalculator/calculations';

describe('LBTTCalculator', () => {
  describe('calculateLBTT', () => {
    it('should calculate standard bands on a value crossing multiple bands', () => {
      const result = calculateLBTT({
        propertyPrice: 400000,
        buyerType: 'home-mover',
      });

      expect(result.totalTax).toBe(13350);
      expect(result.effectiveRate).toBeCloseTo(3.3375, 4);
      expect(result.adsSurcharge).toBe(0);
      expect(result.firstTimeBuyerSaving).toBe(0);
      expect(result.bands).toEqual([
        { from: 0, to: 145000, rate: 0, taxDue: 0 },
        { from: 145001, to: 250000, rate: 0.02, taxDue: 2100 },
        { from: 250001, to: 325000, rate: 0.05, taxDue: 3750 },
        { from: 325001, to: 400000, rate: 0.1, taxDue: 7500 },
      ]);
    });

    it('should apply the 8% ADS surcharge for an additional property', () => {
      const result = calculateLBTT({
        propertyPrice: 300000,
        buyerType: 'additional',
      });

      expect(result.adsSurcharge).toBe(24000);
      expect(result.totalTax).toBe(28600);
      expect(result.effectiveRate).toBeCloseTo(9.5333, 3);
      expect(result.firstTimeBuyerSaving).toBe(0);
    });

    it('should not apply ADS below the £40,000 threshold', () => {
      const result = calculateLBTT({
        propertyPrice: 39999,
        buyerType: 'additional',
      });

      expect(result.adsSurcharge).toBe(0);
      expect(result.totalTax).toBe(0);
    });

    it('should apply ADS at exactly £40,000', () => {
      const result = calculateLBTT({
        propertyPrice: 40000,
        buyerType: 'additional',
      });

      expect(result.adsSurcharge).toBe(3200);
      expect(result.totalTax).toBe(3200);
    });

    it('should give a first-time buyer the higher nil-rate band', () => {
      const result = calculateLBTT({
        propertyPrice: 150000,
        buyerType: 'first-time',
      });

      expect(result.totalTax).toBe(0);
      expect(result.effectiveRate).toBe(0);
      expect(result.firstTimeBuyerSaving).toBe(100);
      expect(result.bands).toEqual([{ from: 0, to: 150000, rate: 0, taxDue: 0 }]);
    });
  });
});
