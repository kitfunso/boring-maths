import type { MortgageInputs, MortgageResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function calculateMortgage(inputs: MortgageInputs): MortgageResult {
  const {
    currency,
    homePrice,
    downPayment,
    interestRate,
    loanTermYears,
    propertyTax,
    homeInsurance,
    hoaFees,
  } = inputs;

  const loanAmount = homePrice - downPayment;

  const monthlyRate = interestRate / 12;
  const numPayments = loanTermYears * 12;

  let monthlyPI: number;
  if (monthlyRate === 0) {
    monthlyPI = loanAmount / numPayments;
  } else {
    monthlyPI =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = homeInsurance / 12;
  const monthlyHOA = hoaFees;

  const monthlyTotal = monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA;

  const totalPayments = monthlyPI * numPayments;
  const totalInterest = totalPayments - loanAmount;

  const downPaymentPercent = (downPayment / homePrice) * 100;
  const ltvRatio = (loanAmount / homePrice) * 100;

  return {
    currency,
    loanAmount: round(loanAmount),
    monthlyPI: round(monthlyPI),
    monthlyTax: round(monthlyTax),
    monthlyInsurance: round(monthlyInsurance),
    monthlyHOA: round(monthlyHOA),
    monthlyTotal: round(monthlyTotal),
    totalPayments: round(totalPayments),
    totalInterest: round(totalInterest),
    downPaymentPercent: round(downPaymentPercent, 1),
    ltvRatio: round(ltvRatio, 1),
  };
}

export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
