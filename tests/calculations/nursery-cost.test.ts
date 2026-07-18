/**
 * NurseryCostCalculator - Figure Pinning Tests
 *
 * These tests pin the numeric behavior of calculateNurseryCost() as
 * of the 2026/27 rates in
 * src/components/calculators/NurseryCostCalculator/calculations.ts. The
 * statutory figures (free-hours minimum earnings, Universal Credit childcare
 * caps) were recomputed against GOV.UK 2026/27 figures during the tax-year
 * refresh (Task D1-D5). The average hourly nursery rates are market survey
 * data (Coram Family and Childcare Survey) and are unchanged.
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

    it('Universal Credit, two children, low income: pins UC_CHILDCARE.COVERAGE_RATE=0.85 (calculations.ts:86) and the 2-year-old UC branch (isEligibleFor2YearOldHours, calculations.ts:131-138). Note: the 85%-of-cost figure here (1366.02/month) does NOT reach the MAX_TWO_PLUS=1836.16 cap (calculations.ts:90) -- see the separate cap-binding scenario below for that.', () => {
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
      // MAX_TWO_PLUS cap of 1836.16/month, annualised (*12)
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

    it('inner-london hourly rates: pins HOURLY_RATES inner-london/2-years=9.0 and inner-london/3-4-years=8.5 (calculations.ts:25-29)', () => {
      const result = calculateNurseryCost({
        region: 'inner-london',
        children: [
          { id: '1', age: '2-years', hoursPerWeek: 10, hasDisability: false },
          { id: '2', age: '3-4-years', hoursPerWeek: 10, hasDisability: false },
        ],
        employmentStatus: 'not-working',
        householdIncome: 20000,
        benefitStatus: 'none',
        useTaxFreeChildcare: false,
        weeksPerYear: 38,
      });

      expect(result.childBreakdowns[0].hourlyRate).toBe(9);
      expect(result.childBreakdowns[1].hourlyRate).toBe(8.5);
      // 3-4-year-old still gets the universal 15 hours even when not-working,
      // but hoursPerWeek (10) is below that, so freeHoursPerWeek is capped
      // at hoursPerWeek via effectiveFreeHours = min(maxFreeHours, hoursPerWeek)
      expect(result.childBreakdowns[1].freeHoursPerWeek).toBe(10);
      expect(result.totalGrossAnnualCost).toBe(6650);
      expect(result.totalNetAnnualCost).toBe(3420);
    });

    it('outer-london 3-4-years hourly rate: pins HOURLY_RATES outer-london/3-4-years=7.0 (calculations.ts:34)', () => {
      const result = calculateNurseryCost({
        region: 'outer-london',
        children: [{ id: '1', age: '3-4-years', hoursPerWeek: 20, hasDisability: false }],
        employmentStatus: 'not-working',
        householdIncome: 20000,
        benefitStatus: 'none',
        useTaxFreeChildcare: false,
        weeksPerYear: 38,
      });

      expect(result.childBreakdowns[0].hourlyRate).toBe(7);
      expect(result.totalGrossAnnualCost).toBe(5320);
      expect(result.totalFreeHoursValue).toBe(3990);
      expect(result.totalNetAnnualCost).toBe(1330);
    });

    it('south-east hourly rates: pins HOURLY_RATES south-east/under-2=7.5 and south-east/2-years=7.0 (calculations.ts:36-39)', () => {
      const result = calculateNurseryCost({
        region: 'south-east',
        children: [
          { id: '1', age: 'under-2', hoursPerWeek: 10, hasDisability: false },
          { id: '2', age: '2-years', hoursPerWeek: 10, hasDisability: false },
        ],
        employmentStatus: 'not-working',
        householdIncome: 20000,
        benefitStatus: 'none',
        useTaxFreeChildcare: false,
        weeksPerYear: 38,
      });

      expect(result.childBreakdowns[0].hourlyRate).toBe(7.5);
      expect(result.childBreakdowns[1].hourlyRate).toBe(7);
      // not-working: neither under-2 nor 2-years gets any free hours
      expect(result.totalFreeHoursValue).toBe(0);
      expect(result.totalGrossAnnualCost).toBe(5510);
      expect(result.totalNetAnnualCost).toBe(5510);
    });

    it('rest-of-uk under-2 hourly rate: pins HOURLY_RATES rest-of-uk/under-2=6.5 (calculations.ts:41)', () => {
      const result = calculateNurseryCost({
        region: 'rest-of-uk',
        children: [{ id: '1', age: 'under-2', hoursPerWeek: 15, hasDisability: false }],
        employmentStatus: 'not-working',
        householdIncome: 20000,
        benefitStatus: 'none',
        useTaxFreeChildcare: false,
        weeksPerYear: 38,
      });

      expect(result.childBreakdowns[0].hourlyRate).toBe(6.5);
      expect(result.totalGrossAnnualCost).toBe(3705);
      expect(result.totalNetAnnualCost).toBe(3705);
    });

    it('52-week year with nonzero free hours: pins TERM_WEEKS=38 proration (calculations.ts:62), applied as min(weeksPerYear, TERM_WEEKS) / weeksPerYear', () => {
      const result = calculateNurseryCost({
        region: 'rest-of-uk',
        children: [{ id: '1', age: '3-4-years', hoursPerWeek: 20, hasDisability: false }],
        employmentStatus: 'both-working',
        householdIncome: 50000,
        benefitStatus: 'none',
        useTaxFreeChildcare: false,
        weeksPerYear: 52,
      });

      // termWeeksRatio = min(52, 38) / 52 = 38/52; effectiveFreeHours = min(30, 20) = 20.
      // NOTE: the ChildCostBreakdown.freeHoursPerWeek field returns
      // effectiveFreeHours itself (pre-proration) -- the local prorated
      // `freeHoursPerWeek` variable inside calculateChildCost is used only
      // to derive freeHoursValue/annualFreeHoursValue and is never returned
      // under that name. The TERM_WEEKS proration is only visible in
      // freeHoursValue and the paid-hours/net-cost fields below.
      expect(result.childBreakdowns[0].freeHoursPerWeek).toBe(20);
      // freeHoursValue = (20 * 38/52) * 5.5 = 80.3846...
      expect(result.childBreakdowns[0].freeHoursValue).toBeCloseTo(80.3846, 3);
      expect(result.childBreakdowns[0].paidHoursPerWeek).toBeCloseTo(5.3846, 3);
      expect(result.totalGrossAnnualCost).toBe(5720);
      expect(result.totalFreeHoursValue).toBeCloseTo(4180, 2);
      expect(result.totalNetAnnualCost).toBeCloseTo(1540, 2);
    });

    it('boundary-exact: household income per parent exactly at MIN_INCOME_PER_PARENT=10574.72 (calculations.ts:56) is eligible for working-parent hours', () => {
      const result = calculateNurseryCost({
        region: 'rest-of-uk',
        children: [{ id: '1', age: '2-years', hoursPerWeek: 20, hasDisability: false }],
        employmentStatus: 'both-working',
        householdIncome: 21149.44, // 2 * 10574.72 exactly
        benefitStatus: 'none',
        useTaxFreeChildcare: false,
        weeksPerYear: 38,
      });

      expect(result.eligibleFor15HoursWorking).toBe(true);
      expect(result.eligibleFor30Hours).toBe(true);
      expect(result.childBreakdowns[0].freeHoursPerWeek).toBe(20);
      expect(result.totalNetAnnualCost).toBe(0);
    });

    it('boundary-exact: household income per parent just below MIN_INCOME_PER_PARENT=10574.72 (calculations.ts:56) is NOT eligible', () => {
      const result = calculateNurseryCost({
        region: 'rest-of-uk',
        children: [{ id: '1', age: '2-years', hoursPerWeek: 20, hasDisability: false }],
        employmentStatus: 'both-working',
        householdIncome: 21149.42, // per parent 10574.71, just below 10574.72
        benefitStatus: 'none',
        useTaxFreeChildcare: false,
        weeksPerYear: 38,
      });

      expect(result.eligibleFor15HoursWorking).toBe(false);
      expect(result.eligibleFor30Hours).toBe(false);
      expect(result.childBreakdowns[0].freeHoursPerWeek).toBe(0);
      expect(result.totalNetAnnualCost).toBe(4560);
    });

    it('boundary-exact: household income exactly at UC_INCOME_THRESHOLD_2YO=15400 (calculations.ts:60) is eligible for the 2-year-old UC hours', () => {
      const result = calculateNurseryCost({
        region: 'rest-of-uk',
        children: [{ id: '1', age: '2-years', hoursPerWeek: 20, hasDisability: false }],
        employmentStatus: 'not-working',
        householdIncome: 15400,
        benefitStatus: 'universal-credit',
        useTaxFreeChildcare: false,
        weeksPerYear: 38,
      });

      expect(result.eligibleFor15Hours2YearOld).toBe(true);
      expect(result.childBreakdowns[0].freeHoursPerWeek).toBe(15);
      expect(result.totalNetAnnualCost).toBe(171);
    });

    it('boundary-exact: household income one pound above UC_INCOME_THRESHOLD_2YO=15400 (calculations.ts:60) is NOT eligible for the 2-year-old UC hours', () => {
      const result = calculateNurseryCost({
        region: 'rest-of-uk',
        children: [{ id: '1', age: '2-years', hoursPerWeek: 20, hasDisability: false }],
        employmentStatus: 'not-working',
        householdIncome: 15401,
        benefitStatus: 'universal-credit',
        useTaxFreeChildcare: false,
        weeksPerYear: 38,
      });

      expect(result.eligibleFor15Hours2YearOld).toBe(false);
      expect(result.childBreakdowns[0].freeHoursPerWeek).toBe(0);
      // still eligibleForUCChildcare (benefitStatus alone drives that flag,
      // it does not re-check the 2-year-old income threshold), so a UC
      // element still applies to the full, un-discounted cost
      expect(result.eligibleForUCChildcare).toBe(true);
      expect(result.ucChildcareElement).toBe(3876);
    });

    it('Tax-Free Childcare capped: pins TAX_FREE_CHILDCARE.RATE=0.2 and MAX_CONTRIBUTION=2000 (calculations.ts:70,74), non-disabled child', () => {
      const result = calculateNurseryCost({
        region: 'inner-london',
        children: [{ id: '1', age: '3-4-years', hoursPerWeek: 50, hasDisability: false }],
        employmentStatus: 'both-working',
        householdIncome: 50000,
        benefitStatus: 'none',
        useTaxFreeChildcare: true,
        weeksPerYear: 52,
      });

      // costAfterFreeHours = 12410; potential = 12410 * 0.2 = 2482, which
      // exceeds MAX_CONTRIBUTION (2000), so the contribution is capped
      expect(result.eligibleForTaxFreeChildcare).toBe(true);
      expect(result.taxFreeChildcareContribution).toBe(2000);
      expect(result.totalNetAnnualCost).toBe(10410);
    });

    it('Tax-Free Childcare capped, disabled child: pins MAX_CONTRIBUTION_DISABLED=4000 (calculations.ts:72)', () => {
      const result = calculateNurseryCost({
        region: 'inner-london',
        children: [{ id: '1', age: '3-4-years', hoursPerWeek: 80, hasDisability: true }],
        employmentStatus: 'both-working',
        householdIncome: 50000,
        benefitStatus: 'none',
        useTaxFreeChildcare: true,
        weeksPerYear: 52,
      });

      // costAfterFreeHours = 25670; potential = 25670 * 0.2 = 5134, which
      // exceeds MAX_CONTRIBUTION_DISABLED (4000), so the contribution is
      // capped at the higher disabled-child limit
      expect(result.eligibleForTaxFreeChildcare).toBe(true);
      expect(result.taxFreeChildcareContribution).toBe(4000);
      expect(result.totalNetAnnualCost).toBe(21670);
    });

    it('Universal Credit cap binds, one child: pins UC_CHILDCARE.MAX_ONE_CHILD=1071.09 (calculations.ts:88)', () => {
      const result = calculateNurseryCost({
        region: 'inner-london',
        children: [{ id: '1', age: 'under-2', hoursPerWeek: 50, hasDisability: false }],
        employmentStatus: 'not-working',
        householdIncome: 10000,
        benefitStatus: 'universal-credit',
        useTaxFreeChildcare: false,
        weeksPerYear: 52,
      });

      // monthlyAfterFreeHours = 24700/12 = 2058.33; * 0.85 = 1749.58, which
      // exceeds MAX_ONE_CHILD (1071.09), so the element is capped there
      // and annualised: 1071.09 * 12 = 12853.08
      expect(result.eligibleForUCChildcare).toBe(true);
      expect(result.ucChildcareElement).toBeCloseTo(12853.08, 2);
      expect(result.totalNetAnnualCost).toBeCloseTo(11846.92, 2);
    });

    it('Universal Credit cap binds, two-plus children: pins UC_CHILDCARE.MAX_TWO_PLUS=1836.16 (calculations.ts:90)', () => {
      const result = calculateNurseryCost({
        region: 'inner-london',
        children: [
          { id: '1', age: 'under-2', hoursPerWeek: 50, hasDisability: false },
          { id: '2', age: 'under-2', hoursPerWeek: 50, hasDisability: false },
        ],
        employmentStatus: 'not-working',
        householdIncome: 10000,
        benefitStatus: 'universal-credit',
        useTaxFreeChildcare: false,
        weeksPerYear: 52,
      });

      // monthlyAfterFreeHours = 49400/12 = 4116.67; * 0.85 = 3499.17, which
      // exceeds MAX_TWO_PLUS (1836.16), so the element is capped there
      // and annualised: 1836.16 * 12 = 22033.92
      expect(result.eligibleForUCChildcare).toBe(true);
      expect(result.ucChildcareElement).toBeCloseTo(22033.92, 2);
      expect(result.totalNetAnnualCost).toBeCloseTo(27366.08, 2);
    });
  });
});
