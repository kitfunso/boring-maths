/** UK Holiday Entitlement: statutory 5.6 weeks/year (Working Time Regulations 1998), capped at 28 days for 5+ day weeks; 'hours' mode accrues at 12.07% of hours worked; pro-rated by months worked for starters/leavers. No financial advice; statutory minimum only. */

// Statutory constants (Working Time Regulations 1998, stable since 2009).
export const STATUTORY_WEEKS = 5.6;
export const STATUTORY_DAY_CAP = 28;
// Accrual rate for irregular-hours / casual workers: 5.6 / (52 - 5.6) = 0.1207.
export const ACCRUAL_RATE = 0.1207;
export const MONTHS_PER_YEAR = 12;

export type EntitlementMethod = 'days' | 'hours';

export interface UKHolidayEntitlementInputs {
  readonly method: EntitlementMethod;
  /** Days worked per week (method 'days'). 1 to 7. */
  readonly daysPerWeek: number;
  /** Total hours worked in the period (method 'hours'). */
  readonly hoursWorked: number;
  /** Months of the leave year actually worked, 0 to 12. Used to pro-rate starters/leavers. */
  readonly monthsWorked: number;
}

export interface UKHolidayEntitlementResult {
  readonly method: EntitlementMethod;
  /** Full-year statutory entitlement in days, before any pro-rating. */
  readonly fullYearDays: number;
  /** Whether the 28-day statutory cap was applied (method 'days' only). */
  readonly capApplied: boolean;
  /** Pro-rated entitlement in days after applying the worked fraction. */
  readonly proRatedDays: number;
  /** Pro-rated entitlement expressed in weeks (proRatedDays / daysPerWeek), method 'days' only. */
  readonly proRatedWeeks: number;
  /** Holiday hours accrued (method 'hours' only). */
  readonly accruedHours: number;
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** days: fullYearDays=min(daysPerWeek*5.6,28), proRatedDays=fullYearDays*(monthsWorked/12). hours: accruedHours=hoursWorked*0.1207 (monthsWorked not applied). */
export function calculateHolidayEntitlement(
  inputs: UKHolidayEntitlementInputs
): UKHolidayEntitlementResult {
  const { method } = inputs;

  if (method === 'hours') {
    const hoursWorked = Math.max(0, inputs.hoursWorked || 0);
    const accruedHours = hoursWorked * ACCRUAL_RATE;
    return {
      method,
      fullYearDays: 0,
      capApplied: false,
      proRatedDays: 0,
      proRatedWeeks: 0,
      accruedHours: roundTo(accruedHours, 2),
    };
  }

  const daysPerWeek = clamp(inputs.daysPerWeek || 0, 0, 7);
  const monthsWorked = clamp(inputs.monthsWorked, 0, MONTHS_PER_YEAR);

  const uncappedFullYear = daysPerWeek * STATUTORY_WEEKS;
  const capApplied = uncappedFullYear > STATUTORY_DAY_CAP;
  const fullYearDays = Math.min(uncappedFullYear, STATUTORY_DAY_CAP);

  const workedFraction = monthsWorked / MONTHS_PER_YEAR;
  const proRatedDays = fullYearDays * workedFraction;
  const proRatedWeeks = daysPerWeek > 0 ? proRatedDays / daysPerWeek : 0;

  return {
    method,
    fullYearDays: roundTo(fullYearDays, 2),
    capApplied,
    proRatedDays: roundTo(proRatedDays, 2),
    proRatedWeeks: roundTo(proRatedWeeks, 2),
    accruedHours: 0,
  };
}

export function getDefaultInputs(): UKHolidayEntitlementInputs {
  return {
    method: 'days',
    daysPerWeek: 5,
    hoursWorked: 1000,
    monthsWorked: 12,
  };
}
