/**
 * JobOfferComparisonCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateComparison } from '../../src/components/calculators/JobOfferComparison/calculations';
import { getDefaultInputs } from '../../src/components/calculators/JobOfferComparison/types';

describe('JobOfferComparisonCalculator', () => {
  describe('calculateComparison', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateComparison(inputs);

      expect(result.currency).toBe('USD');
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.hourlyTimeValue = 0;

      const result = calculateComparison(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.hourlyTimeValue = 3500;

      const result = calculateComparison(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateComparison(inputs);
      const result2 = calculateComparison(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
