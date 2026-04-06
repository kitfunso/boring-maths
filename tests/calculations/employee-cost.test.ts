/**
 * EmployeeCostCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateEmployeeCost } from '../../src/components/calculators/EmployeeCost/calculations';
import { getDefaultInputs } from '../../src/components/calculators/EmployeeCost/types';

describe('EmployeeCostCalculator', () => {
  describe('calculateEmployeeCost', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateEmployeeCost(inputs);

      expect(result.currency).toBe('USD');
      expect(result.totalAnnualCost).toBe(84990);
      expect(result.trueHourlyCost).toBeCloseTo(45.21, 2);
      expect(result.monthlyBurdenCost).toBe(7083);
      expect(result.burdenMultiplier).toBeCloseTo(1.42, 2);
      expect(result.billableRate).toBeCloseTo(64.58, 2);
      expect(result.costPerWorkingDay).toBe(362);
      expect(result.actualWorkingHours).toBe(1880);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.annualSalary = 0;

      const result = calculateEmployeeCost(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.annualSalary = 6000000;

      const result = calculateEmployeeCost(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateEmployeeCost(inputs);
      const result2 = calculateEmployeeCost(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
