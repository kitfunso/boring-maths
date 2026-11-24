import type { Currency } from '../../../lib/regions';

export type WeatherCondition = 'cold' | 'mild' | 'warm' | 'hot';

export type EventType = 'kids_party' | 'family_gathering' | 'adult_casual' | 'formal';

export interface PartyDrinkInputs {
  currency: Currency;

  guestCount: number;

  childrenCount: number;

  eventDuration: number;

  weather: WeatherCondition;

  eventType: EventType;

  includeSoftDrinks: boolean;

  includeJuice: boolean;

  includeWater: boolean;

  includeHotBeverages: boolean;

  includePunch: boolean;
}

export interface DrinkQuantity {
  name: string;

  category: 'soft_drinks' | 'juice' | 'water' | 'hot' | 'punch';

  quantity: number;

  unit: string;

  servings: number;

  estimatedCost: number;
}

export interface IceRequirements {
  poundsNeeded: number;

  bagsNeeded: number;

  estimatedCost: number;
}

export interface PartyDrinkResult {
  currency: Currency;

  drinks: DrinkQuantity[];

  ice: IceRequirements;

  totalServings: number;

  drinksPerPerson: number;

  totalCost: number;

  costPerPerson: number;

  supplies: {
    item: string;
    quantity: string;
    cost: number;
  }[];

  summary: {
    adultGuests: number;
    childGuests: number;
    effectiveGuests: number;
    weatherMultiplier: number;
  };
}

export const DRINKS_PER_HOUR: Record<WeatherCondition, number> = {
  cold: 0.5,
  mild: 0.75,
  warm: 1.0,
  hot: 1.5,
};

export const WEATHER_DESCRIPTIONS: Record<WeatherCondition, string> = {
  cold: 'Below 50F / 10C - Less cold drinks, more hot beverages',
  mild: '50-70F / 10-21C - Standard drink consumption',
  warm: '70-85F / 21-29C - Increased drink consumption',
  hot: 'Above 85F / 29C - Maximum hydration needed',
};

export const EVENT_TYPE_DESCRIPTIONS: Record<EventType, string> = {
  kids_party: 'Birthday party, playdates - juice boxes and fun drinks',
  family_gathering: 'Mix of ages - variety of options',
  adult_casual: 'BBQ, game day - sodas and water',
  formal: 'Graduation, wedding - sparkling water and punch',
};

export const CHILD_DRINK_MULTIPLIER = 0.7;

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

export const DEFAULT_INPUTS: PartyDrinkInputs = getDefaultInputs('USD');
