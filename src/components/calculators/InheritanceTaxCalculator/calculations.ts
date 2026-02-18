/**
 * UK Inheritance Tax Calculations
 * 2024/25 rates – nil-rate band frozen until April 2028
 */

import type { IHTInputs, IHTResult } from './types';

const NIL_RATE_BAND = 325000;
const RESIDENCE_NIL_RATE_BAND = 175000;
const STANDARD_IHT_RATE = 0.4;
const CHARITABLE_REDUCED_RATE = 0.36;
const RNRB_TAPER_THRESHOLD = 2000000;

export function calculateIHT(inputs: IHTInputs): IHTResult {
  const {
    estateValue,
    mainResidenceValue,
    leavingToDirectDescendants,
    marriedOrCivilPartner,
    spouseInheritingEstate,
    giftsInLast7Years,
    charitableDonation,
  } = inputs;

  // If spouse inherits everything, no IHT due (spouse exemption)
  if (spouseInheritingEstate) {
    return {
      taxableEstate: 0,
      totalNilRateBand: 0,
      nilRateBand: NIL_RATE_BAND,
      residenceNilRateBand: 0,
      transferredNilRateBand: 0,
      transferredResidenceNilRateBand: 0,
      charitableDeduction: 0,
      ihtDue: 0,
      effectiveRate: 0,
      taxRate: STANDARD_IHT_RATE * 100,
      netEstate: estateValue,
    };
  }

  // Basic nil-rate band
  let nilRateBand = NIL_RATE_BAND;

  // Transferred nil-rate band from deceased spouse
  let transferredNilRateBand = 0;
  if (marriedOrCivilPartner) {
    transferredNilRateBand = NIL_RATE_BAND; // Assume full transfer
    nilRateBand += transferredNilRateBand;
  }

  // Residence nil-rate band
  let residenceNilRateBand = 0;
  let transferredResidenceNilRateBand = 0;

  if (leavingToDirectDescendants && mainResidenceValue > 0) {
    residenceNilRateBand = Math.min(RESIDENCE_NIL_RATE_BAND, mainResidenceValue);

    // Taper: RNRB reduced by £1 for every £2 over £2m
    if (estateValue > RNRB_TAPER_THRESHOLD) {
      const taper = Math.floor((estateValue - RNRB_TAPER_THRESHOLD) / 2);
      residenceNilRateBand = Math.max(0, residenceNilRateBand - taper);
    }

    if (marriedOrCivilPartner) {
      transferredResidenceNilRateBand = Math.min(RESIDENCE_NIL_RATE_BAND, mainResidenceValue);
      if (estateValue > RNRB_TAPER_THRESHOLD) {
        const taper = Math.floor((estateValue - RNRB_TAPER_THRESHOLD) / 2);
        transferredResidenceNilRateBand = Math.max(0, transferredResidenceNilRateBand - taper);
      }
    }
  }

  const totalNilRateBand = nilRateBand + residenceNilRateBand + transferredResidenceNilRateBand;

  // Taxable estate
  const estateWithGifts = estateValue + giftsInLast7Years;
  const taxableEstate = Math.max(0, estateWithGifts - totalNilRateBand);

  // Determine rate (36% if 10%+ of net estate goes to charity)
  const netEstateForCharity = estateValue - totalNilRateBand;
  const charitableDeduction = Math.min(charitableDonation, estateValue);
  const qualifiesForReducedRate =
    netEstateForCharity > 0 && charitableDeduction >= netEstateForCharity * 0.1;
  const taxRate = qualifiesForReducedRate ? CHARITABLE_REDUCED_RATE : STANDARD_IHT_RATE;

  const taxableAfterCharity = Math.max(0, taxableEstate - charitableDeduction);
  const ihtDue = Math.round(taxableAfterCharity * taxRate);

  return {
    taxableEstate: taxableAfterCharity,
    totalNilRateBand,
    nilRateBand: NIL_RATE_BAND + transferredNilRateBand,
    residenceNilRateBand,
    transferredNilRateBand,
    transferredResidenceNilRateBand,
    charitableDeduction,
    ihtDue,
    effectiveRate: estateValue > 0 ? (ihtDue / estateValue) * 100 : 0,
    taxRate: taxRate * 100,
    netEstate: estateValue - ihtDue,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
