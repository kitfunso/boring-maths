import { describe, expect, it } from 'vitest';
import {
  computeResults,
  sortResults,
  valueFor,
} from '../../src/components/calculators/CardPerksCalculator/calculations';
import {
  buildDefaultInputs,
  type CardPerksInputs,
  type CardProduct,
  type CardResult,
  type DefaultAssumptions,
  type ValueBreakdown,
} from '../../src/components/calculators/CardPerksCalculator/types';

const FIXTURE_ASSUMPTIONS: DefaultAssumptions = {
  pointValuePence: {
    avios: 1,
    membershipRewards: 1,
    virginPoints: 0.7,
    nectar: 0.5,
    clubcard: 1,
    revpoints: 0.5,
    cashback: 1,
    none: 0,
  },
  loungeVisitValue: 25,
  insuranceValue: 30,
  voucherValue: 400,
};

/** Flat-earn credit card with a lounge and a companion voucher. */
const FLAT_CREDIT_CARD: CardProduct = {
  id: 'flat-credit-fixture',
  name: 'Flat Rewards Credit',
  issuer: 'Fixture Bank',
  type: 'credit',
  network: 'visa',
  fee: { year1: 0, ongoing: 100 },
  representativeApr: 25,
  earn: { groceries: 1, travel: 1, dining: 1, other: 1 },
  tier2: null,
  rewardsCapGbp: null,
  currency: 'avios',
  welcomeBonus: {
    units: 20000,
    minSpend: 3000,
    windowDays: 90,
    note: 'No fixture card held before',
  },
  fxFeePct: 3,
  lounge: { network: 'Fixture Lounge Club', visitsPerYear: 2, pricePerVisit: 0, guestFee: 20 },
  travelInsurance: 'comprehensive',
  purchaseProtection: true,
  section75: true,
  companionVoucher: { spendThreshold: 10000, note: 'One companion voucher per year' },
  notes: ['Flat 1 point per pound across all categories'],
  minIncome: 20000,
  sourceUrl: 'https://example.com/flat-credit',
  lastVerified: '2026-09-01',
};

/** Capped cashback debit card with a tier2 step-up rate. */
const CAPPED_CASHBACK_DEBIT: CardProduct = {
  id: 'capped-cashback-debit-fixture',
  name: 'Capped Cashback Debit',
  issuer: 'Fixture Bank',
  type: 'debit',
  network: 'mastercard',
  fee: { year1: 0, ongoing: 0 },
  representativeApr: null,
  earn: { groceries: 1, travel: 1, dining: 1, other: 1 },
  tier2: { fromSpend: 5000, earn: { groceries: 2, travel: 2, dining: 2, other: 2 } },
  rewardsCapGbp: 300,
  currency: 'cashback',
  welcomeBonus: null,
  fxFeePct: 0,
  lounge: null,
  travelInsurance: 'basic',
  purchaseProtection: false,
  section75: false,
  companionVoucher: null,
  notes: [],
  minIncome: null,
  sourceUrl: 'https://example.com/capped-cashback-debit',
  lastVerified: '2026-08-15',
};

/** Fee-free plan card with a pricePerVisit lounge and no rewards currency. */
const FEE_FREE_PLAN: CardProduct = {
  id: 'fee-free-plan-fixture',
  name: 'Fixture Free Plan',
  issuer: 'Fixture Neobank',
  type: 'plan',
  network: 'amex',
  fee: { year1: 0, ongoing: 0 },
  representativeApr: null,
  earn: { groceries: 0, travel: 0, dining: 0, other: 0 },
  tier2: null,
  rewardsCapGbp: null,
  currency: 'none',
  welcomeBonus: null,
  fxFeePct: 0,
  lounge: { network: 'Fixture Pass', visitsPerYear: null, pricePerVisit: 5, guestFee: null },
  travelInsurance: 'none',
  purchaseProtection: false,
  section75: false,
  companionVoucher: null,
  notes: ['Free tier of the fixture plan'],
  minIncome: null,
  sourceUrl: 'https://example.com/fee-free-plan',
  lastVerified: '2026-07-01',
};

