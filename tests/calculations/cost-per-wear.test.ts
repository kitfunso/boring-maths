/**
 * Cost Per Wear Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateCostPerWear } from '../../src/components/calculators/CostPerWearCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/CostPerWearCalculator/types';

describe('CostPerWearCalculator', () => {
  describe('calculateCostPerWear', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateCostPerWear(inputs);

      // $200 purchase + ($10 care * 36 months) = $560 total
      // 8 wears/month * 36 months = 288 total wears
      // $560 / 288 = $1.94/wear
      expect(result.totalWears).toBe(288);
      expect(result.totalLifetimeCost).toBe(560);
      expect(result.costPerWear).toBeCloseTo(1.94, 2);
      expect(result.annualCost).toBeCloseTo(186.67, 2);
    });

    it('should calculate alternative correctly', () => {
      const inputs = getDefaultInputs();

      const result = calculateCostPerWear(inputs);

      // Alternative: $50 / (8 * 12) = $0.52/wear
      expect(result.alternativeCostPerWear).toBeCloseTo(0.52, 2);
      // Over 36 months, need ceil(36/12) = 3 replacements = $150
      expect(result.alternativeTotalCost).toBe(150);
    });

    it('should determine which is better value', () => {
      const inputs = getDefaultInputs();

      const result = calculateCostPerWear(inputs);

      // Alternative CPW ($0.52) < Main CPW ($1.94), so main is NOT better value
      expect(result.isBetterValue).toBe(false);
    });

    it('should calculate savings vs alternative', () => {
      const inputs = getDefaultInputs();

      const result = calculateCostPerWear(inputs);

      // Alternative total ($150) - Main total ($560) = -$410
      // savingsVsAlternative = altTotal - mainTotal = 150 - 560 = -410
      expect(result.savingsVsAlternative).toBe(-410);
    });

    it('should identify investment piece as better value when it is', () => {
      const inputs = getDefaultInputs();
      // Make main item very cheap per wear: $100, 20 wears/month, 60 months, $0 care
      inputs.purchasePrice = 100;
      inputs.wearsPerMonth = 20;
      inputs.expectedLifespanMonths = 60;
      inputs.careCostPerMonth = 0;
      // Alternative: $50, 5 wears/month, 6 months
      inputs.alternativePrice = 50;
      inputs.alternativeWearsPerMonth = 5;
      inputs.alternativeLifespanMonths = 6;

      const result = calculateCostPerWear(inputs);

      // Main: $100 / (20*60) = $0.08/wear
      // Alt: $50 / (5*6) = $1.67/wear
      expect(result.costPerWear).toBeCloseTo(0.08, 2);
      expect(result.alternativeCostPerWear).toBeCloseTo(1.67, 2);
      expect(result.isBetterValue).toBe(true);
    });

    it('should handle zero wears per month gracefully', () => {
      const inputs = getDefaultInputs();
      inputs.wearsPerMonth = 0;

      const result = calculateCostPerWear(inputs);

      expect(result.costPerWear).toBe(0);
      expect(result.totalWears).toBe(0);
      expect(result).toBeDefined();
    });

    it('should handle zero lifespan gracefully', () => {
      const inputs = getDefaultInputs();
      inputs.expectedLifespanMonths = 0;

      const result = calculateCostPerWear(inputs);

      expect(result.totalWears).toBe(0);
      expect(result.annualCost).toBe(0);
      expect(result).toBeDefined();
    });

    it('should handle zero alternative lifespan', () => {
      const inputs = getDefaultInputs();
      inputs.alternativeLifespanMonths = 0;

      const result = calculateCostPerWear(inputs);

      expect(result.alternativeCostPerWear).toBe(0);
      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateCostPerWear(inputs);
      const result2 = calculateCostPerWear(inputs);

      expect(result1).toEqual(result2);
    });

    it('should calculate correct replacement cycles', () => {
      const inputs = getDefaultInputs();
      inputs.expectedLifespanMonths = 37;
      inputs.alternativeLifespanMonths = 12;

      const result = calculateCostPerWear(inputs);

      // ceil(37/12) = 4 replacements
      expect(result.alternativeTotalCost).toBe(inputs.alternativePrice * 4);
    });

    it('should return a verdict string', () => {
      const inputs = getDefaultInputs();

      const result = calculateCostPerWear(inputs);

      expect(typeof result.verdict).toBe('string');
      expect(result.verdict.length).toBeGreaterThan(0);
    });

    it('should give gold standard verdict for under $1/wear', () => {
      const inputs = getDefaultInputs();
      inputs.purchasePrice = 50;
      inputs.wearsPerMonth = 20;
      inputs.expectedLifespanMonths = 60;
      inputs.careCostPerMonth = 0;

      const result = calculateCostPerWear(inputs);

      expect(result.costPerWear).toBeLessThan(1);
      expect(result.verdict).toContain('gold standard');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.purchasePrice = 50000;
      inputs.wearsPerMonth = 30;
      inputs.expectedLifespanMonths = 120;
      inputs.careCostPerMonth = 100;

      const result = calculateCostPerWear(inputs);

      expect(result).toBeDefined();
      expect(isFinite(result.costPerWear)).toBe(true);
      expect(isFinite(result.totalLifetimeCost)).toBe(true);
    });
  });
});
