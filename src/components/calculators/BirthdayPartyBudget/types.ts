import type { Currency } from '../../../lib/regions';

export type VenueType = 'home' | 'park' | 'rented_venue' | 'activity_center';
export type PartyStyle = 'simple' | 'themed' | 'elaborate';

export interface BirthdayPartyInputs {
  currency: Currency;
  numberOfKids: number;
  childAge: number;
  venueType: VenueType;
  partyStyle: PartyStyle;

  venueCost: number;
  foodPerKid: number;
  cakeSize: number;
  decorationsBudget: number;
  entertainmentBudget: number;
  goodyBagPerKid: number;
  invitationsBudget: number;

  includePhotographer: boolean;
  includeCharacter: boolean;
  includeBouncyHouse: boolean;
  includePinata: boolean;
}

export interface BudgetItem {
  category: string;
  item: string;
  cost: number;
  perKid: number;
  notes: string;
}

export interface BirthdayPartyResult {
  currency: Currency;

  totalBudget: number;
  costPerChild: number;

  budgetItems: BudgetItem[];

  venueTotal: number;
  foodTotal: number;
  decorationsTotal: number;
  entertainmentTotal: number;
  goodyBagsTotal: number;
  otherTotal: number;

  percentages: {
    category: string;
    percent: number;
    amount: number;
  }[];

  savingsTips: string[];
  suggestions: string[];
}

export const VENUE_COSTS: Record<Currency, Record<VenueType, number>> = {
  USD: {
    home: 0,
    park: 50,
    rented_venue: 300,
    activity_center: 400,
  },
  GBP: {
    home: 0,
    park: 40,
    rented_venue: 250,
    activity_center: 350,
  },
  EUR: {
    home: 0,
    park: 45,
    rented_venue: 275,
    activity_center: 375,
  },
};

export const FOOD_PER_KID: Record<Currency, Record<PartyStyle, number>> = {
  USD: {
    simple: 8,
    themed: 15,
    elaborate: 25,
  },
  GBP: {
    simple: 6,
    themed: 12,
    elaborate: 20,
  },
  EUR: {
    simple: 7,
    themed: 13,
    elaborate: 22,
  },
};

export const GOODY_BAG_COSTS: Record<Currency, Record<PartyStyle, number>> = {
  USD: {
    simple: 5,
    themed: 10,
    elaborate: 20,
  },
  GBP: {
    simple: 4,
    themed: 8,
    elaborate: 16,
  },
  EUR: {
    simple: 4,
    themed: 9,
    elaborate: 18,
  },
};

export function getDefaultInputs(currency: Currency = 'USD'): BirthdayPartyInputs {
  const style: PartyStyle = 'themed';

  return {
    currency,
    numberOfKids: 12,
    childAge: 7,
    venueType: 'home',
    partyStyle: style,
    venueCost: VENUE_COSTS[currency].home,
    foodPerKid: FOOD_PER_KID[currency][style],
    cakeSize: 16,
    decorationsBudget: currency === 'USD' ? 75 : currency === 'GBP' ? 60 : 65,
    entertainmentBudget: currency === 'USD' ? 150 : currency === 'GBP' ? 120 : 130,
    goodyBagPerKid: GOODY_BAG_COSTS[currency][style],
    invitationsBudget: currency === 'USD' ? 25 : currency === 'GBP' ? 20 : 22,
    includePhotographer: false,
    includeCharacter: false,
    includeBouncyHouse: false,
    includePinata: true,
  };
}

export const DEFAULT_INPUTS: BirthdayPartyInputs = getDefaultInputs('USD');
