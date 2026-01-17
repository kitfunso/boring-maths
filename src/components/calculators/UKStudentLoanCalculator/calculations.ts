/**
 * UK Student Loan Calculations
 * Repayment projections for Plan 1, 2, 4, 5 and Postgrad
 */

import type { UKStudentLoanInputs, UKStudentLoanResult, YearlyBreakdown } from './types';
import { LOAN_PLANS } from './types';

/**
 * Calculate monthly repayment based on salary and loan plan
 */
function calculateMonthlyRepayment(annualSalary: number, plan: keyof typeof LOAN_PLANS): number {
  const { threshold, rate } = LOAN_PLANS[plan];

  if (annualSalary <= threshold) return 0;

  const annualRepayment = (annualSalary - threshold) * rate;
  return annualRepayment / 12;
}

/**
 * Calculate annual repayment
 */
function calculateAnnualRepayment(annualSalary: number, plan: keyof typeof LOAN_PLANS): number {
  const { threshold, rate } = LOAN_PLANS[plan];

  if (annualSalary <= threshold) return 0;

  return (annualSalary - threshold) * rate;
}

/**
 * Project loan repayment over time
 */
export function calculateStudentLoan(inputs: UKStudentLoanInputs): UKStudentLoanResult {
  const { loanBalance, annualSalary, salaryGrowth, loanPlan } = inputs;
  const plan = LOAN_PLANS[loanPlan];

  const currentYear = new Date().getFullYear();
  const writeOffDate = currentYear + plan.writeOffYears;

  let balance = loanBalance;
  let totalRepaid = 0;
  let totalInterest = 0;
  let currentSalary = annualSalary;
  let yearsToRepay = 0;
  const yearlyBreakdown: YearlyBreakdown[] = [];

  // Project year by year until write-off or paid off
  for (let year = 1; year <= plan.writeOffYears && balance > 0; year++) {
    // Calculate interest for the year (simplified - applied at year end)
    const interestCharged = balance * plan.interestRate;
    balance += interestCharged;
    totalInterest += interestCharged;

    // Calculate repayment for this year
    const annualRepayment = calculateAnnualRepayment(currentSalary, loanPlan);
    const actualRepayment = Math.min(annualRepayment, balance);

    balance -= actualRepayment;
    totalRepaid += actualRepayment;

    yearlyBreakdown.push({
      year: currentYear + year,
      salary: Math.round(currentSalary),
      repayment: Math.round(actualRepayment * 100) / 100,
      interestCharged: Math.round(interestCharged * 100) / 100,
      balanceEnd: Math.max(0, Math.round(balance * 100) / 100),
    });

    if (balance <= 0) {
      yearsToRepay = year;
      break;
    }

    // Increase salary for next year
    currentSalary *= 1 + salaryGrowth / 100;
  }

  const willRepayInFull = balance <= 0;
  const amountWrittenOff = willRepayInFull ? 0 : Math.max(0, balance);

  if (!willRepayInFull) {
    yearsToRepay = plan.writeOffYears;
  }

  // Calculate current monthly repayment
  const monthlyRepayment = calculateMonthlyRepayment(annualSalary, loanPlan);
  const firstYearRepayment = calculateAnnualRepayment(annualSalary, loanPlan);

  return {
    monthlyRepayment: Math.round(monthlyRepayment * 100) / 100,
    annualRepayment: Math.round(firstYearRepayment * 100) / 100,
    yearsToRepay,
    totalRepaid: Math.round(totalRepaid * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    writeOffDate,
    amountWrittenOff: Math.round(amountWrittenOff * 100) / 100,
    willRepayInFull,
    yearlyBreakdown: yearlyBreakdown.slice(0, 10), // First 10 years for display
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
