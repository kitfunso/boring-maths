import { type Currency, getCurrencySymbol } from '../../../lib/regions';
import {
  type FIRECalculatorInputs,
  type FIRECalculatorResult,
  type FIRENumbers,
  type FIREMilestone,
  type ProjectionDataPoint,
  type SavingsRateAnalysis,
  type FIREType,
} from './types';

export function calculateFIRE(inputs: FIRECalculatorInputs): FIRECalculatorResult {
  const {
    currentAge,
    currentSavings,
    annualIncome,
    annualExpenses,
    monthlySavings,
    targetRetirementAge,
    desiredRetirementExpenses,
    expectedReturn,
    inflationRate,
    safeWithdrawalRate,
    currency,
  } = inputs;

  const realReturn = (1 + expectedReturn) / (1 + inflationRate) - 1;
  const annualSavings = monthlySavings * 12;

  const fireNumbers = calculateFIRENumbers(
    annualExpenses,
    desiredRetirementExpenses,
    safeWithdrawalRate
  );

  const totalNeeded = desiredRetirementExpenses / safeWithdrawalRate;

  const yearsToFIRE = calculateYearsToFIRE(currentSavings, annualSavings, totalNeeded, realReturn);

  const ageAtFIRE = currentAge + yearsToFIRE;

  const currentProgress = Math.min((currentSavings / totalNeeded) * 100, 100);

  const maxYears = Math.max(50, yearsToFIRE + 10);
  const projections = generateProjections(
    currentAge,
    currentSavings,
    annualSavings,
    realReturn,
    totalNeeded,
    maxYears
  );

  const milestones = calculateMilestones(
    currentAge,
    currentSavings,
    annualSavings,
    realReturn,
    fireNumbers
  );

  const { coastFIREAge, coastFIREAmount } = calculateCoastFIRE(
    currentAge,
    currentSavings,
    annualSavings,
    fireNumbers.regular,
    realReturn,
    65
  );

  const savingsRate = analyzeSavingsRate(
    annualIncome,
    annualSavings,
    currentSavings,
    totalNeeded,
    realReturn,
    targetRetirementAge - currentAge
  );

  const { totalContributions, totalGrowth } = calculateTotalsAtFIRE(
    currentSavings,
    annualSavings,
    realReturn,
    yearsToFIRE
  );

  const monthlyPassiveIncome = (totalNeeded * safeWithdrawalRate) / 12;
  const monthlyExpensesInRetirement = desiredRetirementExpenses / 12;

  return {
    fireNumbers,
    yearsToFIRE,
    ageAtFIRE,
    totalNeeded,
    currentProgress,
    savingsRate,
    totalContributions,
    totalGrowth,
    milestones,
    coastFIREAge,
    coastFIREAmount,
    projections,
    monthlyPassiveIncome,
    monthlyExpensesInRetirement,
    currency,
    assumptions: {
      returnRate: expectedReturn,
      inflationRate,
      safeWithdrawalRate,
      realReturn,
    },
  };
}

function calculateFIRENumbers(
  currentExpenses: number,
  desiredExpenses: number,
  swr: number
): FIRENumbers {
  const leanExpenses = currentExpenses * 0.7;

  const regularExpenses = desiredExpenses;

  const fatExpenses = currentExpenses * 1.5;

  return {
    lean: leanExpenses / swr,
    regular: regularExpenses / swr,
    fat: fatExpenses / swr,
    coast: 0, // Calculated separately
  };
}

