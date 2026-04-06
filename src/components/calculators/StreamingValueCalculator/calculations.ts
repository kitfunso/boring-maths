/**
 * Streaming Value Calculator - Calculation Logic
 */

import type {
  StreamingValueInputs,
  StreamingValueResult,
  ServiceMetric,
  ValueRating,
} from './types';

/**
 * Determine value rating based on cost per hour.
 * Under $1/hr = great, $1-2 = good, $2-4 = fair, above $4 = poor.
 */
function rateValue(costPerHour: number): ValueRating {
  if (costPerHour <= 1) return 'great';
  if (costPerHour <= 2) return 'good';
  if (costPerHour <= 4) return 'fair';
  return 'poor';
}

/**
 * Calculate streaming value metrics for all enabled subscriptions.
 */
export function calculateStreamingValue(inputs: StreamingValueInputs): StreamingValueResult {
  const enabled = inputs.subscriptions.filter((s) => s.enabled);

  if (enabled.length === 0) {
    return {
      totalMonthlyCost: 0,
      totalYearlyCost: 0,
      perServiceMetrics: [],
      bestValue: '',
      worstValue: '',
      recommendedCut: '',
    };
  }

  const perServiceMetrics: ServiceMetric[] = enabled.map((service) => {
    const costPerHour =
      service.hoursWatchedPerMonth > 0
        ? Math.round((service.monthlyPrice / service.hoursWatchedPerMonth) * 100) / 100
        : Infinity;

    return {
      name: service.name,
      costPerHour: costPerHour === Infinity ? 999.99 : costPerHour,
      monthlyPrice: service.monthlyPrice,
      hoursWatched: service.hoursWatchedPerMonth,
      valueRating: service.hoursWatchedPerMonth > 0 ? rateValue(costPerHour) : 'poor',
    };
  });

  const sorted = [...perServiceMetrics].sort((a, b) => a.costPerHour - b.costPerHour);

  const totalMonthlyCost = Math.round(
    enabled.reduce((sum, s) => sum + s.monthlyPrice, 0) * 100
  ) / 100;

  const totalYearlyCost = Math.round(totalMonthlyCost * 12 * 100) / 100;

  const bestValue = sorted[0]?.name ?? '';
  const worstValue = sorted[sorted.length - 1]?.name ?? '';

  // Recommend cutting the service with the worst cost-per-hour ratio
  const recommendedCut =
    sorted.length > 1 && sorted[sorted.length - 1].valueRating === 'poor'
      ? sorted[sorted.length - 1].name
      : '';

  return {
    totalMonthlyCost,
    totalYearlyCost,
    perServiceMetrics: sorted,
    bestValue,
    worstValue,
    recommendedCut,
  };
}

/**
 * Format a dollar amount with 2 decimal places.
 */
export function formatDollars(value: number): string {
  return `$${value.toFixed(2)}`;
}

/**
 * Format cost per hour for display.
 */
export function formatCostPerHour(value: number): string {
  if (value >= 999) return '$--';
  return `$${value.toFixed(2)}/hr`;
}
