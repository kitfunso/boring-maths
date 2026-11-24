import { describe, it, expect } from 'vitest';
import {
  calculateMortgageAffordability,
  calculateMonthlyPayment,
  type MortgageAffordabilityInputs,
} from '../../src/components/calculators/UKMortgageAffordabilityCalculator/calculations';

const base: MortgageAffordabilityInputs = {
  annualIncome: 40000,
  jointIncome: 0,
  deposit: 20000,
  incomeMultiple: 4.5,
  interestRate: 0,
  termYears: 25,
};

describe('calculateMortgageAffordability', () => {
  it('computes max borrow, property price, zero-rate monthly payment and LTV', () => {
    const r = calculateMortgageAffordability(base);
    expect(r.maxBorrow).toBe(180000);
    expect(r.maxPropertyPrice).toBe(200000);
    expect(r.monthlyPayment).toBe(600);
    expect(r.ltv).toBe(90);
  });

  it('handles joint income with a real interest rate over 30 years', () => {
    const r = calculateMortgageAffordability({
      annualIncome: 50000,
      jointIncome: 30000,
      deposit: 50000,
      incomeMultiple: 4,
      interestRate: 5,
      termYears: 30,
    });
    expect(r.totalIncome).toBe(80000);
    expect(r.maxBorrow).toBe(320000);
    expect(r.maxPropertyPrice).toBe(370000);
    expect(r.monthlyPayment).toBeCloseTo(1717.83, 2);
    expect(r.ltv).toBeCloseTo(86.4865, 4);
  });

  it('edge case: zero income borrows nothing and produces zero LTV', () => {
    const r = calculateMortgageAffordability({
      annualIncome: 0,
      jointIncome: 0,
      deposit: 10000,
      incomeMultiple: 4.5,
      interestRate: 4,
      termYears: 25,
    });
    expect(r.maxBorrow).toBe(0);
    expect(r.maxPropertyPrice).toBe(10000);
    expect(r.monthlyPayment).toBe(0);
    expect(r.ltv).toBe(0);
  });

  it('monthly payment helper matches the standard amortisation formula', () => {
    expect(calculateMonthlyPayment(200000, 4, 25)).toBeCloseTo(1055.67, 2);
  });

  it('treats NaN and Infinity inputs as zero and stays finite', () => {
    const r = calculateMortgageAffordability({
      annualIncome: NaN,
      jointIncome: Infinity,
      deposit: NaN,
      incomeMultiple: NaN,
      interestRate: Infinity,
      termYears: NaN,
    });
    expect(r.totalIncome).toBe(0);
    expect(r.maxBorrow).toBe(0);
    expect(r.maxPropertyPrice).toBe(0);
    expect(r.monthlyPayment).toBe(0);
    expect(r.ltv).toBe(0);
  });
});
