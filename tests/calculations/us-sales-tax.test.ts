import { describe, it, expect } from 'vitest';
import {
  calculateSalesTax,
  getDefaultInputs,
} from '../../src/components/calculators/USSalesTaxCalculator/calculations';

describe('calculateSalesTax', () => {
  it('adds sales tax to a pre-tax price', () => {
    // 100 * 0.0825 = 8.25 tax; total = 108.25
    const result = calculateSalesTax({ amount: 100, salesTaxRate: 8.25, mode: 'add' });
    expect(result.netAmount).toBe(100);
    expect(result.taxAmount).toBe(8.25);
    expect(result.totalAmount).toBe(108.25);
    expect(result.effectiveRate).toBe(8.25);
  });

  it('adds sales tax at the California base rate', () => {
    // 200 * 0.0725 = 14.5 tax; total = 214.5
    const result = calculateSalesTax({ amount: 200, salesTaxRate: 7.25, mode: 'add' });
    expect(result.taxAmount).toBe(14.5);
    expect(result.totalAmount).toBe(214.5);
  });

  it('removes sales tax from a tax-inclusive total', () => {
    // net = 108.25 / 1.0825 = 100.00; tax = 8.25
    const result = calculateSalesTax({ amount: 108.25, salesTaxRate: 8.25, mode: 'remove' });
    expect(result.netAmount).toBe(100);
    expect(result.taxAmount).toBe(8.25);
    expect(result.totalAmount).toBe(108.25);
    expect(result.effectiveRate).toBe(8.25);
  });

  it('reverses a round 9.5 percent total exactly', () => {
    // net = 219 / 1.095 = 200.00; tax = 19.00
    const result = calculateSalesTax({ amount: 219, salesTaxRate: 9.5, mode: 'remove' });
    expect(result.netAmount).toBe(200);
    expect(result.taxAmount).toBe(19);
  });

  it('edge case: a zero rate produces no tax', () => {
    const result = calculateSalesTax({ amount: 150, salesTaxRate: 0, mode: 'add' });
    expect(result.taxAmount).toBe(0);
    expect(result.totalAmount).toBe(150);
    expect(result.effectiveRate).toBe(0);
  });

  it('edge case: a zero amount returns zero with no division error', () => {
    const result = calculateSalesTax({ amount: 0, salesTaxRate: 8.25, mode: 'remove' });
    expect(result.netAmount).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.totalAmount).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it('edge case: a NaN amount returns finite zero outputs', () => {
    const result = calculateSalesTax({ amount: NaN, salesTaxRate: 8.25, mode: 'add' });
    expect(result.netAmount).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.totalAmount).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it('provides sensible defaults', () => {
    const defaults = getDefaultInputs();
    expect(defaults.amount).toBe(100);
    expect(defaults.salesTaxRate).toBe(7.25);
    expect(defaults.mode).toBe('add');
  });
});
