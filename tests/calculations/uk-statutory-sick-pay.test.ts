import { describe, it, expect } from 'vitest';
import {
  calculateStatutorySickPay,
  SSP_WEEKLY_RATE,
  EARNINGS_FRACTION,
  MAX_WEEKS,
  EIGHTY_PERCENT_THRESHOLD,
} from '../../src/components/calculators/UKStatutorySickPayCalculator/calculations';

// Statutory figures pinned against GOV.UK "Statutory Sick Pay" (checked
// 2026-07-28): weekly SSP is the lower of £123.25 and 80% of normal weekly
// earnings, paid for the working days off sick, for up to 28 weeks.
describe('SSP statutory constants (GOV.UK pins)', () => {
  it('pins the flat weekly rate at £123.25', () => {
    expect(SSP_WEEKLY_RATE).toBe(123.25);
  });

  it('pins the low-earner fraction at 80%', () => {
    expect(EARNINGS_FRACTION).toBe(0.8);
  });

  it('pins the maximum duration at 28 weeks', () => {
    expect(MAX_WEEKS).toBe(28);
  });

  it('80% threshold crossover is £154.0625 of weekly earnings', () => {
    expect(EIGHTY_PERCENT_THRESHOLD).toBeCloseTo(154.0625, 4);
  });
});

describe('calculateStatutorySickPay', () => {
  it('flat rate applies for ordinary earnings: £600/wk, 5-day week, 10 sick days', () => {
    const r = calculateStatutorySickPay({
      averageWeeklyEarnings: 600,
      workingDaysPerWeek: 5,
      sickDays: 10,
    });
    expect(r.weeklyRate).toBe(123.25);
    expect(r.dailyRate).toBe(24.65);
    expect(r.totalSSP).toBe(246.5);
    expect(r.isEightyPercentApplied).toBe(false);
    expect(r.cappedAtMaxWeeks).toBe(false);
  });

  it('80% rule for low earners: £100/wk gives £80 weekly SSP', () => {
    const r = calculateStatutorySickPay({
      averageWeeklyEarnings: 100,
      workingDaysPerWeek: 5,
      sickDays: 10,
    });
    expect(r.weeklyRate).toBe(80);
    expect(r.totalSSP).toBe(160);
    expect(r.isEightyPercentApplied).toBe(true);
  });

  it('at the crossover (£154.0625) the flat rate applies, not the 80% flag', () => {
    const r = calculateStatutorySickPay({
      averageWeeklyEarnings: 154.0625,
      workingDaysPerWeek: 5,
      sickDays: 5,
    });
    expect(r.weeklyRate).toBe(123.25);
    expect(r.isEightyPercentApplied).toBe(false);
    expect(r.totalSSP).toBe(123.25);
  });

  it('pays from the first working day (single sick day = one daily rate)', () => {
    const r = calculateStatutorySickPay({
      averageWeeklyEarnings: 600,
      workingDaysPerWeek: 5,
      sickDays: 1,
    });
    expect(r.totalSSP).toBe(24.65);
  });

  it('caps at 28 weeks: 200 sick days on a 5-day week pays only 140 days', () => {
    const r = calculateStatutorySickPay({
      averageWeeklyEarnings: 600,
      workingDaysPerWeek: 5,
      sickDays: 200,
    });
    expect(r.maxDays).toBe(140);
    expect(r.countedDays).toBe(140);
    expect(r.weeksUsed).toBe(28);
    expect(r.totalSSP).toBe(3451);
    expect(r.cappedAtMaxWeeks).toBe(true);
  });

  it('part-week rounding stays exact: 3-day week, 3 sick days = one full weekly rate', () => {
    const r = calculateStatutorySickPay({
      averageWeeklyEarnings: 600,
      workingDaysPerWeek: 3,
      sickDays: 3,
    });
    expect(r.dailyRate).toBe(41.08);
    expect(r.totalSSP).toBe(123.25);
  });

  it('clamps invalid inputs: negatives and NaN produce zero pay, days clamp to 1-7', () => {
    const r = calculateStatutorySickPay({
      averageWeeklyEarnings: Number.NaN,
      workingDaysPerWeek: 12,
      sickDays: -4,
    });
    expect(r.weeklyRate).toBe(0);
    expect(r.totalSSP).toBe(0);
    expect(r.maxDays).toBe(28 * 7);
    expect(r.countedDays).toBe(0);
  });
});
