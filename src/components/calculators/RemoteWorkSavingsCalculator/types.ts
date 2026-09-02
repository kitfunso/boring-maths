/** Remote Work Savings Calculator types: savings from working remotely vs commuting, covering gas, car wear, parking, food, clothing, and time value. */

import { type Currency } from '../../../lib/regions';

export type WorkArrangement = 'full-remote' | 'hybrid' | 'office';

export type CommuteType = 'car' | 'public-transit' | 'mixed';

export interface RemoteWorkSavingsInputs {
  commuteType: CommuteType;
  commuteDistanceMiles: number; // One-way distance
  commuteTimeMinutes: number; // One-way time
  officeDaysPerWeek: number; // Days commuting to office
  weeksPerYear: number; // Typically 48-50

  gasPricePerGallon: number;
  vehicleMpg: number;
  maintenanceCostPerMile: number; // Typically $0.05-0.10
  parkingCostDaily: number;
  tollsDaily: number;

  transitCostDaily: number;

  workLunchCostDaily: number; // Eating out vs home
  homeLunchCostDaily: number;
  workClothesBudgetMonthly: number;
  dryCleaningMonthly: number;
  coffeeAtWorkDaily: number;

  hourlyRate: number; // To calculate value of time saved

  includeEnvironmentalImpact: boolean;

  currency: Currency;
}

export interface SavingsBreakdown {
  gasSavings: number;
  maintenanceSavings: number;
  parkingSavings: number;
  tollsSavings: number;
  transitSavings: number;
  totalTransportSavings: number;

  foodSavings: number;
  clothingSavings: number;
  dryCleaningSavings: number;
  coffeeSavings: number;
  totalLifestyleSavings: number;

  commuteHoursSavedAnnual: number;
  timeValueSavings: number;

  totalAnnualSavings: number;
  totalMonthlySavings: number;
  totalDailySavings: number;

  effectiveHourlyRaise: number;
}

export interface EnvironmentalImpact {
  milesSavedAnnual: number;
  gallonsSavedAnnual: number;
  co2PoundsSavedAnnual: number;
  co2TonsSavedAnnual: number;
  treesEquivalent: number; // Number of trees to offset the same CO2
}

export interface TimeAnalysis {
  dailyCommuteMinutes: number; // Round trip
  weeklyCommuteHours: number;
  annualCommuteHours: number;
  annualCommuteDays: number; // In 8-hour workday equivalents
  valueOfTimeSaved: number;
}

export interface ArrangementComparison {
  officeCosts: number;
  remoteCosts: number;
  netSavings: number;
  savingsPercentage: number;
}

export interface RemoteWorkSavingsResult {
  savings: SavingsBreakdown;
  environmental: EnvironmentalImpact;
  time: TimeAnalysis;
  comparison: ArrangementComparison;
  currency: Currency;

  annualSavings: number;
  monthlySavings: number;
  effectiveRaise: number;
  hoursReclaimed: number;
}

export function getDefaultInputs(currency: Currency): RemoteWorkSavingsInputs {
  const defaults = {
    USD: {
      gasPricePerGallon: 3.5,
      parkingCostDaily: 15,
      transitCostDaily: 8,
      workLunchCostDaily: 15,
      homeLunchCostDaily: 5,
      workClothesBudgetMonthly: 100,
      coffeeAtWorkDaily: 5,
      hourlyRate: 35,
    },
    GBP: {
      gasPricePerGallon: 6.5, // UK petrol is expensive
      parkingCostDaily: 12,
      transitCostDaily: 10,
      workLunchCostDaily: 10,
      homeLunchCostDaily: 4,
      workClothesBudgetMonthly: 75,
      coffeeAtWorkDaily: 4,
      hourlyRate: 25,
    },
    EUR: {
      gasPricePerGallon: 5.5,
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
    commuteType: 'car',
    commuteDistanceMiles: 15, // One-way
    commuteTimeMinutes: 30, // One-way
    officeDaysPerWeek: 5,
    weeksPerYear: 48,

    gasPricePerGallon: d.gasPricePerGallon,
    vehicleMpg: 28,
    maintenanceCostPerMile: 0.08,
    parkingCostDaily: d.parkingCostDaily,
    tollsDaily: 0,

    transitCostDaily: d.transitCostDaily,

    workLunchCostDaily: d.workLunchCostDaily,
    homeLunchCostDaily: d.homeLunchCostDaily,
    workClothesBudgetMonthly: d.workClothesBudgetMonthly,
    dryCleaningMonthly: 30,
    coffeeAtWorkDaily: d.coffeeAtWorkDaily,

    hourlyRate: d.hourlyRate,

    includeEnvironmentalImpact: true,

    currency,
  };
}
