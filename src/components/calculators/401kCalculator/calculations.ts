import type { Calculator401kInputs, Calculator401kResult, YearlyData } from './types';

export function calculate401k(inputs: Calculator401kInputs): Calculator401kResult {
  const {
    currentAge,
    retirementAge,
    currentBalance,
    annualSalary,
    contributionPercent,
    employerMatchPercent,
    employerMatchLimit,
    annualReturn,
    salaryGrowth,
  } = inputs;

  const yearsToRetirement = retirementAge - currentAge;
  const monthlyReturn = annualReturn / 100 / 12;

  let balance = currentBalance;
  let totalYourContributions = 0;
  let totalEmployerContributions = 0;
  let currentSalary = annualSalary;

  const yearlyBreakdown: YearlyData[] = [];

  for (let year = 0; year < yearsToRetirement; year++) {
    const age = currentAge + year + 1;

    const yourAnnualContribution = currentSalary * (contributionPercent / 100);

    const matchablePercent = Math.min(contributionPercent, employerMatchLimit);
    const employerAnnualContribution =
      currentSalary * (matchablePercent / 100) * (employerMatchPercent / 100);

    const annualLimit = age >= 50 ? 32500 : 24500;
    const cappedYourContribution = Math.min(yourAnnualContribution, annualLimit);

    totalYourContributions += cappedYourContribution;
    totalEmployerContributions += employerAnnualContribution;

    const monthlyContribution = (cappedYourContribution + employerAnnualContribution) / 12;

    for (let month = 0; month < 12; month++) {
      balance = balance * (1 + monthlyReturn) + monthlyContribution;
    }

    yearlyBreakdown.push({
      age,
      salary: Math.round(currentSalary),
      yourContribution: Math.round(cappedYourContribution),
      employerContribution: Math.round(employerAnnualContribution),
      yearEndBalance: Math.round(balance),
    });

    currentSalary *= 1 + salaryGrowth / 100;
  }

  const investmentGrowth =
    balance - currentBalance - totalYourContributions - totalEmployerContributions;

  const monthlyIncomeAt4Percent = (balance * 0.04) / 12;

  return {
    totalAtRetirement: Math.round(balance),
    totalContributions: Math.round(totalYourContributions),
    employerContributions: Math.round(totalEmployerContributions),
    investmentGrowth: Math.round(investmentGrowth),
    yearlyBreakdown,
    monthlyIncomeAt4Percent: Math.round(monthlyIncomeAt4Percent),
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}
