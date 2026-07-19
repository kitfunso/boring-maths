/**
 * Avios Destination Finder - Calculation Logic
 *
 * Pure functions. No live availability - guide prices from BA's published
 * Reward Flight Saver table (see data/ file headers for sources).
 */

import type { PartyPricing, PartyTotalsInputs, SeasonWindow } from './types';
import { CALENDAR_PUBLISHED_THROUGH, PEAK_RANGES_2026 } from './data/peakCalendar';

const MS_PER_DAY = 86_400_000;
/** Safety cap so a pathological range cannot spin the day loop. */
const MAX_RANGE_DAYS = 730;

function toUtc(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

const PEAK_INTERVALS: readonly { start: number; end: number }[] = PEAK_RANGES_2026.map((r) => ({
  start: toUtc(r.from),
  end: toUtc(r.to),
}));

function isPeakDay(t: number): boolean {
  return PEAK_INTERVALS.some((p) => t >= p.start && t <= p.end);
}

const BOTH_SEASONS: SeasonWindow = { hasOffPeak: true, hasPeak: true, beyondCalendar: false };

/**
 * Resolve a date range to the seasons it can contain.
 * Unset or invalid ranges resolve to "both" so the finder still works
 * without dates. Days past the published calendar count as both seasons
 * and set beyondCalendar so the UI can show a "provisional" note. Ranges
 * longer than MAX_RANGE_DAYS return the widest honest answer (both seasons)
 * rather than silently truncating the day scan and reporting it as complete.
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
    if (isPeakDay(t)) hasPeak = true;
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
