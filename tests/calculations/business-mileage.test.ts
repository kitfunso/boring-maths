/**
 * Business Mileage Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateBusinessMileage } from '../../src/components/calculators/BusinessMileageCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/BusinessMileageCalculator/types';

describe('BusinessMileageCalculator', () => {
  describe('calculateBusinessMileage', () => {
    it('should calculate with default USD inputs', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateBusinessMileage(inputs);

      // 100 miles/week * 48 weeks = 4,800 miles
      expect(result.annualMiles).toBe(4800);
      // US: 4,800 * $0.67 = $3,216
      expect(result.taxDeduction).toBe(3216);
      expect(result.rateBreakdown).toHaveLength(1);
      expect(result.rateBreakdown[0].rate).toBe(0.67);
    });

    it('should calculate with default GBP inputs', () => {
      const inputs = getDefaultInputs('GBP');
      const result = calculateBusinessMileage(inputs);

      // 100 miles/week * 48 weeks = 4,800 miles
      expect(result.annualMiles).toBe(4800);
      // UK car: 4,800 * £0.45 = £2,160 (all under 10k threshold)
      expect(result.taxDeduction).toBe(2160);
      expect(result.rateBreakdown).toHaveLength(1);
      expect(result.rateBreakdown[0].rate).toBe(0.45);
    });

    it('should apply tiered UK rates above 10,000 miles', () => {
      const inputs = {
        ...getDefaultInputs('GBP'),
        milesPerWeek: 300,
        weeksPerYear: 48,
      };
      const result = calculateBusinessMileage(inputs);

      // 300 * 48 = 14,400 miles
      expect(result.annualMiles).toBe(14400);
      // First 10,000 at 45p = £4,500
      // Remaining 4,400 at 25p = £1,100
      // Total = £5,600
      expect(result.taxDeduction).toBe(5600);
      expect(result.rateBreakdown).toHaveLength(2);
      expect(result.rateBreakdown[0].miles).toBe(10000);
      expect(result.rateBreakdown[0].amount).toBe(4500);
      expect(result.rateBreakdown[1].miles).toBe(4400);
      expect(result.rateBreakdown[1].amount).toBe(1100);
    });

    it('should use flat rate for UK motorcycles', () => {
      const inputs = {
        ...getDefaultInputs('GBP'),
        vehicleType: 'motorcycle' as const,
        milesPerWeek: 200,
        weeksPerYear: 48,
      };
      const result = calculateBusinessMileage(inputs);

      // 200 * 48 = 9,600 miles at 24p = £2,304
      expect(result.annualMiles).toBe(9600);
      expect(result.taxDeduction).toBe(2304);
      expect(result.rateBreakdown).toHaveLength(1);
      expect(result.rateBreakdown[0].rate).toBe(0.24);
    });

    it('should use flat rate for UK bicycles', () => {
      const inputs = {
        ...getDefaultInputs('GBP'),
        vehicleType: 'bicycle' as const,
        milesPerWeek: 50,
        weeksPerYear: 48,
      };
      const result = calculateBusinessMileage(inputs);

      // 50 * 48 = 2,400 miles at 20p = £480
      expect(result.annualMiles).toBe(2400);
      expect(result.taxDeduction).toBe(480);
      expect(result.rateBreakdown).toHaveLength(1);
      expect(result.rateBreakdown[0].rate).toBe(0.20);
    });

    it('should calculate tax saving using estimated marginal rate', () => {
      const inputs = getDefaultInputs('GBP');
      const result = calculateBusinessMileage(inputs);

      // UK basic rate: 20%
      // Deduction £2,160 * 0.20 = £432
      expect(result.annualTaxSaving).toBe(432);
      expect(result.estimatedTaxRate).toBe(0.20);
    });

    it('should calculate US tax saving', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateBusinessMileage(inputs);

      // US rate: 22%
      // Deduction $3,216 * 0.22 = $707.52
      expect(result.annualTaxSaving).toBe(707.52);
      expect(result.estimatedTaxRate).toBe(0.22);
    });

    it('should calculate monthly equivalent', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateBusinessMileage(inputs);

      // $3,216 / 12 = $268
      expect(result.monthlyEquivalent).toBe(268);
    });

    it('should provide electric vehicle note when enabled', () => {
      const ukInputs = {
        ...getDefaultInputs('GBP'),
        isElectric: true,
      };
      const ukResult = calculateBusinessMileage(ukInputs);
      expect(ukResult.electricVehicleNote).toContain('45p/25p');

      const usInputs = {
        ...getDefaultInputs('USD'),
        isElectric: true,
      };
      const usResult = calculateBusinessMileage(usInputs);
      expect(usResult.electricVehicleNote).toContain('67c');
    });

    it('should not provide electric vehicle note for non-electric', () => {
      const inputs = getDefaultInputs('GBP');
      const result = calculateBusinessMileage(inputs);
      expect(result.electricVehicleNote).toBe('');
    });

    it('should not provide electric vehicle note for motorcycles', () => {
      const inputs = {
        ...getDefaultInputs('GBP'),
        vehicleType: 'motorcycle' as const,
        isElectric: true,
      };
      const result = calculateBusinessMileage(inputs);
      expect(result.electricVehicleNote).toBe('');
    });

    it('should handle zero miles', () => {
      const inputs = { ...getDefaultInputs('USD'), milesPerWeek: 0 };
      const result = calculateBusinessMileage(inputs);

      expect(result.annualMiles).toBe(0);
      expect(result.taxDeduction).toBe(0);
      expect(result.annualTaxSaving).toBe(0);
      expect(result.monthlyEquivalent).toBe(0);
    });

    it('should handle large values without overflow', () => {
      const inputs = {
        ...getDefaultInputs('USD'),
        milesPerWeek: 2000,
        weeksPerYear: 52,
      };
      const result = calculateBusinessMileage(inputs);

      expect(result.annualMiles).toBe(104000);
      expect(isFinite(result.taxDeduction)).toBe(true);
      expect(result.taxDeduction).toBeGreaterThan(0);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs('GBP');
      const result1 = calculateBusinessMileage(inputs);
      const result2 = calculateBusinessMileage(inputs);
      expect(result1).toEqual(result2);
    });

    it('should always include standard rates in result', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateBusinessMileage(inputs);

      expect(result.ukRateFirst10k).toBe(0.45);
      expect(result.ukRateOver10k).toBe(0.25);
      expect(result.usIRSRate).toBe(0.67);
    });

    it('should use EUR currency with US region', () => {
      const inputs = getDefaultInputs('EUR');
      // EUR defaults to US region
      expect(inputs.region).toBe('US');
      const result = calculateBusinessMileage(inputs);
      expect(result.rateBreakdown[0].rate).toBe(0.67);
    });
  });
});
