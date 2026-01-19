/**
 * Pet Ownership Cost Calculator - Calculation Logic
 */

import type { PetCostInputs, PetCostResult, CostBreakdown } from './types';
import { BASE_COSTS, DOG_SIZE_MULTIPLIERS, PET_LIFESPANS } from './types';

export function calculatePetCost(inputs: PetCostInputs): PetCostResult {
  const {
    currency,
    petType,
    dogSize,
    age,
    healthStatus,
    premiumFood,
    groomingFrequency,
    useDaycare,
    daycareFrequency,
    useBoarding,
    boardingWeeksPerYear,
    hasPetInsurance,
  } = inputs;

  const baseCosts = BASE_COSTS[currency][petType];
  const sizeMultiplier = petType === 'dog' ? DOG_SIZE_MULTIPLIERS[dogSize] : 1;

  const breakdown: CostBreakdown[] = [];

  // Health status multiplier for vet costs
  const healthMultiplier =
    healthStatus === 'excellent'
      ? 0.8
      : healthStatus === 'good'
        ? 1.0
        : healthStatus === 'fair'
          ? 1.5
          : 2.0;

  // Age multiplier (older pets cost more)
  const ageMultiplier = age > 10 ? 1.5 : age > 7 ? 1.2 : 1.0;

  // 1. Food costs
  let foodCost = baseCosts.food * sizeMultiplier;
  if (premiumFood) {
    foodCost *= 1.5;
  }
  breakdown.push({
    category: 'Food',
    annualCost: Math.round(foodCost),
    monthlyCost: Math.round(foodCost / 12),
    notes: premiumFood ? 'Premium food selected' : 'Standard food',
  });

  // 2. Veterinary costs
  const vetCost = baseCosts.vet * sizeMultiplier * healthMultiplier * ageMultiplier;
  breakdown.push({
    category: 'Veterinary Care',
    annualCost: Math.round(vetCost),
    monthlyCost: Math.round(vetCost / 12),
    notes: `Annual checkups, vaccines, preventatives (${healthStatus} health)`,
  });

  // 3. Insurance
  let insuranceCost = 0;
  if (hasPetInsurance && baseCosts.insurance > 0) {
    insuranceCost = baseCosts.insurance * sizeMultiplier * ageMultiplier;
    breakdown.push({
      category: 'Pet Insurance',
      annualCost: Math.round(insuranceCost),
      monthlyCost: Math.round(insuranceCost / 12),
      notes: 'Accident & illness coverage',
    });
  }

  // 4. Grooming
  let groomingCost = 0;
  if (groomingFrequency > 0 && baseCosts.grooming > 0) {
    groomingCost = baseCosts.grooming * groomingFrequency * sizeMultiplier;
    breakdown.push({
      category: 'Grooming',
      annualCost: Math.round(groomingCost),
      monthlyCost: Math.round(groomingCost / 12),
      notes: `${groomingFrequency}x per year professional grooming`,
    });
  }

  // 5. Daycare
  let daycareCost = 0;
  if (useDaycare && daycareFrequency > 0 && baseCosts.daycare > 0) {
    daycareCost = baseCosts.daycare * daycareFrequency * 12;
    breakdown.push({
      category: 'Daycare',
      annualCost: Math.round(daycareCost),
      monthlyCost: Math.round(daycareCost / 12),
      notes: `${daycareFrequency} days/month`,
    });
  }

  // 6. Boarding
  let boardingCost = 0;
  if (useBoarding && boardingWeeksPerYear > 0 && baseCosts.boarding > 0) {
    boardingCost = baseCosts.boarding * 7 * boardingWeeksPerYear;
    breakdown.push({
      category: 'Boarding/Pet Sitting',
      annualCost: Math.round(boardingCost),
      monthlyCost: Math.round(boardingCost / 12),
      notes: `${boardingWeeksPerYear} week(s) per year`,
    });
  }

  // 7. Supplies & Maintenance
  const suppliesCost = baseCosts.supplies * sizeMultiplier;
  breakdown.push({
    category: 'Supplies & Equipment',
    annualCost: Math.round(suppliesCost),
    monthlyCost: Math.round(suppliesCost / 12),
    notes: 'Beds, leashes, litter, cages, etc.',
  });

  // 8. Toys & Enrichment
  const toysCost = baseCosts.toys * sizeMultiplier;
  breakdown.push({
    category: 'Toys & Enrichment',
    annualCost: Math.round(toysCost),
    monthlyCost: Math.round(toysCost / 12),
    notes: 'Toys, puzzles, scratching posts',
  });

  // 9. Treats & Training
  const treatsCost = baseCosts.treats * sizeMultiplier;
  breakdown.push({
    category: 'Treats & Training',
    annualCost: Math.round(treatsCost),
    monthlyCost: Math.round(treatsCost / 12),
    notes: 'Treats, training aids',
  });

  // Calculate totals
  const annualCost =
    foodCost +
    vetCost +
    insuranceCost +
    groomingCost +
    daycareCost +
    boardingCost +
    suppliesCost +
    toysCost +
    treatsCost;

  const monthlyCost = annualCost / 12;

  // Lifespan and lifetime cost
  const expectedLifespan = PET_LIFESPANS[petType];
  const remainingYears = Math.max(0, expectedLifespan - age);
  const lifetimeCost = annualCost * remainingYears;

  // Emergency fund recommendation
  const recommendedEmergencyFund =
    petType === 'dog' ? sizeMultiplier * 3000 : petType === 'cat' ? 2000 : 500;

  // Cost per day
  const costPerDay = annualCost / 365;

  // Compare to average
  const averageCosts: Record<string, number> = {
    dog: currency === 'USD' ? 1500 : currency === 'GBP' ? 1200 : 1350,
    cat: currency === 'USD' ? 1000 : currency === 'GBP' ? 800 : 900,
    bird: currency === 'USD' ? 500 : currency === 'GBP' ? 400 : 450,
    fish: currency === 'USD' ? 300 : currency === 'GBP' ? 240 : 270,
    rabbit: currency === 'USD' ? 700 : currency === 'GBP' ? 560 : 630,
    reptile: currency === 'USD' ? 600 : currency === 'GBP' ? 480 : 540,
  };

  const avgCost = averageCosts[petType];
  const comparisonToAverage: 'below' | 'average' | 'above' =
    annualCost < avgCost * 0.9 ? 'below' : annualCost > avgCost * 1.1 ? 'above' : 'average';

  return {
    currency,
    petType,
    annualCost: Math.round(annualCost),
    monthlyCost: Math.round(monthlyCost),
    lifetimeCost: Math.round(lifetimeCost),
    expectedLifespan,
    breakdown,
    foodCost: Math.round(foodCost),
    vetCost: Math.round(vetCost),
    insuranceCost: Math.round(insuranceCost),
    groomingCost: Math.round(groomingCost),
    daycareCost: Math.round(daycareCost),
    boardingCost: Math.round(boardingCost),
    suppliesCost: Math.round(suppliesCost + toysCost + treatsCost),
    recommendedEmergencyFund: Math.round(recommendedEmergencyFund),
    costPerDay: Math.round(costPerDay * 100) / 100,
    comparisonToAverage,
  };
}
