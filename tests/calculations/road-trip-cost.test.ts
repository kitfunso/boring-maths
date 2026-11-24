import { describe, it, expect } from 'vitest';
import { calculateRoadTripCost } from '../../src/components/calculators/RoadTripCostCalculator/calculations';
import type { RoadTripInputs } from '../../src/components/calculators/RoadTripCostCalculator/types';

function makeInputs(overrides: Partial<RoadTripInputs> = {}): RoadTripInputs {
  return {
    currency: 'USD',
    totalDistance: 500,
    unit: 'miles',
    fuelEconomy: 25,
    fuelUnit: 'mpg',
    fuelPrice: 3.5,
    passengers: 2,
    tolls: 0,
    foodBudgetPerDay: 50,
    hotelPerNight: 100,
    tripDays: 3,
    ...overrides,
  };
}

describe('RoadTripCostCalculator', () => {
  describe('calculateRoadTripCost', () => {
    it('calculates fuel cost correctly for MPG', () => {
      const inputs = makeInputs({ tolls: 0, foodBudgetPerDay: 0, hotelPerNight: 0 });
      const result = calculateRoadTripCost(inputs);

      expect(result.totalFuelCost).toBe(70);
      expect(result.fuelVolume).toBe(20);
      expect(result.fuelVolumeLabel).toBe('gal');
    });

    it('calculates fuel cost correctly for L/100km', () => {
      const inputs = makeInputs({
        totalDistance: 800,
        unit: 'km',
        fuelEconomy: 8,
        fuelUnit: 'l100km',
        fuelPrice: 1.8,
        foodBudgetPerDay: 0,
        hotelPerNight: 0,
      });
      const result = calculateRoadTripCost(inputs);

      expect(result.totalFuelCost).toBe(115.2);
      expect(result.fuelVolume).toBe(64);
      expect(result.fuelVolumeLabel).toBe('L');
    });

    it('calculates fuel cost correctly for km/L', () => {
      const inputs = makeInputs({
        totalDistance: 800,
        unit: 'km',
        fuelEconomy: 12.5,
        fuelUnit: 'kmpl',
        fuelPrice: 1.8,
        foodBudgetPerDay: 0,
        hotelPerNight: 0,
      });
      const result = calculateRoadTripCost(inputs);

      expect(result.totalFuelCost).toBe(115.2);
      expect(result.fuelVolume).toBe(64);
    });

    it('calculates total trip cost with all expenses', () => {
      const inputs = makeInputs();
      const result = calculateRoadTripCost(inputs);

      expect(result.totalFuelCost).toBe(70);
      expect(result.totalFoodCost).toBe(300);
      expect(result.totalHotelCost).toBe(200);
      expect(result.totalTripCost).toBe(570);
    });

    it('calculates cost per person correctly', () => {
      const inputs = makeInputs();
      const result = calculateRoadTripCost(inputs);

      expect(result.costPerPerson).toBe(285);
    });

    it('handles single passenger', () => {
      const inputs = makeInputs({ passengers: 1 });
      const result = calculateRoadTripCost(inputs);

      expect(result.totalFoodCost).toBe(150);
      expect(result.totalTripCost).toBe(420);
      expect(result.costPerPerson).toBe(420);
    });

    it('includes tolls in total', () => {
      const inputs = makeInputs({ tolls: 35 });
      const result = calculateRoadTripCost(inputs);

      expect(result.totalTripCost).toBe(605);
    });

    it('calculates daily cost correctly', () => {
      const inputs = makeInputs();
      const result = calculateRoadTripCost(inputs);

      expect(result.dailyCost).toBe(190);
    });

    it('calculates cost per mile correctly', () => {
      const inputs = makeInputs();
      const result = calculateRoadTripCost(inputs);

      expect(result.costPerMile).toBe(1.14);
      expect(result.costPerMileLabel).toBe('/mi');
    });

    it('uses /km label for metric distances', () => {
      const inputs = makeInputs({
        totalDistance: 800,
        unit: 'km',
        fuelEconomy: 8,
        fuelUnit: 'l100km',
        fuelPrice: 1.8,
      });
      const result = calculateRoadTripCost(inputs);

      expect(result.costPerMileLabel).toBe('/km');
    });

    it('calculates CO2 emissions for MPG', () => {
      const inputs = makeInputs({
        foodBudgetPerDay: 0,
        hotelPerNight: 0,
      });
      const result = calculateRoadTripCost(inputs);

      expect(result.co2Emissions).toBeGreaterThan(177);
      expect(result.co2Emissions).toBeLessThan(178);
    });

    it('calculates tree offset correctly', () => {
      const inputs = makeInputs({
        foodBudgetPerDay: 0,
        hotelPerNight: 0,
      });
      const result = calculateRoadTripCost(inputs);

      expect(result.treesNeeded).toBe(9);
    });

    it('provides flight cost comparison', () => {
      const inputs = makeInputs();
      const result = calculateRoadTripCost(inputs);

      expect(result.comparisonToFlying).toBe(280);
    });

    it('handles zero distance gracefully', () => {
      const inputs = makeInputs({ totalDistance: 0 });
      const result = calculateRoadTripCost(inputs);

      expect(result.totalFuelCost).toBe(0);
      expect(result.costPerMile).toBe(0);
      expect(result.co2Emissions).toBe(0);
    });

    it('handles zero fuel economy gracefully', () => {
      const inputs = makeInputs({ fuelEconomy: 0 });
      const result = calculateRoadTripCost(inputs);

      expect(result.totalFuelCost).toBe(0);
      expect(result.fuelVolume).toBe(0);
    });

    it('calculates hotel for days minus 1 nights', () => {
      const inputs = makeInputs({
        tripDays: 5,
        hotelPerNight: 100,
        foodBudgetPerDay: 0,
        tolls: 0,
      });
      const result = calculateRoadTripCost(inputs);

      expect(result.totalHotelCost).toBe(400);
    });

    it('handles GBP currency defaults', () => {
      const inputs = makeInputs({ currency: 'GBP' });
      const result = calculateRoadTripCost(inputs);

      expect(result.totalTripCost).toBeGreaterThan(0);
      expect(result.comparisonToFlying).toBeGreaterThan(0);
    });

    it('scales food cost by passenger count', () => {
      const twoPassengers = calculateRoadTripCost(makeInputs({ passengers: 2 }));
      const fourPassengers = calculateRoadTripCost(makeInputs({ passengers: 4 }));

      expect(fourPassengers.totalFoodCost).toBe(twoPassengers.totalFoodCost * 2);
    });
  });
});
