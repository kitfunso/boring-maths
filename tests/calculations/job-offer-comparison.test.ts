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

    it('should yield finite outputs when inputs are NaN (cleared/partial fields)', () => {
      const inputs = getDefaultInputs();
      inputs.offer1.baseSalary = NaN;
      inputs.offer2.match401kLimit = NaN;
      inputs.hourlyTimeValue = NaN;
      inputs.costPerMile = NaN;

      const result = calculateComparison(inputs);

      expect(Number.isFinite(result.offer1.netComp)).toBe(true);
      expect(Number.isFinite(result.offer2.netComp)).toBe(true);
      expect(Number.isFinite(result.offer1.effectiveHourlyRate)).toBe(true);
      expect(Number.isFinite(result.offer2.match401kValue)).toBe(true);
      expect(Number.isFinite(result.difference.netComp)).toBe(true);
      expect(Number.isFinite(result.difference.percentageDiff)).toBe(true);
    });
  });
});
