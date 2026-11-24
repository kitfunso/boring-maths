export const FRONT_END_RATIO = 0.28;
export const BACK_END_RATIO = 0.36;
export const ITERATIONS = 30;
export const MONTHS_PER_YEAR = 12;

export interface HomeAffordabilityInputs {
  annualIncome: number;
  monthlyDebts: number;
  downPayment: number;
  interestRate: number;
  termYears: number;
  propertyTaxRate: number;
  insuranceRate: number;
}

export interface HomeAffordabilityResult {
  maxHousingPayment: number;
  frontEndLimit: number;
  backEndLimit: number;
  bindingRule: 'front' | 'back';
  maxHomePrice: number;
  maxLoan: number;
  monthlyPrincipalInterest: number;
  monthlyTaxInsurance: number;
  totalMonthlyPayment: number;
}

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
