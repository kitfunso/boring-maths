/**
 * Home Affordability Calculator - Unit Tests
 *
 * Expected values are hand-computed from the 28/36 rule plus the fixed-point
 * tax/insurance loop. The mortgage math is the standard amortization formula
 * inverted to solve for the loan a payment can support.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateHomeAffordability,
  getDefaultInputs,
  loanFromPayment,
} from '../../src/components/calculators/HomeAffordabilityCalculator/calculations';

describe('HomeAffordabilityCalculator', () => {
  describe('calculateHomeAffordability', () => {
    it('computes the front-end-bound default case', () => {
      // gross monthly = 120000/12 = 10000
      // front = 0.28*10000 = 2800; back = 0.36*10000 - 500 = 3100
      // min = 2800 -> front rule binds; total housing budget = 2800
      // fixed point converges to price ~415369, loan ~355369
      const result = calculateHomeAffordability(getDefaultInputs());

      expect(result.maxHousingPayment).toBe(2800);
      expect(result.bindingRule).toBe('front');
      expect(result.maxHomePrice).toBe(415369);
      expect(result.maxLoan).toBe(355369);
      // total monthly always equals the housing budget when affordable
      expect(result.totalMonthlyPayment).toBeCloseTo(2800, 1);
    });

    it('switches to the back-end rule when debts are high', () => {
      // monthlyDebts = 2000 -> back = 3600 - 2000 = 1600 < 2800 front
      // budget = 1600 -> back rule binds; price converges to ~258589
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
      // gross monthly = 60000/12 = 5000; front = 1400; back = 1800 -> front binds (1400)
      // r = 0 so loan = payment * months. converges to loan ~334054
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
      // monthlyDebts = 5000 -> back = 3600 - 5000 = -1400, floored budget = 0
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
      // a cleared field reads as NaN; an overflow reads as Infinity. Both floor to 0.
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
      // 2000/mo at 6% over 30 years: loan = 2000*(1-(1+0.005)^-360)/0.005
      // = 2000 * 166.7916 = 333583.23
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
