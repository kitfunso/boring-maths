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

function parseTaxCode(code: string): { personalAllowance: number; special: string | null } {
  const trimmed = code.trim().toUpperCase();

  if (trimmed === 'BR') return { personalAllowance: 0, special: 'BR' };
  if (trimmed === 'D0') return { personalAllowance: 0, special: 'D0' };
  if (trimmed === 'D1') return { personalAllowance: 0, special: 'D1' };
  if (trimmed === '0T') return { personalAllowance: 0, special: null };
  if (trimmed === 'NT') return { personalAllowance: 0, special: 'NT' };

  const match = trimmed.match(/^(\d+)[A-Z]?$/);
  if (match) {
    return { personalAllowance: parseInt(match[1], 10) * 10, special: null };
  }

  return { personalAllowance: PERSONAL_ALLOWANCE, special: null };
}

function calculatePersonalAllowance(
  grossSalary: number,
  blindAllowance: boolean,
  taxCodeOverride: string
): number {
  const { personalAllowance: codePa, special } = parseTaxCode(taxCodeOverride);

  if (special === 'NT' || special === 'BR' || special === 'D0' || special === 'D1') {
    return 0;
  }

  const isDefaultCode = taxCodeOverride.trim().toUpperCase() === '1257L';

  let pa = isDefaultCode ? PERSONAL_ALLOWANCE : codePa;

  if (blindAllowance) {
    pa += BLIND_PERSONS_ALLOWANCE;
  }

  if (isDefaultCode && grossSalary > PA_TAPER_THRESHOLD) {
    const reduction = Math.floor((grossSalary - PA_TAPER_THRESHOLD) * PA_TAPER_RATE);
    pa = Math.max(0, pa - reduction);
  }

  return pa;
}

function calculateIncomeTax(
  taxableIncome: number,
  personalAllowance: number,
  taxRegion: 'england' | 'scotland',
  taxCodeOverride: string
): { totalTax: number; bands: TaxBandBreakdown[] } {
  const { special } = parseTaxCode(taxCodeOverride);

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

function calculateEmployeeNIC(grossSalary: number): number {
  const { primaryThreshold, upperEarningsLimit, mainRate, upperRate } = EMPLOYEE_NIC;

  if (grossSalary <= primaryThreshold) return 0;

  let nic = 0;

  const mainBand = Math.min(grossSalary, upperEarningsLimit) - primaryThreshold;
  if (mainBand > 0) {
    nic += mainBand * mainRate;
  }

  if (grossSalary > upperEarningsLimit) {
    nic += (grossSalary - upperEarningsLimit) * upperRate;
  }

  return round(nic);
}

function calculateStudentLoan(
  grossSalary: number,
  plan: 'none' | 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgraduate'
): number {
  if (plan === 'none' || plan === 'postgraduate') return 0;

  const config = STUDENT_LOAN_THRESHOLDS[plan];
  if (grossSalary <= config.threshold) return 0;

  return round((grossSalary - config.threshold) * config.rate);
}

function calculatePostgraduateLoan(grossSalary: number, plan: string): number {
  if (plan !== 'postgraduate') return 0;

  const config = STUDENT_LOAN_THRESHOLDS.postgraduate;
  if (grossSalary <= config.threshold) return 0;

  return round((grossSalary - config.threshold) * config.rate);
}

function calculatePension(grossSalary: number, pensionRate: number): number {
  if (pensionRate <= 0) return 0;
  return round(grossSalary * (pensionRate / 100));
}

function calculateMarginalRate(
  grossSalary: number,
  taxRegion: 'england' | 'scotland',
  studentLoanPlan: string,
  pensionRate: number,
  pensionType: string
): number {
  let rate = 0;

  const pa =
    grossSalary > PA_TAPER_THRESHOLD
      ? Math.max(
          0,
          PERSONAL_ALLOWANCE - Math.floor((grossSalary - PA_TAPER_THRESHOLD) * PA_TAPER_RATE)
        )
      : PERSONAL_ALLOWANCE;

  const inTaperZone = grossSalary >= PA_TAPER_THRESHOLD && grossSalary < 125140;

  if (taxRegion === 'scotland') {
    if (grossSalary <= pa) rate = 0;
    else if (grossSalary <= 16537) rate = 19;
    else if (grossSalary <= 29526) rate = 20;
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

  if (inTaperZone && pa > 0) {
    if (taxRegion === 'scotland') {
      rate = Math.round(rate * 1.5);
    } else {
      rate = 60;
    }
  }

  if (
    grossSalary > EMPLOYEE_NIC.primaryThreshold &&
    grossSalary <= EMPLOYEE_NIC.upperEarningsLimit
  ) {
    rate += 8;
  } else if (grossSalary > EMPLOYEE_NIC.upperEarningsLimit) {
    rate += 2;
  }

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

  if (pensionType === 'salary_sacrifice' && pensionRate > 0) {
    // Salary sacrifice reduces gross, so marginal deductions are slightly less
    // But for simplicity, the pension % itself is an additional deduction on each pound
    // Actually pension % is taken off the top regardless, it's a separate deduction
  }

  return round(rate, 1);
}

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

  const pensionContribution = calculatePension(grossSalary, pensionRate);
  const taxableGross =
    pensionType === 'salary_sacrifice' ? grossSalary - pensionContribution : grossSalary;

  const personalAllowance = calculatePersonalAllowance(
    taxableGross,
    blindPersonsAllowance,
    taxCodeOverride
  );

  let incomeTaxGross = taxableGross;
  if (pensionType === 'relief_at_source') {
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

  const nicableGross =
    pensionType === 'salary_sacrifice' ? grossSalary - pensionContribution : grossSalary;
  const nationalInsurance = calculateEmployeeNIC(nicableGross);

  const studentLoanRepayment = calculateStudentLoan(grossSalary, studentLoanPlan);
  const postgraduateLoanRepayment = calculatePostgraduateLoan(grossSalary, studentLoanPlan);

  const totalDeductions =
    incomeTax +
    nationalInsurance +
    studentLoanRepayment +
    postgraduateLoanRepayment +
    pensionContribution;

  const takeHomePay = round(grossSalary - totalDeductions);

  const effectiveTaxRate = grossSalary > 0 ? round((totalDeductions / grossSalary) * 100, 1) : 0;

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

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
