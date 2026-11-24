import type { UKDividendTaxInputs, UKDividendTaxResult, TaxBreakdown } from './types';
import { DIVIDEND_RATES, TAX_THRESHOLDS } from './types';

function calculatePersonalAllowance(totalIncome: number): number {
  const taperThreshold = 100000;

  if (totalIncome <= taperThreshold) {
    return TAX_THRESHOLDS.personalAllowance;
  }

  const reduction = Math.floor((totalIncome - taperThreshold) / 2);
  return Math.max(0, TAX_THRESHOLDS.personalAllowance - reduction);
}

function calculateIncomeTax(salary: number, totalIncome: number): number {
  const personalAllowance = calculatePersonalAllowance(totalIncome);
  const taxableIncome = Math.max(0, salary - personalAllowance);

  let tax = 0;

  const basicRateBand = Math.min(
    taxableIncome,
    TAX_THRESHOLDS.basicRateLimit - TAX_THRESHOLDS.personalAllowance
  );
  if (basicRateBand > 0) {
    tax += basicRateBand * 0.2;
  }

  const higherRateBand = Math.min(
    Math.max(0, taxableIncome - (TAX_THRESHOLDS.basicRateLimit - TAX_THRESHOLDS.personalAllowance)),
    TAX_THRESHOLDS.higherRateLimit - TAX_THRESHOLDS.basicRateLimit
  );
  if (higherRateBand > 0) {
    tax += higherRateBand * 0.4;
  }

  const additionalRateBand = Math.max(
    0,
    taxableIncome - (TAX_THRESHOLDS.higherRateLimit - TAX_THRESHOLDS.personalAllowance)
  );
  if (additionalRateBand > 0) {
    tax += additionalRateBand * 0.45;
  }

  return tax;
}

function calculateNI(salary: number): number {
  const primaryThreshold = 12570;
  const upperEarningsLimit = 50270;
  const mainRate = 0.08;
  const upperRate = 0.02;

  if (salary <= primaryThreshold) return 0;

  let ni = 0;

  const mainBand = Math.min(salary, upperEarningsLimit) - primaryThreshold;
  if (mainBand > 0) {
    ni += mainBand * mainRate;
  }

  const upperBand = Math.max(0, salary - upperEarningsLimit);
  if (upperBand > 0) {
    ni += upperBand * upperRate;
  }

  return ni;
}

function calculateDividendTax(
  dividendIncome: number,
  salaryIncome: number
): { tax: number; breakdown: TaxBreakdown[] } {
  const { allowance, basicRate, higherRate, additionalRate } = DIVIDEND_RATES;
  const breakdown: TaxBreakdown[] = [];

  const taxableDividends = Math.max(0, dividendIncome - allowance);

  if (taxableDividends === 0) {
    breakdown.push({
      band: 'Tax-free allowance',
      amount: Math.min(dividendIncome, allowance),
      rate: 0,
      tax: 0,
    });
    return { tax: 0, breakdown };
  }

  breakdown.push({
    band: 'Tax-free allowance',
    amount: Math.min(dividendIncome, allowance),
    rate: 0,
    tax: 0,
  });

  const personalAllowance = calculatePersonalAllowance(salaryIncome + dividendIncome);
  const salaryUsedInBands = Math.max(0, salaryIncome - personalAllowance);

  let tax = 0;
  let remainingDividends = taxableDividends;

  const basicRateBandSize = TAX_THRESHOLDS.basicRateLimit - TAX_THRESHOLDS.personalAllowance;
  const higherRateBandSize = TAX_THRESHOLDS.higherRateLimit - TAX_THRESHOLDS.basicRateLimit;

  const basicRateRemaining = Math.max(0, basicRateBandSize - salaryUsedInBands);

  if (remainingDividends > 0 && basicRateRemaining > 0) {
    const basicRateDividends = Math.min(remainingDividends, basicRateRemaining);
    const basicRateTax = basicRateDividends * basicRate;
    tax += basicRateTax;
    remainingDividends -= basicRateDividends;

    breakdown.push({
      band: 'Basic rate (10.75%)',
      amount: basicRateDividends,
      rate: basicRate,
      tax: basicRateTax,
    });
  }

  const higherRateRemaining = Math.max(
    0,
    higherRateBandSize - Math.max(0, salaryUsedInBands - basicRateBandSize)
  );
  if (remainingDividends > 0 && higherRateRemaining > 0) {
    const higherRateDividends = Math.min(remainingDividends, higherRateRemaining);
    const higherRateTax = higherRateDividends * higherRate;
    tax += higherRateTax;
    remainingDividends -= higherRateDividends;

    breakdown.push({
      band: 'Higher rate (35.75%)',
      amount: higherRateDividends,
      rate: higherRate,
      tax: higherRateTax,
    });
  }

  if (remainingDividends > 0) {
    const additionalRateTax = remainingDividends * additionalRate;
    tax += additionalRateTax;

    breakdown.push({
      band: 'Additional rate (39.35%)',
      amount: remainingDividends,
      rate: additionalRate,
      tax: additionalRateTax,
    });
  }

  return { tax, breakdown };
}

function calculateIfSalaryInstead(salaryIncome: number, dividendIncome: number): number {
  const totalAsSalary = salaryIncome + dividendIncome;
  const incomeTax = calculateIncomeTax(totalAsSalary, totalAsSalary);
  const ni = calculateNI(totalAsSalary);
  return incomeTax + ni;
}

export function calculateDividendTaxResult(inputs: UKDividendTaxInputs): UKDividendTaxResult {
  const { salaryIncome, dividendIncome } = inputs;

  const totalIncome = salaryIncome + dividendIncome;

  const incomeTaxOnSalary = calculateIncomeTax(salaryIncome, totalIncome);
  const niOnSalary = calculateNI(salaryIncome);

  const { tax: dividendTax, breakdown } = calculateDividendTax(dividendIncome, salaryIncome);

  const allowanceUsed = Math.min(dividendIncome, DIVIDEND_RATES.allowance);
  const allowanceRemaining = Math.max(0, DIVIDEND_RATES.allowance - dividendIncome);

  const effectiveDividendRate = dividendIncome > 0 ? (dividendTax / dividendIncome) * 100 : 0;

  const totalTax = incomeTaxOnSalary + niOnSalary + dividendTax;

  const taxIfAllSalary = calculateIfSalaryInstead(salaryIncome, dividendIncome);
  const currentTax = incomeTaxOnSalary + niOnSalary + dividendTax;
  const salaryVsDividendSaving = taxIfAllSalary - currentTax;

  return {
    dividendTax: Math.round(dividendTax * 100) / 100,
    effectiveDividendRate: Math.round(effectiveDividendRate * 10) / 10,
    allowanceUsed,
    allowanceRemaining,
    totalIncome,
    totalTax: Math.round(totalTax * 100) / 100,
    incomeTaxOnSalary: Math.round(incomeTaxOnSalary * 100) / 100,
    niOnSalary: Math.round(niOnSalary * 100) / 100,
    dividendBreakdown: breakdown,
    salaryVsDividendSaving: Math.round(salaryVsDividendSaving * 100) / 100,
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
