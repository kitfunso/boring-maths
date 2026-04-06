/**
 * One Rep Max Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateOneRepMax } from '../../src/components/calculators/OneRepMaxCalculator/calculations';
import type { OneRepMaxInputs } from '../../src/components/calculators/OneRepMaxCalculator/types';

describe('OneRepMaxCalculator', () => {
  describe('calculateOneRepMax', () => {
    const baseInputs: OneRepMaxInputs = {
      weight: 100,
      reps: 5,
      unit: 'kg',
      formula: 'epley',
    };

    describe('Epley formula', () => {
      it('calculates correctly: weight * (1 + reps/30)', () => {
        const result = calculateOneRepMax(baseInputs);
        // 100 * (1 + 5/30) = 100 * 1.1667 = 116.7
        expect(result.estimated1RM).toBeCloseTo(116.7, 1);
      });

      it('returns weight unchanged for 1 rep', () => {
        const result = calculateOneRepMax({ ...baseInputs, reps: 1 });
        expect(result.estimated1RM).toBe(100);
      });

      it('handles 10 reps', () => {
        const result = calculateOneRepMax({ ...baseInputs, reps: 10 });
        // 100 * (1 + 10/30) = 100 * 1.333 = 133.3
        expect(result.estimated1RM).toBeCloseTo(133.3, 1);
      });
    });

    describe('Brzycki formula', () => {
      it('calculates correctly: weight * 36/(37 - reps)', () => {
        const result = calculateOneRepMax({ ...baseInputs, formula: 'brzycki' });
        // 100 * 36/(37 - 5) = 100 * 36/32 = 112.5
        expect(result.estimated1RM).toBe(112.5);
      });

      it('returns weight unchanged for 1 rep', () => {
        const result = calculateOneRepMax({ ...baseInputs, formula: 'brzycki', reps: 1 });
        expect(result.estimated1RM).toBe(100);
      });
    });

    describe('Lander formula', () => {
      it('calculates correctly: 100 * weight / (101.3 - 2.67123 * reps)', () => {
        const result = calculateOneRepMax({ ...baseInputs, formula: 'lander' });
        // 100 * 100 / (101.3 - 2.67123 * 5) = 10000 / 87.94385 = 113.7
        expect(result.estimated1RM).toBeCloseTo(113.7, 0);
      });
    });

    describe('Lombardi formula', () => {
      it('calculates correctly: weight * reps^0.10', () => {
        const result = calculateOneRepMax({ ...baseInputs, formula: 'lombardi' });
        // 100 * 5^0.10 = 100 * 1.1746 = 117.5
        expect(result.estimated1RM).toBeCloseTo(117.5, 0);
      });
    });

    describe("O'Conner formula", () => {
      it('calculates correctly: weight * (1 + 0.025 * reps)', () => {
        const result = calculateOneRepMax({ ...baseInputs, formula: 'oconner' });
        // 100 * (1 + 0.025 * 5) = 100 * 1.125 = 112.5
        expect(result.estimated1RM).toBe(112.5);
      });
    });

    describe('percentage table', () => {
      it('generates entries from 100% down to 50% in 5% steps', () => {
        const result = calculateOneRepMax(baseInputs);
        expect(result.percentages.length).toBe(11); // 100, 95, 90, ..., 50
        expect(result.percentages[0].percent).toBe(100);
        expect(result.percentages[result.percentages.length - 1].percent).toBe(50);
      });

      it('100% row equals the estimated 1RM', () => {
        const result = calculateOneRepMax(baseInputs);
        expect(result.percentages[0].weight).toBe(result.estimated1RM);
      });

      it('calculates 50% correctly', () => {
        const result = calculateOneRepMax(baseInputs);
        const fiftyPercent = result.percentages.find((r) => r.percent === 50);
        expect(fiftyPercent).toBeDefined();
        expect(fiftyPercent!.weight).toBeCloseTo(result.estimated1RM * 0.5, 0);
      });
    });

    describe('formula comparison', () => {
      it('returns all 5 formula estimates', () => {
        const result = calculateOneRepMax(baseInputs);
        expect(result.formulaComparison.length).toBe(5);

        const names = result.formulaComparison.map((f) => f.formula);
        expect(names).toContain('epley');
        expect(names).toContain('brzycki');
        expect(names).toContain('lander');
        expect(names).toContain('lombardi');
        expect(names).toContain('oconner');
      });

      it('all estimates are positive for valid inputs', () => {
        const result = calculateOneRepMax(baseInputs);
        result.formulaComparison.forEach((f) => {
          expect(f.estimated1RM).toBeGreaterThan(0);
        });
      });
    });

    describe('training zones', () => {
      it('returns 3 zones: Strength, Hypertrophy, Endurance', () => {
        const result = calculateOneRepMax(baseInputs);
        expect(result.trainingZones.length).toBe(3);
        expect(result.trainingZones[0].name).toBe('Strength');
        expect(result.trainingZones[1].name).toBe('Hypertrophy');
        expect(result.trainingZones[2].name).toBe('Endurance');
      });

      it('strength zone covers 85-100%', () => {
        const result = calculateOneRepMax(baseInputs);
        const strength = result.trainingZones[0];
        expect(strength.minPercent).toBe(85);
        expect(strength.maxPercent).toBe(100);
      });

      it('hypertrophy zone covers 65-85%', () => {
        const result = calculateOneRepMax(baseInputs);
        const hypertrophy = result.trainingZones[1];
        expect(hypertrophy.minPercent).toBe(65);
        expect(hypertrophy.maxPercent).toBe(85);
      });

      it('endurance zone covers 50-65%', () => {
        const result = calculateOneRepMax(baseInputs);
        const endurance = result.trainingZones[2];
        expect(endurance.minPercent).toBe(50);
        expect(endurance.maxPercent).toBe(65);
      });
    });

    describe('edge cases', () => {
      it('returns empty result for zero weight', () => {
        const result = calculateOneRepMax({ ...baseInputs, weight: 0 });
        expect(result.estimated1RM).toBe(0);
        expect(result.percentages.length).toBe(0);
      });

      it('returns empty result for zero reps', () => {
        const result = calculateOneRepMax({ ...baseInputs, reps: 0 });
        expect(result.estimated1RM).toBe(0);
      });

      it('clamps reps to maximum of 30', () => {
        const result = calculateOneRepMax({ ...baseInputs, reps: 50 });
        // Should calculate with 30 reps, not 50
        const expected = calculateOneRepMax({ ...baseInputs, reps: 30 });
        expect(result.estimated1RM).toBe(expected.estimated1RM);
      });

      it('works with lbs unit (same math, different label)', () => {
        const result = calculateOneRepMax({ ...baseInputs, unit: 'lbs', weight: 225 });
        // 225 * (1 + 5/30) = 225 * 1.1667 = 262.5
        expect(result.estimated1RM).toBeCloseTo(262.5, 1);
      });

      it('handles negative weight gracefully', () => {
        const result = calculateOneRepMax({ ...baseInputs, weight: -100 });
        expect(result.estimated1RM).toBe(0);
      });
    });
  });
});
