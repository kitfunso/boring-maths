import { describe, it, expect } from 'vitest';
import { calculateRemoteWorkSavings } from '../../src/components/calculators/RemoteWorkSavingsCalculator/calculations';
import type { RemoteWorkInputs } from '../../src/components/calculators/RemoteWorkSavingsCalculator/types';

describe('RemoteWorkSavingsCalculator', () => {
  describe('calculateRemoteWorkSavings', () => {
    it('should calculate with valid inputs', () => {
      const inputs: RemoteWorkInputs = {
        daysInOfficePerWeek: 3,
        commuteMiles: 20,
        roundTrip: true,
        gasPricePerGallon: 3.5,
        carMPG: 25,
        parkingCostPerDay: 10,
        publicTransitCostPerDay: 0,
        lunchCostOffice: 15,
        lunchCostHome: 8,
        coffeeCostOffice: 5,
        coffeeCostHome: 1,
        workWearCostPerMonth: 100,
        dryCleaningPerMonth: 50,
        weeksPerYear: 50,
      };

      const result = calculateRemoteWorkSavings(inputs);

      expect(result).toBeDefined();
      expect(result.annualSavings).toBeGreaterThan(0);
      expect(result.monthlySavings).toBeGreaterThan(0);
    });

    it('should produce consistent results', () => {
      const inputs: RemoteWorkInputs = {
        daysInOfficePerWeek: 5,
        commuteMiles: 30,
        roundTrip: true,
        gasPricePerGallon: 4.0,
        carMPG: 30,
        parkingCostPerDay: 15,
        publicTransitCostPerDay: 0,
        lunchCostOffice: 12,
        lunchCostHome: 6,
        coffeeCostOffice: 4,
        coffeeCostHome: 1,
        workWearCostPerMonth: 150,
        dryCleaningPerMonth: 75,
        weeksPerYear: 50,
      };

      const result1 = calculateRemoteWorkSavings(inputs);
      const result2 = calculateRemoteWorkSavings(inputs);

      expect(result1).toEqual(result2);
    });
  });
});