/**
 * Mortgage Overpayment Calculator - Preact component.
 *
 * Live updating: results recompute on every input change, no submit button.
 * The maths lives in calculations.ts so it can be unit tested in isolation.
 */

import { useState } from 'preact/hooks';
import { calculateMortgageOverpayment, type MortgageOverpaymentInputs } from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

const DEFAULT_INPUTS: MortgageOverpaymentInputs = {
  balance: 200000,
  interestRate: 5,
  termYears: 25,
  monthlyOverpayment: 200,
  lumpSum: 0,
};

function formatTimeSaved(years: number, months: number): string {
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`);
  if (months > 0) parts.push(`${months} month${months === 1 ? '' : 's'}`);
  if (parts.length === 0) return 'No time saved';
  return parts.join(' ');
}

function formatPayoffDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default function MortgageOverpaymentCalculator() {
  const [inputs, setInputs] = useState<MortgageOverpaymentInputs>(DEFAULT_INPUTS);

  const result = calculateMortgageOverpayment(inputs);

  const updateInput = <K extends keyof MortgageOverpaymentInputs>(field: K, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const hasOverpayment = inputs.monthlyOverpayment > 0 || inputs.lumpSum > 0;

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 p-6 md:p-8">
        {/* Inputs */}
        <div class="space-y-6 mb-8">
          <div>
            <label for="balance" class="block text-sm font-medium text-[var(--color-cream)] mb-2">
              Outstanding mortgage balance
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                £
              </span>
              <input
                id="balance"
                type="number"
                min={0}
                step={1000}
                value={inputs.balance}
                onInput={(e) =>
                  updateInput('balance', Number((e.target as HTMLInputElement).value))
                }
                class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="interestRate"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Interest rate
              </label>
              <div class="relative">
                <input
                  id="interestRate"
                  type="number"
                  min={0}
                  step={0.1}
                  value={inputs.interestRate}
                  onInput={(e) =>
                    updateInput('interestRate', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-4 pr-8 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  %
                </span>
              </div>
            </div>

            <div>
              <label
                for="termYears"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Remaining term
              </label>
              <div class="relative">
                <input
                  id="termYears"
                  type="number"
                  min={1}
                  step={1}
                  value={inputs.termYears}
                  onInput={(e) =>
                    updateInput('termYears', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-4 pr-16 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  years
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="monthlyOverpayment"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Monthly overpayment
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <input
                  id="monthlyOverpayment"
                  type="number"
                  min={0}
                  step={50}
                  value={inputs.monthlyOverpayment}
                  onInput={(e) =>
                    updateInput('monthlyOverpayment', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label for="lumpSum" class="block text-sm font-medium text-[var(--color-cream)] mb-2">
                One off lump sum (optional)
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <input
                  id="lumpSum"
                  type="number"
                  min={0}
                  step={1000}
                  value={inputs.lumpSum}
                  onInput={(e) =>
                    updateInput('lumpSum', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div class="space-y-6">
          {/* Primary result: interest saved */}
          <div class="rounded-2xl p-6 border-2 border-emerald-500/30 bg-emerald-950/30 text-center">
            <p class="text-sm text-[var(--color-muted)] mb-1">Interest saved</p>
            <p class="text-4xl md:text-5xl font-display font-bold text-emerald-400 tabular-nums">
              {formatCurrency(result.interestSaved)}
            </p>
            <p class="text-sm text-[var(--color-muted)] mt-2">
              {hasOverpayment
                ? `You clear the mortgage ${formatTimeSaved(result.yearsSaved, result.remainingMonthsSaved)} early`
                : 'Add an overpayment to see your savings'}
            </p>
          </div>

          {/* Metric grid */}
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Normal monthly payment</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.monthlyPayment)}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Time saved</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)]">
                {formatTimeSaved(result.yearsSaved, result.remainingMonthsSaved)}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">New payoff date</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)]">
                {formatPayoffDate(result.newPayoffDate)}
              </p>
            </div>
          </div>

          {/* Interest comparison */}
          <div class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">
              Total interest comparison
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Without overpaying</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.originalTotalInterest)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">With overpaying</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.newTotalInterest)}
                </span>
              </div>
              <div class="flex justify-between border-t border-white/10 pt-2 mt-2">
                <span class="text-[var(--color-subtle)]">Interest saved</span>
                <span class="text-emerald-400 font-medium tabular-nums">
                  {formatCurrency(result.interestSaved)}
                </span>
              </div>
            </div>
          </div>

          <p class="text-xs text-[var(--color-muted)]">
            Estimates assume a fixed interest rate and that overpayments reduce the term rather than
            the monthly payment. Check your lender allows overpayments without an early repayment
            charge before committing.
          </p>
        </div>
      </div>
    </div>
  );
}
