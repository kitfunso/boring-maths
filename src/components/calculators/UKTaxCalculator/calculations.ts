/**
 * UK Tax Calculator - Calculation Logic
 * 2025/26 tax year
 */

import type { UKTaxInputs, UKTaxResult, TaxBandBreakdown } from './types';
import {
  PERSONAL_ALLOWANCE,
  PA_TAPER_THRESHOLD,
  PA_TAPER_RATE,
  BLIND_PERSONS_ALLOWANCE,
  ENGLAND_TAX_BANDS,
  SCOTLAND_TAX_BANDS,
  EMPLOYEE_NIC,
  STUDENT_LOAN_THRESHOLDS,
} from './types';

/**
 * Parse a tax code to derive personal allowance.
 * Standard codes: 1257L means PA of £12,570.
 * Also handles BR (all basic rate), D0 (all higher), D1 (all additional), 0T (no PA), NT (no tax).
 */
function parseTaxCode(code: string): { personalAllowance: number; special: string | null } {
  const trimmed = code.trim().toUpperCase();

  if (trimmed === 'BR') return { personalAllowance: 0, special: 'BR' };
  if (trimmed === 'D0') return { personalAllowance: 0, special: 'D0' };
  if (trimmed === 'D1') return { personalAllowance: 0, special: 'D1' };
  if (trimmed === '0T') return { personalAllowance: 0, special: null };
  if (trimmed === 'NT') return { personalAllowance: 0, special: 'NT' };

  // Extract numeric part (e.g. 1257L -> 1257 -> £12,570)
  const match = trimmed.match(/^(\d+)[A-Z]?$/);
  if (match) {
    return { personalAllowance: parseInt(match[1], 10) * 10, special: null };
  }

  // Default fallback
  return { personalAllowance: PERSONAL_ALLOWANCE, special: null };
}

/**
 * Calculate the effective personal allowance after tapering
 */
function calculatePersonalAllowance(
  grossSalary: number,
  blindAllowance: boolean,
  taxCodeOverride: string
): number {
  const { personalAllowance: codePa, special } = parseTaxCode(taxCodeOverride);

  if (special === 'NT' || special === 'BR' || special === 'D0' || special === 'D1') {
    return 0;
  }

  // Use default PA logic (with tapering) only if default code
  const isDefaultCode = taxCodeOverride.trim().toUpperCase() === '1257L';

  let pa = isDefaultCode ? PERSONAL_ALLOWANCE : codePa;

  // Add blind person's allowance
  if (blindAllowance) {
    pa += BLIND_PERSONS_ALLOWANCE;
  }

  // Apply tapering for incomes over £100,000 (only if using default-style code)
  if (isDefaultCode && grossSalary > PA_TAPER_THRESHOLD) {
    const reduction = Math.floor((grossSalary - PA_TAPER_THRESHOLD) * PA_TAPER_RATE);
    pa = Math.max(0, pa - reduction);
  }

  return pa;
}

/**
 * Calculate income tax with band-by-band breakdown
 */
function calculateIncomeTax(
  taxableIncome: number,
  personalAllowance: number,
  taxRegion: 'england' | 'scotland',
  taxCodeOverride: string
): { totalTax: number; bands: TaxBandBreakdown[] } {
  const { special } = parseTaxCode(taxCodeOverride);

  // Special tax codes
  if (special === 'NT') return { totalTax: 0, bands: [] };
  if (special === 'BR') {
    const tax = round(taxableIncome * 0.2);
    return {
      totalTax: tax,
      bands: [
        {
          band: 'Basic Rate (BR code)',
          rate: 20,
          from: 0,
          to: taxableIncome,
          taxableAmount: taxableIncome,
          tax,
        },
      ],
    };
  }
  if (special === 'D0') {
    const tax = round(taxableIncome * 0.4);
    return {
      totalTax: tax,
      bands: [
        {
          band: 'Higher Rate (D0 code)',
          rate: 40,
          from: 0,
          to: taxableIncome,
          taxableAmount: taxableIncome,
          tax,
        },
      ],
    };
  }
  if (special === 'D1') {
    const tax = round(taxableIncome * 0.45);
    return {
      totalTax: tax,
      bands: [
        {
          band: 'Additional Rate (D1 code)',
          rate: 45,
          from: 0,
          to: taxableIncome,
          taxableAmount: taxableIncome,
          tax,
        },
      ],
    };
  }

  const rawBands = taxRegion === 'scotland' ? SCOTLAND_TAX_BANDS : ENGLAND_TAX_BANDS;

  // Build adjusted bands using the calculated personal allowance
  const bands: typeof rawBands = rawBands.map((band, i) => {
    if (i === 0) {
      return { ...band, to: personalAllowance };
    }
    if (i === 1) {
      return { ...band, from: personalAllowance + 1 };
    }
    return { ...band };
  });

  let totalTax = 0;
  const breakdown: TaxBandBreakdown[] = [];
  let remaining = taxableIncome;

  for (const band of bands) {
    if (remaining <= 0) break;

    const bandWidth = band.to === Infinity ? remaining : Math.max(0, band.to - band.from + 1);
    const amountInBand = Math.min(remaining, bandWidth);

    if (amountInBand > 0 && band.rate > 0) {
      const tax = round(amountInBand * band.rate);
      totalTax += tax;
      breakdown.push({
        band: band.name,
        rate: round(band.rate * 100, 0),
        from: band.from,
        to: band.to === Infinity ? taxableIncome : band.to,
        taxableAmount: round(amountInBand),
        tax,
      });
    }

    remaining -= amountInBand;
  }

  return { totalTax: round(totalTax), bands: breakdown };
}

