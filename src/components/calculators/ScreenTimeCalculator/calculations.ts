/**
 * Screen Time Calculator - Calculation Logic
 */

import type { ScreenTimeInputs, ScreenTimeResult, OpportunityCost, AgeGroup } from './types';

/** Average daily screen time by age group (hours) */
const AGE_GROUP_AVERAGES: Readonly<Record<AgeGroup, number>> = {
  child: 4.5,
  teen: 7.0,
  adult: 6.5,
};

/** Remaining life expectancy by age group (years) */
const LIFE_EXPECTANCY_REMAINING: Readonly<Record<AgeGroup, number>> = {
  child: 70,
  teen: 63,
  adult: 50,
};

/** Hours required to complete each opportunity cost activity */
const OPPORTUNITY_HOURS = {
  book: 6,
  language: 600,
  marathon: 500,
  instrument: 1000,
  onlineCourse: 40,
  novel: 300,
} as const;

function round(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function buildOpportunityCosts(yearlyHours: number): readonly OpportunityCost[] {
  return [
    {
      activity: 'books you could read',
      count: Math.floor(yearlyHours / OPPORTUNITY_HOURS.book),
      icon: 'book',
    },
    {
      activity: 'languages you could learn',
      count: round(yearlyHours / OPPORTUNITY_HOURS.language, 1),
      icon: 'language',
    },
    {
      activity: 'marathons you could train for',
      count: round(yearlyHours / OPPORTUNITY_HOURS.marathon, 1),
      icon: 'marathon',
    },
    {
      activity: 'instruments you could learn',
      count: round(yearlyHours / OPPORTUNITY_HOURS.instrument, 1),
      icon: 'instrument',
    },
    {
      activity: 'online courses you could complete',
      count: Math.floor(yearlyHours / OPPORTUNITY_HOURS.onlineCourse),
      icon: 'course',
    },
    {
      activity: 'novels you could write',
      count: round(yearlyHours / OPPORTUNITY_HOURS.novel, 1),
      icon: 'novel',
    },
  ];
}

export function calculateScreenTime(inputs: ScreenTimeInputs): ScreenTimeResult {
  const { dailyHours, categories, ageGroup } = inputs;

  const weeklyHours = round(dailyHours * 7);
  const monthlyHours = round(dailyHours * 30.44);
  const yearlyHours = round(dailyHours * 365.25);
  const yearlyDays = round(yearlyHours / 24, 1);

  const remainingYears = LIFE_EXPECTANCY_REMAINING[ageGroup];
  const lifetimeHours = yearlyHours * remainingYears;
  const lifetimeYears = round(lifetimeHours / (365.25 * 24), 1);

  const opportunityCosts = buildOpportunityCosts(yearlyHours);

  const average = AGE_GROUP_AVERAGES[ageGroup];
  const comparedToAverage = average > 0 ? round(((dailyHours - average) / average) * 100) : 0;

  const totalCategoryHours = categories.reduce((sum, c) => sum + c.hours, 0);
  const productiveHours = categories
    .filter((c) => c.name === 'Productive')
    .reduce((sum, c) => sum + c.hours, 0);
  const productivePercent =
    totalCategoryHours > 0 ? round((productiveHours / totalCategoryHours) * 100) : 0;

  const categoryBreakdown = categories.map((c) => ({
    name: c.name,
    hours: c.hours,
    percent: totalCategoryHours > 0 ? round((c.hours / totalCategoryHours) * 100) : 0,
  }));

  return {
    weeklyHours,
    monthlyHours,
    yearlyHours,
    yearlyDays,
    lifetimeYears,
    opportunityCosts,
    comparedToAverage,
    productivePercent,
    categoryBreakdown,
  };
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

export function getAgeGroupAverage(ageGroup: AgeGroup): number {
  return AGE_GROUP_AVERAGES[ageGroup];
}
