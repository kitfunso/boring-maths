/**
 * SaaS Metrics Calculator - Type Definitions
 *
 * Calculate key SaaS metrics like MRR, ARR, LTV, CAC payback,
 * and health scores based on industry benchmarks.
 */

import type { Currency } from '../../../lib/regions';

export interface SaaSMetricsInputs {
  currency: Currency;

  /** Number of paying customers */
  customers: number;

  /** Average Revenue Per User (monthly) */
  arpu: number;

  /** Monthly churn rate (% of customers lost) */
  churnRate: number;

  /** Monthly growth rate (% new customers) */
  growthRate: number;

  /** Cost to Acquire Customer */
  cac: number;

  /** Gross margin percentage */
  grossMargin: number;

  /** Monthly operating expenses */
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

  /** Monthly Recurring Revenue */
  mrr: number;

  /** Annual Recurring Revenue */
  arr: number;

  /** Lifetime Value (simple calculation) */
  ltv: number;

  /** LTV to CAC ratio */
  ltvCacRatio: number;

  /** CAC Payback in months */
  cacPaybackMonths: number;

  /** Net Revenue Retention (simplified) */
  netRevenueRetention: number;

  /** Quick Ratio */
  quickRatio: number;

  /** Burn Rate */
  burnRate: number;

  /** Runway in months */
  runwayMonths: number;

  /** Magic Number */
  magicNumber: number;

  /** Rule of 40 score */
  ruleOf40: number;

  /** Health scores with benchmarks */
  healthScores: HealthScore[];

  /** 12-month projection */
  projections: GrowthProjection[];

  /** Overall health rating */
  overallHealth: 'excellent' | 'good' | 'warning' | 'poor';

  /** Key insights */
  insights: string[];
}

/** Industry benchmarks for SaaS metrics */
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
