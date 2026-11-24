import { calculateIrelandSalary } from '../IrelandSalaryCalculator/calculations';
import { calculateGermanySalary } from '../GermanySalaryCalculator/calculations';

interface EUCountryBase {
  code: string;
  name: string;
  currency: string;
}

export interface BandCountryTax extends EUCountryBase {
  taxBrackets: { threshold: number; rate: number }[];
  socialSecurityRate: number;
  socialSecurityCap?: number;
  socialSecurityDeductible?: boolean;
  taxFreeAllowance: number;
  taxFreeAllowanceMode?: 'deduction' | 'credit';
  taxFreeCreditRate?: number;
  healthContributionRate?: number;
  employeeExpenseDeduction?: { rate: number; cap: number };
  localSurchargeRate?: number;
}

export interface DetailedCountryTax extends EUCountryBase {
  detailedModel: (gross: number) => { socialSecurity: number; incomeTax: number };
}

export type EUCountryTax = BandCountryTax | DetailedCountryTax;

export const EU_TAX_DATA: EUCountryTax[] = [
  {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    detailedModel: (gross) => {
      const r = calculateGermanySalary({
        grossAnnualSalary: gross,
        churchTax: false,
        childless: true,
      });
      return { socialSecurity: r.socialTotal, incomeTax: r.incomeTax + r.soli };
    },
  },
  {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    taxBrackets: [
      { threshold: 11600, rate: 0 },
      { threshold: 29579, rate: 11 },
      { threshold: 84577, rate: 30 },
      { threshold: 181917, rate: 41 },
      { threshold: Infinity, rate: 45 },
    ],
    socialSecurityRate: 22,
    taxFreeAllowance: 0,
  },
  {
    code: 'NL',
    name: 'Netherlands',
    currency: 'EUR',
    taxBrackets: [
      { threshold: 38883, rate: 8.1 },
      { threshold: 78426, rate: 37.56 },
      { threshold: Infinity, rate: 49.5 },
    ],
    socialSecurityRate: 27.65,
    socialSecurityCap: 38883,
    socialSecurityDeductible: false,
    taxFreeAllowance: 0,
  },
  {
    code: 'ES',
    name: 'Spain',
    currency: 'EUR',
    taxBrackets: [
      { threshold: 12450, rate: 19 },
      { threshold: 20200, rate: 24 },
      { threshold: 35200, rate: 30 },
      { threshold: 60000, rate: 37 },
      { threshold: 300000, rate: 45 },
      { threshold: Infinity, rate: 47 },
    ],
    socialSecurityRate: 6.5,
    socialSecurityCap: 61214.4,
    taxFreeAllowance: 5550,
  },
  {
    code: 'IT',
    name: 'Italy',
    currency: 'EUR',
    taxBrackets: [
      { threshold: 28000, rate: 23 },
      { threshold: 50000, rate: 33 },
      { threshold: Infinity, rate: 43 },
    ],
    socialSecurityRate: 9.19,
    taxFreeAllowance: 8174,
  },
  {
    code: 'PT',
    name: 'Portugal',
    currency: 'EUR',
    taxBrackets: [
      { threshold: 8342, rate: 12.5 },
      { threshold: 12587, rate: 15.7 },
      { threshold: 17838, rate: 21.2 },
      { threshold: 23089, rate: 24.1 },
      { threshold: 29397, rate: 31.1 },
      { threshold: 43090, rate: 34.9 },
      { threshold: 46566, rate: 43.1 },
      { threshold: 86634, rate: 44.6 },
      { threshold: Infinity, rate: 48 },
    ],
    socialSecurityRate: 11,
    taxFreeAllowance: 4104,
  },
  {
    code: 'IE',
    name: 'Ireland',
    currency: 'EUR',
    detailedModel: (gross) => {
      const r = calculateIrelandSalary({ grossAnnualSalary: gross });
      return { socialSecurity: r.prsi, incomeTax: r.incomeTax + r.usc };
    },
  },
  {
    code: 'BE',
    name: 'Belgium',
    currency: 'EUR',
    taxBrackets: [
      { threshold: 16720, rate: 25 },
      { threshold: 29510, rate: 40 },
      { threshold: 51070, rate: 45 },
      { threshold: Infinity, rate: 50 },
    ],
    socialSecurityRate: 13.07,
    taxFreeAllowance: 11550,
    taxFreeAllowanceMode: 'credit',
    taxFreeCreditRate: 25,
    employeeExpenseDeduction: { rate: 30, cap: 6070 },
    localSurchargeRate: 7,
  },
  {
    code: 'AT',
    name: 'Austria',
    currency: 'EUR',
    taxBrackets: [
      { threshold: 13539, rate: 0 },
      { threshold: 21992, rate: 20 },
      { threshold: 36458, rate: 30 },
      { threshold: 70365, rate: 40 },
      { threshold: 104859, rate: 48 },
      { threshold: 1000000, rate: 50 },
      { threshold: Infinity, rate: 55 },
    ],
    socialSecurityRate: 18.12,
    socialSecurityCap: 97020,
    taxFreeAllowance: 0,
  },
  {
    code: 'PL',
    name: 'Poland',
    currency: 'PLN',
    taxBrackets: [
      { threshold: 30000, rate: 0 },
      { threshold: 120000, rate: 12 },
      { threshold: Infinity, rate: 32 },
    ],
    socialSecurityRate: 13.71,
    healthContributionRate: 9,
    employeeExpenseDeduction: { rate: 100, cap: 3000 },
    taxFreeAllowance: 0,
  },
  {
    code: 'SE',
    name: 'Sweden',
    currency: 'SEK',
    taxBrackets: [
      { threshold: 643000, rate: 32 },
      { threshold: Infinity, rate: 52 },
    ],
    socialSecurityRate: 7,
    taxFreeAllowance: 57500,
  },
  {
    code: 'DK',
    name: 'Denmark',
    currency: 'DKK',
    taxBrackets: [
      { threshold: 54100, rate: 0 },
      { threshold: 641200, rate: 37.01 },
      { threshold: 777900, rate: 44.51 },
      { threshold: 2592700, rate: 52.01 },
      { threshold: Infinity, rate: 57.01 },
    ],
    socialSecurityRate: 8,
    taxFreeAllowance: 0,
  },
];

export interface SalaryInputs {
  grossSalary: number;
  countryCode: string;
}

export interface SalaryResult {
  country: EUCountryTax;
  grossSalary: number;
  socialSecurity: number;
  incomeTax: number;
  totalDeductions: number;
  netSalary: number;
  effectiveTaxRate: number;
  monthlyNet: number;
}

export function getDefaultInputs(): SalaryInputs {
  return {
    grossSalary: 50000,
    countryCode: 'DE',
  };
}
