/**
 * Rental Property ROI Calculator - Calculation Logic
 */

import type { RentalPropertyInputs, RentalPropertyResult } from './types';

export function calculateRentalPropertyROI(inputs: RentalPropertyInputs): RentalPropertyResult {
  const {
    currency,
    purchasePrice,
    downPaymentPercent,
    monthlyRent,
    interestRate,
    mortgageTerm,
    propertyTaxes,
    insurance,
    hoaFees,
    vacancyRate,
    maintenancePercent,
    propertyManagementPercent,
    capExPercent,
    closingCostsPercent,
    appreciationRate,
  } = inputs;

  // Cash investment
  const downPayment = purchasePrice * (downPaymentPercent / 100);
  const closingCosts = purchasePrice * (closingCostsPercent / 100);
  const totalCashInvestment = downPayment + closingCosts;

  // Mortgage calculation
  const loanAmount = purchasePrice - downPayment;
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = mortgageTerm * 12;

  let monthlyMortgagePayment = 0;
  if (loanAmount > 0 && monthlyInterestRate > 0) {
    monthlyMortgagePayment =
      (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  } else if (loanAmount > 0) {
    monthlyMortgagePayment = loanAmount / numberOfPayments;
  }
  const annualMortgagePayment = monthlyMortgagePayment * 12;

  // Income calculations
  const grossMonthlyRent = monthlyRent;
  const vacancyLoss = grossMonthlyRent * (vacancyRate / 100);
  const effectiveGrossIncome = grossMonthlyRent - vacancyLoss;
  const annualGrossIncome = effectiveGrossIncome * 12;

  // Operating expenses (not including mortgage)
  const monthlyTaxes = propertyTaxes / 12;
  const monthlyInsurance = insurance / 12;
  const monthlyMaintenance = grossMonthlyRent * (maintenancePercent / 100);
  const monthlyCapEx = grossMonthlyRent * (capExPercent / 100);
  const monthlyManagement = effectiveGrossIncome * (propertyManagementPercent / 100);

  const expenseBreakdown = [
    { category: 'Property Taxes', monthly: monthlyTaxes, annual: propertyTaxes },
    { category: 'Insurance', monthly: monthlyInsurance, annual: insurance },
    { category: 'Maintenance', monthly: monthlyMaintenance, annual: monthlyMaintenance * 12 },
    { category: 'CapEx Reserve', monthly: monthlyCapEx, annual: monthlyCapEx * 12 },
  ];

  if (hoaFees > 0) {
    expenseBreakdown.push({ category: 'HOA Fees', monthly: hoaFees, annual: hoaFees * 12 });
  }

  if (propertyManagementPercent > 0) {
    expenseBreakdown.push({
      category: 'Property Management',
      monthly: monthlyManagement,
      annual: monthlyManagement * 12,
    });
  }

  const monthlyExpenses =
    monthlyTaxes +
    monthlyInsurance +
    monthlyMaintenance +
    monthlyCapEx +
    monthlyManagement +
    hoaFees;
  const annualExpenses = monthlyExpenses * 12;

  // Net Operating Income (before mortgage)
  const monthlyNOI = effectiveGrossIncome - monthlyExpenses;
  const annualNOI = monthlyNOI * 12;

  // Cash Flow (after mortgage)
  const monthlyCashFlow = monthlyNOI - monthlyMortgagePayment;
  const annualCashFlow = monthlyCashFlow * 12;

  // Key metrics
  const capRate = purchasePrice > 0 ? (annualNOI / purchasePrice) * 100 : 0;
  const cashOnCashReturn =
    totalCashInvestment > 0 ? (annualCashFlow / totalCashInvestment) * 100 : 0;
  const grossRentMultiplier = annualGrossIncome > 0 ? purchasePrice / (grossMonthlyRent * 12) : 0;

  // Break-even occupancy
  const totalMonthlyObligations = monthlyExpenses + monthlyMortgagePayment;
  const breakEvenOccupancy =
    grossMonthlyRent > 0 ? (totalMonthlyObligations / grossMonthlyRent) * 100 : 100;

  // 1% Rule
  const targetRent = purchasePrice * 0.01;
  const onePercentRule = {
    targetRent,
    actualRent: monthlyRent,
    passes: monthlyRent >= targetRent,
  };

  // 5-year projection
  const fiveYearProjection: RentalPropertyResult['fiveYearProjection'] = [];
  let runningLoanBalance = loanAmount;
  let cumulativeCashFlow = 0;

  for (let year = 1; year <= 5; year++) {
    const propertyValue = purchasePrice * Math.pow(1 + appreciationRate / 100, year);

    // Calculate principal paid this year (simplified)
    let principalPaid = 0;
    for (let month = 0; month < 12; month++) {
      const interestPayment = runningLoanBalance * monthlyInterestRate;
      const principalPayment = monthlyMortgagePayment - interestPayment;
      principalPaid += principalPayment;
      runningLoanBalance = Math.max(0, runningLoanBalance - principalPayment);
    }

    const equity = propertyValue - runningLoanBalance;

    // Assume rent grows with appreciation
    const yearRent = monthlyRent * Math.pow(1 + appreciationRate / 100, year - 1);
    const yearVacancyLoss = yearRent * (vacancyRate / 100);
    const yearEffectiveIncome = (yearRent - yearVacancyLoss) * 12;

    // Expenses also grow
    const yearExpenses = annualExpenses * Math.pow(1 + 0.02, year - 1); // 2% expense growth
    const yearNOI = yearEffectiveIncome - yearExpenses;
    const yearCashFlow = yearNOI - annualMortgagePayment;

    cumulativeCashFlow += yearCashFlow;

    const appreciationGain = propertyValue - purchasePrice;
    const totalReturn = cumulativeCashFlow + appreciationGain + principalPaid * year;

    fiveYearProjection.push({
      year,
      propertyValue: Math.round(propertyValue),
      equity: Math.round(equity),
      cashFlow: Math.round(yearCashFlow),
      totalReturn: Math.round(totalReturn),
    });
  }

  // Generate insights
  const insights: string[] = [];

  if (cashOnCashReturn < 0) {
    insights.push('Negative cash flow! You will need to add money each month to cover expenses.');
  } else if (cashOnCashReturn < 5) {
    insights.push(
      'Cash-on-cash return below 5% - typical savings accounts may offer similar returns with less risk'
    );
  } else if (cashOnCashReturn > 10) {
    insights.push(
      'Strong cash-on-cash return above 10% - this is an attractive investment on paper'
    );
  }

  if (capRate < 4) {
    insights.push('Cap rate below 4% is typical for expensive markets but limits cash flow');
  } else if (capRate > 8) {
    insights.push('Cap rate above 8% is strong - verify the numbers and check for hidden issues');
  }

  if (!onePercentRule.passes) {
    insights.push(
      `Property doesn't meet the 1% rule (rent should be ${formatSimple(targetRent, currency)}+/month for this price)`
    );
  } else {
    insights.push('Property meets the 1% rule - good rent-to-price ratio');
  }

  if (breakEvenOccupancy > 90) {
    insights.push(
      `Break-even occupancy is ${Math.round(breakEvenOccupancy)}% - very little margin for vacancies`
    );
  }

  if (propertyManagementPercent === 0) {
    insights.push(
      "No property management included - factor this in if you won't self-manage (typically 8-10% of rent)"
    );
  }

  return {
    currency,
    totalCashInvestment: Math.round(totalCashInvestment),
    downPayment: Math.round(downPayment),
    closingCosts: Math.round(closingCosts),
    loanAmount: Math.round(loanAmount),
    monthlyMortgagePayment: Math.round(monthlyMortgagePayment),
    annualMortgagePayment: Math.round(annualMortgagePayment),
    grossMonthlyRent: Math.round(grossMonthlyRent),
    effectiveGrossIncome: Math.round(effectiveGrossIncome),
    annualGrossIncome: Math.round(annualGrossIncome),
    monthlyExpenses: Math.round(monthlyExpenses),
    annualExpenses: Math.round(annualExpenses),
    expenseBreakdown: expenseBreakdown.map((e) => ({
      category: e.category,
      monthly: Math.round(e.monthly),
      annual: Math.round(e.annual),
    })),
    monthlyNOI: Math.round(monthlyNOI),
    annualNOI: Math.round(annualNOI),
    monthlyCashFlow: Math.round(monthlyCashFlow),
    annualCashFlow: Math.round(annualCashFlow),
    capRate: Math.round(capRate * 100) / 100,
    cashOnCashReturn: Math.round(cashOnCashReturn * 100) / 100,
    grossRentMultiplier: Math.round(grossRentMultiplier * 100) / 100,
    breakEvenOccupancy: Math.round(breakEvenOccupancy * 10) / 10,
    onePercentRule,
    fiveYearProjection,
    insights,
  };
}

function formatSimple(value: number, currency: Currency): string {
  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '\u00A3' : '\u20AC';
  return `${symbol}${Math.round(value).toLocaleString()}`;
}
