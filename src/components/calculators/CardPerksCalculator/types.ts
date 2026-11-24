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
  readonly units: number;
  readonly minSpend: number;
  readonly windowDays: number;
  readonly introRatePct: number | null;
  readonly note: string;
}

export interface LoungeAccess {
  readonly network: string;
  readonly visitsPerYear: number | null;
  readonly pricePerVisit: number;
  readonly guestFee: number | null;
}

export interface CompanionVoucher {
  readonly spendThreshold: number;
  readonly note: string;
}

export interface CardProduct {
  readonly id: string;
  readonly name: string;
  readonly issuer: string;
  readonly type: CardType;
  readonly network: 'amex' | 'visa' | 'mastercard';
  readonly fee: { readonly year1: number; readonly ongoing: number };
  readonly representativeApr: number | null;
  readonly purchaseApr: number | null;
  readonly earn: Readonly<Record<SpendCategory, number>>;
  readonly tier2: {
    readonly fromSpend: number;
    readonly earn: Readonly<Record<SpendCategory, number>>;
  } | null;
  readonly rewardsCapGbp: number | null;
  readonly currency: PointCurrency;
  readonly welcomeBonus: WelcomeBonus | null;
  readonly fxFeePct: number;
  readonly lounge: LoungeAccess | null;
  readonly travelInsurance: TravelInsurance;
  readonly purchaseProtection: boolean;
  readonly section75: boolean;
  readonly companionVoucher: CompanionVoucher | null;
  readonly notes: readonly string[];
  readonly minIncome: number | null;
  readonly sourceUrl: string;
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
  readonly spend: Readonly<Record<SpendCategory, number>>;
  readonly spendAbroad: number;
  readonly loungeVisits: number;
  readonly clearsBalance: boolean;
  readonly carriedBalance: number;
  readonly horizon: Horizon;
  readonly pointValuePence: Readonly<Record<PointCurrency, number>>;
  readonly loungeVisitValue: number;
  readonly insuranceValue: number;
  readonly voucherValue: number;
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
  readonly net: number;
  readonly effectiveRewardRate: number;
}

export interface CardResult {
  readonly card: CardProduct;
  readonly breakdown: ValueBreakdown;
  readonly rank: number;
  readonly bonusMissed: boolean;
  readonly voucherMissed: boolean;
}

export interface CardPerksResult {
  readonly ranked: readonly CardResult[];
  readonly totalSpend: number;
  readonly hiddenCount: number;
  readonly totalCards: number;
}

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
