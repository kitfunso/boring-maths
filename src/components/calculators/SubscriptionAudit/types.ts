/**
 * Subscription Audit Calculator - Type Definitions
 *
 * Track and analyze subscription spending with usage ratings
 * to identify savings opportunities.
 */

import type { Currency } from '../../../lib/regions';

/**
 * Billing frequency options
 */
export type BillingFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Usage rating (how often you actually use the subscription)
 */
export type UsageRating = 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';

/**
 * Subscription category
 */
export type SubscriptionCategory =
  | 'streaming'
  | 'music'
  | 'gaming'
  | 'software'
  | 'news'
  | 'fitness'
  | 'food'
  | 'shopping'
  | 'cloud'
  | 'other';

/**
 * Individual subscription entry
 */
export interface Subscription {
  id: string;
  name: string;
  cost: number;
  frequency: BillingFrequency;
  category: SubscriptionCategory;
  usage: UsageRating;
  essential: boolean;
}

/**
 * Input values for the Subscription Audit Calculator
 */
export interface SubscriptionAuditInputs {
  /** Selected currency */
  currency: Currency;

  /** List of subscriptions */
  subscriptions: Subscription[];

  /** User's estimated monthly spend (for comparison) */
  estimatedMonthlySpend: number;
}

/**
 * Analyzed subscription with calculated values
 */
export interface AnalyzedSubscription extends Subscription {
  /** Monthly cost (normalized) */
  monthlyCost: number;

  /** Yearly cost */
  yearlyCost: number;

  /** Cost per use (based on usage rating) */
  costPerUse: number;

  /** Recommendation */
  recommendation: 'keep' | 'review' | 'cancel';

  /** Reason for recommendation */
  reason: string;
}

/**
 * Category breakdown
 */
export interface CategoryBreakdown {
  category: SubscriptionCategory;
  label: string;
  count: number;
  monthlyTotal: number;
  yearlyTotal: number;
  percentage: number;
}

/**
 * Calculated results from the Subscription Audit Calculator
 */
export interface SubscriptionAuditResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Total monthly cost */
  totalMonthly: number;

  /** Total yearly cost */
  totalYearly: number;

  /** User's estimate vs actual */
  estimateComparison: {
    estimated: number;
    actual: number;
    difference: number;
    percentageOff: number;
  };

  /** Analyzed subscriptions with recommendations */
  analyzedSubscriptions: AnalyzedSubscription[];

  /** Category breakdown */
  categoryBreakdown: CategoryBreakdown[];

  /** Potential savings */
  potentialSavings: {
    monthly: number;
    yearly: number;
    subscriptionsToCancel: number;
    subscriptionsToReview: number;
  };

  /** Summary stats */
  summary: {
    totalSubscriptions: number;
    essentialCount: number;
    nonEssentialCount: number;
    averagePerSubscription: number;
    costPerDay: number;
  };
}

/**
 * Category labels
 */
export const CATEGORY_LABELS: Record<SubscriptionCategory, string> = {
  streaming: 'Streaming (Video)',
  music: 'Music & Audio',
  gaming: 'Gaming',
  software: 'Software & Apps',
  news: 'News & Media',
  fitness: 'Fitness & Health',
  food: 'Food & Delivery',
  shopping: 'Shopping & Memberships',
  cloud: 'Cloud Storage',
  other: 'Other',
};

/**
 * Common subscription templates
 */
export const COMMON_SUBSCRIPTIONS: Array<{
  name: string;
  cost: number;
  frequency: BillingFrequency;
  category: SubscriptionCategory;
}> = [
  { name: 'Netflix', cost: 15.49, frequency: 'monthly', category: 'streaming' },
  { name: 'Spotify', cost: 11.99, frequency: 'monthly', category: 'music' },
  { name: 'Amazon Prime', cost: 139, frequency: 'yearly', category: 'shopping' },
  { name: 'Disney+', cost: 13.99, frequency: 'monthly', category: 'streaming' },
  { name: 'HBO Max', cost: 15.99, frequency: 'monthly', category: 'streaming' },
  { name: 'YouTube Premium', cost: 13.99, frequency: 'monthly', category: 'streaming' },
  { name: 'Apple Music', cost: 10.99, frequency: 'monthly', category: 'music' },
  { name: 'iCloud+', cost: 2.99, frequency: 'monthly', category: 'cloud' },
  { name: 'Google One', cost: 2.99, frequency: 'monthly', category: 'cloud' },
  { name: 'Dropbox', cost: 11.99, frequency: 'monthly', category: 'cloud' },
  { name: 'Microsoft 365', cost: 99.99, frequency: 'yearly', category: 'software' },
  { name: 'Adobe Creative Cloud', cost: 54.99, frequency: 'monthly', category: 'software' },
  { name: 'Gym Membership', cost: 40, frequency: 'monthly', category: 'fitness' },
  { name: 'Peloton', cost: 44, frequency: 'monthly', category: 'fitness' },
  { name: 'NYT Digital', cost: 17, frequency: 'monthly', category: 'news' },
  { name: 'Xbox Game Pass', cost: 16.99, frequency: 'monthly', category: 'gaming' },
  { name: 'PlayStation Plus', cost: 59.99, frequency: 'yearly', category: 'gaming' },
  { name: 'DoorDash DashPass', cost: 9.99, frequency: 'monthly', category: 'food' },
  { name: 'Costco Membership', cost: 65, frequency: 'yearly', category: 'shopping' },
];

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Create a new subscription
 */
export function createSubscription(partial?: Partial<Subscription>): Subscription {
  return {
    id: generateId(),
    name: '',
    cost: 0,
    frequency: 'monthly',
    category: 'other',
    usage: 'monthly',
    essential: false,
    ...partial,
  };
}

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): SubscriptionAuditInputs {
  // Adjust costs for currency
  const multiplier = currency === 'GBP' ? 0.8 : currency === 'EUR' ? 0.92 : 1;

  return {
    currency,
    subscriptions: [
      {
        id: generateId(),
        name: 'Netflix',
        cost: Math.round(15.49 * multiplier * 100) / 100,
        frequency: 'monthly',
        category: 'streaming',
        usage: 'weekly',
        essential: false,
      },
      {
        id: generateId(),
        name: 'Spotify',
        cost: Math.round(11.99 * multiplier * 100) / 100,
        frequency: 'monthly',
        category: 'music',
        usage: 'daily',
        essential: true,
      },
      {
        id: generateId(),
        name: 'Amazon Prime',
        cost: Math.round(139 * multiplier * 100) / 100,
        frequency: 'yearly',
        category: 'shopping',
        usage: 'weekly',
        essential: false,
      },
    ],
    estimatedMonthlySpend: Math.round(30 * multiplier),
  };
}

/**
 * Default input values
 */
export const DEFAULT_INPUTS: SubscriptionAuditInputs = getDefaultInputs('USD');
