import type {
  NurseryCostInputs,
  NurseryCostResult,
  ChildCostBreakdown,
  UKRegion,
  ChildAge,
} from './types';

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

export const FREE_HOURS = {
  UNIVERSAL_15: 15,
  WORKING_30: 30,
  MIN_INCOME_PER_PARENT: 10574.72, // £2,643.68 per 3 months x 4
  MAX_INCOME_PER_PARENT: 100000,
  UC_INCOME_THRESHOLD_2YO: 15400,
  TERM_WEEKS: 38,
};

export const TAX_FREE_CHILDCARE = {
  MAX_CONTRIBUTION: 2000,
  MAX_CONTRIBUTION_DISABLED: 4000,
  RATE: 0.2,
  MIN_INCOME_QUARTERLY: 2643.68,
  MAX_INCOME: 100000,
};

export const UC_CHILDCARE = {
  COVERAGE_RATE: 0.85,
  MAX_ONE_CHILD: 1071.09,
  MAX_TWO_PLUS: 1836.16,
};

export function isEligibleFor15HoursUniversal(age: ChildAge): boolean {
  return age === '3-4-years';
}

export function isEligibleForWorkingParentHours(
  employmentStatus: string,
  householdIncome: number,
  isSingleParent: boolean
): boolean {
  if (employmentStatus === 'not-working') return false;
  if (employmentStatus === 'one-working' && !isSingleParent) return false;

  const parentCount = isSingleParent ? 1 : 2;
  const incomePerParent = householdIncome / parentCount;

  return (
    incomePerParent >= FREE_HOURS.MIN_INCOME_PER_PARENT &&
    incomePerParent < FREE_HOURS.MAX_INCOME_PER_PARENT
  );
}

export function isEligibleFor2YearOldHours(
  benefitStatus: string,
  householdIncome: number
): boolean {
  return (
    benefitStatus === 'universal-credit' && householdIncome <= FREE_HOURS.UC_INCOME_THRESHOLD_2YO
  );
}

export function isEligibleForTaxFreeChildcare(
  employmentStatus: string,
  householdIncome: number,
  benefitStatus: string,
  isSingleParent: boolean
): boolean {
  if (benefitStatus !== 'none') return false;

  if (employmentStatus === 'not-working') return false;
  if (employmentStatus === 'one-working' && !isSingleParent) return false;

  const parentCount = isSingleParent ? 1 : 2;
  const incomePerParent = householdIncome / parentCount;

  return (
    incomePerParent >= TAX_FREE_CHILDCARE.MIN_INCOME_QUARTERLY * 4 &&
    incomePerParent < TAX_FREE_CHILDCARE.MAX_INCOME
  );
}

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

  if (age === '3-4-years') {
    return isWorkingEligible ? FREE_HOURS.WORKING_30 : FREE_HOURS.UNIVERSAL_15;
  }

  if (age === '2-years') {
    if (isWorkingEligible) return FREE_HOURS.WORKING_30;
    if (isEligibleFor2YearOldHours(benefitStatus, householdIncome)) {
      return FREE_HOURS.UNIVERSAL_15;
    }
    return 0;
  }

  if (age === 'under-2') {
    return isWorkingEligible ? FREE_HOURS.WORKING_30 : 0;
  }

  return 0;
}

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

  const maxFreeHours = calculateFreeHours(
    child.age,
    employmentStatus,
    householdIncome,
    benefitStatus,
    isSingleParent
  );

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

export function calculateTaxFreeChildcareContribution(
  children: Array<{ hasDisability: boolean }>,
  annualCostAfterFreeHours: number,
  eligible: boolean
): number {
  if (!eligible) return 0;

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

export function calculateUCChildcareElement(
  childCount: number,
  monthlyCostAfterFreeHours: number,
  eligible: boolean
): number {
  if (!eligible || childCount === 0) return 0;

  const maxMonthly = childCount === 1 ? UC_CHILDCARE.MAX_ONE_CHILD : UC_CHILDCARE.MAX_TWO_PLUS;
  const potentialMonthly = monthlyCostAfterFreeHours * UC_CHILDCARE.COVERAGE_RATE;

  return Math.min(potentialMonthly, maxMonthly) * 12;
}

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

  const totalGrossAnnualCost = childBreakdowns.reduce((sum, c) => sum + c.annualGrossCost, 0);
  const totalFreeHoursValue = childBreakdowns.reduce((sum, c) => sum + c.annualFreeHoursValue, 0);
  const costAfterFreeHours = totalGrossAnnualCost - totalFreeHoursValue;

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

  const taxFreeChildcareContribution = calculateTaxFreeChildcareContribution(
    children,
    costAfterFreeHours,
    eligibleForTaxFreeChildcare
  );

  const monthlyAfterFreeHours = costAfterFreeHours / 12;
  const ucChildcareElement = eligibleForUCChildcare
    ? calculateUCChildcareElement(children.length, monthlyAfterFreeHours, true)
    : 0;

  const supportAmount = Math.max(taxFreeChildcareContribution, ucChildcareElement);
  const actualTFC =
    eligibleForTaxFreeChildcare && !eligibleForUCChildcare ? taxFreeChildcareContribution : 0;
  const actualUC = eligibleForUCChildcare ? ucChildcareElement : 0;

  const totalNetAnnualCost = Math.max(0, costAfterFreeHours - supportAmount);
  const monthlyNetCost = totalNetAnnualCost / 12;
  const weeklyNetCost = totalNetAnnualCost / weeksPerYear;

  const totalSavings = totalGrossAnnualCost - totalNetAnnualCost;
  const savingsPercentage = totalGrossAnnualCost > 0 ? totalSavings / totalGrossAnnualCost : 0;

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

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatHours(hours: number): string {
  return `${hours.toFixed(0)} hrs/week`;
}
