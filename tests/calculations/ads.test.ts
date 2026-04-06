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
