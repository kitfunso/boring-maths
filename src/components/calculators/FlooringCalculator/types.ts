import type { Currency } from '../../../lib/regions';

export type FlooringType = 'hardwood' | 'laminate' | 'vinyl' | 'tile' | 'carpet';

export type InstallPattern = 'straight' | 'diagonal' | 'herringbone' | 'chevron';

export interface FlooringCalculatorInputs {
  currency: Currency;

  roomLength: number;

  roomWidth: number;

  flooringType: FlooringType;

  pattern: InstallPattern;

  sqftPerBox: number;

  pricePerSqft: number;

  closetCount: number;

  closetSize: number;

  stairSteps: number;

  includeUnderlayment: boolean;

  includeTransitions: boolean;

  transitionCount: number;
}

export interface FlooringCalculatorResult {
  currency: Currency;

  baseArea: number;

  closetArea: number;

  stairArea: number;

  totalArea: number;

  wastePercentage: number;

  areaWithWaste: number;

  boxesNeeded: number;

  actualCoverage: number;

  flooringCost: number;

  underlaymentCost: number;

  transitionCost: number;

  totalCost: number;

  shoppingList: {
    item: string;
    quantity: number;
    unit: string;
    estimatedPrice: number;
  }[];
}

export interface FlooringTypeConfig {
  name: string;
  defaultPricePerSqft: Record<Currency, number>;
  defaultSqftPerBox: number;
  description: string;
}

export function getDefaultInputs(currency: Currency = 'USD'): FlooringCalculatorInputs {
  return {
    currency,
    roomLength: 15,
    roomWidth: 12,
    flooringType: 'laminate',
    pattern: 'straight',
    sqftPerBox: 22,
    pricePerSqft: currency === 'USD' ? 3 : currency === 'GBP' ? 2.5 : 2.75,
    closetCount: 1,
    closetSize: 12,
    stairSteps: 0,
    includeUnderlayment: true,
    includeTransitions: true,
    transitionCount: 2,
  };
}

export const DEFAULT_INPUTS: FlooringCalculatorInputs = getDefaultInputs('USD');
