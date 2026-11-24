import { describe, it, expect } from 'vitest';
import { calculateCPFRetirementSum } from '../../src/components/calculators/SingaporeCPFRetirementSum/calculations';

describe('SingaporeCPFRetirementSum', () => {
  describe('calculateCPFRetirementSum', () => {
    it('meets BRS exactly at 110,200 with shortfall to FRS of 110,200', () => {
      const result = calculateCPFRetirementSum({
        currentBalance: 110200,
        currentAge: 40,
        annualContribution: 0,
      });
      expect(result.meetsBRS).toBe(true);
      expect(result.meetsFRS).toBe(false);
      expect(result.shortfallToFRS).toBe(110200);
    });

    it('meets none of the sums at 50,000 and gives correct shortfalls to all three', () => {
      const result = calculateCPFRetirementSum({
        currentBalance: 50000,
        currentAge: 40,
        annualContribution: 0,
      });
      expect(result.meetsBRS).toBe(false);
      expect(result.shortfallToBRS).toBe(60200);
      expect(result.shortfallToFRS).toBe(170400);
      expect(result.shortfallToERS).toBe(390800);
    });

    it('meets all three sums at 500,000', () => {
      const result = calculateCPFRetirementSum({
        currentBalance: 500000,
        currentAge: 40,
        annualContribution: 0,
      });
      expect(result.meetsBRS).toBe(true);
      expect(result.meetsFRS).toBe(true);
      expect(result.meetsERS).toBe(true);
      expect(result.shortfallToERS).toBe(0);
    });

    it('projects age 45, balance 100000, contribution 10000/yr over 10 years at 4% to ~268085.50', () => {
      const result = calculateCPFRetirementSum({
        currentBalance: 100000,
        currentAge: 45,
        annualContribution: 10000,
      });
      expect(result.yearsToProjection).toBe(10);
      expect(result.projectedBalanceAt55).toBeCloseTo(268085.5, 1);
    });

    it('returns no projection at age 60', () => {
      const result = calculateCPFRetirementSum({
        currentBalance: 300000,
        currentAge: 60,
        annualContribution: 8000,
      });
      expect(result.projectedBalanceAt55).toBeNull();
    });
  });
});
