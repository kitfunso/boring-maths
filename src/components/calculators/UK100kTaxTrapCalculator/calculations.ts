/** UK £100k Tax Trap: income tax + NI + student loan, with optimal-pension calculation to restore Personal Allowance lost in the £100k-£125,140 taper band. */

import type {
  UK100kInputs,
  UK100kResult,
  TaxBandBreakdown,
  TaxComparison,
  TaxRegion,
  StudentLoanPlan,
} from './types';

import {
  PA_TAPER_THRESHOLD,
  NI_PRIMARY_THRESHOLD,
  NI_UPPER_LIMIT,
  NI_MAIN_RATE,
  NI_UPPER_RATE,
  TAX_TRAP_START,
  TAX_TRAP_END,
  STUDENT_LOAN_PLANS,
  getTaxBands,
  calculatePersonalAllowance,
  calculatePALost,
  isInTaxTrap,
} from './taxData';

export function calculateIncomeTax(
  taxableIncome: number,
  region: TaxRegion,
  personalAllowance: number
): { total: number; breakdown: TaxBandBreakdown[] } {
  const bands = getTaxBands(region);
  const breakdown: TaxBandBreakdown[] = [];
  let totalTax = 0;
  let remainingIncome = taxableIncome;

  // Adjust the first band (Personal Allowance) based on actual PA
  const adjustedBands = bands.map((band, index) => {
    if (index === 0) {
      return { ...band, to: personalAllowance };
    }
    if (index === 1) {
      return { ...band, from: personalAllowance + 1 };
    }
    return band;
  });

  for (const band of adjustedBands) {
    if (remainingIncome <= 0) break;

    const bandWidth = band.to === Infinity ? remainingIncome : band.to - band.from + 1;
    const taxableInBand = Math.min(remainingIncome, Math.max(0, bandWidth));

    if (taxableInBand > 0 && band.rate > 0) {
      const taxForBand = taxableInBand * band.rate;
      totalTax += taxForBand;

      breakdown.push({
        name: band.name,
        rate: band.rate,
        taxableAmount: taxableInBand,
        taxPaid: taxForBand,
      });
    }

    remainingIncome -= taxableInBand;
  }

  return { total: Math.round(totalTax), breakdown };
}

/** Employee NI only (not employer NI). */
export function calculateNationalInsurance(grossIncome: number): number {
  if (grossIncome <= NI_PRIMARY_THRESHOLD) {
    return 0;
  }

  let ni = 0;

  // 8% on earnings between Primary Threshold and Upper Limit
  const mainBandIncome = Math.min(grossIncome, NI_UPPER_LIMIT) - NI_PRIMARY_THRESHOLD;
  if (mainBandIncome > 0) {
    ni += mainBandIncome * NI_MAIN_RATE;
  }

  // 2% on earnings above Upper Limit
  if (grossIncome > NI_UPPER_LIMIT) {
    ni += (grossIncome - NI_UPPER_LIMIT) * NI_UPPER_RATE;
  }

  return Math.round(ni);
}

export function calculateStudentLoan(grossIncome: number, plan: StudentLoanPlan): number {
  const config = STUDENT_LOAN_PLANS[plan];

  if (grossIncome <= config.threshold) {
    return 0;
  }

  const repayment = (grossIncome - config.threshold) * config.rate;
  return Math.round(repayment);
}

export function calculateMarginalRate(
  income: number,
  region: TaxRegion,
  hasStudentLoan: boolean
): number {
  const bands = getTaxBands(region);

  let taxRate = 0;
  for (const band of bands) {
    if (income >= band.from && (band.to === Infinity || income <= band.to)) {
      taxRate = band.rate;
      break;
    }
  }

  let niRate = 0;
  if (income > NI_PRIMARY_THRESHOLD && income <= NI_UPPER_LIMIT) {
    niRate = NI_MAIN_RATE;
  } else if (income > NI_UPPER_LIMIT) {
    niRate = NI_UPPER_RATE;
  }

  const slRate = hasStudentLoan ? 0.09 : 0;

  // Tax trap zone adds effective 20% (PA lost at 50%, taxed at 40%)
  let trapRate = 0;
  if (income > TAX_TRAP_START && income <= TAX_TRAP_END) {
    trapRate = 0.2; // Effective rate from PA tapering
  }

  return taxRate + niRate + slRate + trapRate;
}

export function calculateTaxTrapCost(totalIncome: number, region: TaxRegion): number {
  if (totalIncome <= PA_TAPER_THRESHOLD) {
    return 0;
  }

  const paLost = calculatePALost(totalIncome);

  // The lost PA would have been tax-free; it's now taxed at 40% (42% Scotland) — the "hidden" tax from the trap.
  void getTaxBands(region); // Tax bands available if needed
  const higherRate = region === 'scotland' ? 0.42 : 0.4;

  return Math.round(paLost * higherRate);
}

export function calculateOptimalPension(totalIncome: number, currentPension: number): number {
  if (totalIncome - currentPension <= PA_TAPER_THRESHOLD) {
    return currentPension;
  }

  // Optimal: reduce taxable income to exactly £100,000, restoring full PA while keeping as much high income as possible.
  const optimalTaxableIncome = PA_TAPER_THRESHOLD;
  const requiredContribution = totalIncome - optimalTaxableIncome;

  return Math.max(currentPension, requiredContribution);
}

