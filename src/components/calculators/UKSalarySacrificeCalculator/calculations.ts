import type { UKSalarySacrificeInputs, UKSalarySacrificeResult, TaxRegion } from './types';
import { ENGLAND_TAX_BANDS, SCOTLAND_TAX_BANDS, NI_RATES } from './types';

function calculateEnglandTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  const { basicRate, higherRate, additionalRate } = ENGLAND_TAX_BANDS;

  if (taxableIncome > higherRate.threshold) {
    tax += (taxableIncome - higherRate.threshold) * additionalRate.rate;
    taxableIncome = higherRate.threshold;
  }

  if (taxableIncome > basicRate.threshold) {
    tax += (taxableIncome - basicRate.threshold) * higherRate.rate;
    taxableIncome = basicRate.threshold;
  }

  if (taxableIncome > 0) {
    tax += taxableIncome * basicRate.rate;
  }

  return tax;
}

function calculateScotlandTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  const bands = SCOTLAND_TAX_BANDS;

  if (taxableIncome > bands.advancedRate.threshold) {
    tax += (taxableIncome - bands.advancedRate.threshold) * bands.topRate.rate;
    taxableIncome = bands.advancedRate.threshold;
  }

  if (taxableIncome > bands.higherRate.threshold) {
    tax += (taxableIncome - bands.higherRate.threshold) * bands.advancedRate.rate;
    taxableIncome = bands.higherRate.threshold;
  }

  if (taxableIncome > bands.intermediateRate.threshold) {
    tax += (taxableIncome - bands.intermediateRate.threshold) * bands.higherRate.rate;
    taxableIncome = bands.intermediateRate.threshold;
  }

  if (taxableIncome > bands.basicRate.threshold) {
    tax += (taxableIncome - bands.basicRate.threshold) * bands.intermediateRate.rate;
    taxableIncome = bands.basicRate.threshold;
  }

  if (taxableIncome > bands.starterRate.threshold) {
    tax += (taxableIncome - bands.starterRate.threshold) * bands.basicRate.rate;
    taxableIncome = bands.starterRate.threshold;
  }

  if (taxableIncome > 0) {
    tax += taxableIncome * bands.starterRate.rate;
  }

  return tax;
}

function calculatePersonalAllowance(grossIncome: number): number {
  const baseAllowance = 12570;
  const taperThreshold = 100000;

  if (grossIncome <= taperThreshold) {
    return baseAllowance;
  }

  const reduction = Math.floor((grossIncome - taperThreshold) / 2);
  return Math.max(0, baseAllowance - reduction);
}

function calculateIncomeTax(grossIncome: number, region: TaxRegion): number {
  const personalAllowance = calculatePersonalAllowance(grossIncome);
  const taxableIncome = Math.max(0, grossIncome - personalAllowance);

  if (region === 'scotland') {
    return calculateScotlandTax(taxableIncome);
  }
  return calculateEnglandTax(taxableIncome);
}

function calculateEmployeeNI(grossIncome: number): number {
  const { primaryThreshold, upperEarningsLimit, mainRate, upperRate } = NI_RATES;

  if (grossIncome <= primaryThreshold) return 0;

  let ni = 0;

  if (grossIncome > upperEarningsLimit) {
    ni += (grossIncome - upperEarningsLimit) * upperRate;
  }

  const niableIncome = Math.min(grossIncome, upperEarningsLimit) - primaryThreshold;
  if (niableIncome > 0) {
    ni += niableIncome * mainRate;
  }

  return ni;
}

function calculateEmployerNI(grossIncome: number): number {
  const { employerThreshold, employerRate } = NI_RATES;

  if (grossIncome <= employerThreshold) return 0;

  return (grossIncome - employerThreshold) * employerRate;
}

export function calculateSalarySacrifice(inputs: UKSalarySacrificeInputs): UKSalarySacrificeResult {
  const { grossSalary, sacrificeAmount, taxRegion } = inputs;

  const grossSalaryBefore = grossSalary;
  const incomeTaxBefore = calculateIncomeTax(grossSalaryBefore, taxRegion);
  const niBeforeEmployee = calculateEmployeeNI(grossSalaryBefore);
  const niBeforeEmployer = calculateEmployerNI(grossSalaryBefore);
  const netPayBefore = grossSalaryBefore - incomeTaxBefore - niBeforeEmployee;

  const grossSalaryAfter = grossSalary - sacrificeAmount;
  const incomeTaxAfter = calculateIncomeTax(grossSalaryAfter, taxRegion);
  const niAfterEmployee = calculateEmployeeNI(grossSalaryAfter);
  const niAfterEmployer = calculateEmployerNI(grossSalaryAfter);
  const netPayAfter = grossSalaryAfter - incomeTaxAfter - niAfterEmployee;

  const incomeTaxSaved = incomeTaxBefore - incomeTaxAfter;
  const niSavedEmployee = niBeforeEmployee - niAfterEmployee;
  const niSavedEmployer = niBeforeEmployer - niAfterEmployer;
  const totalSavings = incomeTaxSaved + niSavedEmployee;

  const trueCostOfBenefit = sacrificeAmount - totalSavings;

  const effectiveDiscount = sacrificeAmount > 0 ? (totalSavings / sacrificeAmount) * 100 : 0;

  return {
    grossSalaryBefore,
    grossSalaryAfter,
    incomeTaxBefore: Math.round(incomeTaxBefore * 100) / 100,
    incomeTaxAfter: Math.round(incomeTaxAfter * 100) / 100,
    incomeTaxSaved: Math.round(incomeTaxSaved * 100) / 100,
    niBeforeEmployee: Math.round(niBeforeEmployee * 100) / 100,
    niAfterEmployee: Math.round(niAfterEmployee * 100) / 100,
    niSavedEmployee: Math.round(niSavedEmployee * 100) / 100,
    niSavedEmployer: Math.round(niSavedEmployer * 100) / 100,
    netPayBefore: Math.round(netPayBefore * 100) / 100,
    netPayAfter: Math.round(netPayAfter * 100) / 100,
    trueCostOfBenefit: Math.round(trueCostOfBenefit * 100) / 100,
    effectiveDiscount: Math.round(effectiveDiscount * 10) / 10,
    totalSavings: Math.round(totalSavings * 100) / 100,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
