import { describe, it, expect } from 'vitest';
import { calculateConferenceRoom } from '../../src/components/calculators/ConferenceRoomCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/ConferenceRoomCalculator/types';

describe('ConferenceRoomCalculator', () => {
  describe('calculateConferenceRoom', () => {
    it('caps seats at what the table grid holds', () => {
      const classroom = calculateConferenceRoom({ ...getDefaultInputs(), roomLength: 50 });
      expect(classroom.primaryCapacity).toBe(28);
      expect(classroom.layoutInfo.tableCount).toBe(14);

      const banquet = calculateConferenceRoom({ ...getDefaultInputs(), seatingStyle: 'banquet' });
      expect(banquet.primaryCapacity).toBe(48);
      expect(banquet.layoutInfo.tableCount).toBe(6);
      expect(banquet.capacitiesByStyle.find((c) => c.style === 'Banquet')?.capacity).toBe(48);
    });

    it('gives zero, not negative, tables for a room smaller than its clearances', () => {
      const r = calculateConferenceRoom({
        ...getDefaultInputs(),
        seatingStyle: 'cocktail',
        roomLength: 8,
        roomWidth: 8,
      });
      expect(r.primaryCapacity).toBe(0);
      expect(r.layoutInfo.tableCount).toBe(0);
      expect(r.capacitiesByStyle.every((c) => c.capacity === 0)).toBe(true);
    });

    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateConferenceRoom(inputs);

      expect(result.totalSqFt).toBe(1200);
      expect(result.usableSqFt).toBe(532);
      expect(result.primaryCapacity).toBe(20);
      expect(result.primaryStyle).toBe('Classroom');
      expect(result.recommendedSetup).toBe('U-Shape or Hollow Square');
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
