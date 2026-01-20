import { describe, it, expect } from 'vitest';
import { calculateKilnCost } from '../../src/components/calculators/KilnCostCalculator/calculations';
import type { KilnCostInputs } from '../../src/components/calculators/KilnCostCalculator/types';

describe('KilnCostCalculator', () => {
  describe('calculateKilnCost', () => {
    it('should calculate with valid inputs', () => {
      const inputs: KilnCostInputs = {
        kilnSize: 7,
        firingType: 'bisque',
        electricityRate: 0.12,
        firingConeTemp: 'cone04',
        loadPercentage: 80,
      };

      const result = calculateKilnCost(inputs);

      expect(result).toBeDefined();
      expect(result.totalCost).toBeDefined();
    });

    it('should handle different firing types', () => {
      const inputsBisque: KilnCostInputs = {
        kilnSize: 7,
        firingType: 'bisque',
        electricityRate: 0.12,
        firingConeTemp: 'cone04',
        loadPercentage: 80,
      };

      const inputsGlaze: KilnCostInputs = {
        kilnSize: 7,
        firingType: 'glaze',
        electricityRate: 0.12,
        firingConeTemp: 'cone6',
        loadPercentage: 80,
      };

      const resultBisque = calculateKilnCost(inputsBisque);
      const resultGlaze = calculateKilnCost(inputsGlaze);

      expect(resultBisque).toBeDefined();
      expect(resultGlaze).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs: KilnCostInputs = {
        kilnSize: 10,
        firingType: 'glaze',
        electricityRate: 0.15,
        firingConeTemp: 'cone10',
        loadPercentage: 100,
      };

      const result1 = calculateKilnCost(inputs);
      const result2 = calculateKilnCost(inputs);

      expect(result1.totalCost).toBe(result2.totalCost);
      expect(result1.kwhUsed).toBe(result2.kwhUsed);
    });
  });
});