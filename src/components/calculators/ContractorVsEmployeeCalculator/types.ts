import { type Currency } from '../../../lib/regions';
import type { FederalFilingStatus } from '../../../lib/us-tax-2026';

export type EmploymentType = 'contractor' | 'employee';

export type HealthInsuranceType = 'employer' | 'marketplace' | 'spouse' | 'none';

export interface ContractorVsEmployeeInputs {
  contractorHourlyRate: number;
  contractorBillableHoursPerWeek: number;
  contractorWeeksPerYear: number;

  employeeSalary: number;
  employeeBonusPercent: number;

  employer401kMatch: number;
  employer401kMatchLimit: number;
  employerHealthInsuranceMonthly: number;
  employerDentalVisionMonthly: number;
  employerLifeDisabilityMonthly: number;
  paidTimeOffDays: number;
  paidHolidaysDays: number;
  otherBenefitsAnnual: number;

  contractorHealthInsuranceMonthly: number;
  contractorRetirementContribPercent: number;
  contractorBusinessExpensesMonthly: number;
  contractorAccountingAnnual: number;
  contractorInsuranceAnnual: number;

  filingStatus: FederalFilingStatus;
  stateTaxRate: number;
  euCountry: string;
  selfEmployedSocialRate: number;

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
  socialTax: number;
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

  breakEvenContractRate: number;
  breakEvenSalary: number;

  rateToSalaryMultiplier: number;
  recommendedContractRate: number;
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

    filingStatus: 'single',
    stateTaxRate: currency === 'USD' ? 0.05 : 0,
    euCountry: 'DE',
    selfEmployedSocialRate: currency === 'EUR' ? 0.15 : 0,

    currency,
  };
}
