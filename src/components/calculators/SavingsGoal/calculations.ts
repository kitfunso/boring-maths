import type { SavingsGoalInputs, SavingsGoalResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function getPeriodsPerYear(frequency: string): number {
  switch (frequency) {
    case 'weekly':
      return 52;
    case 'biweekly':
      return 26;
    case 'monthly':
    default:
      return 12;
  }
}

export function calculateSavingsGoal(inputs: SavingsGoalInputs): SavingsGoalResult {
  const {
    currency,
    goalAmount,
    currentSavings,
    timelineYears,
    annualReturn,
    inflationRate,
    contributionFrequency,
  } = inputs;

  const periodsPerYear = getPeriodsPerYear(contributionFrequency);
  const totalPeriods = timelineYears * periodsPerYear;
  const periodRate = annualReturn / periodsPerYear;

  const realReturnRate = (1 + annualReturn) / (1 + inflationRate) - 1;

  const inflationAdjustedGoal = goalAmount / Math.pow(1 + inflationRate, timelineYears);

  const futureValueOfCurrent = currentSavings * Math.pow(1 + periodRate, totalPeriods);

  const amountNeeded = goalAmount - futureValueOfCurrent;

  let contributionAmount: number;
  if (amountNeeded <= 0) {
    contributionAmount = 0;
  } else if (periodRate === 0) {
    contributionAmount = amountNeeded / totalPeriods;
  } else {
    const factor = (Math.pow(1 + periodRate, totalPeriods) - 1) / periodRate;
    contributionAmount = amountNeeded / factor;
  }

  const totalContributions = contributionAmount * totalPeriods;
  const finalBalance =
    futureValueOfCurrent +
    totalContributions +
    (periodRate > 0
      ? contributionAmount *
        ((Math.pow(1 + periodRate, totalPeriods) - 1) / periodRate - totalPeriods)
      : 0);
  const totalInterest = finalBalance - currentSavings - totalContributions;

  const projectionData: SavingsGoalResult['projectionData'] = [];
  let balance = currentSavings;
  let totalContrib = 0;
  let totalInt = 0;

  const monthlyRate = annualReturn / 12;
  const monthlyContribution = (contributionAmount * periodsPerYear) / 12;

  for (
    let month = 0;
    month <= timelineYears * 12;
    month += Math.max(1, Math.floor((timelineYears * 12) / 24))
  ) {
    projectionData.push({
      month,
      balance: round(balance),
      contributions: round(totalContrib),
      interest: round(totalInt),
    });

    const monthsToAdd = Math.max(1, Math.floor((timelineYears * 12) / 24));
    for (let m = 0; m < monthsToAdd && month + m < timelineYears * 12; m++) {
      const interest = balance * monthlyRate;
      totalInt += interest;
      totalContrib += monthlyContribution;
      balance += monthlyContribution + interest;
    }
  }

  const frequencyLabels: Record<string, string> = {
    monthly: 'month',
    biweekly: 'two weeks',
    weekly: 'week',
  };

  return {
    currency,
    contributionAmount: round(contributionAmount),
    contributionFrequency: frequencyLabels[contributionFrequency],
    totalContributions: round(totalContributions),
    totalInterest: round(Math.max(0, totalInterest)),
    finalBalance: round(Math.max(goalAmount, finalBalance)),
    inflationAdjustedGoal: round(inflationAdjustedGoal),
    realReturnRate: round(realReturnRate * 100, 1),
    projectionData,
  };
}

export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
