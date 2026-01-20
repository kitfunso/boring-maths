/**
 * 401k Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculate401k } from '../../src/components/calculators/401kCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/401kCalculator/types';
import type { Calculator401kInputs } from '../../src/components/calculators/401kCalculator/types';

describe('401kCalculator', () => {
  describe('calculate401k', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculate401k(inputs);

      expect(result).toBeDefined();
      expect(result.totalAtRetirement).toBeGreaterThan(0);
      expect(result.totalContributions).toBeGreaterThan(0);
      expect(result.employerContributions).toBeGreaterThan(0);
      expect(result.investmentGrowth).toBeGreaterThan(0);
      expect(result.yearlyBreakdown).toBeDefined();
      expect(result.yearlyBreakdown.length).toBeGreaterThan(0);
      expect(result.monthlyIncomeAt4Percent).toBeGreaterThan(0);
    });

    it('should calculate employer matching correctly', () => {
      const inputs: Calculator401kInputs = {
        currentAge: 30,
        retirementAge: 35,
        currentBalance: 0,
        annualSalary: 100000,
        contributionPercent: 10,
        employerMatchPercent: 50,
        employerMatchLimit: 6,
        annualReturn: 0,
        salaryGrowth: 0,
      };

      const result = calculate401k(inputs);

      // With 10% contribution, employer matches 50% of first 6%
      // Employee contributes: $10,000/year
      // Employer contributes: $3,000/year (50% of 6% of $100k)
      expect(result.totalContributions).toBe(50000); // 5 years * $10k
      expect(result.employerContributions).toBe(15000); // 5 years * $3k
    });

    it('should apply annual contribution limits', () => {
      const inputs: Calculator401kInputs = {
        currentAge: 30,
        retirementAge: 31,
        currentBalance: 0,
        annualSalary: 500000,
        contributionPercent: 50, // 50% of $500k = $250k
        employerMatchPercent: 0,
        employerMatchLimit: 0,
        annualReturn: 0,
        salaryGrowth: 0,
      };

      const result = calculate401k(inputs);

      // Should be capped at annual limit ($23,000 for under 50)
      expect(result.totalContributions).toBe(23000);
    });

    it('should apply catch-up contribution limit for 50+', () => {
      const inputs: Calculator401kInputs = {
        currentAge: 49,
        retirementAge: 51,
        currentBalance: 0,
        annualSalary: 500000,
        contributionPercent: 50,
        employerMatchPercent: 0,
        employerMatchLimit: 0,
        annualReturn: 0,
        salaryGrowth: 0,
      };

      const result = calculate401k(inputs);

      // First year (age 50): $23k, Second year (age 51): $30.5k
      expect(result.totalContributions).toBe(61000);
    });

    it('should compound returns correctly', () => {
      const inputs: Calculator401kInputs = {
        currentAge: 30,
        retirementAge: 31,
        currentBalance: 10000,
        annualSalary: 0,
        contributionPercent: 0,
        employerMatchPercent: 0,
        employerMatchLimit: 0,
        annualReturn: 10, // 10% annual return
        salaryGrowth: 0,
      };

      const result = calculate401k(inputs);

      // $10k with 10% annual return compounded monthly for 1 year
      // Should be approximately $11,047
      expect(result.totalAtRetirement).toBeGreaterThan(11000);
      expect(result.totalAtRetirement).toBeLessThan(11100);
    });

    it('should apply salary growth', () => {
      const inputs: Calculator401kInputs = {
        currentAge: 30,
        retirementAge: 35,
        currentBalance: 0,
        annualSalary: 100000,
        contributionPercent: 10,
        employerMatchPercent: 0,
        employerMatchLimit: 0,
        annualReturn: 0,
        salaryGrowth: 5, // 5% annual salary growth
      };

      const result = calculate401k(inputs);

      // First year: $10k, then growing by 5% each year
      // Total should be more than $50k (5 * $10k)
      expect(result.totalContributions).toBeGreaterThan(50000);
      expect(result.totalContributions).toBeLessThan(60000);
    });

    it('should generate yearly breakdown', () => {
      const inputs: Calculator401kInputs = {
        currentAge: 30,
        retirementAge: 35,
        currentBalance: 10000,
        annualSalary: 75000,
        contributionPercent: 10,
        employerMatchPercent: 50,
        employerMatchLimit: 6,
        annualReturn: 7,
        salaryGrowth: 2,
      };

      const result = calculate401k(inputs);

      expect(result.yearlyBreakdown).toHaveLength(5);
      expect(result.yearlyBreakdown[0].age).toBe(31);
      expect(result.yearlyBreakdown[4].age).toBe(35);

      // Each year's balance should increase
      for (let i = 1; i < result.yearlyBreakdown.length; i++) {
        expect(result.yearlyBreakdown[i].yearEndBalance).toBeGreaterThan(
          result.yearlyBreakdown[i - 1].yearEndBalance
        );
      }
    });

    it('should calculate monthly income at 4% withdrawal rate', () => {
      const inputs: Calculator401kInputs = {
        currentAge: 30,
        retirementAge: 31,
        currentBalance: 1200000,
        annualSalary: 0,
        contributionPercent: 0,
        employerMatchPercent: 0,
        employerMatchLimit: 0,
        annualReturn: 0,
        salaryGrowth: 0,
      };

      const result = calculate401k(inputs);

      // $1.2M * 4% / 12 = $4,000/month
      expect(result.monthlyIncomeAt4Percent).toBeCloseTo(4000, -2);
    });

    it('should handle zero contributions gracefully', () => {
      const inputs: Calculator401kInputs = {
        currentAge: 30,
        retirementAge: 35,
        currentBalance: 10000,
        annualSalary: 0,
        contributionPercent: 0,
        employerMatchPercent: 0,
        employerMatchLimit: 0,
        annualReturn: 7,
        salaryGrowth: 0,
      };

      const result = calculate401k(inputs);

      expect(result.totalContributions).toBe(0);
      expect(result.employerContributions).toBe(0);
      expect(result.totalAtRetirement).toBeGreaterThan(10000); // Growth only
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculate401k(inputs);
      const result2 = calculate401k(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
