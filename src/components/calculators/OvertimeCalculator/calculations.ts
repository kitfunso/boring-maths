/**
 * Overtime Calculator - Calculation Logic
 *
 * Pure functions for calculating overtime value after taxes.
 */

import type { OvertimeCalculatorInputs, OvertimeCalculatorResult, TaxBracket } from './types';
import { US_TAX_BRACKETS, UK_TAX_BRACKETS, OVERTIME_STATUS_MAP } from './types';
import {
  type FederalFilingStatus,
  STANDARD_DEDUCTION_2026,
  employeeFica,
} from '../../../lib/us-tax-2026';
import { calculateUKTax } from '../UKTaxCalculator/calculations';
import { getDefaultInputs as getUKTaxDefaults } from '../UKTaxCalculator/types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/** Weeks per year */
const WEEKS_PER_YEAR = 52;

// 26 USC 225 (2025 to 2028): only the FLSA half-time premium is deductible, capped and phased out by income
const OT_PREMIUM_DEDUCTIBLE = 0.5;
const OT_DEDUCTION_CAP = { single: 12500, joint: 25000 };
const OT_PHASE_OUT_START = { single: 150000, joint: 300000 };

/**
 * Get the tax bracket for a given income
 */
function getTaxBracket(income: number, brackets: TaxBracket[]): TaxBracket {
  for (const bracket of brackets) {
    if (income >= bracket.min && income < bracket.max) {
      return bracket;
    }
  }
  return brackets[brackets.length - 1];
}

function bracketTax(income: number, brackets: TaxBracket[]): number {
  return brackets.reduce(
    (tax, b) => tax + Math.max(0, Math.min(income, b.max) - b.min) * b.rate,
    0
  );
}

/** Federal deduction for qualified overtime pay; it shrinks $100 per full $1,000 of income over the start. */
export function overtimeDeduction(qualifiedPay: number, income: number, joint: boolean): number {
  const cap = joint ? OT_DEDUCTION_CAP.joint : OT_DEDUCTION_CAP.single;
  const start = joint ? OT_PHASE_OUT_START.joint : OT_PHASE_OUT_START.single;
  const reduction = Math.floor(Math.max(0, income - start) / 1000) * 100;
  return Math.max(0, Math.min(qualifiedPay, cap) - reduction);
}

interface IncomeTaxModel {
  brackets: TaxBracket[];
  /** Income the brackets apply to, after this region's deductions */
  taxableIncome: (income: number, qualifiedOvertime: number) => number;
  /** Income tax (plus National Insurance in the UK) on a year's pay */
  tax: (income: number, qualifiedOvertime: number) => number;
}

function incomeTaxModel(
  currency: Currency,
  filingStatus: OvertimeCalculatorInputs['filingStatus']
): IncomeTaxModel {
  if (currency === 'GBP') {
    // The UK calculator adds National Insurance and the allowance taper above 100,000
    return {
      brackets: UK_TAX_BRACKETS,
      taxableIncome: (income) => income,
      tax: (income) => {
        const uk = calculateUKTax({ ...getUKTaxDefaults(), grossSalary: income, pensionRate: 0 });
        return uk.incomeTax + uk.nationalInsurance;
      },
    };
  }
  if (currency === 'EUR') {
    // UK bands stand in for a generic European scale
    return {
      brackets: UK_TAX_BRACKETS,
      taxableIncome: (income) => income,
      tax: (income) => bracketTax(income, UK_TAX_BRACKETS),
    };
  }
  const brackets = US_TAX_BRACKETS[filingStatus];
  const standardDeduction = STANDARD_DEDUCTION_2026[OVERTIME_STATUS_MAP[filingStatus]];
  const joint = filingStatus === 'married';
  const taxableIncome = (income: number, qualifiedOvertime: number) =>
    Math.max(0, income - standardDeduction - overtimeDeduction(qualifiedOvertime, income, joint));
  return {
    brackets,
    taxableIncome,
    tax: (income, qualifiedOvertime) =>
      bracketTax(taxableIncome(income, qualifiedOvertime), brackets),
  };
}

