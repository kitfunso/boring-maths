import type { Currency } from '../../../lib/regions';

export type MoveType = 'local' | 'long_distance' | 'cross_country' | 'international';
export type HomeSize = 'studio' | 'one_bed' | 'two_bed' | 'three_bed' | 'four_plus';
export type MoveMethod = 'diy' | 'hybrid' | 'full_service';
export type Season = 'peak' | 'off_peak';

export interface MovingCostInputs {
  currency: Currency;
  moveType: MoveType;
  distance: number;
  homeSize: HomeSize;
  moveMethod: MoveMethod;
  season: Season;

  needsPacking: boolean;
  hasSpecialItems: boolean;
  needsStorage: boolean;
  storageMonths: number;
  needsCleaning: boolean;
  hasStairs: boolean;
  requiresElevator: boolean;
}

export interface CostItem {
  category: string;
  amount: number;
  description: string;
  isOptional: boolean;
}

export interface MovingCostResult {
  currency: Currency;

  totalCost: number;
  lowEstimate: number;
  highEstimate: number;

  costItems: CostItem[];

  movingServiceCost: number;
  packingCost: number;
  suppliesCost: number;
  storageCost: number;
  insuranceCost: number;
  hiddenCosts: number;

  costPerMile: number;
  savingsVsFullService: number;
  peakSeasonPremium: number;
  tips: string[];
}

export const BASE_MOVING_COSTS: Record<Currency, Record<HomeSize, number>> = {
  USD: {
    studio: 400,
    one_bed: 600,
    two_bed: 900,
    three_bed: 1300,
    four_plus: 1800,
  },
  GBP: {
    studio: 300,
    one_bed: 450,
    two_bed: 700,
    three_bed: 1000,
    four_plus: 1400,
  },
  EUR: {
    studio: 350,
    one_bed: 500,
    two_bed: 800,
    three_bed: 1150,
    four_plus: 1600,
  },
};

export const COST_PER_MILE: Record<Currency, number> = {
  USD: 0.5,
  GBP: 0.6,
  EUR: 0.55,
};

export const WEIGHT_BY_SIZE: Record<HomeSize, number> = {
  studio: 1500,
  one_bed: 3000,
  two_bed: 5000,
  three_bed: 8000,
  four_plus: 12000,
};

export function getDefaultInputs(currency: Currency = 'USD'): MovingCostInputs {
  return {
    currency,
    moveType: 'local',
    distance: 20,
    homeSize: 'two_bed',
    moveMethod: 'full_service',
    season: 'off_peak',
    needsPacking: false,
    hasSpecialItems: false,
    needsStorage: false,
    storageMonths: 1,
    needsCleaning: false,
    hasStairs: false,
    requiresElevator: false,
  };
}

export const DEFAULT_INPUTS: MovingCostInputs = getDefaultInputs('USD');
