/**
 * PartyDrinkCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculatePartyDrinks } from '../../src/components/calculators/PartyDrinkCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/PartyDrinkCalculator/types';

describe('PartyDrinkCalculator', () => {
  describe('calculatePartyDrinks', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculatePartyDrinks(inputs);

      expect(result.currency).toBe('USD');
      expect(result.totalServings).toBe(154);
      expect(result.drinksPerPerson).toBeCloseTo(6.2, 1);
      expect(result.totalCost).toBe(96);
      expect(result.costPerPerson).toBeCloseTo(3.84, 2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.guestCount = 0;

      const result = calculatePartyDrinks(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.guestCount = 2500;

      const result = calculatePartyDrinks(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculatePartyDrinks(inputs);
      const result2 = calculatePartyDrinks(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
