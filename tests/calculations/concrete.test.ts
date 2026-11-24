import { describe, it, expect } from 'vitest';
import calculateConcreteCalculator from '../../src/components/calculators/ConcreteCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/ConcreteCalculator/types';

describe('ConcreteCalculator', () => {
  describe('calculateConcreteCalculator', () => {
    it('matches the spec worked example: 4x3x0.1m slab +10% = 1.32 m3 = 120 bags', () => {
      const inputs = getDefaultInputs('GBP');
      const result = calculateConcreteCalculator(inputs);

      expect(result.volumeM3).toBe(1.2);
      expect(result.volumeWithWasteM3).toBe(1.32);
      expect(result.bags).toBe(120);
      expect(result.cubicYards).toBe(1.73);
      expect(result.isInvalid).toBe(false);
    });

    it('computes cost as bags * bagPrice', () => {
      const inputs = { ...getDefaultInputs('GBP'), bagPrice: 5 };
      const result = calculateConcreteCalculator(inputs);

      expect(result.bags).toBe(120);
      expect(result.cost).toBe(600);
    });

    it('converts feet to metres before computing volume', () => {
      const inputs = {
        ...getDefaultInputs('GBP'),
        unit: 'ft' as const,
        length: 10,
        width: 10,
        depth: 0.5,
        wastePct: 0,
      };
      const result = calculateConcreteCalculator(inputs);

      expect(result.volumeM3).toBeCloseTo(1.416, 2);
      expect(result.volumeWithWasteM3).toBeCloseTo(1.416, 2);
    });

    it('uses pi*r^2*h for a column (width = diameter, depth = height)', () => {
      const inputs = {
        ...getDefaultInputs('GBP'),
        shape: 'column' as const,
        width: 0.5,
        depth: 2,
        wastePct: 0,
      };
      const result = calculateConcreteCalculator(inputs);

      expect(result.volumeM3).toBeCloseTo(0.393, 2);
      expect(result.isInvalid).toBe(false);
    });

    it('flags degenerate input (a dimension of zero) without producing NaN', () => {
      const inputs = { ...getDefaultInputs('GBP'), width: 0 };
      const result = calculateConcreteCalculator(inputs);

      expect(result.isInvalid).toBe(true);
      expect(result.bags).toBe(0);
      expect(result.volumeM3).toBe(0);
      expect(Number.isNaN(result.cost)).toBe(false);
      expect(Number.isNaN(result.cubicYards)).toBe(false);
    });

    it('stays NaN-safe when an input is NaN', () => {
      const inputs = { ...getDefaultInputs('GBP'), depth: NaN };
      const result = calculateConcreteCalculator(inputs);

      expect(result.isInvalid).toBe(true);
      expect(result.bags).toBe(0);
      expect(Number.isFinite(result.volumeM3)).toBe(true);
    });

    it('flags a cleared/zero bag yield as invalid for a real pour (not 0 bags)', () => {
      const inputs = { ...getDefaultInputs('GBP'), bagYield: 0 };
      const result = calculateConcreteCalculator(inputs);

      expect(result.isInvalid).toBe(true);
      expect(result.bags).toBe(0);
    });
  });
});
