/**
 * PercentageCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculate } from '../../src/components/calculators/PercentageCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/PercentageCalculator/types';

describe('PercentageCalculator', () => {
  describe('calculate', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculate(inputs);

      expect(result.mode).toBe('percentOf');
      expect(result.primaryResult).toBe(30);
      expect(result.primaryLabel).toBe('15% of 200');
      expect(result.formattedPrimary).toBe('30');
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.percentOf_percentage = 0;

      const result = calculate(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.increaseDecrease_value = 10000;

      const result = calculate(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculate(inputs);
      const result2 = calculate(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
