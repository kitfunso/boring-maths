/**
 * 401k Calculator Types
 *
 * Calculate retirement savings with employer matching and compound growth.
 */

export interface Calculator401kInputs {
  currentAge: number;
  retirementAge: number;
  currentBalance: number;
  annualSalary: number;
  contributionPercent: number;
  employerMatchPercent: number;
  employerMatchLimit: number;
  annualReturn: number;
  salaryGrowth: number;
}

export interface Calculator401kResult {
  totalAtRetirement: number;
  totalContributions: number;
  employerContributions: number;
  investmentGrowth: number;
  yearlyBreakdown: YearlyData[];
  monthlyIncomeAt4Percent: number;
}

export interface YearlyData {
  age: number;
  salary: number;
  yourContribution: number;
  employerContribution: number;
  yearEndBalance: number;
}

export function getDefaultInputs(): Calculator401kInputs {
  return {
    currentAge: 30,
    retirementAge: 65,
    currentBalance: 50000,
    annualSalary: 75000,
    contributionPercent: 10,
    employerMatchPercent: 50,
    employerMatchLimit: 6,
    annualReturn: 7,
    salaryGrowth: 2,
  };
}
