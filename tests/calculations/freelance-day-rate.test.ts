/**
 * FreelanceDayRateCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateFreelanceDayRate } from '../../src/components/calculators/FreelanceDayRate/calculations';
import { getDefaultInputs } from '../../src/components/calculators/FreelanceDayRate/types';

describe('FreelanceDayRateCalculator', () => {
  describe('calculateFreelanceDayRate', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateFreelanceDayRate(inputs);

      expect(result.currency).toBe('USD');
      expect(result.grossDayRate).toBeCloseTo(319.15, 2);
      expect(result.netDayRate).toBeCloseTo(223.4, 1);
      expect(result.hourlyRate).toBeCloseTo(27.93, 2);
      expect(result.monthlyIncome).toBeCloseTo(4841.17, 2);
      expect(result.weeklyIncome).toBeCloseTo(1117.02, 2);
      expect(result.workingDays).toBe(235);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.annualSalary = 0;

      const result = calculateFreelanceDayRate(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.annualSalary = 7500000;

      const result = calculateFreelanceDayRate(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateFreelanceDayRate(inputs);
      const result2 = calculateFreelanceDayRate(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
