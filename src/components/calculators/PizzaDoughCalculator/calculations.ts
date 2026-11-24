import type { PizzaDoughInputs, PizzaDoughResult } from './types';
import {
  BASE_BALL_WEIGHTS,
  STYLE_WEIGHT_MULTIPLIERS,
  YEAST_MULTIPLIERS,
  DOUGH_STYLES,
} from './types';

export function calculatePizzaDough(inputs: PizzaDoughInputs): PizzaDoughResult {
  const { numberOfPizzas, pizzaSize, doughStyle, hydration, yeastType } = inputs;

  const styleInfo = DOUGH_STYLES.find((s) => s.value === doughStyle) ?? DOUGH_STYLES[1];

  const baseBallWeight = BASE_BALL_WEIGHTS[pizzaSize];
  const doughBallWeight = Math.round(baseBallWeight * STYLE_WEIGHT_MULTIPLIERS[doughStyle]);
  const totalDoughWeight = doughBallWeight * numberOfPizzas;

  const flourPercent = 100;
  const waterPercent = hydration;
  const saltPercent = styleInfo.saltPercent;
  const oilPercent = styleInfo.oilPercent;

  const instantYeastPercent = styleInfo.yeastPercent;
  const yeastPercent = instantYeastPercent * YEAST_MULTIPLIERS[yeastType];

  const totalPercent = flourPercent + waterPercent + saltPercent + yeastPercent + oilPercent;

  const flour = totalDoughWeight / (totalPercent / 100);
  const water = flour * (waterPercent / 100);
  const salt = flour * (saltPercent / 100);
  const yeast = flour * (yeastPercent / 100);
  const oil = flour * (oilPercent / 100);

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
