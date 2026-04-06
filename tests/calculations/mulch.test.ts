/**
 * MulchCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateMulch } from '../../src/components/calculators/MulchCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/MulchCalculator/types';

describe('MulchCalculator', () => {
  describe('calculateMulch', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateMulch(inputs);

      expect(result.currency).toBe('USD');
      expect(result.areaSqFt).toBe(40);
      expect(result.volumeCuFt).toBe(10);
      expect(result.volumeCuYards).toBeCloseTo(0.37, 2);
      expect(result.bags2CuFt).toBe(5);
      expect(result.bags3CuFt).toBe(4);
      expect(result.estimatedWeight).toBe(180);
      expect(result.bulkCost).toBeCloseTo(12.96, 2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.length = 0;

      const result = calculateMulch(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.length = 1000;

      const result = calculateMulch(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateMulch(inputs);
      const result2 = calculateMulch(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
