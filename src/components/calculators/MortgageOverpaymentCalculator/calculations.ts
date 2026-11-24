export const MONTHS_PER_YEAR = 12;
const MAX_MONTHS = 1200;
const BALANCE_EPSILON = 0.005;

export interface MortgageOverpaymentInputs {
  balance: number;
  interestRate: number;
  termYears: number;
  monthlyOverpayment: number;
  lumpSum: number;
}

export interface MortgageOverpaymentResult {
  monthlyPayment: number;
  originalTotalInterest: number;
  originalMonths: number;
  newTotalInterest: number;
  newMonths: number;
  interestSaved: number;
  monthsSaved: number;
  yearsSaved: number;
  remainingMonthsSaved: number;
  newPayoffDate: string;
}

export function calculateMonthlyPayment(
  loan: number,
  annualRatePercent: number,
  termYears: number
): number {
  const months = Math.round(termYears * MONTHS_PER_YEAR);
  if (months <= 0 || loan <= 0) return 0;

  const monthlyRate = annualRatePercent / 100 / MONTHS_PER_YEAR;
  if (monthlyRate === 0) {
    return loan / months;
  }

  return (loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

interface AmortisationOutcome {
  totalInterest: number;
  months: number;
}

function amortise(
  startingBalance: number,
  monthlyRate: number,
  monthlyPayment: number,
  monthlyExtra: number,
  lumpSum: number
): AmortisationOutcome {
  let balance = startingBalance;
  let totalInterest = 0;
  let months = 0;

  if (balance <= 0) {
    return { totalInterest: 0, months: 0 };
  }

  for (let month = 1; month <= MAX_MONTHS; month++) {
    if (month === 1 && lumpSum > 0) {
      balance = Math.max(0, balance - lumpSum);
      if (balance === 0) {
        months = 1;
        break;
      }
    }

    const interest = balance * monthlyRate;
    totalInterest += interest;

    const principal = monthlyPayment + monthlyExtra - interest;

    if (principal <= 0) {
      months = MAX_MONTHS;
      break;
    }

    if (principal >= balance - BALANCE_EPSILON) {
      balance = 0;
      months = month;
      break;
    }

    balance -= principal;
    months = month;
  }

  return { totalInterest, months };
}

function addMonthsToToday(months: number, from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setMonth(d.getMonth() + months);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateMortgageOverpayment(
  inputs: MortgageOverpaymentInputs,
  today: Date = new Date()
): MortgageOverpaymentResult {
  const balance = Number.isFinite(inputs.balance) ? Math.max(0, inputs.balance) : 0;
  const interestRate = Number.isFinite(inputs.interestRate) ? Math.max(0, inputs.interestRate) : 0;
  const termYears = Number.isFinite(inputs.termYears) ? Math.max(0, inputs.termYears) : 0;
  const monthlyOverpayment = Number.isFinite(inputs.monthlyOverpayment)
    ? Math.max(0, inputs.monthlyOverpayment)
    : 0;
  const lumpSum = Number.isFinite(inputs.lumpSum) ? Math.max(0, inputs.lumpSum) : 0;

  if (termYears <= 0) {
    return {
      monthlyPayment: 0,
      originalTotalInterest: 0,
      originalMonths: 0,
      newTotalInterest: 0,
      newMonths: 0,
      interestSaved: 0,
      monthsSaved: 0,
      yearsSaved: 0,
      remainingMonthsSaved: 0,
      newPayoffDate: '',
    };
  }

  const monthlyRate = interestRate / 100 / MONTHS_PER_YEAR;
  const monthlyPayment = calculateMonthlyPayment(balance, interestRate, termYears);

  const original = amortise(balance, monthlyRate, monthlyPayment, 0, 0);

  const improved = amortise(balance, monthlyRate, monthlyPayment, monthlyOverpayment, lumpSum);

  const interestSaved = Math.max(0, original.totalInterest - improved.totalInterest);
  const monthsSaved = Math.max(0, original.months - improved.months);
  const yearsSaved = Math.floor(monthsSaved / MONTHS_PER_YEAR);
  const remainingMonthsSaved = monthsSaved % MONTHS_PER_YEAR;

  return {
    monthlyPayment,
    originalTotalInterest: original.totalInterest,
    originalMonths: original.months,
    newTotalInterest: improved.totalInterest,
    newMonths: improved.months,
    interestSaved,
    monthsSaved,
    yearsSaved,
    remainingMonthsSaved,
    newPayoffDate: addMonthsToToday(improved.months, today),
  };
}
