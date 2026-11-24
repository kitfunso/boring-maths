export type AppetiteLevel = 'light' | 'moderate' | 'hungry';
export type MeatPreference = 'beef' | 'mixed' | 'pork' | 'chicken';

export interface BBQCalculatorInputs {
  guestCount: number;

  childrenCount: number;

  appetiteLevel: AppetiteLevel;

  meatPreference: MeatPreference;

  sideCount: number;

  eventDuration: number;

  includeVegetarian: boolean;
}

export interface BBQCalculatorResult {
  totalMeatPounds: number;

  meatBreakdown: {
    type: string;
    pounds: number;
    servings: number;
  }[];

  sideQuantities: {
    item: string;
    amount: string;
    servings: number;
  }[];

  supplies: {
    item: string;
    quantity: string;
  }[];

  perPerson: {
    meat: number;
    sides: number;
  };

  grillingInfo: {
    charcoalPounds: number;
    propaneTanks: number;
    grillTime: string;
  };
}

export const MEAT_PER_PERSON: Record<AppetiteLevel, number> = {
  light: 0.33, // 1/3 lb
  moderate: 0.5, // 1/2 lb
  hungry: 0.75, // 3/4 lb
};

export const CHILD_MULTIPLIER = 0.5;

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

export const DEFAULT_INPUTS: BBQCalculatorInputs = getDefaultInputs();
