/**
 * Remote Work Savings Calculator - Calculation Logic
 *
 * Calculates total savings from working remotely vs commuting to office.
 * Includes transportation, food, clothing, time value, and environmental impact.
 */

import { type Currency, getCurrencySymbol } from '../../../lib/regions';
import {
  type RemoteWorkSavingsInputs,
  type RemoteWorkSavingsResult,
  type SavingsBreakdown,
  type EnvironmentalImpact,
  type TimeAnalysis,
  type ArrangementComparison,
} from './types';

/**
 * CO2 emissions constants
 * Average car emits ~19.6 lbs CO2 per gallon of gas
 * A mature tree absorbs ~48 lbs CO2 per year
 */
const CO2_LBS_PER_GALLON = 19.6;
const CO2_LBS_PER_TREE_YEAR = 48;
const LBS_PER_TON = 2000;

/**
 * Calculate transportation savings
 */
function calculateTransportSavings(inputs: RemoteWorkSavingsInputs): {
  gas: number;
  maintenance: number;
  parking: number;
  tolls: number;
  transit: number;
  total: number;
  milesAvoided: number;
  gallonsSaved: number;
} {
  const {
    commuteType,
    commuteDistanceMiles,
    officeDaysPerWeek,
    weeksPerYear,
    gasPricePerGallon,
    vehicleMpg,
    maintenanceCostPerMile,
    parkingCostDaily,
    tollsDaily,
    transitCostDaily,
  } = inputs;

  const commuteDaysPerYear = officeDaysPerWeek * weeksPerYear;
  const roundTripMiles = commuteDistanceMiles * 2;
  const annualMiles = roundTripMiles * commuteDaysPerYear;

  let gas = 0;
  let maintenance = 0;
  let parking = 0;
  let tolls = 0;
  let transit = 0;
  let milesAvoided = 0;
  let gallonsSaved = 0;

  if (commuteType === 'car' || commuteType === 'mixed') {
    const gallonsUsed = annualMiles / vehicleMpg;
    gas = gallonsUsed * gasPricePerGallon;
    maintenance = annualMiles * maintenanceCostPerMile;
    parking = parkingCostDaily * commuteDaysPerYear;
    tolls = tollsDaily * commuteDaysPerYear;
    milesAvoided = annualMiles;
    gallonsSaved = gallonsUsed;
  }

  if (commuteType === 'public-transit' || commuteType === 'mixed') {
    transit = transitCostDaily * commuteDaysPerYear;
  }

  // For mixed, assume 50% car / 50% transit
  if (commuteType === 'mixed') {
    gas *= 0.5;
    maintenance *= 0.5;
    parking *= 0.5;
    tolls *= 0.5;
    transit *= 0.5;
    milesAvoided *= 0.5;
    gallonsSaved *= 0.5;
  }

  const total = gas + maintenance + parking + tolls + transit;

  return { gas, maintenance, parking, tolls, transit, total, milesAvoided, gallonsSaved };
}

/**
 * Calculate lifestyle savings (food, clothes, coffee)
 */
function calculateLifestyleSavings(inputs: RemoteWorkSavingsInputs): {
  food: number;
  clothing: number;
  dryCleaning: number;
  coffee: number;
  total: number;
} {
  const {
    officeDaysPerWeek,
    weeksPerYear,
    workLunchCostDaily,
    homeLunchCostDaily,
    workClothesBudgetMonthly,
    dryCleaningMonthly,
    coffeeAtWorkDaily,
  } = inputs;

  const commuteDaysPerYear = officeDaysPerWeek * weeksPerYear;

  // Food savings (difference between eating out and cooking at home)
  const food = (workLunchCostDaily - homeLunchCostDaily) * commuteDaysPerYear;

  // Work clothes - assume remote work reduces need by 80%
  const clothing = workClothesBudgetMonthly * 12 * 0.8;

  // Dry cleaning - assume remote work reduces by 90%
  const dryCleaning = dryCleaningMonthly * 12 * 0.9;

  // Coffee at work
  const coffee = coffeeAtWorkDaily * commuteDaysPerYear;

  const total = food + clothing + dryCleaning + coffee;

  return { food, clothing, dryCleaning, coffee, total };
}

/**
 * Calculate time analysis
 */
