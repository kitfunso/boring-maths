/**
 * Fragrance Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateFragrance } from '../../src/components/calculators/FragranceCalculator/calculations';
import type { FragranceInputs } from '../../src/components/calculators/FragranceCalculator/types';

describe('FragranceCalculator', () => {
  describe('calculateFragrance', () => {
    it('should calculate fragrance amount for standard candle', () => {
      const inputs: FragranceInputs = {
        waxWeight: 8,
        weightUnit: 'ounces',
        fragranceLoad: 10,
        waxType: 'soy-464',
        numberOfCandles: 1,
      };

      const result = calculateFragrance(inputs);

      // 10% of 8oz = 0.8oz fragrance
      expect(result.fragranceAmount).toBeCloseTo(0.8, 1);
      expect(result.totalWeight).toBeCloseTo(8.8, 1);
      expect(result.isWithinLimit).toBe(true);
    });

    it('should detect exceeding max fragrance limit', () => {
      const inputs: FragranceInputs = {
        waxWeight: 8,
        weightUnit: 'ounces',
        fragranceLoad: 15,
        waxType: 'soy-464',
        numberOfCandles: 1,
      };

      const result = calculateFragrance(inputs);

      // Soy 464 max is 10%, so 15% should exceed
      expect(result.isWithinLimit).toBe(false);
    });

    it('should scale for multiple candles', () => {
      const inputs: FragranceInputs = {
        waxWeight: 8,
        weightUnit: 'ounces',
        fragranceLoad: 8,
        waxType: 'soy-464',
        numberOfCandles: 10,
      };

      const result = calculateFragrance(inputs);

      expect(result.fragranceAmount).toBeGreaterThan(result.fragrancePerCandle);
    });

    it('should produce consistent results', () => {
      const inputs: FragranceInputs = {
        waxWeight: 8,
        weightUnit: 'ounces',
        fragranceLoad: 10,
        waxType: 'soy-464',
        numberOfCandles: 1,
      };

      const result1 = calculateFragrance(inputs);
      const result2 = calculateFragrance(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
