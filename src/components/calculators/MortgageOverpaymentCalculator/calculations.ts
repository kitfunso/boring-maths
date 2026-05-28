/**
 * Mortgage Overpayment Calculator - pure logic.
 *
 * Compares a repayment mortgage paid on its normal schedule against the same
 * mortgage with a regular monthly overpayment and an optional one off lump
 * sum. It amortises both scenarios month by month and reports the interest
 * saved, the time saved, and the new payoff date.
 *
 * All inputs are user supplied. There is no statutory constant here: the
 * balance, interest rate, remaining term and overpayments all come from the
 * user's own mortgage.
 */

// Months in a year, used to convert an annual rate and term to monthly.
export const MONTHS_PER_YEAR = 12;
// Safety cap on the simulation length so a pathological input (for example a
// payment too small to ever clear the interest) cannot loop forever. This is
// far longer than any real mortgage term.
const MAX_MONTHS = 1200; // 100 years.
// Floating point tolerance, in pounds. A balance at or below this is treated
// as fully cleared so rounding residue from a repeating monthly payment (for
// example 100000 / 120 = 833.333...) does not add a spurious extra month.
const BALANCE_EPSILON = 0.005; // Half a penny.

export interface MortgageOverpaymentInputs {
  // Outstanding mortgage balance.
  balance: number;
  // Annual interest rate as a percentage, for example 4.5 means 4.5 percent.
  interestRate: number;
  // Remaining term in years.
  termYears: number;
  // Extra amount paid each month on top of the normal payment.
  monthlyOverpayment: number;
  // Optional one off lump sum paid at the very start (month one).
  lumpSum: number;
}

export interface MortgageOverpaymentResult {
  // Normal contractual monthly payment (principal and interest).
  monthlyPayment: number;
  // Total interest paid over the original schedule, no overpayments.
  originalTotalInterest: number;
  // Months taken to clear the balance on the original schedule.
  originalMonths: number;
  // Total interest paid with the overpayments applied.
  newTotalInterest: number;
  // Months taken to clear the balance with overpayments.
  newMonths: number;
  // Interest saved: originalTotalInterest minus newTotalInterest.
  interestSaved: number;
  // Months saved: originalMonths minus newMonths.
  monthsSaved: number;
  // Years portion of the time saved (whole years).
  yearsSaved: number;
  // Remaining months portion of the time saved after whole years.
  remainingMonthsSaved: number;
  // ISO date string (yyyy-mm-dd) for the new payoff, counted from today.
  newPayoffDate: string;
}

/**
 * Standard repayment mortgage monthly payment.
 *
 * P = L * r / (1 - (1 + r)^-n)
 * where r is the monthly interest rate and n is the number of months.
 * When r is zero the payment is simply the loan divided by the months.
 */
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

/**
 * Amortise a balance month by month and return the total interest paid and the
 * number of months taken to clear it.
 *
 * Each month: interest = balance * monthlyRate, principal = payment + extra
 * payment - interest, then balance is reduced by the principal. A one off lump
 * sum is applied in the first month before the regular payment. The final
 * month's payment is trimmed so the balance lands exactly on zero rather than
 * going negative, which keeps the interest total accurate.
 */
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
    // Apply the one off lump sum at the very start of the first month.
    if (month === 1 && lumpSum > 0) {
      balance = Math.max(0, balance - lumpSum);
      if (balance === 0) {
        months = 1;
        break;
      }
    }

    const interest = balance * monthlyRate;
    totalInterest += interest;

    // Principal repaid this month is everything beyond the interest, including
    // the regular overpayment.
    const principal = monthlyPayment + monthlyExtra - interest;

    // If the payment does not even cover the interest the balance can never be
    // cleared. Stop and report the cap so the caller can surface a sane result.
    if (principal <= 0) {
      months = MAX_MONTHS;
      break;
    }

    if (principal >= balance - BALANCE_EPSILON) {
      // Final month: the remaining balance is repaid in full. The epsilon
      // absorbs floating point residue from a repeating payment so a loan that
      // mathematically clears on the last month is not pushed into an extra one.
      balance = 0;
      months = month;
      break;
    }

    balance -= principal;
    months = month;
  }

  return { totalInterest, months };
}

/**
 * Add a whole number of months to today's date and return it as an ISO
 * yyyy-mm-dd string. Used to show the new payoff date.
 */
function addMonthsToToday(months: number, from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setMonth(d.getMonth() + months);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Main pure calculation. Negative inputs are floored at zero so the result
 * stays sensible if a field is cleared. An optional reference date can be
 * passed to make the payoff date deterministic in tests.
 */
export function calculateMortgageOverpayment(
  inputs: MortgageOverpaymentInputs,
  today: Date = new Date()
): MortgageOverpaymentResult {
  // Floor each input at zero, treating a non finite value (NaN or Infinity from
  // a blank or malformed field) as zero so the result stays finite.
  const balance = Number.isFinite(inputs.balance) ? Math.max(0, inputs.balance) : 0;
  const interestRate = Number.isFinite(inputs.interestRate) ? Math.max(0, inputs.interestRate) : 0;
  const termYears = Number.isFinite(inputs.termYears) ? Math.max(0, inputs.termYears) : 0;
  const monthlyOverpayment = Number.isFinite(inputs.monthlyOverpayment)
    ? Math.max(0, inputs.monthlyOverpayment)
    : 0;
  const lumpSum = Number.isFinite(inputs.lumpSum) ? Math.max(0, inputs.lumpSum) : 0;

  // With no remaining term there is no schedule to amortise. Return a zeroed
  // result rather than letting the simulation hit the MAX_MONTHS cap, which
  // would otherwise surface a payoff date roughly a century away.
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

  // Baseline: the contractual schedule with no overpayments.
  const original = amortise(balance, monthlyRate, monthlyPayment, 0, 0);

  // With overpayments: same payment plus the monthly extra and the lump sum.
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
