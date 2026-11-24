import type { CompoundInterestInputs, CompoundInterestResult, CompoundFrequency } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function getPeriodsPerYear(frequency: CompoundFrequency): number {
  switch (frequency) {
    case 'daily':
      return 365;
    case 'monthly':
      return 12;
    case 'quarterly':
      return 4;
    case 'semiannually':
      return 2;
    case 'annually':
      return 1;
    default:
      return 12;
  }
}

export function calculateCompoundInterest(inputs: CompoundInterestInputs): CompoundInterestResult {
  const { currency, principal, monthlyContribution, interestRate, years, compoundFrequency } =
    inputs;

  const n = getPeriodsPerYear(compoundFrequency);
  const r = interestRate;
  const t = years;
  const pmt = monthlyContribution;

  const yearlyBreakdown: CompoundInterestResult['yearlyBreakdown'] = [];
  let balance = principal;
  let totalContributions = principal;
  let totalInterest = 0;

  const monthsPerCompound = 12 / n;
  const ratePerPeriod = r / n;

  for (let year = 1; year <= t; year++) {
    const annualContribution = pmt * 12;
    const startBalance = balance;

    for (let month = 1; month <= 12; month++) {
      balance += pmt;

      if (compoundFrequency === 'daily') {
        const dailyRate = r / 365;
        const daysInMonth = 30;
        balance = balance * Math.pow(1 + dailyRate, daysInMonth);
      } else if (month % monthsPerCompound === 0) {
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
