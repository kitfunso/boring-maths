/**
 * ConferenceRoomCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateConferenceRoom } from '../../src/components/calculators/ConferenceRoomCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/ConferenceRoomCalculator/types';

describe('ConferenceRoomCalculator', () => {
  describe('calculateConferenceRoom', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateConferenceRoom(inputs);

      expect(result.totalSqFt).toBe(1200);
      expect(result.usableSqFt).toBe(532);
      expect(result.primaryCapacity).toBe(29);
      expect(result.primaryStyle).toBe('Classroom');
      expect(result.recommendedSetup).toBe('Classroom');
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.roomLength = 0;

      const result = calculateConferenceRoom(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalSqFt).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.roomLength = 4000;

      const result = calculateConferenceRoom(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalSqFt).toBe('number');
      expect(isFinite(result.totalSqFt)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateConferenceRoom(inputs);
      const result2 = calculateConferenceRoom(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
