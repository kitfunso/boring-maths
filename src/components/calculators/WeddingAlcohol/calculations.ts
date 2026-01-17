/**
 * Wedding Alcohol Calculator - Calculation Logic
 *
 * Pure functions for estimating alcohol quantities for weddings.
 */

import type { WeddingAlcoholInputs, WeddingAlcoholResult } from './types';
import { DRINKS_PER_HOUR, SERVINGS_PER_BOTTLE } from './types';

/**
 * Calculate alcohol quantities for a wedding
 *
 * Formula:
 * 1. Drinking guests = Total guests × Drinkers percentage
 * 2. Total drinks = Drinking guests × Hours × Drinks per hour
 * 3. Drinks by type = Total drinks × Type percentage
 * 4. Bottles = Drinks by type ÷ Servings per bottle
 *
 * @param inputs - Calculator input values
 * @returns Calculated alcohol quantities
 */
export function calculateWeddingAlcohol(inputs: WeddingAlcoholInputs): WeddingAlcoholResult {
  const {
    guestCount,
    eventHours,
    drinkersPercent,
    drinkingLevel,
    winePercent,
    beerPercent,
    liquorPercent,
  } = inputs;

  // Validate percentages add up (allow some tolerance)
  const totalPercent = winePercent + beerPercent + liquorPercent;
  if (totalPercent < 99 || totalPercent > 101) {
    // Normalize percentages if they don't add up to 100
    const normalizer = 100 / totalPercent;
    inputs.winePercent *= normalizer;
    inputs.beerPercent *= normalizer;
    inputs.liquorPercent *= normalizer;
  }

  // Calculate drinking guests
  const drinkingGuests = Math.round(guestCount * (drinkersPercent / 100));

  // Calculate drinks per guest based on drinking level
  const drinksPerHour = DRINKS_PER_HOUR[drinkingLevel];
  const drinksPerGuest = drinksPerHour * eventHours;

  // Calculate total drinks
  const totalDrinks = Math.round(drinkingGuests * drinksPerGuest);

  // Calculate drinks by type
  const wineServings = Math.round(totalDrinks * (winePercent / 100));
  const beerServings = Math.round(totalDrinks * (beerPercent / 100));
  const liquorServings = Math.round(totalDrinks * (liquorPercent / 100));

  // Calculate bottles needed (round up to ensure enough)
  const wineBottles = Math.ceil(wineServings / SERVINGS_PER_BOTTLE.wine);
  const beerBottles = Math.ceil(beerServings / SERVINGS_PER_BOTTLE.beer);
  const liquorBottles = Math.ceil(liquorServings / SERVINGS_PER_BOTTLE.liquor);

  return {
    wineBottles,
    beerBottles,
    liquorBottles,
    totalDrinks,
    drinksPerGuest: Math.round(drinksPerGuest * 10) / 10,
    drinkingGuests,
    breakdown: {
      wineServings,
      beerServings,
      liquorServings,
    },
  };
}

/**
 * Format a number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
