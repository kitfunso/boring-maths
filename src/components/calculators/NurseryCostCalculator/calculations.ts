/**
 * UK Nursery Cost Calculator - Calculations
 *
 * Calculation logic for UK childcare costs, free hours eligibility,
 * Tax-Free Childcare, and Universal Credit childcare element.
 */

import type {
  NurseryCostInputs,
  NurseryCostResult,
  ChildCostBreakdown,
  UKRegion,
  ChildAge,
} from './types';

// =============================================================================
// CONSTANTS - 2025/26 RATES
// =============================================================================

/**
 * Average hourly nursery rates by region and age (2025)
 * Source: Daynurseries.co.uk, Coram Family and Childcare Survey
 */
export const HOURLY_RATES: Record<UKRegion, Record<ChildAge, number>> = {
  'inner-london': {
    'under-2': 9.5,
    '2-years': 9.0,
    '3-4-years': 8.5,
  },
  'outer-london': {
    'under-2': 8.0,
    '2-years': 7.5,
    '3-4-years': 7.0,
  },
  'south-east': {
    'under-2': 7.5,
    '2-years': 7.0,
    '3-4-years': 6.5,
  },
  'rest-of-uk': {
    'under-2': 6.5,
    '2-years': 6.0,
    '3-4-years': 5.5,
  },
};

/**
 * Free hours eligibility thresholds (2025/26)
 */
export const FREE_HOURS = {
  /** Universal 15 hours for all 3-4 year olds */
  UNIVERSAL_15: 15,
  /** 30 hours for working parents */
  WORKING_30: 30,
  /** Minimum income per parent for working entitlement (16 hrs x NMW) */
  MIN_INCOME_PER_PARENT: 10158, // £195/week x 52
  /** Maximum income per parent */
  MAX_INCOME_PER_PARENT: 100000,
  /** UC income threshold for 2-year-old 15 hours */
  UC_INCOME_THRESHOLD_2YO: 15400,
  /** Term weeks per year */
  TERM_WEEKS: 38,
};

/**
 * Tax-Free Childcare limits (2025/26)
 */
export const TAX_FREE_CHILDCARE = {
  /** Maximum government contribution per child per year */
  MAX_CONTRIBUTION: 2000,
  /** Maximum for disabled child */
  MAX_CONTRIBUTION_DISABLED: 4000,
  /** Government pays £2 for every £8 deposited (20%) */
  RATE: 0.2,
  /** Minimum income per parent (per quarter) */
  MIN_INCOME_QUARTERLY: 2539,
  /** Maximum income per parent */
  MAX_INCOME: 100000,
};

/**
 * Universal Credit childcare element (2025/26)
 */
export const UC_CHILDCARE = {
  /** Percentage of costs covered */
  COVERAGE_RATE: 0.85,
  /** Maximum per month for 1 child */
  MAX_ONE_CHILD: 1031.88,
  /** Maximum per month for 2+ children */
  MAX_TWO_PLUS: 1768.94,
};

// =============================================================================
// ELIGIBILITY CHECKS
// =============================================================================

/**
 * Check if eligible for 15 hours universal (all 3-4 year olds)
 */
export function isEligibleFor15HoursUniversal(age: ChildAge): boolean {
  return age === '3-4-years';
}

/**
 * Check if eligible for working parent free hours (15 or 30 hours)
 * From Sept 2025: 30 hours for 9 months to school age
 */
export function isEligibleForWorkingParentHours(
  employmentStatus: string,
  householdIncome: number,
  isSingleParent: boolean
): boolean {
  // Must be working
  if (employmentStatus === 'not-working') return false;
  if (employmentStatus === 'one-working' && !isSingleParent) return false;

  // Income thresholds
  const parentCount = isSingleParent ? 1 : 2;
  const incomePerParent = householdIncome / parentCount;

  // Each parent must earn at least £10,158/year but less than £100,000
  return (
    incomePerParent >= FREE_HOURS.MIN_INCOME_PER_PARENT &&
    incomePerParent < FREE_HOURS.MAX_INCOME_PER_PARENT
  );
}

/**
 * Check if eligible for 2-year-old 15 hours (low income on UC)
 */
export function isEligibleFor2YearOldHours(
  benefitStatus: string,
  householdIncome: number
): boolean {
  return (
    benefitStatus === 'universal-credit' && householdIncome <= FREE_HOURS.UC_INCOME_THRESHOLD_2YO
  );
}

/**
 * Check if eligible for Tax-Free Childcare
 */
