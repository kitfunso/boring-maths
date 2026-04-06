/**
 * UkSalarySacrificeCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateSalarySacrifice } from '../../src/components/calculators/UKSalarySacrificeCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/UKSalarySacrificeCalculator/types';

describe('UkSalarySacrificeCalculator', () => {
  describe('calculateSalarySacrifice', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateSalarySacrifice(inputs);

      expect(result.grossSalaryBefore).toBe(50000);
      expect(result.grossSalaryAfter).toBe(45000);
      expect(result.incomeTaxBefore).toBe(7486);
      expect(result.incomeTaxAfter).toBe(6486);
      expect(result.incomeTaxSaved).toBe(1000);
      expect(result.niBeforeEmployee).toBeCloseTo(2994.4, 1);
      expect(result.niAfterEmployee).toBeCloseTo(2594.4, 1);
      expect(result.niSavedEmployee).toBe(400);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.grossSalary = 0;

      const result = calculateSalarySacrifice(inputs);

      expect(result).toBeDefined();
      expect(typeof result.grossSalaryBefore).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.grossSalary = 5000000;

      const result = calculateSalarySacrifice(inputs);

      expect(result).toBeDefined();
      expect(typeof result.grossSalaryBefore).toBe('number');
      expect(isFinite(result.grossSalaryBefore)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateSalarySacrifice(inputs);
      const result2 = calculateSalarySacrifice(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
