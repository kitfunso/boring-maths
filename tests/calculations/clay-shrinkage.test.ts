/**
 * ClayShrinkageCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateClayShrinkage } from '../../src/components/calculators/ClayShrinkageCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/ClayShrinkageCalculator/types';

describe('ClayShrinkageCalculator', () => {
  describe('calculateClayShrinkage', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateClayShrinkage(inputs);

      expect(result.resultSize).toBeCloseTo(8.8, 1);
      expect(result.totalShrinkage).toBe(12);
      expect(result.dryShrinkage).toBe(6);
      expect(result.firingShrinkage).toBe(6);
      expect(result.shrinkageFactor).toBeCloseTo(0.88, 2);
      expect(result.sizeChange).toBeCloseTo(1.2, 1);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.knownSize = 0;

      const result = calculateClayShrinkage(inputs);

      expect(result).toBeDefined();
      expect(typeof result.resultSize).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.knownSize = 1000;

      const result = calculateClayShrinkage(inputs);

      expect(result).toBeDefined();
      expect(typeof result.resultSize).toBe('number');
      expect(isFinite(result.resultSize)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateClayShrinkage(inputs);
      const result2 = calculateClayShrinkage(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
