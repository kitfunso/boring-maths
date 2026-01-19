/**
 * Pet Ownership Cost Calculator - Type Definitions
 */

import type { Currency } from '../../../lib/regions';

export type PetType = 'dog' | 'cat' | 'bird' | 'fish' | 'rabbit' | 'reptile';
export type DogSize = 'small' | 'medium' | 'large' | 'giant';
export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor';

export interface PetCostInputs {
  currency: Currency;
  petType: PetType;
  dogSize: DogSize; // only for dogs
  age: number; // years
  healthStatus: HealthStatus;

  // Lifestyle choices
  premiumFood: boolean;
  groomingFrequency: number; // times per year (0 = DIY)
  useDaycare: boolean;
  daycareFrequency: number; // days per month
  useBoarding: boolean;
  boardingWeeksPerYear: number;
  hasPetInsurance: boolean;
}

export interface CostBreakdown {
  category: string;
  annualCost: number;
  monthlyCost: number;
  notes: string;
}

export interface PetCostResult {
  currency: Currency;
  petType: PetType;

  // Summary
  annualCost: number;
  monthlyCost: number;
  lifetimeCost: number;
  expectedLifespan: number;

  // Breakdown
  breakdown: CostBreakdown[];

  // Key costs
  foodCost: number;
  vetCost: number;
  insuranceCost: number;
  groomingCost: number;
  daycareCost: number;
  boardingCost: number;
  suppliesCost: number;

  // Emergency fund
  recommendedEmergencyFund: number;

  // Insights
  costPerDay: number;
  comparisonToAverage: 'below' | 'average' | 'above';
}

export const PET_LIFESPANS: Record<PetType, number> = {
  dog: 12,
  cat: 15,
  bird: 10,
  fish: 5,
  rabbit: 10,
  reptile: 15,
};

export const DOG_SIZE_MULTIPLIERS: Record<DogSize, number> = {
  small: 0.7,
  medium: 1.0,
  large: 1.4,
  giant: 1.8,
};

export const BASE_COSTS = {
  USD: {
    dog: {
      food: 600,
      vet: 500,
      insurance: 600,
      grooming: 50, // per visit
      daycare: 30, // per day
      boarding: 50, // per night
      supplies: 300,
      toys: 100,
      treats: 150,
    },
    cat: {
      food: 400,
      vet: 350,
      insurance: 400,
      grooming: 60,
      daycare: 0,
      boarding: 30,
      supplies: 200,
      toys: 50,
      treats: 75,
    },
    bird: {
      food: 200,
      vet: 200,
      insurance: 150,
      grooming: 0,
      daycare: 0,
      boarding: 20,
      supplies: 150,
      toys: 50,
      treats: 25,
    },
    fish: {
      food: 50,
      vet: 50,
      insurance: 0,
      grooming: 0,
      daycare: 0,
      boarding: 0,
      supplies: 200,
      toys: 25,
      treats: 0,
    },
    rabbit: {
      food: 300,
      vet: 250,
      insurance: 200,
      grooming: 30,
      daycare: 0,
      boarding: 25,
      supplies: 150,
      toys: 50,
      treats: 50,
    },
    reptile: {
      food: 300,
      vet: 150,
      insurance: 100,
      grooming: 0,
      daycare: 0,
      boarding: 15,
      supplies: 200,
      toys: 25,
      treats: 25,
    },
  },
  GBP: {
    dog: {
      food: 450,
      vet: 400,
      insurance: 500,
      grooming: 40,
      daycare: 25,
      boarding: 40,
      supplies: 250,
      toys: 80,
      treats: 120,
    },
    cat: {
      food: 300,
      vet: 280,
      insurance: 300,
      grooming: 50,
      daycare: 0,
      boarding: 25,
      supplies: 150,
      toys: 40,
      treats: 60,
    },
    bird: {
      food: 150,
      vet: 150,
      insurance: 100,
      grooming: 0,
      daycare: 0,
      boarding: 15,
      supplies: 120,
      toys: 40,
      treats: 20,
    },
    fish: {
      food: 40,
      vet: 40,
      insurance: 0,
      grooming: 0,
      daycare: 0,
      boarding: 0,
      supplies: 150,
      toys: 20,
      treats: 0,
    },
    rabbit: {
      food: 220,
      vet: 200,
      insurance: 150,
      grooming: 25,
      daycare: 0,
      boarding: 20,
      supplies: 120,
      toys: 40,
      treats: 40,
    },
    reptile: {
      food: 220,
      vet: 120,
      insurance: 80,
      grooming: 0,
      daycare: 0,
      boarding: 12,
      supplies: 150,
      toys: 20,
      treats: 20,
    },
  },
  EUR: {
    dog: {
      food: 500,
      vet: 420,
      insurance: 450,
      grooming: 45,
      daycare: 28,
      boarding: 45,
      supplies: 270,
      toys: 85,
      treats: 130,
    },
    cat: {
      food: 350,
      vet: 300,
      insurance: 350,
      grooming: 55,
      daycare: 0,
      boarding: 28,
      supplies: 170,
      toys: 45,
      treats: 65,
    },
    bird: {
      food: 170,
      vet: 170,
      insurance: 120,
      grooming: 0,
      daycare: 0,
      boarding: 18,
      supplies: 130,
      toys: 45,
      treats: 22,
    },
    fish: {
      food: 45,
      vet: 45,
      insurance: 0,
      grooming: 0,
      daycare: 0,
      boarding: 0,
      supplies: 170,
      toys: 22,
      treats: 0,
    },
    rabbit: {
      food: 250,
      vet: 220,
      insurance: 170,
      grooming: 28,
      daycare: 0,
      boarding: 22,
      supplies: 130,
      toys: 45,
      treats: 45,
    },
    reptile: {
      food: 250,
      vet: 130,
      insurance: 90,
      grooming: 0,
      daycare: 0,
      boarding: 14,
      supplies: 170,
      toys: 22,
      treats: 22,
    },
  },
};

export function getDefaultInputs(currency: Currency = 'USD'): PetCostInputs {
  return {
    currency,
    petType: 'dog',
    dogSize: 'medium',
    age: 3,
    healthStatus: 'good',
    premiumFood: false,
    groomingFrequency: 4,
    useDaycare: false,
    daycareFrequency: 0,
    useBoarding: true,
    boardingWeeksPerYear: 1,
    hasPetInsurance: false,
  };
}

export const DEFAULT_INPUTS: PetCostInputs = getDefaultInputs('USD');
