export const MONTHS_PER_YEAR = 12;

export const PMI_DOWN_PAYMENT_THRESHOLD = 0.2;

export const DEFAULT_PROPERTY_TAX_RATE = 1.1;

export const DEFAULT_ANNUAL_INSURANCE = 1500;

export const DEFAULT_MONTHLY_HOA = 0;

export const DEFAULT_PMI_RATE = 0.5;

export interface USMortgageInputs {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  termYears: number;
  propertyTaxRate: number;
  annualInsurance: number;
  monthlyHOA: number;
  pmiRate: number;
}

export interface USMortgageResult {
  loanAmount: number;
  principalAndInterest: number;
  propertyTaxMonthly: number;
  insuranceMonthly: number;
  hoaMonthly: number;
  pmiMonthly: number;
  totalMonthly: number;
  ltv: number;
  pmiRequired: boolean;
}

export function getDefaultInputs(): USMortgageInputs {
  return {
    homePrice: 400000,
    downPayment: 80000,
    interestRate: 6.5,
    termYears: 30,
    propertyTaxRate: DEFAULT_PROPERTY_TAX_RATE,
    annualInsurance: DEFAULT_ANNUAL_INSURANCE,
    monthlyHOA: DEFAULT_MONTHLY_HOA,
    pmiRate: DEFAULT_PMI_RATE,
  };
}

export function calculatePrincipalAndInterest(
  loan: number,
  annualRatePercent: number,
  termYears: number
): number {
  const months = Math.round(termYears * MONTHS_PER_YEAR);
  if (months <= 0 || loan <= 0) return 0;

  const monthlyRate = annualRatePercent / 100 / MONTHS_PER_YEAR;
  if (monthlyRate === 0) {
    return loan / months;
  }

  return (loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

export function calculateUSMortgage(inputs: USMortgageInputs): USMortgageResult {
  const homePrice = Number.isFinite(inputs.homePrice) ? Math.max(0, inputs.homePrice) : 0;
  const downPayment = Number.isFinite(inputs.downPayment)
    ? Math.max(0, Math.min(inputs.downPayment, homePrice))
    : 0;
  const interestRate = Number.isFinite(inputs.interestRate) ? Math.max(0, inputs.interestRate) : 0;
  const termYears = Number.isFinite(inputs.termYears) ? Math.max(0, inputs.termYears) : 0;
  const propertyTaxRate = Number.isFinite(inputs.propertyTaxRate)
    ? Math.max(0, inputs.propertyTaxRate)
    : 0;
  const annualInsurance = Number.isFinite(inputs.annualInsurance)
    ? Math.max(0, inputs.annualInsurance)
    : 0;
  const monthlyHOA = Number.isFinite(inputs.monthlyHOA) ? Math.max(0, inputs.monthlyHOA) : 0;
  const pmiRate = Number.isFinite(inputs.pmiRate) ? Math.max(0, inputs.pmiRate) : 0;

  const loanAmount = Math.max(0, homePrice - downPayment);

  const principalAndInterest = calculatePrincipalAndInterest(loanAmount, interestRate, termYears);

  const propertyTaxMonthly = (homePrice * propertyTaxRate) / 100 / MONTHS_PER_YEAR;
  const insuranceMonthly = annualInsurance / MONTHS_PER_YEAR;

  const downPaymentFraction = homePrice > 0 ? downPayment / homePrice : 1;
  const pmiRequired = downPaymentFraction < PMI_DOWN_PAYMENT_THRESHOLD;
  const pmiMonthly = pmiRequired ? (loanAmount * pmiRate) / 100 / MONTHS_PER_YEAR : 0;

  const totalMonthly =
    principalAndInterest + propertyTaxMonthly + insuranceMonthly + monthlyHOA + pmiMonthly;

  const ltv = homePrice > 0 ? (loanAmount / homePrice) * 100 : 0;

  return {
    loanAmount,
    principalAndInterest,
    propertyTaxMonthly,
    insuranceMonthly,
    hoaMonthly: monthlyHOA,
    pmiMonthly,
    totalMonthly,
    ltv,
    pmiRequired,
  };
}
