/**
 * VacationBudgetCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateVacationBudget } from '../../src/components/calculators/VacationBudget/calculations';
import { getDefaultInputs } from '../../src/components/calculators/VacationBudget/types';

describe('VacationBudgetCalculator', () => {
  describe('calculateVacationBudget', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateVacationBudget(inputs);

      expect(result.currency).toBe('USD');
      expect(result.totalBudget).toBe(4521);
      expect(result.perPerson).toBe(2261);
      expect(result.perDay).toBe(565);
      expect(result.perPersonPerDay).toBe(283);
      expect(result.transportationTotal).toBe(1000);
      expect(result.accommodationTotal).toBe(1050);
      expect(result.foodTotal).toBe(960);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.travelers = 0;

      const result = calculateVacationBudget(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.travelers = 200;

      const result = calculateVacationBudget(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateVacationBudget(inputs);
      const result2 = calculateVacationBudget(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
