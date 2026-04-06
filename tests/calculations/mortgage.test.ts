/**
 * MortgageCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateMortgage } from '../../src/components/calculators/MortgageCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/MortgageCalculator/types';

describe('MortgageCalculator', () => {
  describe('calculateMortgage', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateMortgage(inputs);

      expect(result.currency).toBe('USD');
      expect(result.loanAmount).toBe(280000);
      expect(result.monthlyPI).toBeCloseTo(1769.79, 2);
      expect(result.monthlyTax).toBe(350);
      expect(result.monthlyInsurance).toBe(125);
      expect(result.monthlyHOA).toBe(0);
      expect(result.monthlyTotal).toBeCloseTo(2244.79, 2);
      expect(result.totalPayments).toBeCloseTo(637124.57, 2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.homePrice = 0;

      const result = calculateMortgage(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.homePrice = 35000000;

      const result = calculateMortgage(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateMortgage(inputs);
      const result2 = calculateMortgage(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
