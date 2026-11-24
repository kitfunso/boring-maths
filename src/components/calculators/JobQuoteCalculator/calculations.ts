import type { JobQuoteInputs, JobQuoteResult } from './types';
import { formatCurrency as regionFormatCurrency, type Currency } from '../../../lib/regions';

export function calculateJobQuote(inputs: JobQuoteInputs): JobQuoteResult {
  const { currency, materials, labourHours, hourlyRate, markupPercent, vatRate, travelFee } =
    inputs;

  const materialsSubtotal = materials.reduce((sum, item) => sum + Math.max(0, item.cost), 0);

  const labourSubtotal = Math.max(0, labourHours) * Math.max(0, hourlyRate);

  const baseCost = materialsSubtotal + labourSubtotal + Math.max(0, travelFee);

  const markupDecimal = Math.max(0, markupPercent) / 100;
  const markupAmount = baseCost * markupDecimal;

  const subtotalBeforeVAT = baseCost + markupAmount;

  const vatDecimal = Math.max(0, vatRate) / 100;
  const vatAmount = subtotalBeforeVAT * vatDecimal;

  const totalQuote = subtotalBeforeVAT + vatAmount;

  const profitMarginPercent = subtotalBeforeVAT > 0 ? (markupAmount / subtotalBeforeVAT) * 100 : 0;

  return {
    currency,
    materialsSubtotal: Math.round(materialsSubtotal * 100) / 100,
    labourSubtotal: Math.round(labourSubtotal * 100) / 100,
    markupAmount: Math.round(markupAmount * 100) / 100,
    subtotalBeforeVAT: Math.round(subtotalBeforeVAT * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    totalQuote: Math.round(totalQuote * 100) / 100,
    profitMarginPercent: Math.round(profitMarginPercent * 10) / 10,
  };
}

export function formatCurrency(value: number, currency: Currency = 'USD', decimals = 2): string {
  return regionFormatCurrency(value, currency, decimals);
}
