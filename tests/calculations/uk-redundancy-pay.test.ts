import { describe, it, expect } from 'vitest';
import {
  calculateRedundancyPay,
  MAX_STATUTORY_TOTAL,
  STATUTORY_WEEKLY_PAY_CAP,
} from '../../src/components/calculators/UKRedundancyPayCalculator/calculations';

describe('calculateRedundancyPay', () => {
  it('applies the weekly cap and mixes the 1.0 and 1.5 age bands', () => {
    const result = calculateRedundancyPay({ age: 45, yearsOfService: 10, weeklyPay: 800 });

    expect(result.isEligible).toBe(true);
    expect(result.totalWeeks).toBe(12);
    expect(result.cappedWeeklyPay).toBe(STATUTORY_WEEKLY_PAY_CAP);
    expect(result.isCapApplied).toBe(true);
    expect(result.statutoryPay).toBe(9012);
    expect(result.uncappedPay).toBe(9600);
  });

  it('returns zero when service is under the 2 year minimum (edge case)', () => {
    const result = calculateRedundancyPay({ age: 30, yearsOfService: 1, weeklyPay: 500 });

    expect(result.isEligible).toBe(false);
    expect(result.statutoryPay).toBe(0);
    expect(result.totalWeeks).toBe(0);
    expect(result.countedYears).toBe(0);
  });

  it('caps service at 20 years and reaches the statutory maximum', () => {
    const result = calculateRedundancyPay({ age: 65, yearsOfService: 25, weeklyPay: 1000 });

    expect(result.countedYears).toBe(20);
    expect(result.totalWeeks).toBe(30);
    expect(result.statutoryPay).toBe(22530);
    expect(result.statutoryPay).toBe(MAX_STATUTORY_TOTAL);
  });

  it('uses the half-week band for service years under age 22', () => {
    const result = calculateRedundancyPay({ age: 23, yearsOfService: 2, weeklyPay: 300 });

    expect(result.totalWeeks).toBe(1.5);
    expect(result.isCapApplied).toBe(false);
    expect(result.statutoryPay).toBe(450);
  });

  it('treats non-finite inputs as zero (empty fields -> finite zero outputs)', () => {
    const result = calculateRedundancyPay({ age: NaN, yearsOfService: NaN, weeklyPay: NaN });

    expect(result.isEligible).toBe(false);
    expect(result.countedYears).toBe(0);
    expect(result.totalWeeks).toBe(0);
    expect(result.statutoryPay).toBe(0);
    expect(result.uncappedPay).toBe(0);
  });
});
