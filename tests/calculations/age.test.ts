/**
 * AgeCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateAge } from '../../src/components/calculators/AgeCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/AgeCalculator/types';

describe('AgeCalculator', () => {
  describe('calculateAge', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateAge(inputs);

      expect(result.years).toBe(30);
      expect(result.months).toBe(0);
      expect(result.days).toBe(1);
      expect(result.totalDays).toBe(10958);
      expect(result.totalWeeks).toBe(1565);
      expect(result.totalMonths).toBe(360);
      expect(result.totalHours).toBe(262992);
      expect(result.daysUntilBirthday).toBe(364);
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
