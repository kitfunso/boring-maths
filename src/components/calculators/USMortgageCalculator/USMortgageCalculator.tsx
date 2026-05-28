/**
 * US Mortgage Calculator - Preact component.
 *
 * Live updating: results recompute on every input change, no submit button.
 * The maths lives in calculations.ts so it can be unit tested in isolation.
 */

import { useState } from 'preact/hooks';
import { calculateUSMortgage, getDefaultInputs, type USMortgageInputs } from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export default function USMortgageCalculator() {
  const [inputs, setInputs] = useState<USMortgageInputs>(getDefaultInputs());

  const result = calculateUSMortgage(inputs);

  const updateInput = <K extends keyof USMortgageInputs>(field: K, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 p-6 md:p-8">
        {/* Inputs */}
        <div class="space-y-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="homePrice"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Home price
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <input
                  id="homePrice"
                  type="number"
                  min={0}
                  step={5000}
                  value={inputs.homePrice}
                  onInput={(e) =>
                    updateInput('homePrice', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>

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
                  step={1000}
                  value={inputs.downPayment}
                  onInput={(e) =>
                    updateInput('downPayment', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
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
                Loan term
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
                for="propertyTaxRate"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Property tax rate
              </label>
              <div class="relative">
                <input
                  id="propertyTaxRate"
                  type="number"
                  min={0}
                  step={0.05}
                  value={inputs.propertyTaxRate}
                  onInput={(e) =>
                    updateInput('propertyTaxRate', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-4 pr-20 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  % / year
                </span>
              </div>
            </div>

            <div>
              <label
                for="annualInsurance"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Annual home insurance
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <input
                  id="annualInsurance"
                  type="number"
                  min={0}
                  step={100}
                  value={inputs.annualInsurance}
                  onInput={(e) =>
                    updateInput('annualInsurance', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="monthlyHOA"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Monthly HOA dues
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <input
                  id="monthlyHOA"
                  type="number"
                  min={0}
                  step={25}
                  value={inputs.monthlyHOA}
                  onInput={(e) =>
                    updateInput('monthlyHOA', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label for="pmiRate" class="block text-sm font-medium text-[var(--color-cream)] mb-2">
                PMI rate
              </label>
              <div class="relative">
                <input
                  id="pmiRate"
                  type="number"
                  min={0}
                  step={0.05}
                  value={inputs.pmiRate}
                  onInput={(e) =>
                    updateInput('pmiRate', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-4 pr-20 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  % / year
                </span>
              </div>
              <p class="text-xs text-[var(--color-muted)] mt-1">
                Applied only when your down payment is under 20 percent.
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div class="space-y-6">
          {/* Primary result: total monthly payment */}
          <div class="rounded-2xl p-6 border-2 border-violet-500/30 bg-violet-950/30 text-center">
            <p class="text-sm text-[var(--color-muted)] mb-1">Total monthly payment</p>
            <p class="text-4xl md:text-5xl font-display font-bold text-violet-400 tabular-nums">
              {formatCurrency(result.totalMonthly)}
            </p>
            <p class="text-sm text-[var(--color-muted)] mt-2">
              {formatCurrency(result.loanAmount)} loan at {result.ltv.toFixed(0)} percent LTV
            </p>
          </div>

          {/* Payment breakdown */}
          <div class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">Monthly breakdown</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Principal and interest</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.principalAndInterest)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Property tax</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.propertyTaxMonthly)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Home insurance</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.insuranceMonthly)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">HOA dues</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.hoaMonthly)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">
                  PMI {result.pmiRequired ? '' : '(not required)'}
                </span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.pmiMonthly)}
                </span>
              </div>
              <div class="flex justify-between border-t border-white/10 pt-2 mt-2">
                <span class="text-[var(--color-subtle)]">Total monthly</span>
                <span class="text-violet-400 font-medium tabular-nums">
                  {formatCurrency(result.totalMonthly)}
                </span>
              </div>
            </div>
          </div>

          {/* PMI note */}
          {result.pmiRequired && (
            <div class="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
              <p class="text-sm text-[var(--color-subtle)]">
                Your down payment is under 20 percent, so this estimate includes private mortgage
                insurance (PMI). PMI typically falls away as your loan balance drops toward 78 to 80
                percent of the home value. This is a conventional loan convention, not legal advice.
              </p>
            </div>
          )}

          <p class="text-xs text-[var(--color-muted)]">
            Estimates assume a fixed rate, fully amortising loan. Property tax, insurance and PMI
            rates vary widely by location and lender. Adjust the inputs to match your own quote.
          </p>
        </div>
      </div>
    </div>
  );
}
