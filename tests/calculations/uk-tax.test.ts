/**
 * UKTaxCalculator - Figure Pinning Tests
 *
 * These tests pin the CURRENT numeric behavior of calculateUKTax() as of the
 * 2025/26 tax-year constants in src/components/calculators/UKTaxCalculator/types.ts.
 * They exist as a safety net before the 2026/27 tax-year refresh (Task D1-D5):
 * when the constants are updated, these pins will fail and must be recomputed
 * against the new GOV.UK figures. Until then, they lock in what the code
 * actually returns today (not what the law says it should return).
 */

import { describe, it, expect } from 'vitest';
import { calculateUKTax } from '../../src/components/calculators/UKTaxCalculator/calculations';

describe('UKTaxCalculator', () => {
  describe('calculateUKTax', () => {
    it('below personal allowance: no tax, no NIC (pins PERSONAL_ALLOWANCE=12570 at types.ts:65, EMPLOYEE_NIC.primaryThreshold=12570 at types.ts:94)', () => {
      const result = calculateUKTax({
        grossSalary: 10000,
        taxRegion: 'england',
        payFrequency: 'annual',
        studentLoanPlan: 'none',
        pensionRate: 0,
        pensionType: 'relief_at_source',
        blindPersonsAllowance: false,
        taxCodeOverride: '1257L',
      });

      expect(result.personalAllowance).toBe(12570);
      expect(result.taxableIncome).toBe(0);
      expect(result.incomeTax).toBe(0);
      expect(result.nationalInsurance).toBe(0);
      expect(result.takeHomePay).toBe(10000);
      expect(result.effectiveTaxRate).toBe(0);
      expect(result.marginalRate).toBe(0);
      expect(result.taxBands).toEqual([]);
      expect(result.monthly).toBeCloseTo(833.33, 2);
      expect(result.weekly).toBeCloseTo(192.31, 2);
      expect(result.daily).toBeCloseTo(27.4, 2);
    });

    it('basic rate with relief-at-source pension: pins Basic Rate band 20% at types.ts:76 and EMPLOYEE_NIC.mainRate=0.08 at types.ts:96', () => {
      const result = calculateUKTax({
        grossSalary: 35000,
        taxRegion: 'england',
        payFrequency: 'annual',
        studentLoanPlan: 'none',
        pensionRate: 5,
        pensionType: 'relief_at_source',
        blindPersonsAllowance: false,
        taxCodeOverride: '1257L',
      });

      expect(result.personalAllowance).toBe(12570);
      expect(result.taxableIncome).toBe(22430);
      expect(result.incomeTax).toBe(4486);
      expect(result.nationalInsurance).toBeCloseTo(1794.4, 2);
      expect(result.pensionContribution).toBe(1750);
      expect(result.totalDeductions).toBeCloseTo(8030.4, 2);
      expect(result.takeHomePay).toBeCloseTo(26969.6, 2);
      expect(result.effectiveTaxRate).toBe(22.9);
      expect(result.marginalRate).toBe(28);
      expect(result.taxBands).toEqual([
        { band: 'Basic Rate', rate: 20, from: 12571, to: 50270, taxableAmount: 22430, tax: 4486 },
      ]);
    });

    it('higher rate crossing into NIC upper rate: pins Higher Rate band 40% at types.ts:77, EMPLOYEE_NIC.upperEarningsLimit=50270 at types.ts:95 and upperRate=0.02 at types.ts:97', () => {
      const result = calculateUKTax({
        grossSalary: 60000,
        taxRegion: 'england',
        payFrequency: 'annual',
        studentLoanPlan: 'none',
        pensionRate: 0,
        pensionType: 'relief_at_source',
        blindPersonsAllowance: false,
        taxCodeOverride: '1257L',
      });

      expect(result.taxableIncome).toBe(47430);
      expect(result.incomeTax).toBe(11432);
      expect(result.nationalInsurance).toBeCloseTo(3210.6, 2);
      expect(result.takeHomePay).toBeCloseTo(45357.4, 2);
      expect(result.effectiveTaxRate).toBe(24.4);
      expect(result.marginalRate).toBe(42);
      expect(result.taxBands).toEqual([
        { band: 'Basic Rate', rate: 20, from: 12571, to: 50270, taxableAmount: 37700, tax: 7540 },
        { band: 'Higher Rate', rate: 40, from: 50271, to: 125140, taxableAmount: 9730, tax: 3892 },
      ]);
    });

    it('boundary-exact: gross salary exactly at PA_TAPER_THRESHOLD (types.ts:66) leaves personal allowance untapered', () => {
      const result = calculateUKTax({
        grossSalary: 100000,
        taxRegion: 'england',
        payFrequency: 'annual',
        studentLoanPlan: 'none',
        pensionRate: 0,
        pensionType: 'relief_at_source',
        blindPersonsAllowance: false,
        taxCodeOverride: '1257L',
      });

      // calculatePersonalAllowance uses a strict `>` comparison against
      // PA_TAPER_THRESHOLD, so at exactly £100,000 no taper is applied.
      expect(result.personalAllowance).toBe(12570);
      expect(result.taxableIncome).toBe(87430);
      expect(result.incomeTax).toBe(27432);
      expect(result.nationalInsurance).toBeCloseTo(4010.6, 2);
      expect(result.takeHomePay).toBeCloseTo(68557.4, 2);
      expect(result.effectiveTaxRate).toBe(31.4);
      // calculateMarginalRate treats >= PA_TAPER_THRESHOLD as "in the taper
      // zone" (types.ts:66 reused with a >= check), so the marginal rate
      // already jumps to the 60%-equivalent band here even though the PA
      // itself has not started tapering yet.
      expect(result.marginalRate).toBe(62);
    });

    it('above the £125,140 threshold: personal allowance fully tapered to zero, Additional Rate band engaged (pins the hardcoded 125140 boundary literals in calculateMarginalRate at calculations.ts:260,268,273, NOT the PA_FULLY_LOST constant at types.ts:68 -- that constant is exported but never imported into calculations.ts, so it does not actually drive this behavior; also pins Additional Rate 45% at types.ts:78)', () => {
      const result = calculateUKTax({
        grossSalary: 130000,
        taxRegion: 'england',
        payFrequency: 'annual',
        studentLoanPlan: 'none',
        pensionRate: 0,
        pensionType: 'relief_at_source',
        blindPersonsAllowance: false,
        taxCodeOverride: '1257L',
      });

      expect(result.personalAllowance).toBe(0);
      expect(result.taxableIncome).toBe(130000);
      expect(result.incomeTax).toBe(42189);
      expect(result.nationalInsurance).toBeCloseTo(4610.6, 2);
      expect(result.takeHomePay).toBeCloseTo(83200.4, 2);
      expect(result.effectiveTaxRate).toBe(36);
      expect(result.marginalRate).toBe(47);
      expect(result.taxBands).toEqual([
        { band: 'Basic Rate', rate: 20, from: 1, to: 50270, taxableAmount: 50270, tax: 10054 },
        { band: 'Higher Rate', rate: 40, from: 50271, to: 125140, taxableAmount: 74870, tax: 29948 },
        { band: 'Additional Rate', rate: 45, from: 125141, to: 130000, taxableAmount: 4860, tax: 2187 },
      ]);
    });

    it('Scotland bands: pins SCOTLAND_TAX_BANDS Starter/Basic/Intermediate/Higher/Advanced rates at types.ts:83-89', () => {
      const result = calculateUKTax({
        grossSalary: 80000,
        taxRegion: 'scotland',
        payFrequency: 'annual',
        studentLoanPlan: 'none',
        pensionRate: 0,
        pensionType: 'relief_at_source',
        blindPersonsAllowance: false,
        taxCodeOverride: '1257L',
      });

      expect(result.taxableIncome).toBe(67430);
      expect(result.incomeTax).toBeCloseTo(21778.31, 2);
      expect(result.nationalInsurance).toBeCloseTo(3610.6, 2);
      expect(result.takeHomePay).toBeCloseTo(54611.09, 2);
      expect(result.effectiveTaxRate).toBe(31.7);
      expect(result.marginalRate).toBe(47);
      expect(result.taxBands).toEqual([
        { band: 'Starter Rate', rate: 19, from: 12571, to: 14876, taxableAmount: 2306, tax: 438.14 },
        { band: 'Basic Rate', rate: 20, from: 14877, to: 26561, taxableAmount: 11685, tax: 2337 },
        { band: 'Intermediate Rate', rate: 21, from: 26562, to: 43662, taxableAmount: 17101, tax: 3591.21 },
        { band: 'Higher Rate', rate: 42, from: 43663, to: 75000, taxableAmount: 31338, tax: 13161.96 },
        { band: 'Advanced Rate', rate: 45, from: 75001, to: 125140, taxableAmount: 5000, tax: 2250 },
      ]);
    });

    it('interior of the PA taper band: pins PA_TAPER_RATE=0.5 at types.ts:67 (personal allowance loses £1 per £2 over the threshold)', () => {
      const result = calculateUKTax({
        grossSalary: 110000,
        taxRegion: 'england',
        payFrequency: 'annual',
        studentLoanPlan: 'none',
        pensionRate: 0,
        pensionType: 'relief_at_source',
        blindPersonsAllowance: false,
        taxCodeOverride: '1257L',
      });

      // reduction = floor((110000 - 100000) * 0.5) = 5000; pa = 12570 - 5000 = 7570
      expect(result.personalAllowance).toBe(7570);
      expect(result.taxableIncome).toBe(102430);
      expect(result.incomeTax).toBe(32432);
      expect(result.nationalInsurance).toBeCloseTo(4210.6, 2);
      expect(result.takeHomePay).toBeCloseTo(73357.4, 2);
      expect(result.effectiveTaxRate).toBe(33.3);
      expect(result.marginalRate).toBe(62);
      expect(result.taxBands).toEqual([
        { band: 'Basic Rate', rate: 20, from: 7571, to: 50270, taxableAmount: 42700, tax: 8540 },
        { band: 'Higher Rate', rate: 40, from: 50271, to: 125140, taxableAmount: 59730, tax: 23892 },
      ]);
    });

    it('Scotland Top Rate band: pins SCOTLAND_TAX_BANDS Top Rate 48% from 125141 at types.ts:89', () => {
      const result = calculateUKTax({
        grossSalary: 140000,
        taxRegion: 'scotland',
        payFrequency: 'annual',
        studentLoanPlan: 'none',
        pensionRate: 0,
        pensionType: 'relief_at_source',
        blindPersonsAllowance: false,
        taxCodeOverride: '1257L',
      });

      expect(result.personalAllowance).toBe(0);
      expect(result.incomeTax).toBeCloseTo(51612.41, 2);
      expect(result.nationalInsurance).toBeCloseTo(4810.6, 2);
      expect(result.takeHomePay).toBeCloseTo(83576.99, 2);
      expect(result.marginalRate).toBe(50);
      expect(result.taxBands).toEqual([
        { band: 'Starter Rate', rate: 19, from: 1, to: 14876, taxableAmount: 14876, tax: 2826.44 },
        { band: 'Basic Rate', rate: 20, from: 14877, to: 26561, taxableAmount: 11685, tax: 2337 },
        { band: 'Intermediate Rate', rate: 21, from: 26562, to: 43662, taxableAmount: 17101, tax: 3591.21 },
        { band: 'Higher Rate', rate: 42, from: 43663, to: 75000, taxableAmount: 31338, tax: 13161.96 },
        { band: 'Advanced Rate', rate: 45, from: 75001, to: 125140, taxableAmount: 50140, tax: 22563 },
        { band: 'Top Rate', rate: 48, from: 125141, to: 140000, taxableAmount: 14860, tax: 7132.8 },
      ]);
    });

    it('blind persons allowance: pins BLIND_PERSONS_ALLOWANCE=3070 at types.ts:71, added on top of PERSONAL_ALLOWANCE', () => {
      const result = calculateUKTax({
        grossSalary: 35000,
        taxRegion: 'england',
        payFrequency: 'annual',
        studentLoanPlan: 'none',
        pensionRate: 0,
        pensionType: 'relief_at_source',
        blindPersonsAllowance: true,
        taxCodeOverride: '1257L',
      });

      // 12570 + 3070 = 15640
      expect(result.personalAllowance).toBe(15640);
      expect(result.taxableIncome).toBe(19360);
      expect(result.incomeTax).toBe(3872);
      expect(result.taxBands).toEqual([
        { band: 'Basic Rate', rate: 20, from: 15641, to: 50270, taxableAmount: 19360, tax: 3872 },
      ]);
    });

    it('student loan plan1: pins STUDENT_LOAN_THRESHOLDS.plan1 (threshold=24990, rate=0.09) at types.ts:102', () => {
      const result = calculateUKTax({
        grossSalary: 40000,
        taxRegion: 'england',
        payFrequency: 'annual',
        studentLoanPlan: 'plan1',
        pensionRate: 0,
        pensionType: 'relief_at_source',
        blindPersonsAllowance: false,
        taxCodeOverride: '1257L',
      });

      // (40000 - 24990) * 0.09 = 1350.9
      expect(result.studentLoanRepayment).toBeCloseTo(1350.9, 2);
      expect(result.postgraduateLoanRepayment).toBe(0);
      expect(result.marginalRate).toBe(37);
    });

    it('student loan plan2: pins STUDENT_LOAN_THRESHOLDS.plan2 (threshold=27295, rate=0.09) at types.ts:103', () => {
      const result = calculateUKTax({
        grossSalary: 40000,
        taxRegion: 'england',
        payFrequency: 'annual',
        studentLoanPlan: 'plan2',
        pensionRate: 0,
        pensionType: 'relief_at_source',
        blindPersonsAllowance: false,
        taxCodeOverride: '1257L',
      });

      // (40000 - 27295) * 0.09 = 1143.45
      expect(result.studentLoanRepayment).toBeCloseTo(1143.45, 2);
      expect(result.marginalRate).toBe(37);
    });

    it('student loan plan4: pins STUDENT_LOAN_THRESHOLDS.plan4 (threshold=31395, rate=0.09) at types.ts:104', () => {
      const result = calculateUKTax({
        grossSalary: 40000,
        taxRegion: 'england',
        payFrequency: 'annual',
        studentLoanPlan: 'plan4',
        pensionRate: 0,
        pensionType: 'relief_at_source',
        blindPersonsAllowance: false,
        taxCodeOverride: '1257L',
      });

      // (40000 - 31395) * 0.09 = 774.45
      expect(result.studentLoanRepayment).toBeCloseTo(774.45, 2);
      expect(result.marginalRate).toBe(37);
    });

    it('student loan plan5: pins STUDENT_LOAN_THRESHOLDS.plan5 (threshold=25000, rate=0.09) at types.ts:105', () => {
      const result = calculateUKTax({
        grossSalary: 40000,
        taxRegion: 'england',
        payFrequency: 'annual',
        studentLoanPlan: 'plan5',
        pensionRate: 0,
        pensionType: 'relief_at_source',
        blindPersonsAllowance: false,
        taxCodeOverride: '1257L',
      });

      // (40000 - 25000) * 0.09 = 1350
      expect(result.studentLoanRepayment).toBe(1350);
      expect(result.marginalRate).toBe(37);
    });

    it('postgraduate loan: pins STUDENT_LOAN_THRESHOLDS.postgraduate (threshold=21000, rate=0.06) at types.ts:106', () => {
      const result = calculateUKTax({
        grossSalary: 40000,
        taxRegion: 'england',
        payFrequency: 'annual',
        studentLoanPlan: 'postgraduate',
        pensionRate: 0,
        pensionType: 'relief_at_source',
        blindPersonsAllowance: false,
        taxCodeOverride: '1257L',
      });

      // studentLoanRepayment short-circuits to 0 for the postgraduate plan
      // (calculateStudentLoan), the actual repayment comes via
      // calculatePostgraduateLoan: (40000 - 21000) * 0.06 = 1140
      expect(result.studentLoanRepayment).toBe(0);
      expect(result.postgraduateLoanRepayment).toBe(1140);
      expect(result.marginalRate).toBe(34);
    });
  });
});
