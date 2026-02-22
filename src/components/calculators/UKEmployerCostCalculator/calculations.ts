/**
 * UK Employer Cost Calculator - Calculation Logic
 * 2025/26 tax year
 */

import type { UKEmployerCostInputs, UKEmployerCostResult, SalaryComparisonRow } from './types';
import {
  EMPLOYER_NIC_2025,
  EMPLOYMENT_ALLOWANCE,
  AUTO_ENROLMENT,
  APPRENTICESHIP_LEVY,
} from './types';

/**
 * Calculate employer National Insurance contributions
 * 2025/26: 15% on earnings above £5,000
 */
function calculateEmployerNIC(grossSalary: number, useEmploymentAllowance: boolean): number {
  const { rate, threshold } = EMPLOYER_NIC_2025;

  if (grossSalary <= threshold) return 0;

  let nic = (grossSalary - threshold) * rate;

  if (useEmploymentAllowance) {
    nic = Math.max(0, nic - EMPLOYMENT_ALLOWANCE);
  }

  return nic;
}

/**
 * Calculate employer auto-enrolment pension contribution
 * Based on qualifying earnings between lower and upper limits
 */
function calculatePensionContribution(grossSalary: number, pensionRate: number): number {
  if (pensionRate <= 0) return 0;

  const { lowerLimit, upperLimit } = AUTO_ENROLMENT;

  if (grossSalary <= lowerLimit) return 0;

  const qualifyingEarnings = Math.min(grossSalary, upperLimit) - lowerLimit;
  return Math.max(0, qualifyingEarnings) * (pensionRate / 100);
}

/**
 * Calculate apprenticeship levy
 * 0.5% of total pay bill, minus £15,000 allowance
 */
function calculateApprenticeshipLevy(grossSalary: number): number {
  const levy = grossSalary * APPRENTICESHIP_LEVY.rate - APPRENTICESHIP_LEVY.allowance;
  return Math.max(0, levy);
}

/**
 * Main calculation function for a single salary
 */
export function calculateEmployerCost(inputs: UKEmployerCostInputs): UKEmployerCostResult {
  const { grossSalary, pensionRate, includeApprenticeshipLevy, includeEmploymentAllowance } =
    inputs;

  const employerNIC = calculateEmployerNIC(grossSalary, includeEmploymentAllowance);
  const pensionContribution = calculatePensionContribution(grossSalary, pensionRate);
  const apprenticeshipLevy = includeApprenticeshipLevy
    ? calculateApprenticeshipLevy(grossSalary)
    : 0;

  const totalEmployerCost = grossSalary + employerNIC + pensionContribution + apprenticeshipLevy;

  const hiddenCostPercentage =
    grossSalary > 0 ? ((totalEmployerCost - grossSalary) / grossSalary) * 100 : 0;

  const employerNICRate = grossSalary > 0 ? (employerNIC / grossSalary) * 100 : 0;

  return {
    grossSalary,
    employerNIC: round(employerNIC),
    employerNICRate: round(employerNICRate, 1),
    pensionContribution: round(pensionContribution),
    apprenticeshipLevy: round(apprenticeshipLevy),
    totalEmployerCost: round(totalEmployerCost),
    hiddenCostPercentage: round(hiddenCostPercentage, 1),
    monthlySalary: round(grossSalary / 12),
    monthlyNIC: round(employerNIC / 12),
    monthlyPension: round(pensionContribution / 12),
    monthlyLevy: round(apprenticeshipLevy / 12),
    monthlyTotal: round(totalEmployerCost / 12),
  };
}

/**
 * Generate comparison table for multiple salary levels
 */
export function calculateComparisonTable(
  salaries: number[],
  inputs: UKEmployerCostInputs
): SalaryComparisonRow[] {
  return salaries.map((salary) => {
    const result = calculateEmployerCost({ ...inputs, grossSalary: salary });
    return {
      salary,
      employerNIC: result.employerNIC,
      pension: result.pensionContribution,
      levy: result.apprenticeshipLevy,
      totalCost: result.totalEmployerCost,
      hiddenCostPct: result.hiddenCostPercentage,
    };
  });
}

/**
 * Round to specified decimal places
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Format a number as GBP currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
