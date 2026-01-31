/**
 * UK Student Loan Calculator Types
 * Plan 1, 2, 4, 5 and Postgraduate Loans
 */

export type LoanPlan = 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgrad';

export interface UKStudentLoanInputs {
  loanBalance: number;
  annualSalary: number;
  salaryGrowth: number;
  loanPlan: LoanPlan;
}

export interface YearlyBreakdown {
  year: number;
  salary: number;
  repayment: number;
  interestCharged: number;
  balanceEnd: number;
}

export interface UKStudentLoanResult {
  monthlyRepayment: number;
  annualRepayment: number;
  yearsToRepay: number;
  totalRepaid: number;
  totalInterest: number;
  writeOffDate: number;
  amountWrittenOff: number;
  willRepayInFull: boolean;
  yearlyBreakdown: YearlyBreakdown[];
}

export function getDefaultInputs(): UKStudentLoanInputs {
  return {
    loanBalance: 50000,
    annualSalary: 35000,
    salaryGrowth: 3,
    loanPlan: 'plan2',
  };
}

// 2024/25 Student Loan thresholds and rates
// Interest rates updated based on prevailing market rate/RPI
export const LOAN_PLANS = {
  plan1: {
    name: 'Plan 1',
    description: 'Started before Sept 2012 (England/Wales) or any time (Scotland/NI)',
    threshold: 24990,
    rate: 0.09,
    writeOffYears: 25,
    interestRate: 0.043, // 4.3% (from March 2025, based on lower RPI)
  },
  plan2: {
    name: 'Plan 2',
    description: 'Started Sept 2012 onwards (England/Wales)',
    threshold: 27295,
    rate: 0.09,
    writeOffYears: 30,
    interestRate: 0.078, // RPI + up to 3% based on income
  },
  plan4: {
    name: 'Plan 4',
    description: 'Scotland (started Sept 1998 onwards)',
    threshold: 31395,
    rate: 0.09,
    writeOffYears: 30,
    interestRate: 0.0625,
  },
  plan5: {
    name: 'Plan 5',
    description: 'Started Sept 2023 onwards (England)',
    threshold: 25000,
    rate: 0.09,
    writeOffYears: 40,
    interestRate: 0.078,
  },
  postgrad: {
    name: 'Postgraduate Loan',
    description: 'Masters or Doctoral loans',
    threshold: 21000,
    rate: 0.06,
    writeOffYears: 30,
    interestRate: 0.078,
  },
};
