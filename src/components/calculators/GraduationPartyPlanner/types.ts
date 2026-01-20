/**
 * Graduation Party Planner - Type Definitions
 *
 * Calculate food, drink quantities and costs for graduation parties.
 */

import type { Currency } from '../../../lib/regions';

export type GraduationType = 'high_school' | 'college' | 'graduate_school';
export type PartyStyle = 'casual' | 'semi_formal' | 'formal';
export type MenuStyle = 'finger_food' | 'buffet' | 'catered';

export interface GraduationPartyInputs {
  currency: Currency;
  guestCount: number;
  graduationType: GraduationType;
  partyStyle: PartyStyle;
  menuStyle: MenuStyle;
  partyDuration: number; // hours

  // Menu items
  includeMainDish: boolean;
  includeSides: boolean;
  includeAppetizers: boolean;
  includeDessert: boolean;
  includeCake: boolean;

  // Drinks
  includeSoftDrinks: boolean;
  includeWater: boolean;
  includePunch: boolean;
  includeCoffee: boolean;
}

export interface FoodQuantity {
  item: string;
  quantity: number;
  unit: string;
  servings: number;
  notes: string;
}

export interface DrinkQuantity {
  item: string;
  quantity: number;
  unit: string;
  servings: number;
}

export interface GraduationPartyResult {
  currency: Currency;

  // Food quantities
  foodItems: FoodQuantity[];
  totalFoodServings: number;

  // Drink quantities
  drinkItems: DrinkQuantity[];
  totalDrinkServings: number;

  // Cost estimates
  estimatedFoodCost: number;
  estimatedDrinkCost: number;
  estimatedSuppliesCost: number;
  totalEstimatedCost: number;
  costPerGuest: number;

  // Supplies needed
  supplies: {
    item: string;
    quantity: number;
    unit: string;
  }[];

  // Tips and suggestions
  tips: string[];
  timeline: string[];
}

// Food per person (oz) by menu style
export const FOOD_PER_PERSON: Record<MenuStyle, number> = {
  finger_food: 8, // appetizer-style
  buffet: 14, // full meal
  catered: 16, // generous portions
};

// Cost per person by menu style
export const COST_PER_PERSON: Record<Currency, Record<MenuStyle, number>> = {
  USD: {
    finger_food: 12,
    buffet: 20,
    catered: 35,
  },
  GBP: {
    finger_food: 10,
    buffet: 16,
    catered: 28,
  },
  EUR: {
    finger_food: 11,
    buffet: 18,
    catered: 32,
  },
};

// Drinks per person per hour by weather/style
export const DRINKS_PER_HOUR = 1.5;

export function getDefaultInputs(currency: Currency = 'USD'): GraduationPartyInputs {
  return {
    currency,
    guestCount: 50,
    graduationType: 'high_school',
    partyStyle: 'casual',
    menuStyle: 'buffet',
    partyDuration: 4,
    includeMainDish: true,
    includeSides: true,
    includeAppetizers: true,
    includeDessert: true,
    includeCake: true,
    includeSoftDrinks: true,
    includeWater: true,
    includePunch: true,
    includeCoffee: true,
  };
}

export const DEFAULT_INPUTS: GraduationPartyInputs = getDefaultInputs('USD');
