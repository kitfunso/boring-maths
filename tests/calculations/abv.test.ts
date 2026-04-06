/**
 * AbvCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateABV } from '../../src/components/calculators/ABVCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/ABVCalculator/types';

describe('AbvCalculator', () => {
  describe('calculateABV', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateABV(inputs);

      expect(result.abv).toBeCloseTo(5.25, 2);
      expect(result.abw).toBeCloseTo(4.17, 2);
      expect(result.apparentAttenuation).toBe(80);
      expect(result.realAttenuation).toBe(65);
      expect(result.calories).toBeCloseTo(46.15, 2);
      expect(result.caloriesPerServing).toBe(554);
      expect(result.residualSugar).toBe(10);
      expect(result.originalPlato).toBeCloseTo(12.4, 1);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.originalGravity = 0;

      const result = calculateABV(inputs);

      expect(result).toBeDefined();
      expect(typeof result.abv).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.originalGravity = 105;

      const result = calculateABV(inputs);

      expect(result).toBeDefined();
      expect(typeof result.abv).toBe('number');
      expect(isFinite(result.abv)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateABV(inputs);
      const result2 = calculateABV(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
