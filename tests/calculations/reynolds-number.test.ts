/**
 * ReynoldsNumberCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateReynolds } from '../../src/components/calculators/ReynoldsNumberCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/ReynoldsNumberCalculator/types';

describe('ReynoldsNumberCalculator', () => {
  describe('calculateReynolds', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateReynolds(inputs);

      expect(result.reynoldsNumber).toBe(116854);
      expect(result.kinematicViscosity).toBeCloseTo(8.557693433385628e-7, 2);
      expect(result.frictionFactorEstimate).toBeCloseTo(0.017091345903311704, 2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.diameter = 0;

      const result = calculateReynolds(inputs);

      expect(result).toBeDefined();
      expect(typeof result.reynoldsNumber).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.diameter = 5000;

      const result = calculateReynolds(inputs);

      expect(result).toBeDefined();
      expect(typeof result.reynoldsNumber).toBe('number');
      expect(isFinite(result.reynoldsNumber)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateReynolds(inputs);
      const result2 = calculateReynolds(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
