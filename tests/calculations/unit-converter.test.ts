import { describe, it, expect } from 'vitest';
import { convert } from '../../src/components/calculators/UnitConverter/calculations';
import type { UnitConverterInputs } from '../../src/components/calculators/UnitConverter/types';

describe('UnitConverterCalculator', () => {
  describe('convert', () => {
    it('should convert length units', () => {
      const inputs: UnitConverterInputs = {
        category: 'length',
        value: 1,
        fromUnit: 'm',
        toUnit: 'ft',
      };

      const result = convert(inputs);

      expect(result.value).toBeGreaterThan(3);
      expect(result.value).toBeLessThan(4);
    });

    it('should convert temperature units', () => {
      const inputs: UnitConverterInputs = {
        category: 'temperature',
        value: 0,
        fromUnit: 'c',
        toUnit: 'f',
      };

      const result = convert(inputs);

      expect(result.value).toBe(32);
    });

    it('should produce consistent results', () => {
      const inputs: UnitConverterInputs = {
        category: 'weight',
        value: 100,
        fromUnit: 'kg',
        toUnit: 'lb',
      };

      const result1 = convert(inputs);
      const result2 = convert(inputs);

      expect(result1.value).toBe(result2.value);
    });
  });
});
