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
  const r = interestRate; // Annual rate
  const t = years;
  const pmt = monthlyContribution;

  // Calculate year-by-year breakdown
  const yearlyBreakdown: CompoundInterestResult['yearlyBreakdown'] = [];
  let balance = principal;
  let totalContributions = principal;
  let totalInterest = 0;

  for (let year = 1; year <= t; year++) {
    // Add monthly contributions throughout the year
    const annualContribution = pmt * 12;

    // Calculate interest for this year (simplified with compound growth)
    // Using formula for future value with periodic contributions
    const startBalance = balance;

    // For more accurate simulation, calculate month by month
    for (let month = 0; month < 12; month++) {
      // Add monthly interest
      const monthlyRate = r / 12;
      balance = balance * (1 + monthlyRate) + pmt;
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
