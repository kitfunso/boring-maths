/**
 * HolidayDinnerCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateHolidayDinner } from '../../src/components/calculators/HolidayDinnerCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/HolidayDinnerCalculator/types';

describe('HolidayDinnerCalculator', () => {
  describe('calculateHolidayDinner', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateHolidayDinner(inputs);

      expect(result.totalSideServings).toBe(80);
      expect(result.vegetarianMains).toBe(0);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.guestCount = 0;

      const result = calculateHolidayDinner(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalSideServings).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.guestCount = 1000;

      const result = calculateHolidayDinner(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalSideServings).toBe('number');
      expect(isFinite(result.totalSideServings)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateHolidayDinner(inputs);
      const result2 = calculateHolidayDinner(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
