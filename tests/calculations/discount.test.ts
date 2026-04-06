/**
 * DiscountCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateDiscount } from '../../src/components/calculators/DiscountCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/DiscountCalculator/types';

describe('DiscountCalculator', () => {
  describe('calculateDiscount', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateDiscount(inputs);

      expect(result.originalPrice).toBe(100);
      expect(result.discountPercent).toBe(25);
      expect(result.discountAmount).toBe(25);
      expect(result.finalPrice).toBe(75);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.originalPrice = 0;

      const result = calculateDiscount(inputs);

      expect(result).toBeDefined();
      expect(typeof result.originalPrice).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.originalPrice = 10000;

      const result = calculateDiscount(inputs);

      expect(result).toBeDefined();
      expect(typeof result.originalPrice).toBe('number');
      expect(isFinite(result.originalPrice)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateDiscount(inputs);
      const result2 = calculateDiscount(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
