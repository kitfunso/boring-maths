import { describe, it, expect } from 'vitest';
import {
  calculateHolidayEntitlement,
  STATUTORY_DAY_CAP,
  ACCRUAL_RATE,
} from '../../src/components/calculators/UKHolidayEntitlementCalculator/calculations';

describe('calculateHolidayEntitlement', () => {
  it('full-time 5-day week gives 28 days (5 * 5.6 = 28, cap not exceeded)', () => {
    const r = calculateHolidayEntitlement({
      method: 'days',
      daysPerWeek: 5,
      hoursWorked: 0,
      monthsWorked: 12,
    });
    expect(r.fullYearDays).toBe(28);
    expect(r.capApplied).toBe(false);
    expect(r.proRatedDays).toBe(28);
    expect(r.proRatedWeeks).toBe(5.6);
  });

  it('part-time 3-day week gives 16.8 days (3 * 5.6)', () => {
    const r = calculateHolidayEntitlement({
      method: 'days',
      daysPerWeek: 3,
      hoursWorked: 0,
      monthsWorked: 12,
    });
    expect(r.fullYearDays).toBe(16.8);
    expect(r.capApplied).toBe(false);
    expect(r.proRatedDays).toBe(16.8);
  });

  it('caps at 28 days for a 6-day week (6 * 5.6 = 33.6 -> 28)', () => {
    const r = calculateHolidayEntitlement({
      method: 'days',
      daysPerWeek: 6,
      hoursWorked: 0,
      monthsWorked: 12,
    });
    expect(r.fullYearDays).toBe(STATUTORY_DAY_CAP);
    expect(r.capApplied).toBe(true);
  });

  it('pro-rates a 5-day-week starter who worked 6 months (28 * 6/12 = 14)', () => {
    const r = calculateHolidayEntitlement({
      method: 'days',
      daysPerWeek: 5,
      hoursWorked: 0,
      monthsWorked: 6,
    });
    expect(r.fullYearDays).toBe(28);
    expect(r.proRatedDays).toBe(14);
  });

  it('irregular hours accrue at 12.07% (1000 hours -> 120.7 hours)', () => {
    const r = calculateHolidayEntitlement({
      method: 'hours',
      daysPerWeek: 0,
      hoursWorked: 1000,
      monthsWorked: 12,
    });
    expect(ACCRUAL_RATE).toBe(0.1207);
    expect(r.accruedHours).toBe(120.7);
  });

  it('zero days worked returns zero entitlement (edge case)', () => {
    const r = calculateHolidayEntitlement({
      method: 'days',
      daysPerWeek: 0,
      hoursWorked: 0,
      monthsWorked: 12,
    });
    expect(r.fullYearDays).toBe(0);
    expect(r.proRatedDays).toBe(0);
    expect(r.proRatedWeeks).toBe(0);
  });
});
