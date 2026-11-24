import type { ROICalculatorInputs, ROICalculatorResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function calculateROI(inputs: ROICalculatorInputs): ROICalculatorResult {
  const {
    currency,
    initialInvestment,
    inputMode,
    finalValue,
    gainAmount,
    timePeriod,
    timePeriodUnit,
  } = inputs;

  let effectiveGain: number;
  let effectiveFinalValue: number;

  if (inputMode === 'finalValue') {
    effectiveFinalValue = finalValue;
    effectiveGain = finalValue - initialInvestment;
  } else {
    effectiveGain = gainAmount;
    effectiveFinalValue = initialInvestment + gainAmount;
  }

  const timeInYears = timePeriodUnit === 'months' ? timePeriod / 12 : timePeriod;

  const isValid = initialInvestment > 0 && timeInYears > 0;

  const roiPercentage = isValid ? (effectiveGain / initialInvestment) * 100 : 0;

  let annualisedROI = 0;
  if (isValid && effectiveFinalValue > 0) {
    annualisedROI = (Math.pow(effectiveFinalValue / initialInvestment, 1 / timeInYears) - 1) * 100;
  } else if (isValid && effectiveFinalValue <= 0) {
    annualisedROI = -100;
  }

  return {
    currency,
    totalGainLoss: round(effectiveGain),
    finalValue: round(effectiveFinalValue),
    roiPercentage: round(roiPercentage),
    annualisedROI: round(annualisedROI),
    timeInYears: round(timeInYears, 1),
    isGain: effectiveGain >= 0,
    isValid,
  };
}

export function formatCurrency(
  value: number,
  currency: Currency = 'GBP',
  decimals: number = 2
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}

export function formatPercentage(value: number): string {
  return (
    value.toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + '%'
  );
}
