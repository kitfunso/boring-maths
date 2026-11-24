import { type Currency } from '../../../lib/regions';

export type WorkArrangement = 'full-remote' | 'hybrid' | 'office';

export type CommuteType = 'car' | 'public-transit' | 'mixed';

export interface RemoteWorkSavingsInputs {
  commuteType: CommuteType;
  commuteDistanceMiles: number;
  commuteTimeMinutes: number;
  officeDaysPerWeek: number;
  weeksPerYear: number;

  gasPricePerGallon: number;
  vehicleMpg: number;
  maintenanceCostPerMile: number;
  parkingCostDaily: number;
  tollsDaily: number;

  transitCostDaily: number;

  workLunchCostDaily: number;
  homeLunchCostDaily: number;
  workClothesBudgetMonthly: number;
  dryCleaningMonthly: number;
  coffeeAtWorkDaily: number;

  hourlyRate: number;

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
  treesEquivalent: number;
}

export interface TimeAnalysis {
  dailyCommuteMinutes: number;
  weeklyCommuteHours: number;
  annualCommuteHours: number;
  annualCommuteDays: number;
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
      gasPricePerGallon: 6.5,
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
    commuteDistanceMiles: 15,
    commuteTimeMinutes: 30,
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
