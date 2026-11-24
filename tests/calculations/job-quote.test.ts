import { describe, it, expect } from 'vitest';
import { calculateJobQuote } from '../../src/components/calculators/JobQuoteCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/JobQuoteCalculator/types';

describe('JobQuoteCalculator', () => {
  describe('calculateJobQuote', () => {
    it('should calculate with default USD inputs', () => {
      const inputs = getDefaultInputs('USD');

      const result = calculateJobQuote(inputs);

      expect(result.currency).toBe('USD');
      expect(result.materialsSubtotal).toBe(53);
      expect(result.labourSubtotal).toBe(160);
      expect(result.markupAmount).toBe(47.6);
      expect(result.subtotalBeforeVAT).toBe(285.6);
      expect(result.vatAmount).toBe(0);
      expect(result.totalQuote).toBe(285.6);
    });

    it('should calculate with default GBP inputs (includes VAT)', () => {
      const inputs = getDefaultInputs('GBP');

      const result = calculateJobQuote(inputs);

      expect(result.currency).toBe('GBP');
      expect(result.vatAmount).toBeGreaterThan(0);
      expect(result.totalQuote).toBeGreaterThan(result.subtotalBeforeVAT);
    });

    it('should handle zero materials', () => {
      const inputs = {
        ...getDefaultInputs('USD'),
        materials: [{ id: '1', name: 'None', cost: 0 }],
      };

      const result = calculateJobQuote(inputs);

      expect(result.materialsSubtotal).toBe(0);
      expect(result.totalQuote).toBeGreaterThan(0);
    });

    it('should handle zero labour hours', () => {
      const inputs = {
        ...getDefaultInputs('USD'),
        labourHours: 0,
      };

      const result = calculateJobQuote(inputs);

      expect(result.labourSubtotal).toBe(0);
      expect(result.materialsSubtotal).toBeGreaterThan(0);
    });

    it('should handle zero markup', () => {
      const inputs = {
        ...getDefaultInputs('USD'),
        markupPercent: 0,
      };

      const result = calculateJobQuote(inputs);

      expect(result.markupAmount).toBe(0);
      expect(result.profitMarginPercent).toBe(0);
    });

    it('should handle large values', () => {
      const inputs = {
        ...getDefaultInputs('USD'),
        materials: [{ id: '1', name: 'Expensive', cost: 50000 }],
        labourHours: 200,
        hourlyRate: 100,
      };

      const result = calculateJobQuote(inputs);

      expect(result.materialsSubtotal).toBe(50000);
      expect(result.labourSubtotal).toBe(20000);
      expect(result.totalQuote).toBeGreaterThan(70000);
    });

    it('should apply VAT correctly', () => {
      const inputs = {
        ...getDefaultInputs('USD'),
        vatRate: 20,
        markupPercent: 0,
        travelFee: 0,
        materials: [{ id: '1', name: 'Test', cost: 100 }],
        labourHours: 0,
      };

      const result = calculateJobQuote(inputs);

      expect(result.subtotalBeforeVAT).toBe(100);
      expect(result.vatAmount).toBe(20);
      expect(result.totalQuote).toBe(120);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs('USD');

      const result1 = calculateJobQuote(inputs);
      const result2 = calculateJobQuote(inputs);

      expect(result1).toEqual(result2);
    });

    it('should calculate profit margin correctly', () => {
      const inputs = {
        ...getDefaultInputs('USD'),
        materials: [{ id: '1', name: 'Test', cost: 100 }],
        labourHours: 0,
        travelFee: 0,
        markupPercent: 25,
        vatRate: 0,
      };

      const result = calculateJobQuote(inputs);

      expect(result.markupAmount).toBe(25);
      expect(result.subtotalBeforeVAT).toBe(125);
      expect(result.profitMarginPercent).toBe(20);
    });
  });
});
