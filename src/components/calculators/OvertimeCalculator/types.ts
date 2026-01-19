/**
 * Overtime Calculator - Type Definitions
 *
 * Calculate if overtime is worth it after taxes and show diminishing returns.
 */

import type { Currency } from '../../../lib/regions';

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
 * US Federal Tax Brackets 2024/2025 (simplified)
 */
export const US_TAX_BRACKETS: Record<string, TaxBracket[]> = {
  single: [
    { rate: 0.1, min: 0, max: 11925, label: '10%' },
    { rate: 0.12, min: 11925, max: 48475, label: '12%' },
    { rate: 0.22, min: 48475, max: 103350, label: '22%' },
    { rate: 0.24, min: 103350, max: 197300, label: '24%' },
    { rate: 0.32, min: 197300, max: 250525, label: '32%' },
    { rate: 0.35, min: 250525, max: 626350, label: '35%' },
    { rate: 0.37, min: 626350, max: Infinity, label: '37%' },
  ],
  married: [
    { rate: 0.1, min: 0, max: 23850, label: '10%' },
    { rate: 0.12, min: 23850, max: 96950, label: '12%' },
    { rate: 0.22, min: 96950, max: 206700, label: '22%' },
    { rate: 0.24, min: 206700, max: 394600, label: '24%' },
    { rate: 0.32, min: 394600, max: 501050, label: '32%' },
    { rate: 0.35, min: 501050, max: 751600, label: '35%' },
    { rate: 0.37, min: 751600, max: Infinity, label: '37%' },
  ],
  head_of_household: [
    { rate: 0.1, min: 0, max: 17000, label: '10%' },
    { rate: 0.12, min: 17000, max: 64850, label: '12%' },
    { rate: 0.22, min: 64850, max: 103350, label: '22%' },
    { rate: 0.24, min: 103350, max: 197300, label: '24%' },
    { rate: 0.32, min: 197300, max: 250500, label: '32%' },
    { rate: 0.35, min: 250500, max: 626350, label: '35%' },
    { rate: 0.37, min: 626350, max: Infinity, label: '37%' },
  ],
};

/**
 * UK Tax Brackets 2024/2025
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
