/**
 * WeddingBudgetCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateWeddingBudget } from '../../src/components/calculators/WeddingBudget/calculations';
import { getDefaultInputs } from '../../src/components/calculators/WeddingBudget/types';

describe('WeddingBudgetCalculator', () => {
  describe('calculateWeddingBudget', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateWeddingBudget(inputs);

      expect(result.currency).toBe('USD');
      expect(result.totalBudget).toBe(30000);
      expect(result.guestCount).toBe(100);
      expect(result.costPerGuest).toBe(300);
      expect(result.industryAveragePerGuest).toBe(250);
      expect(result.venueAndCatering).toBe(14849);
      expect(result.vendorServices).toBe(6721);
      expect(result.personalTouches).toBe(6930);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.totalBudget = 0;

      const result = calculateWeddingBudget(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.totalBudget = 3000000;

      const result = calculateWeddingBudget(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateWeddingBudget(inputs);
      const result2 = calculateWeddingBudget(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
