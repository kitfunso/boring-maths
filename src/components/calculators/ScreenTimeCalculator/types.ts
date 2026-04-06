/**
 * Screen Time Calculator - Type Definitions
 */

export type CategoryName = 'Social Media' | 'Video' | 'Games' | 'Productive' | 'Other';

export type AgeGroup = 'child' | 'teen' | 'adult';

export interface ScreenTimeCategory {
  readonly name: CategoryName;
  readonly hours: number;
}

export interface ScreenTimeInputs {
  readonly dailyHours: number;
  readonly categories: readonly ScreenTimeCategory[];
  readonly ageGroup: AgeGroup;
}

export interface OpportunityCost {
  readonly activity: string;
  readonly count: number;
  readonly icon: string;
}

export interface CategoryBreakdownItem {
  readonly name: CategoryName;
  readonly hours: number;
  readonly percent: number;
}

export interface ScreenTimeResult {
  readonly weeklyHours: number;
  readonly monthlyHours: number;
  readonly yearlyHours: number;
  readonly yearlyDays: number;
  readonly lifetimeYears: number;
  readonly opportunityCosts: readonly OpportunityCost[];
  readonly comparedToAverage: number;
  readonly productivePercent: number;
  readonly categoryBreakdown: readonly CategoryBreakdownItem[];
}

export const AGE_GROUPS: readonly { readonly value: AgeGroup; readonly label: string }[] = [
  { value: 'child', label: 'Child (6-12)' },
  { value: 'teen', label: 'Teen (13-17)' },
  { value: 'adult', label: 'Adult (18+)' },
];

export const DEFAULT_CATEGORIES: readonly CategoryName[] = [
  'Social Media',
  'Video',
  'Games',
  'Productive',
  'Other',
];

export function getDefaultInputs(): ScreenTimeInputs {
  return {
    dailyHours: 5,
    categories: [
      { name: 'Social Media', hours: 2 },
      { name: 'Video', hours: 1.5 },
      { name: 'Games', hours: 0.5 },
      { name: 'Productive', hours: 0.5 },
      { name: 'Other', hours: 0.5 },
    ],
    ageGroup: 'adult',
  };
}
