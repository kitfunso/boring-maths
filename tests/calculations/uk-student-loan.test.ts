/**
 * UkStudentLoanCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateStudentLoan } from '../../src/components/calculators/UKStudentLoanCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/UKStudentLoanCalculator/types';

describe('UkStudentLoanCalculator', () => {
  describe('calculateStudentLoan', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateStudentLoan(inputs);

      expect(result.monthlyRepayment).toBeCloseTo(57.79, 2);
      expect(result.annualRepayment).toBeCloseTo(693.45, 2);
      expect(result.yearsToRepay).toBe(30);
      expect(result.totalRepaid).toBeCloseTo(76166.06, 2);
      expect(result.totalInterest).toBeCloseTo(305010.22, 2);
      expect(result.writeOffDate).toBe(2056);
      expect(result.amountWrittenOff).toBeCloseTo(278844.16, 2);
      expect(result.willRepayInFull).toBe(false);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.loanBalance = 0;

      const result = calculateStudentLoan(inputs);

      expect(result).toBeDefined();
      expect(typeof result.monthlyRepayment).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.loanBalance = 5000000;

      const result = calculateStudentLoan(inputs);

      expect(result).toBeDefined();
      expect(typeof result.monthlyRepayment).toBe('number');
      expect(isFinite(result.monthlyRepayment)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateStudentLoan(inputs);
      const result2 = calculateStudentLoan(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
