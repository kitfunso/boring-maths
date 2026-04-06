/**
 * ConsultingRateCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateConsultingRate } from '../../src/components/calculators/ConsultingRate/calculations';
import { getDefaultInputs } from '../../src/components/calculators/ConsultingRate/types';

describe('ConsultingRateCalculator', () => {
  describe('calculateConsultingRate', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateConsultingRate(inputs);

      expect(result.currency).toBe('USD');
      expect(result.hourlyRate).toBe(227);
      expect(result.dayRate).toBe(1817);
      expect(result.weekRate).toBe(9087);
      expect(result.monthlyRetainer).toBe(24591);
      expect(result.minimumHourlyRate).toBe(189);
      expect(result.annualRevenueNeeded).toBe(218080);
      expect(result.billableHoursPerYear).toBe(960);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.desiredAnnualIncome = 0;

      const result = calculateConsultingRate(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.desiredAnnualIncome = 10000000;

      const result = calculateConsultingRate(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateConsultingRate(inputs);
      const result2 = calculateConsultingRate(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
