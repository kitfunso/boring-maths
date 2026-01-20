import { describe, it, expect } from 'vitest';
import { calculateFIRE } from '../../src/components/calculators/FIRECalculator/calculations';
import type { FIREInputs } from '../../src/components/calculators/FIRECalculator/types';

describe('FireCalculator', () => {
  describe('calculateFIRE', () => {
    it('should calculate with valid inputs', () => {
      const inputs: FIREInputs = {
        currentAge: 30,
        currentSavings: 50000,
        monthlyIncome: 8000,
        monthlyExpenses: 4000,
        expectedReturn: 7,
        withdrawalRate: 4,
        inflationRate: 2.5,
        includeSocialSecurity: false,
        estimatedSSMonthly: 0,
        ssStartAge: 67,
      };

      const result = calculateFIRE(inputs);

      expect(result).toBeDefined();
      expect(result.fireNumber).toBeGreaterThan(0);
      expect(result.yearsToFIRE).toBeGreaterThan(0);
      expect(result.fireAge).toBeGreaterThan(inputs.currentAge);
    });

    it('should produce consistent results', () => {
      const inputs: FIREInputs = {
        currentAge: 35,
        currentSavings: 100000,
        monthlyIncome: 10000,
        monthlyExpenses: 5000,
        expectedReturn: 7,
        withdrawalRate: 4,
        inflationRate: 2.5,
        includeSocialSecurity: false,
        estimatedSSMonthly: 0,
        ssStartAge: 67,
      };

      const result1 = calculateFIRE(inputs);
      const result2 = calculateFIRE(inputs);

      expect(result1).toEqual(result2);
    });
  });
});