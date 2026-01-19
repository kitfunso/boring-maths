/**
 * Overtime Calculator - Calculation Logic
 *
 * Pure functions for calculating overtime value after taxes.
 */

import type { OvertimeCalculatorInputs, OvertimeCalculatorResult, TaxBracket } from './types';
import { US_TAX_BRACKETS, UK_TAX_BRACKETS } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/** FICA tax rate (Social Security 6.2% + Medicare 1.45%) */
const FICA_RATE = 0.0765;

/** Social Security wage base for 2025 */
const SS_WAGE_BASE = 176100;

/** Weeks per year */
const WEEKS_PER_YEAR = 52;

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

/**
 * Calculate marginal tax rate on additional income
 */
function calculateMarginalTax(
  baseIncome: number,
  additionalIncome: number,
  brackets: TaxBracket[],
  stateTaxRate: number,
  includeFICA: boolean,
  currency: Currency
): { tax: number; effectiveRate: number } {
  let remainingIncome = additionalIncome;
  let totalTax = 0;
  let currentIncome = baseIncome;

  // Add state tax
  const stateTax = additionalIncome * stateTaxRate;
  totalTax += stateTax;

  // Add FICA if applicable (US only)
  if (includeFICA && currency === 'USD') {
    // Social Security only up to wage base
    const ssWagesRemaining = Math.max(0, SS_WAGE_BASE - baseIncome);
    const ssWagesTaxed = Math.min(additionalIncome, ssWagesRemaining);
    const ssTax = ssWagesTaxed * 0.062;
    const medicareTax = additionalIncome * 0.0145;
    totalTax += ssTax + medicareTax;
  }

  // Calculate federal tax by walking through brackets
  while (remainingIncome > 0) {
    const bracket = getTaxBracket(currentIncome, brackets);
    const roomInBracket = bracket.max - currentIncome;
    const taxableInBracket = Math.min(remainingIncome, roomInBracket);

    totalTax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
    currentIncome += taxableInBracket;
  }

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

  // Get tax brackets based on currency/region
  const brackets =
    currency === 'GBP'
      ? UK_TAX_BRACKETS
      : currency === 'EUR'
        ? UK_TAX_BRACKETS // Use UK brackets as proxy for EU
        : US_TAX_BRACKETS[filingStatus];

  // Calculate gross overtime
  const overtimeRate = hourlyRate * overtimeMultiplier;
  const weeklyGrossOT = overtimeRate * overtimeHours;
  const annualGrossOT = weeklyGrossOT * WEEKS_PER_YEAR;

  // Calculate tax on overtime income
  const { tax: totalOTTax, effectiveRate: effectiveTaxRate } = calculateMarginalTax(
    currentAnnualIncome,
    annualGrossOT,
    brackets,
    stateTaxRate,
    includeFICA,
    currency
  );

  // Net calculations
  const annualNetOT = annualGrossOT - totalOTTax;
  const weeklyNetOT = annualNetOT / WEEKS_PER_YEAR;
  const effectiveHourlyRate = overtimeHours > 0 ? weeklyNetOT / overtimeHours : 0;

  // Get brackets
  const currentBracket = getTaxBracket(currentAnnualIncome, brackets);
  const bracketAfterOT = getTaxBracket(currentAnnualIncome + annualGrossOT, brackets);
  const pushesIntoBracket = bracketAfterOT.rate > currentBracket.rate;

  // Break-even analysis
  const effectiveRate = effectiveHourlyRate > 0 ? effectiveHourlyRate : 1;
  const breakEven = {
    hours100: Math.ceil(100 / effectiveRate),
    hours500: Math.ceil(500 / effectiveRate),
    hours1000: Math.ceil(1000 / effectiveRate),
  };

  // Monthly breakdown showing cumulative effect and diminishing returns
  const monthlyBreakdown: OvertimeCalculatorResult['monthlyBreakdown'] = [];
  let cumulativeGross = 0;
  let cumulativeNet = 0;

  for (let month = 1; month <= 12; month++) {
    const monthlyGross = (weeklyGrossOT * WEEKS_PER_YEAR) / 12;
    cumulativeGross += monthlyGross;

    // Calculate tax with progressive income
    const incomeToDate = currentAnnualIncome * (month / 12);
    const { tax, effectiveRate: monthEffRate } = calculateMarginalTax(
      incomeToDate,
      monthlyGross,
      brackets,
      stateTaxRate,
      includeFICA,
      currency
    );

    const monthlyNet = monthlyGross - tax;
    cumulativeNet += monthlyNet;

    monthlyBreakdown.push({
      month,
      grossOT: Math.round(monthlyGross),
      netOT: Math.round(monthlyNet),
      effectiveRate: overtimeRate * (1 - monthEffRate),
      cumulativeNet: Math.round(cumulativeNet),
    });
  }

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
    monthlyBreakdown,
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
