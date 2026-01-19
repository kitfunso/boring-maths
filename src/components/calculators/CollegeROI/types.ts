/**
 * College ROI Calculator - Type Definitions
 */

import type { Currency } from '../../../lib/regions';

export type EducationPath =
  | 'four_year'
  | 'community_college'
  | 'trade_school'
  | 'bootcamp'
  | 'direct_work';

export interface CollegeROIInputs {
  currency: Currency;
  educationPath: EducationPath;

  // College costs
  annualTuition: number;
  yearsOfStudy: number;
  scholarshipAmount: number;
  livingExpenses: number;

  // Career
  expectedStartingSalary: number;
  salaryGrowthRate: number;

  // Comparison baseline
  alternativeSalary: number; // what you'd earn without this education
  alternativeGrowthRate: number;

  // Financing
  loanInterestRate: number;
  loanRepaymentYears: number;

  // Analysis period
  careerYears: number;
}

export interface YearlyProjection {
  year: number;
  withEducation: {
    earnings: number;
    loanPayment: number;
    netIncome: number;
    cumulativeNet: number;
  };
  withoutEducation: {
    earnings: number;
    cumulativeNet: number;
  };
  advantage: number;
}

export interface CollegeROIResult {
  currency: Currency;

  // Total costs
  totalCost: number;
  totalLoanAmount: number;
  totalInterestPaid: number;
  monthlyLoanPayment: number;

  // ROI metrics
  paybackPeriod: number | null;
  lifetimeEarningsPremium: number;
  roi: number; // percentage return on investment
  netPresentValue: number;

  // Comparisons
  yearlyProjections: YearlyProjection[];

  // Summary
  breakEvenAge: number | null;
  opportunityCost: number;
  debtToIncomeRatio: number;

  // Insights
  worthIt: boolean;
  factors: string[];
}

export const EDUCATION_DEFAULTS: Record<
  Currency,
  Record<
    EducationPath,
    {
      tuition: number;
      years: number;
      startingSalary: number;
      growthRate: number;
    }
  >
> = {
  USD: {
    four_year: { tuition: 25000, years: 4, startingSalary: 55000, growthRate: 0.04 },
    community_college: { tuition: 5000, years: 2, startingSalary: 40000, growthRate: 0.035 },
    trade_school: { tuition: 15000, years: 1.5, startingSalary: 50000, growthRate: 0.03 },
    bootcamp: { tuition: 15000, years: 0.5, startingSalary: 65000, growthRate: 0.05 },
    direct_work: { tuition: 0, years: 0, startingSalary: 30000, growthRate: 0.025 },
  },
  GBP: {
    four_year: { tuition: 9250, years: 3, startingSalary: 28000, growthRate: 0.04 },
    community_college: { tuition: 3000, years: 2, startingSalary: 22000, growthRate: 0.035 },
    trade_school: { tuition: 8000, years: 1.5, startingSalary: 25000, growthRate: 0.03 },
    bootcamp: { tuition: 10000, years: 0.5, startingSalary: 35000, growthRate: 0.05 },
    direct_work: { tuition: 0, years: 0, startingSalary: 20000, growthRate: 0.025 },
  },
  EUR: {
    four_year: { tuition: 3000, years: 3, startingSalary: 32000, growthRate: 0.04 },
    community_college: { tuition: 1500, years: 2, startingSalary: 26000, growthRate: 0.035 },
    trade_school: { tuition: 6000, years: 1.5, startingSalary: 28000, growthRate: 0.03 },
    bootcamp: { tuition: 8000, years: 0.5, startingSalary: 40000, growthRate: 0.05 },
    direct_work: { tuition: 0, years: 0, startingSalary: 22000, growthRate: 0.025 },
  },
};

export function getDefaultInputs(currency: Currency = 'USD'): CollegeROIInputs {
  const defaults = EDUCATION_DEFAULTS[currency].four_year;
  const altDefaults = EDUCATION_DEFAULTS[currency].direct_work;

  return {
    currency,
    educationPath: 'four_year',
    annualTuition: defaults.tuition,
    yearsOfStudy: defaults.years,
    scholarshipAmount: 0,
    livingExpenses: currency === 'USD' ? 15000 : currency === 'GBP' ? 10000 : 12000,
    expectedStartingSalary: defaults.startingSalary,
    salaryGrowthRate: defaults.growthRate,
    alternativeSalary: altDefaults.startingSalary,
    alternativeGrowthRate: altDefaults.growthRate,
    loanInterestRate: currency === 'USD' ? 0.065 : currency === 'GBP' ? 0.045 : 0.04,
    loanRepaymentYears: 10,
    careerYears: 30,
  };
}

export const DEFAULT_INPUTS: CollegeROIInputs = getDefaultInputs('USD');
