/** Job Offer Comparison Calculator - Type Definitions: compares two offers by total compensation including salary, benefits, equity, and quality of life factors. */

import type { Currency } from '../../../lib/regions';

export interface JobOffer {
  /** Job title or company name, for display. */
  name: string;

  baseSalary: number;

  /** Expected annual bonus (as decimal, e.g., 0.10 = 10%) */
  bonusPercentage: number;

  /** Equity/RSU value vested per year. */
  annualEquity: number;

  /** Employer 401k match percentage (as decimal, e.g., 0.06 = 6%) */
  match401kPercentage: number;

  /** Maximum salary matched for 401k (as decimal, e.g., 0.06 = 6% of salary) */
  match401kLimit: number;

  /** Monthly cost, employee contribution. */
  healthInsuranceCost: number;

  /** Employer contribution, annual (healthInsuranceCost above is monthly). */
  healthBenefitValue: number;

  ptoDays: number;

  /** One-way, miles. */
  commuteDistance: number;

  officeDaysPerWeek: number;

  /** Other annual benefits (gym, transit, etc.) */
  otherBenefits: number;

  /** Signing bonus (one-time) */
  signingBonus: number;
}

export interface JobOfferComparisonInputs {
  currency: Currency;

  /** First offer (typically current/primary). */
  offer1: JobOffer;

  /** Second offer (comparison). */
  offer2: JobOffer;

  /** Hourly rate, for time-value calculations. */
  hourlyTimeValue: number;

  /** Cost per mile (gas, wear, etc.) */
  costPerMile: number;

  includeCommuteTime: boolean;

  /** User's contribution to 401k (as decimal) */
  contribution401k: number;
}

export interface OfferCalculation {
  baseSalary: number;

  bonusAmount: number;

  equityValue: number;

  match401kValue: number;

  /** Net value (employer contribution minus employee cost). */
  healthBenefitNet: number;

  ptoValue: number;

  commuteCost: number;

  /** Value of commute time (opportunity cost) */
  commuteTimeValue: number;

  otherBenefitsValue: number;

  /** Prorated over first year. */
  signingBonusValue: number;

  totalCashComp: number;

  /** All-in (vs cash-only above). */
  totalComp: number;

  /** After commute costs. */
  netComp: number;

  /** Based on work + commute time. */
  effectiveHourlyRate: number;
}

export interface JobOfferComparisonResult {
  currency: Currency;

  offer1: OfferCalculation;

  offer2: OfferCalculation;

  /** offer2 minus offer1. */
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
  const costPerMile = currency === 'GBP' ? 0.45 : currency === 'EUR' ? 0.3 : 0.67;

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
