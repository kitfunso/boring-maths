/**
 * US Auto Loan Calculator - Unit Tests
 *
 * Expected values are hand computed. The standard amortising loan payment is
 *   payment = principal * r / (1 - (1 + r)^-n)
 * where r is the monthly rate (apr / 100 / 12) and n is the term in months.
 */

import { describe, it, expect } from 'vitest';
import { calculateAutoLoan, getDefaultInputs } from '../../src/components/calculators/USAutoLoanCalculator/calculations';

describe('USAutoLoanCalculator', () => {
  describe('calculateAutoLoan', () => {
    it('computes the default loan (35000 price, 5000 down, 3000 trade, 7.25% tax, 6.5% APR, 60 mo)', () => {
      const result = calculateAutoLoan(getDefaultInputs());

      // salesTax = 35000 * 0.0725 = 2537.50
      expect(result.salesTaxAmount).toBeCloseTo(2537.5, 2);
      // principal = 35000 + 2537.50 - 5000 - 3000 = 29537.50
      expect(result.principal).toBeCloseTo(29537.5, 2);
      // payment = 29537.50 * r / (1 - (1+r)^-60), r = 0.065/12
      expect(result.monthlyPayment).toBeCloseTo(577.935103, 4);
      // total of payments = payment * 60
      expect(result.totalOfPayments).toBeCloseTo(34676.106181, 3);
      // total interest = total of payments - principal
      expect(result.totalInterest).toBeCloseTo(5138.606181, 3);
      // total cost = price + tax + interest = 35000 + 2537.50 + 5138.606181
      expect(result.totalCost).toBeCloseTo(42676.106181, 3);
    });

    it('handles a zero APR loan with simple division (no interest)', () => {
      // 20000 price, no tax, no down, no trade, 0% APR, 48 months.
      const result = calculateAutoLoan({
        vehiclePrice: 20000,
        downPayment: 0,
        tradeInValue: 0,
        salesTaxRate: 0,
        apr: 0,
        termMonths: 48,
      });

      expect(result.principal).toBeCloseTo(20000, 2);
      // 20000 / 48 = 416.6667
      expect(result.monthlyPayment).toBeCloseTo(416.666667, 4);
      expect(result.totalOfPayments).toBeCloseTo(20000, 2);
      expect(result.totalInterest).toBeCloseTo(0, 6);
    });

    it('edge case: down payment plus trade in exceed price plus tax, principal floors at zero', () => {
      // 10000 price, 8000 down, 5000 trade -> would be negative, clamp to 0.
      const result = calculateAutoLoan({
        vehiclePrice: 10000,
        downPayment: 8000,
        tradeInValue: 5000,
        salesTaxRate: 5,
        apr: 7,
        termMonths: 60,
      });

      expect(result.principal).toBe(0);
      expect(result.monthlyPayment).toBe(0);
      expect(result.totalOfPayments).toBe(0);
      expect(result.totalInterest).toBe(0);
    });

    it('edge case: non-finite inputs (NaN/Infinity) yield finite zero outputs', () => {
      const result = calculateAutoLoan({
        vehiclePrice: NaN,
        downPayment: Infinity,
        tradeInValue: NaN,
        salesTaxRate: NaN,
        apr: Infinity,
        termMonths: NaN,
      });

      expect(result.principal).toBe(0);
      expect(result.salesTaxAmount).toBe(0);
      expect(result.monthlyPayment).toBe(0);
      expect(result.totalOfPayments).toBe(0);
      expect(result.totalInterest).toBe(0);
      expect(result.totalCost).toBe(0);
    });

    it('edge case: negative inputs are floored at zero', () => {
      const result = calculateAutoLoan({
        vehiclePrice: -100,
        downPayment: -50,
        tradeInValue: -50,
        salesTaxRate: -5,
        apr: -3,
        termMonths: -12,
      });

      expect(result.principal).toBe(0);
      expect(result.salesTaxAmount).toBe(0);
      expect(result.monthlyPayment).toBe(0);
      expect(result.totalCost).toBe(0);
    });
  });
});
