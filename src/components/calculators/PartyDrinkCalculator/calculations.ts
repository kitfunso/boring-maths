/**
 * Party Drink Calculator (Non-Alcoholic) - Calculation Logic
 *
 * Pure functions for calculating non-alcoholic drink quantities for parties.
 * Accounts for weather, event type, and guest demographics.
 */

import type { Currency } from '../../../lib/regions';
import type {
  PartyDrinkInputs,
  PartyDrinkResult,
  DrinkQuantity,
  IceRequirements,
  WeatherCondition,
  EventType,
} from './types';
import { DRINKS_PER_HOUR, CHILD_DRINK_MULTIPLIER } from './types';

/**
 * Base drink prices by currency (approximate retail)
 */
const DRINK_PRICES: Record<Currency, Record<string, number>> = {
  USD: {
    soda_2liter: 2.5,
    soda_12pack: 6.0,
    juice_gallon: 4.5,
    juice_boxes_10pack: 5.0,
    water_case_24: 5.0,
    sparkling_water_12pack: 8.0,
    coffee_ground_lb: 8.0,
    tea_box: 4.0,
    punch_mix: 3.5,
    ice_bag: 3.0,
    cups_50pack: 4.0,
    napkins_200pack: 3.5,
    straws_100pack: 3.0,
  },
  GBP: {
    soda_2liter: 1.8,
    soda_12pack: 5.0,
    juice_gallon: 3.5,
    juice_boxes_10pack: 4.0,
    water_case_24: 4.0,
    sparkling_water_12pack: 6.5,
    coffee_ground_lb: 6.0,
    tea_box: 3.0,
    punch_mix: 2.8,
    ice_bag: 2.5,
    cups_50pack: 3.0,
    napkins_200pack: 2.5,
    straws_100pack: 2.5,
  },
  EUR: {
    soda_2liter: 2.0,
    soda_12pack: 5.5,
    juice_gallon: 4.0,
    juice_boxes_10pack: 4.5,
    water_case_24: 4.5,
    sparkling_water_12pack: 7.0,
    coffee_ground_lb: 7.0,
    tea_box: 3.5,
    punch_mix: 3.0,
    ice_bag: 2.8,
    cups_50pack: 3.5,
    napkins_200pack: 3.0,
    straws_100pack: 2.8,
  },
};

/**
 * Drink preference ratios by event type
 */
const EVENT_DRINK_RATIOS: Record<EventType, Record<string, number>> = {
  kids_party: {
    soft_drinks: 0.25,
    juice: 0.45,
    water: 0.15,
    hot: 0.0,
    punch: 0.15,
  },
  family_gathering: {
    soft_drinks: 0.3,
    juice: 0.25,
    water: 0.25,
    hot: 0.05,
    punch: 0.15,
  },
  adult_casual: {
    soft_drinks: 0.4,
    juice: 0.15,
    water: 0.35,
    hot: 0.05,
    punch: 0.05,
  },
  formal: {
    soft_drinks: 0.15,
    juice: 0.2,
    water: 0.4,
    hot: 0.1,
    punch: 0.15,
  },
};

/**
 * Weather adjustments to drink ratios
 */
const WEATHER_RATIO_ADJUSTMENTS: Record<WeatherCondition, Record<string, number>> = {
  cold: {
    soft_drinks: -0.1,
    juice: 0,
    water: -0.1,
    hot: 0.25,
    punch: -0.05,
  },
  mild: {
    soft_drinks: 0,
    juice: 0,
    water: 0,
    hot: 0,
    punch: 0,
  },
  warm: {
    soft_drinks: 0.05,
    juice: 0,
    water: 0.1,
    hot: -0.05,
    punch: 0,
  },
  hot: {
    soft_drinks: 0.05,
    juice: -0.05,
    water: 0.2,
    hot: -0.1,
    punch: 0,
  },
};

/**
 * Calculate total drinks needed
 */
function calculateTotalDrinks(inputs: PartyDrinkInputs): number {
  const { guestCount, childrenCount, eventDuration, weather } = inputs;

  const adultCount = guestCount - childrenCount;
  const drinksPerHour = DRINKS_PER_HOUR[weather];

  // Adults drink at full rate, children at reduced rate
  const adultDrinks = adultCount * drinksPerHour * eventDuration;
  const childDrinks = childrenCount * drinksPerHour * CHILD_DRINK_MULTIPLIER * eventDuration;

  // Add 15% buffer
  const totalDrinks = (adultDrinks + childDrinks) * 1.15;

  return Math.ceil(totalDrinks);
}

/**
 * Get adjusted drink ratios based on event type and weather
 */
