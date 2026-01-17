/**
 * Contractor vs Employee Calculator - Calculation Logic
 *
 * Compares true total compensation between contractor/freelance and
 * full-time employment, accounting for hidden costs and benefits.
 *
 * Key factors:
 * - Self-employment tax (additional 7.65% employer portion)
 * - Health insurance cost differential
 * - Retirement match value
 * - PTO value (paid time off as compensation)
 * - Business expenses
 */

import { type Currency, getCurrencySymbol } from '../../../lib/regions';
import {
  type ContractorVsEmployeeInputs,
  type ContractorVsEmployeeResult,
  type CompensationBreakdown,
  type ComparisonMetrics,
  type LineItem,
  type EmploymentType,
} from './types';

/**
 * Standard work hours for comparison
 */
const STANDARD_WORK_HOURS_PER_WEEK = 40;
const STANDARD_WORK_WEEKS_PER_YEAR = 52;

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
    federalTaxBracket,
    stateTaxRate,
    selfEmploymentTaxRate,
  } = inputs;

  // Gross income
  const annualBillableHours = contractorBillableHoursPerWeek * contractorWeeksPerYear;
  const grossIncome = contractorHourlyRate * annualBillableHours;

  // Costs
  const healthInsuranceCost = contractorHealthInsuranceMonthly * 12;
  const businessExpenses = contractorBusinessExpensesMonthly * 12;
  const professionalServices = contractorAccountingAnnual + contractorInsuranceAnnual;

  // Self-employment tax (on 92.35% of net self-employment income)
  const netSEIncome = grossIncome * 0.9235;
  const selfEmploymentTax = netSEIncome * selfEmploymentTaxRate;

  // Deductible half of SE tax
  const seTaxDeduction = selfEmploymentTax / 2;

  // Retirement contribution (as percentage of gross)
  const retirementContribution = grossIncome * (contractorRetirementContribPercent / 100);

  // Taxable income (after deductions)
  const taxableIncome = grossIncome - seTaxDeduction - retirementContribution - healthInsuranceCost;
  const incomeTax = taxableIncome * (federalTaxBracket + stateTaxRate);

  // Total costs
  const totalCosts =
    healthInsuranceCost +
    retirementContribution +
    businessExpenses +
    professionalServices +
    selfEmploymentTax +
    incomeTax;

  // Net income
  const netIncome = grossIncome - totalCosts;

  // Effective hourly rate (based on actual billable hours)
  const effectiveHourlyRate = netIncome / annualBillableHours;

  // Total compensation (gross + any benefits contractor might get - none typically)
  const totalCompensation = grossIncome;

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
    selfEmploymentTax,
    incomeTax,
    totalCompensation,
    totalCosts,
    netIncome,
    effectiveHourlyRate,
  };
}

/**
 * Calculate employee compensation breakdown
 */
function calculateEmployeeCompensation(
  inputs: ContractorVsEmployeeInputs
): CompensationBreakdown {
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
    federalTaxBracket,
    stateTaxRate,
  } = inputs;

  // Gross income
  const grossIncome = employeeSalary;
  const bonus = employeeSalary * (employeeBonusPercent / 100);

  // Benefits value
  const healthInsuranceValue = employerHealthInsuranceMonthly * 12;
  const dentalVisionValue = employerDentalVisionMonthly * 12;
  const lifeDisabilityValue = employerLifeDisabilityMonthly * 12;

  // 401k match value (assumes employee contributes enough to get full match)
  const maxMatchableContribution = employeeSalary * (employer401kMatchLimit / 100);
  const retirementMatchValue = maxMatchableContribution * (employer401kMatch / employer401kMatchLimit);

  // PTO value (daily rate × days)
  const dailyRate = employeeSalary / 260; // ~260 working days per year
  const ptoValue = dailyRate * (paidTimeOffDays + paidHolidaysDays);

  const otherBenefitsValue = otherBenefitsAnnual;

  const totalBenefitsValue =
    healthInsuranceValue +
    dentalVisionValue +
    lifeDisabilityValue +
    retirementMatchValue +
    ptoValue +
    otherBenefitsValue;

  // Total compensation
  const totalCompensation = grossIncome + bonus + totalBenefitsValue;

  // Employee costs (minimal - just taxes, employer pays FICA)
  const taxableIncome = grossIncome + bonus;
  const incomeTax = taxableIncome * (federalTaxBracket + stateTaxRate);

  // Employee FICA (7.65%)
  const employeeFica = Math.min(taxableIncome, 160200) * 0.0765; // 2023 SS cap

  const totalCosts = incomeTax + employeeFica;
  const netIncome = grossIncome + bonus - totalCosts;

  // Effective hourly rate
  const standardAnnualHours = STANDARD_WORK_HOURS_PER_WEEK * STANDARD_WORK_WEEKS_PER_YEAR;
  // Subtract PTO since it's paid but not worked
  const actualWorkHours = standardAnnualHours - (paidTimeOffDays + paidHolidaysDays) * 8;
  const effectiveHourlyRate = netIncome / actualWorkHours;

  return {
    grossIncome,
    bonus,
    healthInsuranceValue,
    retirementMatchValue,
    ptoValue,
    otherBenefitsValue: dentalVisionValue + lifeDisabilityValue + otherBenefitsValue,
    totalBenefitsValue,
    healthInsuranceCost: 0,
    retirementContribution: 0,
    businessExpenses: 0,
    professionalServices: 0,
    selfEmploymentTax: 0,
    incomeTax: incomeTax + employeeFica,
    totalCompensation,
    totalCosts,
    netIncome,
    effectiveHourlyRate,
  };
}

