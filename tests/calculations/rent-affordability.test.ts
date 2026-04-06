/**
 * Rent Affordability Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateRentAffordability } from '../../src/components/calculators/RentAffordabilityCalculator/calculations';
import type { RentAffordabilityInputs } from '../../src/components/calculators/RentAffordabilityCalculator/types';

function makeInputs(overrides: Partial<RentAffordabilityInputs> = {}): RentAffordabilityInputs {
  return {
    currency: 'USD',
    monthlyIncome: 5000,
    incomeType: 'gross',
    existingDebts: 0,
    savingsGoalPercent: 20,
    includeUtilities: false,
    estimatedUtilities: 200,
    ...overrides,
  };
}

describe('RentAffordabilityCalculator', () => {
  describe('30% Rule', () => {
    it('calculates 30% of gross income', () => {
      const result = calculateRentAffordability(makeInputs());
      // 5000 * 0.3 = 1500
      expect(result.maxRent30Percent.maxRent).toBe(1500);
      expect(result.maxRent30Percent.isAffordable).toBe(true);
    });

    it('subtracts utilities when included', () => {
      const result = calculateRentAffordability(
        makeInputs({ includeUtilities: true, estimatedUtilities: 200 })
      );
      // 5000 * 0.3 - 200 = 1300
      expect(result.maxRent30Percent.maxRent).toBe(1300);
    });
  });

  describe('50/30/20 Rule', () => {
    it('calculates needs budget minus debts', () => {
      // Gross 5000, net ~5000*0.72 = 3600, needs = 3600*0.5 = 1800
      const result = calculateRentAffordability(makeInputs());
      expect(result.maxRent50_30_20.maxRent).toBe(1800);
      expect(result.maxRent50_30_20.isAffordable).toBe(true);
    });

    it('subtracts debts from needs budget', () => {
      const result = calculateRentAffordability(makeInputs({ existingDebts: 500 }));
      // needs = 1800, minus debts 500 = 1300
      expect(result.maxRent50_30_20.maxRent).toBe(1300);
    });

    it('subtracts utilities from needs budget', () => {
      const result = calculateRentAffordability(
        makeInputs({ includeUtilities: true, estimatedUtilities: 300 })
      );
      // needs = 1800, minus utilities 300 = 1500
      expect(result.maxRent50_30_20.maxRent).toBe(1500);
    });

    it('floors at zero when debts exceed needs', () => {
      const result = calculateRentAffordability(makeInputs({ existingDebts: 2000 }));
      expect(result.maxRent50_30_20.maxRent).toBe(0);
      expect(result.maxRent50_30_20.isAffordable).toBe(false);
    });
  });

  describe('28/36 DTI Rule', () => {
    it('calculates housing at 28% of gross', () => {
      const result = calculateRentAffordability(makeInputs());
      // 5000 * 0.28 = 1400, min(1400, 5000*0.36 - 0) = min(1400, 1800) = 1400
      expect(result.maxRent28_36.maxRent).toBe(1400);
    });

    it('is constrained by total DTI at 36% with debts', () => {
      const result = calculateRentAffordability(makeInputs({ existingDebts: 800 }));
      // housing28 = 5000 * 0.28 = 1400
      // totalDebt36 = 5000 * 0.36 - 800 = 1800 - 800 = 1000
      // min(1400, 1000) = 1000
      expect(result.maxRent28_36.maxRent).toBe(1000);
    });
  });

  describe('Recommendation', () => {
    it('uses the most conservative rule', () => {
      const result = calculateRentAffordability(makeInputs());
      // 30%: 1500, 50/30/20: 1800, 28/36: 1400
      // min = 1400
      expect(result.recommendedMax).toBe(1400);
    });

    it('never goes below zero', () => {
      const result = calculateRentAffordability(makeInputs({ existingDebts: 5000 }));
      expect(result.recommendedMax).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Budget Breakdown', () => {
    it('splits net income 50/30/20', () => {
      const result = calculateRentAffordability(makeInputs());
      // net = 5000 * 0.72 = 3600
      expect(result.budgetBreakdown.needs).toBe(1800);
      expect(result.budgetBreakdown.wants).toBe(1080);
      expect(result.budgetBreakdown.savings).toBe(720);
    });
  });

  describe('Net income mode', () => {
    it('treats input as net income directly', () => {
      const result = calculateRentAffordability(
        makeInputs({ monthlyIncome: 3600, incomeType: 'net' })
      );
      // Net = 3600, so needs = 1800, wants = 1080, savings = 720
      expect(result.budgetBreakdown.needs).toBe(1800);
      expect(result.effectiveIncome).toBe(3600);
    });

    it('estimates gross from net for 30% and DTI rules', () => {
      const result = calculateRentAffordability(
        makeInputs({ monthlyIncome: 3600, incomeType: 'net' })
      );
      // gross = 3600 / 0.72 = 5000
      // 30% of 5000 = 1500
      expect(result.maxRent30Percent.maxRent).toBe(1500);
    });
  });

  describe('Remaining after rent', () => {
    it('calculates remaining income after rent and debts', () => {
      const result = calculateRentAffordability(makeInputs({ existingDebts: 200 }));
      // net = 3600, recommended = min(1500, 1800-200, min(1400, 1800-200))
      //   30%: 1500, 50/30/20: 1600, 28/36: min(1400, 1600) = 1400
      //   recommended = 1400
      // remaining = 3600 - 1400 - 200 = 2000
      expect(result.remainingAfterRent).toBe(2000);
    });
  });

  describe('Currency support', () => {
    it('works with GBP', () => {
      const result = calculateRentAffordability(
        makeInputs({ currency: 'GBP', monthlyIncome: 4000 })
      );
      // 4000 * 0.3 = 1200
      expect(result.maxRent30Percent.maxRent).toBe(1200);
    });

    it('works with EUR', () => {
      const result = calculateRentAffordability(
        makeInputs({ currency: 'EUR', monthlyIncome: 4000 })
      );
      // 4000 * 0.3 = 1200
      expect(result.maxRent30Percent.maxRent).toBe(1200);
    });
  });
});
