/**
 * UK Nursery Cost Calculator Types
 *
 * TypeScript interfaces for childcare cost calculator inputs and results.
 */

export type UKRegion = 'inner-london' | 'outer-london' | 'south-east' | 'rest-of-uk';

export type ChildAge = 'under-2' | '2-years' | '3-4-years';

export type EmploymentStatus = 'both-working' | 'single-working' | 'one-working' | 'not-working';

export type BenefitStatus = 'none' | 'universal-credit' | 'tax-credits';

/**
 * Child information
 */
export interface ChildInfo {
  id: string;
  age: ChildAge;
  hoursPerWeek: number;
  hasDisability: boolean;
}

/**
 * Calculator Input State
 */
export interface NurseryCostInputs {
  /** UK region for cost estimation */
  region: UKRegion;
  /** Children information */
  children: ChildInfo[];
  /** Employment status of parent(s) */
  employmentStatus: EmploymentStatus;
  /** Combined household income */
  householdIncome: number;
  /** Whether receiving benefits */
  benefitStatus: BenefitStatus;
  /** Whether using Tax-Free Childcare */
  useTaxFreeChildcare: boolean;
  /** Number of weeks childcare is used per year (38 term time, 52 full year) */
  weeksPerYear: number;
}

/**
 * Breakdown per child
 */
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

/**
 * Calculator Result
 */
export interface NurseryCostResult {
  // =========================================================================
  // COSTS SUMMARY
  // =========================================================================

  /** Total gross annual cost before any support */
  totalGrossAnnualCost: number;

  /** Total value of free hours */
  totalFreeHoursValue: number;

  /** Tax-Free Childcare government contribution */
  taxFreeChildcareContribution: number;

  /** Universal Credit childcare element */
  ucChildcareElement: number;

  /** Total annual cost after all support */
  totalNetAnnualCost: number;

  /** Monthly cost after support */
  monthlyNetCost: number;

  /** Weekly cost after support */
  weeklyNetCost: number;

  /** Total savings from government support */
  totalSavings: number;

  /** Percentage saved */
  savingsPercentage: number;

  // =========================================================================
  // ELIGIBILITY
  // =========================================================================

  /** Eligible for 15 hours universal (3-4 year olds) */
  eligibleFor15HoursUniversal: boolean;

  /** Eligible for 15 hours working parents (9 months+) */
  eligibleFor15HoursWorking: boolean;

  /** Eligible for 30 hours working parents */
  eligibleFor30Hours: boolean;

  /** Eligible for 15 hours 2-year-old (low income) */
  eligibleFor15Hours2YearOld: boolean;

  /** Eligible for Tax-Free Childcare */
  eligibleForTaxFreeChildcare: boolean;

  /** Eligible for UC childcare element */
  eligibleForUCChildcare: boolean;

  // =========================================================================
  // PER-CHILD BREAKDOWN
  // =========================================================================

  /** Breakdown for each child */
  childBreakdowns: ChildCostBreakdown[];

  // =========================================================================
  // COMPARISON
  // =========================================================================

  /** Cost without any government support */
  costWithoutSupport: number;

  /** Cost with only free hours */
  costWithFreeHoursOnly: number;

  /** Cost with free hours + Tax-Free Childcare */
  costWithTaxFree: number;
}

/**
 * Default input values
 */
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

/**
 * Region labels for UI
 */
export const UK_REGION_LABELS: Record<UKRegion, string> = {
  'inner-london': 'Inner London',
  'outer-london': 'Outer London',
  'south-east': 'South East England',
  'rest-of-uk': 'Rest of UK',
};

/**
 * Child age labels for UI
 */
export const CHILD_AGE_LABELS: Record<ChildAge, string> = {
  'under-2': 'Under 2 years',
  '2-years': '2 years old',
  '3-4-years': '3-4 years old',
};

/**
 * Employment status labels for UI
 */
export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  'both-working': 'Both parents working',
  'single-working': 'Single parent working',
  'one-working': 'One parent working',
  'not-working': 'Not working',
};

/**
 * Benefit status labels for UI
 */
export const BENEFIT_STATUS_LABELS: Record<BenefitStatus, string> = {
  none: 'No benefits',
  'universal-credit': 'Universal Credit',
  'tax-credits': 'Tax Credits (legacy)',
};
