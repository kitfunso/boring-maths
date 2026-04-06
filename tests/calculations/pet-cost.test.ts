/**
 * PetCostCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculatePetCost } from '../../src/components/calculators/PetCost/calculations';
import { getDefaultInputs } from '../../src/components/calculators/PetCost/types';

describe('PetCostCalculator', () => {
  describe('calculatePetCost', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculatePetCost(inputs);

      expect(result.currency).toBe('USD');
      expect(result.petType).toBe('dog');
      expect(result.annualCost).toBe(2200);
      expect(result.monthlyCost).toBe(183);
      expect(result.lifetimeCost).toBe(19800);
      expect(result.expectedLifespan).toBe(12);
      expect(result.foodCost).toBe(600);
      expect(result.vetCost).toBe(500);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.age = 0;

      const result = calculatePetCost(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.groomingFrequency = 400;

      const result = calculatePetCost(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculatePetCost(inputs);
      const result2 = calculatePetCost(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
