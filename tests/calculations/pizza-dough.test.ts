/**
 * Pizza Dough Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculatePizzaDough } from '../../src/components/calculators/PizzaDoughCalculator/calculations';
import {
  getDefaultInputs,
  type PizzaDoughInputs,
} from '../../src/components/calculators/PizzaDoughCalculator/types';

describe('PizzaDoughCalculator', () => {
  describe('calculatePizzaDough', () => {
    it('calculates default NY style correctly', () => {
      const inputs = getDefaultInputs();
      const result = calculatePizzaDough(inputs);

      // 4 pizzas * 280g (12" NY) = 1120g total dough
      expect(result.doughBallWeight).toBe(280);
      expect(result.totalDoughWeight).toBe(1120);

      // Baker's % sum: 100 (flour) + 63 (water) + 2 (salt) + 0.5 (yeast) + 3 (oil) = 168.5
      // Flour = 1120 / 1.685 = ~664.7g
      expect(result.flour).toBeGreaterThan(660);
      expect(result.flour).toBeLessThan(670);

      // Water = flour * 0.63
      expect(result.water).toBeGreaterThan(415);
      expect(result.water).toBeLessThan(425);

      // Oil should be present for NY style
      expect(result.oil).toBeGreaterThan(0);
    });

    it('returns zero oil for Neapolitan style', () => {
      const inputs: PizzaDoughInputs = {
        numberOfPizzas: 2,
        pizzaSize: '12',
        doughStyle: 'neapolitan',
        hydration: 62,
        yeastType: 'instant',
      };

      const result = calculatePizzaDough(inputs);

      expect(result.oil).toBe(0);
      expect(result.ovenTempC).toBe(450);
    });

    it('scales linearly with number of pizzas', () => {
      const base: PizzaDoughInputs = {
        numberOfPizzas: 1,
        pizzaSize: '12',
        doughStyle: 'nyStyle',
        hydration: 63,
        yeastType: 'instant',
      };

      const single = calculatePizzaDough(base);
      const quad = calculatePizzaDough({ ...base, numberOfPizzas: 4 });

      expect(quad.totalDoughWeight).toBe(single.totalDoughWeight * 4);
      // Rounding individual results can cause small drift; allow 2g tolerance
      expect(Math.abs(quad.flour - single.flour * 4)).toBeLessThanOrEqual(2);
      expect(Math.abs(quad.water - single.water * 4)).toBeLessThanOrEqual(2);
    });

    it('adjusts dough ball weight by pizza size', () => {
      const base: PizzaDoughInputs = {
        numberOfPizzas: 1,
        pizzaSize: '10',
        doughStyle: 'nyStyle',
        hydration: 63,
        yeastType: 'instant',
      };

      const small = calculatePizzaDough({ ...base, pizzaSize: '10' });
      const large = calculatePizzaDough({ ...base, pizzaSize: '16' });

      expect(small.doughBallWeight).toBe(200);
      expect(large.doughBallWeight).toBe(480);
      expect(large.flour).toBeGreaterThan(small.flour);
    });

    it('converts yeast correctly for active dry', () => {
      const instant: PizzaDoughInputs = {
        numberOfPizzas: 4,
        pizzaSize: '12',
        doughStyle: 'nyStyle',
        hydration: 63,
        yeastType: 'instant',
      };

      const activeDry: PizzaDoughInputs = { ...instant, yeastType: 'active-dry' };

      const iResult = calculatePizzaDough(instant);
      const aResult = calculatePizzaDough(activeDry);

      // Active dry uses 1.5x instant, but flour changes slightly because
      // total baker's % changes, so check the ratio is close to 1.5
      const ratio = aResult.yeast / iResult.yeast;
      expect(ratio).toBeGreaterThan(1.4);
      expect(ratio).toBeLessThan(1.6);
    });

    it('converts yeast correctly for fresh yeast', () => {
      const instant: PizzaDoughInputs = {
        numberOfPizzas: 4,
        pizzaSize: '12',
        doughStyle: 'nyStyle',
        hydration: 63,
        yeastType: 'instant',
      };

      const fresh: PizzaDoughInputs = { ...instant, yeastType: 'fresh' };

      const iResult = calculatePizzaDough(instant);
      const fResult = calculatePizzaDough(fresh);

      // Fresh uses 3x instant
      const ratio = fResult.yeast / iResult.yeast;
      expect(ratio).toBeGreaterThan(2.8);
      expect(ratio).toBeLessThan(3.2);
    });

    it('applies style weight multipliers', () => {
      const base: PizzaDoughInputs = {
        numberOfPizzas: 1,
        pizzaSize: '12',
        doughStyle: 'nyStyle',
        hydration: 65,
        yeastType: 'instant',
      };

      const ny = calculatePizzaDough({ ...base, doughStyle: 'nyStyle' });
      const neapolitan = calculatePizzaDough({ ...base, doughStyle: 'neapolitan' });
      const detroit = calculatePizzaDough({ ...base, doughStyle: 'detroit' });

      // Neapolitan is lighter (0.85x), Detroit is heavier (1.3x)
      expect(neapolitan.doughBallWeight).toBeLessThan(ny.doughBallWeight);
      expect(detroit.doughBallWeight).toBeGreaterThan(ny.doughBallWeight);
    });

    it('produces correct oven temperatures by style', () => {
      const base: PizzaDoughInputs = {
        numberOfPizzas: 1,
        pizzaSize: '12',
        doughStyle: 'neapolitan',
        hydration: 62,
        yeastType: 'instant',
      };

      const neapolitan = calculatePizzaDough({ ...base, doughStyle: 'neapolitan' });
      const ny = calculatePizzaDough({ ...base, doughStyle: 'nyStyle' });
      const detroit = calculatePizzaDough({ ...base, doughStyle: 'detroit' });
      const pan = calculatePizzaDough({ ...base, doughStyle: 'pan' });

      expect(neapolitan.ovenTempC).toBe(450);
      expect(ny.ovenTempC).toBe(260);
      expect(detroit.ovenTempC).toBe(250);
      expect(pan.ovenTempC).toBe(230);

      // Verify F conversion: C * 1.8 + 32
      expect(neapolitan.ovenTempF).toBe(842);
      expect(ny.ovenTempF).toBe(500);
    });

    it('ingredients sum to approximately total dough weight', () => {
      const inputs = getDefaultInputs();
      const result = calculatePizzaDough(inputs);

      const ingredientSum = result.flour + result.water + result.salt + result.yeast + result.oil;

      // Allow small rounding tolerance
      expect(Math.abs(ingredientSum - result.totalDoughWeight)).toBeLessThan(5);
    });

    it('handles minimum values (1 pizza, 10", low hydration)', () => {
      const inputs: PizzaDoughInputs = {
        numberOfPizzas: 1,
        pizzaSize: '10',
        doughStyle: 'neapolitan',
        hydration: 55,
        yeastType: 'instant',
      };

      const result = calculatePizzaDough(inputs);

      expect(result.flour).toBeGreaterThan(0);
      expect(result.water).toBeGreaterThan(0);
      expect(result.salt).toBeGreaterThan(0);
      expect(result.yeast).toBeGreaterThan(0);
      expect(result.totalDoughWeight).toBeGreaterThan(0);
    });

    it('handles maximum values (20 pizzas, 16", high hydration)', () => {
      const inputs: PizzaDoughInputs = {
        numberOfPizzas: 20,
        pizzaSize: '16',
        doughStyle: 'detroit',
        hydration: 80,
        yeastType: 'fresh',
      };

      const result = calculatePizzaDough(inputs);

      expect(result.totalDoughWeight).toBe(20 * Math.round(480 * 1.3));
      expect(result.flour).toBeGreaterThan(0);
      expect(result.water).toBeGreaterThan(0);
    });
  });
});
