/**
 * BbqCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateBBQ } from '../../src/components/calculators/BBQCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/BBQCalculator/types';

describe('BbqCalculator', () => {
  describe('calculateBBQ', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateBBQ(inputs);

      expect(result.totalMeatPounds).toBeCloseTo(9.7, 1);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.guestCount = 0;

      const result = calculateBBQ(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalMeatPounds).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.guestCount = 2000;

      const result = calculateBBQ(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalMeatPounds).toBe('number');
      expect(isFinite(result.totalMeatPounds)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateBBQ(inputs);
      const result2 = calculateBBQ(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
