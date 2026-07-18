/**
 * AdsCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateADS } from '../../src/components/calculators/ADSCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/ADSCalculator/types';

describe('AdsCalculator', () => {
  describe('calculateADS', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateADS(inputs);

      expect(result.adsAmount).toBe(0);
      expect(result.lbttAmount).toBe(1500);
      expect(result.totalTax).toBe(1500);
      expect(result.effectiveRate).toBeCloseTo(0.6, 1);
      expect(result.firstTimeBuyerSaving).toBe(600);
    });

    it('should apply the 8% ADS rate for an additional property', () => {
      // £250,000, buyerType 'additional' (standard bands, since only
      // first-time buyers get the higher nil band):
      // band1: (145000-0+1)*0 = 0
      // band2: (250000-145001+1)*0.02 = 105000*0.02 = 2100
      // lbttAmount = 0+2100 = 2100
      // adsAmount = round(250000 * 0.08) = 20000
      // total = 2100 + 20000 = 22100
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 250000;
      inputs.buyerType = 'additional';
      inputs.isAdditionalProperty = true;

      const result = calculateADS(inputs);

      expect(result.adsAmount).toBe(20000);
      expect(result.lbttAmount).toBe(2100);
      expect(result.totalTax).toBe(22100);
      expect(result.effectiveRate).toBeCloseTo(8.84, 4);
      expect(result.firstTimeBuyerSaving).toBe(0);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 0;

      const result = calculateADS(inputs);

      expect(result).toBeDefined();
      expect(typeof result.adsAmount).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 25000000;

      const result = calculateADS(inputs);

      expect(result).toBeDefined();
      expect(typeof result.adsAmount).toBe('number');
      expect(isFinite(result.adsAmount)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateADS(inputs);
      const result2 = calculateADS(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
