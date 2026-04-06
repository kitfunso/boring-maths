/**
 * Tradesperson Hourly Rate Calculator - Calculation Logic
 *
 * Works backwards from desired take-home income:
 *   required rate = (income + yearly overheads + tax) / billable hours
 *
 * Tax is applied on (income + overheads) so the tradesperson earns enough
 * gross to cover everything after tax.
 */

import type { TradesHourlyRateInputs, TradesHourlyRateResult, Overheads } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Sum all monthly overhead items.
 */
export function sumMonthlyOverheads(overheads: Overheads): number {
  return (
    overheads.vanCost +
    overheads.insurance +
    overheads.tools +
    overheads.training +
    overheads.phone +
    overheads.accountant +
    overheads.other
  );
}

/**
 * Main calculation: derive required hourly rate from desired annual income.
 */
export function calculateTradesHourlyRate(inputs: TradesHourlyRateInputs): TradesHourlyRateResult {
  const {
    desiredAnnualIncome,
    workingWeeksPerYear,
    billableHoursPerWeek,
    overheads,
    taxRate,
  } = inputs;

  const totalOverheadsMonthly = sumMonthlyOverheads(overheads);
  const totalOverheadsYearly = totalOverheadsMonthly * 12;
  const billableHoursPerYear = workingWeeksPerYear * billableHoursPerWeek;

  // Total amount needed before tax = income + overheads.
  // If tax rate is T%, then gross = (income + overheads) / (1 - T/100).
  const taxFraction = Math.min(Math.max(taxRate, 0), 99) / 100;
  const preTaxRequired = desiredAnnualIncome + totalOverheadsYearly;
  const grossRequired = preTaxRequired / (1 - taxFraction);
  const totalTax = grossRequired - preTaxRequired;

  // Rate per billable hour
  const requiredHourlyRate =
    billableHoursPerYear > 0
      ? Math.round((grossRequired / billableHoursPerYear) * 100) / 100
      : 0;

  const requiredDayRate = Math.round(requiredHourlyRate * 8 * 100) / 100;

  // What the tradesperson actually takes home after overheads and tax
  const effectiveTakeHome = Math.round(desiredAnnualIncome * 100) / 100;

  // Non-billable percentage (assuming a standard 40-hour work week)
  const totalWeeklyHours = 40;
  const nonBillablePercent =
    totalWeeklyHours > 0
      ? Math.round(((totalWeeklyHours - billableHoursPerWeek) / totalWeeklyHours) * 1000) / 10
      : 0;

  // Per-hour breakdown
  const incomePerHour =
    billableHoursPerYear > 0
      ? Math.round((desiredAnnualIncome / billableHoursPerYear) * 100) / 100
      : 0;
  const overheadsPerHour =
    billableHoursPerYear > 0
      ? Math.round((totalOverheadsYearly / billableHoursPerYear) * 100) / 100
      : 0;
  const taxPerHour =
    billableHoursPerYear > 0
      ? Math.round((totalTax / billableHoursPerYear) * 100) / 100
      : 0;

  return {
    requiredHourlyRate,
    requiredDayRate,
    effectiveTakeHome,
    totalOverheadsMonthly: Math.round(totalOverheadsMonthly * 100) / 100,
    totalOverheadsYearly: Math.round(totalOverheadsYearly * 100) / 100,
    billableHoursPerYear,
    nonBillablePercent,
    breakdownPerHour: {
      incomePerHour,
      overheadsPerHour,
      taxPerHour,
    },
  };
}

export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  return formatCurrencyByRegion(value, currency, 2);
}

export function formatCurrencyWhole(value: number, currency: Currency = 'USD'): string {
  return formatCurrencyByRegion(value, currency, 0);
}
