import { describe, it, expect } from 'vitest';
import { calculateCoffeeSpend } from '../../src/components/calculators/CoffeeSpendCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/CoffeeSpendCalculator/types';
import type { CoffeeSpendInputs } from '../../src/components/calculators/CoffeeSpendCalculator/types';

describe('CoffeeSpendCalculator', () => {
  describe('calculateCoffeeSpend', () => {
    it('should calculate default USD inputs correctly', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateCoffeeSpend(inputs);

      expect(result.dailySpend).toBe(10);
      expect(result.weeklySpend).toBe(50);
      expect(result.yearlySpend).toBe(2600);
      expect(result.homeBrewYearlyCost).toBe(260);
      expect(result.yearlySavings).toBe(2340);
    });

    it('should calculate monthly spend as yearly / 12', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateCoffeeSpend(inputs);

      const expectedMonthly = Math.round((result.yearlySpend / 12) * 100) / 100;
      expect(result.monthlySpend).toBeCloseTo(expectedMonthly, 2);
    });

    it('should handle single coffee per day', () => {
      const inputs: CoffeeSpendInputs = {
        currency: 'USD',
        coffeesPerDay: 1,
        pricePerCoffee: 5,
        homeBrewCostPerCup: 0.5,
        workDaysPerWeek: 5,
        investmentReturnRate: 7,
      };

      const result = calculateCoffeeSpend(inputs);

      expect(result.dailySpend).toBe(5);
      expect(result.weeklySpend).toBe(25);
      expect(result.yearlySpend).toBe(1300);
    });

    it('should handle 7-day coffee habit', () => {
      const inputs: CoffeeSpendInputs = {
        currency: 'USD',
        coffeesPerDay: 1,
        pricePerCoffee: 5,
        homeBrewCostPerCup: 0.5,
        workDaysPerWeek: 7,
        investmentReturnRate: 7,
      };

      const result = calculateCoffeeSpend(inputs);

      expect(result.yearlySpend).toBe(1820);
    });

    it('should compute compound growth for invested savings', () => {
      const inputs: CoffeeSpendInputs = {
        currency: 'USD',
        coffeesPerDay: 2,
        pricePerCoffee: 5,
        homeBrewCostPerCup: 0,
        workDaysPerWeek: 5,
        investmentReturnRate: 7,
      };

      const result = calculateCoffeeSpend(inputs);

      expect(result.yearlySavings).toBe(2600);

      expect(result.savingsOver10Years).toBeCloseTo(35922.76, 0);
      expect(result.savingsOver20Years).toBeGreaterThan(result.savingsOver10Years);
      expect(result.savingsOver30Years).toBeGreaterThan(result.savingsOver20Years);
    });

    it('should handle zero investment return rate', () => {
      const inputs: CoffeeSpendInputs = {
        currency: 'USD',
        coffeesPerDay: 1,
        pricePerCoffee: 5,
        homeBrewCostPerCup: 0.5,
        workDaysPerWeek: 5,
        investmentReturnRate: 0,
      };

      const result = calculateCoffeeSpend(inputs);

      expect(result.savingsOver10Years).toBeCloseTo(result.yearlySavings * 10, 2);
      expect(result.savingsOver30Years).toBeCloseTo(result.yearlySavings * 30, 2);
    });

    it('should produce fun equivalents', () => {
      const inputs = getDefaultInputs('USD');
      const result = calculateCoffeeSpend(inputs);

      expect(result.funEquivalents.length).toBeGreaterThan(0);
      const labels = result.funEquivalents.map((e) => e.label);
      expect(labels).toContain('Netflix subscriptions');
      expect(labels).toContain('flights to Europe');
      expect(labels).toContain('fancy dinners');
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs('USD');
      const result1 = calculateCoffeeSpend(inputs);
      const result2 = calculateCoffeeSpend(inputs);

      expect(result1).toEqual(result2);
    });

    it('should work with GBP currency', () => {
      const inputs = getDefaultInputs('GBP');
      const result = calculateCoffeeSpend(inputs);

      expect(result.dailySpend).toBe(8);
      expect(result.yearlySpend).toBeGreaterThan(0);
      expect(result.funEquivalents.length).toBeGreaterThan(0);
    });

    it('should work with EUR currency', () => {
      const inputs = getDefaultInputs('EUR');
      const result = calculateCoffeeSpend(inputs);

      expect(result.dailySpend).toBe(9);
      expect(result.yearlySpend).toBeGreaterThan(0);
    });
  });

  describe('getDefaultInputs', () => {
    it('should return sensible USD defaults', () => {
      const inputs = getDefaultInputs('USD');

      expect(inputs.currency).toBe('USD');
      expect(inputs.coffeesPerDay).toBe(2);
      expect(inputs.pricePerCoffee).toBe(5);
      expect(inputs.homeBrewCostPerCup).toBe(0.5);
      expect(inputs.workDaysPerWeek).toBe(5);
      expect(inputs.investmentReturnRate).toBe(7);
    });

    it('should default to USD when no currency provided', () => {
      const inputs = getDefaultInputs();

      expect(inputs.currency).toBe('USD');
    });
  });
});
