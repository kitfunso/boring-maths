import type { Currency } from '../../../lib/regions';

export interface EVvsGasInputs {
  currency: Currency;
  evPrice: number;
  gasPrice: number;
  annualMiles: number;
  yearsOwnership: number;
  evEfficiency: number;
  electricityRate: number;
  homeChargingPercent: number;
  publicChargingRate: number;
  gasMpg: number;
  gasPerGallon: number;
  evMaintenanceYearly: number;
  gasMaintenanceYearly: number;
  evTaxCredit: number;
  evInsuranceYearly: number;
  gasInsuranceYearly: number;
  useMetric: boolean;
}

export interface CostBreakdown {
  fuel: number;
  maintenance: number;
  insurance: number;
  purchase: number;
  incentives: number;
  total: number;
}

export interface EVvsGasResult {
  evCosts: CostBreakdown;
  gasCosts: CostBreakdown;
  totalSavings: number;
  savingsPerYear: number;
  savingsPerMonth: number;
  breakEvenYears: number;
  betterChoice: 'ev' | 'gas' | 'equal';
  co2Saved: number;
  yearlyCostComparison: { year: number; evTotal: number; gasTotal: number }[];
}

export function getDefaultInputs(currency: Currency = 'USD'): EVvsGasInputs {
  const isUK = currency === 'GBP';
  const isEU = currency === 'EUR';

  const evPrice = isUK ? 38000 : isEU ? 42000 : 45000;
  const gasPrice = isUK ? 28000 : isEU ? 32000 : 35000;

  const electricityRate = isUK ? 0.28 : isEU ? 0.3 : 0.13;
  const publicChargingRate = isUK ? 0.65 : isEU ? 0.55 : 0.35;

  const gasPerGallon = isUK ? 1.45 : isEU ? 1.65 : 3.5;
  const gasMpg = isUK || isEU ? 45 : 30;
  const evEfficiency = isUK || isEU ? 4.0 : 3.5;
  const annualMiles = isUK ? 7400 : isEU ? 8000 : 12000;

  const evTaxCredit = isUK ? 2500 : isEU ? 4000 : 7500;

  const evInsurance = isUK ? 1400 : isEU ? 1200 : 1800;
  const gasInsurance = isUK ? 1100 : isEU ? 1000 : 1500;

  const evMaintenance = isUK ? 400 : isEU ? 450 : 500;
  const gasMaintenance = isUK ? 900 : isEU ? 1000 : 1200;

  return {
    currency,
    evPrice,
    gasPrice,
    annualMiles,
    yearsOwnership: 5,
    evEfficiency,
    electricityRate,
    homeChargingPercent: 80,
    publicChargingRate,
    gasMpg,
    gasPerGallon,
    evMaintenanceYearly: evMaintenance,
    gasMaintenanceYearly: gasMaintenance,
    evTaxCredit,
    evInsuranceYearly: evInsurance,
    gasInsuranceYearly: gasInsurance,
    useMetric: isUK || isEU,
  };
}

export const DEFAULT_INPUTS: EVvsGasInputs = getDefaultInputs();
