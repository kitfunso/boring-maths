/**
 * UsPaycheckCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculatePaycheck } from '../../src/components/calculators/USPaycheckCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/USPaycheckCalculator/types';

describe('UsPaycheckCalculator', () => {
  describe('calculatePaycheck', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculatePaycheck(inputs);

      expect(result.grossPay).toBeCloseTo(2884.6153846153848, 2);
      expect(result.federalTax).toBeCloseTo(320.8076923076923, 2);
      expect(result.stateTax).toBeCloseTo(268.2692307692308, 2);
      expect(result.socialSecurity).toBeCloseTo(178.84615384615384, 2);
      expect(result.medicare).toBeCloseTo(41.82692307692308, 2);
      expect(result.preTaxDeductions).toBe(0);
      expect(result.totalDeductions).toBeCloseTo(809.75, 2);
      expect(result.netPay).toBeCloseTo(2074.8653846153848, 2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.grossSalary = 0;

      const result = calculatePaycheck(inputs);

      expect(result).toBeDefined();
      expect(typeof result.grossPay).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.grossSalary = 7500000;

      const result = calculatePaycheck(inputs);

      expect(result).toBeDefined();
      expect(typeof result.grossPay).toBe('number');
      expect(isFinite(result.grossPay)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculatePaycheck(inputs);
      const result2 = calculatePaycheck(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
