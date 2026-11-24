import { describe, it, expect } from 'vitest';
import { calculateLTT } from '../../src/components/calculators/LTTCalculator/calculations';

describe('LTTCalculator', () => {
  describe('calculateLTT', () => {
    it('should calculate main residential bands on a value crossing several bands', () => {
      const result = calculateLTT({
        propertyPrice: 900000,
        buyerType: 'standard',
      });

      expect(result.totalTax).toBe(51750);
      expect(result.effectiveRate).toBeCloseTo(5.75, 4);
      expect(result.higherRatesSurcharge).toBe(0);
      expect(result.bands).toEqual([
        { from: 0, to: 225000, rate: 0, taxDue: 0 },
        { from: 225001, to: 400000, rate: 0.06, taxDue: 10500 },
        { from: 400001, to: 750000, rate: 0.075, taxDue: 26250 },
        { from: 750001, to: 900000, rate: 0.1, taxDue: 15000 },
      ]);
    });

    it('should calculate higher (additional property) bands on a value crossing several bands', () => {
      const result = calculateLTT({
        propertyPrice: 900000,
        buyerType: 'additional',
      });

      expect(result.totalTax).toBe(96200);
      expect(result.effectiveRate).toBeCloseTo(10.6889, 3);
      expect(result.higherRatesSurcharge).toBe(44450);
      expect(result.bands).toEqual([
        { from: 0, to: 180000, rate: 0.05, taxDue: 9000 },
        { from: 180001, to: 250000, rate: 0.085, taxDue: 5950 },
        { from: 250001, to: 400000, rate: 0.1, taxDue: 15000 },
        { from: 400001, to: 750000, rate: 0.125, taxDue: 43750 },
        { from: 750001, to: 900000, rate: 0.15, taxDue: 22500 },
      ]);
    });

    it('should use standard bands for an additional property below the £40,000 threshold', () => {
      const result = calculateLTT({
        propertyPrice: 39999,
        buyerType: 'additional',
      });

      expect(result.totalTax).toBe(0);
      expect(result.higherRatesSurcharge).toBe(0);
      expect(result.bands).toEqual([{ from: 0, to: 39999, rate: 0, taxDue: 0 }]);
    });

    it('should apply higher bands at exactly £40,000', () => {
      const result = calculateLTT({
        propertyPrice: 40000,
        buyerType: 'additional',
      });

      expect(result.totalTax).toBe(2000);
      expect(result.higherRatesSurcharge).toBe(2000);
    });
  });
});
