/**
 * RaiseCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateRaise } from '../../src/components/calculators/RaiseCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/RaiseCalculator/types';

describe('RaiseCalculator', () => {
  describe('calculateRaise', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateRaise(inputs);

      expect(result.currency).toBe('USD');
      expect(result.newSalary).toBe(63000);
      expect(result.raiseAmount).toBe(3000);
      expect(result.monthlyRaise).toBe(250);
      expect(result.lifetimeValue).toBe(109378);
      expect(result.investedValue).toBe(250024);
      expect(result.hourlyEquivalent).toBeCloseTo(1.44, 2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.currentSalary = 0;

      const result = calculateRaise(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.currentSalary = 6000000;

      const result = calculateRaise(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateRaise(inputs);
      const result2 = calculateRaise(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
