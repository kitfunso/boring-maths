/**
 * Holiday Dinner Calculator - Type Definitions
 *
 * Calculate turkey size, cooking time, and side dish quantities.
 */

export type LeftoverPreference = 'none' | 'some' | 'lots';
export type TurkeyType = 'fresh' | 'frozen';
export type CookingMethod = 'oven' | 'deep_fried' | 'smoked';

export interface HolidayDinnerInputs {
  guestCount: number;
  adultCount: number;
  childCount: number;
  leftoverPreference: LeftoverPreference;
  turkeyType: TurkeyType;
  cookingMethod: CookingMethod;
  sideCount: number;

  // Dietary restrictions
  vegetarianCount: number;
  glutenFreeCount: number;

  // Options
  includeGravy: boolean;
  includeStuffing: boolean;
  includeMashedPotatoes: boolean;
  includeSweetPotatoes: boolean;
  includeGreenBeans: boolean;
  includeCranberrySauce: boolean;
  includeRolls: boolean;
  includePie: boolean;
}

export interface TurkeyInfo {
  weightPounds: number;
  servings: number;
  thawDays: number;
  cookTimeMinutes: number;
  cookTimeFormatted: string;
  restTime: number;
  internalTemp: number;
  notes: string;
}

export interface SideQuantity {
  item: string;
  quantity: number;
  unit: string;
  servings: number;
  prepTime: string;
  notes: string;
}

export interface HolidayDinnerResult {
  // Turkey details
  turkey: TurkeyInfo;

  // Side dishes
  sides: SideQuantity[];
  totalSideServings: number;

  // Dietary accommodations
  vegetarianMains: number;
  glutenFreeAccommodations: string[];

  // Timeline
  timeline: {
    time: string;
    task: string;
    notes: string;
  }[];

  // Tips
  tips: string[];

  // Shopping list summary
  shoppingList: {
    category: string;
    items: string[];
  }[];
}

// Turkey pounds per adult (bone-in)
export const TURKEY_LBS_PER_ADULT = 1.25;
export const TURKEY_LBS_PER_CHILD = 0.75;

// Leftover multipliers
export const LEFTOVER_MULTIPLIER: Record<LeftoverPreference, number> = {
  none: 1.0,
  some: 1.25,
  lots: 1.5,
};

// Cooking time per pound (minutes) - unstuffed
export const COOK_TIME_PER_LB: Record<CookingMethod, number> = {
  oven: 15, // at 325°F
  deep_fried: 3.5, // 3.5 min per lb
  smoked: 30, // at 225-250°F
};

// Thaw time: 24 hours per 4-5 lbs in refrigerator
export const THAW_HOURS_PER_LB = 6;

export function getDefaultInputs(): HolidayDinnerInputs {
  return {
    guestCount: 10,
    adultCount: 8,
    childCount: 2,
    leftoverPreference: 'some',
    turkeyType: 'frozen',
    cookingMethod: 'oven',
    sideCount: 5,
    vegetarianCount: 0,
    glutenFreeCount: 0,
    includeGravy: true,
    includeStuffing: true,
    includeMashedPotatoes: true,
    includeSweetPotatoes: true,
    includeGreenBeans: true,
    includeCranberrySauce: true,
    includeRolls: true,
    includePie: true,
  };
}

export const DEFAULT_INPUTS: HolidayDinnerInputs = getDefaultInputs();