function calculateYearsToFIRE(
  currentSavings: number,
  annualSavings: number,
  target: number,
  returnRate: number
): number {
  if (currentSavings >= target) return 0;
  if (annualSavings <= 0) return Infinity;
  if (returnRate === 0) {
    return (target - currentSavings) / annualSavings;
  }

  let low = 0;
  let high = 100;

  while (high - low > 0.1) {
    const mid = (low + high) / 2;
    const futureValue = calculateFutureValue(currentSavings, annualSavings, returnRate, mid);

    if (futureValue < target) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return Math.round(high * 10) / 10;
}

function calculateFutureValue(
  principal: number,
  annualContribution: number,
  rate: number,
  years: number
): number {
  if (rate === 0) {
    return principal + annualContribution * years;
  }

  const compoundFactor = Math.pow(1 + rate, years);
  const principalGrowth = principal * compoundFactor;
  const contributionGrowth = annualContribution * ((compoundFactor - 1) / rate);

  return principalGrowth + contributionGrowth;
}

function generateProjections(
  startAge: number,
  currentSavings: number,
  annualSavings: number,
  returnRate: number,
  fireTarget: number,
  years: number
): ProjectionDataPoint[] {
  const projections: ProjectionDataPoint[] = [];
  let savings = currentSavings;
  const currentYear = new Date().getFullYear();

  for (let i = 0; i <= years; i++) {
    const growth = i === 0 ? 0 : savings * returnRate;
    const contributions = i === 0 ? 0 : annualSavings;

    if (i > 0) {
      savings = savings * (1 + returnRate) + annualSavings;
    }

    projections.push({
      age: startAge + i,
      year: currentYear + i,
      savings: Math.round(savings),
      contributions: Math.round(contributions),
      growth: Math.round(growth),
      fireNumber: fireTarget,
      percentToFIRE: Math.min((savings / fireTarget) * 100, 150),
    });
  }

  return projections;
}

function calculateMilestones(
  currentAge: number,
  currentSavings: number,
  annualSavings: number,
  returnRate: number,
  fireNumbers: FIRENumbers
): FIREMilestone[] {
  const variants: { type: FIREType; label: string; target: number }[] = [
    { type: 'lean', label: 'Lean FIRE', target: fireNumbers.lean },
    { type: 'regular', label: 'FIRE', target: fireNumbers.regular },
    { type: 'fat', label: 'Fat FIRE', target: fireNumbers.fat },
  ];

  return variants.map(({ type, label, target }) => {
    const years = calculateYearsToFIRE(currentSavings, annualSavings, target, returnRate);
    const achievable = years !== Infinity && years <= 50;

    return {
      type,
      label,
      targetAmount: target,
      yearsToReach: achievable ? Math.round(years * 10) / 10 : null,
      ageAtReach: achievable ? Math.round(currentAge + years) : null,
      achievable,
    };
  });
}

function calculateCoastFIRE(
  currentAge: number,
  currentSavings: number,
  annualSavings: number,
  fireTarget: number,
  returnRate: number,
  traditionalRetirementAge: number
): { coastFIREAge: number | null; coastFIREAmount: number } {
  const yearsToTraditional = traditionalRetirementAge - currentAge;

  const coastAmount = fireTarget / Math.pow(1 + returnRate, yearsToTraditional);

  if (currentSavings >= coastAmount) {
    return { coastFIREAge: currentAge, coastFIREAmount: coastAmount };
  }

  const yearsToCoast = calculateYearsToFIRE(currentSavings, annualSavings, coastAmount, returnRate);

  if (yearsToCoast === Infinity || yearsToCoast > yearsToTraditional) {
    return { coastFIREAge: null, coastFIREAmount: coastAmount };
  }

  return {
    coastFIREAge: Math.round(currentAge + yearsToCoast),
    coastFIREAmount: coastAmount,
  };
}

function analyzeSavingsRate(
  annualIncome: number,
  annualSavings: number,
  currentSavings: number,
  target: number,
  returnRate: number,
  targetYears: number
): SavingsRateAnalysis {
  const currentRate = (annualSavings / annualIncome) * 100;

  let requiredAnnualSavings = 0;
  if (targetYears > 0) {
    let low = 0;
    let high = annualIncome;

    while (high - low > 100) {
      const mid = (low + high) / 2;
      const fv = calculateFutureValue(currentSavings, mid, returnRate, targetYears);

      if (fv < target) {
        low = mid;
      } else {
        high = mid;
      }
    }
    requiredAnnualSavings = high;
  }

  const requiredRate = Math.min((requiredAnnualSavings / annualIncome) * 100, 100);

  const optimalRate = 50;

  const monthlyShortfall = Math.max(0, (requiredAnnualSavings - annualSavings) / 12);

  return {
    currentRate: Math.round(currentRate * 10) / 10,
    requiredRateForTarget: Math.round(requiredRate * 10) / 10,
    optimalRate,
    monthlyShortfall: Math.round(monthlyShortfall),
  };
}

function calculateTotalsAtFIRE(
  currentSavings: number,
  annualSavings: number,
  returnRate: number,
  years: number
): { totalContributions: number; totalGrowth: number } {
  const totalContributions = currentSavings + annualSavings * years;
  const finalValue = calculateFutureValue(currentSavings, annualSavings, returnRate, years);
  const totalGrowth = finalValue - totalContributions;

  return {
    totalContributions: Math.round(totalContributions),
    totalGrowth: Math.round(totalGrowth),
  };
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function formatCompact(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);

  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(0)}K`;
  }
  return `${symbol}${amount.toFixed(0)}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatYears(years: number): string {
  if (years === Infinity) return 'Never';
  if (years <= 0) return 'Now!';
  if (years < 1) return `${Math.round(years * 12)} months`;
  return `${years.toFixed(1)} years`;
}

export function getSavingsRateColor(rate: number): string {
  if (rate >= 50) return 'text-green-400';
  if (rate >= 30) return 'text-amber-400';
  if (rate >= 15) return 'text-orange-400';
  return 'text-red-400';
}

export function getProgressColor(percent: number): string {
  if (percent >= 100) return 'bg-green-500';
  if (percent >= 75) return 'bg-emerald-500';
  if (percent >= 50) return 'bg-amber-500';
  if (percent >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}

export const RISK_PROFILE_RETURNS: Record<string, { return: number; label: string }> = {
  conservative: { return: 0.05, label: '5% (Conservative - bonds heavy)' },
  moderate: { return: 0.07, label: '7% (Moderate - balanced portfolio)' },
  aggressive: { return: 0.09, label: '9% (Aggressive - stocks heavy)' },
};

export const FIRE_TYPE_INFO: Record<string, { label: string; description: string }> = {
  lean: {
    label: 'Lean FIRE',
    description: 'Minimal lifestyle, 70% of current expenses',
  },
  regular: {
    label: 'FIRE',
    description: 'Maintain current lifestyle in retirement',
  },
  fat: {
    label: 'Fat FIRE',
    description: 'Comfortable lifestyle, 150% of current expenses',
  },
  coast: {
    label: 'Coast FIRE',
    description: 'Stop saving, let investments grow to retirement',
  },
};
