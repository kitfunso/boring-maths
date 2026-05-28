import { describe, it, expect } from 'vitest';
import {
  calculateMortgageOverpayment,
  calculateMonthlyPayment,
  type MortgageOverpaymentInputs,
} from '../../src/components/calculators/MortgageOverpaymentCalculator/calculations';

// Fixed reference date so the payoff date is deterministic.
const REF = new Date(2025, 0, 1); // 1 Jan 2025.

describe('calculateMonthlyPayment', () => {
  it('matches the standard amortisation formula at a real rate', () => {
    // 200000 at 5% over 25 years (300 months):
    // r = 0.05/12 = 0.00416667, P = 200000*r / (1 - 1.00416667^-300) = 1169.18.
    expect(calculateMonthlyPayment(200000, 5, 25)).toBeCloseTo(1169.18, 2);
  });

  it('zero rate divides the loan evenly across the term', () => {
    // 120000 over 10 years (120 months) at 0% = 1000 per month exactly.
    expect(calculateMonthlyPayment(120000, 0, 10)).toBe(1000);
  });
});

describe('calculateMortgageOverpayment', () => {
  it('zero rate: a monthly overpayment halves a 10 year term', () => {
    // Balance 120000, 0% rate, 10 year term -> payment 1000/month, 120 months.
    // Overpaying 1000/month means 2000/month -> 120000/2000 = 60 months.
    // monthsSaved = 120 - 60 = 60 (5 years exactly). No interest at 0%.
    const inputs: MortgageOverpaymentInputs = {
      balance: 120000,
      interestRate: 0,
      termYears: 10,
      monthlyOverpayment: 1000,
      lumpSum: 0,
    };
    const r = calculateMortgageOverpayment(inputs, REF);
    expect(r.monthlyPayment).toBe(1000);
    expect(r.originalMonths).toBe(120);
    expect(r.newMonths).toBe(60);
    expect(r.monthsSaved).toBe(60);
    expect(r.yearsSaved).toBe(5);
    expect(r.remainingMonthsSaved).toBe(0);
    expect(r.interestSaved).toBe(0);
    // Payoff = REF (1 Jan 2025) + 60 months = 1 Jan 2030.
    expect(r.newPayoffDate).toBe('2030-01-01');
  });

  it('real rate: 200000 at 5% over 25 years with 200/month overpayment', () => {
    // payment = 200000 * (0.05/12) / (1 - (1 + 0.05/12)^-300) = 1169.18.
    // Original schedule amortised: 300 months, total interest 150754.02.
    // With +200/month the balance falls faster: clears in 226 months,
    // total interest 108911.43.
    // interestSaved = 150754.02 - 108911.43 = 41842.60. monthsSaved = 74.
    // 74 months = 6 years and 2 months.
    const inputs: MortgageOverpaymentInputs = {
      balance: 200000,
      interestRate: 5,
      termYears: 25,
      monthlyOverpayment: 200,
      lumpSum: 0,
    };
    const r = calculateMortgageOverpayment(inputs, REF);
    expect(r.monthlyPayment).toBeCloseTo(1169.18, 2);
    expect(r.originalMonths).toBe(300);
    expect(r.originalTotalInterest).toBeCloseTo(150754.02, 2);
    expect(r.newMonths).toBe(226);
    expect(r.newTotalInterest).toBeCloseTo(108911.43, 2);
    expect(r.interestSaved).toBeCloseTo(41842.6, 2);
    expect(r.monthsSaved).toBe(74);
    expect(r.yearsSaved).toBe(6);
    expect(r.remainingMonthsSaved).toBe(2);
  });

  it('edge case: a lump sum at 0% rate shortens the term and sets the payoff date', () => {
    // Balance 100000, 0% rate, 10 year term -> payment 833.33/month, 120 months.
    // A 40000 lump in month 1 leaves 60000 -> 60000/833.33 = 72 months.
    // monthsSaved = 120 - 72 = 48 (4 years). Payoff = REF + 72 months = 1 Jan 2031.
    const inputs: MortgageOverpaymentInputs = {
      balance: 100000,
      interestRate: 0,
      termYears: 10,
      monthlyOverpayment: 0,
      lumpSum: 40000,
    };
    const r = calculateMortgageOverpayment(inputs, REF);
    expect(r.originalMonths).toBe(120);
    expect(r.newMonths).toBe(72);
    expect(r.monthsSaved).toBe(48);
    expect(r.yearsSaved).toBe(4);
    expect(r.newPayoffDate).toBe('2031-01-01');
  });

  it('edge case: non finite and zero term inputs yield finite zeroed outputs', () => {
    // A blank field reaches the calculator as NaN, and a zero term has no
    // schedule. Both must produce finite zeros and an empty payoff date rather
    // than NaN or a ~100 year payoff date from the simulation cap.
    const inputs: MortgageOverpaymentInputs = {
      balance: NaN,
      interestRate: Infinity,
      termYears: 0,
      monthlyOverpayment: NaN,
      lumpSum: NaN,
    };
    const r = calculateMortgageOverpayment(inputs, REF);
    expect(r.monthlyPayment).toBe(0);
    expect(r.newMonths).toBe(0);
    expect(r.originalMonths).toBe(0);
    expect(r.interestSaved).toBe(0);
    expect(r.newPayoffDate).toBe('');
  });

  it('edge case: no overpayment leaves the term and interest unchanged', () => {
    const inputs: MortgageOverpaymentInputs = {
      balance: 150000,
      interestRate: 4,
      termYears: 20,
      monthlyOverpayment: 0,
      lumpSum: 0,
    };
    const r = calculateMortgageOverpayment(inputs, REF);
    expect(r.newMonths).toBe(r.originalMonths);
    expect(r.interestSaved).toBe(0);
    expect(r.monthsSaved).toBe(0);
  });
});