function getAdjustedRatios(
  eventType: EventType,
  weather: WeatherCondition,
  includedCategories: string[]
): Record<string, number> {
  const baseRatios = { ...EVENT_DRINK_RATIOS[eventType] };
  const adjustments = WEATHER_RATIO_ADJUSTMENTS[weather];

  // Apply weather adjustments
  for (const category in baseRatios) {
    baseRatios[category] = Math.max(0, baseRatios[category] + (adjustments[category] || 0));
  }

  // Zero out excluded categories
  for (const category in baseRatios) {
    if (!includedCategories.includes(category)) {
      baseRatios[category] = 0;
    }
  }

  // Normalize to 100%
  const total = Object.values(baseRatios).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    for (const category in baseRatios) {
      baseRatios[category] = baseRatios[category] / total;
    }
  }

  return baseRatios;
}

/**
 * Calculate soft drink quantities
 */
function calculateSoftDrinks(
  servingsNeeded: number,
  currency: Currency,
  hasKids: boolean
): DrinkQuantity[] {
  const prices = DRINK_PRICES[currency];
  const drinks: DrinkQuantity[] = [];

  // 2-liter bottles provide about 8 servings
  const twoLiterServings = 8;
  // 12-pack cans provide 12 servings
  const canServings = 12;

  if (hasKids) {
    // Mix of bottles and cans for variety
    const canPortionServings = Math.ceil(servingsNeeded * 0.4);
    const bottlePortionServings = servingsNeeded - canPortionServings;

    const cansNeeded = Math.ceil(canPortionServings / canServings);
    const bottlesNeeded = Math.ceil(bottlePortionServings / twoLiterServings);

    drinks.push({
      name: 'Soda (2-liter bottles)',
      category: 'soft_drinks',
      quantity: bottlesNeeded,
      unit: 'bottles',
      servings: bottlesNeeded * twoLiterServings,
      estimatedCost: bottlesNeeded * prices.soda_2liter,
    });

    if (cansNeeded > 0) {
      drinks.push({
        name: 'Soda (12-pack cans)',
        category: 'soft_drinks',
        quantity: cansNeeded,
        unit: 'packs',
        servings: cansNeeded * canServings,
        estimatedCost: cansNeeded * prices.soda_12pack,
      });
    }
  } else {
    // Primarily 2-liter bottles for adults
    const bottlesNeeded = Math.ceil(servingsNeeded / twoLiterServings);
    drinks.push({
      name: 'Soda (2-liter bottles)',
      category: 'soft_drinks',
      quantity: bottlesNeeded,
      unit: 'bottles',
      servings: bottlesNeeded * twoLiterServings,
      estimatedCost: bottlesNeeded * prices.soda_2liter,
    });
  }

  return drinks;
}

/**
 * Calculate juice quantities
 */
function calculateJuice(
  servingsNeeded: number,
  currency: Currency,
  childrenCount: number
): DrinkQuantity[] {
  const prices = DRINK_PRICES[currency];
  const drinks: DrinkQuantity[] = [];

  // Gallon provides about 16 servings (8oz each)
  const gallonServings = 16;
  // Juice box pack (10 count)
  const juiceBoxServings = 10;

  // If many kids, include juice boxes
  if (childrenCount > 3) {
    const juiceBoxPortionServings = Math.min(childrenCount * 2, Math.ceil(servingsNeeded * 0.4));
    const gallonPortionServings = servingsNeeded - juiceBoxPortionServings;

    const juiceBoxPacks = Math.ceil(juiceBoxPortionServings / juiceBoxServings);
    const gallonsNeeded = Math.ceil(gallonPortionServings / gallonServings);

    if (gallonsNeeded > 0) {
      drinks.push({
        name: 'Juice (gallons)',
        category: 'juice',
        quantity: gallonsNeeded,
        unit: 'gallons',
        servings: gallonsNeeded * gallonServings,
        estimatedCost: gallonsNeeded * prices.juice_gallon,
      });
    }

    if (juiceBoxPacks > 0) {
      drinks.push({
        name: 'Juice Boxes (10-pack)',
        category: 'juice',
        quantity: juiceBoxPacks,
        unit: 'packs',
        servings: juiceBoxPacks * juiceBoxServings,
        estimatedCost: juiceBoxPacks * prices.juice_boxes_10pack,
      });
    }
  } else {
    const gallonsNeeded = Math.ceil(servingsNeeded / gallonServings);
    drinks.push({
      name: 'Juice (gallons)',
      category: 'juice',
      quantity: gallonsNeeded,
      unit: 'gallons',
      servings: gallonsNeeded * gallonServings,
      estimatedCost: gallonsNeeded * prices.juice_gallon,
    });
  }

  return drinks;
}

