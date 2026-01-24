/**
 * EV vs Gas Calculator - Type Definitions
 */

import type { Currency } from '../../../lib/regions';

export interface EVvsGasInputs {
  currency: Currency;
  // Vehicle costs
  evPrice: number;
  gasPrice: number;
  // Driving habits
  annualMiles: number;
  yearsOwnership: number;
  // EV specs
  evEfficiency: number; // miles per kWh (or km per kWh)
  electricityRate: number; // per kWh
  homeChargingPercent: number; // % charged at home vs public
  publicChargingRate: number; // per kWh at public chargers
  // Gas specs
  gasMpg: number; // miles per gallon (or km per liter)
  gasPerGallon: number; // fuel cost
  // Maintenance & other
  evMaintenanceYearly: number;
  gasMaintenanceYearly: number;
  evTaxCredit: number;
  evInsuranceYearly: number;
  gasInsuranceYearly: number;
  // Unit preference
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
  co2Saved: number; // lbs or kg
  yearlyCostComparison: { year: number; evTotal: number; gasTotal: number }[];
}

export function getDefaultInputs(currency: Currency = 'USD'): EVvsGasInputs {
  // Adjust defaults based on currency/region
  const isUK = currency === 'GBP';
  const isEU = currency === 'EUR';

  // EV prices by region
  const evPrice = isUK ? 38000 : isEU ? 42000 : 45000;
  const gasPrice = isUK ? 28000 : isEU ? 32000 : 35000;

  // Electricity rates (per kWh)
  const electricityRate = isUK ? 0.28 : isEU ? 0.3 : 0.13;
  const publicChargingRate = isUK ? 0.65 : isEU ? 0.55 : 0.35;

  // Fuel costs (per gallon/liter)
  const gasPerGallon = isUK ? 1.45 : isEU ? 1.65 : 3.5; // UK/EU use per liter

  // MPG / efficiency (UK/EU tend to use metric)
  const gasMpg = isUK || isEU ? 45 : 30; // MPG for US, higher for efficient EU cars
  const evEfficiency = isUK || isEU ? 4.0 : 3.5; // miles per kWh

  // Annual mileage
  const annualMiles = isUK ? 7400 : isEU ? 8000 : 12000;

  // Tax credits/incentives
  const evTaxCredit = isUK ? 2500 : isEU ? 4000 : 7500;

  // Insurance
  const evInsurance = isUK ? 1400 : isEU ? 1200 : 1800;
  const gasInsurance = isUK ? 1100 : isEU ? 1000 : 1500;

  // Maintenance
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
