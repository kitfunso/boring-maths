/**
 * Pizza Dough Calculator - Calculation Logic
 *
 * Uses baker's percentages: flour is always 100%, every other
 * ingredient is expressed as a percentage of flour weight.
 */

import type { PizzaDoughInputs, PizzaDoughResult } from './types';
import {
  BASE_BALL_WEIGHTS,
  STYLE_WEIGHT_MULTIPLIERS,
  YEAST_MULTIPLIERS,
  DOUGH_STYLES,
} from './types';

/**
 * Calculate pizza dough ingredients using baker's percentages.
 *
 * 1. Determine target dough ball weight from size + style.
 * 2. Total dough = ballWeight * numberOfPizzas.
 * 3. Sum baker's percentages (flour 100% + hydration + salt + yeast + oil).
 * 4. Flour = totalDough / (sum / 100).
 * 5. Each ingredient = flour * its baker's %.
 */
export function calculatePizzaDough(inputs: PizzaDoughInputs): PizzaDoughResult {
  const { numberOfPizzas, pizzaSize, doughStyle, hydration, yeastType } = inputs;

  const styleInfo = DOUGH_STYLES.find((s) => s.value === doughStyle) ?? DOUGH_STYLES[1];

  // Target dough ball weight adjusted for style
  const baseBallWeight = BASE_BALL_WEIGHTS[pizzaSize];
  const doughBallWeight = Math.round(baseBallWeight * STYLE_WEIGHT_MULTIPLIERS[doughStyle]);
  const totalDoughWeight = doughBallWeight * numberOfPizzas;

  // Baker's percentages (flour = 100)
  const flourPercent = 100;
  const waterPercent = hydration;
  const saltPercent = styleInfo.saltPercent;
  const oilPercent = styleInfo.oilPercent;

  // Instant-yeast baker's % from style, then convert for chosen yeast type
  const instantYeastPercent = styleInfo.yeastPercent;
  const yeastPercent = instantYeastPercent * YEAST_MULTIPLIERS[yeastType];

  const totalPercent = flourPercent + waterPercent + saltPercent + yeastPercent + oilPercent;

  // Flour weight from total dough and summed percentages
  const flour = totalDoughWeight / (totalPercent / 100);
  const water = flour * (waterPercent / 100);
  const salt = flour * (saltPercent / 100);
  const yeast = flour * (yeastPercent / 100);
  const oil = flour * (oilPercent / 100);

  // Oven temperatures
  const ovenTempC = styleInfo.ovenTempC;
  const ovenTempF = Math.round(ovenTempC * 1.8 + 32);

  return {
    flour: round(flour),
    water: round(water),
    salt: round(salt, 1),
    yeast: round(yeast, 1),
    oil: round(oil),
    totalDoughWeight: round(totalDoughWeight),
    doughBallWeight: round(doughBallWeight),
    riseTimeHours: styleInfo.riseTimeHours,
    ovenTempC,
    ovenTempF,
  };
}

function round(value: number, decimals: number = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${grams} g`;
}