/**
 * Calculate water quantities
 */
function calculateWater(
  servingsNeeded: number,
  currency: Currency,
  eventType: EventType
): DrinkQuantity[] {
  const prices = DRINK_PRICES[currency];
  const drinks: DrinkQuantity[] = [];

  // Case of 24 bottles
  const caseServings = 24;
  // 12-pack sparkling
  const sparklingServings = 12;

  // Formal events get more sparkling water
  if (eventType === 'formal') {
    const sparklingPortion = Math.ceil(servingsNeeded * 0.4);
    const stillPortion = servingsNeeded - sparklingPortion;

    const sparklingPacks = Math.ceil(sparklingPortion / sparklingServings);
    const stillCases = Math.ceil(stillPortion / caseServings);

    drinks.push({
      name: 'Bottled Water (24-pack)',
      category: 'water',
      quantity: stillCases,
      unit: 'cases',
      servings: stillCases * caseServings,
      estimatedCost: stillCases * prices.water_case_24,
    });

    if (sparklingPacks > 0) {
      drinks.push({
        name: 'Sparkling Water (12-pack)',
        category: 'water',
        quantity: sparklingPacks,
        unit: 'packs',
        servings: sparklingPacks * sparklingServings,
        estimatedCost: sparklingPacks * prices.sparkling_water_12pack,
      });
    }
  } else {
    const casesNeeded = Math.ceil(servingsNeeded / caseServings);
    drinks.push({
      name: 'Bottled Water (24-pack)',
      category: 'water',
      quantity: casesNeeded,
      unit: 'cases',
      servings: casesNeeded * caseServings,
      estimatedCost: casesNeeded * prices.water_case_24,
    });
  }

  return drinks;
}

/**
 * Calculate hot beverage quantities
 */
function calculateHotBeverages(servingsNeeded: number, currency: Currency): DrinkQuantity[] {
  const prices = DRINK_PRICES[currency];
  const drinks: DrinkQuantity[] = [];

  // 1 lb coffee makes about 48 cups
  const coffeeServingsPerLb = 48;
  // Tea box (20 bags)
  const teaServingsPerBox = 20;

  // Split 60/40 between coffee and tea
  const coffeeServings = Math.ceil(servingsNeeded * 0.6);
  const teaServings = servingsNeeded - coffeeServings;

  const coffeeLbs = Math.ceil(coffeeServings / coffeeServingsPerLb);
  const teaBoxes = Math.ceil(teaServings / teaServingsPerBox);

  drinks.push({
    name: 'Ground Coffee',
    category: 'hot',
    quantity: coffeeLbs,
    unit: 'lbs',
    servings: coffeeLbs * coffeeServingsPerLb,
    estimatedCost: coffeeLbs * prices.coffee_ground_lb,
  });

  if (teaBoxes > 0) {
    drinks.push({
      name: 'Tea (20-count box)',
      category: 'hot',
      quantity: teaBoxes,
      unit: 'boxes',
      servings: teaBoxes * teaServingsPerBox,
      estimatedCost: teaBoxes * prices.tea_box,
    });
  }

  return drinks;
}

/**
 * Calculate punch/lemonade quantities
 */
function calculatePunch(servingsNeeded: number, currency: Currency): DrinkQuantity[] {
  const prices = DRINK_PRICES[currency];

  // One punch mix makes about 32 servings (2 gallons)
  const servingsPerMix = 32;
  const mixesNeeded = Math.ceil(servingsNeeded / servingsPerMix);

  return [
    {
      name: 'Punch/Lemonade Mix',
      category: 'punch',
      quantity: mixesNeeded,
      unit: 'packages',
      servings: mixesNeeded * servingsPerMix,
      estimatedCost: mixesNeeded * prices.punch_mix,
    },
  ];
}

/**
 * Calculate ice requirements
 */
function calculateIce(
  totalServings: number,
  weather: WeatherCondition,
  eventDuration: number,
  currency: Currency
): IceRequirements {
  const prices = DRINK_PRICES[currency];

  // Base: 1 lb ice per 2 servings
  let poundsPerServing = 0.5;

  // Adjust for weather
  const weatherMultipliers: Record<WeatherCondition, number> = {
    cold: 0.5,
    mild: 1.0,
    warm: 1.3,
    hot: 1.8,
  };

  poundsPerServing *= weatherMultipliers[weather];

  // Longer events need more ice (melting)
  const durationMultiplier = 1 + (eventDuration - 2) * 0.1;

  const poundsNeeded = Math.ceil(totalServings * poundsPerServing * durationMultiplier);
  const bagsNeeded = Math.ceil(poundsNeeded / 10); // 10 lb bags

  return {
    poundsNeeded,
    bagsNeeded,
    estimatedCost: bagsNeeded * prices.ice_bag,
  };
}

