import { describe, it, expect } from 'vitest';
import {
  calculateDebtToIncome,
  getDefaultInputs,
} from '../../src/components/calculators/DebtToIncomeCalculator/calculations';

describe('calculateDebtToIncome', () => {
  it('computes front and back ratios for the default inputs', () => {
    const result = calculateDebtToIncome(getDefaultInputs());
    expect(result.frontDTI).toBe(25);
    expect(result.backDTI).toBe(33.3);
    expect(result.totalMonthlyDebt).toBe(2000);
    expect(result.rating).toBe('ideal');
    expect(result.isWithinConventional).toBe(true);
    expect(result.isWithinQualifiedMortgage).toBe(true);
  });

  it('flags a back-end ratio above the 43% QM limit as high', () => {
    const result = calculateDebtToIncome({
      grossMonthlyIncome: 5000,
      housingPayment: 1500,
      otherMonthlyDebts: 1000,
    });
    expect(result.frontDTI).toBe(30);
    expect(result.backDTI).toBe(50);
    expect(result.rating).toBe('high');
    expect(result.isWithinConventional).toBe(false);
    expect(result.isWithinQualifiedMortgage).toBe(false);
  });

  it('treats the conventional 36% back-end boundary as ideal', () => {
    const result = calculateDebtToIncome({
      grossMonthlyIncome: 10000,
      housingPayment: 2800,
      otherMonthlyDebts: 800,
    });
    expect(result.frontDTI).toBe(28);
    expect(result.backDTI).toBe(36);
    expect(result.rating).toBe('ideal');
    expect(result.isWithinConventional).toBe(true);
  });

  it('rates a ratio between 36% and 43% as acceptable', () => {
    const result = calculateDebtToIncome({
      grossMonthlyIncome: 8000,
      housingPayment: 2000,
      otherMonthlyDebts: 1200,
    });
    expect(result.backDTI).toBe(40);
    expect(result.rating).toBe('acceptable');
    expect(result.isWithinConventional).toBe(false);
    expect(result.isWithinQualifiedMortgage).toBe(true);
  });

  it('returns zero ratios when income is zero (no divide by zero)', () => {
    const result = calculateDebtToIncome({
      grossMonthlyIncome: 0,
      housingPayment: 1500,
      otherMonthlyDebts: 500,
    });
    expect(result.frontDTI).toBe(0);
    expect(result.backDTI).toBe(0);
    expect(result.totalMonthlyDebt).toBe(2000);
    expect(result.rating).toBe('ideal');
  });

  it('floors negative inputs at zero', () => {
    const result = calculateDebtToIncome({
      grossMonthlyIncome: -100,
      housingPayment: -50,
      otherMonthlyDebts: -50,
    });
    expect(result.frontDTI).toBe(0);
    expect(result.backDTI).toBe(0);
    expect(result.totalMonthlyDebt).toBe(0);
  });

  it('returns finite zero ratios when income is NaN (cleared field)', () => {
    const result = calculateDebtToIncome({
      grossMonthlyIncome: NaN,
      housingPayment: 1500,
      otherMonthlyDebts: 500,
    });
    expect(Number.isFinite(result.frontDTI)).toBe(true);
    expect(Number.isFinite(result.backDTI)).toBe(true);
    expect(result.frontDTI).toBe(0);
    expect(result.backDTI).toBe(0);
  });
});
