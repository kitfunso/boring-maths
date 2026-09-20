/** Expected values hand-computed from CPF rates effective 1 Jan 2026, $8,000 OW ceiling, graduated band 500-750. */

import { describe, it, expect } from 'vitest';
import { calculateSingaporeTakeHome } from '../../src/components/calculators/SingaporeTakeHomePay/calculations';

describe('SingaporeTakeHomePay', () => {
  describe('calculateSingaporeTakeHome', () => {
    it('computes take-home for a 5,000 wage in the 55-and-below band', () => {
      const result = calculateSingaporeTakeHome({ monthlyGrossWage: 5000, ageBand: 'upTo55' });
      expect(result.employeeCpf).toBeCloseTo(1000, 2);
      expect(result.monthlyTakeHome).toBeCloseTo(4000, 2);
    });

    it('caps CPF at the 8,000 OW ceiling for a 10,000 wage', () => {
      const result = calculateSingaporeTakeHome({ monthlyGrossWage: 10000, ageBand: 'upTo55' });
      expect(result.employeeCpf).toBeCloseTo(1600, 2);
      expect(result.monthlyTakeHome).toBeCloseTo(8400, 2);
    });

    it('applies the graduated band for a 600 wage', () => {
      const result = calculateSingaporeTakeHome({ monthlyGrossWage: 600, ageBand: 'upTo55' });
      expect(result.employeeCpf).toBeCloseTo(60, 2);
    });

    it('charges zero employee CPF at or below 500', () => {
      const result = calculateSingaporeTakeHome({ monthlyGrossWage: 400, ageBand: 'upTo55' });
      expect(result.employeeCpf).toBe(0);
    });

    it('applies the 12.5% rate for a 5,000 wage in the 60-to-65 band', () => {
      const result = calculateSingaporeTakeHome({ monthlyGrossWage: 5000, ageBand: 'above60To65' });
      expect(result.employeeCpf).toBeCloseTo(625, 2);
    });

    it('applies the 5% rate for a 5,000 wage in the above-70 band', () => {
      const result = calculateSingaporeTakeHome({ monthlyGrossWage: 5000, ageBand: 'above70' });
      expect(result.employeeCpf).toBeCloseTo(250, 2);
      expect(result.monthlyTakeHome).toBeCloseTo(4750, 2);
      expect(result.employerCpf).toBeCloseTo(375, 2);
    });

    it('returns all zeros for a zero wage', () => {
      const result = calculateSingaporeTakeHome({ monthlyGrossWage: 0, ageBand: 'upTo55' });
      expect(result.employeeCpf).toBe(0);
      expect(result.monthlyTakeHome).toBe(0);
    });
  });
});
