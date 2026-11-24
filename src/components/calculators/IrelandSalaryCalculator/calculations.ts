export const STANDARD_RATE_BAND = 44000;
export const LOWER_TAX_RATE = 0.2;
export const HIGHER_TAX_RATE = 0.4;
export const PERSONAL_TAX_CREDIT = 2000;
export const PAYE_TAX_CREDIT = 2000;
export const TOTAL_CREDITS = PERSONAL_TAX_CREDIT + PAYE_TAX_CREDIT;
export const USC_EXEMPTION_THRESHOLD = 13000;
export const USC_BAND_1_CEILING = 12012;
export const USC_BAND_2_CEILING = 28700;
export const USC_BAND_3_CEILING = 70044;
export const USC_RATE_1 = 0.005;
export const USC_RATE_2 = 0.02;
export const USC_RATE_3 = 0.03;
export const USC_RATE_4 = 0.08;

export const PRSI_WEEKLY_EXEMPTION = 352;
export const WEEKS_PER_YEAR = 52;
export const PRSI_RATE = 0.042375;
export const PRSI_CREDIT_MAX_WEEKLY = 12;
export const PRSI_CREDIT_START = 352.01;
export const PRSI_CREDIT_TAPER = 6;

export interface IrelandSalaryInputs {
  grossAnnualSalary: number;
}

export interface IrelandSalaryResult {
  grossAnnualSalary: number;
  incomeTax: number;
  usc: number;
  prsi: number;
  totalDeductions: number;
  netAnnual: number;
  netMonthly: number;
  effectiveRate: number;
}

export function getDefaultInputs(): IrelandSalaryInputs {
  return {
    grossAnnualSalary: 50000,
  };
}

function calculateIncomeTax(gross: number): number {
  const grossTax =
    gross <= STANDARD_RATE_BAND
      ? gross * LOWER_TAX_RATE
      : STANDARD_RATE_BAND * LOWER_TAX_RATE + (gross - STANDARD_RATE_BAND) * HIGHER_TAX_RATE;
  return Math.max(0, grossTax - TOTAL_CREDITS);
}

function calculateUSC(gross: number): number {
  if (gross <= USC_EXEMPTION_THRESHOLD) return 0;

  let usc = 0;
  usc += Math.min(gross, USC_BAND_1_CEILING) * USC_RATE_1;
  if (gross > USC_BAND_1_CEILING) {
    usc += (Math.min(gross, USC_BAND_2_CEILING) - USC_BAND_1_CEILING) * USC_RATE_2;
  }
  if (gross > USC_BAND_2_CEILING) {
    usc += (Math.min(gross, USC_BAND_3_CEILING) - USC_BAND_2_CEILING) * USC_RATE_3;
  }
  if (gross > USC_BAND_3_CEILING) {
    usc += (gross - USC_BAND_3_CEILING) * USC_RATE_4;
  }
  return usc;
}

function calculatePRSI(gross: number): number {
  const weeklyEarnings = gross / WEEKS_PER_YEAR;
  if (weeklyEarnings <= PRSI_WEEKLY_EXEMPTION) return 0;
  const taper = Math.max(0, weeklyEarnings - PRSI_CREDIT_START) / PRSI_CREDIT_TAPER;
  const weeklyCredit = Math.max(0, PRSI_CREDIT_MAX_WEEKLY - taper);
  return Math.max(0, gross * PRSI_RATE - weeklyCredit * WEEKS_PER_YEAR);
}

export function calculateIrelandSalary(inputs: IrelandSalaryInputs): IrelandSalaryResult {
  const gross = Math.max(0, inputs.grossAnnualSalary || 0);

  const incomeTax = calculateIncomeTax(gross);
  const usc = calculateUSC(gross);
  const prsi = calculatePRSI(gross);

  const totalDeductions = incomeTax + usc + prsi;
  const netAnnual = gross - totalDeductions;
  const netMonthly = netAnnual / 12;
  const effectiveRate = gross > 0 ? (totalDeductions / gross) * 100 : 0;

  const round2 = (v: number) => Math.round(v * 100) / 100;

  return {
    grossAnnualSalary: round2(gross),
    incomeTax: round2(incomeTax),
    usc: round2(usc),
    prsi: round2(prsi),
    totalDeductions: round2(totalDeductions),
    netAnnual: round2(netAnnual),
    netMonthly: round2(netMonthly),
    effectiveRate: round2(effectiveRate),
  };
}
