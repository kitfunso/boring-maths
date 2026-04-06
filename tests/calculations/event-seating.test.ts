/**
 * EventSeatingCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateEventSeating } from '../../src/components/calculators/EventSeatingCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/EventSeatingCalculator/types';

describe('EventSeatingCalculator', () => {
  describe('calculateEventSeating', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateEventSeating(inputs);

      expect(result.tablesNeeded).toBe(12);
      expect(result.seatsPerTable).toBe(8);
      expect(result.totalSeats).toBe(104);
      expect(result.extraSeats).toBe(4);
      expect(result.totalRoomSqFt).toBe(2262);
      expect(result.minimumRoomLength).toBe(55);
      expect(result.minimumRoomWidth).toBe(42);
      expect(result.seatingAreaSqFt).toBe(1375);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.guestCount = 0;

      const result = calculateEventSeating(inputs);

      expect(result).toBeDefined();
      expect(typeof result.tablesNeeded).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.guestCount = 10000;

      const result = calculateEventSeating(inputs);

      expect(result).toBeDefined();
      expect(typeof result.tablesNeeded).toBe('number');
      expect(isFinite(result.tablesNeeded)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateEventSeating(inputs);
      const result2 = calculateEventSeating(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
