/** Contractor vs employee: net pay plus benefits on each side; tax comes from taxModels.ts. */

import { type Currency, getCurrencySymbol } from '../../../lib/regions';
import {
  type ContractorVsEmployeeInputs,
  type ContractorVsEmployeeResult,
  type CompensationBreakdown,
  type ComparisonMetrics,
  type LineItem,
  type EmploymentType,
} from './types';
import { type TaxContext, contractorTax, employeeTax } from './taxModels';

/**
 * Standard work hours for comparison
 */
const STANDARD_WORK_HOURS_PER_WEEK = 40;
const STANDARD_WORK_WEEKS_PER_YEAR = 52;

// The suggested rate sits this far above break-even to cover unbilled weeks and late payers
const RATE_BUFFER = 0.1;

function taxContext(inputs: ContractorVsEmployeeInputs): TaxContext {
  return {
    currency: inputs.currency,
    filingStatus: inputs.filingStatus,
    stateTaxRate: inputs.currency === 'USD' ? inputs.stateTaxRate : 0,
    euCountry: inputs.euCountry,
    selfEmployedSocialRate: inputs.selfEmployedSocialRate,
  };
}

/**
 * Calculate contractor compensation breakdown
 */
function calculateContractorCompensation(
  inputs: ContractorVsEmployeeInputs
): CompensationBreakdown {
  const {
    contractorHourlyRate,
    contractorBillableHoursPerWeek,
    contractorWeeksPerYear,
    contractorHealthInsuranceMonthly,
    contractorRetirementContribPercent,
    contractorBusinessExpensesMonthly,
    contractorAccountingAnnual,
    contractorInsuranceAnnual,
  } = inputs;

  const annualBillableHours = contractorBillableHoursPerWeek * contractorWeeksPerYear;
  const grossIncome = contractorHourlyRate * annualBillableHours;

  const healthInsuranceCost = contractorHealthInsuranceMonthly * 12;
  const businessExpenses = contractorBusinessExpensesMonthly * 12;
  const professionalServices = contractorAccountingAnnual + contractorInsuranceAnnual;
  const retirementContribution = grossIncome * (contractorRetirementContribPercent / 100);

  // Accounting and liability insurance are business expenses, so tax falls on profit
  const profit = grossIncome - businessExpenses - professionalServices;
  const { socialTax, incomeTax } = contractorTax(
    profit,
    retirementContribution,
    healthInsuranceCost,
    taxContext(inputs)
  );

  const totalCosts =
    healthInsuranceCost +
    retirementContribution +
    businessExpenses +
    professionalServices +
    socialTax +
    incomeTax;
  const netIncome = grossIncome - totalCosts;

  return {
    grossIncome,
    bonus: 0,
    healthInsuranceValue: 0,
    retirementMatchValue: 0,
    ptoValue: 0,
    otherBenefitsValue: 0,
    totalBenefitsValue: 0,
    healthInsuranceCost,
    retirementContribution,
    businessExpenses,
    professionalServices,
    socialTax,
    incomeTax,
    totalCompensation: grossIncome,
    totalCosts,
    netIncome,
    effectiveHourlyRate: annualBillableHours > 0 ? netIncome / annualBillableHours : 0,
  };
}

/**
 * Calculate employee compensation breakdown
 */
function calculateEmployeeCompensation(inputs: ContractorVsEmployeeInputs): CompensationBreakdown {
  const {
    employeeSalary,
    employeeBonusPercent,
    employer401kMatch,
    employer401kMatchLimit,
    employerHealthInsuranceMonthly,
    employerDentalVisionMonthly,
    employerLifeDisabilityMonthly,
    paidTimeOffDays,
    paidHolidaysDays,
    otherBenefitsAnnual,
  } = inputs;

  const grossIncome = employeeSalary;
  const bonus = employeeSalary * (employeeBonusPercent / 100);

  const healthInsuranceValue = employerHealthInsuranceMonthly * 12;
  const dentalVisionValue = employerDentalVisionMonthly * 12;
  const lifeDisabilityValue = employerLifeDisabilityMonthly * 12;

  // 401k match value (assumes employee contributes enough to get full match)
  const maxMatchableContribution = employeeSalary * (employer401kMatchLimit / 100);
  const retirementMatchValue =
    employer401kMatchLimit > 0
      ? maxMatchableContribution * (employer401kMatch / employer401kMatchLimit)
      : 0;

  // PTO value (daily rate × days)
  const dailyRate = employeeSalary / 260; // ~260 working days per year
  const ptoValue = dailyRate * (paidTimeOffDays + paidHolidaysDays);

  const totalBenefitsValue =
    healthInsuranceValue +
    dentalVisionValue +
    lifeDisabilityValue +
    retirementMatchValue +
    ptoValue +
    otherBenefitsAnnual;

  const totalCompensation = grossIncome + bonus + totalBenefitsValue;

  const { socialTax, incomeTax } = employeeTax(grossIncome + bonus, taxContext(inputs));
  const totalCosts = socialTax + incomeTax;
  const netIncome = grossIncome + bonus - totalCosts;

  // Subtract PTO since it's paid but not worked
  const standardAnnualHours = STANDARD_WORK_HOURS_PER_WEEK * STANDARD_WORK_WEEKS_PER_YEAR;
  const actualWorkHours = standardAnnualHours - (paidTimeOffDays + paidHolidaysDays) * 8;

  return {
    grossIncome,
    bonus,
    healthInsuranceValue,
    retirementMatchValue,
    ptoValue,
    otherBenefitsValue: dentalVisionValue + lifeDisabilityValue + otherBenefitsAnnual,
    totalBenefitsValue,
    healthInsuranceCost: 0,
    retirementContribution: 0,
    businessExpenses: 0,
    professionalServices: 0,
    socialTax,
    incomeTax,
    totalCompensation,
    totalCosts,
    netIncome,
    effectiveHourlyRate: actualWorkHours > 0 ? netIncome / actualWorkHours : 0,
  };
}

