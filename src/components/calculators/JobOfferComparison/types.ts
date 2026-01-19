/**
 * Job Offer Comparison Calculator - Type Definitions
 *
 * Compare two job offers by total compensation including salary,
 * benefits, equity, and quality of life factors.
 */

import type { Currency } from '../../../lib/regions';

/**
 * Individual job offer details
 */
export interface JobOffer {
  /** Job title or company name for display */
  name: string;

  /** Base annual salary */
  baseSalary: number;

  /** Expected annual bonus (as decimal, e.g., 0.10 = 10%) */
  bonusPercentage: number;

  /** Annual equity/RSU value (vested per year) */
  annualEquity: number;

  /** Employer 401k match percentage (as decimal, e.g., 0.06 = 6%) */
  match401kPercentage: number;

  /** Maximum salary matched for 401k (as decimal, e.g., 0.06 = 6% of salary) */
  match401kLimit: number;

  /** Monthly health insurance cost (employee contribution) */
  healthInsuranceCost: number;

  /** Employer health insurance contribution (annual value) */
  healthBenefitValue: number;

  /** Annual PTO days */
  ptoDays: number;

  /** One-way commute miles */
  commuteDistance: number;

  /** Days per week in office (for hybrid/remote) */
  officeDaysPerWeek: number;

  /** Other annual benefits (gym, transit, etc.) */
  otherBenefits: number;

  /** Signing bonus (one-time) */
  signingBonus: number;
}

/**
 * Input values for the Job Offer Comparison Calculator
 */
export interface JobOfferComparisonInputs {
  /** Selected currency */
  currency: Currency;

  /** First job offer (typically current or primary offer) */
  offer1: JobOffer;

  /** Second job offer (comparison offer) */
  offer2: JobOffer;

  /** User's hourly rate for time value calculations */
  hourlyTimeValue: number;

  /** Cost per mile for commute (gas, wear, etc.) */
  costPerMile: number;

  /** Include commute time in comparison */
  includeCommuteTime: boolean;

  /** User's contribution to 401k (as decimal) */
  contribution401k: number;
}

/**
 * Calculated values for a single offer
 */
export interface OfferCalculation {
  /** Base salary */
  baseSalary: number;

  /** Expected bonus amount */
  bonusAmount: number;

  /** Annual equity value */
  equityValue: number;

  /** 401k match value */
  match401kValue: number;

  /** Health benefits net value (employer contribution - employee cost) */
  healthBenefitNet: number;

  /** PTO monetary value */
  ptoValue: number;

  /** Annual commute cost */
  commuteCost: number;

  /** Value of commute time (opportunity cost) */
  commuteTimeValue: number;

  /** Other benefits value */
  otherBenefitsValue: number;

  /** Signing bonus (prorated over first year) */
  signingBonusValue: number;

  /** Total compensation (cash) */
  totalCashComp: number;

  /** Total compensation (all-in) */
  totalComp: number;

  /** Net compensation after commute costs */
  netComp: number;

  /** Effective hourly rate (based on actual work + commute time) */
  effectiveHourlyRate: number;
}

/**
 * Calculated results from the Job Offer Comparison Calculator
 */
export interface JobOfferComparisonResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Offer 1 calculations */
  offer1: OfferCalculation;

  /** Offer 2 calculations */
  offer2: OfferCalculation;

  /** Difference (offer2 - offer1) */
  difference: {
    totalComp: number;
    netComp: number;
    percentageDiff: number;
  };

  /** Recommendation */
  recommendation: {
    winner: 1 | 2 | 'tie';
    reason: string;
    considerations: string[];
  };
}

/**
 * Get default job offer values
 */
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

/**
 * Get default input values for a given currency
 */
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

/**
 * Default input values
 */
export const DEFAULT_INPUTS: JobOfferComparisonInputs = getDefaultInputs('USD');
