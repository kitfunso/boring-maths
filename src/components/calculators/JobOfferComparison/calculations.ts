import type {
  JobOfferComparisonInputs,
  JobOfferComparisonResult,
  JobOffer,
  OfferCalculation,
} from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

const WORKING_DAYS_PER_YEAR = 260;

const AVERAGE_COMMUTE_SPEED = 30;

const WORK_HOURS_PER_DAY = 8;

const safe = (v: number): number => (Number.isFinite(v) ? Math.max(0, v) : 0);

function calculateOffer(offer: JobOffer, inputs: JobOfferComparisonInputs): OfferCalculation {
  const hourlyTimeValue = safe(inputs.hourlyTimeValue);
  const costPerMile = safe(inputs.costPerMile);
  const contribution401k = safe(inputs.contribution401k);
  const { includeCommuteTime } = inputs;

  const baseSalary = safe(offer.baseSalary);
  const bonusAmount = baseSalary * safe(offer.bonusPercentage);

  const equityValue = safe(offer.annualEquity);

  const match401kLimit = safe(offer.match401kLimit);
  const contributionAmount = baseSalary * contribution401k;
  const maxMatchableAmount = baseSalary * match401kLimit;
  const actualContribution = Math.min(contributionAmount, maxMatchableAmount);
  const match401kValue =
    match401kLimit > 0
      ? actualContribution * (safe(offer.match401kPercentage) / match401kLimit)
      : 0;

  const annualHealthCost = safe(offer.healthInsuranceCost) * 12;
  const healthBenefitNet = safe(offer.healthBenefitValue) - annualHealthCost;

  const dailyRate = baseSalary / WORKING_DAYS_PER_YEAR;
  const ptoValue = dailyRate * safe(offer.ptoDays);

  const commuteDaysPerYear = WORKING_DAYS_PER_YEAR * (safe(offer.officeDaysPerWeek) / 5);
  const commuteDistance = safe(offer.commuteDistance);
  const annualCommuteMiles = commuteDistance * 2 * commuteDaysPerYear;
  const commuteCost = annualCommuteMiles * costPerMile;

  const dailyCommuteHours = (commuteDistance * 2) / AVERAGE_COMMUTE_SPEED;
  const annualCommuteHours = dailyCommuteHours * commuteDaysPerYear;
  const commuteTimeValue = includeCommuteTime ? annualCommuteHours * hourlyTimeValue : 0;

  const otherBenefitsValue = safe(offer.otherBenefits);

  const signingBonusValue = safe(offer.signingBonus);

  const totalCashComp = baseSalary + bonusAmount + signingBonusValue;
  const totalComp =
    totalCashComp + equityValue + match401kValue + healthBenefitNet + otherBenefitsValue;

  const netComp = totalComp - commuteCost - commuteTimeValue;

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

function generateRecommendation(
  offer1: OfferCalculation,
  offer2: OfferCalculation,
  inputs: JobOfferComparisonInputs
): JobOfferComparisonResult['recommendation'] {
  const considerations: string[] = [];

  const netDiff = offer2.netComp - offer1.netComp;
  const netDiffPercent = (netDiff / offer1.netComp) * 100;

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

export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}

export function formatDifference(value: number, currency: Currency = 'USD'): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatCurrency(value, currency)}`;
}
