/**
 * GraduationPartyPlannerCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateGraduationParty } from '../../src/components/calculators/GraduationPartyPlanner/calculations';
import { getDefaultInputs } from '../../src/components/calculators/GraduationPartyPlanner/types';

describe('GraduationPartyPlannerCalculator', () => {
  describe('calculateGraduationParty', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateGraduationParty(inputs);

      expect(result.currency).toBe('USD');
      expect(result.totalFoodServings).toBe(250);
      expect(result.totalDrinkServings).toBe(255);
      expect(result.estimatedFoodCost).toBe(700);
      expect(result.estimatedDrinkCost).toBe(200);
      expect(result.estimatedSuppliesCost).toBe(100);
      expect(result.totalEstimatedCost).toBe(1000);
      expect(result.costPerGuest).toBe(20);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.guestCount = 0;

      const result = calculateGraduationParty(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.guestCount = 5000;

      const result = calculateGraduationParty(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateGraduationParty(inputs);
      const result2 = calculateGraduationParty(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
