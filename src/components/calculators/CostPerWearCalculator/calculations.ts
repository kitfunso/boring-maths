/**
 * Cost Per Wear Calculator - Calculation Logic
 */

import type { CostPerWearInputs, CostPerWearResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Calculate cost per wear and compare against an alternative item.
 */
export function calculateCostPerWear(inputs: CostPerWearInputs): CostPerWearResult {
  const {
    purchasePrice,
    wearsPerMonth,
    expectedLifespanMonths,
    careCostPerMonth,
    alternativePrice,
    alternativeWearsPerMonth,
    alternativeLifespanMonths,
  } = inputs;

  // Main item
  const totalWears = wearsPerMonth * expectedLifespanMonths;
  const totalCareCost = careCostPerMonth * expectedLifespanMonths;
  const totalLifetimeCost = purchasePrice + totalCareCost;
  const costPerWear = totalWears > 0 ? totalLifetimeCost / totalWears : 0;
  const annualCost = expectedLifespanMonths > 0
    ? (totalLifetimeCost / expectedLifespanMonths) * 12
    : 0;

  // Alternative item (no separate care cost; baked into replacement frequency)
  const altTotalWears = alternativeWearsPerMonth * alternativeLifespanMonths;
  const alternativeCostPerWear = altTotalWears > 0
    ? alternativePrice / altTotalWears
    : 0;

  // To compare fairly over the same lifespan as the main item,
  // figure out how many replacement cycles the alternative needs.
  const replacementCycles = alternativeLifespanMonths > 0
    ? Math.ceil(expectedLifespanMonths / alternativeLifespanMonths)
    : 1;
  const alternativeTotalCost = alternativePrice * replacementCycles;

  const isBetterValue = costPerWear <= alternativeCostPerWear;
  const savingsVsAlternative = alternativeTotalCost - totalLifetimeCost;

  const verdict = buildVerdict(costPerWear, isBetterValue, savingsVsAlternative);

  return {
    costPerWear: round2(costPerWear),
    totalWears,
    annualCost: round2(annualCost),
    totalLifetimeCost: round2(totalLifetimeCost),
    alternativeCostPerWear: round2(alternativeCostPerWear),
    alternativeTotalCost: round2(alternativeTotalCost),
    isBetterValue,
    savingsVsAlternative: round2(savingsVsAlternative),
    verdict,
  };
}

function buildVerdict(
  costPerWear: number,
  isBetterValue: boolean,
  savings: number
): string {
  if (costPerWear <= 1) {
    return 'Great value! Under $1 per wear is the gold standard for wardrobe investments.';
  }
  if (costPerWear <= 5) {
    if (isBetterValue) {
      return 'Solid investment. Lower cost per wear than the alternative, and well within reasonable range.';
    }
    return 'Reasonable cost per wear, but the cheaper alternative may serve you just as well.';
  }
  if (isBetterValue && savings > 0) {
    return 'Higher cost per wear, but still cheaper overall than repeatedly buying the alternative.';
  }
  return 'Consider whether this item earns its price. The alternative may be the smarter buy.';
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  return formatCurrencyByRegion(value, currency, 2);
}
