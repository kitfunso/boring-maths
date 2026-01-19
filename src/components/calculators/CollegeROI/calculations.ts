/**
 * College ROI Calculator - Calculation Logic
 */

import type { CollegeROIInputs, CollegeROIResult, YearlyProjection } from './types';

export function calculateCollegeROI(inputs: CollegeROIInputs): CollegeROIResult {
  const {
    currency,
    annualTuition,
    yearsOfStudy,
    scholarshipAmount,
    livingExpenses,
    expectedStartingSalary,
    salaryGrowthRate,
    alternativeSalary,
    alternativeGrowthRate,
    loanInterestRate,
    loanRepaymentYears,
    careerYears,
  } = inputs;

  // Calculate total education cost
  const tuitionCost = annualTuition * yearsOfStudy;
  const totalLivingExpenses = livingExpenses * yearsOfStudy;
  const totalScholarship = scholarshipAmount * yearsOfStudy;
  const totalCost = tuitionCost + totalLivingExpenses - totalScholarship;

  // Opportunity cost (earnings forgone during education)
  let opportunityCost = 0;
  let altSalary = alternativeSalary;
  for (let y = 0; y < yearsOfStudy; y++) {
    opportunityCost += altSalary;
    altSalary *= 1 + alternativeGrowthRate;
  }

  // Loan calculations
  const totalLoanAmount = Math.max(0, totalCost);
  const monthlyRate = loanInterestRate / 12;
  const numPayments = loanRepaymentYears * 12;

  let monthlyLoanPayment = 0;
  let totalInterestPaid = 0;

  if (totalLoanAmount > 0 && monthlyRate > 0) {
    monthlyLoanPayment =
      (totalLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    totalInterestPaid = monthlyLoanPayment * numPayments - totalLoanAmount;
  } else if (totalLoanAmount > 0) {
    monthlyLoanPayment = totalLoanAmount / numPayments;
  }

  const annualLoanPayment = monthlyLoanPayment * 12;

  // Year-by-year projections
  const yearlyProjections: YearlyProjection[] = [];
  let withEdSalary = expectedStartingSalary;
  let withoutEdSalary = alternativeSalary;

  // Start from year of education
  let altCumulative = 0;
  for (let y = 0; y < yearsOfStudy; y++) {
    altCumulative += withoutEdSalary;
    withoutEdSalary *= 1 + alternativeGrowthRate;
  }

  let edCumulative = -totalCost; // Start negative due to education costs
  let loanYearsRemaining = loanRepaymentYears;
  let paybackPeriod: number | null = null;

  for (let year = 1; year <= careerYears; year++) {
    const loanPayment = loanYearsRemaining > 0 ? annualLoanPayment : 0;
    const netIncome = withEdSalary - loanPayment;

    edCumulative += netIncome;
    altCumulative += withoutEdSalary;

    const advantage = edCumulative - altCumulative;

    yearlyProjections.push({
      year: year + Math.ceil(yearsOfStudy),
      withEducation: {
        earnings: Math.round(withEdSalary),
        loanPayment: Math.round(loanPayment),
        netIncome: Math.round(netIncome),
        cumulativeNet: Math.round(edCumulative),
      },
      withoutEducation: {
        earnings: Math.round(withoutEdSalary),
        cumulativeNet: Math.round(altCumulative),
      },
      advantage: Math.round(advantage),
    });

    // Track payback period
    if (paybackPeriod === null && advantage >= 0) {
      paybackPeriod = year + Math.ceil(yearsOfStudy);
    }

    withEdSalary *= 1 + salaryGrowthRate;
    withoutEdSalary *= 1 + alternativeGrowthRate;
    if (loanYearsRemaining > 0) loanYearsRemaining--;
  }

  // Final calculations
  const finalProjection = yearlyProjections[yearlyProjections.length - 1];
  const lifetimeEarningsPremium = finalProjection
    ? finalProjection.withEducation.cumulativeNet - finalProjection.withoutEducation.cumulativeNet
    : 0;

  // ROI = (gain - cost) / cost * 100
  const totalInvestment = totalCost + totalInterestPaid + opportunityCost;
  const roi = totalInvestment > 0 ? (lifetimeEarningsPremium / totalInvestment) * 100 : 0;

  // Net Present Value (5% discount rate)
  const discountRate = 0.05;
  let npv = -totalCost;
  let edSalaryNPV = expectedStartingSalary;
  let altSalaryNPV = alternativeSalary;
  let loanYearsNPV = loanRepaymentYears;

  for (let y = 1; y <= careerYears; y++) {
    const loanPmt = loanYearsNPV > 0 ? annualLoanPayment : 0;
    const netBenefit = edSalaryNPV - loanPmt - altSalaryNPV;
    npv += netBenefit / Math.pow(1 + discountRate, y);
    edSalaryNPV *= 1 + salaryGrowthRate;
    altSalaryNPV *= 1 + alternativeGrowthRate;
    if (loanYearsNPV > 0) loanYearsNPV--;
  }

  // Debt to income ratio (first year)
  const debtToIncomeRatio =
    expectedStartingSalary > 0 ? totalLoanAmount / expectedStartingSalary : 0;

  // Break even age (assuming starting college at 18)
  const breakEvenAge = paybackPeriod ? 18 + paybackPeriod : null;

  // Determine if it's worth it and generate factors
  const worthIt = roi > 50 && paybackPeriod !== null && paybackPeriod <= 15;

  const factors: string[] = [];
  if (roi > 100) {
    factors.push('Excellent ROI - education pays off significantly');
  } else if (roi > 50) {
    factors.push('Good ROI - education is a solid investment');
  } else if (roi > 0) {
    factors.push('Modest ROI - consider if non-financial benefits justify it');
  } else {
    factors.push("Negative ROI - financial returns don't justify the cost");
  }

  if (paybackPeriod && paybackPeriod <= 10) {
    factors.push("Quick payback period - you'll recover costs within 10 years");
  } else if (paybackPeriod && paybackPeriod <= 15) {
    factors.push('Moderate payback - 10-15 years to recover costs');
  } else if (paybackPeriod) {
    factors.push('Long payback period - consider lower-cost alternatives');
  }

  if (debtToIncomeRatio > 1.5) {
    factors.push('High debt-to-income ratio may cause financial stress');
  }

  if (salaryGrowthRate > alternativeGrowthRate + 0.01) {
    factors.push('Higher career growth potential with this education');
  }

  return {
    currency,
    totalCost: Math.round(totalCost),
    totalLoanAmount: Math.round(totalLoanAmount),
    totalInterestPaid: Math.round(totalInterestPaid),
    monthlyLoanPayment: Math.round(monthlyLoanPayment),
    paybackPeriod,
    lifetimeEarningsPremium: Math.round(lifetimeEarningsPremium),
    roi: Math.round(roi),
    netPresentValue: Math.round(npv),
    yearlyProjections,
    breakEvenAge,
    opportunityCost: Math.round(opportunityCost),
    debtToIncomeRatio: Math.round(debtToIncomeRatio * 100) / 100,
    worthIt,
    factors,
  };
}
