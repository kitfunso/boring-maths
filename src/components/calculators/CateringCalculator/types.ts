import type { Currency } from '../../../lib/regions';

export type MealType = 'appetizers_only' | 'light_meal' | 'full_meal' | 'heavy_meal';
export type ServiceStyle = 'buffet' | 'plated' | 'stations' | 'family_style';
export type EventTime = 'breakfast' | 'lunch' | 'dinner' | 'cocktail';

export interface CateringInputs {
  currency: Currency;
  guestCount: number;
  eventDuration: number;
  mealType: MealType;
  serviceStyle: ServiceStyle;
  eventTime: EventTime;

  vegetarianPercent: number;
  veganPercent: number;
  glutenFreePercent: number;

  includeAppetizers: boolean;
  includeDessert: boolean;
  includeBreads: boolean;
}

export interface FoodItem {
  category: string;
  item: string;
  quantity: number;
  unit: string;
  servings: number;
  notes: string;
}

export interface CateringResult {
  currency: Currency;

  foodItems: FoodItem[];

  proteinPounds: number;
  starchPounds: number;
  vegetablePounds: number;
  saladPounds: number;
  breadUnits: number;
  dessertServings: number;
  appetizerServings: number;

  perPersonTotal: number;
  perPersonProtein: number;
  perPersonSides: number;

  orderGuide: {
    item: string;
    quantity: string;
    note: string;
  }[];

  dietaryCounts: {
    regular: number;
    vegetarian: number;
    vegan: number;
    glutenFree: number;
  };

  tips: string[];
}

export const PROTEIN_PER_PERSON: Record<MealType, number> = {
  appetizers_only: 2,
  light_meal: 4,
  full_meal: 6,
  heavy_meal: 8,
};

export const TOTAL_FOOD_PER_PERSON: Record<MealType, number> = {
  appetizers_only: 6,
  light_meal: 10,
  full_meal: 14,
  heavy_meal: 18,
};

export const APPETIZERS_PER_HOUR = 6;

export const SERVICE_WASTE: Record<ServiceStyle, number> = {
  buffet: 1.15, // 15% extra for buffet
  plated: 1.05, // 5% extra for plated
  stations: 1.2, // 20% extra for stations
  family_style: 1.1, // 10% extra for family style
};

export function getDefaultInputs(currency: Currency = 'USD'): CateringInputs {
  return {
    currency,
    guestCount: 50,
    eventDuration: 3,
    mealType: 'full_meal',
    serviceStyle: 'buffet',
    eventTime: 'dinner',
    vegetarianPercent: 10,
    veganPercent: 5,
    glutenFreePercent: 5,
    includeAppetizers: true,
    includeDessert: true,
    includeBreads: true,
  };
}

export const DEFAULT_INPUTS: CateringInputs = getDefaultInputs('USD');
