import type { Currency } from '../../../lib/regions';
import {
  type FederalFilingStatus,
  STANDARD_DEDUCTION_2026,
  employeeFica,
  federalIncomeTax,
  qbiDeduction,
  selfEmploymentTax,
} from '../../../lib/us-tax-2026';
import { calculateUKTax } from '../UKTaxCalculator/calculations';
import { getDefaultInputs as getUKTaxDefaults } from '../UKTaxCalculator/types';
import { calculateSalary } from '../EUSalaryCalculator/calculations';

export interface TaxContext {
  readonly currency: Currency;
  readonly filingStatus: FederalFilingStatus;
  readonly stateTaxRate: number;
  readonly euCountry: string;
  readonly selfEmployedSocialRate: number;
}

export interface TaxSplit {
  readonly socialTax: number;
  readonly incomeTax: number;
}

export const UK_CLASS_4 = {
  lowerProfitsLimit: 12570,
  upperProfitsLimit: 50270,
  mainRate: 0.06,
  upperRate: 0.02,
} as const;

function ukClass4(profit: number): number {
  const { lowerProfitsLimit, upperProfitsLimit, mainRate, upperRate } = UK_CLASS_4;
  const main = Math.max(0, Math.min(profit, upperProfitsLimit) - lowerProfitsLimit);
  return main * mainRate + Math.max(0, profit - upperProfitsLimit) * upperRate;
}

function ukTax(pay: number) {
  return calculateUKTax({ ...getUKTaxDefaults(), grossSalary: Math.max(0, pay), pensionRate: 0 });
}

export function employeeTax(pay: number, ctx: TaxContext): TaxSplit {
  if (ctx.currency === 'GBP') {
    const r = ukTax(pay);
    return { socialTax: r.nationalInsurance, incomeTax: r.incomeTax };
  }
  if (ctx.currency === 'EUR') {
    const r = calculateSalary({ countryCode: ctx.euCountry, grossSalary: pay });
    return { socialTax: r.socialSecurity, incomeTax: r.incomeTax };
  }
  const taxable = Math.max(0, pay - STANDARD_DEDUCTION_2026[ctx.filingStatus]);
  return {
    socialTax: employeeFica(pay, ctx.filingStatus),
    incomeTax: federalIncomeTax(taxable, ctx.filingStatus) + Math.max(0, pay) * ctx.stateTaxRate,
  };
}

export function contractorTax(
  profit: number,
  retirement: number,
  healthInsurance: number,
  ctx: TaxContext
): TaxSplit {
  const p = Math.max(0, profit);
  if (ctx.currency === 'GBP') {
    return { socialTax: ukClass4(p), incomeTax: ukTax(p - retirement).incomeTax };
  }
  if (ctx.currency === 'EUR') {
    // SHORTCUT: the country's salary rules on profit; self-employed allowances differ by country
    const r = calculateSalary({
      countryCode: ctx.euCountry,
      grossSalary: Math.max(0, p - retirement),
    });
    return { socialTax: p * ctx.selfEmployedSocialRate, incomeTax: r.incomeTax };
  }
  const status = ctx.filingStatus;
  const se = selfEmploymentTax(p, 0, status);
  const beforeHealth = p - se.deductibleHalf - retirement;
  const agi = Math.max(0, beforeHealth - Math.min(healthInsurance, Math.max(0, beforeHealth)));
  const taxableBeforeQbi = Math.max(0, agi - STANDARD_DEDUCTION_2026[status]);
  const taxable = Math.max(0, taxableBeforeQbi - qbiDeduction(agi, taxableBeforeQbi, status));
  return {
    socialTax: se.total,
    incomeTax: federalIncomeTax(taxable, status) + agi * ctx.stateTaxRate,
  };
}
