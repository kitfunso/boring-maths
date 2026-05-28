/**
 * US Mortgage Calculator - pure logic.
 *
 * Computes a full US monthly housing payment: principal and interest (P&I) on
 * the loan via standard amortisation, plus the recurring escrow style costs a
 * US buyer faces, namely property tax, homeowners insurance, HOA dues, and
 * private mortgage insurance (PMI) when the down payment is under 20 percent.
 *
 * The interest rate, term, prices and rates all come from the user. There is
 * no single statutory constant here. The default property tax rate (1.1
 * percent of home value per year) and default PMI rate (0.5 percent of the
 * loan per year) are typical US conventions, not legal figures, and the user
 * can override them. The 20 percent down payment threshold for PMI is the
 * standard conventional loan convention.
 */

// Months in a year, used to convert annual rates and terms to monthly.
export const MONTHS_PER_YEAR = 12;

// The down payment fraction at or above which PMI is not charged on a
// conventional loan. Below 20 percent down, lenders typically require PMI.
export const PMI_DOWN_PAYMENT_THRESHOLD = 0.2;

// Default annual property tax rate as a percentage of the home value. 1.1
// percent is a common US average; actual rates vary widely by state and
// county, so this is editable.
export const DEFAULT_PROPERTY_TAX_RATE = 1.1;

// Default annual homeowners insurance premium in dollars. Editable.
export const DEFAULT_ANNUAL_INSURANCE = 1500;

// Default monthly HOA dues in dollars. Many homes have none.
export const DEFAULT_MONTHLY_HOA = 0;

// Default annual PMI rate as a percentage of the loan amount. 0.5 percent is
// a typical mid range; real PMI runs roughly 0.3 to 1.5 percent. Editable.
export const DEFAULT_PMI_RATE = 0.5;

export interface USMortgageInputs {
  // Purchase price of the home in dollars.
  homePrice: number;
  // Down payment in dollars.
  downPayment: number;
  // Annual interest rate as a percentage, for example 6 means 6 percent.
  interestRate: number;
  // Loan term in years, typically 30 or 15.
  termYears: number;
  // Annual property tax as a percentage of the home value.
  propertyTaxRate: number;
  // Annual homeowners insurance premium in dollars.
  annualInsurance: number;
  // Monthly HOA dues in dollars.
  monthlyHOA: number;
  // Annual PMI rate as a percentage of the loan amount.
  pmiRate: number;
}

export interface USMortgageResult {
  // Loan amount: home price minus down payment, floored at zero.
  loanAmount: number;
  // Principal and interest portion of the monthly payment.
  principalAndInterest: number;
  // Monthly property tax.
  propertyTaxMonthly: number;
  // Monthly homeowners insurance.
  insuranceMonthly: number;
  // Monthly HOA dues.
  hoaMonthly: number;
  // Monthly PMI, zero when the down payment is 20 percent or more.
  pmiMonthly: number;
  // Total monthly housing payment, the sum of all of the above.
  totalMonthly: number;
  // Loan to value ratio as a percentage, for example 80 means 80 percent.
  ltv: number;
  // Whether PMI is being charged on this loan.
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

/**
 * Standard amortised monthly principal and interest payment.
 *
 * P = L * r / (1 - (1 + r)^-n)
 * where r is the monthly interest rate and n is the number of months.
 * When r is zero the payment is simply the loan divided by the months.
 */
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

/**
 * Main pure calculation. Negative inputs are floored at zero so the result
 * stays sensible if a field is cleared.
 */
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

  // PMI applies only on conventional loans where the down payment is under
  // 20 percent of the home price.
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
