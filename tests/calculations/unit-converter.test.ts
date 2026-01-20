import { describe, it, expect } from 'vitest';
import { convert } from '../../src/components/calculators/UnitConverter/calculations';
import type { ConversionInputs } from '../../src/components/calculators/UnitConverter/types';

describe('UnitConverterCalculator', () => {
  describe('convert', () => {
    it('should convert length units', () => {
      const inputs: ConversionInputs = {
        value: 1,
        fromUnit: 'meters',
        toUnit: 'feet',
      };

      const result = convert(inputs);

      expect(result).toBeGreaterThan(3);
      expect(result).toBeLessThan(4);
    });

    it('should convert temperature units', () => {
      const inputs: ConversionInputs = {
        value: 0,
        fromUnit: 'celsius',
        toUnit: 'fahrenheit',
      };

      const result = convert(inputs);

      expect(result).toBe(32);
    });

    it('should produce consistent results', () => {
      const inputs: ConversionInputs = {
        value: 100,
        fromUnit: 'kilograms',
        toUnit: 'pounds',
      };

      const result1 = convert(inputs);
      const result2 = convert(inputs);

      expect(result1).toBe(result2);
    });
  });
});