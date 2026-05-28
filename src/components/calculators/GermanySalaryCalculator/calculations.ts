/**
 * Germany Net Salary (Brutto-Netto) Calculator - pure logic
 *
 * Estimates employee net pay for tax class I (single, no dependants) for the
 * 2026 tax year. The model derives taxable income (zu versteuerndes Einkommen,
 * zvE) using a simplified Vorsorgepauschale: gross minus the employee share of
 * social insurance minus the employee lump-sum allowance (Arbeitnehmer-
 * Pauschbetrag). Income tax then follows the statutory formula in section 32a
 * EStG. Solidarity surcharge (Solidaritaetszuschlag) and optional church tax
 * (Kirchensteuer) are layered on top.
 *
 * This is an estimate for tax class I, not a payroll-exact figure. Allowances
 * such as children, marriage splitting, and individual health insurer rates are
 * out of scope.
 *
 * No financial advice. Figures reflect statutory rates only.
 */

// --- Social insurance: contribution ceilings and employee rates (2026) ---
// Rentenversicherung / Arbeitslosenversicherung ceiling (general, monthly 8450 * 12).
export const RV_ALV_CEILING = 101400;
// Krankenversicherung / Pflegeversicherung ceiling (monthly 5812.50 * 12).
export const KV_PV_CEILING = 69750;
// Employee share: pension 9.3% + unemployment 1.3%.
export const RV_EMPLOYEE_RATE = 0.093;
export const ALV_EMPLOYEE_RATE = 0.013;
// Employee health: 7.3% general + 1.45% (half of an assumed 2.9% average Zusatzbeitrag).
export const KV_EMPLOYEE_RATE = 0.0875;
// Long-term care: 1.8% employee share, plus 0.6% childless surcharge (paid by employee).
export const PV_EMPLOYEE_RATE = 0.018;
export const PV_CHILDLESS_SURCHARGE = 0.006;

// Employee lump-sum allowance (Arbeitnehmer-Pauschbetrag / Werbungskostenpauschale).
export const ARBEITNEHMER_PAUSCHBETRAG = 1230;

// --- Einkommensteuer 2026 (section 32a EStG) ---
export const GRUNDFREIBETRAG_2026 = 12348;
export const ZONE2_LIMIT = 17799;
export const ZONE3_LIMIT = 69878;
export const ZONE4_LIMIT = 277825;

// --- Solidaritaetszuschlag (single) ---
export const SOLI_RATE = 0.055;
export const SOLI_FREIGRENZE_SINGLE = 20350; // No soli if income tax at or below this.
export const SOLI_MILDERUNG_RATE = 0.119; // Phase-in (Milderungszone) on the excess.

// --- Kirchensteuer (church tax) ---
// 9% of income tax in most states (8% in Bavaria and Baden-Wuerttemberg).
export const CHURCH_TAX_RATE = 0.09;

export interface GermanySalaryInputs {
  /** Gross annual salary (Bruttojahresgehalt) in EUR. */
  readonly grossAnnualSalary: number;
  /** Whether church tax (Kirchensteuer) applies. */
  readonly churchTax: boolean;
  /**
   * Whether the employee is childless and aged 23 or over, which adds the
   * 0.6% long-term care surcharge. Defaults to true (most conservative net).
   */
  readonly childless: boolean;
}

export interface GermanySalaryResult {
  /** Gross annual salary echoed back. */
  readonly grossAnnual: number;
  /** Net annual salary after all deductions. */
  readonly netAnnual: number;
  /** Net monthly salary (netAnnual / 12). */
  readonly netMonthly: number;
  /** Income tax (Lohnsteuer/Einkommensteuer) for the year. */
  readonly incomeTax: number;
  /** Solidarity surcharge (Solidaritaetszuschlag). */
  readonly soli: number;
  /** Church tax (Kirchensteuer), 0 if not applicable. */
  readonly churchTax: number;
  /** Pension insurance employee share (Rentenversicherung). */
  readonly pension: number;
  /** Health insurance employee share (Krankenversicherung). */
  readonly health: number;
  /** Unemployment insurance employee share (Arbeitslosenversicherung). */
  readonly unemployment: number;
  /** Long-term care insurance employee share (Pflegeversicherung). */
  readonly care: number;
  /** Total employee social insurance contributions. */
  readonly socialTotal: number;
  /** Total of all deductions (tax + soli + church + social). */
  readonly totalDeductions: number;
  /** Taxable income used for the section 32a calculation (zvE). */
  readonly taxableIncome: number;
  /** Effective deduction rate as a percentage of gross. */
  readonly effectiveRate: number;
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Employee income tax under section 32a EStG (Veranlagungszeitraum 2026).
 * Input is taxable income (zvE); the formula floors it to whole euros and the
 * resulting tax is floored to whole euros.
 */
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

/**
 * Total employee social insurance for the year. Each branch is capped at its
 * own contribution ceiling.
 */
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

/**
 * Solidarity surcharge for a single taxpayer. None below the Freigrenze; a
 * gentler phase-in (Milderungszone) caps the surcharge just above it.
 */
export function calculateSoli(incomeTax: number): number {
  if (incomeTax <= SOLI_FREIGRENZE_SINGLE) return 0;
  const full = SOLI_RATE * incomeTax;
  const milderung = SOLI_MILDERUNG_RATE * (incomeTax - SOLI_FREIGRENZE_SINGLE);
  return Math.min(full, milderung);
}

/**
 * Estimate German net salary for tax class I.
 *
 * Steps (in words):
 *  1. Employee social insurance = pension + unemployment (capped at 101,400)
 *     plus health + care (capped at 69,750), using the 2026 employee rates.
 *  2. Taxable income (zvE) = gross minus the tax-deductible Vorsorge (pension +
 *     health + care; unemployment insurance is NOT tax-deductible) minus the
 *     1,230 employee lump-sum allowance, floored at zero.
 *  3. Income tax = section 32a EStG applied to the zvE.
 *  4. Solidarity surcharge applied to the income tax (with the single
 *     Freigrenze and Milderungszone).
 *  5. Church tax = 9% of income tax if selected, else zero.
 *  6. Net = gross minus income tax minus soli minus church minus social.
 */
export function calculateGermanySalary(inputs: GermanySalaryInputs): GermanySalaryResult {
  const gross = Math.max(0, inputs.grossAnnualSalary || 0);
  const childless = inputs.childless;

  const { pension, unemployment, health, care } = calculateSocial(gross, childless);
  const socialTotal = pension + unemployment + health + care;

  // Unemployment insurance (ALV) is NOT tax-deductible in Germany; only pension,
  // health and care reduce the taxable base (Vorsorgepauschale). ALV is still a
  // real deduction from take-home pay (in socialTotal below).
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
