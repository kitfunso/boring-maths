/**
 * Job Offer Comparison Calculator - Calculation Logic
 *
 * Pure functions for comparing two job offers by total compensation.
 */

import type {
  JobOfferComparisonInputs,
  JobOfferComparisonResult,
  JobOffer,
  OfferCalculation,
} from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/** Working days per year (52 weeks * 5 days) */
const WORKING_DAYS_PER_YEAR = 260;

/** Average commute speed in mph for time calculations */
const AVERAGE_COMMUTE_SPEED = 30;

/** Standard work hours per day */
const WORK_HOURS_PER_DAY = 8;

/**
 * Calculate values for a single job offer
 */
function calculateOffer(offer: JobOffer, inputs: JobOfferComparisonInputs): OfferCalculation {
  const { hourlyTimeValue, costPerMile, includeCommuteTime, contribution401k } = inputs;

  // Base and bonus
  const baseSalary = offer.baseSalary;
  const bonusAmount = baseSalary * offer.bonusPercentage;

  // Equity
  const equityValue = offer.annualEquity;

  // 401k match calculation
  // Match is the lesser of: (contribution * match %) or (salary * match limit)
  const contributionAmount = baseSalary * contribution401k;
  const maxMatchableAmount = baseSalary * offer.match401kLimit;
  const actualContribution = Math.min(contributionAmount, maxMatchableAmount);
  const match401kValue = actualContribution * (offer.match401kPercentage / offer.match401kLimit);

  // Health benefits (employer value - employee cost)
  const annualHealthCost = offer.healthInsuranceCost * 12;
  const healthBenefitNet = offer.healthBenefitValue - annualHealthCost;

  // PTO value (daily rate * days)
  const dailyRate = baseSalary / WORKING_DAYS_PER_YEAR;
  const ptoValue = dailyRate * offer.ptoDays;

  // Commute calculations
  const commuteDaysPerYear = WORKING_DAYS_PER_YEAR * (offer.officeDaysPerWeek / 5);
  const annualCommuteMiles = offer.commuteDistance * 2 * commuteDaysPerYear; // round trip
  const commuteCost = annualCommuteMiles * costPerMile;

  // Commute time value (opportunity cost)
  const dailyCommuteHours = (offer.commuteDistance * 2) / AVERAGE_COMMUTE_SPEED;
  const annualCommuteHours = dailyCommuteHours * commuteDaysPerYear;
  const commuteTimeValue = includeCommuteTime ? annualCommuteHours * hourlyTimeValue : 0;

  // Other benefits
  const otherBenefitsValue = offer.otherBenefits;

  // Signing bonus (counted at full value for first year comparison)
  const signingBonusValue = offer.signingBonus;

  // Totals
  const totalCashComp = baseSalary + bonusAmount + signingBonusValue;
  const totalComp =
    totalCashComp + equityValue + match401kValue + healthBenefitNet + otherBenefitsValue;

  // Net after commute costs and time
  const netComp = totalComp - commuteCost - commuteTimeValue;

  // Effective hourly rate
  const totalWorkHours = WORKING_DAYS_PER_YEAR * WORK_HOURS_PER_DAY;
  const totalHoursIncludingCommute = totalWorkHours + annualCommuteHours;
  const effectiveHourlyRate = netComp / totalHoursIncludingCommute;

  return {
    baseSalary,
    bonusAmount,
    equityValue,
    match401kValue,
    healthBenefitNet,
    ptoValue,
    commuteCost,
    commuteTimeValue,
    otherBenefitsValue,
    signingBonusValue,
    totalCashComp,
    totalComp,
    netComp,
    effectiveHourlyRate,
  };
}

/**
 * Generate recommendation based on comparison
 */
