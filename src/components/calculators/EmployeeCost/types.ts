/**
 * Employee Cost Calculator - Type Definitions
 *
 * Calculate the true cost of an employee including
 * salary, benefits, taxes, and overhead.
 */

import type { Currency } from '../../../lib/regions';

export interface EmployeeCostInputs {
  currency: Currency;

  /** Annual base salary */
  annualSalary: number;

  /** Health insurance (employer portion, annual) */
  healthInsurance: number;

  /** 401k/pension match (as percentage of salary) */
  retirementMatchPercent: number;

  /** Paid time off days per year */
  ptoDays: number;

  /** Payroll taxes (as percentage - FICA, unemployment, etc.) */
  payrollTaxPercent: number;

  /** Annual training and development budget */
  trainingBudget: number;

  /** Equipment and supplies (annual) */
  equipmentCost: number;

  /** Office space allocation (annual, per employee) */
  officeCost: number;

  /** Other benefits (life insurance, wellness, perks) */
  otherBenefits: number;

  /** Working hours per week */
  hoursPerWeek: number;

  /** Target profit margin on employee (for billable rate) */
  profitMarginPercent: number;
}

export interface CostBreakdown {
  category: string;
  annual: number;
  monthly: number;
  hourly: number;
  percentOfTotal: number;
}

export interface EmployeeCostResult {
  currency: Currency;

  /** Total annual cost to employer */
  totalAnnualCost: number;

  /** True hourly cost */
  trueHourlyCost: number;

  /** Monthly burden cost */
  monthlyBurdenCost: number;

  /** The multiplier over base salary (typically 1.25-1.4x) */
  burdenMultiplier: number;

  /** Cost breakdown by category */
  breakdown: CostBreakdown[];

  /** Billable rate needed to achieve profit margin */
  billableRate: number;

  /** Key metrics */
  costPerWorkingDay: number;
  actualWorkingHours: number; // After PTO
  effectiveHourlyRate: number; // Salary / actual hours

  /** Comparison */
  salaryVsTotalCost: {
    salary: number;
    benefits: number;
    taxes: number;
    overhead: number;
  };

  /** Insights */
  insights: string[];
}

/** Typical payroll tax rates by region */
export const PAYROLL_TAX_RATES: Record<Currency, number> = {
  USD: 7.65, // FICA (Social Security + Medicare)
  GBP: 13.8, // Employer's NI
  EUR: 20, // Varies by country, avg estimate
};

/** Typical employer health insurance costs */
export const HEALTH_INSURANCE_COSTS: Record<Currency, number> = {
  USD: 7500, // Average employer contribution
  GBP: 0, // NHS
  EUR: 3000, // Varies significantly
};

export function getDefaultInputs(currency: Currency = 'USD'): EmployeeCostInputs {
  const salaryMultiplier = currency === 'GBP' ? 0.75 : currency === 'EUR' ? 0.85 : 1;

  return {
    currency,
    annualSalary: Math.round(60000 * salaryMultiplier),
    healthInsurance: HEALTH_INSURANCE_COSTS[currency],
    retirementMatchPercent: currency === 'GBP' ? 3 : 4, // 401k match or pension
    ptoDays: currency === 'USD' ? 15 : currency === 'GBP' ? 28 : 25,
    payrollTaxPercent: PAYROLL_TAX_RATES[currency],
    trainingBudget: Math.round(1500 * salaryMultiplier),
    equipmentCost: Math.round(2000 * salaryMultiplier),
    officeCost: Math.round(6000 * salaryMultiplier),
    otherBenefits: Math.round(1000 * salaryMultiplier),
    hoursPerWeek: 40,
    profitMarginPercent: 30,
  };
}

export const DEFAULT_INPUTS: EmployeeCostInputs = getDefaultInputs('USD');
