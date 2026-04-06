/**
 * Pizza Dough Calculator - Type Definitions
 */

export type PizzaSize = '10' | '12' | '14' | '16';

export type DoughStyle = 'neapolitan' | 'nyStyle' | 'detroit' | 'pan';

export type YeastType = 'fresh' | 'active-dry' | 'instant';

export interface PizzaDoughInputs {
  numberOfPizzas: number;
  pizzaSize: PizzaSize;
  doughStyle: DoughStyle;
  hydration: number;
  yeastType: YeastType;
}

export interface PizzaDoughResult {
  flour: number;
  water: number;
  salt: number;
  yeast: number;
  oil: number;
  totalDoughWeight: number;
  doughBallWeight: number;
  riseTimeHours: number;
  ovenTempC: number;
  ovenTempF: number;
}

export interface DoughStyleInfo {
  readonly value: DoughStyle;
  readonly label: string;
  readonly description: string;
  readonly hydrationRange: readonly [number, number];
  readonly oilPercent: number;
  readonly saltPercent: number;
  readonly yeastPercent: number;
  readonly ovenTempC: number;
  readonly riseTimeHours: number;
}

export const DOUGH_STYLES: readonly DoughStyleInfo[] = [
  {
    value: 'neapolitan',
    label: 'Neapolitan',
    description: 'Traditional Italian, thin and charred, no oil',
    hydrationRange: [60, 65],
    oilPercent: 0,
    saltPercent: 2.5,
    yeastPercent: 0.1,
    ovenTempC: 450,
    riseTimeHours: 24,
  },
  {
    value: 'nyStyle',
    label: 'New York Style',
    description: 'Hand-tossed, foldable, olive oil in dough',
    hydrationRange: [62, 66],
    oilPercent: 3,
    saltPercent: 2,
    yeastPercent: 0.5,
    ovenTempC: 260,
    riseTimeHours: 24,
  },
  {
    value: 'detroit',
    label: 'Detroit Style',
    description: 'Thick, airy, crispy edges, pan-baked',
    hydrationRange: [70, 75],
    oilPercent: 4,
    saltPercent: 2,
    yeastPercent: 0.7,
    ovenTempC: 250,
    riseTimeHours: 2,
  },
  {
    value: 'pan',
    label: 'Pan Pizza',
    description: 'Deep dish style, buttery crust, heavy oil',
    hydrationRange: [65, 70],
    oilPercent: 6,
    saltPercent: 2,
    yeastPercent: 0.8,
    ovenTempC: 230,
    riseTimeHours: 1.5,
  },
];

/** Base dough ball weight in grams for NY style by pizza size. */
export const BASE_BALL_WEIGHTS: Readonly<Record<PizzaSize, number>> = {
  '10': 200,
  '12': 280,
  '14': 370,
  '16': 480,
};

/** Multiplier applied to base ball weight per style. */
export const STYLE_WEIGHT_MULTIPLIERS: Readonly<Record<DoughStyle, number>> = {
  neapolitan: 0.85,
  nyStyle: 1.0,
  detroit: 1.3,
  pan: 1.2,
};

/** Yeast conversion factors relative to instant yeast. */
export const YEAST_MULTIPLIERS: Readonly<Record<YeastType, number>> = {
  instant: 1,
  'active-dry': 1.5,
  fresh: 3,
};

export function getDefaultInputs(): PizzaDoughInputs {
  return {
    numberOfPizzas: 4,
    pizzaSize: '12',
    doughStyle: 'nyStyle',
    hydration: 63,
    yeastType: 'instant',
  };
}
