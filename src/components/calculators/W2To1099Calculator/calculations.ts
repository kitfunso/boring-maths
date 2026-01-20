/**
 * W2 to 1099 Calculator - Calculation Logic
 *
 * Converts W2 employee compensation to equivalent 1099 contractor rate.
 * Accounts for:
 * - Self-employment tax (15.3% on 92.35% of income)
 * - Loss of employer FICA (7.65%)
 * - Health insurance costs
 * - Retirement match loss
 * - PTO value
 * - Business expenses
 */

import type { Currency } from '../../../lib/regions';
import type { W2To1099CalculatorInputs, W2To1099CalculatorResult, CostBreakdown } from './types';
import {
  SELF_EMPLOYMENT_TAX_RATE,
  SE_TAX_BASE_MULTIPLIER,
  EMPLOYER_FICA_RATE,
  SS_WAGE_BASE,
  STANDARD_ANNUAL_HOURS,
  WORKING_DAYS_PER_YEAR,
  BILLABLE_HOURS_RATIO,
  MONTHLY_BUSINESS_EXPENSES,
} from './types';

/**
 * Calculate the equivalent 1099 rate from W2 compensation
 */
export function calculateW2To1099(inputs: W2To1099CalculatorInputs): W2To1099CalculatorResult {
  const {
    inputMode,
    w2HourlyRate,
    w2AnnualSalary,
    healthInsuranceMonthly,
    retirement401kMatch,
    ptoDays,
    otherBenefitsAnnual,
  } = inputs;

  // Calculate base salary from input mode
  const baseSalary = inputMode === 'hourly' ? w2HourlyRate * STANDARD_ANNUAL_HOURS : w2AnnualSalary;

  const baseHourly = inputMode === 'salary' ? w2AnnualSalary / STANDARD_ANNUAL_HOURS : w2HourlyRate;

  if (baseSalary <= 0) {
    return getEmptyResult();
  }

  // Calculate employer FICA (what employer pays for W2 employee)
  // 7.65% up to SS wage base, then 1.45% Medicare only above
  const employerFicaLoss =
    baseSalary <= SS_WAGE_BASE
      ? baseSalary * EMPLOYER_FICA_RATE
      : SS_WAGE_BASE * 0.062 + baseSalary * 0.0145;

  // Calculate self-employment tax (what contractor pays)
  // 15.3% on 92.35% of net self-employment income
  const seIncome = baseSalary * SE_TAX_BASE_MULTIPLIER;
  const selfEmploymentTax = Math.min(seIncome, SS_WAGE_BASE) * SELF_EMPLOYMENT_TAX_RATE;

  // Health insurance cost (annual)
  const healthInsuranceCost = healthInsuranceMonthly * 12;

  // Retirement match loss (employer contribution)
  const retirementMatchLoss = baseSalary * (retirement401kMatch / 100);

  // PTO value (paid time off as compensation)
  const dailyRate = baseSalary / WORKING_DAYS_PER_YEAR;
  const ptoValue = dailyRate * ptoDays;

  // Other benefits loss
  const otherBenefitsLoss = otherBenefitsAnnual;

  // Business expenses (annual)
  const businessExpenses = MONTHLY_BUSINESS_EXPENSES * 12;

  // Total W2 value (salary + benefits)
  const totalW2Value =
    baseSalary +
    employerFicaLoss +
    healthInsuranceCost +
    retirementMatchLoss +
    ptoValue +
    otherBenefitsLoss;

  // Total additional costs as contractor
  const totalAdditionalCosts =
    selfEmploymentTax +
    healthInsuranceCost +
    retirementMatchLoss +
    ptoValue +
    otherBenefitsLoss +
    businessExpenses;

  // Billable hours (accounting for non-billable time)
  const annualBillableHours = STANDARD_ANNUAL_HOURS * BILLABLE_HOURS_RATIO;

  // Calculate equivalent 1099 rate
  // Contractor needs to cover: base salary + all additional costs
  // Divided by billable hours ratio to account for non-billable time
  const equivalent1099Annual = (baseSalary + totalAdditionalCosts) / BILLABLE_HOURS_RATIO;
  const equivalent1099Hourly = equivalent1099Annual / STANDARD_ANNUAL_HOURS;

  // Calculate multiplier
  const multiplier = equivalent1099Hourly / baseHourly;

  // Build breakdown for display
  const breakdown: CostBreakdown[] = [
    {
      label: 'Base Salary',
      w2Value: baseSalary,
      contractorCost: baseSalary,
      note: 'Your base compensation',
    },
    {
      label: 'Self-Employment Tax',
      w2Value: 0,
      contractorCost: selfEmploymentTax,
      note: '15.3% on 92.35% of income (SS + Medicare)',
    },
    {
      label: 'Employer FICA (lost)',
      w2Value: employerFicaLoss,
      contractorCost: 0,
      note: '7.65% employer pays for W2 employees',
    },
    {
      label: 'Health Insurance',
      w2Value: healthInsuranceCost,
      contractorCost: healthInsuranceCost,
      note: 'Employer-provided vs self-funded',
    },
    {
      label: '401k Match',
      w2Value: retirementMatchLoss,
      contractorCost: retirementMatchLoss,
      note: `${retirement401kMatch}% employer contribution`,
    },
    {
      label: 'PTO Value',
      w2Value: ptoValue,
      contractorCost: ptoValue,
      note: `${ptoDays} days paid time off`,
    },
    {
      label: 'Other Benefits',
      w2Value: otherBenefitsLoss,
      contractorCost: otherBenefitsLoss,
      note: 'Dental, vision, life insurance, etc.',
    },
    {
      label: 'Business Expenses',
      w2Value: 0,
      contractorCost: businessExpenses,
      note: 'Software, equipment, accounting, etc.',
    },
  ];

  return {
    w2HourlyRate: baseHourly,
    w2AnnualSalary: baseSalary,
    equivalent1099Hourly: Math.round(equivalent1099Hourly * 100) / 100,
    equivalent1099Annual: Math.round(equivalent1099Annual),
    multiplier: Math.round(multiplier * 100) / 100,
    selfEmploymentTax: Math.round(selfEmploymentTax),
    employerFicaLoss: Math.round(employerFicaLoss),
    healthInsuranceCost: Math.round(healthInsuranceCost),
    retirementMatchLoss: Math.round(retirementMatchLoss),
    ptoValue: Math.round(ptoValue),
    otherBenefitsLoss: Math.round(otherBenefitsLoss),
    businessExpenses: Math.round(businessExpenses),
    totalW2Value: Math.round(totalW2Value),
    totalAdditionalCosts: Math.round(totalAdditionalCosts),
    billableHoursRatio: BILLABLE_HOURS_RATIO,
    annualBillableHours: Math.round(annualBillableHours),
    breakdown,
  };
}

function getEmptyResult(): W2To1099CalculatorResult {
  return {
    w2HourlyRate: 0,
    w2AnnualSalary: 0,
    equivalent1099Hourly: 0,
    equivalent1099Annual: 0,
    multiplier: 0,
    selfEmploymentTax: 0,
    employerFicaLoss: 0,
    healthInsuranceCost: 0,
    retirementMatchLoss: 0,
    ptoValue: 0,
    otherBenefitsLoss: 0,
    businessExpenses: 0,
    totalW2Value: 0,
    totalAdditionalCosts: 0,
    billableHoursRatio: BILLABLE_HOURS_RATIO,
    annualBillableHours: 0,
    breakdown: [],
  };
}

/**
 * Format currency in USD
 */
export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format hourly rate
 */
export function formatHourlyRate(value: number, currency: Currency = 'USD'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted}/hr`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format multiplier
 */
export function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`;
}
