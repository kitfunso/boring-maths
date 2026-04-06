/**
 * House Flip Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateHouseFlip } from '../../src/components/calculators/HouseFlipCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/HouseFlipCalculator/types';

describe('HouseFlipCalculator', () => {
  describe('calculateHouseFlip', () => {
    it('should calculate with default USD inputs', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateHouseFlip(inputs);

      // Purchase: 200,000
      // Down payment: 40,000 (20%)
      // Loan: 160,000
      // Financing cost: 160,000 * (8/100/12) * 6 = 6,400
      // Holding costs: 1,500 * 6 = 9,000
      // Purchase closing: 200,000 * 3% = 6,000
      // Selling costs: 320,000 * 6% = 19,200
      // Total costs: 50,000 + 6,400 + 9,000 + 6,000 + 19,200 = 90,600
      // Total investment: 200,000 + 90,600 = 290,600
      // Profit: 320,000 - 290,600 = 29,400
      expect(result.totalInvestment).toBe(290600);
      expect(result.totalCosts).toBe(90600);
      expect(result.estimatedProfit).toBe(29400);
      expect(result.roi).toBeGreaterThan(0);
      // Purchase price $200k exceeds 70% rule max $174k, so not a "good deal" by that rule
      expect(result.isGoodDeal).toBe(false);
    });

    it('should calculate the 70% rule correctly', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateHouseFlip(inputs);

      // 70% rule max = ARV * 0.7 - repairs = 320,000 * 0.7 - 50,000 = 174,000
      expect(result.seventyPercentRuleMax).toBe(174000);
    });

    it('should detect a bad deal when purchase exceeds 70% rule', () => {
      const inputs = getDefaultInputs('USD');
      inputs.purchasePrice = 250000; // Way above the 174,000 max

      const result = calculateHouseFlip(inputs);

      expect(result.isGoodDeal).toBe(false);
    });

    it('should handle 100% cash purchase (no financing)', () => {
      const inputs = getDefaultInputs('USD');
      inputs.downPaymentPercent = 100;

      const result = calculateHouseFlip(inputs);

      // No financing cost when paying all cash
      // Loan = 0, so financing cost = 0
      // Monthly carry should equal holding costs only
      expect(result.monthlyCarryCost).toBe(inputs.monthlyHoldingCosts);
      expect(result.estimatedProfit).toBeGreaterThan(0);
    });

    it('should calculate break-even ARV correctly', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateHouseFlip(inputs);

      // Break-even ARV = total investment
      expect(result.breakEvenARV).toBe(result.totalInvestment);
    });

    it('should show a loss when ARV is too low', () => {
      const inputs = getDefaultInputs('USD');
      inputs.afterRepairValue = 220000; // Below total investment

      const result = calculateHouseFlip(inputs);

      expect(result.estimatedProfit).toBeLessThan(0);
      expect(result.roi).toBeLessThan(0);
      expect(result.isGoodDeal).toBe(false);
    });

    it('should handle zero renovation budget', () => {
      const inputs = getDefaultInputs('USD');
      inputs.renovationBudget = 0;

      const result = calculateHouseFlip(inputs);

      // 70% rule max should be just ARV * 0.7
      expect(result.seventyPercentRuleMax).toBe(Math.round(inputs.afterRepairValue * 0.7));
      expect(result.totalCosts).toBeGreaterThan(0); // Still has financing, holding, closing, selling
    });

    it('should calculate monthly carry cost', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateHouseFlip(inputs);

      // Monthly carry = loan interest + holding costs
      // Loan: 160,000, monthly rate: 8%/12 = 0.006667
      // Monthly interest: 160,000 * 0.006667 = 1,066.67 ~ 1067
      // Monthly carry: 1067 + 1500 = 2567
      expect(result.monthlyCarryCost).toBe(2567);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs('USD');

      const result1 = calculateHouseFlip(inputs);
      const result2 = calculateHouseFlip(inputs);

      expect(result1).toEqual(result2);
    });

    it('should handle GBP defaults', () => {
      const inputs = getDefaultInputs('GBP');
      const result = calculateHouseFlip(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalInvestment).toBe('number');
      expect(isFinite(result.totalInvestment)).toBe(true);
    });

    it('should handle EUR defaults', () => {
      const inputs = getDefaultInputs('EUR');
      const result = calculateHouseFlip(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalInvestment).toBe('number');
      expect(isFinite(result.totalInvestment)).toBe(true);
    });

    it('should calculate cash-on-cash return', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateHouseFlip(inputs);

      // Cash out of pocket = down payment + reno + purchase closing + holding
      // = 40,000 + 50,000 + 6,000 + 9,000 = 105,000
      // Cash-on-cash = profit / cash out of pocket * 100
      const expectedCashOnCash = Math.round((29400 / 105000) * 100 * 10) / 10;
      expect(result.cashOnCashReturn).toBe(expectedCashOnCash);
    });

    it('should handle edge case: zero purchase price', () => {
      const inputs = getDefaultInputs('USD');
      inputs.purchasePrice = 0;

      const result = calculateHouseFlip(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalInvestment).toBe('number');
    });
  });
});
