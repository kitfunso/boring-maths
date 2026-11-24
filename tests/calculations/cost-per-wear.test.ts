import { describe, it, expect } from 'vitest';
import { calculateCostPerWear } from '../../src/components/calculators/CostPerWearCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/CostPerWearCalculator/types';

describe('CostPerWearCalculator', () => {
  describe('calculateCostPerWear', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateCostPerWear(inputs);

      expect(result.totalWears).toBe(288);
      expect(result.totalLifetimeCost).toBe(560);
      expect(result.costPerWear).toBeCloseTo(1.94, 2);
      expect(result.annualCost).toBeCloseTo(186.67, 2);
    });

    it('should calculate alternative correctly', () => {
      const inputs = getDefaultInputs();

      const result = calculateCostPerWear(inputs);

      expect(result.alternativeCostPerWear).toBeCloseTo(0.52, 2);
      expect(result.alternativeTotalCost).toBe(150);
    });

    it('should determine which is better value', () => {
      const inputs = getDefaultInputs();

      const result = calculateCostPerWear(inputs);

      expect(result.isBetterValue).toBe(false);
    });

    it('should calculate savings vs alternative', () => {
      const inputs = getDefaultInputs();

      const result = calculateCostPerWear(inputs);

      expect(result.savingsVsAlternative).toBe(-410);
    });

    it('should identify investment piece as better value when it is', () => {
      const inputs = getDefaultInputs();
      inputs.purchasePrice = 100;
      inputs.wearsPerMonth = 20;
      inputs.expectedLifespanMonths = 60;
      inputs.careCostPerMonth = 0;
      inputs.alternativePrice = 50;
      inputs.alternativeWearsPerMonth = 5;
      inputs.alternativeLifespanMonths = 6;

      const result = calculateCostPerWear(inputs);

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
