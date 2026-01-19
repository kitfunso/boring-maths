/**
 * Consulting Rate Calculator - Type Definitions
 *
 * Calculate consulting hourly rate, day rate, and project
 * rates based on desired income and business costs.
 * Explains why $50/hr employee !== $50/hr consultant.
 */

import type { Currency } from '../../../lib/regions';

export interface ConsultingRateInputs {
  currency: Currency;

  /** Desired annual income (take-home) */
  desiredAnnualIncome: number;

  /** Target billable hours per week */
  billableHoursPerWeek: number;

  /** Weeks worked per year */
  weeksPerYear: number;

  /** Annual business expenses */
  businessExpenses: number;

  /** Health insurance (annual) */
  healthInsurance: number;

  /** Retirement contributions (annual) */
  retirementContributions: number;

  /** Self-employment tax rate */
  selfEmploymentTaxRate: number;

  /** Income tax rate (effective) */
  incomeTaxRate: number;

  /** Desired profit margin on top of costs */
  profitMargin: number;

  /** Non-billable time percentage (admin, marketing, etc.) */
  nonBillablePercent: number;
}

export interface RateBreakdown {
  category: string;
  annual: number;
  hourly: number;
  description: string;
}

export interface ConsultingRateResult {
  currency: Currency;

  /** Calculated rates */
  hourlyRate: number;
  dayRate: number;
  weekRate: number;
  monthlyRetainer: number;

  /** Minimum viable rate (just covers costs) */
  minimumHourlyRate: number;

  /** Total annual revenue needed */
  annualRevenueNeeded: number;

  /** Billable hours per year */
  billableHoursPerYear: number;

  /** Total annual costs */
  totalAnnualCosts: number;

  /** Cost breakdown */
  breakdown: RateBreakdown[];

  /** Employee equivalent comparison */
  employeeEquivalent: {
    salaryEquivalent: number;
    hourlyEquivalent: number;
    multiplierVsEmployee: number;
  };

  /** Project rate guidance */
  projectRates: {
    halfDay: number;
    fullDay: number;
    weekProject: number;
    monthProject: number;
  };

  /** Insights */
  insights: string[];
}

export function getDefaultInputs(currency: Currency = 'USD'): ConsultingRateInputs {
  const multiplier = currency === 'GBP' ? 0.8 : currency === 'EUR' ? 0.9 : 1;

  return {
    currency,
    desiredAnnualIncome: Math.round(100000 * multiplier),
    billableHoursPerWeek: 25,
    weeksPerYear: 48,
    businessExpenses: Math.round(12000 * multiplier),
    healthInsurance: currency === 'USD' ? 6000 : currency === 'GBP' ? 0 : 3000,
    retirementContributions: Math.round(10000 * multiplier),
    selfEmploymentTaxRate: currency === 'USD' ? 15.3 : currency === 'GBP' ? 9 : 15,
    incomeTaxRate: 25,
    profitMargin: 20,
    nonBillablePercent: 20,
  };
}

export const DEFAULT_INPUTS: ConsultingRateInputs = getDefaultInputs('USD');

/** Common business expenses for consultants */
export const COMMON_EXPENSES: Record<Currency, { name: string; low: number; high: number }[]> = {
  USD: [
    { name: 'Software & tools', low: 1200, high: 3000 },
    { name: 'Professional liability insurance', low: 500, high: 2000 },
    { name: 'Accounting & legal', low: 1000, high: 5000 },
    { name: 'Marketing & website', low: 1000, high: 5000 },
    { name: 'Office/coworking', low: 0, high: 6000 },
    { name: 'Professional development', low: 500, high: 3000 },
    { name: 'Travel & meetings', low: 500, high: 5000 },
  ],
  GBP: [
    { name: 'Software & tools', low: 1000, high: 2500 },
    { name: 'Professional indemnity insurance', low: 400, high: 1500 },
    { name: 'Accounting & legal', low: 800, high: 4000 },
    { name: 'Marketing & website', low: 800, high: 4000 },
    { name: 'Office/coworking', low: 0, high: 5000 },
    { name: 'Professional development', low: 400, high: 2500 },
    { name: 'Travel & meetings', low: 400, high: 4000 },
  ],
  EUR: [
    { name: 'Software & tools', low: 1100, high: 2700 },
    { name: 'Professional liability insurance', low: 450, high: 1800 },
    { name: 'Accounting & legal', low: 900, high: 4500 },
    { name: 'Marketing & website', low: 900, high: 4500 },
    { name: 'Office/coworking', low: 0, high: 5500 },
    { name: 'Professional development', low: 450, high: 2700 },
    { name: 'Travel & meetings', low: 450, high: 4500 },
  ],
};
