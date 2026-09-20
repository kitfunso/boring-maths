/** Singapore Seller Stamp Duty. Table A (purchased on/after 4 Jul 2025) vs Table B (11 Mar 2017-3 Jul 2025). */

export type SsdTable = 'A' | 'B' | 'out-of-scope';

const TABLE_A_STARTS = '2025-07-04';
const TABLE_B_STARTS = '2017-03-11';

export interface SsdBand {
  maxMonths: number;
  rate: number;
  label: string;
}

// Holding period, purchased on or after 4 Jul 2025.
export const SSD_TABLE_A: SsdBand[] = [
  { maxMonths: 12, rate: 0.16, label: 'Held up to 1 year' },
  { maxMonths: 24, rate: 0.12, label: 'Held more than 1, up to 2 years' },
  { maxMonths: 36, rate: 0.08, label: 'Held more than 2, up to 3 years' },
  { maxMonths: 48, rate: 0.04, label: 'Held more than 3, up to 4 years' },
  { maxMonths: Infinity, rate: 0, label: 'Held more than 4 years' },
];

// Holding period, purchased 11 Mar 2017 to 3 Jul 2025 inclusive.
export const SSD_TABLE_B: SsdBand[] = [
  { maxMonths: 12, rate: 0.12, label: 'Held up to 1 year' },
  { maxMonths: 24, rate: 0.08, label: 'Held more than 1, up to 2 years' },
  { maxMonths: 36, rate: 0.04, label: 'Held more than 2, up to 3 years' },
  { maxMonths: Infinity, rate: 0, label: 'Held more than 3 years' },
];

export interface SingaporeSellerStampDutyInputs {
  salePrice: number;
  purchaseDate: string;
  saleDate: string;
}

export interface SingaporeSellerStampDutyResult {
  salePrice: number;
  table: SsdTable;
  holdingYears: number;
  holdingMonthsRemainder: number;
  totalMonthsHeld: number;
  rate: number;
  bandLabel: string;
  ssdPayable: number;
  invalidDateRange: boolean;
}

export function getDefaultInputs(): SingaporeSellerStampDutyInputs {
  return {
    salePrice: 1_000_000,
    purchaseDate: '2023-01-01',
    saleDate: new Date().toISOString().slice(0, 10),
  };
}

function selectTable(purchaseDate: string): SsdTable {
  if (purchaseDate >= TABLE_A_STARTS) return 'A';
  if (purchaseDate >= TABLE_B_STARTS) return 'B';
  return 'out-of-scope';
}

// Calendar month diff, same anniversary-day method as an age calculator.
function monthsBetween(start: Date, end: Date): number {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  return months;
}

function parseIsoDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function calculateSingaporeSellerStampDuty(
  inputs: SingaporeSellerStampDutyInputs
): SingaporeSellerStampDutyResult {
  const salePrice = Math.max(0, inputs.salePrice || 0);
  const round2 = (v: number) => Math.round(v * 100) / 100;

  const table = selectTable(inputs.purchaseDate);
  if (table === 'out-of-scope') {
    return {
      salePrice: round2(salePrice),
      table,
      holdingYears: 0,
      holdingMonthsRemainder: 0,
      totalMonthsHeld: 0,
      rate: 0,
      bandLabel: 'Purchase date before 11 March 2017 is not covered by this calculator',
      ssdPayable: 0,
      invalidDateRange: false,
    };
  }

  const purchase = parseIsoDate(inputs.purchaseDate);
  const sale = parseIsoDate(inputs.saleDate || new Date().toISOString().slice(0, 10));
  const totalMonthsHeld = monthsBetween(purchase, sale);
  const invalidDateRange = totalMonthsHeld < 0;

  if (invalidDateRange) {
    return {
      salePrice: round2(salePrice),
      table,
      holdingYears: 0,
      holdingMonthsRemainder: 0,
      totalMonthsHeld: 0,
      rate: 0,
      bandLabel: 'Sale date is before the purchase date',
      ssdPayable: 0,
      invalidDateRange: true,
    };
  }

  const bands = table === 'A' ? SSD_TABLE_A : SSD_TABLE_B;
  const band = bands.find((b) => totalMonthsHeld <= b.maxMonths) ?? bands[bands.length - 1];

  const ssdPayable = salePrice * band.rate;

  return {
    salePrice: round2(salePrice),
    table,
    holdingYears: Math.floor(totalMonthsHeld / 12),
    holdingMonthsRemainder: totalMonthsHeld % 12,
    totalMonthsHeld,
    rate: band.rate,
    bandLabel: band.label,
    ssdPayable: round2(ssdPayable),
    invalidDateRange: false,
  };
}
