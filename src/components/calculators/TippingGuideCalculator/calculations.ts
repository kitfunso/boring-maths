import type { TippingGuideInputs, TippingGuideResult } from './types';
import { TIPPING_DATA } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundUpNicely(value: number): number {
  return Math.ceil(value);
}

export function calculateTippingGuide(inputs: TippingGuideInputs): TippingGuideResult {
  const { country, serviceType, billAmount, currency } = inputs;

  const profile = TIPPING_DATA[country];
  const norm = profile.services[serviceType];

  const tipAmount = billAmount * norm.suggestedPercent;
  const totalWithTip = billAmount + tipAmount;
  const roundedTotal = roundUpNicely(totalWithTip);

  return {
    suggestedTipPercent: norm.suggestedPercent,
    tipAmount: round(tipAmount),
    totalWithTip: round(totalWithTip),
    culturalNote: norm.culturalNote,
    isServiceIncluded: norm.serviceIncluded,
    roundedTotal,
    currency,
  };
}

export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 2
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
