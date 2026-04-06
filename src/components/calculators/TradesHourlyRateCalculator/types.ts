/**
 * Tradesperson Hourly Rate Calculator - Type Definitions
 */

import type { Currency } from '../../../lib/regions';

export interface Overheads {
  readonly vanCost: number;
  readonly insurance: number;
  readonly tools: number;
  readonly training: number;
  readonly phone: number;
  readonly accountant: number;
  readonly other: number;
}

export interface TradesHourlyRateInputs {
  readonly currency: Currency;
  readonly desiredAnnualIncome: number;
  readonly workingWeeksPerYear: number;
  readonly billableHoursPerWeek: number;
  readonly overheads: Overheads;
  readonly taxRate: number;
}

export interface BreakdownPerHour {
  readonly incomePerHour: number;
  readonly overheadsPerHour: number;
  readonly taxPerHour: number;
}

export interface TradesHourlyRateResult {
  readonly requiredHourlyRate: number;
  readonly requiredDayRate: number;
  readonly effectiveTakeHome: number;
  readonly totalOverheadsMonthly: number;
  readonly totalOverheadsYearly: number;
  readonly billableHoursPerYear: number;
  readonly nonBillablePercent: number;
  readonly breakdownPerHour: BreakdownPerHour;
}

export const OVERHEAD_LABELS: Readonly<Record<keyof Overheads, string>> = {
  vanCost: 'Van / Vehicle',
  insurance: 'Insurance',
  tools: 'Tools & Equipment',
  training: 'Training & Certifications',
  phone: 'Phone & Internet',
  accountant: 'Accountant / Bookkeeper',
  other: 'Other Expenses',
};

export function getDefaultInputs(currency: Currency = 'USD'): TradesHourlyRateInputs {
  const incomes: Record<Currency, number> = {
    USD: 60000,
    GBP: 40000,
    EUR: 45000,
  };

  const overheadDefaults: Record<Currency, Overheads> = {
    USD: {
      vanCost: 400,
      insurance: 200,
      tools: 150,
      training: 50,
      phone: 80,
      accountant: 100,
      other: 50,
    },
    GBP: {
      vanCost: 300,
      insurance: 150,
      tools: 100,
      training: 40,
      phone: 60,
      accountant: 80,
      other: 40,
    },
    EUR: {
      vanCost: 350,
      insurance: 180,
      tools: 120,
      training: 45,
      phone: 70,
      accountant: 90,
      other: 45,
    },
  };

  return {
    currency,
    desiredAnnualIncome: incomes[currency],
    workingWeeksPerYear: 48,
    billableHoursPerWeek: 30,
    overheads: overheadDefaults[currency],
    taxRate: currency === 'GBP' ? 28 : currency === 'EUR' ? 32 : 30,
  };
}