const employeeValue = (e: CompensationBreakdown) => e.totalCompensation - e.totalCosts;

/** Smallest x >= 0 with f(x) >= target, for f increasing; 0 if f never gets there. */
function solveIncreasing(f: (x: number) => number, target: number, start: number): number {
  if (f(0) >= target) return 0;
  let hi = Math.max(1, start);
  for (let i = 0; f(hi) < target; i++) {
    if (i > 40) return 0;
    hi *= 2;
  }
  let lo = 0;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < target) lo = mid;
    else hi = mid;
  }
  return hi;
}

/**
 * Calculate comparison metrics
 */
function calculateComparison(
  contractor: CompensationBreakdown,
  employee: CompensationBreakdown,
  inputs: ContractorVsEmployeeInputs
): ComparisonMetrics {
  const { contractorHourlyRate, employeeSalary } = inputs;

  // A contractor has no benefits, so their value is net income
  const contractorValue = contractor.netIncome;
  const empValue = employeeValue(employee);

  const winner: EmploymentType = contractorValue > empValue ? 'contractor' : 'employee';
  const annualDifference = Math.abs(contractorValue - empValue);
  const smaller = Math.min(contractorValue, empValue);

  // Re-run the same tax models instead of guessing a cost ratio
  const breakEvenContractRate = solveIncreasing(
    (rate) => calculateContractorCompensation({ ...inputs, contractorHourlyRate: rate }).netIncome,
    empValue,
    contractorHourlyRate
  );
  const breakEvenSalary = solveIncreasing(
    (salary) => employeeValue(calculateEmployeeCompensation({ ...inputs, employeeSalary: salary })),
    contractorValue,
    employeeSalary
  );

  return {
    winner,
    annualDifference,
    monthlyDifference: annualDifference / 12,
    percentageDifference: smaller > 0 ? (annualDifference / smaller) * 100 : 0,
    breakEvenContractRate,
    breakEvenSalary,
    rateToSalaryMultiplier: employeeSalary > 0 ? (contractorHourlyRate * 2080) / employeeSalary : 0,
    recommendedContractRate: Math.ceil((breakEvenContractRate * (1 + RATE_BUFFER)) / 5) * 5,
  };
}

const SOCIAL_TAX_LABEL: Record<Currency, string> = {
  USD: 'Social Security & Medicare',
  GBP: 'National Insurance',
  EUR: 'Social Contributions',
};

/**
 * Generate line items for detailed comparison
 */
function generateLineItems(
  contractor: CompensationBreakdown,
  employee: CompensationBreakdown,
  currency: Currency
): LineItem[] {
  return [
    {
      label: 'Base Salary / Gross Revenue',
      contractor: contractor.grossIncome,
      employee: employee.grossIncome,
    },
    {
      label: 'Bonus',
      contractor: 0,
      employee: employee.bonus,
    },
    {
      label: 'Health Insurance (Value/Cost)',
      contractor: -contractor.healthInsuranceCost,
      employee: employee.healthInsuranceValue,
      note: 'Employee: Employer pays. Contractor: Self-funded',
    },
    {
      label: 'Retirement Match / Contribution',
      contractor: -contractor.retirementContribution,
      employee: employee.retirementMatchValue,
      note: 'Employee: Free match. Contractor: Self-funded',
    },
    {
      label: 'PTO Value',
      contractor: 0,
      employee: employee.ptoValue,
      note: 'Contractor unpaid time off already factored into weeks worked',
    },
    {
      label: 'Other Benefits',
      contractor: 0,
      employee: employee.otherBenefitsValue,
    },
    {
      label: SOCIAL_TAX_LABEL[currency],
      contractor: -contractor.socialTax,
      employee: -employee.socialTax,
      note: SOCIAL_TAX_INFO[currency].note,
    },
    {
      label: 'Business Expenses',
      contractor: -contractor.businessExpenses,
      employee: 0,
    },
    {
      label: 'Professional Services',
      contractor: -contractor.professionalServices,
      employee: 0,
      note: 'Accounting, insurance, legal',
    },
    {
      label: 'Income Tax',
      contractor: -contractor.incomeTax,
      employee: -employee.incomeTax,
    },
  ];
}

