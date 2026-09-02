/** Pure value-formula functions. No data/ import: cards are always passed in by the caller. */

import type {
  CardPerksInputs,
  CardPerksResult,
  CardProduct,
  CardResult,
  SortKey,
  ValueBreakdown,
} from './types';
import { SPEND_CATEGORIES } from './types';

function sumSpend(spend: Readonly<Record<(typeof SPEND_CATEGORIES)[number], number>>): number {
  return SPEND_CATEGORIES.reduce((total, category) => total + spend[category], 0);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function rawRewardsFor(card: CardProduct, inputs: CardPerksInputs, totalSpend: number): number {
  const shareBelow =
    card.tier2 === null ? 1 : totalSpend === 0 ? 1 : Math.min(1, card.tier2.fromSpend / totalSpend);
  const shareAbove = card.tier2 === null ? 0 : 1 - shareBelow;
  let units = 0;
  for (const category of SPEND_CATEGORIES) {
    const tier2Rate = card.tier2 ? card.tier2.earn[category] : 0;
    const rate =
      card.tier2 === null
        ? card.earn[category]
        : shareBelow * card.earn[category] + shareAbove * tier2Rate;
    units += inputs.spend[category] * rate;
  }
  const gbpValue = (units * inputs.pointValuePence[card.currency]) / 100;
  return card.rewardsCapGbp === null ? gbpValue : Math.min(gbpValue, card.rewardsCapGbp);
}

function welcomeFor(
  card: CardProduct,
  inputs: CardPerksInputs,
  totalSpend: number
): { welcome: number; bonusMissed: boolean } {
  if (inputs.horizon !== 'year1' || card.welcomeBonus === null)
    return { welcome: 0, bonusMissed: false };
  const { units, minSpend, windowDays, introRatePct } = card.welcomeBonus;
  const windowSpend = totalSpend * (windowDays / 365);
  if (windowSpend <= 0 || windowSpend < minSpend) return { welcome: 0, bonusMissed: true };
  // GBP spend x percent = pence, so a rate-capped intro offer only fits cashback (1 unit = 1p).
  const bonusUnits = introRatePct === null ? units : Math.min(units, windowSpend * introRatePct);
  return {
    welcome: (bonusUnits * inputs.pointValuePence[card.currency]) / 100,
    bonusMissed: false,
  };
}

function loungeFor(card: CardProduct, inputs: CardPerksInputs): number {
  if (card.lounge === null) return 0;
  const visits = Math.min(inputs.loungeVisits, card.lounge.visitsPerYear ?? Infinity);
  return visits * Math.max(0, inputs.loungeVisitValue - card.lounge.pricePerVisit);
}

function voucherFor(
  card: CardProduct,
  totalSpend: number,
  voucherValue: number
): { voucher: number; voucherMissed: boolean } {
  if (card.companionVoucher === null) return { voucher: 0, voucherMissed: false };
  if (totalSpend < card.companionVoucher.spendThreshold) return { voucher: 0, voucherMissed: true };
  return { voucher: voucherValue, voucherMissed: false };
}

/** Per-card value breakdown for the given inputs; pure, no rounding side effects outside the returned object. */
export function valueFor(
  card: CardProduct,
  inputs: CardPerksInputs
): ValueBreakdown & { bonusMissed: boolean; voucherMissed: boolean } {
  const totalSpend = sumSpend(inputs.spend);
  const rawRewards = rawRewardsFor(card, inputs, totalSpend);
  const { welcome, bonusMissed } = welcomeFor(card, inputs, totalSpend);
  const lounge = loungeFor(card, inputs);
  const insurance = card.travelInsurance === 'comprehensive' ? inputs.insuranceValue : 0;
  const { voucher, voucherMissed } = voucherFor(card, totalSpend, inputs.voucherValue);
  const fee = inputs.horizon === 'year1' ? card.fee.year1 : card.fee.ongoing;
  const fx = (inputs.spendAbroad * card.fxFeePct) / 100;
  const interest =
    inputs.clearsBalance || card.purchaseApr === null
      ? 0
      : (inputs.carriedBalance * card.purchaseApr) / 100;

  const rewards = Math.round(rawRewards);
  const welcomeRounded = Math.round(welcome);
  const loungeRounded = Math.round(lounge);
  const insuranceRounded = Math.round(insurance);
  const voucherRounded = Math.round(voucher);
  const feeRounded = Math.round(fee);
  const fxRounded = Math.round(fx);
  const interestRounded = Math.round(interest);
  const net =
    rewards +
    welcomeRounded +
    loungeRounded +
    insuranceRounded +
    voucherRounded -
    feeRounded -
    fxRounded -
    interestRounded;

  return {
    rewards,
    welcome: welcomeRounded,
    lounge: loungeRounded,
    insurance: insuranceRounded,
    voucher: voucherRounded,
    fee: feeRounded,
    fx: fxRounded,
    interest: interestRounded,
    net,
    effectiveRewardRate: totalSpend > 0 ? round2((rawRewards / totalSpend) * 100) : 0,
    bonusMissed,
    voucherMissed,
  };
}

/** Rewards as the column shows them: base rewards plus the welcome bonus, so the sort matches. */
export function rewardsValue(breakdown: ValueBreakdown): number {
  return breakdown.rewards + breakdown.welcome;
}

export function perksValue(breakdown: ValueBreakdown): number {
  return breakdown.lounge + breakdown.insurance + breakdown.voucher;
}

/** Every comparator ties-break on net desc then name asc, so a sort change never reshuffles equal-net rows at random. */
function tieBreak(a: CardResult, b: CardResult): number {
  return b.breakdown.net - a.breakdown.net || a.card.name.localeCompare(b.card.name);
}

const COMPARATORS: Record<SortKey, (a: CardResult, b: CardResult) => number> = {
  net: (a, b) => b.breakdown.net - a.breakdown.net || tieBreak(a, b),
  rewards: (a, b) => rewardsValue(b.breakdown) - rewardsValue(a.breakdown) || tieBreak(a, b),
  perks: (a, b) => perksValue(b.breakdown) - perksValue(a.breakdown) || tieBreak(a, b),
  fees: (a, b) => a.breakdown.fee - b.breakdown.fee || tieBreak(a, b),
  fx: (a, b) => a.breakdown.fx - b.breakdown.fx || tieBreak(a, b),
};

export function sortResults(results: readonly CardResult[], sortKey: SortKey): CardResult[] {
  return [...results]
    .sort(COMPARATORS[sortKey])
    .map((result, index) => ({ ...result, rank: index + 1 }));
}

function passesFilters(card: CardProduct, inputs: CardPerksInputs): boolean {
  if (inputs.types.length > 0 && !inputs.types.includes(card.type)) return false;
  if (inputs.loungeOnly && card.lounge === null) return false;
  if (inputs.noFeeOnly) {
    const fee = inputs.horizon === 'year1' ? card.fee.year1 : card.fee.ongoing;
    if (fee !== 0) return false;
  }
  return true;
}

export function computeResults(
  inputs: CardPerksInputs,
  cards: readonly CardProduct[]
): CardPerksResult {
  const totalSpend = sumSpend(inputs.spend);
  const unranked: CardResult[] = cards
    .filter((card) => passesFilters(card, inputs))
    .map((card) => {
      const { bonusMissed, voucherMissed, ...breakdown } = valueFor(card, inputs);
      return { card, breakdown, rank: 0, bonusMissed, voucherMissed };
    });
  const ranked = sortResults(unranked, inputs.sortKey);

  return {
    ranked,
    totalSpend,
    hiddenCount: cards.length - ranked.length,
    totalCards: cards.length,
  };
}
