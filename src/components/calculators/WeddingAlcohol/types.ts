/**
 * Wedding Alcohol Calculator - Type Definitions
 *
 * Helps estimate alcohol quantities needed for wedding receptions
 * based on guest count, event duration, and drinking preferences.
 */

/**
 * Drinking level preferences
 */
export type DrinkingLevel = 'light' | 'moderate' | 'heavy';

/**
 * Input values for the Wedding Alcohol Calculator
 */
export interface WeddingAlcoholInputs {
  /** Total number of guests */
  guestCount: number;

  /** Event duration in hours */
  eventHours: number;

  /** Percentage of guests who drink alcohol (0-100) */
  drinkersPercent: number;

  /** Overall drinking level preference */
  drinkingLevel: DrinkingLevel;

  /** Percentage preferring wine (0-100) */
  winePercent: number;

  /** Percentage preferring beer (0-100) */
  beerPercent: number;

  /** Percentage preferring liquor/cocktails (0-100) */
  liquorPercent: number;
}

/**
 * Calculated results from the Wedding Alcohol Calculator
 */
export interface WeddingAlcoholResult {
  /** Number of wine bottles needed (750ml) */
  wineBottles: number;

  /** Number of beer bottles/cans needed */
  beerBottles: number;

  /** Number of liquor bottles needed (750ml) */
  liquorBottles: number;

  /** Total drinks estimated */
  totalDrinks: number;

  /** Drinks per drinking guest */
  drinksPerGuest: number;

  /** Number of guests who drink */
  drinkingGuests: number;

  /** Breakdown by type */
  breakdown: {
    wineServings: number;
    beerServings: number;
    liquorServings: number;
  };
}

/**
 * Default input values
 */
export const DEFAULT_INPUTS: WeddingAlcoholInputs = {
  guestCount: 100,
  eventHours: 5,
  drinkersPercent: 80,
  drinkingLevel: 'moderate',
  winePercent: 40,
  beerPercent: 40,
  liquorPercent: 20,
};

/**
 * Drinks per hour by drinking level
 */
export const DRINKS_PER_HOUR: Record<DrinkingLevel, number> = {
  light: 0.75,
  moderate: 1.0,
  heavy: 1.5,
};

/**
 * Servings per bottle
 */
export const SERVINGS_PER_BOTTLE = {
  wine: 5,      // 750ml bottle = 5 glasses (150ml each)
  beer: 1,      // 1 bottle/can = 1 serving
  liquor: 16,   // 750ml bottle = ~16 cocktails (1.5oz each)
};
