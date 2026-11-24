export type SalesTaxMode = 'add' | 'remove';

export const PERCENT_DIVISOR = 100;

export interface USSalesTaxInputs {
  readonly amount: number;
  readonly salesTaxRate: number;
  readonly mode: SalesTaxMode;
}

export interface USSalesTaxResult {
  readonly mode: SalesTaxMode;
  readonly netAmount: number;
  readonly taxAmount: number;
  readonly totalAmount: number;
  readonly effectiveRate: number;
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function sanitize(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value) || value < 0) return 0;
  return value;
}

export function calculateSalesTax(inputs: USSalesTaxInputs): USSalesTaxResult {
  const amount = sanitize(inputs.amount);
  const salesTaxRate = sanitize(inputs.salesTaxRate);
  const mode: SalesTaxMode = inputs.mode === 'remove' ? 'remove' : 'add';

  const rate = salesTaxRate / PERCENT_DIVISOR;

  let netAmount: number;
  let taxAmount: number;
  let totalAmount: number;

  if (mode === 'remove') {
    netAmount = amount / (1 + rate);
    taxAmount = amount - netAmount;
    totalAmount = amount;
  } else {
    netAmount = amount;
    taxAmount = amount * rate;
    totalAmount = amount + taxAmount;
  }

  const effectiveRate = netAmount > 0 ? (taxAmount / netAmount) * 100 : 0;

  return {
    mode,
    netAmount: roundTo(netAmount, 2),
    taxAmount: roundTo(taxAmount, 2),
    totalAmount: roundTo(totalAmount, 2),
    effectiveRate: roundTo(effectiveRate, 2),
  };
}

export function getDefaultInputs(): USSalesTaxInputs {
  return {
    amount: 100,
    salesTaxRate: 7.25,
    mode: 'add',
  };
}
