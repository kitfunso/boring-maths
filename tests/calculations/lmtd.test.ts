/**
 * LmtdCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateLMTD } from '../../src/components/calculators/LMTDCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/LMTDCalculator/types';

describe('LmtdCalculator', () => {
  describe('calculateLMTD', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateLMTD(inputs);

      expect(result.lmtd).toBeCloseTo(69.52, 2);
      expect(result.correctedLMTD).toBeCloseTo(69.52, 2);
      expect(result.correctionFactor).toBe(1);
      expect(result.deltaT1).toBe(80);
      expect(result.deltaT2).toBe(60);
      expect(result.effectiveness).toBeCloseTo(0.5, 1);
      expect(result.heatCapacityRatio).toBeCloseTo(1.5, 1);
      expect(result.ntu).toBeCloseTo(0.69, 2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.hotInlet = 0;

      const result = calculateLMTD(inputs);

      expect(result).toBeDefined();
      expect(typeof result.lmtd).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.hotInlet = 15000;

      const result = calculateLMTD(inputs);

      expect(result).toBeDefined();
      expect(typeof result.lmtd).toBe('number');
      expect(isFinite(result.lmtd)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateLMTD(inputs);
      const result2 = calculateLMTD(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
