/**
 * EU Salary Calculator - Calculation Logic
 */

import { EU_TAX_DATA, type SalaryInputs, type SalaryResult, type EUCountryTax } from './types';

export function getCountryByCode(code: string): EUCountryTax | undefined {
  return EU_TAX_DATA.find((c) => c.code === code);
}

export function calculateSocialSecurity(gross: number, country: EUCountryTax): number {
  const taxableAmount = country.socialSecurityCap
    ? Math.min(gross, country.socialSecurityCap)
    : gross;
  return taxableAmount * (country.socialSecurityRate / 100);
}

export function calculateIncomeTax(gross: number, country: EUCountryTax): number {
  // Taxable income after social security and allowances
  const socialSecurity = calculateSocialSecurity(gross, country);
  let taxableIncome = gross - socialSecurity - country.taxFreeAllowance;
  taxableIncome = Math.max(0, taxableIncome);

  let tax = 0;
  let previousThreshold = 0;

  for (const bracket of country.taxBrackets) {
    if (taxableIncome <= 0) break;

    const taxableInBracket = Math.min(taxableIncome, bracket.threshold - previousThreshold);

    if (taxableInBracket > 0) {
      tax += taxableInBracket * (bracket.rate / 100);
      taxableIncome -= taxableInBracket;
    }

    previousThreshold = bracket.threshold;
  }

  return Math.max(0, tax);
}

export function calculateSalary(inputs: SalaryInputs): SalaryResult {
  const { grossSalary, countryCode } = inputs;
  const country = getCountryByCode(countryCode) || EU_TAX_DATA[0];

  const socialSecurity = calculateSocialSecurity(grossSalary, country);
  const incomeTax = calculateIncomeTax(grossSalary, country);
  const totalDeductions = socialSecurity + incomeTax;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = (totalDeductions / grossSalary) * 100;

  return {
    country,
    grossSalary,
    socialSecurity,
    incomeTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    monthlyNet: netSalary / 12,
  };
}

export function calculateAllCountries(grossSalary: number): SalaryResult[] {
  return EU_TAX_DATA.map((country) => {
    return calculateSalary({ grossSalary, countryCode: country.code });
  }).sort((a, b) => b.netSalary - a.netSalary);
}

export function formatCurrency(value: number, currency: string = 'EUR'): string {
  const locale =
    currency === 'EUR'
      ? 'de-DE'
      : currency === 'PLN'
        ? 'pl-PL'
        : currency === 'SEK'
          ? 'sv-SE'
          : currency === 'DKK'
            ? 'da-DK'
            : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
