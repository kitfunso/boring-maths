import { describe, it, expect } from 'vitest';
import { calculateFIRE } from '../../src/components/calculators/FIRECalculator/calculations';
import type { FIRECalculatorInputs } from '../../src/components/calculators/FIRECalculator/types';

describe('FireCalculator', () => {
  describe('calculateFIRE', () => {
    it('should calculate with valid inputs', () => {
      const inputs: FIRECalculatorInputs = {
        currentAge: 30,
        currentSavings: 50000,
        annualIncome: 96000,
        annualExpenses: 48000,
        monthlySavings: 4000,
        targetRetirementAge: 50,
        desiredRetirementExpenses: 48000,
        expectedReturn: 0.07,
        inflationRate: 0.025,
        safeWithdrawalRate: 0.04,
        riskProfile: 'moderate',
        currency: 'USD',
      };

      const result = calculateFIRE(inputs);

      expect(result).toBeDefined();
      expect(result.fireNumbers.regular).toBeGreaterThan(0);
      expect(result.yearsToFIRE).toBeGreaterThan(0);
      expect(result.ageAtFIRE).toBeGreaterThan(inputs.currentAge);
    });

    it('should produce consistent results', () => {
      const inputs: FIRECalculatorInputs = {
        currentAge: 35,
        currentSavings: 100000,
        annualIncome: 120000,
        annualExpenses: 60000,
        monthlySavings: 5000,
        targetRetirementAge: 55,
        desiredRetirementExpenses: 60000,
        expectedReturn: 0.07,
        inflationRate: 0.025,
        safeWithdrawalRate: 0.04,
        riskProfile: 'moderate',
        currency: 'USD',
      };

      const result1 = calculateFIRE(inputs);
      const result2 = calculateFIRE(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
