/** US Sales Tax: 'add' mode treats amount as pre-tax (tax = amount*rate, total = amount+tax); 'remove' mode treats amount as tax-inclusive (net = amount/(1+rate)). No single national rate; user enters their full combined state+county+city rate. No financial advice; estimates only. */

export type SalesTaxMode = 'add' | 'remove';

// Percent-to-fraction divisor. A salesTaxRate of 7.25 means 7.25 percent of the base.
export const PERCENT_DIVISOR = 100;

export interface USSalesTaxInputs {
  /** The money amount entered. In 'add' mode this is the pre-tax price; in 'remove' mode the tax-inclusive total. */
  readonly amount: number;
  /** Combined sales tax rate as a percent, e.g. 8.25 for 8.25 percent. */
  readonly salesTaxRate: number;
  /** Whether to add tax to a pre-tax amount, or back tax out of a tax-inclusive total. */
  readonly mode: SalesTaxMode;
}

export interface USSalesTaxResult {
  readonly mode: SalesTaxMode;
  /** The pre-tax amount: equals the input in 'add' mode, the backed-out net in 'remove' mode. */
  readonly netAmount: number;
  /** The sales tax portion in dollars. */
  readonly taxAmount: number;
  /** The tax-inclusive total: net + tax. */
  readonly totalAmount: number;
  /** The effective tax rate as a percent of the net amount (tax / net * 100). */
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

/** add: net=amount, tax=amount*rate, total=net+tax. remove: net=amount/(1+rate), tax=amount-net, total=amount. effectiveRate=net>0 ? tax/net*100 : 0. rate=salesTaxRate/100. */
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
