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
    // 40000 * 4.5 = 180000 borrow; + 20000 deposit = 200000 price.
    // Zero rate: 180000 / (25 * 12) = 180000 / 300 = 600 per month.
    // LTV = 180000 / 200000 * 100 = 90.
    const r = calculateMortgageAffordability(base);
    expect(r.maxBorrow).toBe(180000);
    expect(r.maxPropertyPrice).toBe(200000);
    expect(r.monthlyPayment).toBe(600);
    expect(r.ltv).toBe(90);
  });

  it('handles joint income with a real interest rate over 30 years', () => {
    // Total income 80000 * 4.0 = 320000 borrow; + 50000 deposit = 370000.
    // Monthly rate = 5 / 12 / 100 = 0.00416667, n = 360.
    // P = 320000 * 0.00416667 / (1 - 1.00416667^-360) = 1717.83 (rounded to 2dp).
    // LTV = 320000 / 370000 * 100 = 86.4865.
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
    // No income means no borrowing; price equals the deposit only.
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
    // 200000 at 4% over 25 years = 1055.67 per month (rounded to 2dp).
    expect(calculateMonthlyPayment(200000, 4, 25)).toBeCloseTo(1055.67, 2);
  });

  it('treats NaN and Infinity inputs as zero and stays finite', () => {
    // Cleared or malformed fields parse to NaN/Infinity; outputs must be finite 0.
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
