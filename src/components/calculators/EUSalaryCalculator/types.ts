/**
 * EU Salary Calculator Types
 * Simplified tax calculations for EU countries
 */

export interface EUCountryTax {
  code: string;
  name: string;
  currency: string;
  // Simplified progressive tax brackets
  taxBrackets: { threshold: number; rate: number }[];
  // Social security (employee portion, simplified)
  socialSecurityRate: number;
  socialSecurityCap?: number;
  // Standard deduction/tax-free allowance
  taxFreeAllowance: number;
}

export const EU_TAX_DATA: EUCountryTax[] = [
  {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    taxBrackets: [
      { threshold: 11604, rate: 0 },
      { threshold: 17005, rate: 14 },
      { threshold: 66760, rate: 24 },
      { threshold: 277825, rate: 42 },
      { threshold: Infinity, rate: 45 },
    ],
    socialSecurityRate: 20.5, // Approx employee share
    socialSecurityCap: 90600,
    taxFreeAllowance: 11604,
  },
  {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    taxBrackets: [
      { threshold: 11294, rate: 0 },
      { threshold: 28797, rate: 11 },
      { threshold: 82341, rate: 30 },
      { threshold: 177106, rate: 41 },
      { threshold: Infinity, rate: 45 },
    ],
    socialSecurityRate: 22,
    taxFreeAllowance: 11294,
  },
  {
    code: 'NL',
    name: 'Netherlands',
    currency: 'EUR',
    taxBrackets: [
      { threshold: 75518, rate: 36.93 },
      { threshold: Infinity, rate: 49.5 },
    ],
    socialSecurityRate: 27.65,
    socialSecurityCap: 66956,
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
    socialSecurityRate: 6.35,
    socialSecurityCap: 56844,
    taxFreeAllowance: 5550,
  },
  {
    code: 'IT',
    name: 'Italy',
    currency: 'EUR',
    taxBrackets: [
      { threshold: 28000, rate: 23 },
      { threshold: 50000, rate: 35 },
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
      { threshold: 7703, rate: 13.25 },
      { threshold: 11623, rate: 18 },
      { threshold: 16472, rate: 23 },
      { threshold: 21321, rate: 26 },
      { threshold: 27146, rate: 32.75 },
      { threshold: 39791, rate: 37 },
      { threshold: 51997, rate: 43.5 },
      { threshold: 81199, rate: 45 },
      { threshold: Infinity, rate: 48 },
    ],
    socialSecurityRate: 11,
    taxFreeAllowance: 4104,
  },
  {
    code: 'IE',
    name: 'Ireland',
    currency: 'EUR',
    taxBrackets: [
      { threshold: 42000, rate: 20 },
      { threshold: Infinity, rate: 40 },
    ],
    socialSecurityRate: 4, // PRSI
    taxFreeAllowance: 1875, // Single person tax credit equivalent
  },
  {
    code: 'BE',
    name: 'Belgium',
    currency: 'EUR',
    taxBrackets: [
      { threshold: 15200, rate: 25 },
      { threshold: 26830, rate: 40 },
      { threshold: 46440, rate: 45 },
      { threshold: Infinity, rate: 50 },
    ],
    socialSecurityRate: 13.07,
    taxFreeAllowance: 10160,
  },
  {
    code: 'AT',
    name: 'Austria',
    currency: 'EUR',
    taxBrackets: [
      { threshold: 12816, rate: 0 },
      { threshold: 20818, rate: 20 },
      { threshold: 34513, rate: 30 },
      { threshold: 66612, rate: 40 },
      { threshold: 99266, rate: 48 },
      { threshold: 1000000, rate: 50 },
      { threshold: Infinity, rate: 55 },
    ],
    socialSecurityRate: 18.12,
    socialSecurityCap: 81000,
    taxFreeAllowance: 12816,
  },
  {
    code: 'PL',
    name: 'Poland',
    currency: 'PLN',
    taxBrackets: [
      { threshold: 120000, rate: 12 },
      { threshold: Infinity, rate: 32 },
    ],
    socialSecurityRate: 13.71,
    taxFreeAllowance: 30000,
  },
  {
    code: 'SE',
    name: 'Sweden',
    currency: 'SEK',
    taxBrackets: [
      { threshold: 614000, rate: 32 }, // Municipal average
      { threshold: Infinity, rate: 52 }, // Including state tax
    ],
    socialSecurityRate: 7,
    taxFreeAllowance: 57500,
  },
  {
    code: 'DK',
    name: 'Denmark',
    currency: 'DKK',
    taxBrackets: [
      { threshold: 588900, rate: 37 }, // Including AM-bidrag
      { threshold: Infinity, rate: 52.07 },
    ],
    socialSecurityRate: 8, // AM-bidrag
    taxFreeAllowance: 48000,
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