const ZERO_SPEND = { groceries: 0, travel: 0, dining: 0, other: 0 };

function inputsWith(overrides: Partial<CardPerksInputs>): CardPerksInputs {
  return { ...buildDefaultInputs(FIXTURE_ASSUMPTIONS), ...overrides };
}

function stubResult(name: string, breakdown: Partial<ValueBreakdown>): CardResult {
  return {
    card: { ...FLAT_CREDIT_CARD, id: name.toLowerCase(), name },
    breakdown: {
      rewards: 0,
      welcome: 0,
      lounge: 0,
      insurance: 0,
      voucher: 0,
      fee: 0,
      fx: 0,
      interest: 0,
      net: 0,
      effectiveRewardRate: 0,
      ...breakdown,
    },
    rank: 0,
    bonusMissed: false,
    voucherMissed: false,
  };
}

describe('CardPerksCalculator calculations', () => {
  it('rewards: 1 Avios per GBP on 10,000 spend at 1p = 100', () => {
    const inputs = inputsWith({ spend: { ...ZERO_SPEND, groceries: 10000 } });
    expect(valueFor(FLAT_CREDIT_CARD, inputs).rewards).toBe(100);
  });

  it('category split: earn.groceries = 2 and 0 elsewhere earns only on groceries', () => {
    const card = { ...FLAT_CREDIT_CARD, earn: { groceries: 2, travel: 0, dining: 0, other: 0 } };
    const inputs = inputsWith({
      spend: { groceries: 1000, travel: 1000, dining: 1000, other: 1000 },
    });
    expect(valueFor(card, inputs).rewards).toBe(20);
  });

  it('welcome bonus: counted in year1 when the spend window is met', () => {
    const inputs = inputsWith({ horizon: 'year1', spend: { ...ZERO_SPEND, groceries: 15000 } });
    const result = valueFor(FLAT_CREDIT_CARD, inputs);
    expect(result.welcome).toBe(200);
    expect(result.bonusMissed).toBe(false);
  });

  it('welcome bonus: excluded and bonusMissed true when the window is not met', () => {
    const inputs = inputsWith({ horizon: 'year1', spend: { ...ZERO_SPEND, groceries: 1000 } });
    const result = valueFor(FLAT_CREDIT_CARD, inputs);
    expect(result.welcome).toBe(0);
    expect(result.bonusMissed).toBe(true);
  });

  it('welcome bonus: always excluded in ongoing, bonusMissed always false', () => {
    const inputs = inputsWith({ horizon: 'ongoing', spend: { ...ZERO_SPEND, groceries: 1000 } });
    const result = valueFor(FLAT_CREDIT_CARD, inputs);
    expect(result.welcome).toBe(0);
    expect(result.bonusMissed).toBe(false);
  });

  it('lounge: capped at visitsPerYear, unlimited when null, 0 when lounge is null, never below 0', () => {
    const capped = valueFor(FLAT_CREDIT_CARD, inputsWith({ loungeVisits: 5 }));
    expect(capped.lounge).toBe(50);

    const unlimited = valueFor(FEE_FREE_PLAN, inputsWith({ loungeVisits: 5 }));
    expect(unlimited.lounge).toBe(100);

    const noLounge = valueFor(CAPPED_CASHBACK_DEBIT, inputsWith({ loungeVisits: 5 }));
    expect(noLounge.lounge).toBe(0);

    const floored = valueFor(FEE_FREE_PLAN, inputsWith({ loungeVisits: 3, loungeVisitValue: 2 }));
    expect(floored.lounge).toBe(0);
  });

  it('tier2 applies only above fromSpend and rewardsCapGbp caps the GBP value', () => {
    const partial = valueFor(
      CAPPED_CASHBACK_DEBIT,
      inputsWith({ spend: { groceries: 2500, travel: 2500, dining: 2500, other: 2500 } })
    );
    expect(partial.rewards).toBe(150);

    const capped = valueFor(
      CAPPED_CASHBACK_DEBIT,
      inputsWith({ spend: { groceries: 25000, travel: 25000, dining: 25000, other: 25000 } })
    );
    expect(capped.rewards).toBe(300);
  });

  it('a card with neither tier2 nor a cap behaves as flat', () => {
    const flatCard = { ...CAPPED_CASHBACK_DEBIT, tier2: null, rewardsCapGbp: null };
    const result = valueFor(
      flatCard,
      inputsWith({ spend: { ...ZERO_SPEND, groceries: 1_000_000 } })
    );
    expect(result.rewards).toBe(10000);
  });

  it('insurance counts only for comprehensive', () => {
    expect(valueFor(FLAT_CREDIT_CARD, inputsWith({})).insurance).toBe(30);
    expect(valueFor(CAPPED_CASHBACK_DEBIT, inputsWith({})).insurance).toBe(0);
    expect(valueFor(FEE_FREE_PLAN, inputsWith({})).insurance).toBe(0);
  });

  it('voucher counts only when the threshold is met, voucherMissed set otherwise', () => {
    const met = valueFor(
      FLAT_CREDIT_CARD,
      inputsWith({ spend: { ...ZERO_SPEND, groceries: 10000 } })
    );
    expect(met.voucher).toBe(400);
    expect(met.voucherMissed).toBe(false);

    const missed = valueFor(
      FLAT_CREDIT_CARD,
      inputsWith({ spend: { ...ZERO_SPEND, groceries: 5000 } })
    );
    expect(missed.voucher).toBe(0);
    expect(missed.voucherMissed).toBe(true);

    const noVoucher = valueFor(
      CAPPED_CASHBACK_DEBIT,
      inputsWith({ spend: { ...ZERO_SPEND, groceries: 5000 } })
    );
    expect(noVoucher.voucher).toBe(0);
    expect(noVoucher.voucherMissed).toBe(false);
  });

  it('fee uses year1 vs ongoing by horizon', () => {
    expect(valueFor(FLAT_CREDIT_CARD, inputsWith({ horizon: 'year1' })).fee).toBe(0);
    expect(valueFor(FLAT_CREDIT_CARD, inputsWith({ horizon: 'ongoing' })).fee).toBe(100);
  });

  it('fx = spendAbroad * fxFeePct / 100', () => {
    expect(valueFor(FLAT_CREDIT_CARD, inputsWith({ spendAbroad: 1000 })).fx).toBe(30);
    expect(valueFor(FEE_FREE_PLAN, inputsWith({ spendAbroad: 500 })).fx).toBe(0);
  });

  it('interest is 0 when clearing, 0 when APR is null, else carriedBalance * apr / 100', () => {
    expect(
      valueFor(FLAT_CREDIT_CARD, inputsWith({ clearsBalance: true, carriedBalance: 1000 })).interest
    ).toBe(0);
    expect(
      valueFor(FLAT_CREDIT_CARD, inputsWith({ clearsBalance: false, carriedBalance: 1000 }))
        .interest
    ).toBe(250);
    expect(
      valueFor(CAPPED_CASHBACK_DEBIT, inputsWith({ clearsBalance: false, carriedBalance: 1000 }))
        .interest
    ).toBe(0);
  });

  it('every component is a whole number and net equals the sum of the displayed components', () => {
    const inputs = inputsWith({
      horizon: 'year1',
      spend: { groceries: 8000, travel: 3000, dining: 2000, other: 1000 },
      spendAbroad: 333,
      loungeVisits: 3,
      clearsBalance: false,
      carriedBalance: 777,
      pointValuePence: { ...FIXTURE_ASSUMPTIONS.pointValuePence, avios: 1.23 },
    });
    const b = valueFor(FLAT_CREDIT_CARD, inputs);
    for (const key of [
      'rewards',
      'welcome',
      'lounge',
      'insurance',
      'voucher',
      'fee',
      'fx',
      'interest',
      'net',
    ] as const) {
      expect(Number.isInteger(b[key])).toBe(true);
    }
    expect(b.net).toBe(
      b.rewards + b.welcome + b.lounge + b.insurance + b.voucher - b.fee - b.fx - b.interest
    );
  });

  it('sortResults: fees ascending, tie-break on net desc then name asc', () => {
    const results = [
      stubResult('Charlie', { fee: 20, net: 100 }),
      stubResult('Bravo', { fee: 20, net: 200 }),
      stubResult('Alpha', { fee: 20, net: 200 }),
      stubResult('Delta', { fee: 5, net: 1 }),
    ];
    const sorted = sortResults(results, 'fees');
    expect(sorted.map((r) => r.card.name)).toEqual(['Delta', 'Alpha', 'Bravo', 'Charlie']);
    expect(sorted.map((r) => r.rank)).toEqual([1, 2, 3, 4]);
  });

  it('sortResults: fx ascending', () => {
    const results = [
      stubResult('Zed', { fx: 25 }),
      stubResult('Yak', { fx: 5 }),
      stubResult('Xen', { fx: 15 }),
    ];
    expect(sortResults(results, 'fx').map((r) => r.card.name)).toEqual(['Yak', 'Xen', 'Zed']);
  });

  it('filters: types, loungeOnly, noFeeOnly narrow the ranked list and hiddenCount matches', () => {
    const cards = [FLAT_CREDIT_CARD, CAPPED_CASHBACK_DEBIT, FEE_FREE_PLAN];

    const byType = computeResults(inputsWith({ types: ['credit'] }), cards);
    expect(byType.ranked.map((r) => r.card.id)).toEqual([FLAT_CREDIT_CARD.id]);
    expect(byType.hiddenCount).toBe(2);

    const loungeOnly = computeResults(inputsWith({ loungeOnly: true }), cards);
    expect(loungeOnly.ranked.map((r) => r.card.id).sort()).toEqual(
      [FLAT_CREDIT_CARD.id, FEE_FREE_PLAN.id].sort()
    );
    expect(loungeOnly.hiddenCount).toBe(1);

    const noFeeOnly = computeResults(inputsWith({ noFeeOnly: true, horizon: 'ongoing' }), cards);
    expect(noFeeOnly.ranked.map((r) => r.card.id).sort()).toEqual(
      [CAPPED_CASHBACK_DEBIT.id, FEE_FREE_PLAN.id].sort()
    );
    expect(noFeeOnly.hiddenCount).toBe(1);
  });

  it('effectiveRewardRate is 0 when spend is 0, no NaN, including for a tier2 card', () => {
    const flat = valueFor(FLAT_CREDIT_CARD, inputsWith({ spend: ZERO_SPEND }));
    expect(flat.effectiveRewardRate).toBe(0);
    expect(Number.isNaN(flat.effectiveRewardRate)).toBe(false);

    const tiered = valueFor(CAPPED_CASHBACK_DEBIT, inputsWith({ spend: ZERO_SPEND }));
    expect(tiered.rewards).toBe(0);
    expect(tiered.effectiveRewardRate).toBe(0);
    expect(Number.isNaN(tiered.effectiveRewardRate)).toBe(false);
  });

  it('effectiveRewardRate uses the unrounded rewards value', () => {
    const card = { ...FLAT_CREDIT_CARD, earn: { groceries: 1, travel: 0, dining: 0, other: 0 } };
    const inputs = inputsWith({
      spend: { ...ZERO_SPEND, groceries: 1000 },
      pointValuePence: { ...FIXTURE_ASSUMPTIONS.pointValuePence, avios: 1.56 },
    });
    const result = valueFor(card, inputs);
    expect(result.rewards).toBe(16);
    expect(result.effectiveRewardRate).toBeCloseTo(1.56, 2);
  });

  it('hiddenCount counts against the cards argument, not any module-level list', () => {
    const result = computeResults(inputsWith({ types: ['debit'] }), [FLAT_CREDIT_CARD]);
    expect(result.totalCards).toBe(1);
    expect(result.hiddenCount).toBe(1);
    expect(result.ranked).toHaveLength(0);
  });

  it('rank is 1-based and contiguous', () => {
    const result = computeResults(inputsWith({}), [
      FLAT_CREDIT_CARD,
      CAPPED_CASHBACK_DEBIT,
      FEE_FREE_PLAN,
    ]);
    expect(result.ranked.map((r) => r.rank)).toEqual([1, 2, 3]);
  });
});
