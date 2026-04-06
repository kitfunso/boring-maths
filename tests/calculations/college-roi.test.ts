/**
 * CollegeRoiCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateCollegeROI } from '../../src/components/calculators/CollegeROI/calculations';
import { getDefaultInputs } from '../../src/components/calculators/CollegeROI/types';

describe('CollegeRoiCalculator', () => {
  describe('calculateCollegeROI', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateCollegeROI(inputs);

      expect(result.currency).toBe('USD');
      expect(result.totalCost).toBe(160000);
      expect(result.totalLoanAmount).toBe(160000);
      expect(result.totalInterestPaid).toBe(58012);
      expect(result.monthlyLoanPayment).toBe(1817);
      expect(result.paybackPeriod).toBe(19);
      expect(result.lifetimeEarningsPremium).toBe(1128272);
      expect(result.roi).toBe(329);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.annualTuition = 0;

      const result = calculateCollegeROI(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.annualTuition = 2500000;

      const result = calculateCollegeROI(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateCollegeROI(inputs);
      const result2 = calculateCollegeROI(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
