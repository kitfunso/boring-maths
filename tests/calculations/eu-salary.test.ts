import { describe, it, expect } from 'vitest';
import { calculateSalary } from '../../src/components/calculators/EUSalaryCalculator/calculations';
import type { SalaryInputs } from '../../src/components/calculators/EUSalaryCalculator/types';

describe('EuSalaryCalculator', () => {
  describe('calculateSalary', () => {
    it('should calculate with valid inputs', () => {
      const inputs: SalaryInputs = {
        grossSalary: 50000,
        countryCode: 'DE',
      };

      const result = calculateSalary(inputs);

      expect(result).toBeDefined();
      expect(result.grossSalary).toBe(50000);
      expect(result.socialSecurity).toBeGreaterThan(0);
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.netSalary).toBeGreaterThan(0);
      expect(result.netSalary).toBeLessThan(result.grossSalary);
    });

    it('should handle different countries', () => {
      const inputsDE: SalaryInputs = {
        grossSalary: 60000,
        countryCode: 'DE',
      };

      const inputsFR: SalaryInputs = {
        grossSalary: 60000,
        countryCode: 'FR',
      };

      const resultDE = calculateSalary(inputsDE);
      const resultFR = calculateSalary(inputsFR);

      expect(resultDE.netSalary).toBeDefined();
      expect(resultFR.netSalary).toBeDefined();
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