/**
 * Calculate employee National Insurance contributions
 */
function calculateEmployeeNIC(grossSalary: number): number {
  const { primaryThreshold, upperEarningsLimit, mainRate, upperRate } = EMPLOYEE_NIC;

  if (grossSalary <= primaryThreshold) return 0;

  let nic = 0;

  // Main rate: 8% between primary threshold and upper earnings limit
  const mainBand = Math.min(grossSalary, upperEarningsLimit) - primaryThreshold;
  if (mainBand > 0) {
    nic += mainBand * mainRate;
  }

  // Upper rate: 2% above upper earnings limit
  if (grossSalary > upperEarningsLimit) {
    nic += (grossSalary - upperEarningsLimit) * upperRate;
  }

  return round(nic);
}

/**
 * Calculate student loan repayment (undergraduate plans)
 */
function calculateStudentLoan(
  grossSalary: number,
  plan: 'none' | 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgraduate'
): number {
  if (plan === 'none' || plan === 'postgraduate') return 0;

  const config = STUDENT_LOAN_THRESHOLDS[plan];
  if (grossSalary <= config.threshold) return 0;

  return round((grossSalary - config.threshold) * config.rate);
}

/**
 * Calculate postgraduate loan repayment
 */
function calculatePostgraduateLoan(grossSalary: number, plan: string): number {
  if (plan !== 'postgraduate') return 0;

  const config = STUDENT_LOAN_THRESHOLDS.postgraduate;
  if (grossSalary <= config.threshold) return 0;

  return round((grossSalary - config.threshold) * config.rate);
}

/**
 * Calculate pension contribution
 */
function calculatePension(grossSalary: number, pensionRate: number): number {
  if (pensionRate <= 0) return 0;
  return round(grossSalary * (pensionRate / 100));
}

/**
 * Calculate the marginal tax rate on the next pound earned
 */
function calculateMarginalRate(
  grossSalary: number,
  taxRegion: 'england' | 'scotland',
  studentLoanPlan: string,
  pensionRate: number,
  pensionType: string
): number {
  let rate = 0;

  // Income tax marginal rate
  const pa =
    grossSalary > PA_TAPER_THRESHOLD
      ? Math.max(
          0,
          PERSONAL_ALLOWANCE - Math.floor((grossSalary - PA_TAPER_THRESHOLD) * PA_TAPER_RATE)
        )
      : PERSONAL_ALLOWANCE;

  // In the taper zone (£100k-£125,140), effective IT rate is higher
  const inTaperZone = grossSalary >= PA_TAPER_THRESHOLD && grossSalary < 125140;

  if (taxRegion === 'scotland') {
    if (grossSalary <= pa) rate = 0;
    else if (grossSalary <= 14876) rate = 19;
    else if (grossSalary <= 26561) rate = 20;
    else if (grossSalary <= 43662) rate = 21;
    else if (grossSalary <= 75000) rate = 42;
    else if (grossSalary <= 125140) rate = 45;
    else rate = 48;
  } else {
    if (grossSalary <= pa) rate = 0;
    else if (grossSalary <= 50270) rate = 20;
    else if (grossSalary <= 125140) rate = 40;
    else rate = 45;
  }

  // PA taper adds effective rate: for each £2 over £100k, you lose £1 of PA
  // That means 40% tax on the lost PA = extra 20% (total 60% in England)
  if (inTaperZone && pa > 0) {
    if (taxRegion === 'scotland') {
      // Scotland: 45% on the income + 45% on the lost PA portion
      // For £2 extra income: lose £1 PA, that £1 taxed at 45% = 22.5% effective extra
      // But actually it depends which band the lost PA falls into
      // Simplified: in the taper zone, marginal rate = rate + (rate at bottom bands)
      // For Scotland: in taper zone salary is above £100k so rate is 45% +
      // the lost PA was at starter/basic rate but now taxed at higher rates
      // The effective rate: for every £2, lose £1 PA. That £1 becomes taxable at the bottom rate.
      // Scottish taper zone: marginal IT = 45% + 22.5% (half of 45%) = 67.5%...
      // Actually it's simpler: £2 extra income. £2 taxed at 45% = £0.90.
      // £1 PA lost means £1 more taxable at the LOWEST applicable rate (which depends on total)
      // Standard approach: marginal rate is effectively 1.5x the applicable rate in taper zone
      // England: 40% * 1.5 = 60%. Scotland advanced: 45% * 1.5 = 67.5%
      rate = Math.round(rate * 1.5);
    } else {
      // England: 40% rate + 20% from PA taper = 60%
      rate = 60;
    }
  }

  // NIC
  if (
    grossSalary > EMPLOYEE_NIC.primaryThreshold &&
    grossSalary <= EMPLOYEE_NIC.upperEarningsLimit
  ) {
    rate += 8;
  } else if (grossSalary > EMPLOYEE_NIC.upperEarningsLimit) {
    rate += 2;
  }

  // Student loan
  if (studentLoanPlan !== 'none' && studentLoanPlan !== 'postgraduate') {
    const config = STUDENT_LOAN_THRESHOLDS[studentLoanPlan as keyof typeof STUDENT_LOAN_THRESHOLDS];
    if (config && grossSalary > config.threshold) {
      rate += config.rate * 100;
    }
  }
  if (studentLoanPlan === 'postgraduate') {
    const config = STUDENT_LOAN_THRESHOLDS.postgraduate;
    if (grossSalary > config.threshold) {
      rate += config.rate * 100;
    }
  }

  // Pension (relief at source doesn't change marginal rate, salary sacrifice does)
  if (pensionType === 'salary_sacrifice' && pensionRate > 0) {
    // Salary sacrifice reduces gross, so marginal deductions are slightly less
    // But for simplicity, the pension % itself is an additional deduction on each pound
    // Actually pension % is taken off the top regardless, it's a separate deduction
  }

  return round(rate, 1);
}

