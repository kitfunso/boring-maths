import type { Currency } from '../../../lib/regions';
import { FEDERAL_BRACKETS_2026 } from '../../../lib/us-tax-2026';

export interface TaxBracket {
  rate: number;
  min: number;
  max: number;
  label: string;
}

export interface OvertimeCalculatorInputs {
  currency: Currency;

  hourlyRate: number;

  overtimeMultiplier: number;

  overtimeHours: number;

  currentAnnualIncome: number;

  filingStatus: 'single' | 'married' | 'head_of_household';

  stateTaxRate: number;

  includeFICA: boolean;
}

export interface WeeklyBreakdown {
  week: number;
  grossOT: number;
  taxWithheld: number;
  netOT: number;
  effectiveRate: number;
  cumulativeNet: number;
}

export interface OvertimeCalculatorResult {
  currency: Currency;

  weeklyGrossOT: number;

  weeklyNetOT: number;

  effectiveHourlyRate: number;

  annualGrossOT: number;

  annualNetOT: number;

  totalOTTax: number;

  effectiveTaxRate: number;

  currentBracket: TaxBracket;

  bracketAfterOT: TaxBracket;

  pushesIntoBracket: boolean;

  breakEven: {
    hours100: number;
    hours500: number;
    hours1000: number;
  };
}

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

export const UK_TAX_BRACKETS: TaxBracket[] = [
  { rate: 0.0, min: 0, max: 12570, label: '0% (Personal Allowance)' },
  { rate: 0.2, min: 12570, max: 50270, label: '20% (Basic Rate)' },
  { rate: 0.4, min: 50270, max: 125140, label: '40% (Higher Rate)' },
  { rate: 0.45, min: 125140, max: Infinity, label: '45% (Additional Rate)' },
];

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

export const DEFAULT_INPUTS: OvertimeCalculatorInputs = getDefaultInputs('USD');
