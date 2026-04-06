/**
 * GoFullTimeCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateGoFullTime } from '../../src/components/calculators/GoFullTimeCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/GoFullTimeCalculator/types';

describe('GoFullTimeCalculator', () => {
  describe('calculateGoFullTime', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateGoFullTime(inputs);

      expect(result.currency).toBe('USD');
      expect(result.monthlySalary).toBe(6250);
      expect(result.monthlyTotalCompensation).toBe(7050);
      expect(result.currentRunwayMonths).toBe(10);
      expect(result.breakEvenSideIncome).toBe(4000);
      expect(result.incomeGapToSalary).toBe(5550);
      expect(result.incomeGapToExpenses).toBe(2500);
      expect(result.monthsToCrossover).toBe(11);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.annualSalary = 0;

      const result = calculateGoFullTime(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.annualSalary = 7500000;

      const result = calculateGoFullTime(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateGoFullTime(inputs);
      const result2 = calculateGoFullTime(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
