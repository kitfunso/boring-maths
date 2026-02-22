/**
 * UK Employer Cost Calculator Types
 * 2025/26 tax year rates for employer NIC, auto-enrolment pension, and apprenticeship levy
 */

export type TaxRegion = 'england' | 'scotland';

export interface UKEmployerCostInputs {
  grossSalary: number;
  taxRegion: TaxRegion;
  pensionRate: number; // percentage 0-25
  includeApprenticeshipLevy: boolean;
  includeEmploymentAllowance: boolean;
}

export interface UKEmployerCostResult {
  grossSalary: number;
  employerNIC: number;
  employerNICRate: number; // effective rate as percentage
  pensionContribution: number;
  apprenticeshipLevy: number;
  totalEmployerCost: number;
  hiddenCostPercentage: number;
  monthlySalary: number;
  monthlyNIC: number;
  monthlyPension: number;
  monthlyLevy: number;
  monthlyTotal: number;
}

export interface SalaryComparisonRow {
  salary: number;
  employerNIC: number;
  pension: number;
  levy: number;
  totalCost: number;
  hiddenCostPct: number;
}

export function getDefaultInputs(): UKEmployerCostInputs {
  return {
    grossSalary: 60000,
    taxRegion: 'england',
    pensionRate: 3,
    includeApprenticeshipLevy: false,
    includeEmploymentAllowance: false,
  };
}

// 2025/26 Employer National Insurance rates (from April 2025)
export const EMPLOYER_NIC_2025 = {
  rate: 0.15, // 15% (up from 13.8%)
  threshold: 5000, // Secondary threshold: £5,000 (down from £9,100)
};

// Employment Allowance for eligible small employers
export const EMPLOYMENT_ALLOWANCE = 10500;

// Auto-enrolment qualifying earnings band 2025/26
export const AUTO_ENROLMENT = {
  lowerLimit: 6240,
  upperLimit: 50270,
  minimumEmployerRate: 0.03, // 3% minimum
};

// Apprenticeship Levy 2025/26
export const APPRENTICESHIP_LEVY = {
  rate: 0.005, // 0.5% of total pay bill
  allowance: 15000, // £15,000 annual allowance
};

// Default salary levels for comparison table
export const COMPARISON_SALARIES = [25000, 35000, 50000, 60000, 80000, 100000];
