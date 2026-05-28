/**
 * DueDateCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateDueDate } from '../../src/components/calculators/DueDateCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/DueDateCalculator/types';

describe('DueDateCalculator', () => {
  describe('NaN-safety', () => {
    it('should yield finite outputs when numeric inputs are NaN (cleared/partial input)', () => {
      const inputs = {
        ...getDefaultInputs(),
        method: 'lmp' as const,
        cycleLength: NaN,
      };

      const result = calculateDueDate(inputs);

      expect(result.dueDateFormatted).not.toBe('Invalid Date');
      expect(Number.isFinite(result.percentComplete)).toBe(true);
      expect(Number.isFinite(result.daysUntilDue)).toBe(true);
      expect(Number.isFinite(result.daysPregnant)).toBe(true);
      expect(Number.isFinite(result.currentWeeks)).toBe(true);
      expect(Number.isFinite(result.currentDays)).toBe(true);
    });

    it('should yield a valid due date when ultrasound numeric inputs are NaN', () => {
      const inputs = {
        ...getDefaultInputs(),
        method: 'ultrasound' as const,
        ultrasoundDate: '2026-01-01',
        ultrasoundWeeks: NaN,
        ultrasoundDays: NaN,
      };

      const result = calculateDueDate(inputs);

      expect(result.dueDateFormatted).not.toBe('Invalid Date');
      expect(Number.isFinite(result.percentComplete)).toBe(true);
    });
  });
});
