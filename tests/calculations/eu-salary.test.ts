/**
 * EUSalary Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateSalary } from '../../src/components/calculators/EUSalaryCalculator/calculations';
import type { SalaryInputs } from '../../src/components/calculators/EUSalaryCalculator/types';

describe('EuSalaryCalculator', () => {
  describe('calculateSalary', () => {
    it('should calculate German salary correctly', () => {
      const inputs: SalaryInputs = {
        grossSalary: 50000,
        countryCode: 'DE',
      };

      const result = calculateSalary(inputs);

      expect(result.grossSalary).toBe(50000);
      expect(result.socialSecurity).toBeGreaterThan(0);
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.netSalary).toBeGreaterThan(0);
      expect(result.netSalary).toBeLessThan(result.grossSalary);
    });

    it('should handle zero salary', () => {
      const inputs: SalaryInputs = {
        grossSalary: 0,
        countryCode: 'DE',
      };

      const result = calculateSalary(inputs);

      expect(result.grossSalary).toBe(0);
      expect(result.netSalary).toBe(0);
    });

    it('should handle different countries', () => {
      const inputsFR: SalaryInputs = {
        grossSalary: 60000,
        countryCode: 'FR',
      };

      const resultFR = calculateSalary(inputsFR);

      expect(resultFR.grossSalary).toBe(60000);
      expect(resultFR.netSalary).toBeGreaterThan(0);
      expect(resultFR.netSalary).toBeLessThan(60000);
    });

    it('should produce consistent results', () => {
      const inputs: SalaryInputs = {
        grossSalary: 75000,
        countryCode: 'NL',
      };

      const result1 = calculateSalary(inputs);
      const result2 = calculateSalary(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
