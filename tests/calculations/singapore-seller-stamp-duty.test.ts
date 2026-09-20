/** Table A: purchased on/after 4 Jul 2025 (16/12/8/4/0%). Table B: 11 Mar 2017-3 Jul 2025 (12/8/4/0%). */

import { describe, it, expect } from 'vitest';
import { calculateSingaporeSellerStampDuty } from '../../src/components/calculators/SingaporeSellerStampDuty/calculations';

describe('SingaporeSellerStampDuty', () => {
  describe('calculateSingaporeSellerStampDuty', () => {
    it('charges 16% on Table A for a 5-month hold', () => {
      const result = calculateSingaporeSellerStampDuty({
        salePrice: 1_000_000,
        purchaseDate: '2026-01-01',
        saleDate: '2026-06-01',
      });
      expect(result.table).toBe('A');
      expect(result.totalMonthsHeld).toBe(5);
      expect(result.rate).toBe(0.16);
      expect(result.ssdPayable).toBeCloseTo(160_000, 2);
    });

    it('charges 12% on Table A for a 17-month hold', () => {
      const result = calculateSingaporeSellerStampDuty({
        salePrice: 1_000_000,
        purchaseDate: '2026-01-01',
        saleDate: '2027-06-01',
      });
      expect(result.table).toBe('A');
      expect(result.totalMonthsHeld).toBe(17);
      expect(result.rate).toBe(0.12);
      expect(result.ssdPayable).toBeCloseTo(120_000, 2);
    });

    it('charges 8% on Table B for a 17-month hold', () => {
      const result = calculateSingaporeSellerStampDuty({
        salePrice: 1_000_000,
        purchaseDate: '2020-01-01',
        saleDate: '2021-06-01',
      });
      expect(result.table).toBe('B');
      expect(result.totalMonthsHeld).toBe(17);
      expect(result.rate).toBe(0.08);
      expect(result.ssdPayable).toBeCloseTo(80_000, 2);
    });

    it('charges 0% on Table B for a 6-year hold', () => {
      const result = calculateSingaporeSellerStampDuty({
        salePrice: 1_000_000,
        purchaseDate: '2020-01-01',
        saleDate: '2026-01-01',
      });
      expect(result.table).toBe('B');
      expect(result.totalMonthsHeld).toBe(72);
      expect(result.rate).toBe(0);
      expect(result.ssdPayable).toBe(0);
    });

    it('picks Table A for a purchase on 4 July 2025 exactly', () => {
      const result = calculateSingaporeSellerStampDuty({
        salePrice: 1_000_000,
        purchaseDate: '2025-07-04',
        saleDate: '2025-08-04',
      });
      expect(result.table).toBe('A');
    });

    it('picks Table B for a purchase on 3 July 2025 exactly', () => {
      const result = calculateSingaporeSellerStampDuty({
        salePrice: 1_000_000,
        purchaseDate: '2025-07-03',
        saleDate: '2025-08-03',
      });
      expect(result.table).toBe('B');
    });

    it('flags a purchase before 11 March 2017 as out of scope, never guessing a rate', () => {
      const result = calculateSingaporeSellerStampDuty({
        salePrice: 1_000_000,
        purchaseDate: '2017-03-10',
        saleDate: '2018-01-01',
      });
      expect(result.table).toBe('out-of-scope');
      expect(result.ssdPayable).toBe(0);
      expect(result.rate).toBe(0);
    });

    it('handles a sale date before the purchase date without crashing', () => {
      const result = calculateSingaporeSellerStampDuty({
        salePrice: 1_000_000,
        purchaseDate: '2026-01-01',
        saleDate: '2025-01-01',
      });
      expect(result.invalidDateRange).toBe(true);
      expect(result.ssdPayable).toBe(0);
    });
  });
});
