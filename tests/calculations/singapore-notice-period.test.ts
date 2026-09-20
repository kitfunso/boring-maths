/** Singapore notice period tests. Daily rate = (12 x monthly) / (52 x working days/week); MOM table by service weeks; leave 7+1/year capped at 14. */

import { describe, it, expect } from 'vitest';
import { calculateSingaporeNoticePeriod } from '../../src/components/calculators/SingaporeNoticePeriod/calculations';

describe('SingaporeNoticePeriod', () => {
  describe('calculateSingaporeNoticePeriod', () => {
    it('gives 2 weeks statutory notice for 3 years service, 5-day week', () => {
      // daily rate = (12*5000)/(52*5) = 60000/260 = 230.769231; 2 weeks = 10 days; 230.769231*10 = 2307.69
      const result = calculateSingaporeNoticePeriod({
        monthlyGrossSalary: 5000,
        serviceYears: 3,
        serviceMonths: 0,
        workingDaysPerWeek: 5,
        unusedLeaveDays: 0,
        contractualNoticeWeeks: 0,
      });
      expect(result.statutoryNoticeLabel).toBe('2 weeks');
      expect(result.appliedNoticeLabel).toBe('2 weeks');
      expect(result.dailyRate).toBeCloseTo(230.77, 2);
      expect(result.salaryInLieu).toBeCloseTo(2307.69, 2);
    });

    it('gives 4 weeks notice for 10 years service', () => {
      const result = calculateSingaporeNoticePeriod({
        monthlyGrossSalary: 5000,
        serviceYears: 10,
        serviceMonths: 0,
        workingDaysPerWeek: 5,
        unusedLeaveDays: 0,
        contractualNoticeWeeks: 0,
      });
      expect(result.statutoryNoticeLabel).toBe('4 weeks');
    });

    it('gives 1 day notice for 3 months service', () => {
      const result = calculateSingaporeNoticePeriod({
        monthlyGrossSalary: 5000,
        serviceYears: 0,
        serviceMonths: 3,
        workingDaysPerWeek: 5,
        unusedLeaveDays: 0,
        contractualNoticeWeeks: 0,
      });
      expect(result.statutoryNoticeLabel).toBe('1 day');
    });

    it('gives 1 week notice at the 26-week boundary (6 months)', () => {
      const result = calculateSingaporeNoticePeriod({
        monthlyGrossSalary: 5000,
        serviceYears: 0,
        serviceMonths: 6,
        workingDaysPerWeek: 5,
        unusedLeaveDays: 0,
        contractualNoticeWeeks: 0,
      });
      expect(result.serviceWeeks).toBe(26);
      expect(result.statutoryNoticeLabel).toBe('1 week');
    });

    it('gives 4 weeks notice at the 5-year boundary exactly', () => {
      const result = calculateSingaporeNoticePeriod({
        monthlyGrossSalary: 5000,
        serviceYears: 5,
        serviceMonths: 0,
        workingDaysPerWeek: 5,
        unusedLeaveDays: 0,
        contractualNoticeWeeks: 0,
      });
      expect(result.serviceWeeks).toBe(260);
      expect(result.statutoryNoticeLabel).toBe('4 weeks');
    });

    it('lets a contractual override of 8 weeks beat the 2-week statutory figure', () => {
      const result = calculateSingaporeNoticePeriod({
        monthlyGrossSalary: 5000,
        serviceYears: 3,
        serviceMonths: 0,
        workingDaysPerWeek: 5,
        unusedLeaveDays: 0,
        contractualNoticeWeeks: 8,
      });
      expect(result.statutoryNoticeLabel).toBe('2 weeks');
      expect(result.appliedNoticeLabel).toBe('8 weeks');
      expect(result.isOverrideApplied).toBe(true);
      expect(result.appliedNoticeDays).toBeGreaterThan(result.statutoryNoticeDays);
    });

    it('encashes 6 unused leave days at the daily rate', () => {
      // daily rate = 230.769231; 6 * 230.769231 = 1384.615385 -> 1384.62
      const result = calculateSingaporeNoticePeriod({
        monthlyGrossSalary: 5000,
        serviceYears: 3,
        serviceMonths: 0,
        workingDaysPerWeek: 5,
        unusedLeaveDays: 6,
        contractualNoticeWeeks: 0,
      });
      expect(result.leaveEncashment).toBeCloseTo(1384.62, 2);
    });

    it('computes leave entitlement by completed year, capped at 14 from year 8', () => {
      const base = {
        monthlyGrossSalary: 5000,
        serviceMonths: 0,
        workingDaysPerWeek: 5,
        unusedLeaveDays: 0,
        contractualNoticeWeeks: 0,
      };
      expect(
        calculateSingaporeNoticePeriod({ ...base, serviceYears: 0 }).leaveEntitlementDays
      ).toBe(7); // year 1
      expect(
        calculateSingaporeNoticePeriod({ ...base, serviceYears: 4 }).leaveEntitlementDays
      ).toBe(11); // year 5
      expect(
        calculateSingaporeNoticePeriod({ ...base, serviceYears: 7 }).leaveEntitlementDays
      ).toBe(14); // year 8
      expect(
        calculateSingaporeNoticePeriod({ ...base, serviceYears: 19 }).leaveEntitlementDays
      ).toBe(14); // year 20, capped
    });
  });
});