export function calculateUK100kTax(inputs: UK100kInputs): UK100kResult {
  const { grossSalary, taxRegion, studentLoanPlan, currentPensionPercent, bonusIncome } = inputs;

  const totalIncome = grossSalary + bonusIncome;

  const currentPensionContribution = Math.round(grossSalary * (currentPensionPercent / 100));

  // Taxable income (after pension sacrifice)
  const taxableIncome = totalIncome - currentPensionContribution;

  const personalAllowance = calculatePersonalAllowance(taxableIncome);
  const personalAllowanceLost = calculatePALost(taxableIncome);

  const { total: incomeTax, breakdown: taxBreakdown } = calculateIncomeTax(
    taxableIncome,
    taxRegion,
    personalAllowance
  );

  // NI is calculated on (gross - pension), assuming salary-sacrifice; a personal pension wouldn't reduce NI this way, so real NI could be higher than shown.
  const nationalInsurance = calculateNationalInsurance(grossSalary - currentPensionContribution);

  const studentLoanRepayment = calculateStudentLoan(taxableIncome, studentLoanPlan);

  const takeHomePay = taxableIncome - incomeTax - nationalInsurance - studentLoanRepayment;

  const totalDeductions = incomeTax + nationalInsurance + studentLoanRepayment;
  const effectiveTaxRate = totalDeductions / totalIncome;

  const marginalTaxRate = calculateMarginalRate(
    taxableIncome,
    taxRegion,
    studentLoanPlan !== 'none'
  );

  const inTaxTrap = isInTaxTrap(taxableIncome);
  const taxTrapCost = calculateTaxTrapCost(taxableIncome, taxRegion);
  const incomeInTrapZone = inTaxTrap ? Math.min(taxableIncome, TAX_TRAP_END) - TAX_TRAP_START : 0;

  const optimalPensionContribution = calculateOptimalPension(
    totalIncome,
    currentPensionContribution
  );
  const optimalPensionPercent = (optimalPensionContribution / grossSalary) * 100;

  const optimizedTaxableIncome = totalIncome - optimalPensionContribution;
  const optimizedPA = calculatePersonalAllowance(optimizedTaxableIncome);

  const { total: optimizedIncomeTax } = calculateIncomeTax(
    optimizedTaxableIncome,
    taxRegion,
    optimizedPA
  );

  const optimizedNI = calculateNationalInsurance(grossSalary - optimalPensionContribution);
  const optimizedStudentLoan = calculateStudentLoan(optimizedTaxableIncome, studentLoanPlan);

  const optimizedTakeHomePay =
    optimizedTaxableIncome - optimizedIncomeTax - optimizedNI - optimizedStudentLoan;

  const currentTotalTax = incomeTax + nationalInsurance;
  const optimizedTotalTax = optimizedIncomeTax + optimizedNI;
  const annualTaxSaved = currentTotalTax - optimizedTotalTax;

  // Total benefit includes tax saved + extra pension value
  const extraPensionContribution = optimalPensionContribution - currentPensionContribution;
  const totalBenefit = annualTaxSaved + extraPensionContribution;

  // Pension gain ratio: how much goes to pension vs take-home reduction
  const takeHomeReduction = takeHomePay - optimizedTakeHomePay;
  const pensionGainRatio = takeHomeReduction > 0 ? extraPensionContribution / takeHomeReduction : 0;

  const comparison: TaxComparison[] = [
    {
      label: 'Gross Salary',
      current: totalIncome,
      optimized: totalIncome,
      difference: 0,
    },
    {
      label: 'Pension Contribution',
      current: currentPensionContribution,
      optimized: optimalPensionContribution,
      difference: optimalPensionContribution - currentPensionContribution,
    },
    {
      label: 'Taxable Income',
      current: taxableIncome,
      optimized: optimizedTaxableIncome,
      difference: optimizedTaxableIncome - taxableIncome,
    },
    {
      label: 'Personal Allowance',
      current: personalAllowance,
      optimized: optimizedPA,
      difference: optimizedPA - personalAllowance,
    },
    {
      label: 'Income Tax',
      current: incomeTax,
      optimized: optimizedIncomeTax,
      difference: optimizedIncomeTax - incomeTax,
    },
    {
      label: 'National Insurance',
      current: nationalInsurance,
      optimized: optimizedNI,
      difference: optimizedNI - nationalInsurance,
    },
    {
      label: 'Take-Home Pay',
      current: takeHomePay,
      optimized: optimizedTakeHomePay,
      difference: optimizedTakeHomePay - takeHomePay,
    },
  ];

  return {
    totalIncome,
    taxableIncome,
    personalAllowance,
    personalAllowanceLost,
    incomeTax,
    nationalInsurance,
    studentLoanRepayment,
    currentPensionContribution,
    takeHomePay,
    effectiveTaxRate,
    marginalTaxRate,

    isInTaxTrap: inTaxTrap,
    taxTrapCost,
    incomeInTrapZone,

    optimalPensionContribution,
    optimalPensionPercent,
    optimizedTakeHomePay,
    annualTaxSaved,
    totalBenefit,
    pensionGainRatio,

    taxBreakdown,
    comparison,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-GB').format(Math.round(value));
}
