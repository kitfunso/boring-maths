/** UK Nursery Cost Calculator - type definitions for childcare cost inputs and results. */

export type UKRegion = 'inner-london' | 'outer-london' | 'south-east' | 'rest-of-uk';

export type ChildAge = 'under-2' | '2-years' | '3-4-years';

export type EmploymentStatus = 'both-working' | 'single-working' | 'one-working' | 'not-working';

export type BenefitStatus = 'none' | 'universal-credit' | 'tax-credits';

export interface ChildInfo {
  id: string;
  age: ChildAge;
  hoursPerWeek: number;
  hasDisability: boolean;
}

export interface NurseryCostInputs {
  region: UKRegion;
  children: ChildInfo[];
  employmentStatus: EmploymentStatus;
  householdIncome: number;
  benefitStatus: BenefitStatus;
  useTaxFreeChildcare: boolean;
  /** Number of weeks childcare is used per year (38 term time, 52 full year) */
  weeksPerYear: number;
}

export interface ChildCostBreakdown {
  childId: string;
  age: ChildAge;
  hoursPerWeek: number;
  hourlyRate: number;
  grossWeeklyCost: number;
  freeHoursPerWeek: number;
  freeHoursValue: number;
  paidHoursPerWeek: number;
  netWeeklyCost: number;
  annualGrossCost: number;
  annualFreeHoursValue: number;
  annualNetCost: number;
}

export interface NurseryCostResult {
  /** Total gross annual cost before any support */
  totalGrossAnnualCost: number;

  totalFreeHoursValue: number;

  taxFreeChildcareContribution: number;

  ucChildcareElement: number;

  /** Total annual cost after all support */
  totalNetAnnualCost: number;

  monthlyNetCost: number;

  weeklyNetCost: number;

  /** Total savings from government support */
  totalSavings: number;

  savingsPercentage: number;

  /** Eligible for 15 hours universal (3-4 year olds) */
  eligibleFor15HoursUniversal: boolean;

  /** Eligible for 15 hours working parents (9 months+) */
  eligibleFor15HoursWorking: boolean;

  /** Eligible for 30 hours working parents */
  eligibleFor30Hours: boolean;

  /** Eligible for 15 hours 2-year-old (low income) */
  eligibleFor15Hours2YearOld: boolean;

  eligibleForTaxFreeChildcare: boolean;

  eligibleForUCChildcare: boolean;

  childBreakdowns: ChildCostBreakdown[];

  costWithoutSupport: number;

  costWithFreeHoursOnly: number;

  costWithTaxFree: number;
}

export function getDefaultInputs(): NurseryCostInputs {
  return {
    region: 'rest-of-uk',
    children: [
      {
        id: '1',
        age: '2-years',
        hoursPerWeek: 30,
        hasDisability: false,
      },
    ],
    employmentStatus: 'both-working',
    householdIncome: 50000,
    benefitStatus: 'none',
    useTaxFreeChildcare: true,
    weeksPerYear: 38,
  };
}

export const UK_REGION_LABELS: Record<UKRegion, string> = {
  'inner-london': 'Inner London',
  'outer-london': 'Outer London',
  'south-east': 'South East England',
  'rest-of-uk': 'Rest of UK',
};

export const CHILD_AGE_LABELS: Record<ChildAge, string> = {
  'under-2': 'Under 2 years',
  '2-years': '2 years old',
  '3-4-years': '3-4 years old',
};

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  'both-working': 'Both parents working',
  'single-working': 'Single parent working',
  'one-working': 'One parent working',
  'not-working': 'Not working',
};

export const BENEFIT_STATUS_LABELS: Record<BenefitStatus, string> = {
  none: 'No benefits',
  'universal-credit': 'Universal Credit',
  'tax-credits': 'Tax Credits (legacy)',
};
