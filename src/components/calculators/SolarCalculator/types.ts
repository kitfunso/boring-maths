/**
 * Solar Panel Calculator - Type Definitions
 *
 * Calculate solar panel system costs, payback period, and long-term savings.
 */

import type { Currency } from '../../../lib/regions';

export type SystemSize = 'small' | 'medium' | 'large' | 'custom';
export type InstallationType = 'roof' | 'ground';

export interface SolarCalculatorInputs {
  currency: Currency;

  // System specifications
  systemSizeKw: number;
  systemCost: number; // total before incentives
  installationType: InstallationType;

  // Energy usage
  monthlyElectricBill: number;
  electricityRate: number; // per kWh
  annualRateIncrease: number; // percentage

  // Location factors
  peakSunHours: number; // average daily peak sun hours
  systemEfficiency: number; // percentage (typically 80-85%)

  // Incentives
  federalTaxCredit: number; // percentage (currently 30% in US)
  stateTaxCredit: number;
  localRebate: number; // flat amount
  srecValue: number; // solar renewable energy credit per kWh

  // Financing
  financed: boolean;
  loanInterestRate: number;
  loanTermYears: number;
}

export interface SolarCalculatorResult {
  currency: Currency;

  // System output
  annualProductionKwh: number;
  monthlyProductionKwh: number;
  coveragePercent: number; // of monthly bill

  // Costs
  grossCost: number;
  federalCredit: number;
  stateCredit: number;
  totalIncentives: number;
  netCost: number;

  // Financing
  monthlyPayment: number;
  totalFinancingCost: number;

  // Savings
  firstYearSavings: number;
  year5Savings: number;
  year10Savings: number;
  year25Savings: number;
  lifetimeSavings: number; // 25 years

  // ROI
  paybackYears: number;
  roi25Year: number; // percentage

  // Environmental
  co2OffsetTons: number; // annual
  treesEquivalent: number; // annual

  // Tips
  tips: string[];
}

// System size presets (kW)
export const SYSTEM_SIZES: Record<SystemSize, number> = {
  small: 4,
  medium: 7,
  large: 10,
  custom: 6,
};

// Average cost per watt by currency
export const COST_PER_WATT: Record<Currency, number> = {
  USD: 2.75,
  GBP: 2.5,
  EUR: 2.6,
};

// Average peak sun hours by region (simplified)
export const AVG_SUN_HOURS: Record<Currency, number> = {
  USD: 5, // US average
  GBP: 3.5, // UK average
  EUR: 4, // EU average
};

// CO2 offset per kWh (lbs)
export const CO2_PER_KWH = 0.92;

export function getDefaultInputs(currency: Currency = 'USD'): SolarCalculatorInputs {
  const systemSizeKw = 7;
  const costPerWatt = COST_PER_WATT[currency];

  return {
    currency,
    systemSizeKw,
    systemCost: Math.round(systemSizeKw * 1000 * costPerWatt),
    installationType: 'roof',
    monthlyElectricBill: currency === 'USD' ? 150 : currency === 'GBP' ? 100 : 120,
    electricityRate: currency === 'USD' ? 0.15 : currency === 'GBP' ? 0.3 : 0.25,
    annualRateIncrease: 3,
    peakSunHours: AVG_SUN_HOURS[currency],
    systemEfficiency: 85,
    federalTaxCredit: currency === 'USD' ? 30 : 0,
    stateTaxCredit: 0,
    localRebate: 0,
    srecValue: 0,
    financed: false,
    loanInterestRate: 6,
    loanTermYears: 15,
  };
}

export const DEFAULT_INPUTS: SolarCalculatorInputs = getDefaultInputs('USD');
