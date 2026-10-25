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

      // Plan 2 threshold is GBP 29,385 from April 2026 (gov.uk); repayment = 9% of income above it.
      // Interest is the income-contingent Plan 2 sliding rate (RPI to RPI+3%), not the flat max rate.
      expect(result.monthlyRepayment).toBeCloseTo(42.11, 2);
      expect(result.annualRepayment).toBeCloseTo(505.35, 2);
      expect(result.yearsToRepay).toBe(30);
      expect(result.totalRepaid).toBeCloseTo(70523.06, 2);
      expect(result.totalInterest).toBeCloseTo(154440.13, 2);
      // write-off is currentYear + 30 (kept dynamic so the test does not rot each year).
      expect(result.writeOffDate).toBe(new Date().getFullYear() + 30);
      expect(result.amountWrittenOff).toBeCloseTo(133917.07, 2);
      expect(result.willRepayInFull).toBe(false);
    });

    it('applies Plan 2 interest as RPI plus a 3-point income slide, capped at 6%', () => {
      const at = (annualSalary: number) =>
        calculateStudentLoan({ ...getDefaultInputs(), loanBalance: 50000, annualSalary })
          .yearlyBreakdown[0].interestCharged;
      // £40,000: 4.1% + (40,000 - 29,385) / 23,500 x 3% = 5.455%
      expect(at(40000)).toBeCloseTo(2727.55, 1);
      expect(at(25000)).toBeCloseTo(2050, 1);
      // RPI + 3% would be 7.1%; the cap holds it at 6% from about £44,000 up
      expect(at(60000)).toBeCloseTo(3000, 1);
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
