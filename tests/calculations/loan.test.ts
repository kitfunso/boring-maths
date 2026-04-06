/**
 * LoanCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateLoan } from '../../src/components/calculators/LoanCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/LoanCalculator/types';

describe('LoanCalculator', () => {
  describe('calculateLoan', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(500.95, 2);
      expect(result.totalPayment).toBeCloseTo(30056.92, 2);
      expect(result.totalInterest).toBeCloseTo(5056.92, 2);
      expect(result.effectiveRate).toBeCloseTo(20.2, 1);
      expect(result.payoffDate).toBe('April 2031');
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.loanAmount = 0;

      const result = calculateLoan(inputs);

      expect(result).toBeDefined();
      expect(typeof result.monthlyPayment).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.loanAmount = 2500000;

      const result = calculateLoan(inputs);

      expect(result).toBeDefined();
      expect(typeof result.monthlyPayment).toBe('number');
      expect(isFinite(result.monthlyPayment)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateLoan(inputs);
      const result2 = calculateLoan(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