/** A cleared or partial entry ("-", "1e") parses to NaN; treat it as 0. */
const safe = (v: number): number => (Number.isFinite(v) ? v : 0);

/**
 * Coerce every numeric input to a finite value, leaving non-numeric fields intact.
 */
function sanitizeInputs(inputs: ContractorVsEmployeeInputs): ContractorVsEmployeeInputs {
  return {
    ...inputs,
    contractorHourlyRate: safe(inputs.contractorHourlyRate),
    contractorBillableHoursPerWeek: safe(inputs.contractorBillableHoursPerWeek),
    contractorWeeksPerYear: safe(inputs.contractorWeeksPerYear),
    employeeSalary: safe(inputs.employeeSalary),
    employeeBonusPercent: safe(inputs.employeeBonusPercent),
    employer401kMatch: safe(inputs.employer401kMatch),
    employer401kMatchLimit: safe(inputs.employer401kMatchLimit),
    employerHealthInsuranceMonthly: safe(inputs.employerHealthInsuranceMonthly),
    employerDentalVisionMonthly: safe(inputs.employerDentalVisionMonthly),
    employerLifeDisabilityMonthly: safe(inputs.employerLifeDisabilityMonthly),
    paidTimeOffDays: safe(inputs.paidTimeOffDays),
    paidHolidaysDays: safe(inputs.paidHolidaysDays),
    otherBenefitsAnnual: safe(inputs.otherBenefitsAnnual),
    contractorHealthInsuranceMonthly: safe(inputs.contractorHealthInsuranceMonthly),
    contractorRetirementContribPercent: safe(inputs.contractorRetirementContribPercent),
    contractorBusinessExpensesMonthly: safe(inputs.contractorBusinessExpensesMonthly),
    contractorAccountingAnnual: safe(inputs.contractorAccountingAnnual),
    contractorInsuranceAnnual: safe(inputs.contractorInsuranceAnnual),
    stateTaxRate: safe(inputs.stateTaxRate),
    selfEmployedSocialRate: safe(inputs.selfEmployedSocialRate),
  };
}

/**
 * Main calculation function
 */
export function calculateComparison_main(
  rawInputs: ContractorVsEmployeeInputs
): ContractorVsEmployeeResult {
  const inputs = sanitizeInputs(rawInputs);
  const contractor = calculateContractorCompensation(inputs);
  const employee = calculateEmployeeCompensation(inputs);
  const comparison = calculateComparison(contractor, employee, inputs);
  const lineItems = generateLineItems(contractor, employee, inputs.currency);

  const hoursWorkedContractor =
    inputs.contractorBillableHoursPerWeek * inputs.contractorWeeksPerYear;
  const hoursWorkedEmployee =
    STANDARD_WORK_HOURS_PER_WEEK * STANDARD_WORK_WEEKS_PER_YEAR -
    (inputs.paidTimeOffDays + inputs.paidHolidaysDays) * 8;

  return {
    contractor,
    employee,
    comparison,
    lineItems,
    currency: inputs.currency,
    contractorEffectiveRate: contractor.effectiveHourlyRate,
    employeeEffectiveRate: employee.effectiveHourlyRate,
    hoursWorkedContractor,
    hoursWorkedEmployee,
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
 * Format hourly rate
 */
export function formatHourlyRate(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}/hr`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get color class based on value comparison
 */
export function getComparisonColor(
  contractorValue: number,
  employeeValue: number
): {
  contractor: string;
  employee: string;
} {
  if (contractorValue > employeeValue) {
    return { contractor: 'text-green-400', employee: 'text-[var(--color-muted)]' };
  } else if (employeeValue > contractorValue) {
    return { contractor: 'text-[var(--color-muted)]', employee: 'text-green-400' };
  }
  return { contractor: 'text-[var(--color-cream)]', employee: 'text-[var(--color-cream)]' };
}

/**
 * What the social tax line means on each side, by currency
 */
export const SOCIAL_TAX_INFO: Record<Currency, { label: string; note: string }> = {
  USD: {
    label: '15.3% on 92.35% of profit',
    note: 'Contractor pays both halves of FICA. Employee pays 7.65%',
  },
  GBP: {
    label: 'Class 4: 6%, then 2%',
    note: 'Contractor: Class 4 on profit. Employee: Class 1 on pay',
  },
  EUR: {
    label: 'At the rate you enter',
    note: "Contractor: the rate you enter. Employee: the country's employee rate",
  },
};
