/**
 * SpeedsFeedsCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateSpeedsFeeds } from '../../src/components/calculators/SpeedsFeedsCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/SpeedsFeedsCalculator/types';

describe('SpeedsFeedsCalculator', () => {
  describe('calculateSpeedsFeeds', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateSpeedsFeeds(inputs);

      expect(result.rpm).toBe(4889);
      expect(result.feedRate).toBeCloseTo(70.4, 1);
      expect(result.feedRateUnit).toBe('IPM');
      expect(result.chipLoad).toBeCloseTo(0.0048, 2);
      expect(result.surfaceSpeed).toBe(640);
      expect(result.materialRemovalRate).toBeCloseTo(3.52, 2);
      expect(result.cuttingTime).toBeCloseTo(0.85, 2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.toolDiameter = 0;

      const result = calculateSpeedsFeeds(inputs);

      expect(result).toBeDefined();
      expect(typeof result.rpm).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.toolDiameter = 50;

      const result = calculateSpeedsFeeds(inputs);

      expect(result).toBeDefined();
      expect(typeof result.rpm).toBe('number');
      expect(isFinite(result.rpm)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateSpeedsFeeds(inputs);
      const result2 = calculateSpeedsFeeds(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
