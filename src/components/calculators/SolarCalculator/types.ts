import type { Currency } from '../../../lib/regions';

export type SystemSize = 'small' | 'medium' | 'large' | 'custom';
export type InstallationType = 'roof' | 'ground';

export interface SolarCalculatorInputs {
  currency: Currency;

  systemSizeKw: number;
  systemCost: number;
  installationType: InstallationType;

  monthlyElectricBill: number;
  electricityRate: number;
  annualRateIncrease: number;
  peakSunHours: number;
  systemEfficiency: number;
  federalTaxCredit: number;
  stateTaxCredit: number;
  localRebate: number;
  srecValue: number;
  financed: boolean;
  loanInterestRate: number;
  loanTermYears: number;
}

export interface SolarCalculatorResult {
  currency: Currency;

  annualProductionKwh: number;
  monthlyProductionKwh: number;
  coveragePercent: number;
  grossCost: number;
  federalCredit: number;
  stateCredit: number;
  totalIncentives: number;
  netCost: number;

  monthlyPayment: number;
  totalFinancingCost: number;

  firstYearSavings: number;
  year5Savings: number;
  year10Savings: number;
  year25Savings: number;
  lifetimeSavings: number;
  paybackYears: number;
  roi25Year: number;
  co2OffsetTons: number;
  treesEquivalent: number;
  tips: string[];
}

export const SYSTEM_SIZES: Record<SystemSize, number> = {
  small: 4,
  medium: 7,
  large: 10,
  custom: 6,
};

export const COST_PER_WATT: Record<Currency, number> = {
  USD: 2.75,
  GBP: 2.5,
  EUR: 2.6,
};

export const AVG_SUN_HOURS: Record<Currency, number> = {
  USD: 5,
  GBP: 3.5,
  EUR: 4,
};

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
