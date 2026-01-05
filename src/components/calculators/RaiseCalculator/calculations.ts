/**
 * Raise Calculator - Calculation Logic
 *
 * Pure functions for calculating the long-term value of raises.
 */

import type { RaiseCalculatorInputs, RaiseCalculatorResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/** Standard working hours per year */
const HOURS_PER_YEAR = 2080;

/**
 * Calculate raise value
 */
export function calculateRaise(inputs: RaiseCalculatorInputs): RaiseCalculatorResult {
  const {
    currency,
    currentSalary,
    raisePercentage,
    yearsToRetirement,
    investmentReturn,
    annualGrowthRate,
  } = inputs;

  // Basic raise calculations
  const raiseAmount = currentSalary * raisePercentage;
  const newSalary = currentSalary + raiseAmount;
  const monthlyRaise = raiseAmount / 12;
  const hourlyEquivalent = raiseAmount / HOURS_PER_YEAR;

  // Calculate year-by-year breakdown
  const yearlyBreakdown: RaiseCalculatorResult['yearlyBreakdown'] = [];
  let cumulativeIncome = 0;
  let investedValue = 0;

  for (let year = 1; year <= yearsToRetirement; year++) {
    // The raise compounds with annual growth rate
    // Year 1: just the raise amount
    // Year 2+: previous year's additional income * (1 + growth rate)
    const growthMultiplier = Math.pow(1 + annualGrowthRate, year - 1);
    const additionalIncome = raiseAmount * growthMultiplier;

    cumulativeIncome += additionalIncome;

    // Investment calculation: each year's additional income grows at investment return
    // for remaining years
    const yearsToGrow = yearsToRetirement - year;
    const thisYearInvested = additionalIncome * Math.pow(1 + investmentReturn, yearsToGrow);
    investedValue += thisYearInvested;

    yearlyBreakdown.push({
      year,
      additionalIncome: Math.round(additionalIncome),
      cumulativeIncome: Math.round(cumulativeIncome),
      investedValue: Math.round(investedValue),
    });
  }

  return {
    currency,
    newSalary: Math.round(newSalary),
    raiseAmount: Math.round(raiseAmount),
    monthlyRaise: Math.round(monthlyRaise),
    lifetimeValue: Math.round(cumulativeIncome),
    investedValue: Math.round(investedValue),
    hourlyEquivalent: Math.round(hourlyEquivalent * 100) / 100,
    yearlyBreakdown,
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
