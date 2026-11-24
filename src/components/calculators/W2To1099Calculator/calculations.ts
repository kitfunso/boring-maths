import type { Currency } from '../../../lib/regions';
import type { W2To1099CalculatorInputs, W2To1099CalculatorResult, CostBreakdown } from './types';
import {
  SOCIAL_SECURITY_SE_RATE,
  MEDICARE_SE_RATE,
  SE_TAX_BASE_MULTIPLIER,
  EMPLOYER_FICA_RATE,
  STANDARD_ANNUAL_HOURS,
  WORKING_DAYS_PER_YEAR,
  BILLABLE_HOURS_RATIO,
  MONTHLY_BUSINESS_EXPENSES,
} from './types';
import {
  EMPLOYEE_MEDICARE_RATE,
  EMPLOYEE_SOCIAL_SECURITY_RATE,
  SOCIAL_SECURITY_WAGE_BASE_2026,
} from '../../../lib/us-tax-2026';

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

  const baseSalary = inputMode === 'hourly' ? w2HourlyRate * STANDARD_ANNUAL_HOURS : w2AnnualSalary;

  const baseHourly = inputMode === 'salary' ? w2AnnualSalary / STANDARD_ANNUAL_HOURS : w2HourlyRate;

  if (baseSalary <= 0) {
    return getEmptyResult();
  }

  const employerFicaLoss =
    baseSalary <= SOCIAL_SECURITY_WAGE_BASE_2026
      ? baseSalary * EMPLOYER_FICA_RATE
      : SOCIAL_SECURITY_WAGE_BASE_2026 * EMPLOYEE_SOCIAL_SECURITY_RATE +
        baseSalary * EMPLOYEE_MEDICARE_RATE;

  const seIncome = baseSalary * SE_TAX_BASE_MULTIPLIER;
  const selfEmploymentTax =
    Math.min(seIncome, SOCIAL_SECURITY_WAGE_BASE_2026) * SOCIAL_SECURITY_SE_RATE +
    seIncome * MEDICARE_SE_RATE;

  const healthInsuranceCost = healthInsuranceMonthly * 12;

  const retirementMatchLoss = baseSalary * (retirement401kMatch / 100);

  const dailyRate = baseSalary / WORKING_DAYS_PER_YEAR;
  const ptoValue = dailyRate * ptoDays;

  const otherBenefitsLoss = otherBenefitsAnnual;

  const businessExpenses = MONTHLY_BUSINESS_EXPENSES * 12;

  const totalW2Value =
    baseSalary +
    employerFicaLoss +
    healthInsuranceCost +
    retirementMatchLoss +
    ptoValue +
    otherBenefitsLoss;

  const totalAdditionalCosts =
    selfEmploymentTax +
    healthInsuranceCost +
    retirementMatchLoss +
    ptoValue +
    otherBenefitsLoss +
    businessExpenses;

  const annualBillableHours = STANDARD_ANNUAL_HOURS * BILLABLE_HOURS_RATIO;

  const equivalent1099Annual = (baseSalary + totalAdditionalCosts) / BILLABLE_HOURS_RATIO;
  const equivalent1099Hourly = equivalent1099Annual / STANDARD_ANNUAL_HOURS;

  const multiplier = equivalent1099Hourly / baseHourly;

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

export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatHourlyRate(value: number, currency: Currency = 'USD'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted}/hr`;
}

export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`;
}