function generateRecommendation(
  offer1: OfferCalculation,
  offer2: OfferCalculation,
  inputs: JobOfferComparisonInputs
): JobOfferComparisonResult['recommendation'] {
  const considerations: string[] = [];

  // Compare net compensation
  const netDiff = offer2.netComp - offer1.netComp;
  const netDiffPercent = (netDiff / offer1.netComp) * 100;

  // Determine winner
  let winner: 1 | 2 | 'tie';
  let reason: string;

  if (Math.abs(netDiffPercent) < 3) {
    winner = 'tie';
    reason = 'Both offers have very similar total compensation (within 3%).';
  } else if (netDiff > 0) {
    winner = 2;
    reason = `${inputs.offer2.name} offers ${Math.abs(netDiffPercent).toFixed(1)}% higher net compensation.`;
  } else {
    winner = 1;
    reason = `${inputs.offer1.name} offers ${Math.abs(netDiffPercent).toFixed(1)}% higher net compensation.`;
  }

  // Add considerations
  if (offer2.commuteCost > offer1.commuteCost * 1.5) {
    considerations.push(`${inputs.offer2.name} has significantly higher commute costs.`);
  } else if (offer1.commuteCost > offer2.commuteCost * 1.5) {
    considerations.push(`${inputs.offer1.name} has significantly higher commute costs.`);
  }

  if (inputs.offer2.ptoDays > inputs.offer1.ptoDays + 5) {
    considerations.push(
      `${inputs.offer2.name} offers ${inputs.offer2.ptoDays - inputs.offer1.ptoDays} more PTO days.`
    );
  } else if (inputs.offer1.ptoDays > inputs.offer2.ptoDays + 5) {
    considerations.push(
      `${inputs.offer1.name} offers ${inputs.offer1.ptoDays - inputs.offer2.ptoDays} more PTO days.`
    );
  }

  if (offer2.equityValue > 0 && offer1.equityValue === 0) {
    considerations.push(`${inputs.offer2.name} includes equity which may have significant upside.`);
  } else if (offer1.equityValue > 0 && offer2.equityValue === 0) {
    considerations.push(`${inputs.offer1.name} includes equity which may have significant upside.`);
  }

  if (inputs.offer2.officeDaysPerWeek < inputs.offer1.officeDaysPerWeek) {
    considerations.push(`${inputs.offer2.name} offers more remote flexibility.`);
  } else if (inputs.offer1.officeDaysPerWeek < inputs.offer2.officeDaysPerWeek) {
    considerations.push(`${inputs.offer1.name} offers more remote flexibility.`);
  }

  if (offer2.match401kValue > offer1.match401kValue * 1.5) {
    considerations.push(`${inputs.offer2.name} has significantly better 401k matching.`);
  } else if (offer1.match401kValue > offer2.match401kValue * 1.5) {
    considerations.push(`${inputs.offer1.name} has significantly better 401k matching.`);
  }

  if (considerations.length === 0) {
    considerations.push(
      'Consider non-monetary factors like career growth, team culture, and work-life balance.'
    );
  }

  return { winner, reason, considerations };
}

/**
 * Calculate job offer comparison
 */
export function calculateComparison(inputs: JobOfferComparisonInputs): JobOfferComparisonResult {
  const { currency } = inputs;

  const offer1Calc = calculateOffer(inputs.offer1, inputs);
  const offer2Calc = calculateOffer(inputs.offer2, inputs);

  const totalCompDiff = offer2Calc.totalComp - offer1Calc.totalComp;
  const netCompDiff = offer2Calc.netComp - offer1Calc.netComp;
  const percentageDiff =
    offer1Calc.netComp !== 0
      ? ((offer2Calc.netComp - offer1Calc.netComp) / offer1Calc.netComp) * 100
      : 0;

  const recommendation = generateRecommendation(offer1Calc, offer2Calc, inputs);

  return {
    currency,
    offer1: offer1Calc,
    offer2: offer2Calc,
    difference: {
      totalComp: totalCompDiff,
      netComp: netCompDiff,
      percentageDiff,
    },
    recommendation,
  };
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}

/**
 * Format a number with sign (+ or -)
 */
export function formatDifference(value: number, currency: Currency = 'USD'): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatCurrency(value, currency)}`;
}
