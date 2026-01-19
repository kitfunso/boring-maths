/**
 * Consulting Rate Calculator - Calculation Logic
 */

import type { ConsultingRateInputs, ConsultingRateResult, RateBreakdown } from './types';

export function calculateConsultingRate(inputs: ConsultingRateInputs): ConsultingRateResult {
  const {
    currency,
    desiredAnnualIncome,
    billableHoursPerWeek,
    weeksPerYear,
    businessExpenses,
    healthInsurance,
    retirementContributions,
    selfEmploymentTaxRate,
    incomeTaxRate,
    profitMargin,
    nonBillablePercent,
  } = inputs;

  const breakdown: RateBreakdown[] = [];

  // Calculate billable hours
  const grossBillableHours = billableHoursPerWeek * weeksPerYear;
  // Adjust for non-billable time (some "billable" hours will be eaten by admin, etc.)
  const effectiveBillableHours = grossBillableHours * (1 - nonBillablePercent / 100);

  // Start with desired take-home income
  breakdown.push({
    category: 'Desired Take-Home Income',
    annual: desiredAnnualIncome,
    hourly: desiredAnnualIncome / effectiveBillableHours,
    description: 'What you want in your pocket after everything',
  });

  // Add income taxes (gross up from net)
  // If net = gross * (1 - taxRate), then gross = net / (1 - taxRate)
  const grossIncomeBeforeTax = desiredAnnualIncome / (1 - incomeTaxRate / 100);
  const incomeTaxAmount = grossIncomeBeforeTax - desiredAnnualIncome;
  breakdown.push({
    category: 'Income Tax Reserve',
    annual: incomeTaxAmount,
    hourly: incomeTaxAmount / effectiveBillableHours,
    description: `${incomeTaxRate}% effective income tax rate`,
  });

  // Add self-employment tax (calculated on gross income)
  const selfEmploymentTax = grossIncomeBeforeTax * (selfEmploymentTaxRate / 100);
  breakdown.push({
    category: 'Self-Employment Tax',
    annual: selfEmploymentTax,
    hourly: selfEmploymentTax / effectiveBillableHours,
    description: `${selfEmploymentTaxRate}% (Social Security, Medicare, etc.)`,
  });

  // Add health insurance
  if (healthInsurance > 0) {
    breakdown.push({
      category: 'Health Insurance',
      annual: healthInsurance,
      hourly: healthInsurance / effectiveBillableHours,
      description: 'Self-funded health coverage',
    });
  }

  // Add retirement
  if (retirementContributions > 0) {
    breakdown.push({
      category: 'Retirement Savings',
      annual: retirementContributions,
      hourly: retirementContributions / effectiveBillableHours,
      description: 'SEP-IRA, Solo 401k, etc.',
    });
  }

  // Add business expenses
  breakdown.push({
    category: 'Business Expenses',
    annual: businessExpenses,
    hourly: businessExpenses / effectiveBillableHours,
    description: 'Software, insurance, marketing, etc.',
  });

  // Calculate subtotal (minimum to survive)
  const subtotalBeforeProfit = breakdown.reduce((sum, item) => sum + item.annual, 0);
  const minimumHourlyRate = subtotalBeforeProfit / effectiveBillableHours;

  // Add profit margin
  const profitAmount = subtotalBeforeProfit * (profitMargin / 100);
  breakdown.push({
    category: 'Profit Margin',
    annual: profitAmount,
    hourly: profitAmount / effectiveBillableHours,
    description: `${profitMargin}% margin for growth, savings, and risk`,
  });

  // Calculate final rates
  const annualRevenueNeeded = subtotalBeforeProfit + profitAmount;
  const hourlyRate = annualRevenueNeeded / effectiveBillableHours;
  const dayRate = hourlyRate * 8;
  const weekRate = dayRate * 5;
  const monthlyRetainer = hourlyRate * billableHoursPerWeek * 4.33;

  // Project rates (with small discount for commitment)
  const projectRates = {
    halfDay: Math.round(dayRate * 0.55), // Slight premium for half days
    fullDay: Math.round(dayRate),
    weekProject: Math.round(weekRate * 0.9), // 10% discount for week commitment
    monthProject: Math.round(monthlyRetainer * 0.85), // 15% discount for month commitment
  };

  // Employee equivalent comparison
  // An employee at $X/hour costs employer ~1.3x that
  // So a consultant at $Y/hour is equivalent to an employee earning $Y/1.3
  const employeeHourlyEquivalent = hourlyRate / 1.3;
  const employeeSalaryEquivalent = employeeHourlyEquivalent * 2080; // 40hrs * 52 weeks
  const multiplierVsEmployee = hourlyRate / employeeHourlyEquivalent;

  // Generate insights
  const insights: string[] = [];

  // The key insight - why consultants charge more
  const employeeAtSameRate = desiredAnnualIncome / 2080;
  const multiplierExplanation = hourlyRate / employeeAtSameRate;
  insights.push(
    `To take home ${formatSimple(desiredAnnualIncome, currency)}, you need to charge ${multiplierExplanation.toFixed(1)}x what an employee earning the same would cost their employer per hour`
  );

  insights.push(
    `Your ${formatSimple(hourlyRate, currency)}/hr rate is equivalent to employing someone at ${formatSimple(employeeSalaryEquivalent, currency)}/year`
  );

  if (effectiveBillableHours < 1000) {
    insights.push(
      `With only ${Math.round(effectiveBillableHours)} billable hours/year, each lost hour costs you ${formatSimple(hourlyRate, currency)}`
    );
  }

  const taxBurden = ((incomeTaxAmount + selfEmploymentTax) / annualRevenueNeeded) * 100;
  insights.push(
    `${Math.round(taxBurden)}% of your revenue goes to taxes - quarterly estimated payments are essential`
  );

  if (profitMargin < 15) {
    insights.push(
      'Consider increasing profit margin to build reserves for slow periods and unexpected expenses'
    );
  }

  return {
    currency,
    hourlyRate: Math.round(hourlyRate),
    dayRate: Math.round(dayRate),
    weekRate: Math.round(weekRate),
    monthlyRetainer: Math.round(monthlyRetainer),
    minimumHourlyRate: Math.round(minimumHourlyRate),
    annualRevenueNeeded: Math.round(annualRevenueNeeded),
    billableHoursPerYear: Math.round(effectiveBillableHours),
    totalAnnualCosts: Math.round(subtotalBeforeProfit),
    breakdown: breakdown.map((b) => ({
      ...b,
      annual: Math.round(b.annual),
      hourly: Math.round(b.hourly * 100) / 100,
    })),
    employeeEquivalent: {
      salaryEquivalent: Math.round(employeeSalaryEquivalent),
      hourlyEquivalent: Math.round(employeeHourlyEquivalent),
      multiplierVsEmployee: Math.round(multiplierVsEmployee * 10) / 10,
    },
    projectRates,
    insights,
  };
}

function formatSimple(value: number, currency: Currency): string {
  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '\u00A3' : '\u20AC';
  return `${symbol}${Math.round(value).toLocaleString()}`;
}
