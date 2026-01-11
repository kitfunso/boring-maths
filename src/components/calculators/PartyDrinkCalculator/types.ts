/**
 * Party Drink Calculator (Non-Alcoholic) - Type Definitions
 *
 * Calculator to estimate non-alcoholic drink quantities for parties and events.
 * Accounts for weather conditions, event duration, and kid-friendly options.
 */

import type { Currency } from '../../../lib/regions';

/**
 * Weather/temperature conditions affecting drink consumption
 */
export type WeatherCondition = 'cold' | 'mild' | 'warm' | 'hot';

/**
 * Event type affecting drink preferences
 */
export type EventType = 'kids_party' | 'family_gathering' | 'adult_casual' | 'formal';

/**
 * Input values for the Party Drink Calculator
 */
export interface PartyDrinkInputs {
  /** Selected currency for cost estimates */
  currency: Currency;

  /** Total number of guests */
  guestCount: number;

  /** Number of children (under 12) */
  childrenCount: number;

  /** Event duration in hours */
  eventDuration: number;

  /** Weather/temperature condition */
  weather: WeatherCondition;

  /** Type of event */
  eventType: EventType;

  /** Include soft drinks (sodas) */
  includeSoftDrinks: boolean;

  /** Include juice options */
  includeJuice: boolean;

  /** Include water (still/sparkling) */
  includeWater: boolean;

  /** Include hot beverages (coffee/tea) */
  includeHotBeverages: boolean;

  /** Include punch/lemonade */
  includePunch: boolean;
}

/**
 * Drink quantity breakdown
 */
export interface DrinkQuantity {
  /** Display name */
  name: string;

  /** Category for grouping */
  category: 'soft_drinks' | 'juice' | 'water' | 'hot' | 'punch';

  /** Quantity needed */
  quantity: number;

  /** Unit (bottles, liters, cans, etc.) */
  unit: string;

  /** Servings this provides */
  servings: number;

  /** Estimated cost */
  estimatedCost: number;
}

/**
 * Ice requirements
 */
export interface IceRequirements {
  /** Pounds of ice needed */
  poundsNeeded: number;

  /** Bags of ice (10lb bags) */
  bagsNeeded: number;

  /** Estimated cost */
  estimatedCost: number;
}

/**
 * Calculated results from the Party Drink Calculator
 */
export interface PartyDrinkResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** All drink quantities */
  drinks: DrinkQuantity[];

  /** Ice requirements */
  ice: IceRequirements;

  /** Total servings provided */
  totalServings: number;

  /** Drinks per person */
  drinksPerPerson: number;

  /** Total estimated cost */
  totalCost: number;

  /** Per person cost */
  costPerPerson: number;

  /** Supplies needed */
  supplies: {
    item: string;
    quantity: string;
    cost: number;
  }[];

  /** Summary stats */
  summary: {
    adultGuests: number;
    childGuests: number;
    effectiveGuests: number;
    weatherMultiplier: number;
  };
}

/**
 * Drinks per hour by weather condition (base rate per person)
 */
export const DRINKS_PER_HOUR: Record<WeatherCondition, number> = {
  cold: 0.5,
  mild: 0.75,
  warm: 1.0,
  hot: 1.5,
};

/**
 * Weather multiplier descriptions
 */
export const WEATHER_DESCRIPTIONS: Record<WeatherCondition, string> = {
  cold: 'Below 50F / 10C - Less cold drinks, more hot beverages',
  mild: '50-70F / 10-21C - Standard drink consumption',
  warm: '70-85F / 21-29C - Increased drink consumption',
  hot: 'Above 85F / 29C - Maximum hydration needed',
};

/**
 * Event type descriptions
 */
export const EVENT_TYPE_DESCRIPTIONS: Record<EventType, string> = {
  kids_party: 'Birthday party, playdates - juice boxes and fun drinks',
  family_gathering: 'Mix of ages - variety of options',
  adult_casual: 'BBQ, game day - sodas and water',
  formal: 'Graduation, wedding - sparkling water and punch',
};

/**
 * Child drink multiplier (kids drink less but more frequently)
 */
export const CHILD_DRINK_MULTIPLIER = 0.7;

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): PartyDrinkInputs {
  return {
    currency,
    guestCount: 25,
    childrenCount: 8,
    eventDuration: 4,
    weather: 'warm',
    eventType: 'family_gathering',
    includeSoftDrinks: true,
    includeJuice: true,
    includeWater: true,
    includeHotBeverages: false,
    includePunch: true,
  };
}

/**
 * Default input values (US)
 */
export const DEFAULT_INPUTS: PartyDrinkInputs = getDefaultInputs('USD');
