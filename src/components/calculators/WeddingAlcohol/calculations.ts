import type { WeddingAlcoholInputs, WeddingAlcoholResult } from './types';
import { DRINKS_PER_HOUR, SERVINGS_PER_BOTTLE } from './types';

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

  const totalPercent = winePercent + beerPercent + liquorPercent;
  if (totalPercent < 99 || totalPercent > 101) {
    const normalizer = 100 / totalPercent;
    inputs.winePercent *= normalizer;
    inputs.beerPercent *= normalizer;
    inputs.liquorPercent *= normalizer;
  }

  const drinkingGuests = Math.round(guestCount * (drinkersPercent / 100));

  const drinksPerHour = DRINKS_PER_HOUR[drinkingLevel];
  const drinksPerGuest = drinksPerHour * eventHours;

  const totalDrinks = Math.round(drinkingGuests * drinksPerGuest);

  const wineServings = Math.round(totalDrinks * (winePercent / 100));
  const beerServings = Math.round(totalDrinks * (beerPercent / 100));
  const liquorServings = Math.round(totalDrinks * (liquorPercent / 100));

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

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
