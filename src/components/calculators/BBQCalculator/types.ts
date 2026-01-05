/**
 * BBQ Calculator - Type Definitions
 *
 * Calculator to determine how much meat and supplies for a BBQ.
 */

export type AppetiteLevel = 'light' | 'moderate' | 'hungry';
export type MeatPreference = 'beef' | 'mixed' | 'pork' | 'chicken';

/**
 * Input values for the BBQ Calculator
 */
export interface BBQCalculatorInputs {
  /** Total number of guests */
  guestCount: number;

  /** Number of children (eat less) */
  childrenCount: number;

  /** Appetite level */
  appetiteLevel: AppetiteLevel;

  /** Main meat preference */
  meatPreference: MeatPreference;

  /** Number of side dishes */
  sideCount: number;

  /** Event duration in hours */
  eventDuration: number;

  /** Include vegetarian option */
  includeVegetarian: boolean;
}

/**
 * Calculated results from the BBQ Calculator
 */
export interface BBQCalculatorResult {
  /** Total meat needed in pounds */
  totalMeatPounds: number;

  /** Breakdown by meat type */
  meatBreakdown: {
    type: string;
    pounds: number;
    servings: number;
  }[];

  /** Side dish quantities */
  sideQuantities: {
    item: string;
    amount: string;
    servings: number;
  }[];

  /** Supplies needed */
  supplies: {
    item: string;
    quantity: string;
  }[];

  /** Per-person breakdown */
  perPerson: {
    meat: number;
    sides: number;
  };

  /** Grilling info */
  grillingInfo: {
    charcoalPounds: number;
    propaneTanks: number;
    grillTime: string;
  };
}

/**
 * Meat amounts per person in pounds based on appetite
 */
export const MEAT_PER_PERSON: Record<AppetiteLevel, number> = {
  light: 0.33, // 1/3 lb
  moderate: 0.5, // 1/2 lb
  hungry: 0.75, // 3/4 lb
};

/**
 * Children eat about half of adult portions
 */
export const CHILD_MULTIPLIER = 0.5;

/**
 * Get default input values
 */
export function getDefaultInputs(): BBQCalculatorInputs {
  return {
    guestCount: 20,
    childrenCount: 5,
    appetiteLevel: 'moderate',
    meatPreference: 'mixed',
    sideCount: 3,
    eventDuration: 4,
    includeVegetarian: true,
  };
}

/**
 * Default input values
 */
export const DEFAULT_INPUTS: BBQCalculatorInputs = getDefaultInputs();
