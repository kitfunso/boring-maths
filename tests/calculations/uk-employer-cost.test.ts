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

      expect(result.apprenticeshipLevy).toBe(5000);
      expect(result.employerNIC).toBe(599250);
      expect(result.totalEmployerCost).toBeCloseTo(4605570.9, 2);
      expect(result.hiddenCostPercentage).toBe(15.1);
    });

    it('boundary-exact: employer NIC before the allowance exactly equals EMPLOYMENT_ALLOWANCE=10500 at types.ts:57, leaving zero slack', () => {
      const result = calculateEmployerCost({
        grossSalary: 75000,
        taxRegion: 'england',
        pensionRate: 3,
        includeApprenticeshipLevy: false,
        includeEmploymentAllowance: true,
      });

      expect(result.employerNIC).toBe(0);
      expect(result.employerNICRate).toBe(0);
      expect(result.pensionContribution).toBeCloseTo(1320.9, 2);
      expect(result.totalEmployerCost).toBeCloseTo(76320.9, 2);
      expect(result.hiddenCostPercentage).toBe(1.8);
    });
  });
});
