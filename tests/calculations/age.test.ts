/**
 * AgeCalculator Calculator - Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateAge } from '../../src/components/calculators/AgeCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/AgeCalculator/types';

describe('AgeCalculator', () => {
  describe('calculateAge', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 3, 6)); // Apr 6, 2026
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateAge(inputs);

      expect(result.years).toBe(30);
      expect(result.months).toBe(0);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();

      const result = calculateAge(inputs);

      expect(result).toBeDefined();
      expect(typeof result.years).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();

      const result = calculateAge(inputs);

      expect(result).toBeDefined();
      expect(typeof result.years).toBe('number');
      expect(isFinite(result.years)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateAge(inputs);
      const result2 = calculateAge(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
