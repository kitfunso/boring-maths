import { describe, it, expect } from 'vitest';
import {
  calculateHomeAffordability,
  getDefaultInputs,
  loanFromPayment,
} from '../../src/components/calculators/HomeAffordabilityCalculator/calculations';

describe('HomeAffordabilityCalculator', () => {
  describe('calculateHomeAffordability', () => {
    it('computes the front-end-bound default case', () => {
      const result = calculateHomeAffordability(getDefaultInputs());

      expect(result.maxHousingPayment).toBe(2800);
      expect(result.bindingRule).toBe('front');
      expect(result.maxHomePrice).toBe(415369);
      expect(result.maxLoan).toBe(355369);
      expect(result.totalMonthlyPayment).toBeCloseTo(2800, 1);
    });

    it('switches to the back-end rule when debts are high', () => {
      const result = calculateHomeAffordability({
        annualIncome: 120000,
        monthlyDebts: 2000,
        downPayment: 60000,
        interestRate: 6.5,
        termYears: 30,
        propertyTaxRate: 1.1,
        insuranceRate: 0.5,
      });

      expect(result.maxHousingPayment).toBe(1600);
      expect(result.bindingRule).toBe('back');
      expect(result.maxHomePrice).toBe(258589);
      expect(result.maxLoan).toBe(198589);
    });

    it('handles a zero interest rate via the linear loan path', () => {
      const result = calculateHomeAffordability({
        annualIncome: 60000,
        monthlyDebts: 0,
        downPayment: 20000,
        interestRate: 0,
        termYears: 30,
        propertyTaxRate: 1.1,
        insuranceRate: 0.5,
      });

      expect(result.maxHousingPayment).toBe(1400);
      expect(result.bindingRule).toBe('front');
      expect(result.maxLoan).toBe(334054);
      expect(result.maxHomePrice).toBe(354054);
    });

    it('returns all zeros when debts exceed the back-end budget (edge case)', () => {
      const result = calculateHomeAffordability({
        annualIncome: 120000,
        monthlyDebts: 5000,
        downPayment: 60000,
        interestRate: 6.5,
        termYears: 30,
        propertyTaxRate: 1.1,
        insuranceRate: 0.5,
      });

      expect(result.maxHousingPayment).toBe(0);
      expect(result.maxHomePrice).toBe(0);
      expect(result.maxLoan).toBe(0);
      expect(result.totalMonthlyPayment).toBe(0);
      expect(result.bindingRule).toBe('back');
    });

    it('treats NaN and Infinity inputs as zero, yielding finite zero outputs', () => {
      const result = calculateHomeAffordability({
        annualIncome: NaN,
        monthlyDebts: NaN,
        downPayment: Infinity,
        interestRate: NaN,
        termYears: NaN,
        propertyTaxRate: NaN,
        insuranceRate: NaN,
      });

      expect(Number.isFinite(result.maxHomePrice)).toBe(true);
      expect(Number.isFinite(result.totalMonthlyPayment)).toBe(true);
      expect(result.maxHousingPayment).toBe(0);
      expect(result.maxHomePrice).toBe(0);
      expect(result.maxLoan).toBe(0);
      expect(result.totalMonthlyPayment).toBe(0);
    });

    it('returns zeros for zero income (edge case)', () => {
      const result = calculateHomeAffordability({
        annualIncome: 0,
        monthlyDebts: 0,
        downPayment: 0,
        interestRate: 6.5,
        termYears: 30,
        propertyTaxRate: 1.1,
        insuranceRate: 0.5,
      });

      expect(result.maxHousingPayment).toBe(0);
      expect(result.maxHomePrice).toBe(0);
      expect(result.maxLoan).toBe(0);
    });
  });

  describe('loanFromPayment', () => {
    it('inverts the amortization formula correctly', () => {
      const loan = loanFromPayment(2000, 6, 30);
      expect(loan).toBeCloseTo(333583.23, 1);
    });

    it('uses payment times months when the rate is zero', () => {
      expect(loanFromPayment(1000, 0, 30)).toBe(360000);
    });

    it('returns zero for a zero payment', () => {
      expect(loanFromPayment(0, 6, 30)).toBe(0);
    });
  });
});
