/**
 * HourlyToSalaryCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateHourlyToSalary } from '../../src/components/calculators/HourlyToSalary/calculations';
import { getDefaultInputs } from '../../src/components/calculators/HourlyToSalary/types';

describe('HourlyToSalaryCalculator', () => {
  describe('calculateHourlyToSalary', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateHourlyToSalary(inputs);

      expect(result.currency).toBe('USD');
      expect(result.grossAnnual).toBe(74880);
      expect(result.netAnnual).toBe(52416);
      expect(result.grossMonthly).toBe(6240);
      expect(result.netMonthly).toBe(4368);
      expect(result.grossBiWeekly).toBe(2880);
      expect(result.netBiWeekly).toBe(2016);
      expect(result.grossWeekly).toBe(1440);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.hourlyRate = 0;

      const result = calculateHourlyToSalary(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.hoursPerWeek = 4000;

      const result = calculateHourlyToSalary(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateHourlyToSalary(inputs);
      const result2 = calculateHourlyToSalary(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
