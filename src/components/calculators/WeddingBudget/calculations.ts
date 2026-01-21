/**
 * Wedding Budget Calculator - Calculation Logic
 */

import type {
  WeddingBudgetInputs,
  WeddingBudgetResult,
  CategoryAllocation,
  Priority,
  WeddingStyle,
} from './types';
import { BASE_PERCENTAGES, PRIORITY_MULTIPLIERS, AVERAGE_PER_GUEST } from './types';

const CATEGORY_TIPS: Record<string, Record<Priority, string[]>> = {
  venue: {
    low: [
      'Consider off-peak days (Friday/Sunday)',
      'Look for all-inclusive packages',
      'Public parks or family property',
    ],
    medium: ['Negotiate package deals', 'Ask about off-season discounts'],
    high: ['Premium venues book 12-18 months ahead', 'Ask about exclusive use'],
    splurge: ['Historic estates and luxury hotels', 'Destination venues available'],
  },
  catering: {
    low: ['Buffet style saves 20-30%', 'Limit bar to beer/wine', 'Brunch receptions cost less'],
    medium: ['Family-style service is elegant yet affordable', 'Signature cocktails vs full bar'],
    high: ['Plated multi-course dinners', 'Premium bar packages'],
    splurge: ['Celebrity chef or tasting menus', 'Custom cocktail experiences'],
  },
  photography: {
    low: ['Newer photographers offer quality at lower rates', 'Digital-only packages'],
    medium: ['8-hour coverage is standard', 'Ask about second shooters'],
    high: ['Full-day coverage with engagement shoot', 'Fine art albums included'],
    splurge: ['Top-tier photographers book 1-2 years out', 'Cinematography teams'],
  },
  flowers: {
    low: [
      'Seasonal flowers save significantly',
      'Greenery-heavy designs',
      'DIY with wholesale flowers',
    ],
    medium: ['Mix premium blooms with filler flowers', 'Repurpose ceremony flowers at reception'],
    high: ['Luxury blooms like peonies and garden roses', 'Dramatic installations'],
    splurge: ['Imported flowers, ceiling installations', 'Full venue transformation'],
  },
  music: {
    low: ['DJ with good reviews', 'Ceremony musician only', 'Curated playlist'],
    medium: ['Professional DJ with lighting', 'String quartet for ceremony'],
    high: ['Live band for reception', 'Multiple musicians throughout'],
    splurge: ['Full orchestra or famous performers', 'Custom entertainment'],
  },
  attire: {
    low: ['Sample sales and trunk shows', 'Pre-owned designer gowns', 'Suit rental'],
    medium: ['Mid-range designers', 'Custom tailoring included'],
    high: ['Designer gowns', 'Custom suits'],
    splurge: ['Haute couture and designer originals', 'Multiple outfit changes'],
  },
  decor: {
    low: ['DIY centerpieces', 'Candles and greenery', "Venue's existing decor"],
    medium: ['Rental furniture', 'Coordinated linens and place settings'],
    high: ['Custom installations', 'Specialty lighting'],
    splurge: ['Full venue transformation', 'Luxury rentals and custom builds'],
  },
};

const TYPICAL_RANGES: Record<string, Record<WeddingStyle, { min: number; max: number }>> = {
  venue: {
    budget: { min: 1000, max: 5000 },
    moderate: { min: 5000, max: 15000 },
    upscale: { min: 15000, max: 30000 },
    luxury: { min: 30000, max: 100000 },
  },
  catering: {
    budget: { min: 2000, max: 8000 },
    moderate: { min: 8000, max: 20000 },
    upscale: { min: 20000, max: 50000 },
    luxury: { min: 50000, max: 150000 },
  },
  photography: {
    budget: { min: 1000, max: 3000 },
    moderate: { min: 3000, max: 6000 },
    upscale: { min: 6000, max: 12000 },
    luxury: { min: 12000, max: 30000 },
  },
  flowers: {
    budget: { min: 500, max: 2000 },
    moderate: { min: 2000, max: 5000 },
    upscale: { min: 5000, max: 15000 },
    luxury: { min: 15000, max: 50000 },
  },
  music: {
    budget: { min: 500, max: 2000 },
    moderate: { min: 2000, max: 5000 },
    upscale: { min: 5000, max: 12000 },
    luxury: { min: 12000, max: 30000 },
  },
  attire: {
    budget: { min: 500, max: 2000 },
    moderate: { min: 2000, max: 5000 },
    upscale: { min: 5000, max: 10000 },
    luxury: { min: 10000, max: 30000 },
  },
  decor: {
    budget: { min: 300, max: 1500 },
    moderate: { min: 1500, max: 4000 },
    upscale: { min: 4000, max: 10000 },
    luxury: { min: 10000, max: 30000 },
  },
};

