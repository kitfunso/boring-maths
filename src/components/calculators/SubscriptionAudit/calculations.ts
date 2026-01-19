/**
 * Subscription Audit Calculator - Calculation Logic
 *
 * Pure functions for analyzing subscription spending.
 */

import type {
  SubscriptionAuditInputs,
  SubscriptionAuditResult,
  Subscription,
  AnalyzedSubscription,
  CategoryBreakdown,
  SubscriptionCategory,
  UsageRating,
  BillingFrequency,
} from './types';
import { CATEGORY_LABELS } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Convert any frequency to monthly cost
 */
function toMonthlyCost(cost: number, frequency: BillingFrequency): number {
  switch (frequency) {
    case 'weekly':
      return cost * 4.33; // Average weeks per month
    case 'monthly':
      return cost;
    case 'quarterly':
      return cost / 3;
    case 'yearly':
      return cost / 12;
    default:
      return cost;
  }
}

/**
 * Estimate uses per month based on usage rating
 */
function getUsesPerMonth(usage: UsageRating): number {
  switch (usage) {
    case 'daily':
      return 30;
    case 'weekly':
      return 4;
    case 'monthly':
      return 1;
    case 'rarely':
      return 0.25; // Once every 4 months
    case 'never':
      return 0;
    default:
      return 1;
  }
}

/**
 * Generate recommendation for a subscription
 */
function getRecommendation(
  subscription: Subscription,
  monthlyCost: number,
  costPerUse: number
): { recommendation: AnalyzedSubscription['recommendation']; reason: string } {
  // Never used = cancel
  if (subscription.usage === 'never') {
    return {
      recommendation: 'cancel',
      reason: "You're paying but never using this service",
    };
  }

  // Essential subscriptions get more leeway
  if (subscription.essential) {
    if (subscription.usage === 'rarely') {
      return {
        recommendation: 'review',
        reason: 'Marked as essential but rarely used - verify if still needed',
      };
    }
    return {
      recommendation: 'keep',
      reason: 'Essential service with regular usage',
    };
  }

  // Rarely used non-essential = cancel
  if (subscription.usage === 'rarely') {
    return {
      recommendation: 'cancel',
      reason: 'Rarely used and not essential - consider canceling',
    };
  }

  // High cost per use = review
  if (costPerUse > 10) {
    return {
      recommendation: 'review',
      reason: `High cost per use (${formatCurrencyByRegion(costPerUse, 'USD', 2)}) - look for cheaper alternatives`,
    };
  }

  // Monthly subscriptions used only monthly = review
  if (subscription.usage === 'monthly' && monthlyCost > 15) {
    return {
      recommendation: 'review',
      reason: 'Used only monthly - consider pay-per-use alternatives',
    };
  }

  return {
    recommendation: 'keep',
    reason: 'Good value based on your usage',
  };
}

/**
 * Analyze subscriptions and generate recommendations
 */
export function analyzeSubscriptions(inputs: SubscriptionAuditInputs): SubscriptionAuditResult {
  const { currency, subscriptions, estimatedMonthlySpend } = inputs;

  // Analyze each subscription
  const analyzedSubscriptions: AnalyzedSubscription[] = subscriptions.map((sub) => {
    const monthlyCost = toMonthlyCost(sub.cost, sub.frequency);
    const yearlyCost = monthlyCost * 12;
    const usesPerMonth = getUsesPerMonth(sub.usage);
    const costPerUse = usesPerMonth > 0 ? monthlyCost / usesPerMonth : monthlyCost;

    const { recommendation, reason } = getRecommendation(sub, monthlyCost, costPerUse);

    return {
      ...sub,
      monthlyCost,
      yearlyCost,
      costPerUse,
      recommendation,
      reason,
    };
  });

  // Calculate totals
  const totalMonthly = analyzedSubscriptions.reduce((sum, s) => sum + s.monthlyCost, 0);
  const totalYearly = totalMonthly * 12;

  // Estimate comparison
  const estimateComparison = {
    estimated: estimatedMonthlySpend,
    actual: totalMonthly,
    difference: totalMonthly - estimatedMonthlySpend,
    percentageOff:
      estimatedMonthlySpend > 0
        ? ((totalMonthly - estimatedMonthlySpend) / estimatedMonthlySpend) * 100
        : 0,
  };

  // Category breakdown
  const categoryMap = new Map<SubscriptionCategory, { count: number; total: number }>();

  analyzedSubscriptions.forEach((sub) => {
    const existing = categoryMap.get(sub.category) || { count: 0, total: 0 };
    categoryMap.set(sub.category, {
      count: existing.count + 1,
      total: existing.total + sub.monthlyCost,
    });
  });

  const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      label: CATEGORY_LABELS[category],
      count: data.count,
      monthlyTotal: data.total,
      yearlyTotal: data.total * 12,
      percentage: totalMonthly > 0 ? (data.total / totalMonthly) * 100 : 0,
    }))
    .sort((a, b) => b.monthlyTotal - a.monthlyTotal);

  // Potential savings
  const cancelSubs = analyzedSubscriptions.filter((s) => s.recommendation === 'cancel');
  const reviewSubs = analyzedSubscriptions.filter((s) => s.recommendation === 'review');

  const cancelSavings = cancelSubs.reduce((sum, s) => sum + s.monthlyCost, 0);
  // Estimate 50% savings on review items
  const reviewSavings = reviewSubs.reduce((sum, s) => sum + s.monthlyCost * 0.5, 0);

  const potentialSavings = {
    monthly: cancelSavings + reviewSavings,
    yearly: (cancelSavings + reviewSavings) * 12,
    subscriptionsToCancel: cancelSubs.length,
    subscriptionsToReview: reviewSubs.length,
  };

  // Summary stats
  const essentialCount = subscriptions.filter((s) => s.essential).length;
  const summary = {
    totalSubscriptions: subscriptions.length,
    essentialCount,
    nonEssentialCount: subscriptions.length - essentialCount,
    averagePerSubscription: subscriptions.length > 0 ? totalMonthly / subscriptions.length : 0,
    costPerDay: totalMonthly / 30,
  };

  return {
    currency,
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    totalYearly: Math.round(totalYearly * 100) / 100,
    estimateComparison: {
      ...estimateComparison,
      difference: Math.round(estimateComparison.difference * 100) / 100,
      percentageOff: Math.round(estimateComparison.percentageOff),
    },
    analyzedSubscriptions,
    categoryBreakdown,
    potentialSavings: {
      monthly: Math.round(potentialSavings.monthly * 100) / 100,
      yearly: Math.round(potentialSavings.yearly * 100) / 100,
      subscriptionsToCancel: potentialSavings.subscriptionsToCancel,
      subscriptionsToReview: potentialSavings.subscriptionsToReview,
    },
    summary: {
      ...summary,
      averagePerSubscription: Math.round(summary.averagePerSubscription * 100) / 100,
      costPerDay: Math.round(summary.costPerDay * 100) / 100,
    },
  };
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
