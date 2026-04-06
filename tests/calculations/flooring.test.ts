/**
 * FlooringCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateFlooring } from '../../src/components/calculators/FlooringCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/FlooringCalculator/types';

describe('FlooringCalculator', () => {
  describe('calculateFlooring', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateFlooring(inputs);

      expect(result.currency).toBe('USD');
      expect(result.baseArea).toBe(180);
      expect(result.closetArea).toBe(12);
      expect(result.stairArea).toBe(0);
      expect(result.totalArea).toBe(192);
      expect(result.wastePercentage).toBeCloseTo(0.1, 1);
      expect(result.areaWithWaste).toBe(211);
      expect(result.boxesNeeded).toBe(10);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.roomLength = 0;

      const result = calculateFlooring(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.roomLength = 1500;

      const result = calculateFlooring(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateFlooring(inputs);
      const result2 = calculateFlooring(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
