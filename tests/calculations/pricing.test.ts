/**
 * PricingCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculatePricing } from '../../src/components/calculators/PricingCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/PricingCalculator/types';

describe('PricingCalculator', () => {
  describe('calculatePricing', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculatePricing(inputs);

      expect(result.currency).toBe('USD');
      expect(result.recommendedPrice).toBeCloseTo(58.33, 2);
      expect(result.recommendedMargin).toBeCloseTo(23.33, 2);
      expect(result.recommendedMarginPercent).toBe(40);
      expect(result.breakEvenUnits).toBe(215);
      expect(result.breakEvenRevenue).toBe(12541);
      expect(result.monthlyRevenue).toBe(5833);
      expect(result.monthlyProfit).toBe(-2667);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.productCost = 0;

      const result = calculatePricing(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.productCost = 2500;

      const result = calculatePricing(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculatePricing(inputs);
      const result2 = calculatePricing(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
