/** formatEarn - crawlable earn-rate summary used by CardFactsTable.astro. */

import { describe, it, expect } from 'vitest';
import { formatEarn } from '../../src/components/calculators/CardPerksCalculator/formatEarn';
import type { CardProduct } from '../../src/components/calculators/CardPerksCalculator/types';

const BASE: Omit<CardProduct, 'earn' | 'tier2' | 'currency' | 'id' | 'name'> = {
  issuer: 'Test Bank',
  type: 'credit',
  network: 'visa',
  fee: { year1: 0, ongoing: 0 },
  representativeApr: 25,
  purchaseApr: 25,
  rewardsCapGbp: null,
  welcomeBonus: null,
  fxFeePct: 0,
  lounge: null,
  travelInsurance: 'none',
  purchaseProtection: false,
  section75: true,
  companionVoucher: null,
  notes: [],
  minIncome: null,
  sourceUrl: 'https://example.com',
  lastVerified: '2026-09-02',
};

const UNIFORM_AVIOS_CARD: CardProduct = {
  ...BASE,
  id: 'uniform-avios',
  name: 'Uniform Avios Card',
  earn: { groceries: 1, travel: 1, dining: 1, other: 1 },
  tier2: null,
  currency: 'avios',
};

const MIXED_NECTAR_CARD: CardProduct = {
  ...BASE,
  id: 'mixed-nectar',
  name: 'Mixed Nectar Card',
  earn: { groceries: 3, travel: 2, dining: 2, other: 2 },
  tier2: null,
  currency: 'nectar',
};

const CASHBACK_TIER2_CARD: CardProduct = {
  ...BASE,
  id: 'cashback-tier2',
  name: 'Cashback Tier2 Card',
  earn: { groceries: 0.5, travel: 0.5, dining: 0.5, other: 0.5 },
  tier2: {
    fromSpend: 10000,
    earn: { groceries: 1, travel: 1, dining: 1, other: 1 },
  },
  currency: 'cashback',
};

const NO_REWARDS_CARD: CardProduct = {
  ...BASE,
  id: 'no-rewards',
  name: 'No Rewards Card',
  earn: { groceries: 0, travel: 0, dining: 0, other: 0 },
  tier2: null,
  currency: 'none',
};

describe('formatEarn', () => {
  it('collapses a uniform points rate to one clause', () => {
    expect(formatEarn(UNIFORM_AVIOS_CARD)).toBe('1 Avios per £1');
  });

  it('splits a mixed points rate into a headline category and an elsewhere clause', () => {
    expect(formatEarn(MIXED_NECTAR_CARD)).toBe('3 Nectar points per £1 Supermarkets, 2 elsewhere');
  });

  it('renders uniform cashback with a tier2 step-up', () => {
    expect(formatEarn(CASHBACK_TIER2_CARD)).toBe(
      '0.5% cashback, rising to 1% cashback after £10,000 spend a year'
    );
  });

  it('reports "No rewards" for currency none', () => {
    expect(formatEarn(NO_REWARDS_CARD)).toBe('No rewards');
  });
});
