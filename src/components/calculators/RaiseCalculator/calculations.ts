import type { RaiseCalculatorInputs, RaiseCalculatorResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

const HOURS_PER_YEAR = 2080;

export function calculateRaise(inputs: RaiseCalculatorInputs): RaiseCalculatorResult {
  const {
    currency,
    currentSalary,
    raisePercentage,
    yearsToRetirement,
    investmentReturn,
    annualGrowthRate,
  } = inputs;

  const raiseAmount = currentSalary * raisePercentage;
  const newSalary = currentSalary + raiseAmount;
  const monthlyRaise = raiseAmount / 12;
  const hourlyEquivalent = raiseAmount / HOURS_PER_YEAR;

  const yearlyBreakdown: RaiseCalculatorResult['yearlyBreakdown'] = [];
  let cumulativeIncome = 0;
  let investedValue = 0;

  for (let year = 1; year <= yearsToRetirement; year++) {
    const growthMultiplier = Math.pow(1 + annualGrowthRate, year - 1);
    const additionalIncome = raiseAmount * growthMultiplier;

    cumulativeIncome += additionalIncome;

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

export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
