/**
 * EU VAT Calculator - Calculation Logic
 */

import { EU_COUNTRIES, type VATInputs, type VATResult, type EUCountry } from './types';

export function getCountryByCode(code: string): EUCountry | undefined {
  return EU_COUNTRIES.find(c => c.code === code);
}

export function calculateVAT(inputs: VATInputs): VATResult {
  const { amount, countryCode, vatRate, mode } = inputs;
  const country = getCountryByCode(countryCode) || EU_COUNTRIES[0];

  let netAmount: number;
  let vatAmount: number;
  let grossAmount: number;

  switch (mode) {
    case 'add':
      // Amount is net, add VAT
      netAmount = amount;
      vatAmount = amount * (vatRate / 100);
      grossAmount = netAmount + vatAmount;
      break;

    case 'remove':
      // Amount is gross, remove VAT
      grossAmount = amount;
      netAmount = amount / (1 + vatRate / 100);
      vatAmount = grossAmount - netAmount;
      break;

    case 'reverse':
      // Amount is VAT, calculate net and gross
      vatAmount = amount;
      netAmount = amount / (vatRate / 100);
      grossAmount = netAmount + vatAmount;
      break;

    default:
      netAmount = amount;
      vatAmount = amount * (vatRate / 100);
      grossAmount = netAmount + vatAmount;
  }

  return {
    netAmount,
    vatAmount,
    grossAmount,
    effectiveRate: vatRate,
    country,
  };
}

export function formatCurrency(value: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getAllRatesForCountry(country: EUCountry): number[] {
  const rates: number[] = [country.standardRate];

  if (country.reducedRates) {
    rates.push(...country.reducedRates);
  }
  if (country.superReducedRate) {
    rates.push(country.superReducedRate);
  }
  if (country.parkingRate && !rates.includes(country.parkingRate)) {
    rates.push(country.parkingRate);
  }

  return rates.sort((a, b) => b - a);
}
