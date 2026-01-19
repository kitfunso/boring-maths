/**
 * Employee Cost Calculator - Calculation Logic
 */

import type { EmployeeCostInputs, EmployeeCostResult, CostBreakdown } from './types';

export function calculateEmployeeCost(inputs: EmployeeCostInputs): EmployeeCostResult {
  const {
    currency,
    annualSalary,
    healthInsurance,
    retirementMatchPercent,
    ptoDays,
    payrollTaxPercent,
    trainingBudget,
    equipmentCost,
    officeCost,
    otherBenefits,
    hoursPerWeek,
    profitMarginPercent,
  } = inputs;

  // Calculate individual cost components
  const retirementMatch = annualSalary * (retirementMatchPercent / 100);
  const payrollTaxes = annualSalary * (payrollTaxPercent / 100);

  // Calculate working hours
  const weeksPerYear = 52;
  const holidays = currency === 'USD' ? 10 : currency === 'GBP' ? 8 : 10;
  const totalPtoDays = ptoDays + holidays;
  const workingDaysPerYear = weeksPerYear * 5 - totalPtoDays;
  const actualWorkingHours = workingDaysPerYear * (hoursPerWeek / 5);
  const totalAnnualHours = weeksPerYear * hoursPerWeek;

  // Cost of PTO (paid for time not worked)
  const dailyRate = annualSalary / (weeksPerYear * 5);
  const ptoCost = dailyRate * totalPtoDays;

  // Total benefits cost
  const totalBenefits = healthInsurance + retirementMatch + otherBenefits;

  // Total overhead
  const totalOverhead = trainingBudget + equipmentCost + officeCost;

  // Total annual cost
  const totalAnnualCost = annualSalary + totalBenefits + payrollTaxes + totalOverhead;

  // Calculate the burden multiplier
  const burdenMultiplier = totalAnnualCost / annualSalary;

  // Calculate hourly costs
  const trueHourlyCost = totalAnnualCost / actualWorkingHours;
  const effectiveHourlyRate = annualSalary / actualWorkingHours;

  // Monthly cost
  const monthlyBurdenCost = totalAnnualCost / 12;

  // Cost per working day
  const costPerWorkingDay = totalAnnualCost / workingDaysPerYear;

  // Billable rate with profit margin
  const billableRate = trueHourlyCost / (1 - profitMarginPercent / 100);

  // Build breakdown
  const breakdown: CostBreakdown[] = [];

  const addBreakdown = (category: string, annual: number) => {
    breakdown.push({
      category,
      annual: Math.round(annual),
      monthly: Math.round(annual / 12),
      hourly: Math.round((annual / actualWorkingHours) * 100) / 100,
      percentOfTotal: Math.round((annual / totalAnnualCost) * 1000) / 10,
    });
  };

  addBreakdown('Base Salary', annualSalary);
  if (healthInsurance > 0) addBreakdown('Health Insurance', healthInsurance);
  if (retirementMatch > 0) addBreakdown('Retirement Match', retirementMatch);
  addBreakdown('Payroll Taxes', payrollTaxes);
  if (otherBenefits > 0) addBreakdown('Other Benefits', otherBenefits);
  if (trainingBudget > 0) addBreakdown('Training & Development', trainingBudget);
  if (equipmentCost > 0) addBreakdown('Equipment & Supplies', equipmentCost);
  if (officeCost > 0) addBreakdown('Office Space', officeCost);

  // Salary vs total breakdown
  const salaryVsTotalCost = {
    salary: Math.round(annualSalary),
    benefits: Math.round(totalBenefits),
    taxes: Math.round(payrollTaxes),
    overhead: Math.round(totalOverhead),
  };

  // Generate insights
  const insights: string[] = [];

  if (burdenMultiplier < 1.2) {
    insights.push(
      `Your burden multiplier (${burdenMultiplier.toFixed(2)}x) is below average - you may be underestimating true costs`
    );
  } else if (burdenMultiplier > 1.5) {
    insights.push(
      `Your burden multiplier (${burdenMultiplier.toFixed(2)}x) is above average - consider if all costs are necessary`
    );
  } else {
    insights.push(
      `Your ${burdenMultiplier.toFixed(2)}x burden multiplier is typical for employers`
    );
  }

  const hourlyFromSalary = annualSalary / (52 * hoursPerWeek);
  insights.push(
    `Nominal hourly rate (${formatSimple(hourlyFromSalary, currency)}/hr) vs true cost (${formatSimple(trueHourlyCost, currency)}/hr) - a ${Math.round((trueHourlyCost / hourlyFromSalary - 1) * 100)}% difference`
  );

  if (currency === 'USD' && healthInsurance < 5000) {
    insights.push('US health insurance costs typically range $5,000-$15,000 annually per employee');
  }

  insights.push(
    `To make ${profitMarginPercent}% profit, you need to bill at least ${formatSimple(billableRate, currency)}/hr`
  );

  return {
    currency,
    totalAnnualCost: Math.round(totalAnnualCost),
    trueHourlyCost: Math.round(trueHourlyCost * 100) / 100,
    monthlyBurdenCost: Math.round(monthlyBurdenCost),
    burdenMultiplier: Math.round(burdenMultiplier * 100) / 100,
    breakdown,
    billableRate: Math.round(billableRate * 100) / 100,
    costPerWorkingDay: Math.round(costPerWorkingDay),
    actualWorkingHours: Math.round(actualWorkingHours),
    effectiveHourlyRate: Math.round(effectiveHourlyRate * 100) / 100,
    salaryVsTotalCost,
    insights,
  };
}

function formatSimple(value: number, currency: Currency): string {
  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '\u00A3' : '\u20AC';
  return `${symbol}${value.toFixed(2)}`;
}
