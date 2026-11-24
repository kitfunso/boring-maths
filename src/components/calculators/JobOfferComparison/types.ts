import type { Currency } from '../../../lib/regions';

export interface JobOffer {
  name: string;

  baseSalary: number;

  bonusPercentage: number;

  annualEquity: number;

  match401kPercentage: number;

  match401kLimit: number;

  healthInsuranceCost: number;

  healthBenefitValue: number;

  ptoDays: number;

  commuteDistance: number;

  officeDaysPerWeek: number;

  otherBenefits: number;

  signingBonus: number;
}

export interface JobOfferComparisonInputs {
  currency: Currency;

  offer1: JobOffer;

  offer2: JobOffer;

  hourlyTimeValue: number;

  costPerMile: number;

  includeCommuteTime: boolean;

  contribution401k: number;
}

export interface OfferCalculation {
  baseSalary: number;

  bonusAmount: number;

  equityValue: number;

  match401kValue: number;

  healthBenefitNet: number;

  ptoValue: number;

  commuteCost: number;

  commuteTimeValue: number;

  otherBenefitsValue: number;

  signingBonusValue: number;

  totalCashComp: number;

  totalComp: number;

  netComp: number;

  effectiveHourlyRate: number;
}

export interface JobOfferComparisonResult {
  currency: Currency;

  offer1: OfferCalculation;

  offer2: OfferCalculation;

  difference: {
    totalComp: number;
    netComp: number;
    percentageDiff: number;
  };

  recommendation: {
    winner: 1 | 2 | 'tie';
    reason: string;
    considerations: string[];
  };
}

export function getDefaultOffer(name: string, currency: Currency): JobOffer {
  const baseSalary = currency === 'GBP' ? 50000 : currency === 'EUR' ? 55000 : 75000;

  return {
    name,
    baseSalary,
    bonusPercentage: 0.1,
    annualEquity: 0,
    match401kPercentage: 0.04,
    match401kLimit: 0.06,
    healthInsuranceCost: currency === 'GBP' ? 0 : currency === 'EUR' ? 50 : 200,
    healthBenefitValue: currency === 'GBP' ? 0 : currency === 'EUR' ? 3000 : 7000,
    ptoDays: currency === 'GBP' ? 25 : currency === 'EUR' ? 28 : 15,
    commuteDistance: 15,
    officeDaysPerWeek: 5,
    otherBenefits: 0,
    signingBonus: 0,
  };
}

export function getDefaultInputs(currency: Currency = 'USD'): JobOfferComparisonInputs {
  const hourlyTimeValue = currency === 'GBP' ? 25 : currency === 'EUR' ? 28 : 35;
  const costPerMile = currency === 'GBP' ? 0.55 : currency === 'EUR' ? 0.3 : 0.76;

  return {
    currency,
    offer1: { ...getDefaultOffer('Current Job', currency), commuteDistance: 10 },
    offer2: {
      ...getDefaultOffer('New Offer', currency),
      baseSalary: Math.round(getDefaultOffer('', currency).baseSalary * 1.15),
      commuteDistance: 25,
    },
    hourlyTimeValue,
    costPerMile,
    includeCommuteTime: true,
    contribution401k: 0.06,
  };
}

export const DEFAULT_INPUTS: JobOfferComparisonInputs = getDefaultInputs('USD');
