/**
 * LyeCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateLye } from '../../src/components/calculators/LyeCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/LyeCalculator/types';

describe('LyeCalculator', () => {
  describe('calculateLye', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateLye(inputs);

      expect(result.totalOilWeight).toBe(28);
      expect(result.lyeAmount).toBeCloseTo(3.88, 2);
      expect(result.waterAmount).toBeCloseTo(7.75, 2);
      expect(result.totalBatchWeight).toBeCloseTo(39.63, 2);
      expect(result.superfatAmount).toBeCloseTo(1.4, 1);
      expect(result.lyeConcentration).toBeCloseTo(33.3, 1);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.superfatPercent = 0;

      const result = calculateLye(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalOilWeight).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.waterRatio = 200;

      const result = calculateLye(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalOilWeight).toBe('number');
      expect(isFinite(result.totalOilWeight)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateLye(inputs);
      const result2 = calculateLye(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