export function calculateWeddingBudget(inputs: WeddingBudgetInputs): WeddingBudgetResult {
  const { currency, totalBudget, guestCount, priorities } = inputs;

  // Determine budget tier
  const perGuestBudget = totalBudget / guestCount;
  const avgPerGuest = AVERAGE_PER_GUEST[currency];
  let budgetTier: WeddingStyle;

  if (perGuestBudget < avgPerGuest * 0.6) {
    budgetTier = 'budget';
  } else if (perGuestBudget < avgPerGuest * 1.2) {
    budgetTier = 'moderate';
  } else if (perGuestBudget < avgPerGuest * 2) {
    budgetTier = 'upscale';
  } else {
    budgetTier = 'luxury';
  }

  // Calculate adjusted percentages based on priorities
  const adjustedPercentages: Record<string, number> = {};
  let totalAdjusted = 0;

  // Apply priority multipliers to adjustable categories
  const priorityCategories = [
    'venue',
    'catering',
    'photography',
    'flowers',
    'music',
    'attire',
    'decor',
  ];

  for (const category of priorityCategories) {
    const priority = priorities[category as keyof typeof priorities] || 'medium';
    const multiplier = PRIORITY_MULTIPLIERS[priority];
    adjustedPercentages[category] = BASE_PERCENTAGES[category] * multiplier;
    totalAdjusted += adjustedPercentages[category];
  }

  // Add fixed categories
  const fixedCategories = ['stationery', 'transportation', 'favors', 'officiant'];
  for (const category of fixedCategories) {
    adjustedPercentages[category] = BASE_PERCENTAGES[category];
    totalAdjusted += adjustedPercentages[category];
  }

  // Normalize to 95% (leave 5% contingency)
  const normalizationFactor = 95 / totalAdjusted;
  for (const category in adjustedPercentages) {
    adjustedPercentages[category] *= normalizationFactor;
  }

  // Build allocations
  const allocations: CategoryAllocation[] = [];
  const categoryNames: Record<string, string> = {
    venue: 'Venue',
    catering: 'Catering & Bar',
    photography: 'Photography & Video',
    flowers: 'Flowers & Bouquets',
    music: 'Music & Entertainment',
    attire: 'Attire & Beauty',
    decor: 'Decor & Rentals',
    stationery: 'Stationery & Invites',
    transportation: 'Transportation',
    favors: 'Favors & Gifts',
    officiant: 'Officiant & License',
  };

  for (const [key, displayName] of Object.entries(categoryNames)) {
    const percentage = adjustedPercentages[key];
    const amount = Math.round((totalBudget * percentage) / 100);
    const priority = priorities[key as keyof typeof priorities] || 'medium';

    const rangeData = TYPICAL_RANGES[key]?.[budgetTier] || { min: 0, max: 0 };
    const currencyMultiplier = currency === 'GBP' ? 0.75 : currency === 'EUR' ? 0.9 : 1;
    const typicalRange = {
      min: Math.round(rangeData.min * currencyMultiplier),
      max: Math.round(rangeData.max * currencyMultiplier),
    };

    const tips = CATEGORY_TIPS[key]?.[priority] || [];

    allocations.push({
      category: displayName,
      percentage: Math.round(percentage * 10) / 10,
      amount,
      perGuestCost: Math.round((amount / guestCount) * 100) / 100,
      priority,
      typicalRange,
      tips,
    });
  }

  // Sort by amount descending
  allocations.sort((a, b) => b.amount - a.amount);

  // Calculate summary totals
  const venueAndCatering =
    ((adjustedPercentages.venue + adjustedPercentages.catering) * totalBudget) / 100;
  const vendorServices =
    ((adjustedPercentages.photography + adjustedPercentages.music + adjustedPercentages.officiant) *
      totalBudget) /
    100;
  const personalTouches =
    ((adjustedPercentages.flowers +
      adjustedPercentages.attire +
      adjustedPercentages.decor +
      adjustedPercentages.stationery +
      adjustedPercentages.transportation +
      adjustedPercentages.favors) *
      totalBudget) /
    100;
  const contingency = totalBudget * 0.05;

  // Generate warnings
  const warnings: string[] = [];
  const costPerGuest = totalBudget / guestCount;

  if (costPerGuest < avgPerGuest * 0.4) {
    warnings.push(
      'Budget is tight for this guest count. Consider reducing guests or increasing budget.'
    );
  }
  if (guestCount > 200) {
    warnings.push('Large guest count significantly increases catering and venue costs.');
  }
  if (priorities.photography === 'low' && priorities.flowers === 'splurge') {
    warnings.push(
      "Consider: Photos last forever, flowers don't. Many regret skimping on photography."
    );
  }

  // Generate savings tips
  const savingsTips: string[] = [];

  if (guestCount > 100) {
    savingsTips.push(
      `Cutting ${Math.round(guestCount * 0.1)} guests saves ~${formatSimpleCurrency(costPerGuest * guestCount * 0.1, currency)}`
    );
  }
  savingsTips.push('Friday or Sunday weddings often cost 20-30% less than Saturday');
  savingsTips.push('Off-season (Nov-Mar) typically offers better vendor availability and pricing');
  if (priorities.catering === 'high' || priorities.catering === 'splurge') {
    savingsTips.push('Brunch or afternoon reception with lighter menu can save significantly');
  }

  return {
    currency,
    totalBudget,
    guestCount,
    costPerGuest: Math.round(costPerGuest),
    industryAveragePerGuest: avgPerGuest,
    allocations,
    venueAndCatering: Math.round(venueAndCatering),
    vendorServices: Math.round(vendorServices),
    personalTouches: Math.round(personalTouches),
    contingency: Math.round(contingency),
    budgetTier,
    warnings,
    savingsTips,
  };
}

function formatSimpleCurrency(value: number, currency: Currency): string {
  const symbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
  return `${symbol}${Math.round(value).toLocaleString()}`;
}
