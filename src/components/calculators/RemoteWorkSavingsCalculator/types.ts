/**
 * Remote Work Savings Calculator Types
 *
 * Types for calculating savings from working remotely vs commuting.
 * Accounts for gas, car wear, parking, food, clothing, and time value.
 */

import { type Currency } from '../../../lib/regions';

/**
 * Work arrangement type
 */
export type WorkArrangement = 'full-remote' | 'hybrid' | 'office';

/**
 * Commute type
 */
export type CommuteType = 'car' | 'public-transit' | 'mixed';

/**
 * Input parameters for the calculator
 */
export interface RemoteWorkSavingsInputs {
  // Commute details
  commuteType: CommuteType;
  commuteDistanceMiles: number; // One-way distance
  commuteTimeMinutes: number; // One-way time
  officeDaysPerWeek: number; // Days commuting to office
  weeksPerYear: number; // Typically 48-50

  // Car costs (if driving)
  gasPricePerGallon: number;
  vehicleMpg: number;
  maintenanceCostPerMile: number; // Typically $0.05-0.10
  parkingCostDaily: number;
  tollsDaily: number;

  // Public transit costs (if applicable)
  transitCostDaily: number;

  // Other work-related expenses
  workLunchCostDaily: number; // Eating out vs home
  homeLunchCostDaily: number;
  workClothesBudgetMonthly: number;
  dryCleaningMonthly: number;
  coffeeAtWorkDaily: number;

  // Time value
  hourlyRate: number; // To calculate value of time saved

  // Environmental
  includeEnvironmentalImpact: boolean;

  // Display
  currency: Currency;
}

/**
 * Breakdown of savings by category
 */
export interface SavingsBreakdown {
  // Transportation
  gasSavings: number;
  maintenanceSavings: number;
  parkingSavings: number;
  tollsSavings: number;
  transitSavings: number;
  totalTransportSavings: number;

  // Food & Lifestyle
  foodSavings: number;
  clothingSavings: number;
  dryCleaningSavings: number;
  coffeeSavings: number;
  totalLifestyleSavings: number;

  // Time
  commuteHoursSavedAnnual: number;
  timeValueSavings: number;

  // Totals
  totalAnnualSavings: number;
  totalMonthlySavings: number;
  totalDailySavings: number;

  // Effective hourly raise
  effectiveHourlyRaise: number;
}

/**
 * Environmental impact metrics
 */
export interface EnvironmentalImpact {
  milesSavedAnnual: number;
  gallonsSavedAnnual: number;
  co2PoundsSavedAnnual: number;
  co2TonsSavedAnnual: number;
  treesEquivalent: number; // Number of trees to offset the same CO2
}

/**
 * Time analysis
 */
export interface TimeAnalysis {
  dailyCommuteMinutes: number; // Round trip
  weeklyCommuteHours: number;
  annualCommuteHours: number;
  annualCommuteDays: number; // In 8-hour workday equivalents
  valueOfTimeSaved: number;
}

/**
 * Comparison between arrangements
 */
export interface ArrangementComparison {
  officeCosts: number;
  remoteCosts: number;
  netSavings: number;
  savingsPercentage: number;
}

/**
 * Complete calculation results
 */
export interface RemoteWorkSavingsResult {
  savings: SavingsBreakdown;
  environmental: EnvironmentalImpact;
  time: TimeAnalysis;
  comparison: ArrangementComparison;
  currency: Currency;

  // Summary metrics
  annualSavings: number;
  monthlySavings: number;
  effectiveRaise: number;
  hoursReclaimed: number;
}

/**
 * Get default inputs based on currency
 */
export function getDefaultInputs(currency: Currency): RemoteWorkSavingsInputs {
  const defaults = {
    USD: {
      gasPricePerGallon: 3.50,
      parkingCostDaily: 15,
      transitCostDaily: 8,
      workLunchCostDaily: 15,
      homeLunchCostDaily: 5,
      workClothesBudgetMonthly: 100,
      coffeeAtWorkDaily: 5,
      hourlyRate: 35,
    },
    GBP: {
      gasPricePerGallon: 6.50, // UK petrol is expensive
      parkingCostDaily: 12,
      transitCostDaily: 10,
      workLunchCostDaily: 10,
      homeLunchCostDaily: 4,
      workClothesBudgetMonthly: 75,
      coffeeAtWorkDaily: 4,
      hourlyRate: 25,
    },
    EUR: {
      gasPricePerGallon: 5.50,
      parkingCostDaily: 10,
      transitCostDaily: 6,
      workLunchCostDaily: 12,
      homeLunchCostDaily: 4,
      workClothesBudgetMonthly: 80,
      coffeeAtWorkDaily: 4,
      hourlyRate: 28,
    },
  };

  const d = defaults[currency];

  return {
    // Commute
    commuteType: 'car',
    commuteDistanceMiles: 15, // One-way
    commuteTimeMinutes: 30, // One-way
    officeDaysPerWeek: 5,
    weeksPerYear: 48,

    // Car costs
    gasPricePerGallon: d.gasPricePerGallon,
    vehicleMpg: 28,
    maintenanceCostPerMile: 0.08,
    parkingCostDaily: d.parkingCostDaily,
    tollsDaily: 0,

    // Transit
    transitCostDaily: d.transitCostDaily,

    // Lifestyle
    workLunchCostDaily: d.workLunchCostDaily,
    homeLunchCostDaily: d.homeLunchCostDaily,
    workClothesBudgetMonthly: d.workClothesBudgetMonthly,
    dryCleaningMonthly: 30,
    coffeeAtWorkDaily: d.coffeeAtWorkDaily,

    // Time
    hourlyRate: d.hourlyRate,

    // Environmental
    includeEnvironmentalImpact: true,

    currency,
  };
}
