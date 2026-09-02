/**
 * Avios Destination Finder - Calculation Logic
 *
 * Pure functions. No live availability - guide prices from BA's published
 * Reward Flight Saver table (see data/ file headers for sources).
 */

import type {
  AviosFinderInputs,
  AviosFinderResult,
  Cabin,
  CabinPricing,
  Destination,
  DestinationResult,
  PartyPricing,
  PartyTotalsInputs,
  SeasonWindow,
  VoucherType,
} from './types';
import { NOT_OFFERED } from './types';
import { CALENDAR_PUBLISHED_THROUGH, isPeakIsoDate } from './data/peakCalendar';
import { DESTINATIONS } from './data/destinations';
import { DISTANCE_MILES_FROM_LONDON } from './data/distances';

const MS_PER_DAY = 86_400_000;
/** Safety cap so a pathological range cannot spin the day loop. */
const MAX_RANGE_DAYS = 730;

function toUtc(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

/** Inverse of toUtc for whole-day UTC timestamps produced by the day loop below. */
function toIsoDate(t: number): string {
  return new Date(t).toISOString().slice(0, 10);
}

const BOTH_SEASONS: SeasonWindow = { hasOffPeak: true, hasPeak: true, beyondCalendar: false };

/**
 * Resolve a date range to the seasons it can contain.
 * Unset or invalid ranges resolve to "both" so the finder still works
 * without dates. Days past the published calendar count as both seasons
 * and set beyondCalendar so the UI can show a "provisional" note. Ranges
 * longer than MAX_RANGE_DAYS return the widest honest answer (both seasons)
 * rather than silently truncating the day scan and reporting it as complete.
 * Invariant: never returns hasOffPeak and hasPeak both false.
 */
export function resolveSeasonsForRange(dateFrom: string, dateTo: string): SeasonWindow {
  if (!dateFrom || !dateTo) return BOTH_SEASONS;
  const from = toUtc(dateFrom);
  const to = toUtc(dateTo);
  if (Number.isNaN(from) || Number.isNaN(to) || from > to) return BOTH_SEASONS;

  const publishedEnd = toUtc(CALENDAR_PUBLISHED_THROUGH);
  const beyondCalendar = to > publishedEnd;
  if (beyondCalendar) return { hasOffPeak: true, hasPeak: true, beyondCalendar: true };

  if (to - from > MAX_RANGE_DAYS * MS_PER_DAY) {
    return { hasOffPeak: true, hasPeak: true, beyondCalendar };
  }

  const cappedTo = Math.min(to, publishedEnd);
  let hasOffPeak = false;
  let hasPeak = false;
  for (let t = from; t <= cappedTo; t += MS_PER_DAY) {
    if (isPeakIsoDate(toIsoDate(t))) hasPeak = true;
    else hasOffPeak = true;
    if (hasPeak && hasOffPeak) break;
  }
  return { hasOffPeak, hasPeak, beyondCalendar: false };
}

/**
 * Total Avios + cash for the whole party and trip.
 * Companion voucher (2 travellers): second seat costs no Avios, but the
 * cash element is always payable per person (VOUCHER_RULES).
 */
export function calculatePartyTotals(inputs: PartyTotalsInputs): PartyPricing {
  const { oneWayAvios, oneWayCash, travellers, companionVoucher, tripType } = inputs;
  const legs = tripType === 'return' ? 2 : 1;
  const aviosSeats = travellers === 2 && companionVoucher ? 1 : travellers;
  return {
    avios: oneWayAvios * aviosSeats * legs,
    cash: oneWayCash * travellers * legs,
  };
}

/** The 2-for-1 needs two travellers; the free card's voucher is economy only. */
export function voucherApplies(voucher: VoucherType, cabin: Cabin, travellers: 1 | 2): boolean {
  if (travellers !== 2 || voucher === 'none') return false;
  return voucher === 'premiumPlus' || cabin === 'economy';
}

function cabinPricing(d: Destination, cabin: AviosFinderInputs['cabin']): CabinPricing {
  if (cabin === 'economy') return d.economy;
  if (cabin === 'premiumEconomy') return d.premiumEconomy;
  return d.business;
}

function round1dp(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Total order for the peakSaving sort: nulls (no saving computable for the
 * current date range) always sort last regardless of direction; ties break
 * on rankAvios ascending. Written as explicit branches rather than
 * `(a.peakSavingPct ?? x) - (b.peakSavingPct ?? x)` because null-coercion
 * arithmetic cannot express "nulls last" for both DESC and tie cases at once.
 */
function comparePeakSaving(a: DestinationResult, b: DestinationResult): number {
  if (a.peakSavingPct === null && b.peakSavingPct === null) return a.rankAvios - b.rankAvios;
  if (a.peakSavingPct === null) return 1;
  if (b.peakSavingPct === null) return -1;
  return b.peakSavingPct - a.peakSavingPct || a.rankAvios - b.rankAvios;
}

/** Re-prices a single destination at the given season resolution with the companion voucher off, to measure its saving. */
function noVoucherRankAvios(
  d: Destination,
  inputs: AviosFinderInputs,
  seasons: SeasonWindow
): number {
  const pricing = cabinPricing(d, inputs.cabin);
  if (pricing === NOT_OFFERED) return 0;
  const partyBase = {
    oneWayCash: pricing.cash,
    travellers: inputs.travellers,
    companionVoucher: false,
    tripType: inputs.tripType,
  };
  const off = seasons.hasOffPeak
    ? calculatePartyTotals({ ...partyBase, oneWayAvios: pricing.offPeak })
    : null;
  const peak = seasons.hasPeak
    ? calculatePartyTotals({ ...partyBase, oneWayAvios: pricing.peak })
    : null;
  return off ? off.avios : peak!.avios;
}

export function computeResults(inputs: AviosFinderInputs): AviosFinderResult {
  const seasons = resolveSeasonsForRange(inputs.dateFrom, inputs.dateTo);

  const filtered = DESTINATIONS.filter(
    (d) =>
      (inputs.regions.length === 0 || inputs.regions.includes(d.region)) &&
      (inputs.holidayTypes.length === 0 ||
        d.holidayTypes.some((t) => inputs.holidayTypes.includes(t)))
  );

  let notOfferedCount = 0;
  const rows: DestinationResult[] = [];
  const legs = inputs.tripType === 'return' ? 2 : 1;
  const voucherApplied = voucherApplies(inputs.voucher, inputs.cabin, inputs.travellers);

  for (const d of filtered) {
    const pricing = cabinPricing(d, inputs.cabin);
    if (pricing === NOT_OFFERED) {
      notOfferedCount += 1;
      continue;
    }

    const distanceMiles = DISTANCE_MILES_FROM_LONDON[d.iata];
    if (distanceMiles === undefined) {
      throw new Error(`Missing DISTANCE_MILES_FROM_LONDON entry for IATA "${d.iata}" (${d.city})`);
    }

    const partyBase = {
      oneWayCash: pricing.cash,
      travellers: inputs.travellers,
      companionVoucher: voucherApplied,
      tripType: inputs.tripType,
    };
    const off = seasons.hasOffPeak
      ? calculatePartyTotals({ ...partyBase, oneWayAvios: pricing.offPeak })
      : null;
    const peak = seasons.hasPeak
      ? calculatePartyTotals({ ...partyBase, oneWayAvios: pricing.peak })
      : null;

    const rankAvios = off ? off.avios : peak!.avios;
    const cashTotal = (off ?? peak)!.cash;
    const partyMiles = distanceMiles * legs * inputs.travellers;

    rows.push({
      destination: d,
      aviosOffPeak: off ? off.avios : null,
      aviosPeak: peak ? peak.avios : null,
      cashTotal,
      rankAvios,
      withinBudget: rankAvios <= inputs.aviosBudget,
      budgetPercent:
        inputs.aviosBudget > 0 ? Math.round((rankAvios / inputs.aviosBudget) * 100) : 0,
      distanceMiles,
      valuePer1k: rankAvios > 0 ? round1dp((partyMiles / rankAvios) * 1000) : 0,
      peakSavingPct: off && peak ? Math.round(((peak.avios - off.avios) / peak.avios) * 100) : null,
    });
  }

  const comparators: Record<
    AviosFinderInputs['sortKey'],
    (a: DestinationResult, b: DestinationResult) => number
  > = {
    avios: (a, b) => a.rankAvios - b.rankAvios,
    value: (a, b) => b.valuePer1k - a.valuePer1k || a.rankAvios - b.rankAvios,
    cash: (a, b) => a.cashTotal - b.cashTotal || a.rankAvios - b.rankAvios,
    peakSaving: comparePeakSaving,
    distance: (a, b) => a.distanceMiles - b.distanceMiles,
    name: (a, b) => a.destination.city.localeCompare(b.destination.city),
  };
  rows.sort(comparators[inputs.sortKey]);

  const affordable = rows.filter((r) => r.withinBudget);
  const cheapestAffordable =
    affordable.length > 0
      ? affordable.reduce((min, r) => (r.rankAvios < min.rankAvios ? r : min))
      : null;
  const voucherSavingAvios =
    voucherApplied && cheapestAffordable
      ? noVoucherRankAvios(cheapestAffordable.destination, inputs, seasons) -
        cheapestAffordable.rankAvios
      : 0;

  return {
    ranked: rows,
    affordable,
    overBudget: rows.filter((r) => !r.withinBudget),
    notOfferedCount,
    seasons,
    totalDestinations: filtered.length,
    voucherApplied,
    voucherSavingAvios,
  };
}
