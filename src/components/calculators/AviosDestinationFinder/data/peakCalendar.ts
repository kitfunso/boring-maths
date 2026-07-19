/**
 * BA peak / off-peak calendar for Avios reward flights - 2026.
 * PEAK dates below; every other 2026 date is off-peak.
 * Source: https://awardwallet.com/airlines/avios-peak-calendar/ (fetched 2026-07-19),
 * corroborated by https://www.aviosintelligence.com/reports/avios-peak-off-peak-dates.
 * 2027 calendar is not yet published in text form - dates beyond
 * CALENDAR_PUBLISHED_THROUGH are treated as "could be either season".
 */

export interface DateRange {
  readonly from: string; // ISO yyyy-mm-dd inclusive
  readonly to: string; // ISO yyyy-mm-dd inclusive
}

export const PEAK_RANGES_2026: readonly DateRange[] = [
  { from: '2026-01-01', to: '2026-01-04' },
  { from: '2026-02-13', to: '2026-02-15' },
  { from: '2026-02-20', to: '2026-02-22' },
  { from: '2026-03-27', to: '2026-03-30' },
  { from: '2026-04-02', to: '2026-04-06' },
  { from: '2026-04-09', to: '2026-04-12' },
  { from: '2026-05-01', to: '2026-05-04' },
  { from: '2026-05-22', to: '2026-05-31' },
  { from: '2026-06-06', to: '2026-06-07' },
  { from: '2026-06-12', to: '2026-06-14' },
  { from: '2026-06-19', to: '2026-06-21' },
  { from: '2026-06-26', to: '2026-06-28' },
  { from: '2026-07-03', to: '2026-07-13' },
  { from: '2026-07-15', to: '2026-07-20' },
  { from: '2026-07-22', to: '2026-07-31' },
  { from: '2026-08-01', to: '2026-08-31' },
  { from: '2026-09-01', to: '2026-09-01' },
  { from: '2026-09-04', to: '2026-09-06' },
  { from: '2026-09-11', to: '2026-09-13' },
  { from: '2026-09-18', to: '2026-09-20' },
  { from: '2026-09-25', to: '2026-09-27' },
  { from: '2026-10-23', to: '2026-10-25' },
  { from: '2026-10-30', to: '2026-10-31' },
  { from: '2026-11-01', to: '2026-11-01' },
  { from: '2026-11-21', to: '2026-11-21' },
  { from: '2026-11-29', to: '2026-11-29' },
  { from: '2026-12-12', to: '2026-12-13' },
  { from: '2026-12-18', to: '2026-12-24' },
  { from: '2026-12-26', to: '2026-12-31' },
];

export const CALENDAR_PUBLISHED_THROUGH = '2026-12-31';

/** Shown in the UI so users know how fresh the guide data is. */
export const DATA_LAST_VERIFIED = '2026-07-19';