function calculateTimeAnalysis(inputs: RemoteWorkSavingsInputs): TimeAnalysis {
  const { commuteTimeMinutes, officeDaysPerWeek, weeksPerYear, hourlyRate } = inputs;

  const dailyCommuteMinutes = commuteTimeMinutes * 2; // Round trip
  const weeklyCommuteHours = (dailyCommuteMinutes * officeDaysPerWeek) / 60;
  const annualCommuteHours = weeklyCommuteHours * weeksPerYear;
  const annualCommuteDays = annualCommuteHours / 8; // 8-hour workday equivalents
  const valueOfTimeSaved = annualCommuteHours * hourlyRate;

  return {
    dailyCommuteMinutes,
    weeklyCommuteHours,
    annualCommuteHours,
    annualCommuteDays,
    valueOfTimeSaved,
  };
}

/**
 * Calculate environmental impact
 */
function calculateEnvironmentalImpact(
  milesAvoided: number,
  gallonsSaved: number
): EnvironmentalImpact {
  const co2PoundsSavedAnnual = gallonsSaved * CO2_LBS_PER_GALLON;
  const co2TonsSavedAnnual = co2PoundsSavedAnnual / LBS_PER_TON;
  const treesEquivalent = Math.round(co2PoundsSavedAnnual / CO2_LBS_PER_TREE_YEAR);

  return {
    milesSavedAnnual: milesAvoided,
    gallonsSavedAnnual: gallonsSaved,
    co2PoundsSavedAnnual,
    co2TonsSavedAnnual,
    treesEquivalent,
  };
}

/**
 * Main calculation function
 */
export function calculateRemoteWorkSavings(
  inputs: RemoteWorkSavingsInputs
): RemoteWorkSavingsResult {
  // Calculate each category
  const transport = calculateTransportSavings(inputs);
  const lifestyle = calculateLifestyleSavings(inputs);
  const time = calculateTimeAnalysis(inputs);
  const environmental = calculateEnvironmentalImpact(
    transport.milesAvoided,
    transport.gallonsSaved
  );

  // Build savings breakdown
  const totalAnnualSavings = transport.total + lifestyle.total;
  const totalMonthlySavings = totalAnnualSavings / 12;
  const commuteDaysPerYear = inputs.officeDaysPerWeek * inputs.weeksPerYear;
  const totalDailySavings = totalAnnualSavings / commuteDaysPerYear;

  // Effective hourly raise (savings spread across work hours)
  const annualWorkHours = 40 * inputs.weeksPerYear;
  const effectiveHourlyRaise = totalAnnualSavings / annualWorkHours;

  const savings: SavingsBreakdown = {
    gasSavings: transport.gas,
    maintenanceSavings: transport.maintenance,
    parkingSavings: transport.parking,
    tollsSavings: transport.tolls,
    transitSavings: transport.transit,
    totalTransportSavings: transport.total,

    foodSavings: lifestyle.food,
    clothingSavings: lifestyle.clothing,
    dryCleaningSavings: lifestyle.dryCleaning,
    coffeeSavings: lifestyle.coffee,
    totalLifestyleSavings: lifestyle.total,

    commuteHoursSavedAnnual: time.annualCommuteHours,
    timeValueSavings: time.valueOfTimeSaved,

    totalAnnualSavings,
    totalMonthlySavings,
    totalDailySavings,
    effectiveHourlyRaise,
  };

  // Comparison (office costs vs remote costs)
  const officeCosts = totalAnnualSavings; // What you spend going to office
  const remoteCosts = inputs.homeLunchCostDaily * commuteDaysPerYear; // Minimal remote costs
  const netSavings = officeCosts - remoteCosts + remoteCosts; // Net is just office costs for simplicity
  const savingsPercentage = (netSavings / (officeCosts + remoteCosts)) * 100;

  const comparison: ArrangementComparison = {
    officeCosts,
    remoteCosts,
    netSavings: totalAnnualSavings,
    savingsPercentage,
  };

  return {
    savings,
    environmental,
    time,
    comparison,
    currency: inputs.currency,
    annualSavings: totalAnnualSavings,
    monthlySavings: totalMonthlySavings,
    effectiveRaise: effectiveHourlyRaise,
    hoursReclaimed: time.annualCommuteHours,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

/**
 * Format currency with decimals
 */
export function formatCurrencyDecimal(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

/**
 * Format hours
 */
export function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) {
    return `${wholeHours} hr`;
  }
  return `${wholeHours} hr ${minutes} min`;
}

/**
 * Format large numbers compactly
 */
export function formatCompact(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toFixed(0);
}

/**
 * Get color for savings amount
 */
export function getSavingsColor(amount: number): string {
  if (amount > 5000) return 'text-green-400';
  if (amount > 2000) return 'text-emerald-400';
  if (amount > 0) return 'text-cyan-400';
  return 'text-[var(--color-muted)]';
}
