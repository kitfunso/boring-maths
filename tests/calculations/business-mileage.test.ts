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
      // US: 2,400 * $0.725 = $1,740 to June, 2,400 * $0.76 = $1,824 from July; $3,564
      expect(result.taxDeduction).toBe(3564);
      expect(result.rateBreakdown).toHaveLength(2);
      expect(result.rateBreakdown[0].rate).toBe(0.725);
      expect(result.rateBreakdown[0].amount).toBe(1740);
      expect(result.rateBreakdown[1].rate).toBe(0.76);
      expect(result.rateBreakdown[1].amount).toBe(1824);
    });

    it('should calculate with default GBP inputs', () => {
      const inputs = getDefaultInputs('GBP');
      const result = calculateBusinessMileage(inputs);

      // 100 miles/week * 48 weeks = 4,800 miles
      expect(result.annualMiles).toBe(4800);
      // UK car: 4,800 * £0.55 = £2,640 (all under 10k threshold)
      expect(result.taxDeduction).toBe(2640);
      expect(result.rateBreakdown).toHaveLength(1);
      expect(result.rateBreakdown[0].rate).toBe(0.55);
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
      // First 10,000 at 55p = £5,500
      // Remaining 4,400 at 25p = £1,100
      // Total = £6,600
      expect(result.taxDeduction).toBe(6600);
      expect(result.rateBreakdown).toHaveLength(2);
      expect(result.rateBreakdown[0].miles).toBe(10000);
      expect(result.rateBreakdown[0].amount).toBe(5500);
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
      expect(result.rateBreakdown[0].rate).toBe(0.2);
    });

    it('should calculate tax saving using estimated marginal rate', () => {
      const inputs = getDefaultInputs('GBP');
      const result = calculateBusinessMileage(inputs);

      // UK basic rate: 20%
      // Deduction £2,640 * 0.20 = £528
      expect(result.annualTaxSaving).toBe(528);
      expect(result.estimatedTaxRate).toBe(0.2);
    });

    it('should calculate US tax saving', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateBusinessMileage(inputs);

      // US rate: 22%
      // Deduction $3,564 * 0.22 = $784.08
      expect(result.annualTaxSaving).toBe(784.08);
      expect(result.estimatedTaxRate).toBe(0.22);
    });

    it('should calculate monthly equivalent', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateBusinessMileage(inputs);

      // $3,564 / 12 = $297
      expect(result.monthlyEquivalent).toBe(297);
    });

    it('should provide electric vehicle note when enabled', () => {
      const ukInputs = {
        ...getDefaultInputs('GBP'),
        isElectric: true,
      };
      const ukResult = calculateBusinessMileage(ukInputs);
      expect(ukResult.electricVehicleNote).toContain('55p/25p');

      const usInputs = {
        ...getDefaultInputs('USD'),
        isElectric: true,
      };
      const usResult = calculateBusinessMileage(usInputs);
      expect(usResult.electricVehicleNote).toContain('72.5c to 30 June, 76c from 1 July');
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

      expect(result.ukRateFirst10k).toBe(0.55);
      expect(result.ukRateOver10k).toBe(0.25);
      expect(result.usIRSRate).toBe(0.76);
    });

    it('should use EUR currency with US region', () => {
      const inputs = getDefaultInputs('EUR');
      // EUR defaults to US region
      expect(inputs.region).toBe('US');
      const result = calculateBusinessMileage(inputs);
      expect(result.rateBreakdown[1].rate).toBe(0.76);
    });
  });
});
