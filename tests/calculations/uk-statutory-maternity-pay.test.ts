import { describe, it, expect } from 'vitest';
import {
  calculateStatutoryMaternityPay,
  HIGHER_RATE_WEEKS,
  STANDARD_RATE_WEEKS,
  TOTAL_WEEKS,
  HIGHER_RATE_FRACTION,
  SMP_STANDARD_WEEKLY_RATE,
  MIN_AVERAGE_WEEKLY_EARNINGS,
  STANDARD_RATE_THRESHOLD,
} from '../../src/components/calculators/UKStatutoryMaternityPayCalculator/calculations';

// Statutory figures pinned against GOV.UK "Statutory Maternity Pay" (checked
// 2026-08-08): the first 6 weeks are paid at 90% of average weekly earnings
// (AWE), uncapped; the remaining 33 weeks (39 total) are paid at the lower of
// £194.32 and 90% of AWE. Eligibility needs AWE >= £129/week.
describe('SMP statutory constants (GOV.UK pins)', () => {
  it('pins the higher-rate period at 6 weeks', () => {
    expect(HIGHER_RATE_WEEKS).toBe(6);
  });

  it('pins the standard-rate period at 33 weeks', () => {
    expect(STANDARD_RATE_WEEKS).toBe(33);
  });

  it('pins the total entitlement at 39 weeks', () => {
    expect(TOTAL_WEEKS).toBe(39);
  });

  it('pins the higher-rate fraction at 90%', () => {
    expect(HIGHER_RATE_FRACTION).toBe(0.9);
  });

  it('pins the standard weekly rate at £194.32', () => {
    expect(SMP_STANDARD_WEEKLY_RATE).toBe(194.32);
  });

  it('pins the earnings eligibility threshold at £129', () => {
    expect(MIN_AVERAGE_WEEKLY_EARNINGS).toBe(129);
  });

  // Crossover: 194.32 / 0.9 = 215.9111... - above this AWE, the £194.32 cap
  // binds; below it, 90% of earnings is the lower (standard) figure.
  it('standard-rate crossover is £215.9111 of weekly earnings', () => {
    expect(STANDARD_RATE_THRESHOLD).toBeCloseTo(215.9111, 4);
  });
});

describe('calculateStatutoryMaternityPay', () => {
  it('first 6 weeks pay 90% of AWE: £600/wk gives £540/wk', () => {
    // 600 * 0.9 = 540
    const r = calculateStatutoryMaternityPay({
      averageWeeklyEarnings: 600,
      weeksOfLeaveTaken: 39,
    });
    expect(r.higherRateWeeklyAmount).toBe(540);
  });

  it('the £194.32 cap engages above the crossover: £600/wk gives £194.32/wk for weeks 7-39', () => {
    // 90% of 600 = 540, which is above 194.32, so the cap binds.
    const r = calculateStatutoryMaternityPay({
      averageWeeklyEarnings: 600,
      weeksOfLeaveTaken: 39,
    });
    expect(r.standardRateWeeklyAmount).toBe(194.32);
    expect(r.isCapApplied).toBe(true);
  });

  it('low earners get 90% of earnings for weeks 7-39, not the cap: £150/wk gives £135/wk', () => {
    // 90% of 150 = 135, which is below 194.32, so earnings-based rate applies.
    const r = calculateStatutoryMaternityPay({
      averageWeeklyEarnings: 150,
      weeksOfLeaveTaken: 39,
    });
    expect(r.higherRateWeeklyAmount).toBe(135);
    expect(r.standardRateWeeklyAmount).toBe(135);
    expect(r.isCapApplied).toBe(false);
  });

  it('eligibility threshold: £129/wk meets it, £128.99/wk does not', () => {
    const meets = calculateStatutoryMaternityPay({
      averageWeeklyEarnings: 129,
      weeksOfLeaveTaken: 39,
    });
    expect(meets.meetsEarningsThreshold).toBe(true);

    const fails = calculateStatutoryMaternityPay({
      averageWeeklyEarnings: 128.99,
      weeksOfLeaveTaken: 39,
    });
    expect(fails.meetsEarningsThreshold).toBe(false);
  });

  it('39-week total for a worked example: £600/wk over the full entitlement', () => {
    // 6 weeks at £540 + 33 weeks at £194.32 = 3240 + 6412.56 = 9652.56
    const r = calculateStatutoryMaternityPay({
      averageWeeklyEarnings: 600,
      weeksOfLeaveTaken: 39,
    });
    expect(r.higherRateWeeksPaid).toBe(6);
    expect(r.standardRateWeeksPaid).toBe(33);
    expect(r.totalWeeksPaid).toBe(39);
    expect(r.totalSMP).toBe(9652.56);
    expect(r.cappedAtMaxWeeks).toBe(false);
  });

  it('caps at 39 weeks: 45 weeks of leave taken pays only 39', () => {
    const r = calculateStatutoryMaternityPay({
      averageWeeklyEarnings: 600,
      weeksOfLeaveTaken: 45,
    });
    expect(r.totalWeeksPaid).toBe(39);
    expect(r.higherRateWeeksPaid).toBe(6);
    expect(r.standardRateWeeksPaid).toBe(33);
    expect(r.totalSMP).toBe(9652.56);
    expect(r.cappedAtMaxWeeks).toBe(true);
  });

  it('partial leave stops within the higher-rate period: 4 weeks taken pays only the 90% rate', () => {
    // 4 weeks at £540 = 2160
    const r = calculateStatutoryMaternityPay({
      averageWeeklyEarnings: 600,
      weeksOfLeaveTaken: 4,
    });
    expect(r.higherRateWeeksPaid).toBe(4);
    expect(r.standardRateWeeksPaid).toBe(0);
    expect(r.totalSMP).toBe(2160);
  });

  it('clamps invalid inputs: negatives and NaN produce zero pay and zero weeks', () => {
    const r = calculateStatutoryMaternityPay({
      averageWeeklyEarnings: Number.NaN,
      weeksOfLeaveTaken: -5,
    });
    expect(r.higherRateWeeklyAmount).toBe(0);
    expect(r.standardRateWeeklyAmount).toBe(0);
    expect(r.totalSMP).toBe(0);
    expect(r.totalWeeksPaid).toBe(0);
    expect(r.meetsEarningsThreshold).toBe(false);
  });
});
