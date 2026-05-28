/**
 * US Auto Loan Calculator - pure logic.
 *
 * Works out the monthly payment, total of payments, total interest and total
 * cost (including sales tax) for a US car loan. It starts from the vehicle
 * price, adds sales tax on the full price, then subtracts the down payment and
 * any trade in value to get the amount financed. The monthly payment uses the
 * standard amortising loan formula.
 *
 * There is no single national sales tax rate in the US: rates are set by state,
 * county and city and combine, so the sales tax rate is a user input rather
 * than a statutory constant baked into this file. The only fixed constant here
 * is the number of months in a year.
 */

// Months in a year, used to convert the annual APR and term to a monthly basis.
export const MONTHS_PER_YEAR = 12;

export interface USAutoLoanInputs {
  // Sticker / negotiated price of the vehicle before tax.
  vehiclePrice: number;
  // Cash put down up front.
  downPayment: number;
  // Value of a vehicle traded in, applied against the amount financed.
  tradeInValue: number;
  // Combined state plus local sales tax rate as a percentage, e.g. 7.25.
  salesTaxRate: number;
  // Annual percentage rate as a percentage, e.g. 6.5 means 6.5 percent.
  apr: number;
  // Loan term in months, e.g. 60 for a five year loan.
  termMonths: number;
}

export interface USAutoLoanResult {
  // Amount financed: price plus tax, minus down payment and trade in.
  principal: number;
  // Sales tax charged on the full vehicle price.
  salesTaxAmount: number;
  // Level monthly payment of principal and interest.
  monthlyPayment: number;
  // Sum of every monthly payment over the full term.
  totalOfPayments: number;
  // Interest paid over the life of the loan (total of payments minus principal).
  totalInterest: number;
  // Total out of pocket cost: down payment, trade in offset, and every payment.
  // In other words vehicle price plus sales tax plus total interest.
  totalCost: number;
}

/**
 * Default inputs for the component: a typical new car loan.
 * Roughly a $35,000 vehicle, $5,000 down, a $3,000 trade in, a 7.25% combined
 * sales tax rate, a 6.5% APR over 60 months.
 */
export function getDefaultInputs(): USAutoLoanInputs {
  return {
    vehiclePrice: 35000,
    downPayment: 5000,
    tradeInValue: 3000,
    salesTaxRate: 7.25,
    apr: 6.5,
    termMonths: 60,
  };
}

/**
 * Main pure calculation.
 *
 * Negative inputs are floored at zero so the result stays sensible if a field
 * is cleared. Sales tax is charged on the full vehicle price (some states tax
 * the price after a trade in instead; a user can model that by lowering the
 * entered price). The principal cannot go below zero.
 *
 * Monthly payment, where r is the monthly rate and n the number of months:
 *   r === 0  ->  principal / n
 *   r  >  0  ->  principal * r / (1 - (1 + r)^-n)
 */
export function calculateAutoLoan(inputs: USAutoLoanInputs): USAutoLoanResult {
  const vehiclePrice = Math.max(0, inputs.vehiclePrice);
  const downPayment = Math.max(0, inputs.downPayment);
  const tradeInValue = Math.max(0, inputs.tradeInValue);
  const salesTaxRate = Math.max(0, inputs.salesTaxRate);
  const apr = Math.max(0, inputs.apr);
  const termMonths = Math.max(0, Math.round(inputs.termMonths));

  const salesTaxAmount = (vehiclePrice * salesTaxRate) / 100;

  const principal = Math.max(0, vehiclePrice + salesTaxAmount - downPayment - tradeInValue);

  const monthlyRate = apr / 100 / MONTHS_PER_YEAR;

  let monthlyPayment = 0;
  if (termMonths > 0 && principal > 0) {
    if (monthlyRate === 0) {
      monthlyPayment = principal / termMonths;
    } else {
      monthlyPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
    }
  }

  const totalOfPayments = monthlyPayment * termMonths;
  const totalInterest = Math.max(0, totalOfPayments - principal);
  // Total cost the buyer pays for the car: price plus sales tax plus interest.
  const totalCost = vehiclePrice + salesTaxAmount + totalInterest;

  return {
    principal,
    salesTaxAmount,
    monthlyPayment,
    totalOfPayments,
    totalInterest,
    totalCost,
  };
}
