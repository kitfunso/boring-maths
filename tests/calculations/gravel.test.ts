import { describe, it, expect } from 'vitest';
import calculateGravelCalculator from '../../src/components/calculators/GravelCalculator/calculations';
import {
  getDefaultInputs,
  type GravelCalculatorInputs,
} from '../../src/components/calculators/GravelCalculator/types';

/** Build a fully-specified input set from the defaults plus overrides. */
function makeInputs(overrides: Partial<GravelCalculatorInputs> = {}): GravelCalculatorInputs {
  return { ...getDefaultInputs('GBP'), ...overrides };
}

describe('calculateGravelCalculator', () => {
  it('computes volume and tonnes for a 5x3x0.05m bed (spec spot-check)', () => {
    // 5 * 3 * 0.05 = 0.75 m3. density 1.5 t/m3, 0% waste -> 1.125 t.
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
    expect(result.tonnes).toBe(1.13); // 1.125 rounded to 2dp
    // bulk bags: ceil(1.125 / 0.85) = ceil(1.323) = 2
    expect(result.bulkBags).toBe(2);
  });

  it('applies the waste allowance to the tonnage', () => {
    // 0.75 m3 * 1.5 * 1.10 = 1.2375 t.
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
    expect(result.tonnes).toBe(1.24); // 1.2375 rounded to 2dp
    // cost = 1.2375 * 40 = 49.5
    expect(result.cost).toBe(49.5);
    // bulk bags: ceil(1.2375 / 0.85) = ceil(1.456) = 2
    expect(result.bulkBags).toBe(2);
  });

  it('converts feet dimensions to metres (unit conversion edge case)', () => {
    // 10ft x 10ft x 0.5ft = 3.048m x 3.048m x 0.1524m = 1.41584... m3.
    // tonnes (density 1.6, 0% waste) = 1.41584 * 1.6 = 2.26535 t.
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
