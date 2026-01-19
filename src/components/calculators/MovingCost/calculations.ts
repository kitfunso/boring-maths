/**
 * Moving Cost Estimator - Calculation Logic
 */

import type { MovingCostInputs, MovingCostResult, CostItem } from './types';
import { BASE_MOVING_COSTS, COST_PER_MILE, WEIGHT_BY_SIZE } from './types';

export function calculateMovingCost(inputs: MovingCostInputs): MovingCostResult {
  const {
    currency,
    moveType,
    distance,
    homeSize,
    moveMethod,
    season,
    needsPacking,
    hasSpecialItems,
    needsStorage,
    storageMonths,
    needsCleaning,
    hasStairs,
    requiresElevator,
  } = inputs;

  const costItems: CostItem[] = [];
  const baseCost = BASE_MOVING_COSTS[currency][homeSize];
  const perMile = COST_PER_MILE[currency];
  const weight = WEIGHT_BY_SIZE[homeSize];

  // Method multiplier
  const methodMultiplier = moveMethod === 'diy' ? 0.3 : moveMethod === 'hybrid' ? 0.6 : 1.0;

  // Season multiplier (peak = summer months)
  const seasonMultiplier = season === 'peak' ? 1.25 : 1.0;

  // Calculate base moving service cost
  let movingServiceCost = baseCost * methodMultiplier;

  // Add distance-based costs
  if (moveType === 'long_distance' || moveType === 'cross_country') {
    // Long distance is typically charged by weight and distance
    const weightCost = (weight / 100) * perMile * distance;
    movingServiceCost += weightCost;
  } else if (moveType === 'international') {
    // International moves are significantly more expensive
    movingServiceCost *= 5;
    movingServiceCost += distance * perMile * 0.5;
  } else {
    // Local moves - add hourly-based distance cost
    movingServiceCost += Math.min(distance, 50) * perMile * 10;
  }

  // Apply season premium
  movingServiceCost *= seasonMultiplier;

  costItems.push({
    category: 'Moving Service',
    amount: Math.round(movingServiceCost),
    description:
      moveMethod === 'diy'
        ? 'Truck rental and equipment'
        : moveMethod === 'hybrid'
          ? 'Labor only (you pack)'
          : 'Full service movers',
    isOptional: false,
  });

  // Packing costs
  let packingCost = 0;
  if (needsPacking) {
    packingCost = baseCost * 0.4;
    costItems.push({
      category: 'Professional Packing',
      amount: Math.round(packingCost),
      description: 'Movers pack all your belongings',
      isOptional: true,
    });
  }

  // Supplies cost
  const suppliesCost =
    moveMethod === 'diy' ? baseCost * 0.15 : needsPacking ? baseCost * 0.05 : baseCost * 0.1;
  costItems.push({
    category: 'Packing Supplies',
    amount: Math.round(suppliesCost),
    description: 'Boxes, tape, bubble wrap, etc.',
    isOptional: false,
  });

  // Special items
  let specialItemsCost = 0;
  if (hasSpecialItems) {
    specialItemsCost = currency === 'USD' ? 500 : currency === 'GBP' ? 400 : 450;
    costItems.push({
      category: 'Special Items Handling',
      amount: Math.round(specialItemsCost),
      description: 'Piano, antiques, artwork, etc.',
      isOptional: true,
    });
  }

  // Storage costs
  let storageCost = 0;
  if (needsStorage && storageMonths > 0) {
    const monthlyStorage = currency === 'USD' ? 150 : currency === 'GBP' ? 120 : 135;
    const sizeMultiplier =
      homeSize === 'studio'
        ? 0.5
        : homeSize === 'one_bed'
          ? 0.75
          : homeSize === 'two_bed'
            ? 1
            : homeSize === 'three_bed'
              ? 1.5
              : 2;
    storageCost = monthlyStorage * sizeMultiplier * storageMonths;
    costItems.push({
      category: 'Storage',
      amount: Math.round(storageCost),
      description: `${storageMonths} month(s) of storage`,
      isOptional: true,
    });
  }

  // Cleaning costs
  let cleaningCost = 0;
  if (needsCleaning) {
    cleaningCost = currency === 'USD' ? 200 : currency === 'GBP' ? 150 : 175;
    const cleaningSizeMultiplier =
      homeSize === 'studio'
        ? 0.5
        : homeSize === 'one_bed'
          ? 0.7
          : homeSize === 'four_plus'
            ? 1.5
            : 1;
    cleaningCost *= cleaningSizeMultiplier;
    costItems.push({
      category: 'Move-out Cleaning',
      amount: Math.round(cleaningCost),
      description: 'Professional deep cleaning',
      isOptional: true,
    });
  }

  // Access fees
  let accessFees = 0;
  if (hasStairs) {
    accessFees += currency === 'USD' ? 75 : currency === 'GBP' ? 60 : 70;
  }
  if (requiresElevator) {
    accessFees += currency === 'USD' ? 100 : currency === 'GBP' ? 80 : 90;
  }
  if (accessFees > 0) {
    costItems.push({
      category: 'Access Fees',
      amount: Math.round(accessFees),
      description:
        hasStairs && requiresElevator
          ? 'Stairs + elevator fees'
          : hasStairs
            ? 'Stairs fee'
            : 'Elevator fee',
      isOptional: false,
    });
  }

  // Insurance
  const insuranceCost = Math.round(movingServiceCost * 0.03);
  costItems.push({
    category: 'Moving Insurance',
    amount: insuranceCost,
    description: 'Basic liability coverage (upgrade recommended)',
    isOptional: false,
  });

  // Hidden costs estimate
  const hiddenCosts = Math.round(
    (currency === 'USD' ? 300 : currency === 'GBP' ? 250 : 275) *
      (moveType === 'cross_country' || moveType === 'international' ? 2 : 1)
  );
  costItems.push({
    category: 'Hidden Costs Buffer',
    amount: hiddenCosts,
    description: 'Deposits, temporary housing, unexpected fees',
    isOptional: false,
  });

  // Calculate totals
  const totalCost =
    movingServiceCost +
    packingCost +
    suppliesCost +
    specialItemsCost +
    storageCost +
    cleaningCost +
    accessFees +
    insuranceCost +
    hiddenCosts;

  // Estimate ranges (±20%)
  const lowEstimate = Math.round(totalCost * 0.8);
  const highEstimate = Math.round(totalCost * 1.2);

  // Calculate savings vs full service
  const fullServiceCost = baseCost * 1.0 * seasonMultiplier;
  const savingsVsFullService =
    moveMethod !== 'full_service' ? Math.round(fullServiceCost - movingServiceCost) : 0;

  // Cost per mile
  const costPerMile = distance > 0 ? totalCost / distance : 0;

  // Peak season premium
  const peakSeasonPremium = season === 'peak' ? Math.round(movingServiceCost * 0.25) : 0;

  // Tips
  const tips: string[] = [];
  if (season === 'peak') {
    tips.push('Moving in off-peak months (Oct-Apr) could save 20-25%');
  }
  if (moveMethod === 'full_service' && moveType === 'local') {
    tips.push('DIY with friends could save significantly on local moves');
  }
  if (!needsPacking) {
    tips.push('Start packing 4-6 weeks early to avoid last-minute stress');
  }
  if (moveType === 'cross_country') {
    tips.push('Get at least 3 quotes - prices vary widely for long distance');
  }
  if (needsStorage) {
    tips.push('Declutter before storing - every box costs money monthly');
  }
  tips.push('Book movers 4-6 weeks in advance for best rates');

  return {
    currency,
    totalCost: Math.round(totalCost),
    lowEstimate,
    highEstimate,
    costItems,
    movingServiceCost: Math.round(movingServiceCost),
    packingCost: Math.round(packingCost),
    suppliesCost: Math.round(suppliesCost),
    storageCost: Math.round(storageCost),
    insuranceCost,
    hiddenCosts,
    costPerMile: Math.round(costPerMile * 100) / 100,
    savingsVsFullService,
    peakSeasonPremium,
    tips,
  };
}
