export type DrinkingLevel = 'light' | 'moderate' | 'heavy';

export interface WeddingAlcoholInputs {
  guestCount: number;

  eventHours: number;

  drinkersPercent: number;

  drinkingLevel: DrinkingLevel;

  winePercent: number;

  beerPercent: number;

  liquorPercent: number;
}

export interface WeddingAlcoholResult {
  wineBottles: number;

  beerBottles: number;

  liquorBottles: number;

  totalDrinks: number;

  drinksPerGuest: number;

  drinkingGuests: number;

  breakdown: {
    wineServings: number;
    beerServings: number;
    liquorServings: number;
  };
}

export const DEFAULT_INPUTS: WeddingAlcoholInputs = {
  guestCount: 100,
  eventHours: 5,
  drinkersPercent: 80,
  drinkingLevel: 'moderate',
  winePercent: 40,
  beerPercent: 40,
  liquorPercent: 20,
};

export const DRINKS_PER_HOUR: Record<DrinkingLevel, number> = {
  light: 0.75,
  moderate: 1.0,
  heavy: 1.5,
};

export const SERVINGS_PER_BOTTLE = {
  wine: 5, // 750ml bottle = 5 glasses (150ml each)
  beer: 1, // 1 bottle/can = 1 serving
  liquor: 16, // 750ml bottle = ~16 cocktails (1.5oz each)
};
