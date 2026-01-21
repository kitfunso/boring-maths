import { describe, it, expect } from 'vitest';
import { calculateKilnCost } from '../../src/components/calculators/KilnCostCalculator/calculations';
import type { KilnCostInputs } from '../../src/components/calculators/KilnCostCalculator/types';

describe('KilnCostCalculator', () => {
  describe('calculateKilnCost', () => {
    it('should calculate with valid inputs', () => {
      const inputs: KilnCostInputs = {
        kilnType: 'electric',
        kilnSize: 7,
        kilnWattage: 11.5,
        targetCone: '04',
        firingType: 'bisque',
        firingTime: 8,
        electricityRate: 0.12,
        gasRate: 0,
        gasUnit: 'therm',
        firingSchedule: 'medium',
        loadDensity: 'medium',
      };

      const result = calculateKilnCost(inputs);

      expect(result).toBeDefined();
      expect(result.totalCost).toBeDefined();
    });

    it('should handle different firing types', () => {
      const inputsBisque: KilnCostInputs = {
        kilnType: 'electric',
        kilnSize: 7,
        kilnWattage: 11.5,
        targetCone: '04',
        firingType: 'bisque',
        firingTime: 8,
        electricityRate: 0.12,
        gasRate: 0,
        gasUnit: 'therm',
        firingSchedule: 'medium',
        loadDensity: 'medium',
      };

      const inputsGlaze: KilnCostInputs = {
        kilnType: 'electric',
        kilnSize: 7,
        kilnWattage: 11.5,
        targetCone: '6',
        firingType: 'glaze',
        firingTime: 10,
        electricityRate: 0.12,
        gasRate: 0,
        gasUnit: 'therm',
        firingSchedule: 'medium',
        loadDensity: 'medium',
      };

      const resultBisque = calculateKilnCost(inputsBisque);
      const resultGlaze = calculateKilnCost(inputsGlaze);

      expect(resultBisque).toBeDefined();
      expect(resultGlaze).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs: KilnCostInputs = {
        kilnType: 'electric',
        kilnSize: 10,
        kilnWattage: 15,
        targetCone: '10',
        firingType: 'glaze',
        firingTime: 12,
        electricityRate: 0.15,
        gasRate: 0,
        gasUnit: 'therm',
        firingSchedule: 'slow',
        loadDensity: 'heavy',
      };

      const result1 = calculateKilnCost(inputs);
      const result2 = calculateKilnCost(inputs);

      expect(result1.totalCost).toBe(result2.totalCost);
      expect(result1.energyUsed).toBe(result2.energyUsed);
    });
  });
});
