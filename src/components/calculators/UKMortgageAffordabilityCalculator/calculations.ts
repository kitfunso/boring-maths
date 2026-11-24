export const DEFAULT_INCOME_MULTIPLE = 4.5;
export const DEFAULT_TERM_YEARS = 25;
export const MONTHS_PER_YEAR = 12;

export interface MortgageAffordabilityInputs {
  annualIncome: number;
  jointIncome: number;
  deposit: number;
  incomeMultiple: number;
  interestRate: number;
  termYears: number;
}

export interface MortgageAffordabilityResult {
  totalIncome: number;
  maxBorrow: number;
  maxPropertyPrice: number;
  monthlyPayment: number;
  ltv: number;
}

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
