/**
 * Compound Interest Calculator - Calculation Logic
 *
 * A = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)]
 */

import type { CompoundInterestInputs, CompoundInterestResult, CompoundFrequency } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Get compound periods per year
 */
function getPeriodsPerYear(frequency: CompoundFrequency): number {
  switch (frequency) {
    case 'daily': return 365;
    case 'monthly': return 12;
    case 'quarterly': return 4;
    case 'semiannually': return 2;
    case 'annually': return 1;
    default: return 12;
  }
}

/**
 * Calculate compound interest with monthly contributions
 * Properly handles different compound frequencies
 */
export function calculateCompoundInterest(inputs: CompoundInterestInputs): CompoundInterestResult {
  const {
    currency,
    principal,
    monthlyContribution,
    interestRate,
    years,
    compoundFrequency,
  } = inputs;

  const n = getPeriodsPerYear(compoundFrequency); // Compounds per year
  const r = interestRate; // Annual rate as decimal
  const t = years;
  const pmt = monthlyContribution;

  // Calculate year-by-year breakdown
  const yearlyBreakdown: CompoundInterestResult['yearlyBreakdown'] = [];
  let balance = principal;
  let totalContributions = principal;
  let totalInterest = 0;

  // Determine compound period in months
  const monthsPerCompound = 12 / n;
  const ratePerPeriod = r / n;

  for (let year = 1; year <= t; year++) {
    const annualContribution = pmt * 12;
    const startBalance = balance;

    // Simulate month by month, applying compound interest at the right frequency
    for (let month = 1; month <= 12; month++) {
      // Add monthly contribution first
      balance += pmt;

      // Apply compound interest if this is a compounding period
      // Daily: compound every month (approximated as monthly for simplicity with daily rate)
      // Monthly: compound every month
      // Quarterly: compound every 3 months
      // Semi-annually: compound every 6 months
      // Annually: compound every 12 months
      if (compoundFrequency === 'daily') {
        // For daily compounding, use daily rate applied ~30 times per month
        const dailyRate = r / 365;
        const daysInMonth = 30; // Approximation
        balance = balance * Math.pow(1 + dailyRate, daysInMonth);
      } else if (month % monthsPerCompound === 0) {
        // Apply compound interest for this period
        balance = balance * (1 + ratePerPeriod);
      }
    }

    const yearInterest = balance - startBalance - annualContribution;
    totalContributions += annualContribution;
    totalInterest += yearInterest;

    yearlyBreakdown.push({
      year,
      balance: round(balance),
      contributions: round(totalContributions),
      interest: round(totalInterest),
    });
  }

  // Calculate effective annual rate
  const effectiveAnnualRate = Math.pow(1 + r / n, n) - 1;

  return {
    currency,
    finalBalance: round(balance),
    totalContributions: round(totalContributions),
    totalInterest: round(totalInterest),
    yearlyBreakdown,
    effectiveAnnualRate: round(effectiveAnnualRate * 100, 2),
  };
}

export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
