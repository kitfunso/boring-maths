/**
 * Streaming Value Calculator - Type Definitions
 */

export type ValueRating = 'great' | 'good' | 'fair' | 'poor';

export interface StreamingService {
  readonly name: string;
  readonly monthlyPrice: number;
  readonly hoursWatchedPerMonth: number;
  readonly enabled: boolean;
}

export interface StreamingValueInputs {
  readonly subscriptions: StreamingService[];
}

export interface ServiceMetric {
  readonly name: string;
  readonly costPerHour: number;
  readonly monthlyPrice: number;
  readonly hoursWatched: number;
  readonly valueRating: ValueRating;
}

export interface StreamingValueResult {
  readonly totalMonthlyCost: number;
  readonly totalYearlyCost: number;
  readonly perServiceMetrics: readonly ServiceMetric[];
  readonly bestValue: string;
  readonly worstValue: string;
  readonly recommendedCut: string;
}

export const STREAMING_PRESETS: readonly Omit<StreamingService, 'enabled'>[] = [
  { name: 'Netflix', monthlyPrice: 15.49, hoursWatchedPerMonth: 20 },
  { name: 'Disney+', monthlyPrice: 13.99, hoursWatchedPerMonth: 8 },
  { name: 'HBO Max', monthlyPrice: 15.99, hoursWatchedPerMonth: 10 },
  { name: 'Hulu', monthlyPrice: 17.99, hoursWatchedPerMonth: 12 },
  { name: 'Amazon Prime', monthlyPrice: 14.99, hoursWatchedPerMonth: 15 },
  { name: 'Apple TV+', monthlyPrice: 9.99, hoursWatchedPerMonth: 5 },
  { name: 'Paramount+', monthlyPrice: 12.99, hoursWatchedPerMonth: 6 },
  { name: 'Peacock', monthlyPrice: 7.99, hoursWatchedPerMonth: 4 },
  { name: 'YouTube Premium', monthlyPrice: 13.99, hoursWatchedPerMonth: 25 },
  { name: 'Spotify', monthlyPrice: 11.99, hoursWatchedPerMonth: 30 },
];

export function getDefaultInputs(): StreamingValueInputs {
  return {
    subscriptions: STREAMING_PRESETS.map((preset) => ({
      ...preset,
      enabled: false,
    })),
  };
}
