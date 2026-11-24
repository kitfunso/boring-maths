import { describe, it, expect } from 'vitest';
import calculateWallpaperCalculator from '../../src/components/calculators/WallpaperCalculator/calculations';
import {
  getDefaultInputs,
  type WallpaperCalculatorInputs,
} from '../../src/components/calculators/WallpaperCalculator/types';

const make = (overrides: Partial<WallpaperCalculatorInputs>): WallpaperCalculatorInputs => ({
  ...getDefaultInputs(),
  ...overrides,
});

describe('calculateWallpaperCalculator', () => {
  it('matches the spec worked example: 16m perimeter, 2.4m height, no repeat -> 31 drops, 4/roll, 8 rolls', () => {
    const result = calculateWallpaperCalculator(
      make({
        roomPerimeter: 16,
        wallHeight: 2.4,
        rollLength: 10.05,
        rollWidth: 0.53,
        patternRepeat: 0,
        unit: 'm',
      })
    );
    expect(result.dropsNeeded).toBe(31);
    expect(result.dropsPerRoll).toBe(4);
    expect(result.rolls).toBe(8);
    expect(result.rollsWithSpare).toBe(9);
  });

  it('derives perimeter from length + width when perimeter is 0', () => {
    const result = calculateWallpaperCalculator(
      make({
        roomPerimeter: 0,
        roomLength: 4,
        roomWidth: 4,
        wallHeight: 2.4,
        rollLength: 10.05,
        rollWidth: 0.53,
        patternRepeat: 0,
        unit: 'm',
      })
    );
    expect(result.perimeterMeters).toBe(16);
    expect(result.dropsNeeded).toBe(31);
    expect(result.rolls).toBe(8);
  });

  it('reduces usable drops per roll when a pattern repeat is added', () => {
    const result = calculateWallpaperCalculator(
      make({
        roomPerimeter: 16,
        wallHeight: 2.4,
        rollLength: 10.05,
        rollWidth: 0.53,
        patternRepeat: 0.64,
        unit: 'm',
      })
    );
    expect(result.effectiveDropLength).toBe(3.04);
    expect(result.dropsPerRoll).toBe(3);
    expect(result.rolls).toBe(11);
  });

  it('converts feet to metres before computing', () => {
    const result = calculateWallpaperCalculator(
      make({
        roomPerimeter: 52.49,
        wallHeight: 8,
        rollLength: 33,
        rollWidth: 1.74,
        patternRepeat: 0,
        unit: 'ft',
      })
    );
    expect(result.perimeterMeters).toBe(16);
    expect(result.dropsNeeded).toBe(31);
    expect(result.dropsPerRoll).toBe(4);
    expect(result.rolls).toBe(8);
  });

  it('flags rollTooShort when height + repeat exceed one roll', () => {
    const result = calculateWallpaperCalculator(
      make({
        roomPerimeter: 16,
        wallHeight: 5,
        rollLength: 10.05,
        rollWidth: 0.53,
        patternRepeat: 6,
        unit: 'm',
      })
    );
    expect(result.dropsPerRoll).toBe(0);
    expect(result.rolls).toBe(0);
    expect(result.rollTooShort).toBe(true);
    expect(result.isInvalid).toBe(false);
  });

  it('is NaN-safe and flags invalid when measurements are missing or non-finite', () => {
    const result = calculateWallpaperCalculator(
      make({
        roomPerimeter: 0,
        roomLength: 0,
        roomWidth: 0,
        wallHeight: Number.NaN,
        unit: 'm',
      })
    );
    expect(result.isInvalid).toBe(true);
    expect(Number.isFinite(result.rolls)).toBe(true);
    expect(result.rolls).toBe(0);
    expect(result.dropsNeeded).toBe(0);
  });
});
