/**
 * Tip Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateTip } from '../../src/components/calculators/TipCalculator/calculations';
import type { TipCalculatorInputs } from '../../src/components/calculators/TipCalculator/types';

describe('TipCalculator', () => {
  describe('calculateTip', () => {
    it('calculates basic tip correctly', () => {
      const inputs: TipCalculatorInputs = {
        currency: 'USD',
        billAmount: 100,
        tipPercentage: 0.2,
        splitCount: 1,
        useCustomSplit: false,
      };

      const result = calculateTip(inputs);

      expect(result.tipAmount).toBe(20);
      expect(result.totalAmount).toBe(120);
      expect(result.perPersonTotal).toBe(120);
    });

    it('splits bill correctly among multiple people', () => {
      const inputs: TipCalculatorInputs = {
        currency: 'USD',
        billAmount: 100,
        tipPercentage: 0.2,
        splitCount: 4,
        useCustomSplit: false,
      };

      const result = calculateTip(inputs);

      expect(result.tipAmount).toBe(20);
      expect(result.totalAmount).toBe(120);
      expect(result.perPersonTotal).toBe(30);
      expect(result.perPersonTip).toBe(5);
      expect(result.perPersonBill).toBe(25);
    });

    it('handles zero tip correctly', () => {
      const inputs: TipCalculatorInputs = {
        currency: 'USD',
        billAmount: 50,
        tipPercentage: 0,
        splitCount: 1,
        useCustomSplit: false,
      };

      const result = calculateTip(inputs);

      expect(result.tipAmount).toBe(0);
      expect(result.totalAmount).toBe(50);
    });

    it('rounds to 2 decimal places', () => {
      const inputs: TipCalculatorInputs = {
        currency: 'USD',
        billAmount: 33.33,
        tipPercentage: 0.18,
        splitCount: 1,
        useCustomSplit: false,
      };

      const result = calculateTip(inputs);

      // 33.33 * 0.18 = 5.9994, should round to 6.00
      expect(result.tipAmount).toBe(6);
    });

    it('generates correct suggestions', () => {
      const inputs: TipCalculatorInputs = {
        currency: 'USD',
        billAmount: 100,
        tipPercentage: 0.2,
        splitCount: 1,
        useCustomSplit: false,
      };

      const result = calculateTip(inputs);

      expect(result.suggestions).toHaveLength(4);
      expect(result.suggestions[0].percentage).toBe(0.15);
      expect(result.suggestions[0].tipAmount).toBe(15);
      expect(result.suggestions[1].percentage).toBe(0.18);
      expect(result.suggestions[2].percentage).toBe(0.2);
      expect(result.suggestions[3].percentage).toBe(0.25);
    });

    it('handles splitCount of 0 gracefully (treats as 1)', () => {
      const inputs: TipCalculatorInputs = {
        currency: 'USD',
        billAmount: 100,
        tipPercentage: 0.2,
        splitCount: 0,
        useCustomSplit: false,
      };

      const result = calculateTip(inputs);

      // Should not divide by zero
      expect(result.perPersonTotal).toBe(120);
    });

    it('preserves currency in result', () => {
      const inputs: TipCalculatorInputs = {
        currency: 'GBP',
        billAmount: 100,
        tipPercentage: 0.15,
        splitCount: 1,
        useCustomSplit: false,
      };

      const result = calculateTip(inputs);

      expect(result.currency).toBe('GBP');
    });
  });
});