/**
 * Calculate party drink quantities
 */
export function calculatePartyDrinks(inputs: PartyDrinkInputs): PartyDrinkResult {
  const {
    currency,
    guestCount,
    childrenCount,
    eventDuration,
    weather,
    eventType,
    includeSoftDrinks,
    includeJuice,
    includeWater,
    includeHotBeverages,
    includePunch,
  } = inputs;

  const prices = DRINK_PRICES[currency];

  // Determine which categories are included
  const includedCategories: string[] = [];
  if (includeSoftDrinks) includedCategories.push('soft_drinks');
  if (includeJuice) includedCategories.push('juice');
  if (includeWater) includedCategories.push('water');
  if (includeHotBeverages) includedCategories.push('hot');
  if (includePunch) includedCategories.push('punch');

  // Calculate total drinks needed
  const totalDrinks = calculateTotalDrinks(inputs);

  // Get adjusted ratios
  const ratios = getAdjustedRatios(eventType, weather, includedCategories);

  // Calculate servings needed per category
  const categoryServings: Record<string, number> = {};
  for (const category in ratios) {
    categoryServings[category] = Math.ceil(totalDrinks * ratios[category]);
  }

  // Build drinks list
  const drinks: DrinkQuantity[] = [];

  if (includeSoftDrinks && categoryServings.soft_drinks > 0) {
    drinks.push(...calculateSoftDrinks(categoryServings.soft_drinks, currency, childrenCount > 0));
  }

  if (includeJuice && categoryServings.juice > 0) {
    drinks.push(...calculateJuice(categoryServings.juice, currency, childrenCount));
  }

  if (includeWater && categoryServings.water > 0) {
    drinks.push(...calculateWater(categoryServings.water, currency, eventType));
  }

  if (includeHotBeverages && categoryServings.hot > 0) {
    drinks.push(...calculateHotBeverages(categoryServings.hot, currency));
  }

  if (includePunch && categoryServings.punch > 0) {
    drinks.push(...calculatePunch(categoryServings.punch, currency));
  }

  // Calculate totals
  const totalServings = drinks.reduce((sum, d) => sum + d.servings, 0);
  const drinksCost = drinks.reduce((sum, d) => sum + d.estimatedCost, 0);

  // Calculate ice
  const ice = calculateIce(totalServings, weather, eventDuration, currency);

  // Calculate supplies
  const cupsNeeded = Math.ceil(guestCount * 2.5); // 2.5 cups per person
  const cupPacks = Math.ceil(cupsNeeded / 50);

  const napkinsNeeded = Math.ceil(guestCount * 3);
  const napkinPacks = Math.ceil(napkinsNeeded / 200);

  const strawsNeeded = Math.ceil(guestCount * 2);
  const strawPacks = Math.ceil(strawsNeeded / 100);

  const supplies = [
    {
      item: 'Cups (50-pack)',
      quantity: `${cupPacks} packs`,
      cost: cupPacks * prices.cups_50pack,
    },
    {
      item: 'Napkins (200-pack)',
      quantity: `${napkinPacks} packs`,
      cost: napkinPacks * prices.napkins_200pack,
    },
    {
      item: 'Straws (100-pack)',
      quantity: `${strawPacks} packs`,
      cost: strawPacks * prices.straws_100pack,
    },
  ];

  const suppliesCost = supplies.reduce((sum, s) => sum + s.cost, 0);
  const totalCost = drinksCost + ice.estimatedCost + suppliesCost;

  return {
    currency,
    drinks,
    ice,
    totalServings,
    drinksPerPerson: Math.round((totalServings / guestCount) * 10) / 10,
    totalCost: Math.round(totalCost * 100) / 100,
    costPerPerson: Math.round((totalCost / guestCount) * 100) / 100,
    supplies,
    summary: {
      adultGuests: guestCount - childrenCount,
      childGuests: childrenCount,
      effectiveGuests: Math.round(
        guestCount - childrenCount + childrenCount * CHILD_DRINK_MULTIPLIER
      ),
      weatherMultiplier: DRINKS_PER_HOUR[weather],
    },
  };
}

/**
 * Format currency value for display
 */
export function formatCurrency(value: number, currency: Currency): string {
  const symbols: Record<Currency, string> = {
    USD: '$',
    GBP: '\u00A3',
    EUR: '\u20AC',
  };

  const symbol = symbols[currency];
  return `${symbol}${value.toFixed(2)}`;
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}
