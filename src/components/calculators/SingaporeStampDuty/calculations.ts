/** Singapore BSD + ABSD, residential property. BSD bands eff. 15 Feb 2023, ABSD rates eff. 27 Apr 2023 (MOF). */

export type BuyerProfile = 'citizen' | 'pr' | 'foreigner' | 'entity';

// 0 or 1 = that many properties already owned; 2 stands for "2 or more".
export type PropertiesOwned = 0 | 1 | 2;

export interface BsdBand {
  limit: number;
  rate: number;
  label: string;
}

// Marginal bands, residential property, effective 15 Feb 2023.
export const BSD_BANDS: BsdBand[] = [
  { limit: 180_000, rate: 0.01, label: 'First $180,000' },
  { limit: 360_000, rate: 0.02, label: 'Next $180,000 ($180,001–$360,000)' },
  { limit: 1_000_000, rate: 0.03, label: 'Next $640,000 ($360,001–$1,000,000)' },
  { limit: 1_500_000, rate: 0.04, label: 'Next $500,000 ($1,000,001–$1,500,000)' },
  { limit: 3_000_000, rate: 0.05, label: 'Next $1,500,000 ($1,500,001–$3,000,000)' },
  { limit: Infinity, rate: 0.06, label: 'Above $3,000,000' },
];

// ABSD: flat rate on the whole price, by profile and existing property count.
// [1st, 2nd, 3rd+] for citizen/PR; a single flat rate for foreigner/entity.
const ABSD_RATE_TABLE: Record<BuyerProfile, readonly [number, number, number] | number> = {
  citizen: [0, 0.2, 0.3],
  pr: [0.05, 0.25, 0.3],
  foreigner: 0.6,
  entity: 0.65,
};

export interface BsdBandResult {
  label: string;
  rate: number;
  amountInBand: number;
  duty: number;
}

export interface SingaporeStampDutyInputs {
  purchasePrice: number;
  buyerProfile: BuyerProfile;
  propertiesOwned: PropertiesOwned;
}

export interface SingaporeStampDutyResult {
  purchasePrice: number;
  bsd: number;
  bsdBreakdown: BsdBandResult[];
  absd: number;
  absdRate: number;
  totalDuty: number;
  totalRatePercent: number;
}

export function getDefaultInputs(): SingaporeStampDutyInputs {
  return {
    purchasePrice: 1_000_000,
    buyerProfile: 'citizen',
    propertiesOwned: 0,
  };
}

function getAbsdRate(profile: BuyerProfile, propertiesOwned: PropertiesOwned): number {
  const entry = ABSD_RATE_TABLE[profile];
  if (typeof entry === 'number') return entry;
  return entry[propertiesOwned];
}

// Walk the bands in order, taxing only the slice of price that falls in each.
function calculateBsdBreakdown(price: number): BsdBandResult[] {
  const breakdown: BsdBandResult[] = [];
  let previousLimit = 0;
  let remaining = price;

  for (const band of BSD_BANDS) {
    if (remaining <= 0) break;
    const bandSize = band.limit - previousLimit;
    const amountInBand = Math.min(remaining, bandSize);
    breakdown.push({
      label: band.label,
      rate: band.rate,
      amountInBand,
      duty: amountInBand * band.rate,
    });
    remaining -= amountInBand;
    previousLimit = band.limit;
  }

  return breakdown;
}

export function calculateSingaporeStampDuty(
  inputs: SingaporeStampDutyInputs
): SingaporeStampDutyResult {
  const price = Math.max(0, inputs.purchasePrice || 0);

  const bsdBreakdown = calculateBsdBreakdown(price);
  const bsd = bsdBreakdown.reduce((sum, band) => sum + band.duty, 0);

  const absdRate = getAbsdRate(inputs.buyerProfile, inputs.propertiesOwned);
  const absd = price * absdRate;

  const totalDuty = bsd + absd;
  const totalRatePercent = price > 0 ? (totalDuty / price) * 100 : 0;

  const round2 = (v: number) => Math.round(v * 100) / 100;

  return {
    purchasePrice: round2(price),
    bsd: round2(bsd),
    bsdBreakdown: bsdBreakdown.map((b) => ({
      ...b,
      amountInBand: round2(b.amountInBand),
      duty: round2(b.duty),
    })),
    absd: round2(absd),
    absdRate,
    totalDuty: round2(totalDuty),
    totalRatePercent: round2(totalRatePercent),
  };
}
