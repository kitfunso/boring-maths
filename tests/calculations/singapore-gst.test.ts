/** Singapore GST tests. GST rate 9% from 1 Jan 2024. Expected values hand-computed below each case. */

import { describe, it, expect } from 'vitest';
import {
  calculateDomesticGST,
  calculateImportGST,
} from '../../src/components/calculators/SingaporeGST/calculations';

describe('SingaporeGST', () => {
  describe('calculateDomesticGST', () => {
    it('adds GST to $100 -> gst $9.00, gross $109.00 (100 x 0.09 = 9, 100 + 9 = 109)', () => {
      const result = calculateDomesticGST({ amount: 100, mode: 'add' });
      expect(result.net).toBe(100);
      expect(result.gst).toBe(9);
      expect(result.gross).toBe(109);
    });

    it('removes GST from $109 -> net $100.00, gst $9.00 (109 / 1.09 = 100, round-trips the add case)', () => {
      const result = calculateDomesticGST({ amount: 109, mode: 'remove' });
      expect(result.net).toBe(100);
      expect(result.gst).toBe(9);
    });

    it('removes GST from $100 -> net $91.74, gst $8.26, NOT $91.00 (100 / 1.09 = 91.743..., not 100 - 9%)', () => {
      const result = calculateDomesticGST({ amount: 100, mode: 'remove' });
      expect(result.net).toBe(91.74);
      expect(result.gst).toBe(8.26);
      expect(result.net).not.toBe(91);
    });

    it('returns zero on a $0 amount without crashing', () => {
      const add = calculateDomesticGST({ amount: 0, mode: 'add' });
      const remove = calculateDomesticGST({ amount: 0, mode: 'remove' });
      expect(add).toEqual({ net: 0, gst: 0, gross: 0 });
      expect(remove).toEqual({ net: 0, gst: 0, gross: 0 });
    });
  });

  describe('calculateImportGST', () => {
    it('computes landed cost with no duty (cost 500 + freight 50 + insurance 10 = CIF 560; GST 560 x 0.09 = 50.40; landed 610.40)', () => {
      const result = calculateImportGST({
        itemCost: 500,
        shipping: 50,
        insurance: 10,
        dutyRatePercent: 0,
      });
      expect(result.cifValue).toBe(560);
      expect(result.duty).toBe(0);
      expect(result.gstBase).toBe(560);
      expect(result.gst).toBe(50.4);
      expect(result.landedCost).toBe(610.4);
    });

    it('applies a 20% duty rate (duty 560 x 0.2 = 112; base 560 + 112 = 672; gst 672 x 0.09 = 60.48)', () => {
      const result = calculateImportGST({
        itemCost: 500,
        shipping: 50,
        insurance: 10,
        dutyRatePercent: 20,
      });
      expect(result.duty).toBe(112);
      expect(result.gstBase).toBe(672);
      expect(result.gst).toBe(60.48);
    });

    it('returns zero on all-zero inputs without crashing', () => {
      const result = calculateImportGST({
        itemCost: 0,
        shipping: 0,
        insurance: 0,
        dutyRatePercent: 0,
      });
      expect(result).toEqual({ cifValue: 0, duty: 0, gstBase: 0, gst: 0, landedCost: 0 });
    });
  });
});
