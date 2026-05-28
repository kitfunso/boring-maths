import { describe, it, expect } from 'vitest';
import {
  calculateUSMortgage,
  calculatePrincipalAndInterest,
  getDefaultInputs,
  type USMortgageInputs,
} from '../../src/components/calculators/USMortgageCalculator/calculations';

describe('calculatePrincipalAndInterest', () => {
  it('matches the standard amortisation formula at a real rate', () => {
    // 360000 at 6% over 30 years (360 months):
    // r = 0.06/12 = 0.005, P = 360000*0.005 / (1 - 1.005^-360)
    //   = 1800 / 0.83395811 = 2158.38.
    expect(calculatePrincipalAndInterest(360000, 6, 30)).toBeCloseTo(2158.38, 2);
  });

  it('zero rate divides the loan evenly across the term', () => {
    // 160000 over 30 years (360 months) at 0% = 444.444... per month.
    expect(calculatePrincipalAndInterest(160000, 0, 30)).toBeCloseTo(444.4444, 3);
  });
});

describe('calculateUSMortgage', () => {
  it('20 percent down at 0 percent rate: no PMI, P&I plus tax and insurance', () => {
    // Home 200000, down 40000 (exactly 20%), loan 160000, 0% over 30 years.
    // P&I = 160000/360 = 444.4444.
    // Property tax 1.1%/yr on 200000 = 2200/yr = 183.3333/mo.
    // Insurance 1500/yr = 125/mo. HOA 0. Down is 20%, so PMI = 0.
    // Total = 444.4444 + 183.3333 + 125 = 752.7778. LTV = 80.
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
    // Home 400000, down 40000 (10%), loan 360000, 6% over 30 years.
    // P&I = 2158.38 (from the amortisation formula above).
    // Property tax 1.1%/yr on 400000 = 4400/yr = 366.6667/mo.
    // Insurance 1500/yr = 125/mo.
    // Down 10% < 20%, so PMI = 360000 * 0.5%/yr / 12 = 1800/12 = 150/mo.
    // Total = 2158.38 + 366.6667 + 125 + 150 = 2800.05. LTV = 90.
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
    // Same 10% down loan as above but with 250/mo HOA added.
    // Total = 2800.0486 + 250 = 3050.0486.
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
    // Insurance is a flat annual figure independent of price.
    expect(r.totalMonthly).toBe(125);
  });

  it('non-finite inputs are treated as zero and yield finite outputs', () => {
    // A cleared field can parse to NaN; an extreme value can overflow to Infinity.
    // Every such input should behave as 0, leaving all outputs finite.
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
    // Defaults are 400k home, 80k down (20%), so no PMI by default.
    expect(d.homePrice).toBeGreaterThan(0);
    expect(r.pmiRequired).toBe(false);
    expect(r.totalMonthly).toBeGreaterThan(0);
  });
});
