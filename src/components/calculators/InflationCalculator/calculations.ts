/**
 * Inflation Calculator - Calculation Logic
 */

import { HISTORICAL_INFLATION, DEFAULT_INFLATION_RATE, type InflationInputs, type InflationResult } from './types';

export function getInflationRate(year: number): number {
  return HISTORICAL_INFLATION[year] ?? DEFAULT_INFLATION_RATE;
}

export function calculateInflation(inputs: InflationInputs): InflationResult {
  const { amount, startYear, endYear, customRate, useCustomRate } = inputs;

  const yearsElapsed = Math.abs(endYear - startYear);
  const isForward = endYear >= startYear;
  const fromYear = Math.min(startYear, endYear);
  const toYear = Math.max(startYear, endYear);

  let adjustedAmount = amount;

  if (useCustomRate && customRate !== undefined) {
    // Use custom fixed rate
    const rate = customRate / 100;
    if (isForward) {
      adjustedAmount = amount * Math.pow(1 + rate, yearsElapsed);
    } else {
      adjustedAmount = amount / Math.pow(1 + rate, yearsElapsed);
    }
  } else {
    // Use historical rates
    for (let year = fromYear; year < toYear; year++) {
      const rate = getInflationRate(year) / 100;
      adjustedAmount *= (1 + rate);
    }

    // If going backwards (what was $X worth in the past?)
    if (!isForward) {
      adjustedAmount = amount * amount / adjustedAmount;
    }
  }

  const totalInflation = ((adjustedAmount - amount) / amount) * 100;
  const averageAnnualRate = yearsElapsed > 0
    ? (Math.pow(adjustedAmount / amount, 1 / yearsElapsed) - 1) * 100
    : 0;
  const purchasingPowerLost = isForward
    ? ((1 - amount / adjustedAmount) * 100)
    : 0;

  return {
    originalAmount: amount,
    adjustedAmount,
    totalInflation,
    averageAnnualRate,
    purchasingPowerLost,
    yearsElapsed,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function getDecadeAverages(): { decade: string; rate: number }[] {
  const decades: { decade: string; rate: number }[] = [];

  for (let startYear = 1920; startYear <= 2020; startYear += 10) {
    const endYear = Math.min(startYear + 9, 2024);
    let sum = 0;
    let count = 0;

    for (let year = startYear; year <= endYear; year++) {
      if (HISTORICAL_INFLATION[year] !== undefined) {
        sum += HISTORICAL_INFLATION[year];
        count++;
      }
    }

    if (count > 0) {
      decades.push({
        decade: `${startYear}s`,
        rate: sum / count,
      });
    }
  }

  return decades;
}
