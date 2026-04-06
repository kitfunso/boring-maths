/**
 * Materials Markup Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMaterialsMarkup,
  markupToMargin,
  marginToMarkup,
  sellingPriceFromMarkup,
  sellingPriceFromMargin,
} from '../../src/components/calculators/MaterialsMarkupCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/MaterialsMarkupCalculator/types';

describe('MaterialsMarkupCalculator', () => {
  describe('markupToMargin', () => {
    it('should convert 50% markup to 33.3% margin', () => {
      const margin = markupToMargin(50);
      expect(margin).toBeCloseTo(33.33, 1);
    });

    it('should convert 100% markup to 50% margin', () => {
      expect(markupToMargin(100)).toBeCloseTo(50, 1);
    });

    it('should convert 25% markup to 20% margin', () => {
      expect(markupToMargin(25)).toBeCloseTo(20, 1);
    });

    it('should handle 0% markup as 0% margin', () => {
      expect(markupToMargin(0)).toBe(0);
    });

    it('should handle edge case of -100% markup', () => {
      expect(markupToMargin(-100)).toBe(0);
    });
  });

  describe('marginToMarkup', () => {
    it('should convert 33.3% margin to ~50% markup', () => {
      const markup = marginToMarkup(33.33);
      expect(markup).toBeCloseTo(49.99, 0);
    });

    it('should convert 50% margin to 100% markup', () => {
      expect(marginToMarkup(50)).toBeCloseTo(100, 1);
    });

    it('should convert 20% margin to 25% markup', () => {
      expect(marginToMarkup(20)).toBeCloseTo(25, 1);
    });

    it('should handle 0% margin as 0% markup', () => {
      expect(marginToMarkup(0)).toBe(0);
    });

    it('should return Infinity for 100% margin', () => {
      expect(marginToMarkup(100)).toBe(Infinity);
    });
  });

  describe('sellingPriceFromMarkup', () => {
    it('should calculate sell = cost * (1 + markup/100)', () => {
      expect(sellingPriceFromMarkup(100, 30)).toBe(130);
    });

    it('should handle zero cost', () => {
      expect(sellingPriceFromMarkup(0, 30)).toBe(0);
    });

    it('should handle zero markup', () => {
      expect(sellingPriceFromMarkup(100, 0)).toBe(100);
    });

    it('should handle 100% markup', () => {
      expect(sellingPriceFromMarkup(50, 100)).toBe(100);
    });
  });

  describe('sellingPriceFromMargin', () => {
    it('should calculate sell = cost / (1 - margin/100)', () => {
      expect(sellingPriceFromMargin(100, 20)).toBeCloseTo(125, 2);
    });

    it('should handle zero margin', () => {
      expect(sellingPriceFromMargin(100, 0)).toBe(100);
    });

    it('should handle 50% margin', () => {
      expect(sellingPriceFromMargin(100, 50)).toBe(200);
    });

    it('should return Infinity for 100% margin', () => {
      expect(sellingPriceFromMargin(100, 100)).toBe(Infinity);
    });
  });

  describe('calculateMaterialsMarkup', () => {
    it('should calculate with default inputs (markupToSell mode)', () => {
      const inputs = getDefaultInputs();
      const result = calculateMaterialsMarkup(inputs);

      expect(result.sellingPrice).toBe(130);
      expect(result.markupPercent).toBe(30);
      expect(result.marginPercent).toBeCloseTo(23.1, 1);
      expect(result.profitPerUnit).toBe(30);
      expect(result.totalProfit).toBe(30);
      expect(result.markupVsMarginExplanation).toContain('markup');
      expect(result.markupVsMarginExplanation).toContain('margin');
    });

    it('should calculate sellToMarkup mode', () => {
      const inputs = { ...getDefaultInputs(), mode: 'sellToMarkup' as const, sellingPrice: 150 };
      const result = calculateMaterialsMarkup(inputs);

      expect(result.markupPercent).toBe(50);
      expect(result.marginPercent).toBeCloseTo(33.3, 1);
      expect(result.profitPerUnit).toBe(50);
    });

    it('should calculate marginToSell mode', () => {
      const inputs = { ...getDefaultInputs(), mode: 'marginToSell' as const, marginPercent: 20 };
      const result = calculateMaterialsMarkup(inputs);

      expect(result.sellingPrice).toBe(125);
      expect(result.markupPercent).toBe(25);
      expect(result.marginPercent).toBe(20);
      expect(result.profitPerUnit).toBe(25);
    });

    it('should multiply profit by quantity', () => {
      const inputs = { ...getDefaultInputs(), quantity: 10 };
      const result = calculateMaterialsMarkup(inputs);

      expect(result.profitPerUnit).toBe(30);
      expect(result.totalProfit).toBe(300);
    });

    it('should handle zero cost price', () => {
      const inputs = { ...getDefaultInputs(), costPrice: 0 };
      const result = calculateMaterialsMarkup(inputs);

      expect(result.sellingPrice).toBe(0);
      expect(result).toBeDefined();
    });

    it('should handle zero cost in sellToMarkup mode', () => {
      const inputs = {
        ...getDefaultInputs(),
        mode: 'sellToMarkup' as const,
        costPrice: 0,
        sellingPrice: 100,
      };
      const result = calculateMaterialsMarkup(inputs);

      expect(result.markupPercent).toBe(0);
      expect(result.marginPercent).toBe(0);
    });

    it('should handle large values', () => {
      const inputs = { ...getDefaultInputs(), costPrice: 100000, markupPercent: 50 };
      const result = calculateMaterialsMarkup(inputs);

      expect(result.sellingPrice).toBe(150000);
      expect(isFinite(result.sellingPrice)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();
      const r1 = calculateMaterialsMarkup(inputs);
      const r2 = calculateMaterialsMarkup(inputs);
      expect(r1).toEqual(r2);
    });

    it('should enforce minimum quantity of 1', () => {
      const inputs = { ...getDefaultInputs(), quantity: 0 };
      const result = calculateMaterialsMarkup(inputs);

      // totalProfit should equal profitPerUnit when qty is floored to 1
      expect(result.totalProfit).toBe(result.profitPerUnit);
    });
  });
});
