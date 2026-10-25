/**
 * EU Salary Calculator - Calculation Logic
 */

import {
  EU_TAX_DATA,
  type BandCountryTax,
  type SalaryInputs,
  type SalaryResult,
  type EUCountryTax,
} from './types';

export function getCountryByCode(code: string): EUCountryTax | undefined {
  return EU_TAX_DATA.find((c) => c.code === code);
}

function socialContributions(gross: number, country: BandCountryTax): number {
  const taxableAmount = country.socialSecurityCap
    ? Math.min(gross, country.socialSecurityCap)
    : gross;
  return taxableAmount * (country.socialSecurityRate / 100);
}

export function calculateSocialSecurity(gross: number, country: BandCountryTax): number {
  const social = socialContributions(gross, country);
  const health = ((gross - social) * (country.healthContributionRate ?? 0)) / 100;
  return social + health;
}

function bandTax(amount: number, brackets: BandCountryTax['taxBrackets']): number {
  let remaining = Math.max(0, amount);
  let tax = 0;
  let previousThreshold = 0;

  for (const bracket of brackets) {
    if (remaining <= 0) break;

    const taxableInBracket = Math.min(remaining, bracket.threshold - previousThreshold);

    if (taxableInBracket > 0) {
      tax += taxableInBracket * (bracket.rate / 100);
      remaining -= taxableInBracket;
    }

    previousThreshold = bracket.threshold;
  }

  return tax;
}

export function calculateIncomeTax(gross: number, country: BandCountryTax): number {
  // Taxable income after social security (a health levy is not deductible) and allowances
  const social = socialContributions(gross, country);
  const deductible = country.socialSecurityDeductible === false ? 0 : social;

  if (country.taxFreeAllowanceMode === 'credit') {
    const credit = (country.taxFreeAllowance * (country.taxFreeCreditRate ?? 0)) / 100;
    return Math.max(0, bandTax(gross - deductible, country.taxBrackets) - credit);
  }

  return Math.max(0, bandTax(gross - deductible - country.taxFreeAllowance, country.taxBrackets));
}

export function calculateSalary(inputs: SalaryInputs): SalaryResult {
  const { countryCode } = inputs;
  const grossSalary = Number.isFinite(inputs.grossSalary) ? Math.max(0, inputs.grossSalary) : 0;
  const country = getCountryByCode(countryCode) || EU_TAX_DATA[0];

  const { socialSecurity, incomeTax } =
    'detailedModel' in country
      ? country.detailedModel(grossSalary)
      : {
          socialSecurity: calculateSocialSecurity(grossSalary, country),
          incomeTax: calculateIncomeTax(grossSalary, country),
        };
  const totalDeductions = socialSecurity + incomeTax;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? (totalDeductions / grossSalary) * 100 : 0;

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