export function isEligibleForTaxFreeChildcare(
  employmentStatus: string,
  householdIncome: number,
  benefitStatus: string,
  isSingleParent: boolean
): boolean {
  // Cannot use TFC if on UC or Tax Credits
  if (benefitStatus !== 'none') return false;

  // Must be working
  if (employmentStatus === 'not-working') return false;
  if (employmentStatus === 'one-working' && !isSingleParent) return false;

  // Income thresholds
  const parentCount = isSingleParent ? 1 : 2;
  const incomePerParent = householdIncome / parentCount;

  return (
    incomePerParent >= TAX_FREE_CHILDCARE.MIN_INCOME_QUARTERLY * 4 && // Annual
    incomePerParent < TAX_FREE_CHILDCARE.MAX_INCOME
  );
}

// =============================================================================
// COST CALCULATIONS
// =============================================================================

/**
 * Calculate free hours for a child based on eligibility
 */
export function calculateFreeHours(
  age: ChildAge,
  employmentStatus: string,
  householdIncome: number,
  benefitStatus: string,
  isSingleParent: boolean
): number {
  const isWorkingEligible = isEligibleForWorkingParentHours(
    employmentStatus,
    householdIncome,
    isSingleParent
  );

  // 3-4 year olds
  if (age === '3-4-years') {
    // All 3-4 year olds get 15 hours universal
    // Working parents get 30 hours
    return isWorkingEligible ? FREE_HOURS.WORKING_30 : FREE_HOURS.UNIVERSAL_15;
  }

  // 2 year olds
  if (age === '2-years') {
    // Working parents get 30 hours from Sept 2025
    if (isWorkingEligible) return FREE_HOURS.WORKING_30;
    // Low income on UC get 15 hours
    if (isEligibleFor2YearOldHours(benefitStatus, householdIncome)) {
      return FREE_HOURS.UNIVERSAL_15;
    }
    return 0;
  }

  // Under 2s (9 months+)
  if (age === 'under-2') {
    // Working parents get 30 hours from Sept 2025
    return isWorkingEligible ? FREE_HOURS.WORKING_30 : 0;
  }

  return 0;
}

/**
 * Calculate cost breakdown for a single child
 */
export function calculateChildCost(
  child: { id: string; age: ChildAge; hoursPerWeek: number; hasDisability: boolean },
  region: UKRegion,
  employmentStatus: string,
  householdIncome: number,
  benefitStatus: string,
  isSingleParent: boolean,
  weeksPerYear: number
): ChildCostBreakdown {
  const hourlyRate = HOURLY_RATES[region][child.age];
  const grossWeeklyCost = child.hoursPerWeek * hourlyRate;

  // Calculate free hours
  const maxFreeHours = calculateFreeHours(
    child.age,
    employmentStatus,
    householdIncome,
    benefitStatus,
    isSingleParent
  );

  // Free hours only apply for 38 term weeks
  // If using 52 weeks, free hours value is prorated
  const termWeeksRatio = Math.min(weeksPerYear, FREE_HOURS.TERM_WEEKS) / weeksPerYear;
  const effectiveFreeHours = Math.min(maxFreeHours, child.hoursPerWeek);
  const freeHoursPerWeek = effectiveFreeHours * termWeeksRatio;
  const freeHoursValue = freeHoursPerWeek * hourlyRate;

  const paidHoursPerWeek = child.hoursPerWeek - freeHoursPerWeek;
  const netWeeklyCost = paidHoursPerWeek * hourlyRate;

  const annualGrossCost = grossWeeklyCost * weeksPerYear;
  const annualFreeHoursValue = freeHoursValue * weeksPerYear;
  const annualNetCost = netWeeklyCost * weeksPerYear;

  return {
    childId: child.id,
    age: child.age,
    hoursPerWeek: child.hoursPerWeek,
    hourlyRate,
    grossWeeklyCost,
    freeHoursPerWeek: effectiveFreeHours,
    freeHoursValue,
    paidHoursPerWeek,
    netWeeklyCost,
    annualGrossCost,
    annualFreeHoursValue,
    annualNetCost,
  };
}

/**
 * Calculate Tax-Free Childcare contribution
 */
export function calculateTaxFreeChildcareContribution(
  children: Array<{ hasDisability: boolean }>,
  annualCostAfterFreeHours: number,
  eligible: boolean
): number {
  if (!eligible) return 0;

  // Government pays 20% up to max per child
  const maxContribution = children.reduce((sum, child) => {
    return (
      sum +
      (child.hasDisability
        ? TAX_FREE_CHILDCARE.MAX_CONTRIBUTION_DISABLED
        : TAX_FREE_CHILDCARE.MAX_CONTRIBUTION)
    );
  }, 0);

  const potentialContribution = annualCostAfterFreeHours * TAX_FREE_CHILDCARE.RATE;
  return Math.min(potentialContribution, maxContribution);
}

/**
 * Calculate Universal Credit childcare element
 */
