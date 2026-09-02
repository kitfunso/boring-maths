/** Crawlable earn-rate summary for CardFactsTable.astro; groups by rate, high to low. */
import { POINT_CURRENCY_LABELS, SPEND_CATEGORIES, SPEND_CATEGORY_LABELS } from './types';
import type { CardProduct, SpendCategory } from './types';

const nf = new Intl.NumberFormat('en-GB');

interface RateGroup {
  readonly rate: number;
  readonly categories: readonly SpendCategory[];
}

function groupByRate(earn: Readonly<Record<SpendCategory, number>>): RateGroup[] {
  const byRate = new Map<number, SpendCategory[]>();
  for (const category of SPEND_CATEGORIES) {
    const rate = earn[category];
    const bucket = byRate.get(rate);
    if (bucket) bucket.push(category);
    else byRate.set(rate, [category]);
  }
  return [...byRate.entries()]
    .map(([rate, categories]) => ({ rate, categories }))
    .sort((a, b) => b.rate - a.rate);
}

function categoryLabel(categories: readonly SpendCategory[]): string {
  const labels = categories.map((c) => SPEND_CATEGORY_LABELS[c]);
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(', ')} & ${labels[labels.length - 1]}`;
}

function clauseForCurrency(rate: number, isCashback: boolean, unit: string): string {
  return isCashback ? `${rate}% cashback` : `${rate} ${unit} per £1`;
}

function baseEarnClause(card: CardProduct): string {
  const isCashback = card.currency === 'cashback';
  const unit = POINT_CURRENCY_LABELS[card.currency];
  const groups = groupByRate(card.earn);

  if (groups.length === 1) return clauseForCurrency(groups[0].rate, isCashback, unit);

  const [head, ...rest] = groups;
  const last = rest[rest.length - 1];
  const middle = rest.slice(0, -1);

  const parts = [
    `${clauseForCurrency(head.rate, isCashback, unit)} ${categoryLabel(head.categories)}`,
  ];
  for (const group of middle) {
    const clause = isCashback ? `${group.rate}%` : `${group.rate} per £1`;
    parts.push(`${clause} ${categoryLabel(group.categories)}`);
  }
  parts.push(isCashback ? `${last.rate}% elsewhere` : `${last.rate} elsewhere`);
  return parts.join(', ');
}

function tier2Clause(card: CardProduct): string {
  if (card.tier2 === null) return '';
  const rates = new Set(SPEND_CATEGORIES.map((c) => card.tier2!.earn[c]));
  if (rates.size !== 1) return '';
  const rate = [...rates][0];
  const isCashback = card.currency === 'cashback';
  const unit = isCashback ? '%' : ` ${POINT_CURRENCY_LABELS[card.currency]}`;
  const label = isCashback ? `${rate}% cashback` : `${rate}${unit} per £1`;
  return `, rising to ${label} after £${nf.format(card.tier2.fromSpend)} spend a year`;
}

/** e.g. "2 Avios per £1 supermarkets, 1 elsewhere" or "1% cashback"; "No rewards" when currency is none. */
export function formatEarn(card: CardProduct): string {
  if (card.currency === 'none') return 'No rewards';
  return `${baseEarnClause(card)}${tier2Clause(card)}`;
}