/**
 * Calculate marginal tax rate on additional income
 */
function calculateMarginalTax(
  baseIncome: number,
  additionalIncome: number,
  qualifiedOvertime: number,
  model: IncomeTaxModel,
  stateTaxRate: number,
  ficaStatus: FederalFilingStatus | null // null when FICA does not apply
): { tax: number; effectiveRate: number } {
  let totalTax = 0;

  // Add state tax
  const stateTax = additionalIncome * stateTaxRate;
  totalTax += stateTax;

  // Social Security stops at the wage base; the 0.9% Additional Medicare starts at the threshold
  if (ficaStatus) {
    totalTax +=
      employeeFica(baseIncome + additionalIncome, ficaStatus) -
      employeeFica(baseIncome, ficaStatus);
  }

  totalTax +=
    model.tax(baseIncome + additionalIncome, qualifiedOvertime) - model.tax(baseIncome, 0);

  const effectiveRate = additionalIncome > 0 ? totalTax / additionalIncome : 0;

  return { tax: totalTax, effectiveRate };
}

/**
 * Calculate overtime earnings and taxes
 */
export function calculateOvertime(inputs: OvertimeCalculatorInputs): OvertimeCalculatorResult {
  const {
    currency,
    hourlyRate,
    overtimeMultiplier,
    overtimeHours,
    currentAnnualIncome,
    filingStatus,
    stateTaxRate,
    includeFICA,
  } = inputs;

  const model = incomeTaxModel(currency, filingStatus);
  const ficaStatus = includeFICA && currency === 'USD' ? OVERTIME_STATUS_MAP[filingStatus] : null;

  // Calculate gross overtime
  const overtimeRate = hourlyRate * overtimeMultiplier;
  const weeklyGrossOT = overtimeRate * overtimeHours;
  const annualGrossOT = weeklyGrossOT * WEEKS_PER_YEAR;
  const qualifiedOvertime =
    currency === 'USD'
      ? Math.min(Math.max(0, overtimeMultiplier - 1), OT_PREMIUM_DEDUCTIBLE) *
        hourlyRate *
        overtimeHours *
        WEEKS_PER_YEAR
      : 0;

  // Calculate tax on overtime income
  const { tax: totalOTTax, effectiveRate: effectiveTaxRate } = calculateMarginalTax(
    currentAnnualIncome,
    annualGrossOT,
    qualifiedOvertime,
    model,
    stateTaxRate,
    ficaStatus
  );

  // Net calculations
  const annualNetOT = annualGrossOT - totalOTTax;
  const weeklyNetOT = annualNetOT / WEEKS_PER_YEAR;
  const effectiveHourlyRate = overtimeHours > 0 ? weeklyNetOT / overtimeHours : 0;

  // Get brackets
  const currentBracket = getTaxBracket(model.taxableIncome(currentAnnualIncome, 0), model.brackets);
  const bracketAfterOT = getTaxBracket(
    model.taxableIncome(currentAnnualIncome + annualGrossOT, qualifiedOvertime),
    model.brackets
  );
  const pushesIntoBracket = bracketAfterOT.rate > currentBracket.rate;

  // Break-even analysis
  const effectiveRate = effectiveHourlyRate > 0 ? effectiveHourlyRate : 1;
  const breakEven = {
    hours100: Math.ceil(100 / effectiveRate),
    hours500: Math.ceil(500 / effectiveRate),
    hours1000: Math.ceil(1000 / effectiveRate),
  };

  return {
    currency,
    weeklyGrossOT: Math.round(weeklyGrossOT * 100) / 100,
    weeklyNetOT: Math.round(weeklyNetOT * 100) / 100,
    effectiveHourlyRate: Math.round(effectiveHourlyRate * 100) / 100,
    annualGrossOT: Math.round(annualGrossOT),
    annualNetOT: Math.round(annualNetOT),
    totalOTTax: Math.round(totalOTTax),
    effectiveTaxRate: Math.round(effectiveTaxRate * 1000) / 10,
    currentBracket,
    bracketAfterOT,
    pushesIntoBracket,
    breakEven,
  };
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
