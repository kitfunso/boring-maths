export const STATUTORY_WEEKS = 5.6;
export const STATUTORY_DAY_CAP = 28;
export const ACCRUAL_RATE = 0.1207;
export const MONTHS_PER_YEAR = 12;

export type EntitlementMethod = 'days' | 'hours';

export interface UKHolidayEntitlementInputs {
  readonly method: EntitlementMethod;
  readonly daysPerWeek: number;
  readonly hoursWorked: number;
  readonly monthsWorked: number;
}

export interface UKHolidayEntitlementResult {
  readonly method: EntitlementMethod;
  readonly fullYearDays: number;
  readonly capApplied: boolean;
  readonly proRatedDays: number;
  readonly proRatedWeeks: number;
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
