/**
 * IdealGasLawCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateIdealGas } from '../../src/components/calculators/IdealGasLawCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/IdealGasLawCalculator/types';

describe('IdealGasLawCalculator', () => {
  describe('calculateIdealGas', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateIdealGas(inputs);

      expect(result.pressure).toBeCloseTo(101.38254910714285, 2);
      expect(result.volume).toBeCloseTo(22.4, 1);
      expect(result.moles).toBe(1);
      expect(result.temperature).toBe(0);
      expect(result.temperatureK).toBeCloseTo(273.15, 2);
      expect(result.density).toBeCloseTo(1.293, 2);
      expect(result.molarVolume).toBeCloseTo(22.4, 1);
      expect(result.compressibilityNote).toBe('Ideal gas assumption is reasonable');
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.pressure = 0;

      const result = calculateIdealGas(inputs);

      expect(result).toBeDefined();
      expect(typeof result.pressure).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.pressure = 10132.5;

      const result = calculateIdealGas(inputs);

      expect(result).toBeDefined();
      expect(typeof result.pressure).toBe('number');
      expect(isFinite(result.pressure)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateIdealGas(inputs);
      const result2 = calculateIdealGas(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
