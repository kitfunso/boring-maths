export const MONTHS_PER_YEAR = 12;

export interface USAutoLoanInputs {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  salesTaxRate: number;
  apr: number;
  termMonths: number;
}

export interface USAutoLoanResult {
  principal: number;
  salesTaxAmount: number;
  monthlyPayment: number;
  totalOfPayments: number;
  totalInterest: number;
  totalCost: number;
}

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

export function calculateAutoLoan(inputs: USAutoLoanInputs): USAutoLoanResult {
  const vehiclePrice = Number.isFinite(inputs.vehiclePrice) ? Math.max(0, inputs.vehiclePrice) : 0;
  const downPayment = Number.isFinite(inputs.downPayment) ? Math.max(0, inputs.downPayment) : 0;
  const tradeInValue = Number.isFinite(inputs.tradeInValue) ? Math.max(0, inputs.tradeInValue) : 0;
  const salesTaxRate = Number.isFinite(inputs.salesTaxRate) ? Math.max(0, inputs.salesTaxRate) : 0;
  const apr = Number.isFinite(inputs.apr) ? Math.max(0, inputs.apr) : 0;
  const termMonths = Number.isFinite(inputs.termMonths)
    ? Math.max(0, Math.round(inputs.termMonths))
    : 0;

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
