/**
 * Debt Payoff Calculator - Calculation Logic
 *
 * Implements snowball (smallest balance first) and avalanche (highest interest first)
 * debt repayment strategies.
 */

import type {
  DebtPayoffInputs,
  DebtPayoffResult,
  StrategyResult,
  Debt,
  PayoffStrategy,
  MonthlySnapshot,
  MonthlyDebtPayment,
} from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

const MAX_MONTHS = 360; // 30 years max

/**
 * Round to 2 decimal places
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate monthly interest for a debt
 */
function calculateMonthlyInterest(balance: number, annualRate: number): number {
  return balance * (annualRate / 100 / 12);
}

/**
 * Sort debts by strategy
 */
function sortDebtsByStrategy(debts: Debt[], strategy: PayoffStrategy): Debt[] {
  const sorted = [...debts];

  if (strategy === 'avalanche') {
    // Highest interest rate first
    sorted.sort((a, b) => b.interestRate - a.interestRate);
  } else {
    // Smallest balance first (snowball)
    sorted.sort((a, b) => a.balance - b.balance);
  }

  return sorted;
}

/**
 * Simulate debt payoff for a given strategy
 */
function simulatePayoff(
  debts: Debt[],
  extraPayment: number,
  strategy: PayoffStrategy
): StrategyResult {
  // Create working copies with current balances
  const workingDebts = debts.map((d) => ({
    ...d,
    currentBalance: d.balance,
    isPaidOff: false,
  }));

  // Sort by strategy
  const sortedDebts = sortDebtsByStrategy(workingDebts, strategy);
  const payoffOrder: string[] = [];
  const timeline: MonthlySnapshot[] = [];

  let month = 0;
  let totalPaid = 0;
  let totalInterest = 0;

  // Continue until all debts are paid or max months reached
  while (
    workingDebts.some((d) => d.currentBalance > 0.01) &&
    month < MAX_MONTHS
  ) {
    month++;

    const monthPayments: MonthlyDebtPayment[] = [];
    let monthTotalPayment = 0;
    let monthTotalPrincipal = 0;
    let monthTotalInterest = 0;
    const debtsPaidOff: string[] = [];

    // Calculate available extra payment (minimums from paid-off debts + extra)
    let availableExtra =
      extraPayment +
      workingDebts
        .filter((d) => d.isPaidOff)
        .reduce((sum, d) => sum + d.minimumPayment, 0);

    // Sort active debts by strategy for payment priority
    const activeDebts = sortDebtsByStrategy(
      workingDebts.filter((d) => !d.isPaidOff && d.currentBalance > 0.01),
      strategy
    );

    // First pass: pay minimums and interest on all active debts
    for (const debt of activeDebts) {
      const interest = calculateMonthlyInterest(debt.currentBalance, debt.interestRate);
      const minPayment = Math.min(debt.minimumPayment, debt.currentBalance + interest);
      const principal = Math.max(0, minPayment - interest);

      debt.currentBalance = round(debt.currentBalance + interest - minPayment);
      monthTotalPayment += minPayment;
      monthTotalPrincipal += principal;
      monthTotalInterest += interest;

      monthPayments.push({
        debtId: debt.id,
        debtName: debt.name,
        payment: round(minPayment),
        principal: round(principal),
        interest: round(interest),
        remainingBalance: round(debt.currentBalance),
      });
    }

    // Second pass: apply extra payment to target debt (first in sorted order)
    if (availableExtra > 0 && activeDebts.length > 0) {
      for (const debt of activeDebts) {
        if (debt.currentBalance <= 0.01) continue;

        const extraToApply = Math.min(availableExtra, debt.currentBalance);
        debt.currentBalance = round(debt.currentBalance - extraToApply);
        availableExtra -= extraToApply;

        // Update the payment record
        const paymentRecord = monthPayments.find((p) => p.debtId === debt.id);
        if (paymentRecord) {
          paymentRecord.payment = round(paymentRecord.payment + extraToApply);
          paymentRecord.principal = round(paymentRecord.principal + extraToApply);
          paymentRecord.remainingBalance = round(debt.currentBalance);
        }

        monthTotalPayment += extraToApply;
        monthTotalPrincipal += extraToApply;

        if (availableExtra <= 0.01) break;
      }
    }

    // Check for newly paid-off debts
    for (const debt of workingDebts) {
      if (!debt.isPaidOff && debt.currentBalance <= 0.01) {
        debt.isPaidOff = true;
        debt.currentBalance = 0;
        debtsPaidOff.push(debt.name);
        payoffOrder.push(debt.name);
      }
    }

    totalPaid += monthTotalPayment;
    totalInterest += monthTotalInterest;

    timeline.push({
      month,
      totalPayment: round(monthTotalPayment),
      totalPrincipal: round(monthTotalPrincipal),
      totalInterest: round(monthTotalInterest),
      totalRemainingBalance: round(
        workingDebts.reduce((sum, d) => sum + d.currentBalance, 0)
      ),
      payments: monthPayments,
      debtsPaidOff,
    });
  }

  return {
    strategy,
    months: month,
    totalPaid: round(totalPaid),
    totalInterest: round(totalInterest),
    payoffOrder,
    timeline,
  };
}

/**
 * Main calculation function
 */
export function calculateDebtPayoff(inputs: DebtPayoffInputs): DebtPayoffResult {
  const { currency, debts, extraPayment, strategy } = inputs;

  // Filter out empty debts
  const validDebts = debts.filter((d) => d.balance > 0 && d.name.trim() !== '');

  if (validDebts.length === 0) {
    return {
      currency,
      totalDebt: 0,
      totalMinimumPayments: 0,
      monthlyPayment: extraPayment,
      avalanche: {
        strategy: 'avalanche',
        months: 0,
        totalPaid: 0,
        totalInterest: 0,
        payoffOrder: [],
        timeline: [],
      },
      snowball: {
        strategy: 'snowball',
        months: 0,
        totalPaid: 0,
        totalInterest: 0,
        payoffOrder: [],
        timeline: [],
      },
      interestSaved: 0,
      timeDifference: 0,
      selectedStrategy: strategy,
    };
  }

  const totalDebt = validDebts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinimumPayments = validDebts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const monthlyPayment = totalMinimumPayments + extraPayment;

  // Simulate both strategies
  const avalanche = simulatePayoff(validDebts, extraPayment, 'avalanche');
  const snowball = simulatePayoff(validDebts, extraPayment, 'snowball');

  // Calculate savings (avalanche typically saves more on interest)
  const interestSaved = snowball.totalInterest - avalanche.totalInterest;
  const timeDifference = snowball.months - avalanche.months;

  return {
    currency,
    totalDebt: round(totalDebt),
    totalMinimumPayments: round(totalMinimumPayments),
    monthlyPayment: round(monthlyPayment),
    avalanche,
    snowball,
    interestSaved: round(interestSaved),
    timeDifference,
    selectedStrategy: strategy,
  };
}

/**
 * Format currency
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}

/**
 * Format months as years and months
 */
export function formatDuration(months: number): string {
  if (months === 0) return '0 months';

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }

  return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}
