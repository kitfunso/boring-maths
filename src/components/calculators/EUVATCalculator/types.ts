/**
 * EU VAT Calculator Types
 */

export interface EUCountry {
  code: string;
  name: string;
  standardRate: number;
  reducedRates: number[];
  superReducedRate?: number;
  parkingRate?: number;
}

export const EU_COUNTRIES: EUCountry[] = [
  { code: 'AT', name: 'Austria', standardRate: 20, reducedRates: [10, 13] },
  { code: 'BE', name: 'Belgium', standardRate: 21, reducedRates: [6, 12], parkingRate: 12 },
  { code: 'BG', name: 'Bulgaria', standardRate: 20, reducedRates: [9] },
  { code: 'HR', name: 'Croatia', standardRate: 25, reducedRates: [5, 13] },
  { code: 'CY', name: 'Cyprus', standardRate: 19, reducedRates: [5, 9] },
  { code: 'CZ', name: 'Czechia', standardRate: 21, reducedRates: [12, 15] },
  { code: 'DK', name: 'Denmark', standardRate: 25, reducedRates: [] },
  { code: 'EE', name: 'Estonia', standardRate: 22, reducedRates: [9] },
  { code: 'FI', name: 'Finland', standardRate: 25.5, reducedRates: [10, 14] },
  { code: 'FR', name: 'France', standardRate: 20, reducedRates: [5.5, 10], superReducedRate: 2.1 },
  { code: 'DE', name: 'Germany', standardRate: 19, reducedRates: [7] },
  { code: 'GR', name: 'Greece', standardRate: 24, reducedRates: [6, 13] },
  { code: 'HU', name: 'Hungary', standardRate: 27, reducedRates: [5, 18] },
  {
    code: 'IE',
    name: 'Ireland',
    standardRate: 23,
    reducedRates: [9, 13.5],
    superReducedRate: 4.8,
    parkingRate: 13.5,
  },
  { code: 'IT', name: 'Italy', standardRate: 22, reducedRates: [5, 10], superReducedRate: 4 },
  { code: 'LV', name: 'Latvia', standardRate: 21, reducedRates: [5, 12] },
  { code: 'LT', name: 'Lithuania', standardRate: 21, reducedRates: [5, 9] },
  {
    code: 'LU',
    name: 'Luxembourg',
    standardRate: 17,
    reducedRates: [8],
    superReducedRate: 3,
    parkingRate: 14,
  },
  { code: 'MT', name: 'Malta', standardRate: 18, reducedRates: [5, 7] },
  { code: 'NL', name: 'Netherlands', standardRate: 21, reducedRates: [9] },
  { code: 'PL', name: 'Poland', standardRate: 23, reducedRates: [5, 8] },
  { code: 'PT', name: 'Portugal', standardRate: 23, reducedRates: [6, 13], parkingRate: 13 },
  { code: 'RO', name: 'Romania', standardRate: 19, reducedRates: [5, 9] },
  { code: 'SK', name: 'Slovakia', standardRate: 23, reducedRates: [10] },
  { code: 'SI', name: 'Slovenia', standardRate: 22, reducedRates: [5, 9.5] },
  { code: 'ES', name: 'Spain', standardRate: 21, reducedRates: [10], superReducedRate: 4 },
  { code: 'SE', name: 'Sweden', standardRate: 25, reducedRates: [6, 12] },
];

export type CalculationMode = 'add' | 'remove' | 'reverse';

export interface VATInputs {
  amount: number;
  countryCode: string;
  vatRate: number;
  mode: CalculationMode;
}

export interface VATResult {
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  effectiveRate: number;
  country: EUCountry;
}

export function getDefaultInputs(): VATInputs {
  return {
    amount: 100,
    countryCode: 'DE',
    vatRate: 19,
    mode: 'add',
  };
}
