import type { Currency } from '../../../lib/regions';

export interface SaaSMetricsInputs {
  currency: Currency;

  customers: number;

  arpu: number;

  churnRate: number;

  growthRate: number;

  cac: number;

  grossMargin: number;

  monthlyOpex: number;
}

export interface HealthScore {
  metric: string;
  value: number | string;
  benchmark: string;
  score: 'excellent' | 'good' | 'warning' | 'poor';
  insight: string;
}

export interface GrowthProjection {
  month: number;
  customers: number;
  mrr: number;
  arr: number;
  cumulativeRevenue: number;
}

export interface SaaSMetricsResult {
  currency: Currency;

  mrr: number;

  arr: number;

  ltv: number;

  ltvCacRatio: number;

  cacPaybackMonths: number;

  netRevenueRetention: number;

  quickRatio: number;

  burnRate: number;

  runwayMonths: number;

  magicNumber: number;

  ruleOf40: number;

  healthScores: HealthScore[];

  projections: GrowthProjection[];

  overallHealth: 'excellent' | 'good' | 'warning' | 'poor';

  insights: string[];
}

export const BENCHMARKS = {
  ltvCacRatio: {
    excellent: 5,
    good: 3,
    warning: 2,
    poor: 1,
  },
  cacPaybackMonths: {
    excellent: 6,
    good: 12,
    warning: 18,
    poor: 24,
  },
  churnRate: {
    excellent: 2,
    good: 5,
    warning: 7,
    poor: 10,
  },
  grossMargin: {
    excellent: 80,
    good: 70,
    warning: 60,
    poor: 50,
  },
  quickRatio: {
    excellent: 4,
    good: 2,
    warning: 1,
    poor: 0.5,
  },
  ruleOf40: {
    excellent: 60,
    good: 40,
    warning: 20,
    poor: 0,
  },
};

export function getDefaultInputs(currency: Currency = 'USD'): SaaSMetricsInputs {
  const multiplier = currency === 'GBP' ? 0.8 : currency === 'EUR' ? 0.9 : 1;

  return {
    currency,
    customers: 100,
    arpu: Math.round(99 * multiplier),
    churnRate: 5,
    growthRate: 10,
    cac: Math.round(500 * multiplier),
    grossMargin: 75,
    monthlyOpex: Math.round(15000 * multiplier),
  };
}

export const DEFAULT_INPUTS: SaaSMetricsInputs = getDefaultInputs('USD');
