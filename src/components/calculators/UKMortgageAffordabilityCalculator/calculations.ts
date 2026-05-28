/**
 * UK Mortgage Affordability Calculator - pure logic.
 *
 * Estimates how much you could borrow based on an income multiple, the
 * resulting maximum property price once a deposit is added, the estimated
 * monthly repayment on a standard repayment mortgage, and the loan to value.
 *
 * All inputs are user supplied. There is no statutory constant: lenders set
 * their own income multiples (commonly around 4.5x annual income).
 */

// Default income multiple used by many UK lenders as a starting point.
export const DEFAULT_INCOME_MULTIPLE = 4.5;
// Default mortgage term in years.
export const DEFAULT_TERM_YEARS = 25;
// Months in a year, used to convert an annual rate and term to monthly.
export const MONTHS_PER_YEAR = 12;

export interface MortgageAffordabilityInputs {
  // Primary applicant gross annual income.
  annualIncome: number;
  // Optional second applicant gross annual income (joint application).
  jointIncome: number;
  // Cash deposit available.
  deposit: number;
  // Income multiple the lender applies (default 4.5).
  incomeMultiple: number;
  // Annual interest rate as a percentage, for example 4.5 means 4.5 percent.
  interestRate: number;
  // Mortgage term in years.
  termYears: number;
}

export interface MortgageAffordabilityResult {
  // Combined income used for the multiple.
  totalIncome: number;
  // Maximum amount borrowable: totalIncome * incomeMultiple.
  maxBorrow: number;
  // Maximum property price: maxBorrow + deposit.
  maxPropertyPrice: number;
  // Estimated monthly repayment on the max borrow at the given rate and term.
  monthlyPayment: number;
  // Loan to value as a percentage of the property price.
  ltv: number;
}

/**
 * Standard repayment mortgage monthly payment.
 *
 * P = L * r / (1 - (1 + r)^-n)
 * where r is the monthly interest rate and n is the number of months.
 * When r is zero the payment is simply the loan divided by the months.
 */
export function calculateMonthlyPayment(
  loan: number,
  annualRatePercent: number,
  termYears: number
): number {
  const months = termYears * MONTHS_PER_YEAR;
  if (months <= 0 || loan <= 0) return 0;

  const monthlyRate = annualRatePercent / 100 / MONTHS_PER_YEAR;
  if (monthlyRate === 0) {
    return loan / months;
  }

  return (loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

/**
 * Main pure calculation. Negative inputs are floored at zero so the result
 * stays sensible if a field is cleared.
 */
export function calculateMortgageAffordability(
  inputs: MortgageAffordabilityInputs
): MortgageAffordabilityResult {
  const annualIncome = Number.isFinite(inputs.annualIncome) ? Math.max(0, inputs.annualIncome) : 0;
  const jointIncome = Number.isFinite(inputs.jointIncome) ? Math.max(0, inputs.jointIncome) : 0;
  const deposit = Number.isFinite(inputs.deposit) ? Math.max(0, inputs.deposit) : 0;
  const incomeMultiple = Number.isFinite(inputs.incomeMultiple)
    ? Math.max(0, inputs.incomeMultiple)
    : 0;
  const interestRate = Number.isFinite(inputs.interestRate) ? Math.max(0, inputs.interestRate) : 0;
  const termYears = Number.isFinite(inputs.termYears) ? Math.max(0, inputs.termYears) : 0;

  const totalIncome = annualIncome + jointIncome;
  const maxBorrow = totalIncome * incomeMultiple;
  const maxPropertyPrice = maxBorrow + deposit;
  const monthlyPayment = calculateMonthlyPayment(maxBorrow, interestRate, termYears);
  const ltv = maxPropertyPrice > 0 ? (maxBorrow / maxPropertyPrice) * 100 : 0;

  return {
    totalIncome,
    maxBorrow,
    maxPropertyPrice,
    monthlyPayment,
    ltv,
  };
}
