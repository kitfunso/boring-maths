/**
 * PressureDropCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculatePressureDrop } from '../../src/components/calculators/PressureDropCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/PressureDropCalculator/types';

describe('PressureDropCalculator', () => {
  describe('calculatePressureDrop', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculatePressureDrop(inputs);

      expect(result.pressureDrop).toBeCloseTo(87.189, 2);
      expect(result.headLoss).toBeCloseTo(8.906, 2);
      expect(result.frictionFactor).toBeCloseTo(0.0218, 2);
      expect(result.reynoldsNumber).toBe(99601);
      expect(result.flowRegime).toBe('Turbulent');
      expect(result.velocity).toBe(2);
      expect(result.relativeRoughness).toBeCloseTo(0.0008999999999999999, 2);
      expect(result.pressureDropPer100).toBeCloseTo(87.189, 2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.diameter = 0;

      const result = calculatePressureDrop(inputs);

      expect(result).toBeDefined();
      expect(typeof result.pressureDrop).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.diameter = 5000;

      const result = calculatePressureDrop(inputs);

      expect(result).toBeDefined();
      expect(typeof result.pressureDrop).toBe('number');
      expect(isFinite(result.pressureDrop)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculatePressureDrop(inputs);
      const result2 = calculatePressureDrop(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
