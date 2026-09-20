/** Expected values hand-computed from employer CPF rates and SDL (0.25% of wages to 4,500, min 2, max 11.25) effective 1 Jan 2026. */

import { describe, it, expect } from 'vitest';
import { calculateSingaporeEmployerCost } from '../../src/components/calculators/SingaporeEmployerCost/calculations';

describe('SingaporeEmployerCost', () => {
  describe('calculateSingaporeEmployerCost', () => {
    it('computes total cost for a 5,000 wage in the 55-and-below band', () => {
      const result = calculateSingaporeEmployerCost({ monthlyGrossWage: 5000, ageBand: 'upTo55' });
      expect(result.employerCpf).toBeCloseTo(850, 2);
      expect(result.sdl).toBeCloseTo(11.25, 2);
      expect(result.totalMonthlyCost).toBeCloseTo(5861.25, 2);
    });

    it('lands SDL exactly at the 2 minimum for an 800 wage', () => {
      const result = calculateSingaporeEmployerCost({ monthlyGrossWage: 800, ageBand: 'upTo55' });
      expect(result.sdl).toBeCloseTo(2.0, 2);
    });

    it('floors SDL at 2 for a 600 wage', () => {
      const result = calculateSingaporeEmployerCost({ monthlyGrossWage: 600, ageBand: 'upTo55' });
      expect(result.sdl).toBeCloseTo(2.0, 2);
    });

    it('caps employer CPF at the 8,000 OW ceiling for a 10,000 wage', () => {
      const result = calculateSingaporeEmployerCost({ monthlyGrossWage: 10000, ageBand: 'upTo55' });
      expect(result.employerCpf).toBeCloseTo(1360, 2);
      expect(result.sdl).toBeCloseTo(11.25, 2);
    });

    it('applies the 9% rate for a 5,000 wage in the 65-to-70 band', () => {
      const result = calculateSingaporeEmployerCost({
        monthlyGrossWage: 5000,
        ageBand: 'above65To70',
      });
      expect(result.employerCpf).toBeCloseTo(450, 2);
      expect(result.totalMonthlyCost).toBeCloseTo(5461.25, 2);
    });

    it('returns all zeros for a zero wage', () => {
      const result = calculateSingaporeEmployerCost({ monthlyGrossWage: 0, ageBand: 'upTo55' });
      expect(result.employerCpf).toBe(0);
      expect(result.sdl).toBe(0);
      expect(result.totalMonthlyCost).toBe(0);
    });
  });
});