/**
 * Main calculation function
 */
export function calculateUKTax(inputs: UKTaxInputs): UKTaxResult {
  const {
    grossSalary,
    taxRegion,
    studentLoanPlan,
    pensionRate,
    pensionType,
    blindPersonsAllowance,
    taxCodeOverride,
  } = inputs;

  // For salary sacrifice: pension comes off gross before tax/NIC
  const pensionContribution = calculatePension(grossSalary, pensionRate);
  const taxableGross =
    pensionType === 'salary_sacrifice' ? grossSalary - pensionContribution : grossSalary;

  // Calculate personal allowance (based on original gross for taper purposes)
  const personalAllowance = calculatePersonalAllowance(
    taxableGross,
    blindPersonsAllowance,
    taxCodeOverride
  );

  // Taxable income
  const taxableIncome = Math.max(0, taxableGross - personalAllowance);

  // Income tax - for relief at source, pension doesn't reduce taxable income
  // For salary sacrifice, pension already reduced the gross
  let incomeTaxGross = taxableGross;
  if (pensionType === 'relief_at_source') {
    // Relief at source: pension contribution gets basic rate tax relief at source
    // but the full gross is used for tax calculation, then pension is deducted from net
    // Actually, relief at source means the pension provider claims basic rate relief
    // The employee's taxable income is still the full gross minus PA
    // For higher/additional rate taxpayers, they claim extra relief via self-assessment
    // For this calculator, we simplify: taxable income = gross - PA (no pension deduction for tax)
    incomeTaxGross = grossSalary;
  }

  const paForTax =
    pensionType === 'relief_at_source'
      ? calculatePersonalAllowance(grossSalary, blindPersonsAllowance, taxCodeOverride)
      : personalAllowance;

  const taxableIncomeForTax = Math.max(0, incomeTaxGross - paForTax);
  const { totalTax: incomeTax, bands: taxBands } = calculateIncomeTax(
    incomeTaxGross,
    paForTax,
    taxRegion,
    taxCodeOverride
  );

  // NIC - salary sacrifice reduces NIC-able pay
  const nicableGross =
    pensionType === 'salary_sacrifice' ? grossSalary - pensionContribution : grossSalary;
  const nationalInsurance = calculateEmployeeNIC(nicableGross);

  // Student loans - based on full gross salary
  const studentLoanRepayment = calculateStudentLoan(grossSalary, studentLoanPlan);
  const postgraduateLoanRepayment = calculatePostgraduateLoan(grossSalary, studentLoanPlan);

  // Total deductions
  const totalDeductions =
    incomeTax +
    nationalInsurance +
    studentLoanRepayment +
    postgraduateLoanRepayment +
    pensionContribution;

  // Take home pay
  const takeHomePay = round(grossSalary - totalDeductions);

  // Effective tax rate
  const effectiveTaxRate = grossSalary > 0 ? round((totalDeductions / grossSalary) * 100, 1) : 0;

  // Marginal rate
  const marginalRate = calculateMarginalRate(
    grossSalary,
    taxRegion,
    studentLoanPlan,
    pensionRate,
    pensionType
  );

  return {
    grossSalary,
    personalAllowance: paForTax,
    taxableIncome: taxableIncomeForTax,
    incomeTax,
    nationalInsurance,
    studentLoanRepayment,
    postgraduateLoanRepayment,
    pensionContribution,
    totalDeductions,
    takeHomePay,
    effectiveTaxRate,
    marginalRate,
    taxBands,
    monthly: round(takeHomePay / 12),
    weekly: round(takeHomePay / 52),
    daily: round(takeHomePay / 365),
  };
}

/**
 * Round to specified decimal places
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Format a number as GBP currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
