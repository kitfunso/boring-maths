/**
 * EV vs Gas Calculator - Calculations
 */

import type { EVvsGasInputs, EVvsGasResult, CostBreakdown } from './types';

// Average CO2 emissions per gallon of gas (lbs)
const CO2_PER_GALLON = 19.6;
// Average CO2 per kWh (US grid average, lbs)
const CO2_PER_KWH = 0.855;
// Conversion factors
const LBS_TO_KG = 0.453592;
const LITERS_PER_GALLON = 3.78541;

export function calculateEVvsGas(inputs: EVvsGasInputs): EVvsGasResult {
  const {
    evPrice,
    gasPrice,
    annualMiles,
    yearsOwnership,
    evEfficiency,
    electricityRate,
    homeChargingPercent,
    publicChargingRate,
    gasMpg,
    gasPerGallon,
    evMaintenanceYearly,
    gasMaintenanceYearly,
    evTaxCredit,
    evInsuranceYearly,
    gasInsuranceYearly,
    useMetric,
  } = inputs;

  // Calculate yearly fuel costs
  const kWhNeeded = annualMiles / evEfficiency;
  const homeKwh = kWhNeeded * (homeChargingPercent / 100);
  const publicKwh = kWhNeeded * (1 - homeChargingPercent / 100);
  const evFuelYearly = homeKwh * electricityRate + publicKwh * publicChargingRate;

  // For gas: if useMetric, gasPerGallon is actually per liter
  let gallonsNeeded: number;
  let gasFuelYearly: number;

  if (useMetric) {
    // Convert miles to km, use km/L efficiency
    const kmDriven = annualMiles * 1.60934;
    const litersNeeded = kmDriven / (gasMpg * 0.425144); // Convert MPG to km/L equivalent
    gallonsNeeded = litersNeeded / LITERS_PER_GALLON; // For CO2 calc
    gasFuelYearly = litersNeeded * gasPerGallon;
  } else {
    gallonsNeeded = annualMiles / gasMpg;
    gasFuelYearly = gallonsNeeded * gasPerGallon;
  }

  // Calculate total costs over ownership period
  const evCosts: CostBreakdown = {
    purchase: evPrice,
    incentives: -evTaxCredit,
    fuel: evFuelYearly * yearsOwnership,
    maintenance: evMaintenanceYearly * yearsOwnership,
    insurance: evInsuranceYearly * yearsOwnership,
    total: 0,
  };
  evCosts.total =
    evCosts.purchase + evCosts.incentives + evCosts.fuel + evCosts.maintenance + evCosts.insurance;

  const gasCosts: CostBreakdown = {
    purchase: gasPrice,
    incentives: 0,
    fuel: gasFuelYearly * yearsOwnership,
    maintenance: gasMaintenanceYearly * yearsOwnership,
    insurance: gasInsuranceYearly * yearsOwnership,
    total: 0,
  };
  gasCosts.total = gasCosts.purchase + gasCosts.fuel + gasCosts.maintenance + gasCosts.insurance;

  const totalSavings = gasCosts.total - evCosts.total;
  const savingsPerYear = totalSavings / yearsOwnership;
  const savingsPerMonth = savingsPerYear / 12;

  // Calculate break-even point
  const upfrontDiff = evPrice - evTaxCredit - gasPrice;
  const yearlyOperationalSavings =
    gasFuelYearly -
    evFuelYearly +
    (gasMaintenanceYearly - evMaintenanceYearly) +
    (gasInsuranceYearly - evInsuranceYearly);

  const breakEvenYears =
    yearlyOperationalSavings > 0 ? Math.max(0, upfrontDiff / yearlyOperationalSavings) : Infinity;

  // Determine better choice
  let betterChoice: 'ev' | 'gas' | 'equal';
  if (Math.abs(totalSavings) < 100) {
    betterChoice = 'equal';
  } else {
    betterChoice = totalSavings > 0 ? 'ev' : 'gas';
  }

  // Calculate CO2 savings (in lbs, convert to kg if metric)
  const gasCO2Yearly = gallonsNeeded * CO2_PER_GALLON;
  const evCO2Yearly = kWhNeeded * CO2_PER_KWH;
  let co2Saved = (gasCO2Yearly - evCO2Yearly) * yearsOwnership;

  if (useMetric) {
    co2Saved = co2Saved * LBS_TO_KG;
  }

  // Yearly cost comparison for chart
  const yearlyCostComparison = [];
  let evRunning = evPrice - evTaxCredit;
  let gasRunning = gasPrice;

  for (let year = 1; year <= yearsOwnership; year++) {
    evRunning += evFuelYearly + evMaintenanceYearly + evInsuranceYearly;
    gasRunning += gasFuelYearly + gasMaintenanceYearly + gasInsuranceYearly;
    yearlyCostComparison.push({
      year,
      evTotal: Math.round(evRunning),
      gasTotal: Math.round(gasRunning),
    });
  }

  return {
    evCosts,
    gasCosts,
    totalSavings: Math.round(totalSavings),
    savingsPerYear: Math.round(savingsPerYear),
    savingsPerMonth: Math.round(savingsPerMonth),
    breakEvenYears: breakEvenYears === Infinity ? -1 : Math.round(breakEvenYears * 10) / 10,
    betterChoice,
    co2Saved: Math.round(co2Saved),
    yearlyCostComparison,
  };
}
