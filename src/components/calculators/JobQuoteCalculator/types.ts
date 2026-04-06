/**
 * Job Quote Calculator - Type Definitions
 *
 * Generate professional quotes for tradespeople including
 * materials, labour, markup, VAT, and travel/callout fees.
 */

import type { Currency } from '../../../lib/regions';

export type TradeType = 'plumber' | 'electrician' | 'builder' | 'painter' | 'general';

export interface MaterialLineItem {
  readonly id: string;
  readonly name: string;
  readonly cost: number;
}

export interface JobQuoteInputs {
  readonly currency: Currency;
  readonly tradeType: TradeType;
  readonly materials: MaterialLineItem[];
  readonly labourHours: number;
  readonly hourlyRate: number;
  readonly markupPercent: number;
  readonly vatRate: number;
  readonly travelFee: number;
}

export interface JobQuoteResult {
  readonly currency: Currency;
  readonly materialsSubtotal: number;
  readonly labourSubtotal: number;
  readonly markupAmount: number;
  readonly subtotalBeforeVAT: number;
  readonly vatAmount: number;
  readonly totalQuote: number;
  readonly profitMarginPercent: number;
}

/** Suggested hourly rates by trade (GBP baseline) */
export const TRADE_RATE_PRESETS: Readonly<Record<TradeType, number>> = {
  plumber: 50,
  electrician: 55,
  builder: 45,
  painter: 35,
  general: 40,
};

export const TRADE_OPTIONS: readonly { value: TradeType; label: string }[] = [
  { value: 'plumber', label: 'Plumber' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'builder', label: 'Builder' },
  { value: 'painter', label: 'Painter/Decorator' },
  { value: 'general', label: 'General Trades' },
];

let nextId = 1;
export function generateMaterialId(): string {
  return `mat-${Date.now()}-${nextId++}`;
}

export function getDefaultInputs(currency: Currency = 'USD'): JobQuoteInputs {
  const isUK = currency === 'GBP';
  const multiplier = currency === 'GBP' ? 0.8 : currency === 'EUR' ? 0.9 : 1;

  return {
    currency,
    tradeType: 'general',
    materials: [
      { id: 'default-1', name: 'Copper pipe', cost: Math.round(30 * multiplier) },
      { id: 'default-2', name: 'Fittings', cost: Math.round(15 * multiplier) },
      { id: 'default-3', name: 'Sealant', cost: Math.round(8 * multiplier) },
    ],
    labourHours: 4,
    hourlyRate: Math.round(TRADE_RATE_PRESETS.general * multiplier),
    markupPercent: 20,
    vatRate: isUK ? 20 : 0,
    travelFee: Math.round(25 * multiplier),
  };
}

export const DEFAULT_INPUTS: JobQuoteInputs = getDefaultInputs('USD');
