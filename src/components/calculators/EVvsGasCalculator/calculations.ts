import type { EVvsGasInputs, EVvsGasResult, CostBreakdown } from './types';

const CO2_PER_GALLON = 19.6;
const CO2_PER_KWH = 0.855;
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

  const kWhNeeded = annualMiles / evEfficiency;
  const homeKwh = kWhNeeded * (homeChargingPercent / 100);
  const publicKwh = kWhNeeded * (1 - homeChargingPercent / 100);
  const evFuelYearly = homeKwh * electricityRate + publicKwh * publicChargingRate;

  let gallonsNeeded: number;
  let gasFuelYearly: number;

  if (useMetric) {
    const kmDriven = annualMiles * 1.60934;
    const litersNeeded = kmDriven / (gasMpg * 0.425144);
    gallonsNeeded = litersNeeded / LITERS_PER_GALLON;
    gasFuelYearly = litersNeeded * gasPerGallon;
  } else {
    gallonsNeeded = annualMiles / gasMpg;
    gasFuelYearly = gallonsNeeded * gasPerGallon;
  }

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

  const upfrontDiff = evPrice - evTaxCredit - gasPrice;
  const yearlyOperationalSavings =
    gasFuelYearly -
    evFuelYearly +
    (gasMaintenanceYearly - evMaintenanceYearly) +
    (gasInsuranceYearly - evInsuranceYearly);

  const breakEvenYears =
    yearlyOperationalSavings > 0 ? Math.max(0, upfrontDiff / yearlyOperationalSavings) : Infinity;

  let betterChoice: 'ev' | 'gas' | 'equal';
  if (Math.abs(totalSavings) < 100) {
    betterChoice = 'equal';
  } else {
    betterChoice = totalSavings > 0 ? 'ev' : 'gas';
  }

  const gasCO2Yearly = gallonsNeeded * CO2_PER_GALLON;
  const evCO2Yearly = kWhNeeded * CO2_PER_KWH;
  let co2Saved = (gasCO2Yearly - evCO2Yearly) * yearsOwnership;

  if (useMetric) {
    co2Saved = co2Saved * LBS_TO_KG;
  }

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
