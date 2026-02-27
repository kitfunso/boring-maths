/**
 * ROI Calculator - Calculation Logic
 *
 * Pure functions for calculating return on investment metrics.
 */

import type { ROICalculatorInputs, ROICalculatorResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Round to 2 decimal places
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate ROI, annualised ROI, and total gain/loss
 */
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

  // Determine the effective gain and final value based on input mode
  let effectiveGain: number;
  let effectiveFinalValue: number;

  if (inputMode === 'finalValue') {
    effectiveFinalValue = finalValue;
    effectiveGain = finalValue - initialInvestment;
  } else {
    effectiveGain = gainAmount;
    effectiveFinalValue = initialInvestment + gainAmount;
  }

  // Convert time period to years
  const timeInYears = timePeriodUnit === 'months' ? timePeriod / 12 : timePeriod;

  // Check validity
  const isValid = initialInvestment > 0 && timeInYears > 0;

  // Calculate ROI percentage
  const roiPercentage = isValid ? (effectiveGain / initialInvestment) * 100 : 0;

  // Calculate annualised ROI using CAGR formula:
  // Annualised ROI = ((Final / Initial) ^ (1 / years)) - 1
  let annualisedROI = 0;
  if (isValid && effectiveFinalValue > 0) {
    annualisedROI = (Math.pow(effectiveFinalValue / initialInvestment, 1 / timeInYears) - 1) * 100;
  } else if (isValid && effectiveFinalValue <= 0) {
    // Total loss or worse - annualised ROI is -100%
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

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'GBP',
  decimals: number = 2
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}

/**
 * Format a percentage value for display
 */
export function formatPercentage(value: number): string {
  return (
    value.toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + '%'
  );
}
