export const RV_ALV_CEILING = 101400;
export const KV_PV_CEILING = 69750;
export const RV_EMPLOYEE_RATE = 0.093;
export const ALV_EMPLOYEE_RATE = 0.013;
export const KV_EMPLOYEE_RATE = 0.0875;
export const PV_EMPLOYEE_RATE = 0.018;
export const PV_CHILDLESS_SURCHARGE = 0.006;

export const ARBEITNEHMER_PAUSCHBETRAG = 1230;

export const GRUNDFREIBETRAG_2026 = 12348;
export const ZONE2_LIMIT = 17799;
export const ZONE3_LIMIT = 69878;
export const ZONE4_LIMIT = 277825;

export const SOLI_RATE = 0.055;
export const SOLI_FREIGRENZE_SINGLE = 20350;
export const SOLI_MILDERUNG_RATE = 0.119;
export const CHURCH_TAX_RATE = 0.09;

export interface GermanySalaryInputs {
  readonly grossAnnualSalary: number;
  readonly churchTax: boolean;
  readonly childless: boolean;
}

export interface GermanySalaryResult {
  readonly grossAnnual: number;
  readonly netAnnual: number;
  readonly netMonthly: number;
  readonly incomeTax: number;
  readonly soli: number;
  readonly churchTax: number;
  readonly pension: number;
  readonly health: number;
  readonly unemployment: number;
  readonly care: number;
  readonly socialTotal: number;
  readonly totalDeductions: number;
  readonly taxableIncome: number;
  readonly effectiveRate: number;
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function calculateEinkommensteuer(taxableIncome: number): number {
  const x = Math.floor(Math.max(0, taxableIncome));
  let tax: number;

  if (x <= GRUNDFREIBETRAG_2026) {
    tax = 0;
  } else if (x <= ZONE2_LIMIT) {
    const y = (x - GRUNDFREIBETRAG_2026) / 10000;
    tax = (914.51 * y + 1400) * y;
  } else if (x <= ZONE3_LIMIT) {
    const z = (x - ZONE2_LIMIT) / 10000;
    tax = (173.1 * z + 2397) * z + 1034.87;
  } else if (x <= ZONE4_LIMIT) {
    tax = 0.42 * x - 11135.63;
  } else {
    tax = 0.45 * x - 19470.38;
  }

  return Math.floor(tax);
}

function calculateSocial(
  gross: number,
  childless: boolean
): {
  pension: number;
  unemployment: number;
  health: number;
  care: number;
} {
  const rvBase = Math.min(gross, RV_ALV_CEILING);
  const kvBase = Math.min(gross, KV_PV_CEILING);

  const pension = rvBase * RV_EMPLOYEE_RATE;
  const unemployment = rvBase * ALV_EMPLOYEE_RATE;
  const health = kvBase * KV_EMPLOYEE_RATE;
  const careRate = PV_EMPLOYEE_RATE + (childless ? PV_CHILDLESS_SURCHARGE : 0);
  const care = kvBase * careRate;

  return { pension, unemployment, health, care };
}

export function calculateSoli(incomeTax: number): number {
  if (incomeTax <= SOLI_FREIGRENZE_SINGLE) return 0;
  const full = SOLI_RATE * incomeTax;
  const milderung = SOLI_MILDERUNG_RATE * (incomeTax - SOLI_FREIGRENZE_SINGLE);
  return Math.min(full, milderung);
}

export function calculateGermanySalary(inputs: GermanySalaryInputs): GermanySalaryResult {
  const gross = Math.max(0, inputs.grossAnnualSalary || 0);
  const childless = inputs.childless;

  const { pension, unemployment, health, care } = calculateSocial(gross, childless);
  const socialTotal = pension + unemployment + health + care;

  const deductibleVorsorge = pension + health + care;
  const taxableIncome = Math.max(0, gross - deductibleVorsorge - ARBEITNEHMER_PAUSCHBETRAG);

  const incomeTax = calculateEinkommensteuer(taxableIncome);
  const soli = calculateSoli(incomeTax);
  const churchTax = inputs.churchTax ? incomeTax * CHURCH_TAX_RATE : 0;

  const totalDeductions = incomeTax + soli + churchTax + socialTotal;
  const netAnnual = gross - totalDeductions;
  const netMonthly = netAnnual / 12;
  const effectiveRate = gross > 0 ? (totalDeductions / gross) * 100 : 0;

  return {
    grossAnnual: gross,
    netAnnual: roundTo(netAnnual, 2),
    netMonthly: roundTo(netMonthly, 2),
    incomeTax: roundTo(incomeTax, 2),
    soli: roundTo(soli, 2),
    churchTax: roundTo(churchTax, 2),
    pension: roundTo(pension, 2),
    health: roundTo(health, 2),
    unemployment: roundTo(unemployment, 2),
    care: roundTo(care, 2),
    socialTotal: roundTo(socialTotal, 2),
    totalDeductions: roundTo(totalDeductions, 2),
    taxableIncome: roundTo(taxableIncome, 2),
    effectiveRate: roundTo(effectiveRate, 1),
  };
}

export function getDefaultInputs(): GermanySalaryInputs {
  return {
    grossAnnualSalary: 60000,
    churchTax: false,
    childless: true,
  };
}
