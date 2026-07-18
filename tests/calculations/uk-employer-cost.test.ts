/**
 * UKEmployerCostCalculator - Figure Pinning Tests
 *
 * These tests pin the CURRENT numeric behavior of calculateEmployerCost() as
 * of the 2025/26 tax-year constants in
 * src/components/calculators/UKEmployerCostCalculator/types.ts. They exist as
 * a safety net before the 2026/27 tax-year refresh (Task D1-D5): when the
 * constants are updated, these pins will fail and must be recomputed against
 * the new GOV.UK figures. Until then, they lock in what the code actually
 * returns today.
 */

import { describe, it, expect } from 'vitest';
import { calculateEmployerCost } from '../../src/components/calculators/UKEmployerCostCalculator/calculations';

describe('UKEmployerCostCalculator', () => {
  describe('calculateEmployerCost', () => {
    it('below employer NIC threshold and below auto-enrolment lower limit: pins EMPLOYER_NIC_2025.threshold=5000 at types.ts:53 and AUTO_ENROLMENT.lowerLimit=6240 at types.ts:61', () => {
      const result = calculateEmployerCost({
        grossSalary: 4000,
        taxRegion: 'england',
        pensionRate: 3,
        includeApprenticeshipLevy: false,
        includeEmploymentAllowance: false,
      });

      expect(result.employerNIC).toBe(0);
      expect(result.employerNICRate).toBe(0);
      expect(result.pensionContribution).toBe(0);
      expect(result.apprenticeshipLevy).toBe(0);
      expect(result.totalEmployerCost).toBe(4000);
      expect(result.hiddenCostPercentage).toBe(0);
      expect(result.monthlySalary).toBeCloseTo(333.33, 2);
    });

    it('standard salary: pins EMPLOYER_NIC_2025.rate=0.15 at types.ts:52 and AUTO_ENROLMENT.upperLimit=50270 cap at types.ts:62', () => {
      const result = calculateEmployerCost({
        grossSalary: 60000,
        taxRegion: 'england',
        pensionRate: 3,
        includeApprenticeshipLevy: false,
        includeEmploymentAllowance: false,
      });

      expect(result.employerNIC).toBe(8250);
      expect(result.employerNICRate).toBe(13.8);
      // qualifying earnings capped at upperLimit (50270) even though gross
      // salary (60000) exceeds it: (50270 - 6240) * 0.03 = 1320.9
      expect(result.pensionContribution).toBeCloseTo(1320.9, 2);
      expect(result.totalEmployerCost).toBeCloseTo(69570.9, 2);
      expect(result.hiddenCostPercentage).toBe(16);
    });

    it('with employment allowance: pins EMPLOYMENT_ALLOWANCE=10500 at types.ts:57 fully offsetting employer NIC', () => {
      const result = calculateEmployerCost({
        grossSalary: 60000,
        taxRegion: 'england',
        pensionRate: 3,
        includeApprenticeshipLevy: false,
        includeEmploymentAllowance: true,
      });

      // (60000 - 5000) * 0.15 = 8250, minus 10500 allowance, floored at 0
      expect(result.employerNIC).toBe(0);
      expect(result.employerNICRate).toBe(0);
      expect(result.pensionContribution).toBeCloseTo(1320.9, 2);
      expect(result.totalEmployerCost).toBeCloseTo(61320.9, 2);
      expect(result.hiddenCostPercentage).toBe(2.2);
    });

    it('boundary-exact: apprenticeship levy exactly zero when 0.5% of pay bill equals the £15,000 allowance (pins APPRENTICESHIP_LEVY at types.ts:68-69)', () => {
      const result = calculateEmployerCost({
        grossSalary: 3000000,
        taxRegion: 'england',
        pensionRate: 3,
        includeApprenticeshipLevy: true,
        includeEmploymentAllowance: false,
      });

      // 3,000,000 * 0.005 = 15,000 exactly, minus the 15,000 allowance = 0
      expect(result.apprenticeshipLevy).toBe(0);
      expect(result.employerNIC).toBe(449250);
      expect(result.totalEmployerCost).toBeCloseTo(3450570.9, 2);
      expect(result.hiddenCostPercentage).toBe(15);
    });

    it('apprenticeship levy above allowance: pins APPRENTICESHIP_LEVY.rate=0.005 at types.ts:68 producing a non-zero levy', () => {
      const result = calculateEmployerCost({
        grossSalary: 4000000,
        taxRegion: 'england',
        pensionRate: 3,
        includeApprenticeshipLevy: true,
        includeEmploymentAllowance: false,
      });

      // 4,000,000 * 0.005 = 20,000, minus the 15,000 allowance = 5,000
      expect(result.apprenticeshipLevy).toBe(5000);
      expect(result.employerNIC).toBe(599250);
      expect(result.totalEmployerCost).toBeCloseTo(4605570.9, 2);
      expect(result.hiddenCostPercentage).toBe(15.1);
    });
  });
});
