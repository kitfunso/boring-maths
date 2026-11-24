import { describe, it, expect } from 'vitest';
import {
  calculateUSMortgage,
  calculatePrincipalAndInterest,
  getDefaultInputs,
  type USMortgageInputs,
} from '../../src/components/calculators/USMortgageCalculator/calculations';

describe('calculatePrincipalAndInterest', () => {
  it('matches the standard amortisation formula at a real rate', () => {
    expect(calculatePrincipalAndInterest(360000, 6, 30)).toBeCloseTo(2158.38, 2);
  });

  it('zero rate divides the loan evenly across the term', () => {
    expect(calculatePrincipalAndInterest(160000, 0, 30)).toBeCloseTo(444.4444, 3);
  });
});

describe('calculateUSMortgage', () => {
  it('20 percent down at 0 percent rate: no PMI, P&I plus tax and insurance', () => {
    const inputs: USMortgageInputs = {
      homePrice: 200000,
      downPayment: 40000,
      interestRate: 0,
      termYears: 30,
      propertyTaxRate: 1.1,
      annualInsurance: 1500,
      monthlyHOA: 0,
      pmiRate: 0.5,
    };
    const r = calculateUSMortgage(inputs);
    expect(r.loanAmount).toBe(160000);
    expect(r.principalAndInterest).toBeCloseTo(444.4444, 3);
    expect(r.propertyTaxMonthly).toBeCloseTo(183.3333, 3);
    expect(r.insuranceMonthly).toBe(125);
    expect(r.pmiRequired).toBe(false);
    expect(r.pmiMonthly).toBe(0);
    expect(r.totalMonthly).toBeCloseTo(752.7778, 3);
    expect(r.ltv).toBe(80);
  });

  it('10 percent down at 6 percent rate: PMI applies and is included', () => {
    const inputs: USMortgageInputs = {
      homePrice: 400000,
      downPayment: 40000,
      interestRate: 6,
      termYears: 30,
      propertyTaxRate: 1.1,
      annualInsurance: 1500,
      monthlyHOA: 0,
      pmiRate: 0.5,
    };
    const r = calculateUSMortgage(inputs);
    expect(r.loanAmount).toBe(360000);
    expect(r.principalAndInterest).toBeCloseTo(2158.38, 2);
    expect(r.propertyTaxMonthly).toBeCloseTo(366.6667, 3);
    expect(r.insuranceMonthly).toBe(125);
    expect(r.pmiRequired).toBe(true);
    expect(r.pmiMonthly).toBe(150);
    expect(r.ltv).toBe(90);
    expect(r.totalMonthly).toBeCloseTo(2800.0486, 3);
  });

  it('HOA dues flow straight into the total monthly payment', () => {
    const inputs: USMortgageInputs = {
      homePrice: 400000,
      downPayment: 40000,
      interestRate: 6,
      termYears: 30,
      propertyTaxRate: 1.1,
      annualInsurance: 1500,
      monthlyHOA: 250,
      pmiRate: 0.5,
    };
    const r = calculateUSMortgage(inputs);
    expect(r.hoaMonthly).toBe(250);
    expect(r.totalMonthly).toBeCloseTo(3050.0486, 3);
  });

  it('edge case: zero home price yields a zero payment and no division by zero', () => {
    const inputs: USMortgageInputs = {
      homePrice: 0,
      downPayment: 0,
      interestRate: 6,
      termYears: 30,
      propertyTaxRate: 1.1,
      annualInsurance: 1500,
      monthlyHOA: 0,
      pmiRate: 0.5,
    };
    const r = calculateUSMortgage(inputs);
    expect(r.loanAmount).toBe(0);
    expect(r.principalAndInterest).toBe(0);
    expect(r.propertyTaxMonthly).toBe(0);
    expect(r.pmiMonthly).toBe(0);
    expect(r.ltv).toBe(0);
    expect(r.totalMonthly).toBe(125);
  });

  it('non-finite inputs are treated as zero and yield finite outputs', () => {
    const inputs: USMortgageInputs = {
      homePrice: NaN,
      downPayment: Infinity,
      interestRate: NaN,
      termYears: NaN,
      propertyTaxRate: NaN,
      annualInsurance: NaN,
      monthlyHOA: NaN,
      pmiRate: NaN,
    };
    const r = calculateUSMortgage(inputs);
    expect(r.loanAmount).toBe(0);
    expect(r.principalAndInterest).toBe(0);
    expect(r.propertyTaxMonthly).toBe(0);
    expect(r.insuranceMonthly).toBe(0);
    expect(r.hoaMonthly).toBe(0);
    expect(r.pmiMonthly).toBe(0);
    expect(r.totalMonthly).toBe(0);
    expect(r.ltv).toBe(0);
    expect(Number.isFinite(r.totalMonthly)).toBe(true);
  });

  it('getDefaultInputs returns a usable, fully populated input set', () => {
    const d = getDefaultInputs();
    const r = calculateUSMortgage(d);
    expect(d.homePrice).toBeGreaterThan(0);
    expect(r.pmiRequired).toBe(false);
    expect(r.totalMonthly).toBeGreaterThan(0);
  });
});
