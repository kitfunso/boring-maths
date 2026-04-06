/**
 * FenceCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateFence } from '../../src/components/calculators/FenceCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/FenceCalculator/types';

describe('FenceCalculator', () => {
  describe('calculateFence', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateFence(inputs);

      expect(result.currency).toBe('USD');
      expect(result.panelsNeeded).toBe(12);
      expect(result.postsNeeded).toBe(19);
      expect(result.concreteBags).toBe(38);
      expect(result.postCaps).toBe(19);
      expect(result.railsNeeded).toBe(24);
      expect(result.hardwareKits).toBe(6);
      expect(result.walkGateCount).toBe(1);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.totalLength = 0;

      const result = calculateFence(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.totalLength = 10000;

      const result = calculateFence(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateFence(inputs);
      const result2 = calculateFence(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
