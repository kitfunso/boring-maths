/**
 * Home Affordability Calculator - pure logic.
 *
 * Answers "how much house can I afford" using the conventional 28/36 lender
 * guideline. The maximum housing payment is the lower of two limits:
 *   front-end: 28 percent of gross monthly income
 *   back-end:  36 percent of gross monthly income minus existing monthly debts
 *
 * Property tax and homeowners insurance are charged as a percentage of the
 * home price, which itself depends on the loan, which depends on how much of
 * the housing budget is left after tax and insurance. That mild circularity is
 * resolved by fixed-point iteration: start from the down payment, recompute
 * tax and insurance, recompute the loan, recompute the price, and repeat until
 * the price stops moving. It converges in a handful of passes.
 *
 * The 28/36 figures are lender conventions, not statutory limits, so there are
 * no statutory constants in this file. They are widely used by US lenders.
 */

// Conventional front-end debt-to-income ratio (housing payment vs gross income).
export const FRONT_END_RATIO = 0.28;
// Conventional back-end debt-to-income ratio (all debt vs gross income).
export const BACK_END_RATIO = 0.36;
// Number of fixed-point iterations used to resolve price vs tax/insurance.
export const ITERATIONS = 30;
// Months in a year, used to convert annual rates and amounts to monthly.
export const MONTHS_PER_YEAR = 12;

export interface HomeAffordabilityInputs {
  // Gross annual household income before tax.
  annualIncome: number;
  // Total existing monthly debt payments (car, student loans, card minimums).
  monthlyDebts: number;
  // Cash available for the down payment.
  downPayment: number;
  // Annual mortgage interest rate as a percentage, for example 6.5 means 6.5 percent.
  interestRate: number;
  // Mortgage term in years.
  termYears: number;
  // Annual property tax as a percentage of home price, for example 1.1.
  propertyTaxRate: number;
  // Annual homeowners insurance as a percentage of home price, for example 0.5.
  insuranceRate: number;
}

export interface HomeAffordabilityResult {
  // Maximum monthly housing budget allowed by the 28/36 rule.
  maxHousingPayment: number;
  // Front-end limit: 28 percent of gross monthly income.
  frontEndLimit: number;
  // Back-end limit: 36 percent of gross monthly income minus existing debts.
  backEndLimit: number;
  // Which rule sets the budget: 'front' or 'back'.
  bindingRule: 'front' | 'back';
  // Maximum affordable home price (loan plus down payment).
  maxHomePrice: number;
  // Maximum affordable mortgage loan amount.
  maxLoan: number;
  // Estimated principal and interest portion of the monthly payment.
  monthlyPrincipalInterest: number;
  // Estimated monthly property tax plus insurance.
  monthlyTaxInsurance: number;
  // Estimated total monthly housing payment (P&I plus tax and insurance).
  totalMonthlyPayment: number;
}

/**
 * Loan amount supported by a given monthly principal-and-interest payment.
 *
 * Inverts the standard amortization formula:
 *   payment = loan * r / (1 - (1 + r)^-n)
 * so:
 *   loan = payment * (1 - (1 + r)^-n) / r
 * When the monthly rate is zero, loan is simply payment times the months.
 */
export function loanFromPayment(
  monthlyPayment: number,
  annualRatePercent: number,
  termYears: number
): number {
  const months = termYears * MONTHS_PER_YEAR;
  if (months <= 0 || monthlyPayment <= 0) return 0;

  const monthlyRate = annualRatePercent / 100 / MONTHS_PER_YEAR;
  if (monthlyRate === 0) {
    return monthlyPayment * months;
  }
  return (monthlyPayment * (1 - Math.pow(1 + monthlyRate, -months))) / monthlyRate;
}

/**
 * Main pure calculation. Negative inputs are floored at zero so the result
 * stays sensible if a field is cleared. When the housing budget is zero or
 * negative (high debts relative to income), every output is zero.
 */
export function calculateHomeAffordability(
  inputs: HomeAffordabilityInputs
): HomeAffordabilityResult {
  const annualIncome = Number.isFinite(inputs.annualIncome) ? Math.max(0, inputs.annualIncome) : 0;
  const monthlyDebts = Number.isFinite(inputs.monthlyDebts) ? Math.max(0, inputs.monthlyDebts) : 0;
  const downPayment = Number.isFinite(inputs.downPayment) ? Math.max(0, inputs.downPayment) : 0;
  const interestRate = Number.isFinite(inputs.interestRate) ? Math.max(0, inputs.interestRate) : 0;
  const termYears = Number.isFinite(inputs.termYears) ? Math.max(0, inputs.termYears) : 0;
  const propertyTaxRate = Number.isFinite(inputs.propertyTaxRate)
    ? Math.max(0, inputs.propertyTaxRate)
    : 0;
  const insuranceRate = Number.isFinite(inputs.insuranceRate)
    ? Math.max(0, inputs.insuranceRate)
    : 0;

  const grossMonthly = annualIncome / MONTHS_PER_YEAR;
  const frontEndLimit = FRONT_END_RATIO * grossMonthly;
  const backEndLimit = BACK_END_RATIO * grossMonthly - monthlyDebts;
  const maxHousingPayment = Math.max(0, Math.min(frontEndLimit, backEndLimit));
  const bindingRule: 'front' | 'back' = frontEndLimit <= backEndLimit ? 'front' : 'back';

  // No housing budget means no affordable home.
  if (maxHousingPayment <= 0) {
    return {
      maxHousingPayment: 0,
      frontEndLimit: round2(frontEndLimit),
      backEndLimit: round2(backEndLimit),
      bindingRule,
      maxHomePrice: 0,
      maxLoan: 0,
      monthlyPrincipalInterest: 0,
      monthlyTaxInsurance: 0,
      totalMonthlyPayment: 0,
    };
  }

  // Fixed-point iteration: price depends on tax/insurance, which depend on price.
  const taxInsAnnualRate = (propertyTaxRate + insuranceRate) / 100;
  let price = downPayment;
  let loan = 0;
  let monthlyPrincipalInterest = 0;

  for (let k = 0; k < ITERATIONS; k++) {
    const monthlyTaxIns = (price * taxInsAnnualRate) / MONTHS_PER_YEAR;
    monthlyPrincipalInterest = Math.max(0, maxHousingPayment - monthlyTaxIns);
    loan = loanFromPayment(monthlyPrincipalInterest, interestRate, termYears);
    price = loan + downPayment;
  }

  const monthlyTaxInsurance = (price * taxInsAnnualRate) / MONTHS_PER_YEAR;

  return {
    maxHousingPayment: round2(maxHousingPayment),
    frontEndLimit: round2(frontEndLimit),
    backEndLimit: round2(backEndLimit),
    bindingRule,
    maxHomePrice: Math.round(price),
    maxLoan: Math.round(loan),
    monthlyPrincipalInterest: round2(monthlyPrincipalInterest),
    monthlyTaxInsurance: round2(monthlyTaxInsurance),
    totalMonthlyPayment: round2(monthlyPrincipalInterest + monthlyTaxInsurance),
  };
}

export function getDefaultInputs(): HomeAffordabilityInputs {
  return {
    annualIncome: 120000,
    monthlyDebts: 500,
    downPayment: 60000,
    interestRate: 6.5,
    termYears: 30,
    propertyTaxRate: 1.1,
    insuranceRate: 0.5,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}
