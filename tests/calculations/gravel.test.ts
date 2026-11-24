import { describe, it, expect } from 'vitest';
import calculateGravelCalculator from '../../src/components/calculators/GravelCalculator/calculations';
import {
  getDefaultInputs,
  type GravelCalculatorInputs,
} from '../../src/components/calculators/GravelCalculator/types';

function makeInputs(overrides: Partial<GravelCalculatorInputs> = {}): GravelCalculatorInputs {
  return { ...getDefaultInputs('GBP'), ...overrides };
}

describe('calculateGravelCalculator', () => {
  it('computes volume and tonnes for a 5x3x0.05m bed (spec spot-check)', () => {
    const result = calculateGravelCalculator(
      makeInputs({
        length: 5,
        width: 3,
        depth: 0.05,
        unit: 'm',
        density: 1.5,
        wastePct: 0,
        pricePerTonne: 0,
      })
    );
    expect(result.isInvalid).toBe(false);
    expect(result.volumeM3).toBe(0.75);
    expect(result.tonnes).toBe(1.13);
    expect(result.bulkBags).toBe(2);
  });

  it('applies the waste allowance to the tonnage', () => {
    const result = calculateGravelCalculator(
      makeInputs({
        length: 5,
        width: 3,
        depth: 0.05,
        unit: 'm',
        density: 1.5,
        wastePct: 10,
        pricePerTonne: 40,
      })
    );
    expect(result.tonnes).toBe(1.24);
    expect(result.cost).toBe(49.5);
    expect(result.bulkBags).toBe(2);
  });

  it('converts feet dimensions to metres (unit conversion edge case)', () => {
    const result = calculateGravelCalculator(
      makeInputs({
        length: 10,
        width: 10,
        depth: 0.5,
        unit: 'ft',
        density: 1.6,
        wastePct: 0,
        pricePerTonne: 0,
      })
    );
    expect(result.volumeM3).toBeCloseTo(1.416, 2);
    expect(result.tonnes).toBeCloseTo(2.27, 2);
  });

  it('returns a guarded zero result for degenerate / NaN inputs', () => {
    const zero = calculateGravelCalculator(
      makeInputs({ length: 0, width: 3, depth: 0.05 })
    );
    expect(zero.isInvalid).toBe(true);
    expect(zero.tonnes).toBe(0);
    expect(zero.bulkBags).toBe(0);
    expect(zero.cost).toBe(0);

    const nan = calculateGravelCalculator(
      makeInputs({ length: NaN, width: NaN, depth: NaN })
    );
    expect(nan.isInvalid).toBe(true);
    expect(Number.isNaN(nan.tonnes)).toBe(false);
    expect(nan.tonnes).toBe(0);
  });
});
