import type { FreelanceDayRateInputs, FreelanceDayRateResult } from './types';
import type { Currency } from '../../../lib/regions';
import {
  formatCurrency as formatCurrencyByRegion,
  formatPercentage as formatPercentageByRegion,
} from '../../../lib/regions';

const WEEKDAYS_PER_YEAR = 260;

const WORKING_DAYS_PER_MONTH = 21.67;

const WORKING_DAYS_PER_WEEK = 5;

const HOURS_PER_DAY = 8;

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function validateInputs(inputs: FreelanceDayRateInputs): void {
  const { annualSalary, taxRate, vacationDays, holidays, benefitsValue } = inputs;

  if (annualSalary < 0) {
    throw new Error('Annual salary cannot be negative');
  }

  if (annualSalary > 10000000) {
    throw new Error('Annual salary exceeds maximum allowed value');
  }

  if (taxRate < 0 || taxRate > 1) {
    throw new Error('Tax rate must be between 0% and 100%');
  }

  if (vacationDays < 0 || vacationDays > 365) {
    throw new Error('Vacation days must be between 0 and 365');
  }

  if (holidays < 0 || holidays > 365) {
    throw new Error('Holidays must be between 0 and 365');
  }

  if (benefitsValue < 0) {
    throw new Error('Benefits value cannot be negative');
  }

  const totalDaysOff = vacationDays + holidays;
  if (totalDaysOff >= WEEKDAYS_PER_YEAR) {
    throw new Error('Total days off cannot exceed working days in a year');
  }
}

export function calculateFreelanceDayRate(inputs: FreelanceDayRateInputs): FreelanceDayRateResult {
  validateInputs(inputs);

  const { currency, annualSalary, taxRate, vacationDays, holidays, benefitsValue } = inputs;

  const workingDays = WEEKDAYS_PER_YEAR - vacationDays - holidays;

  if (workingDays <= 0) {
    throw new Error('Not enough working days to calculate rate');
  }

  const totalCompensation = annualSalary + benefitsValue;

  const grossDayRate = totalCompensation / workingDays;

  const netDayRate = grossDayRate * (1 - taxRate);

  const hourlyRate = netDayRate / HOURS_PER_DAY;

  const weeklyIncome = netDayRate * WORKING_DAYS_PER_WEEK;
  const monthlyIncome = netDayRate * WORKING_DAYS_PER_MONTH;

  const freelancerAnnualNet = netDayRate * workingDays;
  const employeeAnnualNet = annualSalary * (1 - taxRate);

  return {
    currency,
    grossDayRate: round(grossDayRate),
    netDayRate: round(netDayRate),
    hourlyRate: round(hourlyRate),
    monthlyIncome: round(monthlyIncome),
    weeklyIncome: round(weeklyIncome),
    workingDays,
    annualComparison: {
      asEmployee: round(employeeAnnualNet),
      asFreelancer: round(freelancerAnnualNet),
      difference: round(freelancerAnnualNet - employeeAnnualNet),
    },
  };
}

export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}

export function formatPercentage(value: number, decimals: number = 0): string {
  return formatPercentageByRegion(value, decimals);
}

export function parseCurrency(value: string): number {
  let cleaned = value.replace(/[$£€\s]/g, '');

  if (cleaned.includes(',') && cleaned.includes('.')) {
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',') && !cleaned.includes('.')) {
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length === 3) {
      cleaned = cleaned.replace(',', '');
    } else {
      cleaned = cleaned.replace(',', '.');
    }
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
