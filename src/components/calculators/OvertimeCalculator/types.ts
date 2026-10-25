/**
 * Overtime Calculator - Type Definitions
 *
 * Calculate if overtime is worth it after taxes and show diminishing returns.
 */

import type { Currency } from '../../../lib/regions';
import { FEDERAL_BRACKETS_2026 } from '../../../lib/us-tax-2026';

/**
 * Tax bracket information
 */
export interface TaxBracket {
  rate: number;
  min: number;
  max: number;
  label: string;
}

/**
 * Input values for the Overtime Calculator
 */
export interface OvertimeCalculatorInputs {
  /** Selected currency */
  currency: Currency;

  /** Regular hourly rate */
  hourlyRate: number;

  /** Overtime multiplier (1.5 = time and a half) */
  overtimeMultiplier: number;

  /** Hours of overtime per week */
  overtimeHours: number;

  /** Current annual income (before overtime) */
  currentAnnualIncome: number;

  /** Filing status for tax calculation */
  filingStatus: 'single' | 'married' | 'head_of_household';

  /** State tax rate (as decimal) */
  stateTaxRate: number;

  /** Include FICA taxes */
  includeFICA: boolean;
}

/**
 * Weekly breakdown of overtime earnings
 */
export interface WeeklyBreakdown {
  week: number;
  grossOT: number;
  taxWithheld: number;
  netOT: number;
  effectiveRate: number;
  cumulativeNet: number;
}

/**
 * Calculated results from the Overtime Calculator
 */
export interface OvertimeCalculatorResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Gross overtime pay per week */
  weeklyGrossOT: number;

  /** Net overtime pay per week after taxes */
  weeklyNetOT: number;

  /** Effective hourly rate after taxes */
  effectiveHourlyRate: number;

  /** Annual overtime earnings (gross) */
  annualGrossOT: number;

  /** Annual overtime earnings (net) */
  annualNetOT: number;

  /** Total tax on overtime */
  totalOTTax: number;

  /** Effective tax rate on overtime */
  effectiveTaxRate: number;

  /** Current marginal tax bracket */
  currentBracket: TaxBracket;

  /** Bracket after overtime income */
  bracketAfterOT: TaxBracket;

  /** Does OT push into higher bracket? */
  pushesIntoBracket: boolean;

  /** Break-even analysis: how many hours for various goals */
  breakEven: {
    hours100: number; // hours for $100 extra
    hours500: number; // hours for $500 extra
    hours1000: number; // hours for $1000 extra
  };

  /** Monthly breakdown showing diminishing returns */
  monthlyBreakdown: {
    month: number;
    grossOT: number;
    netOT: number;
    effectiveRate: number;
    cumulativeNet: number;
  }[];
}

/**
 * US Federal Tax Brackets 2026, derived from the shared table (decimal rates)
 */
export const OVERTIME_STATUS_MAP = {
  single: 'single',
  married: 'married_jointly',
  head_of_household: 'head_of_household',
} as const;

export const US_TAX_BRACKETS: Record<string, TaxBracket[]> = Object.fromEntries(
  Object.entries(OVERTIME_STATUS_MAP).map(([key, status]) => [
    key,
    FEDERAL_BRACKETS_2026[status].map((b) => ({
      rate: b.rate / 100,
      min: b.min,
      max: b.max,
      label: `${b.rate}%`,
    })),
  ])
);

/**
 * UK Tax Brackets 2026/27 (rUK); bands only, the UK calculator does the tax
 */
export const UK_TAX_BRACKETS: TaxBracket[] = [
  { rate: 0.0, min: 0, max: 12570, label: '0% (Personal Allowance)' },
  { rate: 0.2, min: 12570, max: 50270, label: '20% (Basic Rate)' },
  { rate: 0.4, min: 50270, max: 125140, label: '40% (Higher Rate)' },
  { rate: 0.45, min: 125140, max: Infinity, label: '45% (Additional Rate)' },
];

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): OvertimeCalculatorInputs {
  const hourlyRate = currency === 'GBP' ? 18 : currency === 'EUR' ? 20 : 25;
  const annualIncome = currency === 'GBP' ? 37500 : currency === 'EUR' ? 42000 : 52000;

  return {
    currency,
    hourlyRate,
    overtimeMultiplier: 1.5,
    overtimeHours: 10,
    currentAnnualIncome: annualIncome,
    filingStatus: 'single',
    stateTaxRate: currency === 'USD' ? 0.05 : 0,
    includeFICA: currency === 'USD',
  };
}

/**
 * Default input values
 */
export const DEFAULT_INPUTS: OvertimeCalculatorInputs = getDefaultInputs('USD');
