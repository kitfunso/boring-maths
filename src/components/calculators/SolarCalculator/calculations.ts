/**
 * Solar Panel Calculator - Calculation Logic
 */

import type { SolarCalculatorInputs, SolarCalculatorResult } from './types';
import { CO2_PER_KWH } from './types';

export function calculateSolar(inputs: SolarCalculatorInputs): SolarCalculatorResult {
  const {
    currency,
    systemSizeKw,
    systemCost,
    monthlyElectricBill,
    electricityRate,
    annualRateIncrease,
    peakSunHours,
    systemEfficiency,
    federalTaxCredit,
    stateTaxCredit,
    localRebate,
    srecValue,
    financed,
    loanInterestRate,
    loanTermYears,
  } = inputs;

  // Calculate annual production
  // kWh = kW * peak sun hours * 365 days * efficiency
  const annualProductionKwh = Math.round(
    systemSizeKw * peakSunHours * 365 * (systemEfficiency / 100)
  );
  const monthlyProductionKwh = Math.round(annualProductionKwh / 12);

  // Calculate monthly usage (from bill)
  const monthlyUsageKwh = monthlyElectricBill / electricityRate;
  const coveragePercent = Math.min(100, Math.round((monthlyProductionKwh / monthlyUsageKwh) * 100));

  // Calculate incentives
  const grossCost = systemCost;
  const federalCredit = Math.round(grossCost * (federalTaxCredit / 100));
  const stateCredit = Math.round(grossCost * (stateTaxCredit / 100));
  const totalIncentives = federalCredit + stateCredit + localRebate;
  const netCost = grossCost - totalIncentives;

  // Calculate financing
  let monthlyPayment = 0;
  let totalFinancingCost = 0;
  if (financed && loanTermYears > 0) {
    const monthlyRate = loanInterestRate / 100 / 12;
    const numPayments = loanTermYears * 12;
    if (monthlyRate > 0) {
      monthlyPayment =
        (netCost * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    } else {
      monthlyPayment = netCost / numPayments;
    }
    totalFinancingCost = monthlyPayment * numPayments;
  }

  // Calculate savings over time
  const rateIncreaseFactor = 1 + annualRateIncrease / 100;

  let cumulativeSavings = 0;
  let paybackYears = 0;
  let paybackReached = false;

  const yearSavings: number[] = [];

  for (let year = 1; year <= 25; year++) {
    // Rate increases each year
    const currentRate = electricityRate * Math.pow(rateIncreaseFactor, year - 1);

    // Annual savings = production * current rate + SREC value
    const annualSaving =
      annualProductionKwh * currentRate + (srecValue * annualProductionKwh) / 1000;

    // Subtract loan payment if financed
    const netAnnualSaving =
      financed && year <= loanTermYears ? annualSaving - monthlyPayment * 12 : annualSaving;

    cumulativeSavings += annualSaving;
    yearSavings.push(cumulativeSavings);

    // Check payback
    if (!paybackReached && cumulativeSavings >= netCost) {
      // Linear interpolation for more accurate payback
      const prevSavings = yearSavings[year - 2] || 0;
      paybackYears = year - 1 + (netCost - prevSavings) / (cumulativeSavings - prevSavings);
      paybackReached = true;
    }
  }

  if (!paybackReached) {
    paybackYears = 25; // Cap at 25 if not reached
  }

  const firstYearSavings = Math.round(annualProductionKwh * electricityRate);
  const year5Savings = Math.round(yearSavings[4] || 0);
  const year10Savings = Math.round(yearSavings[9] || 0);
  const year25Savings = Math.round(yearSavings[24] || 0);
  const lifetimeSavings = year25Savings;

  // ROI calculation
  const roi25Year = Math.round(((lifetimeSavings - netCost) / netCost) * 100);

  // Environmental impact
  const co2OffsetLbs = annualProductionKwh * CO2_PER_KWH;
  const co2OffsetTons = Math.round((co2OffsetLbs / 2000) * 10) / 10;
  // Average tree absorbs 48 lbs CO2 per year
  const treesEquivalent = Math.round(co2OffsetLbs / 48);

  // Tips
  const tips: string[] = [];

  if (coveragePercent < 80) {
    tips.push('Consider a larger system to offset more of your electricity usage');
  }

  if (paybackYears > 10) {
    tips.push('Look for additional local incentives or rebates to reduce payback time');
  }

  if (federalTaxCredit > 0) {
    tips.push(
      `The ${federalTaxCredit}% federal tax credit is a significant savings - file correctly to claim it`
    );
  }

  if (peakSunHours < 4) {
    tips.push('Your area has lower sun hours - ensure panels are optimally angled');
  }

  tips.push('Get multiple quotes from installers - prices can vary significantly');
  tips.push('Consider adding battery storage for energy independence and backup power');

  return {
    currency,
    annualProductionKwh,
    monthlyProductionKwh,
    coveragePercent,
    grossCost: Math.round(grossCost),
    federalCredit,
    stateCredit,
    totalIncentives,
    netCost: Math.round(netCost),
    monthlyPayment: Math.round(monthlyPayment),
    totalFinancingCost: Math.round(totalFinancingCost),
    firstYearSavings,
    year5Savings,
    year10Savings,
    year25Savings,
    lifetimeSavings,
    paybackYears: Math.round(paybackYears * 10) / 10,
    roi25Year,
    co2OffsetTons,
    treesEquivalent,
    tips,
  };
}
