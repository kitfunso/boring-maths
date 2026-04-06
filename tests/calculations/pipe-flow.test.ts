/**
 * PipeFlowCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculatePipeFlow } from '../../src/components/calculators/PipeFlowCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/PipeFlowCalculator/types';

describe('PipeFlowCalculator', () => {
  describe('calculatePipeFlow', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculatePipeFlow(inputs);

      expect(result.diameter).toBe(50);
      expect(result.velocity).toBe(2);
      expect(result.flowRate).toBeCloseTo(14.14, 2);
      expect(result.crossSectionalArea).toBeCloseTo(1963.9, 1);
      expect(result.hydraulicDiameter).toBe(50);
      expect(result.velocityStatus).toBe('optimal');
      expect(result.velocityWarning).toBe('Velocity is within recommended range');
      expect(result.standardPipeSize).toBe('50mm (or 50mm next size up)');
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.diameter = 0;

      const result = calculatePipeFlow(inputs);

      expect(result).toBeDefined();
      expect(typeof result.diameter).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.diameter = 5000;

      const result = calculatePipeFlow(inputs);

      expect(result).toBeDefined();
      expect(typeof result.diameter).toBe('number');
      expect(isFinite(result.diameter)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculatePipeFlow(inputs);
      const result2 = calculatePipeFlow(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
