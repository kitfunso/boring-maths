import type { Currency } from '../../../lib/regions';
import type { CarBuyLeaseInputs, CarBuyLeaseResult, YearComparison } from './types';

export function calculateCarBuyLease(inputs: CarBuyLeaseInputs): CarBuyLeaseResult {
  const {
    currency,
    vehiclePrice,
    downPayment,
    loanInterestRate,
    loanTermMonths,
    annualDepreciation,
    leaseMonthlyPayment,
    leaseTermMonths,
    leaseDownPayment,
    mileageAllowance,
    excessMileageCost,
    expectedAnnualMiles,
    yearsToOwn,
    insuranceDifference,
    maintenanceSavings,
  } = inputs;

  const loanAmount = vehiclePrice - downPayment;
  const monthlyRate = loanInterestRate / 12;
  let buyMonthlyPayment = 0;

  if (monthlyRate > 0 && loanTermMonths > 0) {
    buyMonthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) /
      (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
  } else if (loanTermMonths > 0) {
    buyMonthlyPayment = loanAmount / loanTermMonths;
  }

  const yearByYear: YearComparison[] = [];

  let buyCumulative = downPayment;
  let leaseCumulative = leaseDownPayment;
  let currentCarValue = vehiclePrice;
  let loanBalance = loanAmount;
  let leaseMonthsUsed = 0;
  let totalExcessMiles = 0;

  for (let year = 1; year <= yearsToOwn; year++) {
    currentCarValue *= 1 - annualDepreciation;

    let buyYearCost = 0;
    for (let month = 0; month < 12; month++) {
      const monthIndex = (year - 1) * 12 + month;
      if (monthIndex < loanTermMonths) {
        buyYearCost += buyMonthlyPayment;
        const interestPayment = loanBalance * monthlyRate;
        const principalPayment = buyMonthlyPayment - interestPayment;
        loanBalance -= principalPayment;
      }
    }
    buyCumulative += buyYearCost;

    let leaseYearCost = 0;
    for (let month = 0; month < 12; month++) {
      leaseYearCost += leaseMonthlyPayment;
      leaseYearCost += insuranceDifference;
      leaseYearCost -= maintenanceSavings;
      leaseMonthsUsed++;

      if (leaseMonthsUsed >= leaseTermMonths) {
        const leaseMiles = (leaseTermMonths / 12) * expectedAnnualMiles;
        const allowedMiles = (leaseTermMonths / 12) * mileageAllowance;
        if (leaseMiles > allowedMiles) {
          const excessMiles = leaseMiles - allowedMiles;
          totalExcessMiles += excessMiles;
          leaseYearCost += excessMiles * excessMileageCost;
        }
        leaseYearCost += leaseDownPayment;
        leaseMonthsUsed = 0;
      }
    }
    leaseCumulative += leaseYearCost;

    const buyEquity = Math.max(0, currentCarValue - Math.max(0, loanBalance));
    const leaseEquity = 0;

    yearByYear.push({
      year,
      buyCost: Math.round(buyYearCost),
      buyCumulative: Math.round(buyCumulative),
      buyEquity: Math.round(buyEquity),
      leaseCost: Math.round(leaseYearCost),
      leaseCumulative: Math.round(leaseCumulative),
      leaseEquity,
      difference: Math.round(leaseCumulative - buyCumulative + buyEquity),
    });
  }

  const buyResidualValue = Math.round(currentCarValue);
  const buyTotalCost = Math.round(buyCumulative);
  const buyNetCost = buyTotalCost - buyResidualValue;

  const leaseTotalCost = Math.round(leaseCumulative);
  const leaseExcessMileageFees = Math.round(totalExcessMiles * excessMileageCost);

  const totalSavings = leaseTotalCost - buyNetCost;
  const winner: 'buy' | 'lease' | 'tie' =
    Math.abs(totalSavings) < 1000 ? 'tie' : totalSavings > 0 ? 'buy' : 'lease';

  let breakEvenYear: number | null = null;
  for (const yc of yearByYear) {
    if (yc.difference >= 0 && breakEvenYear === null) {
      breakEvenYear = yc.year;
    }
  }

  const totalMiles = expectedAnnualMiles * yearsToOwn;
  const costPerMileBuy = totalMiles > 0 ? buyNetCost / totalMiles : 0;
  const costPerMileLease = totalMiles > 0 ? leaseTotalCost / totalMiles : 0;

  const factors: string[] = [];

  if (winner === 'buy') {
    factors.push(
      `Buying saves ${formatSimpleCurrency(totalSavings, currency)} over ${yearsToOwn} years`
    );
  } else if (winner === 'lease') {
    factors.push(
      `Leasing saves ${formatSimpleCurrency(-totalSavings, currency)} over ${yearsToOwn} years`
    );
  } else {
    factors.push('Both options have similar total costs');
  }

  if (expectedAnnualMiles > mileageAllowance) {
    factors.push(`High mileage (${expectedAnnualMiles.toLocaleString()}/yr) adds lease penalties`);
  }

  if (yearsToOwn > 5) {
    factors.push('Longer ownership periods typically favor buying');
  } else if (yearsToOwn <= 3) {
    factors.push('Short ownership periods can favor leasing');
  }

  if (buyResidualValue > vehiclePrice * 0.4) {
    factors.push('Good resale value makes buying more attractive');
  }

  return {
    currency,
    buyMonthlyPayment: Math.round(buyMonthlyPayment),
    buyTotalCost,
    buyResidualValue,
    buyNetCost: Math.round(buyNetCost),
    leaseMonthlyPayment: Math.round(leaseMonthlyPayment + insuranceDifference - maintenanceSavings),
    leaseTotalCost,
    leaseExcessMileageFees,
    yearByYear,
    breakEvenYear,
    totalSavings: Math.round(totalSavings),
    winner,
    costPerMileBuy: Math.round(costPerMileBuy * 100) / 100,
    costPerMileLease: Math.round(costPerMileLease * 100) / 100,
    factors,
  };
}

function formatSimpleCurrency(value: number, currency: Currency): string {
  const symbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
  return `${symbol}${Math.abs(Math.round(value)).toLocaleString()}`;
}
