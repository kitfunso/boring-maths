import { describe, it, expect } from 'vitest';
import {
  calculateLoan,
  formatTermDisplay,
} from '../../src/components/calculators/LoanCalculator/calculations';
import type { LoanInputs } from '../../src/components/calculators/LoanCalculator/types';

describe('LoanCalculator', () => {
  describe('calculateLoan', () => {
    it('calculates monthly payment correctly', () => {
      const inputs: LoanInputs = {
        currency: 'USD',
        loanType: 'personal',
        loanAmount: 10000,
        interestRate: 5,
        loanTerm: 12,
      };

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBeGreaterThan(850);
      expect(result.monthlyPayment).toBeLessThan(860);
    });

    it('calculates total payment and interest correctly', () => {
      const inputs: LoanInputs = {
        currency: 'USD',
        loanType: 'auto',
        loanAmount: 20000,
        interestRate: 6,
        loanTerm: 60,
      };

      const result = calculateLoan(inputs);

      expect(result.totalPayment).toBeCloseTo(result.monthlyPayment * 60, 0);

      expect(result.totalInterest).toBeCloseTo(result.totalPayment - 20000, 0);
    });

    it('generates correct amortization schedule', () => {
      const inputs: LoanInputs = {
        currency: 'USD',
        loanType: 'personal',
        loanAmount: 12000,
        interestRate: 4,
        loanTerm: 12,
      };

      const result = calculateLoan(inputs);

      expect(result.amortization).toHaveLength(12);

      expect(result.amortization[0].interest).toBeGreaterThan(result.amortization[11].interest);

      expect(result.amortization[11].balance).toBe(0);

      result.amortization.forEach((row) => {
        expect(row.principal + row.interest).toBeCloseTo(row.payment, 1);
      });
    });

    it('handles 0% interest correctly', () => {
      const inputs: LoanInputs = {
        currency: 'USD',
        loanType: 'personal',
        loanAmount: 12000,
        interestRate: 0,
        loanTerm: 12,
      };

      const result = calculateLoan(inputs);

      expect(result.monthlyPayment).toBe(1000);
      expect(result.totalInterest).toBe(0);
      expect(result.totalPayment).toBe(12000);
    });

    it('handles invalid inputs gracefully', () => {
      const zeroAmount: LoanInputs = {
        currency: 'USD',
        loanType: 'personal',
        loanAmount: 0,
        interestRate: 5,
        loanTerm: 12,
      };

      const result = calculateLoan(zeroAmount);

      expect(result.monthlyPayment).toBe(0);
      expect(result.totalPayment).toBe(0);
      expect(result.amortization).toHaveLength(0);
    });

    it('calculates effective rate as percentage of principal', () => {
      const inputs: LoanInputs = {
        currency: 'USD',
        loanType: 'personal',
        loanAmount: 10000,
        interestRate: 10,
        loanTerm: 36,
      };

      const result = calculateLoan(inputs);

      const expectedEffectiveRate = (result.totalInterest / 10000) * 100;
      expect(result.effectiveRate).toBeCloseTo(expectedEffectiveRate, 0);
    });
  });

  describe('formatTermDisplay', () => {
    it('formats months only', () => {
      expect(formatTermDisplay(6)).toBe('6 months');
      expect(formatTermDisplay(11)).toBe('11 months');
    });

    it('formats years only', () => {
      expect(formatTermDisplay(12)).toBe('1 year');
      expect(formatTermDisplay(24)).toBe('2 years');
      expect(formatTermDisplay(60)).toBe('5 years');
    });

    it('formats years and months combination', () => {
      expect(formatTermDisplay(18)).toBe('1y 6m');
      expect(formatTermDisplay(30)).toBe('2y 6m');
      expect(formatTermDisplay(15)).toBe('1y 3m');
    });
  });
});
