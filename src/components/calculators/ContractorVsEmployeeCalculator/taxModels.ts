/** Tax on each side of the comparison, delegated to the site's US, UK and EU models so every page agrees. */

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
  readonly stateTaxRate: number; // decimal, US only, charged on AGI
  readonly euCountry: string;
  readonly selfEmployedSocialRate: number; // decimal, EUR only
}

export interface TaxSplit {
  readonly socialTax: number; // FICA, National Insurance or social contributions
  readonly incomeTax: number;
}

// GOV.UK self-employed NI 2026/27: Class 4 on profit; Class 2 is treated as paid from 7,105 of profit
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

/** Profit is revenue less business expenses; pension and health cover are paid out of it. */
export function contractorTax(
  profit: number,
  retirement: number,
  healthInsurance: number,
  ctx: TaxContext
): TaxSplit {
  const p = Math.max(0, profit);
  if (ctx.currency === 'GBP') {
    // Pension contributions get relief at the marginal rate; private health cover gets none
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
  // The self-employed health insurance deduction cannot exceed the business's net earnings
  const agi = Math.max(0, beforeHealth - Math.min(healthInsurance, Math.max(0, beforeHealth)));
  const taxableBeforeQbi = Math.max(0, agi - STANDARD_DEDUCTION_2026[status]);
  const taxable = Math.max(0, taxableBeforeQbi - qbiDeduction(agi, taxableBeforeQbi, status));
  return {
    socialTax: se.total,
    incomeTax: federalIncomeTax(taxable, status) + agi * ctx.stateTaxRate,
  };
}
