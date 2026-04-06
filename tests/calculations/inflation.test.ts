/**
 * InflationCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateInflation } from '../../src/components/calculators/InflationCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/InflationCalculator/types';

describe('InflationCalculator', () => {
  describe('calculateInflation', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateInflation(inputs);

      expect(result.originalAmount).toBe(100);
      expect(result.adjustedAmount).toBeCloseTo(187.93013786292667, 2);
      expect(result.totalInflation).toBeCloseTo(87.93013786292667, 2);
      expect(result.averageAnnualRate).toBeCloseTo(2.555712757767381, 2);
      expect(result.purchasingPowerLost).toBeCloseTo(46.78873695450676, 2);
      expect(result.yearsElapsed).toBe(25);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.amount = 0;

      const result = calculateInflation(inputs);

      expect(result).toBeDefined();
      expect(typeof result.originalAmount).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.amount = 10000;

      const result = calculateInflation(inputs);

      expect(result).toBeDefined();
      expect(typeof result.originalAmount).toBe('number');
      expect(isFinite(result.originalAmount)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateInflation(inputs);
      const result2 = calculateInflation(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