/**
 * Calculate comparison metrics
 */
function calculateComparison(
  contractor: CompensationBreakdown,
  employee: CompensationBreakdown,
  inputs: ContractorVsEmployeeInputs
): ComparisonMetrics {
  const { contractorHourlyRate, employeeSalary, contractorWeeksPerYear, contractorBillableHoursPerWeek } = inputs;

  // Determine winner based on total compensation value
  const contractorValue = contractor.totalCompensation - contractor.totalCosts + contractor.totalBenefitsValue;
  const employeeValue = employee.totalCompensation - employee.totalCosts;

  const winner: EmploymentType = contractorValue > employeeValue ? 'contractor' : 'employee';
  const annualDifference = Math.abs(contractorValue - employeeValue);
  const monthlyDifference = annualDifference / 12;
  const percentageDifference =
    (annualDifference / Math.min(contractorValue, employeeValue)) * 100;

  // Break-even contractor rate to match employee
  // Contractor needs to cover: employee total comp + SE tax + health insurance + business costs
  const contractorCostRatio =
    (contractor.healthInsuranceCost +
      contractor.businessExpenses +
      contractor.professionalServices +
      contractor.selfEmploymentTax) /
    contractor.grossIncome;

  const annualBillableHours = contractorBillableHoursPerWeek * contractorWeeksPerYear;
  const breakEvenContractRate =
    employee.totalCompensation / (annualBillableHours * (1 - contractorCostRatio - 0.1)); // 10% buffer

  // Break-even salary to match contractor
  // Employee salary that would equal contractor net value
  const breakEvenSalary = contractor.netIncome / 0.7; // Rough estimate accounting for benefits

  // Rate to salary multiplier
  const equivalentAnnualRate = contractorHourlyRate * 2080; // Standard work year
  const rateToSalaryMultiplier = equivalentAnnualRate / employeeSalary;

  // Recommended rate
  const recommendedContractRate = Math.ceil(breakEvenContractRate / 5) * 5; // Round to nearest $5

  return {
    winner,
    annualDifference,
    monthlyDifference,
    percentageDifference,
    breakEvenContractRate,
    breakEvenSalary,
    rateToSalaryMultiplier,
    recommendedContractRate,
  };
}

/**
 * Generate line items for detailed comparison
 */
function generateLineItems(
  contractor: CompensationBreakdown,
  employee: CompensationBreakdown
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
      label: 'Self-Employment Tax',
      contractor: -contractor.selfEmploymentTax,
      employee: 0,
      note: 'Additional 7.65% employer portion of FICA',
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

/**
 * Main calculation function
 */
export function calculateComparison_main(
  inputs: ContractorVsEmployeeInputs
): ContractorVsEmployeeResult {
  const contractor = calculateContractorCompensation(inputs);
  const employee = calculateEmployeeCompensation(inputs);
  const comparison = calculateComparison(contractor, employee, inputs);
  const lineItems = generateLineItems(contractor, employee);

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
export function getComparisonColor(contractorValue: number, employeeValue: number): {
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
 * Tax brackets by region
 */
export const TAX_BRACKETS_BY_REGION: Record<Currency, Array<{ rate: number; label: string; range: string }>> = {
  USD: [
    { rate: 0.10, label: '10%', range: '$0 - $11,000' },
    { rate: 0.12, label: '12%', range: '$11,001 - $44,725' },
    { rate: 0.22, label: '22%', range: '$44,726 - $95,375' },
    { rate: 0.24, label: '24%', range: '$95,376 - $183,000' },
    { rate: 0.32, label: '32%', range: '$183,001 - $231,250' },
    { rate: 0.35, label: '35%', range: '$231,251 - $578,125' },
    { rate: 0.37, label: '37%', range: '$578,126+' },
  ],
  GBP: [
    { rate: 0.00, label: '0%', range: '£0 - £12,570' },
    { rate: 0.20, label: '20%', range: '£12,571 - £50,270' },
    { rate: 0.40, label: '40%', range: '£50,271 - £125,140' },
    { rate: 0.45, label: '45%', range: '£125,141+' },
  ],
  EUR: [
    { rate: 0.00, label: '0%', range: '€0 - €10,000' },
    { rate: 0.14, label: '14%', range: '€10,001 - €15,000' },
    { rate: 0.24, label: '24%', range: '€15,001 - €28,000' },
    { rate: 0.34, label: '34%', range: '€28,001 - €55,000' },
    { rate: 0.42, label: '42%', range: '€55,001 - €75,000' },
    { rate: 0.45, label: '45%', range: '€75,001+' },
  ],
};

/**
 * Get tax brackets for a currency (for backwards compatibility)
 */
export function getTaxBrackets(currency: Currency) {
  return TAX_BRACKETS_BY_REGION[currency];
}

/**
 * Default US tax brackets (for backwards compatibility)
 */
export const TAX_BRACKETS = TAX_BRACKETS_BY_REGION.USD;

/**
 * Self-employment tax info by region
 */
export const SELF_EMPLOYMENT_TAX_INFO: Record<Currency, { rate: number; label: string }> = {
  USD: { rate: 0.153, label: 'Additional 7.65% FICA' },
  GBP: { rate: 0.09, label: 'Class 4 NICs' },
  EUR: { rate: 0.15, label: 'Social contributions (varies)' },
};
