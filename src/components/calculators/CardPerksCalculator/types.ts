/**
 * UK Card Rewards & Perks Calculator types. Every row is issuer-published; estimates only.
 */

export const CARD_TYPES = ['credit', 'charge', 'debit', 'bnpl', 'plan'] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const CARD_TYPE_LABELS: Readonly<Record<CardType, string>> = {
  credit: 'Credit card',
  charge: 'Charge card',
  debit: 'Debit card',
  bnpl: 'Debit + BNPL',
  plan: 'Paid account plan',
};

export const SPEND_CATEGORIES = ['groceries', 'travel', 'dining', 'other'] as const;
export type SpendCategory = (typeof SPEND_CATEGORIES)[number];

export const SPEND_CATEGORY_LABELS: Readonly<Record<SpendCategory, string>> = {
  groceries: 'Supermarkets',
  travel: 'Flights & hotels',
  dining: 'Eating out',
  other: 'Everything else',
};

/** Reward currencies. `cashback` is pence of cash back per unit (1 unit = 1p). */
export const POINT_CURRENCIES = [
  'avios',
  'membershipRewards',
  'virginPoints',
  'nectar',
  'clubcard',
  'revpoints',
  'cashback',
  'none',
] as const;
export type PointCurrency = (typeof POINT_CURRENCIES)[number];

export const POINT_CURRENCY_LABELS: Readonly<Record<PointCurrency, string>> = {
  avios: 'Avios',
  membershipRewards: 'Membership Rewards',
  virginPoints: 'Virgin Points',
  nectar: 'Nectar points',
  clubcard: 'Clubcard points',
  revpoints: 'RevPoints',
  cashback: 'Cashback',
  none: 'No rewards',
};

export type TravelInsurance = 'none' | 'basic' | 'comprehensive';

export interface WelcomeBonus {
  /** Units of the card's currency (points or pence for cashback). */
  readonly units: number;
  /** GBP spend needed inside the window. */
  readonly minSpend: number;
  readonly windowDays: number;
  /** Intro cashback % on window spend; `units` is then the cap in pence. null = flat bonus. */
  readonly introRatePct: number | null;
  /** Eligibility caveat shown verbatim, e.g. "No Amex card held in the last 24 months". */
  readonly note: string;
}

export interface LoungeAccess {
  readonly network: string;
  /** Included visits per year; null = unlimited. */
  readonly visitsPerYear: number | null;
  /** GBP the cardholder pays per visit; 0 = free. Covers discounted-pass schemes. */
  readonly pricePerVisit: number;
  /** GBP per guest visit; null = not offered. */
  readonly guestFee: number | null;
}

export interface CompanionVoucher {
  /** GBP annual card spend that earns the voucher. */
  readonly spendThreshold: number;
  readonly note: string;
}

export interface CardProduct {
  /** Stable kebab-case id, used as row key and in URLs. */
  readonly id: string;
  readonly name: string;
  readonly issuer: string;
  readonly type: CardType;
  readonly network: 'amex' | 'visa' | 'mastercard';
  /** Annual GBP fee: first year and ongoing (monthly plans stored as x12). */
  readonly fee: { readonly year1: number; readonly ongoing: number };
  /** Representative APR (variable), null for products with no credit line. */
  readonly representativeApr: number | null;
  /** Purchase rate % p.a. variable, what a carried balance costs; the representative APR also bakes in the fee. */
  readonly purchaseApr: number | null;
  /** Units earned per GBP 1 spent, per category. 0 = nothing. */
  readonly earn: Readonly<Record<SpendCategory, number>>;
  /** Higher rate once total annual spend passes `fromSpend` (Amex cashback step-ups). */
  readonly tier2: {
    readonly fromSpend: number;
    readonly earn: Readonly<Record<SpendCategory, number>>;
  } | null;
  /** Annual GBP cap on reward value (monthly caps stored as x12); null = uncapped. */
  readonly rewardsCapGbp: number | null;
  readonly currency: PointCurrency;
  readonly welcomeBonus: WelcomeBonus | null;
  /** Non-sterling transaction fee, percent. */
  readonly fxFeePct: number;
  readonly lounge: LoungeAccess | null;
  readonly travelInsurance: TravelInsurance;
  readonly purchaseProtection: boolean;
  /** Consumer Credit Act s75 applies (credit and charge cards only). */
  readonly section75: boolean;
  readonly companionVoucher: CompanionVoucher | null;
  /** Free text: BNPL terms, fast track, spend caps, acceptance. Shown in the expanded row. */
  readonly notes: readonly string[];
  /** Minimum income requirement in GBP, null if none published. */
  readonly minIncome: number | null;
  readonly sourceUrl: string;
  /** ISO yyyy-mm-dd. */
  readonly lastVerified: string;
}

