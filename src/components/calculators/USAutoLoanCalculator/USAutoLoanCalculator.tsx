/**
 * US Auto Loan Calculator - Preact component.
 *
 * Live updating: results recompute on every input change, no submit button.
 * The maths lives in calculations.ts so it can be unit tested in isolation.
 */

import { useState } from 'preact/hooks';
import { calculateAutoLoan, getDefaultInputs, type USAutoLoanInputs } from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export default function USAutoLoanCalculator() {
  const [inputs, setInputs] = useState<USAutoLoanInputs>(getDefaultInputs());

  const result = calculateAutoLoan(inputs);

  const updateInput = <K extends keyof USAutoLoanInputs>(field: K, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 p-6 md:p-8">
        {/* Inputs */}
        <div class="space-y-6 mb-8">
          <div>
            <label
              for="vehiclePrice"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Vehicle price
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                $
              </span>
              <input
                id="vehiclePrice"
                type="number"
                min={0}
                step={500}
                value={inputs.vehiclePrice}
                onInput={(e) =>
                  updateInput('vehiclePrice', Number((e.target as HTMLInputElement).value))
                }
                class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="downPayment"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Down payment
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <input
                  id="downPayment"
                  type="number"
                  min={0}
                  step={500}
                  value={inputs.downPayment}
                  onInput={(e) =>
                    updateInput('downPayment', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                for="tradeInValue"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Trade in value
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <input
                  id="tradeInValue"
                  type="number"
                  min={0}
                  step={500}
                  value={inputs.tradeInValue}
                  onInput={(e) =>
                    updateInput('tradeInValue', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                for="salesTaxRate"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Sales tax rate
              </label>
              <div class="relative">
                <input
                  id="salesTaxRate"
                  type="number"
                  min={0}
                  step={0.1}
                  value={inputs.salesTaxRate}
                  onInput={(e) =>
                    updateInput('salesTaxRate', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-4 pr-8 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  %
                </span>
              </div>
            </div>

            <div>
              <label for="apr" class="block text-sm font-medium text-[var(--color-cream)] mb-2">
                APR
              </label>
              <div class="relative">
                <input
                  id="apr"
                  type="number"
                  min={0}
                  step={0.1}
                  value={inputs.apr}
                  onInput={(e) => updateInput('apr', Number((e.target as HTMLInputElement).value))}
                  class="w-full pl-4 pr-8 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  %
                </span>
              </div>
            </div>

            <div>
              <label
                for="termMonths"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Loan term
              </label>
              <div class="relative">
                <input
                  id="termMonths"
                  type="number"
                  min={1}
                  step={1}
                  value={inputs.termMonths}
                  onInput={(e) =>
                    updateInput('termMonths', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-4 pr-20 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  months
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div class="space-y-6">
          {/* Primary result: monthly payment */}
          <div class="rounded-2xl p-6 border-2 border-emerald-500/30 bg-emerald-950/30 text-center">
            <p class="text-sm text-[var(--color-muted)] mb-1">Monthly payment</p>
            <p class="text-4xl md:text-5xl font-display font-bold text-emerald-400 tabular-nums">
              {formatCurrency(result.monthlyPayment)}
            </p>
            <p class="text-sm text-[var(--color-muted)] mt-2">
              {result.principal > 0
                ? `Financing ${formatCurrency(result.principal)} over ${inputs.termMonths} months`
                : 'No amount financed: enter a vehicle price above your down payment and trade in'}
            </p>
          </div>

          {/* Metric grid */}
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Amount financed</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.principal)}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Total interest</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.totalInterest)}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Sales tax</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.salesTaxAmount)}
              </p>
            </div>
          </div>

          {/* Cost breakdown */}
          <div class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">Cost breakdown</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Total of payments</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.totalOfPayments)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Total interest</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.totalInterest)}
                </span>
              </div>
              <div class="flex justify-between border-t border-white/10 pt-2 mt-2">
                <span class="text-[var(--color-subtle)]">Total cost incl tax</span>
                <span class="text-emerald-400 font-medium tabular-nums">
                  {formatCurrency(result.totalCost)}
                </span>
              </div>
            </div>
          </div>

          <p class="text-xs text-[var(--color-muted)]">
            Estimates assume a fixed APR and equal monthly payments. Sales tax is charged on the
            full vehicle price here; some states tax the price after a trade in, so adjust the price
            to model your state. This is a planning tool, not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
