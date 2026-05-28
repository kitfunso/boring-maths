import { describe, it, expect } from 'vitest';
import { calculateRemoteWorkSavings } from '../../src/components/calculators/RemoteWorkSavingsCalculator/calculations';
import type { RemoteWorkSavingsInputs } from '../../src/components/calculators/RemoteWorkSavingsCalculator/types';

describe('RemoteWorkSavingsCalculator', () => {
  describe('calculateRemoteWorkSavings', () => {
    it('should calculate with valid inputs', () => {
      const inputs: RemoteWorkSavingsInputs = {
        commuteType: 'car',
        commuteDistanceMiles: 20,
        commuteTimeMinutes: 30,
        officeDaysPerWeek: 5,
        weeksPerYear: 50,
        gasPricePerGallon: 3.5,
        vehicleMpg: 25,
        maintenanceCostPerMile: 0.08,
        parkingCostDaily: 10,
        tollsDaily: 0,
        transitCostDaily: 0,
        workLunchCostDaily: 15,
        homeLunchCostDaily: 8,
        workClothesBudgetMonthly: 100,
        dryCleaningMonthly: 50,
        coffeeAtWorkDaily: 5,
        hourlyRate: 35,
        includeEnvironmentalImpact: true,
        currency: 'USD',
      };

      const result = calculateRemoteWorkSavings(inputs);

      expect(result).toBeDefined();
      expect(result.annualSavings).toBeGreaterThan(0);
      expect(result.monthlySavings).toBeGreaterThan(0);
    });

    it('should produce consistent results', () => {
      const inputs: RemoteWorkSavingsInputs = {
        commuteType: 'car',
        commuteDistanceMiles: 30,
        commuteTimeMinutes: 45,
        officeDaysPerWeek: 5,
        weeksPerYear: 50,
        gasPricePerGallon: 4.0,
        vehicleMpg: 30,
        maintenanceCostPerMile: 0.08,
        parkingCostDaily: 15,
        tollsDaily: 0,
        transitCostDaily: 0,
        workLunchCostDaily: 12,
        homeLunchCostDaily: 6,
        workClothesBudgetMonthly: 150,
        dryCleaningMonthly: 75,
        coffeeAtWorkDaily: 4,
        hourlyRate: 40,
        includeEnvironmentalImpact: true,
        currency: 'USD',
      };

      const result1 = calculateRemoteWorkSavings(inputs);
      const result2 = calculateRemoteWorkSavings(inputs);

      expect(result1).toEqual(result2);
    });

    it('should produce finite outputs when numeric inputs are NaN (cleared fields)', () => {
      const inputs: RemoteWorkSavingsInputs = {
        commuteType: 'car',
        commuteDistanceMiles: NaN,
        commuteTimeMinutes: NaN,
        officeDaysPerWeek: NaN,
        weeksPerYear: NaN,
        gasPricePerGallon: NaN,
        vehicleMpg: NaN,
        maintenanceCostPerMile: NaN,
        parkingCostDaily: NaN,
        tollsDaily: NaN,
        transitCostDaily: NaN,
        workLunchCostDaily: NaN,
        homeLunchCostDaily: NaN,
        workClothesBudgetMonthly: NaN,
        dryCleaningMonthly: NaN,
        coffeeAtWorkDaily: NaN,
        hourlyRate: NaN,
        includeEnvironmentalImpact: true,
        currency: 'USD',
      };

      const result = calculateRemoteWorkSavings(inputs);

      expect(Number.isFinite(result.annualSavings)).toBe(true);
      expect(Number.isFinite(result.monthlySavings)).toBe(true);
      expect(Number.isFinite(result.effectiveRaise)).toBe(true);
      expect(Number.isFinite(result.hoursReclaimed)).toBe(true);
      expect(Number.isFinite(result.savings.totalTransportSavings)).toBe(true);
      expect(Number.isFinite(result.savings.totalLifestyleSavings)).toBe(true);
      expect(Number.isFinite(result.environmental.co2TonsSavedAnnual)).toBe(true);
      expect(Number.isFinite(result.time.valueOfTimeSaved)).toBe(true);
    });
  });
});
