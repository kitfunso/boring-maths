/**
 * Loan Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateLoan, formatTermDisplay } from '../../src/components/calculators/LoanCalculator/calculations';
import type { LoanInputs } from '../../src/components/calculators/LoanCalculator/types';

describe('LoanCalculator', () => {
  describe('calculateLoan', () => {
    it('calculates monthly payment correctly', () => {
      const inputs: LoanInputs = {
        currency: 'USD',
        loanType: 'personal',
        loanAmount: 10000,
        interestRate: 5, // 5%
        loanTerm: 12, // 1 year
      };

      const result = calculateLoan(inputs);

      // $10,000 at 5% for 12 months
      // Monthly payment should be around $856
      expect(result.monthlyPayment).toBeGreaterThan(850);
      expect(result.monthlyPayment).toBeLessThan(860);
    });

    it('calculates total payment and interest correctly', () => {
      const inputs: LoanInputs = {
        currency: 'USD',
        loanType: 'auto',
        loanAmount: 20000,
        interestRate: 6,
        loanTerm: 60, // 5 years
      };

      const result = calculateLoan(inputs);

      // Total payment = monthly * term
      expect(result.totalPayment).toBeCloseTo(result.monthlyPayment * 60, 0);

      // Total interest = total payment - principal
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

      // First payment should have more interest than last
      expect(result.amortization[0].interest).toBeGreaterThan(
        result.amortization[11].interest
      );

      // Last payment should have balance of 0
      expect(result.amortization[11].balance).toBe(0);

      // Each row should have principal + interest = payment
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

      // With 0% interest, monthly payment = principal / months
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
        loanTerm: 36, // 3 years
      };

      const result = calculateLoan(inputs);

      // Effective rate = (total interest / principal) * 100
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
