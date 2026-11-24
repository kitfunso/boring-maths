import { describe, it, expect } from 'vitest';
import { calculateHouseFlip } from '../../src/components/calculators/HouseFlipCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/HouseFlipCalculator/types';

describe('HouseFlipCalculator', () => {
  describe('calculateHouseFlip', () => {
    it('should calculate with default USD inputs', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateHouseFlip(inputs);

      expect(result.totalInvestment).toBe(290600);
      expect(result.totalCosts).toBe(90600);
      expect(result.estimatedProfit).toBe(29400);
      expect(result.roi).toBeGreaterThan(0);
      expect(result.isGoodDeal).toBe(false);
    });

    it('should calculate the 70% rule correctly', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateHouseFlip(inputs);

      expect(result.seventyPercentRuleMax).toBe(174000);
    });

    it('should detect a bad deal when purchase exceeds 70% rule', () => {
      const inputs = getDefaultInputs('USD');
      inputs.purchasePrice = 250000;

      const result = calculateHouseFlip(inputs);

      expect(result.isGoodDeal).toBe(false);
    });

    it('should handle 100% cash purchase (no financing)', () => {
      const inputs = getDefaultInputs('USD');
      inputs.downPaymentPercent = 100;

      const result = calculateHouseFlip(inputs);

      expect(result.monthlyCarryCost).toBe(inputs.monthlyHoldingCosts);
      expect(result.estimatedProfit).toBeGreaterThan(0);
    });

    it('should calculate break-even ARV correctly', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateHouseFlip(inputs);

      expect(result.breakEvenARV).toBe(result.totalInvestment);
    });

    it('should show a loss when ARV is too low', () => {
      const inputs = getDefaultInputs('USD');
      inputs.afterRepairValue = 220000;

      const result = calculateHouseFlip(inputs);

      expect(result.estimatedProfit).toBeLessThan(0);
      expect(result.roi).toBeLessThan(0);
      expect(result.isGoodDeal).toBe(false);
    });

    it('should handle zero renovation budget', () => {
      const inputs = getDefaultInputs('USD');
      inputs.renovationBudget = 0;

      const result = calculateHouseFlip(inputs);

      expect(result.seventyPercentRuleMax).toBe(Math.round(inputs.afterRepairValue * 0.7));
      expect(result.totalCosts).toBeGreaterThan(0);
    });

    it('should calculate monthly carry cost', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateHouseFlip(inputs);

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
