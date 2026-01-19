/**
 * Salary to Hourly Calculator - Type Definitions
 *
 * Convert annual salary to true hourly rate, factoring in
 * actual hours worked, benefits value, and PTO.
 */

import type { Currency } from '../../../lib/regions';

/**
 * Input values for the Salary to Hourly Calculator
 */
export interface SalaryToHourlyInputs {
  /** Selected currency */
  currency: Currency;

  /** Annual salary */
  annualSalary: number;

  /** Actual hours worked per week (including unpaid overtime) */
  hoursPerWeek: number;

  /** PTO days per year */
  ptoDays: number;

  /** Paid holidays per year */
  paidHolidays: number;

  /** Annual value of benefits (health, 401k match, etc.) */
  benefitsValue: number;

  /** Include benefits in hourly rate calculation */
  includeBenefits: boolean;

  /** Weeks of unpaid time off (sick, personal) */
  unpaidTimeOff: number;
}

/**
 * Calculated results from the Salary to Hourly Calculator
 */
export interface SalaryToHourlyResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Standard hourly rate (40 hrs, 52 weeks) */
  standardHourlyRate: number;

  /** Actual hourly rate based on actual hours worked */
  actualHourlyRate: number;

  /** Hourly rate including benefits value */
  totalCompHourlyRate: number;

  /** Total compensation (salary + benefits) */
  totalCompensation: number;

  /** Actual hours worked per year */
  actualHoursPerYear: number;

  /** Standard hours per year (2080) */
  standardHoursPerYear: number;

  /** Extra hours worked per year (unpaid overtime) */
  extraHoursPerYear: number;

  /** Value of unpaid overtime (opportunity cost) */
  unpaidOvertimeValue: number;

  /** Daily rate */
  dailyRate: number;

  /** Weekly rate */
  weeklyRate: number;

  /** Monthly rate */
  monthlyRate: number;

  /** Per-paycheck amount (biweekly) */
  biweeklyRate: number;

  /** Value of each PTO day */
  ptoDayValue: number;

  /** Total PTO value per year */
  totalPtoValue: number;

  /** Effective weeks worked per year */
  effectiveWeeksWorked: number;

  /** Comparison to market rates */
  comparison: {
    hourlyAt40: number;
    hourlyAt45: number;
    hourlyAt50: number;
    hourlyAt55: number;
  };
}

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): SalaryToHourlyInputs {
  const salary = currency === 'GBP' ? 45000 : currency === 'EUR' ? 50000 : 65000;
  const pto = currency === 'GBP' ? 25 : currency === 'EUR' ? 28 : 15;
  const holidays = currency === 'GBP' ? 8 : currency === 'EUR' ? 10 : 10;
  const benefits = currency === 'GBP' ? 3000 : currency === 'EUR' ? 5000 : 12000;

  return {
    currency,
    annualSalary: salary,
    hoursPerWeek: 45,
    ptoDays: pto,
    paidHolidays: holidays,
    benefitsValue: benefits,
    includeBenefits: true,
    unpaidTimeOff: 0,
  };
}

/**
 * Default input values
 */
export const DEFAULT_INPUTS: SalaryToHourlyInputs = getDefaultInputs('USD');
