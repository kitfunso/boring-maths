/**
 * Tradesperson Hourly Rate Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTradesHourlyRate,
  sumMonthlyOverheads,
} from '../../src/components/calculators/TradesHourlyRateCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/TradesHourlyRateCalculator/types';
import type { TradesHourlyRateInputs } from '../../src/components/calculators/TradesHourlyRateCalculator/types';

describe('TradesHourlyRateCalculator', () => {
  describe('sumMonthlyOverheads', () => {
    it('should sum all overhead items', () => {
      const overheads = {
        vanCost: 400,
        insurance: 200,
        tools: 150,
        training: 50,
        phone: 80,
        accountant: 100,
        other: 50,
      };
      expect(sumMonthlyOverheads(overheads)).toBe(1030);
    });

    it('should return 0 when all overheads are zero', () => {
      const overheads = {
        vanCost: 0,
        insurance: 0,
        tools: 0,
        training: 0,
        phone: 0,
        accountant: 0,
        other: 0,
      };
      expect(sumMonthlyOverheads(overheads)).toBe(0);
    });
  });

  describe('calculateTradesHourlyRate', () => {
    it('should calculate with default USD inputs', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateTradesHourlyRate(inputs);

      expect(result).toBeDefined();
      expect(result.requiredHourlyRate).toBeGreaterThan(0);
      expect(result.requiredDayRate).toBe(result.requiredHourlyRate * 8);
      expect(result.effectiveTakeHome).toBe(inputs.desiredAnnualIncome);
      expect(result.billableHoursPerYear).toBe(48 * 30);
    });

    it('should calculate with default GBP inputs', () => {
      const inputs = getDefaultInputs('GBP');
      const result = calculateTradesHourlyRate(inputs);

      expect(result.requiredHourlyRate).toBeGreaterThan(0);
      expect(result.effectiveTakeHome).toBe(40000);
    });

    it('should calculate with default EUR inputs', () => {
      const inputs = getDefaultInputs('EUR');
      const result = calculateTradesHourlyRate(inputs);

      expect(result.requiredHourlyRate).toBeGreaterThan(0);
      expect(result.effectiveTakeHome).toBe(45000);
    });

    it('should correctly derive rate from known values', () => {
      // Manual calculation:
      // Income: 50,000, Overheads: 0/month, Tax: 0%
      // Weeks: 50, Hours/week: 25 => 1,250 hours/year
      // Rate = 50,000 / 1,250 = 40.00/hr
      const inputs: TradesHourlyRateInputs = {
        currency: 'USD',
        desiredAnnualIncome: 50000,
        workingWeeksPerYear: 50,
        billableHoursPerWeek: 25,
        overheads: {
          vanCost: 0,
          insurance: 0,
          tools: 0,
          training: 0,
          phone: 0,
          accountant: 0,
          other: 0,
        },
        taxRate: 0,
      };

      const result = calculateTradesHourlyRate(inputs);

      expect(result.requiredHourlyRate).toBe(40);
      expect(result.requiredDayRate).toBe(320);
      expect(result.totalOverheadsMonthly).toBe(0);
      expect(result.totalOverheadsYearly).toBe(0);
      expect(result.billableHoursPerYear).toBe(1250);
    });

    it('should account for overheads in the rate', () => {
      // Income: 50,000, Overheads: 1,000/month = 12,000/year, Tax: 0%
      // Total needed: 62,000. Hours: 50 * 25 = 1,250
      // Rate = 62,000 / 1,250 = 49.60/hr
      const inputs: TradesHourlyRateInputs = {
        currency: 'USD',
        desiredAnnualIncome: 50000,
        workingWeeksPerYear: 50,
        billableHoursPerWeek: 25,
        overheads: {
          vanCost: 500,
          insurance: 200,
          tools: 100,
          training: 50,
          phone: 50,
          accountant: 50,
          other: 50,
        },
        taxRate: 0,
      };

      const result = calculateTradesHourlyRate(inputs);

      expect(result.totalOverheadsMonthly).toBe(1000);
      expect(result.totalOverheadsYearly).toBe(12000);
      expect(result.requiredHourlyRate).toBe(49.6);
      expect(result.requiredDayRate).toBe(396.8);
    });

    it('should account for tax in the rate', () => {
      // Income: 50,000, Overheads: 0, Tax: 20%
      // Pre-tax needed: 50,000. Gross = 50,000 / (1 - 0.20) = 62,500
      // Hours: 50 * 25 = 1,250
      // Rate = 62,500 / 1,250 = 50.00/hr
      const inputs: TradesHourlyRateInputs = {
        currency: 'USD',
        desiredAnnualIncome: 50000,
        workingWeeksPerYear: 50,
        billableHoursPerWeek: 25,
        overheads: {
          vanCost: 0,
          insurance: 0,
          tools: 0,
          training: 0,
          phone: 0,
          accountant: 0,
          other: 0,
        },
        taxRate: 20,
      };

      const result = calculateTradesHourlyRate(inputs);

      expect(result.requiredHourlyRate).toBe(50);
      expect(result.requiredDayRate).toBe(400);
    });

    it('should compute correct per-hour breakdown', () => {
      const inputs: TradesHourlyRateInputs = {
        currency: 'USD',
        desiredAnnualIncome: 50000,
        workingWeeksPerYear: 50,
        billableHoursPerWeek: 25,
        overheads: {
          vanCost: 0,
          insurance: 0,
          tools: 0,
          training: 0,
          phone: 0,
          accountant: 0,
          other: 0,
        },
        taxRate: 20,
      };

      const result = calculateTradesHourlyRate(inputs);

      // Income per hour: 50,000 / 1,250 = 40
      expect(result.breakdownPerHour.incomePerHour).toBe(40);
      // Tax: (62,500 - 50,000) / 1,250 = 10
      expect(result.breakdownPerHour.taxPerHour).toBe(10);
      // Overheads per hour: 0
      expect(result.breakdownPerHour.overheadsPerHour).toBe(0);
      // Sum should equal hourly rate
      const sumBreakdown =
        result.breakdownPerHour.incomePerHour +
        result.breakdownPerHour.overheadsPerHour +
        result.breakdownPerHour.taxPerHour;
      expect(sumBreakdown).toBe(result.requiredHourlyRate);
    });

    it('should compute non-billable percentage based on 40-hour week', () => {
      const inputs = getDefaultInputs('USD');
      // Default billableHoursPerWeek = 30
      // Non-billable = (40 - 30) / 40 = 25%
      const result = calculateTradesHourlyRate(inputs);
      expect(result.nonBillablePercent).toBe(25);
    });

    it('should handle zero billable hours gracefully', () => {
      const inputs: TradesHourlyRateInputs = {
        currency: 'USD',
        desiredAnnualIncome: 50000,
        workingWeeksPerYear: 48,
        billableHoursPerWeek: 0,
        overheads: {
          vanCost: 0,
          insurance: 0,
          tools: 0,
          training: 0,
          phone: 0,
          accountant: 0,
          other: 0,
        },
        taxRate: 30,
      };

      const result = calculateTradesHourlyRate(inputs);

      expect(result.requiredHourlyRate).toBe(0);
      expect(result.requiredDayRate).toBe(0);
      expect(result.billableHoursPerYear).toBe(0);
      expect(result.breakdownPerHour.incomePerHour).toBe(0);
    });

    it('should clamp tax rate between 0 and 99', () => {
      const inputs: TradesHourlyRateInputs = {
        currency: 'USD',
        desiredAnnualIncome: 50000,
        workingWeeksPerYear: 50,
        billableHoursPerWeek: 25,
        overheads: {
          vanCost: 0,
          insurance: 0,
          tools: 0,
          training: 0,
          phone: 0,
          accountant: 0,
          other: 0,
        },
        taxRate: 100,
      };

      const result = calculateTradesHourlyRate(inputs);

      // Should clamp to 99%, not divide by zero
      expect(result.requiredHourlyRate).toBeGreaterThan(0);
      expect(Number.isFinite(result.requiredHourlyRate)).toBe(true);
    });

    it('should produce consistent results for identical inputs', () => {
      const inputs = getDefaultInputs('USD');
      const result1 = calculateTradesHourlyRate(inputs);
      const result2 = calculateTradesHourlyRate(inputs);
      expect(result1).toEqual(result2);
    });
  });
});
