/**
 * Compound Interest Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateCompoundInterest } from '../../src/components/calculators/CompoundInterest/calculations';
import type { CompoundInterestInputs } from '../../src/components/calculators/CompoundInterest/types';

describe('CompoundInterestCalculator', () => {
  describe('calculateCompoundInterest', () => {
    it('calculates basic compound interest correctly', () => {
      const inputs: CompoundInterestInputs = {
        currency: 'USD',
        principal: 10000,
        monthlyContribution: 0,
        interestRate: 0.05, // 5%
        years: 10,
        compoundFrequency: 'annually',
      };

      const result = calculateCompoundInterest(inputs);

      // $10,000 at 5% for 10 years compounded annually
      // Expected: 10000 * (1.05)^10 = ~16,288.95
      expect(result.finalBalance).toBeGreaterThan(16000);
      expect(result.finalBalance).toBeLessThan(17000);
      expect(result.totalContributions).toBe(10000);
    });

    it('handles monthly contributions', () => {
      const inputs: CompoundInterestInputs = {
        currency: 'USD',
        principal: 0,
        monthlyContribution: 100,
        interestRate: 0.05,
        years: 1,
        compoundFrequency: 'monthly',
      };

      const result = calculateCompoundInterest(inputs);

      // $100/month for 12 months = $1,200 base
      expect(result.totalContributions).toBe(1200);
      // Should have some interest earned
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.finalBalance).toBeGreaterThan(1200);
    });

    it('calculates effective annual rate correctly', () => {
      const inputs: CompoundInterestInputs = {
        currency: 'USD',
        principal: 10000,
        monthlyContribution: 0,
        interestRate: 0.12, // 12%
        years: 1,
        compoundFrequency: 'monthly',
      };

      const result = calculateCompoundInterest(inputs);

      // 12% compounded monthly = (1 + 0.12/12)^12 - 1 = ~12.68%
      expect(result.effectiveAnnualRate).toBeGreaterThan(12);
      expect(result.effectiveAnnualRate).toBeLessThan(13);
    });

    it('generates yearly breakdown', () => {
      const inputs: CompoundInterestInputs = {
        currency: 'USD',
        principal: 1000,
        monthlyContribution: 0,
        interestRate: 0.10,
        years: 5,
        compoundFrequency: 'annually',
      };

      const result = calculateCompoundInterest(inputs);

      expect(result.yearlyBreakdown).toHaveLength(5);
      expect(result.yearlyBreakdown[0].year).toBe(1);
      expect(result.yearlyBreakdown[4].year).toBe(5);

      // Each year's balance should be greater than the previous
      for (let i = 1; i < result.yearlyBreakdown.length; i++) {
        expect(result.yearlyBreakdown[i].balance).toBeGreaterThan(
          result.yearlyBreakdown[i - 1].balance
        );
      }
    });

    it('handles different compound frequencies', () => {
      const baseInputs: Omit<CompoundInterestInputs, 'compoundFrequency'> = {
        currency: 'USD',
        principal: 10000,
        monthlyContribution: 0,
        interestRate: 0.12,
        years: 1,
      };

      const annual = calculateCompoundInterest({ ...baseInputs, compoundFrequency: 'annually' });
      const monthly = calculateCompoundInterest({ ...baseInputs, compoundFrequency: 'monthly' });
      const daily = calculateCompoundInterest({ ...baseInputs, compoundFrequency: 'daily' });

      // More frequent compounding = higher final balance
      expect(monthly.finalBalance).toBeGreaterThan(annual.finalBalance);
      // Note: Daily compounding uses 30-day months approximation
      // which can result in slightly lower returns than theoretical daily
      // Both should be greater than annual
      expect(daily.finalBalance).toBeGreaterThan(annual.finalBalance);
    });

    it('handles zero principal with contributions', () => {
      const inputs: CompoundInterestInputs = {
        currency: 'USD',
        principal: 0,
        monthlyContribution: 500,
        interestRate: 0.07,
        years: 20,
        compoundFrequency: 'monthly',
      };

      const result = calculateCompoundInterest(inputs);

      // 500/month for 20 years = $120,000 in contributions
      expect(result.totalContributions).toBe(120000);
      // With 7% interest, should be significantly more
      expect(result.finalBalance).toBeGreaterThan(200000);
    });

    it('preserves currency in result', () => {
      const inputs: CompoundInterestInputs = {
        currency: 'GBP',
        principal: 1000,
        monthlyContribution: 0,
        interestRate: 0.05,
        years: 1,
        compoundFrequency: 'annually',
      };

      const result = calculateCompoundInterest(inputs);

      expect(result.currency).toBe('GBP');
    });
  });
});
