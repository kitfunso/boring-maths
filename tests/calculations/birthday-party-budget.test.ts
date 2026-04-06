/**
 * BirthdayPartyBudgetCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateBirthdayPartyBudget } from '../../src/components/calculators/BirthdayPartyBudget/calculations';
import { getDefaultInputs } from '../../src/components/calculators/BirthdayPartyBudget/types';

describe('BirthdayPartyBudgetCalculator', () => {
  describe('calculateBirthdayPartyBudget', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateBirthdayPartyBudget(inputs);

      expect(result.currency).toBe('USD');
      expect(result.totalBudget).toBe(649);
      expect(result.costPerChild).toBe(54);
      expect(result.venueTotal).toBe(0);
      expect(result.foodTotal).toBe(244);
      expect(result.decorationsTotal).toBe(110);
      expect(result.entertainmentTotal).toBe(150);
      expect(result.goodyBagsTotal).toBe(120);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.numberOfKids = 0;

      const result = calculateBirthdayPartyBudget(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.numberOfKids = 1200;

      const result = calculateBirthdayPartyBudget(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateBirthdayPartyBudget(inputs);
      const result2 = calculateBirthdayPartyBudget(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
