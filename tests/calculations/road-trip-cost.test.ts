/**
 * Road Trip Cost Calculator - Unit Tests
 */

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

      // 500 miles / 25 mpg = 20 gallons * $3.50 = $70
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

      // 800 km / 100 * 8 L/100km = 64 liters * 1.80 = $115.20
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

      // 800 km / 12.5 km/L = 64 liters * 1.80 = $115.20
      expect(result.totalFuelCost).toBe(115.2);
      expect(result.fuelVolume).toBe(64);
    });

    it('calculates total trip cost with all expenses', () => {
      const inputs = makeInputs();
      const result = calculateRoadTripCost(inputs);

      // Fuel: 500/25 * 3.50 = $70
      // Food: $50/day * 3 days * 2 passengers = $300
      // Hotel: $100/night * 2 nights = $200
      // Tolls: $0
      // Total: $570
      expect(result.totalFuelCost).toBe(70);
      expect(result.totalFoodCost).toBe(300);
      expect(result.totalHotelCost).toBe(200);
      expect(result.totalTripCost).toBe(570);
    });

    it('calculates cost per person correctly', () => {
      const inputs = makeInputs();
      const result = calculateRoadTripCost(inputs);

      // Total: $570 / 2 passengers = $285
      expect(result.costPerPerson).toBe(285);
    });

    it('handles single passenger', () => {
      const inputs = makeInputs({ passengers: 1 });
      const result = calculateRoadTripCost(inputs);

      // Food for 1: $50 * 3 = $150
      // Total: 70 + 150 + 200 + 0 = $420
      expect(result.totalFoodCost).toBe(150);
      expect(result.totalTripCost).toBe(420);
      expect(result.costPerPerson).toBe(420);
    });

    it('includes tolls in total', () => {
      const inputs = makeInputs({ tolls: 35 });
      const result = calculateRoadTripCost(inputs);

      // 70 + 300 + 200 + 35 = $605
      expect(result.totalTripCost).toBe(605);
    });

    it('calculates daily cost correctly', () => {
      const inputs = makeInputs();
      const result = calculateRoadTripCost(inputs);

      // $570 / 3 days = $190
      expect(result.dailyCost).toBe(190);
    });

    it('calculates cost per mile correctly', () => {
      const inputs = makeInputs();
      const result = calculateRoadTripCost(inputs);

      // $570 / 500 miles = $1.14/mi
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

      // 20 gallons * 8.887 kg/gal = 177.74 kg
      expect(result.co2Emissions).toBeGreaterThan(177);
      expect(result.co2Emissions).toBeLessThan(178);
    });

    it('calculates tree offset correctly', () => {
      const inputs = makeInputs({
        foodBudgetPerDay: 0,
        hotelPerNight: 0,
      });
      const result = calculateRoadTripCost(inputs);

      // ~177.74 kg / 22 kg/tree = ~8.08, ceil to 9
      expect(result.treesNeeded).toBe(9);
    });

    it('provides flight cost comparison', () => {
      const inputs = makeInputs();
      const result = calculateRoadTripCost(inputs);

      // Flight: ($80 base + 500 * $0.12) * 2 = ($80 + $60) * 2 = $280
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

      // 4 nights * $100 = $400
      expect(result.totalHotelCost).toBe(400);
    });

    it('handles GBP currency defaults', () => {
      const inputs = makeInputs({ currency: 'GBP' });
      const result = calculateRoadTripCost(inputs);

      // Should still calculate correctly with GBP
      expect(result.totalTripCost).toBeGreaterThan(0);
      expect(result.comparisonToFlying).toBeGreaterThan(0);
    });

    it('scales food cost by passenger count', () => {
      const twoPassengers = calculateRoadTripCost(makeInputs({ passengers: 2 }));
      const fourPassengers = calculateRoadTripCost(makeInputs({ passengers: 4 }));

      // Food doubles with double passengers
      expect(fourPassengers.totalFoodCost).toBe(twoPassengers.totalFoodCost * 2);
    });
  });
});
