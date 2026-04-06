/**
 * SalaryToHourlyCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateSalaryToHourly } from '../../src/components/calculators/SalaryToHourly/calculations';
import { getDefaultInputs } from '../../src/components/calculators/SalaryToHourly/types';

describe('SalaryToHourlyCalculator', () => {
  describe('calculateSalaryToHourly', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateSalaryToHourly(inputs);

      expect(result.currency).toBe('USD');
      expect(result.standardHourlyRate).toBeCloseTo(31.25, 2);
      expect(result.actualHourlyRate).toBeCloseTo(30.73, 2);
      expect(result.totalCompHourlyRate).toBeCloseTo(36.41, 2);
      expect(result.totalCompensation).toBe(77000);
      expect(result.actualHoursPerYear).toBe(2115);
      expect(result.standardHoursPerYear).toBe(2080);
      expect(result.extraHoursPerYear).toBe(235);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.annualSalary = 0;

      const result = calculateSalaryToHourly(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.annualSalary = 6500000;

      const result = calculateSalaryToHourly(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateSalaryToHourly(inputs);
      const result2 = calculateSalaryToHourly(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