export function calculateUCChildcareElement(
  childCount: number,
  monthlyCostAfterFreeHours: number,
  eligible: boolean
): number {
  if (!eligible || childCount === 0) return 0;

  const maxMonthly = childCount === 1 ? UC_CHILDCARE.MAX_ONE_CHILD : UC_CHILDCARE.MAX_TWO_PLUS;
  const potentialMonthly = monthlyCostAfterFreeHours * UC_CHILDCARE.COVERAGE_RATE;

  return Math.min(potentialMonthly, maxMonthly) * 12; // Annual amount
}

// =============================================================================
// MAIN CALCULATION
// =============================================================================

/**
 * Main calculation function - computes full childcare costs and support
 */
export function calculateNurseryCost(inputs: NurseryCostInputs): NurseryCostResult {
  const {
    region,
    children,
    employmentStatus,
    householdIncome,
    benefitStatus,
    useTaxFreeChildcare,
    weeksPerYear,
  } = inputs;

  const isSingleParent =
    employmentStatus === 'single-working' || employmentStatus === 'not-working';

  // Calculate per-child breakdowns
  const childBreakdowns = children.map((child) =>
    calculateChildCost(
      child,
      region,
      employmentStatus,
      householdIncome,
      benefitStatus,
      isSingleParent,
      weeksPerYear
    )
  );

  // Aggregate totals
  const totalGrossAnnualCost = childBreakdowns.reduce((sum, c) => sum + c.annualGrossCost, 0);
  const totalFreeHoursValue = childBreakdowns.reduce((sum, c) => sum + c.annualFreeHoursValue, 0);
  const costAfterFreeHours = totalGrossAnnualCost - totalFreeHoursValue;

  // Eligibility checks
  const eligibleFor15HoursUniversal = children.some((c) => c.age === '3-4-years');
  const eligibleFor15HoursWorking = isEligibleForWorkingParentHours(
    employmentStatus,
    householdIncome,
    isSingleParent
  );
  const eligibleFor30Hours = eligibleFor15HoursWorking;
  const eligibleFor15Hours2YearOld = isEligibleFor2YearOldHours(benefitStatus, householdIncome);
  const eligibleForTaxFreeChildcare =
    useTaxFreeChildcare &&
    isEligibleForTaxFreeChildcare(employmentStatus, householdIncome, benefitStatus, isSingleParent);
  const eligibleForUCChildcare = benefitStatus === 'universal-credit';

  // Calculate Tax-Free Childcare contribution
  const taxFreeChildcareContribution = calculateTaxFreeChildcareContribution(
    children,
    costAfterFreeHours,
    eligibleForTaxFreeChildcare
  );

  // Calculate UC childcare element (mutually exclusive with TFC)
  const monthlyAfterFreeHours = costAfterFreeHours / 12;
  const ucChildcareElement = eligibleForUCChildcare
    ? calculateUCChildcareElement(children.length, monthlyAfterFreeHours, true)
    : 0;

  // Use whichever is higher (can't use both)
  const supportAmount = Math.max(taxFreeChildcareContribution, ucChildcareElement);
  const actualTFC =
    eligibleForTaxFreeChildcare && !eligibleForUCChildcare ? taxFreeChildcareContribution : 0;
  const actualUC = eligibleForUCChildcare ? ucChildcareElement : 0;

  // Final costs
  const totalNetAnnualCost = Math.max(0, costAfterFreeHours - supportAmount);
  const monthlyNetCost = totalNetAnnualCost / 12;
  const weeklyNetCost = totalNetAnnualCost / weeksPerYear;

  const totalSavings = totalGrossAnnualCost - totalNetAnnualCost;
  const savingsPercentage = totalGrossAnnualCost > 0 ? totalSavings / totalGrossAnnualCost : 0;

  // Comparison scenarios
  const costWithoutSupport = totalGrossAnnualCost;
  const costWithFreeHoursOnly = costAfterFreeHours;
  const costWithTaxFree = Math.max(0, costAfterFreeHours - taxFreeChildcareContribution);

  return {
    totalGrossAnnualCost,
    totalFreeHoursValue,
    taxFreeChildcareContribution: actualTFC,
    ucChildcareElement: actualUC,
    totalNetAnnualCost,
    monthlyNetCost,
    weeklyNetCost,
    totalSavings,
    savingsPercentage,

    eligibleFor15HoursUniversal,
    eligibleFor15HoursWorking,
    eligibleFor30Hours,
    eligibleFor15Hours2YearOld,
    eligibleForTaxFreeChildcare,
    eligibleForUCChildcare,

    childBreakdowns,

    costWithoutSupport,
    costWithFreeHoursOnly,
    costWithTaxFree,
  };
}

// =============================================================================
// FORMATTING HELPERS
// =============================================================================

/**
 * Format a number as GBP currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number as GBP currency with pence
 */
export function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as percentage
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format hours per week
 */
export function formatHours(hours: number): string {
  return `${hours.toFixed(0)} hrs/week`;
}
