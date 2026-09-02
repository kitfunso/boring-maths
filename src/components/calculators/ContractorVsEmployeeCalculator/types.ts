/** Contractor vs Employee Calculator types: compares contractor/freelance rates against full-time employment, accounting for hidden costs like self-employment tax, benefits, and retirement. */

import { type Currency } from '../../../lib/regions';

export type EmploymentType = 'contractor' | 'employee';

export type HealthInsuranceType = 'employer' | 'marketplace' | 'spouse' | 'none';

export interface ContractorVsEmployeeInputs {
  contractorHourlyRate: number;
  contractorBillableHoursPerWeek: number;
  contractorWeeksPerYear: number; // Account for unpaid time off

  employeeSalary: number;
  employeeBonusPercent: number; // Annual bonus as percentage

  employer401kMatch: number; // Percentage match (e.g., 6%)
  employer401kMatchLimit: number; // Max percentage they match up to
  employerHealthInsuranceMonthly: number; // What employer pays monthly
  employerDentalVisionMonthly: number;
  employerLifeDisabilityMonthly: number;
  paidTimeOffDays: number;
  paidHolidaysDays: number;
  otherBenefitsAnnual: number; // Stock, perks, etc.

  contractorHealthInsuranceMonthly: number;
  contractorRetirementContribPercent: number; // SEP-IRA, Solo 401k contribution
  contractorBusinessExpensesMonthly: number; // Software, equipment, coworking
  contractorAccountingAnnual: number;
  contractorInsuranceAnnual: number; // Liability, E&O insurance

  federalTaxBracket: number; // Marginal rate as decimal (e.g., 0.22)
  stateTaxRate: number; // State income tax as decimal
  selfEmploymentTaxRate: number; // 15.3% for US (SS + Medicare)

  currency: Currency;
}

export interface CompensationBreakdown {
  grossIncome: number;
  bonus: number;

  healthInsuranceValue: number;
  retirementMatchValue: number;
  ptoValue: number;
  otherBenefitsValue: number;
  totalBenefitsValue: number;

  healthInsuranceCost: number;
  retirementContribution: number;
  businessExpenses: number;
  professionalServices: number;
  selfEmploymentTax: number;
  incomeTax: number;

  totalCompensation: number;
  totalCosts: number;
  netIncome: number;
  effectiveHourlyRate: number;
}

export interface ComparisonMetrics {
  winner: EmploymentType;
  annualDifference: number;
  monthlyDifference: number;
  percentageDifference: number;

  breakEvenContractRate: number; // Rate contractor needs to match employee
  breakEvenSalary: number; // Salary employee needs to match contractor

  rateToSalaryMultiplier: number; // How many times salary the hourly rate represents
  recommendedContractRate: number; // Rate to match employee total comp
}

export interface LineItem {
  label: string;
  contractor: number;
  employee: number;
  note?: string;
}

export interface ContractorVsEmployeeResult {
  contractor: CompensationBreakdown;
  employee: CompensationBreakdown;
  comparison: ComparisonMetrics;
  lineItems: LineItem[];
  currency: Currency;

  contractorEffectiveRate: number;
  employeeEffectiveRate: number;
  hoursWorkedContractor: number;
  hoursWorkedEmployee: number;
}

export function getDefaultInputs(currency: Currency): ContractorVsEmployeeInputs {
  const defaults = {
    USD: {
      contractorHourlyRate: 75,
      employeeSalary: 100000,
      employer401kMatch: 4,
      employerHealthInsuranceMonthly: 500,
      contractorHealthInsuranceMonthly: 600,
    },
    GBP: {
      contractorHourlyRate: 55,
      employeeSalary: 70000,
      employer401kMatch: 5, // UK pension
      employerHealthInsuranceMonthly: 100, // NHS supplements
      contractorHealthInsuranceMonthly: 150,
    },
    EUR: {
      contractorHourlyRate: 60,
      employeeSalary: 75000,
      employer401kMatch: 4,
      employerHealthInsuranceMonthly: 200,
      contractorHealthInsuranceMonthly: 300,
    },
  };

  const d = defaults[currency];

  const taxDefaults = {
    USD: { federalTaxBracket: 0.22, stateTaxRate: 0.05, selfEmploymentTaxRate: 0.153 },
    GBP: { federalTaxBracket: 0.2, stateTaxRate: 0, selfEmploymentTaxRate: 0.09 },
    EUR: { federalTaxBracket: 0.24, stateTaxRate: 0, selfEmploymentTaxRate: 0.15 },
  };

  const tax = taxDefaults[currency];

  return {
    contractorHourlyRate: d.contractorHourlyRate,
    contractorBillableHoursPerWeek: 40,
    contractorWeeksPerYear: 48, // 4 weeks unpaid time off

    employeeSalary: d.employeeSalary,
    employeeBonusPercent: 10,

    employer401kMatch: d.employer401kMatch,
    employer401kMatchLimit: 6,
    employerHealthInsuranceMonthly: d.employerHealthInsuranceMonthly,
    employerDentalVisionMonthly: 50,
    employerLifeDisabilityMonthly: 30,
    paidTimeOffDays: currency === 'GBP' ? 25 : currency === 'EUR' ? 25 : 15,
    paidHolidaysDays: currency === 'GBP' ? 8 : currency === 'EUR' ? 10 : 10,
    otherBenefitsAnnual: 2000,

    contractorHealthInsuranceMonthly: d.contractorHealthInsuranceMonthly,
    contractorRetirementContribPercent: 15,
    contractorBusinessExpensesMonthly: 200,
    contractorAccountingAnnual: currency === 'GBP' ? 1000 : currency === 'EUR' ? 1200 : 1500,
    contractorInsuranceAnnual: 1000,

    federalTaxBracket: tax.federalTaxBracket,
    stateTaxRate: tax.stateTaxRate,
    selfEmploymentTaxRate: tax.selfEmploymentTaxRate,

    currency,
  };
}
