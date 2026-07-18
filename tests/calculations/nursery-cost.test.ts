/**
 * NurseryCostCalculator - Figure Pinning Tests
 *
 * These tests pin the CURRENT numeric behavior of calculateNurseryCost() as
 * of the 2025/26 rates in
 * src/components/calculators/NurseryCostCalculator/calculations.ts. They
 * exist as a safety net before the 2026/27 tax-year refresh (Task D1-D5):
 * when the constants are updated, these pins will fail and must be
 * recomputed against the new GOV.UK / Coram Family and Childcare Survey
 * figures. Until then, they lock in what the code actually returns today.
 */

import { describe, it, expect } from 'vitest';
import { calculateNurseryCost } from '../../src/components/calculators/NurseryCostCalculator/calculations';

describe('NurseryCostCalculator', () => {
  describe('calculateNurseryCost', () => {
    it('working parents, 2-year-old: pins HOURLY_RATES rest-of-uk/2-years=6.0 (calculations.ts:43) and FREE_HOURS.WORKING_30=30 (calculations.ts:54), fully covering the requested hours', () => {
      const result = calculateNurseryCost({
        region: 'rest-of-uk',
        children: [{ id: '1', age: '2-years', hoursPerWeek: 30, hasDisability: false }],
        employmentStatus: 'both-working',
        householdIncome: 50000,
        benefitStatus: 'none',
        useTaxFreeChildcare: true,
        weeksPerYear: 38,
      });

      expect(result.totalGrossAnnualCost).toBe(6840);
      expect(result.totalFreeHoursValue).toBe(6840);
      expect(result.totalNetAnnualCost).toBe(0);
      expect(result.eligibleFor15HoursWorking).toBe(true);
      expect(result.eligibleFor30Hours).toBe(true);
      expect(result.eligibleForTaxFreeChildcare).toBe(true);
      expect(result.childBreakdowns[0].hourlyRate).toBe(6);
      expect(result.childBreakdowns[0].freeHoursPerWeek).toBe(30);
      expect(result.savingsPercentage).toBe(1);
    });

    it('not-working parent, under-2 child: gets zero free hours (pins the under-2 branch of calculateFreeHours, calculations.ts:204-208, and HOURLY_RATES inner-london/under-2=9.5, calculations.ts:26)', () => {
      const result = calculateNurseryCost({
        region: 'inner-london',
        children: [{ id: '1', age: 'under-2', hoursPerWeek: 40, hasDisability: false }],
        employmentStatus: 'not-working',
        householdIncome: 20000,
        benefitStatus: 'none',
        useTaxFreeChildcare: true,
        weeksPerYear: 52,
      });

      expect(result.childBreakdowns[0].hourlyRate).toBe(9.5);
      expect(result.childBreakdowns[0].freeHoursPerWeek).toBe(0);
      expect(result.totalGrossAnnualCost).toBe(19760);
      expect(result.totalFreeHoursValue).toBe(0);
      expect(result.totalNetAnnualCost).toBe(19760);
      expect(result.eligibleFor15HoursWorking).toBe(false);
      expect(result.eligibleForTaxFreeChildcare).toBe(false);
      expect(result.weeklyNetCost).toBe(380);
    });

    it('one-working parent (not single), 3-4yo on legacy tax credits: universal 15 hours only, not the 30-hour working rate; tax credits block Tax-Free Childcare (pins FREE_HOURS.UNIVERSAL_15=15, calculations.ts:52, and the benefitStatus!==\'none\' guard in isEligibleForTaxFreeChildcare, calculations.ts:150)', () => {
      const result = calculateNurseryCost({
        region: 'south-east',
        children: [{ id: '1', age: '3-4-years', hoursPerWeek: 25, hasDisability: false }],
        employmentStatus: 'one-working',
        householdIncome: 60000,
        benefitStatus: 'tax-credits',
        useTaxFreeChildcare: true,
        weeksPerYear: 38,
      });

      expect(result.childBreakdowns[0].hourlyRate).toBe(6.5);
      expect(result.eligibleFor15HoursUniversal).toBe(true);
      expect(result.eligibleFor15HoursWorking).toBe(false);
      expect(result.childBreakdowns[0].freeHoursPerWeek).toBe(15);
      expect(result.totalGrossAnnualCost).toBe(6175);
      expect(result.totalFreeHoursValue).toBe(3705);
      expect(result.totalNetAnnualCost).toBe(2470);
      expect(result.eligibleForTaxFreeChildcare).toBe(false);
      expect(result.savingsPercentage).toBe(0.6);
    });

    it('Universal Credit, two children, low income: pins UC_CHILDCARE.COVERAGE_RATE=0.85 and MAX_TWO_PLUS=1768.94 (calculations.ts:86-90) and the 2-year-old UC branch (isEligibleFor2YearOldHours, calculations.ts:131-138)', () => {
      const result = calculateNurseryCost({
        region: 'outer-london',
        children: [
          { id: '1', age: '2-years', hoursPerWeek: 40, hasDisability: false },
          { id: '2', age: 'under-2', hoursPerWeek: 40, hasDisability: false },
        ],
        employmentStatus: 'both-working',
        householdIncome: 15000,
        benefitStatus: 'universal-credit',
        useTaxFreeChildcare: false,
        weeksPerYear: 38,
      });

      expect(result.eligibleFor15Hours2YearOld).toBe(true);
      expect(result.eligibleForUCChildcare).toBe(true);
      expect(result.childBreakdowns[0].freeHoursPerWeek).toBe(15); // 2yo: UC 15-hour branch
      expect(result.childBreakdowns[1].freeHoursPerWeek).toBe(0); // under-2: not working-eligible
      expect(result.totalGrossAnnualCost).toBe(23560);
      expect(result.totalFreeHoursValue).toBe(4275);
      // monthly cost after free hours (19285/12) * 0.85 coverage, under the
      // MAX_TWO_PLUS cap of 1768.94/month, annualised (*12)
      expect(result.ucChildcareElement).toBeCloseTo(16392.25, 2);
      expect(result.totalNetAnnualCost).toBeCloseTo(2892.75, 2);
    });

    it('boundary-exact: income per parent exactly at the £100,000 cap (FREE_HOURS.MAX_INCOME_PER_PARENT, calculations.ts:58, and TAX_FREE_CHILDCARE.MAX_INCOME, calculations.ts:78) excludes both working-hours and Tax-Free Childcare eligibility, since both checks use a strict "<" comparison', () => {
      const result = calculateNurseryCost({
        region: 'rest-of-uk',
        children: [{ id: '1', age: '3-4-years', hoursPerWeek: 20, hasDisability: false }],
        employmentStatus: 'both-working',
        householdIncome: 200000, // 100,000 per parent exactly
        benefitStatus: 'none',
        useTaxFreeChildcare: true,
        weeksPerYear: 38,
      });

      expect(result.eligibleFor15HoursWorking).toBe(false);
      expect(result.eligibleFor15HoursUniversal).toBe(true);
      expect(result.eligibleForTaxFreeChildcare).toBe(false);
      expect(result.childBreakdowns[0].hourlyRate).toBe(5.5);
      expect(result.childBreakdowns[0].freeHoursPerWeek).toBe(15);
      expect(result.totalGrossAnnualCost).toBe(4180);
      expect(result.totalNetAnnualCost).toBe(1045);
      expect(result.savingsPercentage).toBe(0.75);
    });
  });
});
