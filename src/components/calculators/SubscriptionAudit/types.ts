/** Subscription Audit: tracks subscriptions with usage ratings to flag keep/review/cancel candidates and estimate savings, for USD/GBP/EUR. */

import type { Currency } from '../../../lib/regions';

export type BillingFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/** Usage rating: how often you actually use the subscription. */
export type UsageRating = 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';

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

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  frequency: BillingFrequency;
  category: SubscriptionCategory;
  usage: UsageRating;
  essential: boolean;
}

export interface SubscriptionAuditInputs {
  currency: Currency;

  subscriptions: Subscription[];

  /** User's estimated monthly spend (for comparison) */
  estimatedMonthlySpend: number;
}

export interface AnalyzedSubscription extends Subscription {
  /** Monthly cost (normalized) */
  monthlyCost: number;

  yearlyCost: number;

  /** Cost per use (based on usage rating) */
  costPerUse: number;

  recommendation: 'keep' | 'review' | 'cancel';

  reason: string;
}

export interface CategoryBreakdown {
  category: SubscriptionCategory;
  label: string;
  count: number;
  monthlyTotal: number;
  yearlyTotal: number;
  percentage: number;
}

export interface SubscriptionAuditResult {
  currency: Currency;

  totalMonthly: number;

  totalYearly: number;

  estimateComparison: {
    estimated: number;
    actual: number;
    difference: number;
    percentageOff: number;
  };

  analyzedSubscriptions: AnalyzedSubscription[];

  categoryBreakdown: CategoryBreakdown[];

  potentialSavings: {
    monthly: number;
    yearly: number;
    subscriptionsToCancel: number;
    subscriptionsToReview: number;
  };

  summary: {
    totalSubscriptions: number;
    essentialCount: number;
    nonEssentialCount: number;
    averagePerSubscription: number;
    costPerDay: number;
  };
}

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

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

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

export function getDefaultInputs(currency: Currency = 'USD'): SubscriptionAuditInputs {
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

export const DEFAULT_INPUTS: SubscriptionAuditInputs = getDefaultInputs('USD');