export const HORIZONS = ['ongoing', 'year1'] as const;
export type Horizon = (typeof HORIZONS)[number];

export const SORT_KEYS = ['net', 'rewards', 'perks', 'fees', 'fx'] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_LABELS: Readonly<Record<SortKey, string>> = {
  net: 'Highest net value',
  rewards: 'Most rewards',
  perks: 'Most perks value',
  fees: 'Lowest fees',
  fx: 'Cheapest abroad',
};

export interface CardPerksInputs {
  /** Annual GBP spend per category. */
  readonly spend: Readonly<Record<SpendCategory, number>>;
  /** Annual GBP spend in foreign currency (subset of the above, used for FX cost only). */
  readonly spendAbroad: number;
  readonly loungeVisits: number;
  readonly clearsBalance: boolean;
  /** Average GBP balance carried month to month when not clearing. */
  readonly carriedBalance: number;
  readonly horizon: Horizon;
  /** Pence per unit for each currency; user-adjustable, defaults from data/pointValues.ts. */
  readonly pointValuePence: Readonly<Record<PointCurrency, number>>;
  /** GBP the user puts on one lounge visit (before any per-visit price the card charges). */
  readonly loungeVisitValue: number;
  /** GBP per year the user puts on comprehensive card travel insurance. */
  readonly insuranceValue: number;
  /** GBP the user puts on one BA companion voucher. */
  readonly voucherValue: number;
  /** Empty = all types. */
  readonly types: readonly CardType[];
  readonly loungeOnly: boolean;
  readonly noFeeOnly: boolean;
  readonly sortKey: SortKey;
}

export interface ValueBreakdown {
  readonly rewards: number;
  readonly welcome: number;
  readonly lounge: number;
  readonly insurance: number;
  readonly voucher: number;
  readonly fee: number;
  readonly fx: number;
  readonly interest: number;
  /** Sum of the rounded components: rewards + welcome + lounge + insurance + voucher - fee - fx - interest. */
  readonly net: number;
  /** rewards / total spend, percent, 2dp; 0 when spend is 0. */
  readonly effectiveRewardRate: number;
}

export interface CardResult {
  readonly card: CardProduct;
  readonly breakdown: ValueBreakdown;
  /** 1-based rank in the current sort. */
  readonly rank: number;
  /** True when the welcome bonus was excluded because the spend window is not met. */
  readonly bonusMissed: boolean;
  /** True when the companion voucher threshold is not met. */
  readonly voucherMissed: boolean;
}

export interface CardPerksResult {
  readonly ranked: readonly CardResult[];
  readonly totalSpend: number;
  readonly hiddenCount: number;
  readonly totalCards: number;
}

/** The data-sourced assumptions the island injects; keeps types.ts and calculations.ts free of data imports. */
export interface DefaultAssumptions {
  readonly pointValuePence: Readonly<Record<PointCurrency, number>>;
  readonly loungeVisitValue: number;
  readonly insuranceValue: number;
  readonly voucherValue: number;
}

export function buildDefaultInputs(assumptions: DefaultAssumptions): CardPerksInputs {
  return {
    spend: { groceries: 4800, travel: 2000, dining: 1800, other: 6000 },
    spendAbroad: 1500,
    loungeVisits: 2,
    clearsBalance: true,
    carriedBalance: 1000,
    horizon: 'ongoing',
    pointValuePence: assumptions.pointValuePence,
    loungeVisitValue: assumptions.loungeVisitValue,
    insuranceValue: assumptions.insuranceValue,
    voucherValue: assumptions.voucherValue,
    types: [],
    loungeOnly: false,
    noFeeOnly: false,
    sortKey: 'net',
  };
}
