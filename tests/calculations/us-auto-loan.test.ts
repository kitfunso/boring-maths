import { describe, it, expect } from 'vitest';
import { calculateAutoLoan, getDefaultInputs } from '../../src/components/calculators/USAutoLoanCalculator/calculations';

describe('USAutoLoanCalculator', () => {
  describe('calculateAutoLoan', () => {
    it('computes the default loan (35000 price, 5000 down, 3000 trade, 7.25% tax, 6.5% APR, 60 mo)', () => {
      const result = calculateAutoLoan(getDefaultInputs());

      expect(result.salesTaxAmount).toBeCloseTo(2537.5, 2);
      expect(result.principal).toBeCloseTo(29537.5, 2);
      expect(result.monthlyPayment).toBeCloseTo(577.935103, 4);
      expect(result.totalOfPayments).toBeCloseTo(34676.106181, 3);
      expect(result.totalInterest).toBeCloseTo(5138.606181, 3);
      expect(result.totalCost).toBeCloseTo(42676.106181, 3);
    });

    it('handles a zero APR loan with simple division (no interest)', () => {
      const result = calculateAutoLoan({
        vehiclePrice: 20000,
        downPayment: 0,
        tradeInValue: 0,
        salesTaxRate: 0,
        apr: 0,
        termMonths: 48,
      });

      expect(result.principal).toBeCloseTo(20000, 2);
      expect(result.monthlyPayment).toBeCloseTo(416.666667, 4);
      expect(result.totalOfPayments).toBeCloseTo(20000, 2);
      expect(result.totalInterest).toBeCloseTo(0, 6);
    });

    it('edge case: down payment plus trade in exceed price plus tax, principal floors at zero', () => {
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
