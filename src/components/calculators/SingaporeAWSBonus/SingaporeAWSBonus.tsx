/** Singapore AWS proration calculator, showing both methods side by side rather than picking one. */

import { useState } from 'preact/hooks';
import {
  calculateSingaporeAWSBonus,
  getDefaultInputs,
  type SingaporeAWSBonusInputs,
} from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  maximumFractionDigits: 2,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export default function SingaporeAWSBonus() {
  const [inputs, setInputs] = useState<SingaporeAWSBonusInputs>(getDefaultInputs());

  const result = calculateSingaporeAWSBonus(inputs);

  const updateInput = <K extends keyof SingaporeAWSBonusInputs>(field: K, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 p-6 md:p-8">
        {/* Inputs */}
        <div class="space-y-6 mb-8">
          <div>
            <label
              for="monthlyBasicSalary"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Monthly basic salary
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                S$
              </span>
              <input
                id="monthlyBasicSalary"
                type="number"
                min={0}
                step={100}
                value={inputs.monthlyBasicSalary}
                onInput={(e) =>
                  updateInput('monthlyBasicSalary', Number((e.target as HTMLInputElement).value))
                }
                class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              for="awsMultiplier"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              AWS multiplier (months of pay)
            </label>
            <input
              id="awsMultiplier"
              type="number"
              min={0}
              step={0.1}
              value={inputs.awsMultiplier}
              onInput={(e) =>
                updateInput('awsMultiplier', Number((e.target as HTMLInputElement).value))
              }
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            />
            <p class="text-xs text-[var(--color-muted)] mt-2">
              1.0 means a full month's pay as the AWS. Check your contract or company policy.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="daysWorked"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Days worked (of 365)
              </label>
              <input
                id="daysWorked"
                type="number"
                min={0}
                max={365}
                step={1}
                value={inputs.daysWorked}
                onInput={(e) =>
                  updateInput('daysWorked', Number((e.target as HTMLInputElement).value))
                }
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
            <div>
              <label
                for="monthsWorked"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Completed months (of 12)
              </label>
              <input
                id="monthsWorked"
                type="number"
                min={0}
                max={12}
                step={1}
                value={inputs.monthsWorked}
                onInput={(e) =>
                  updateInput('monthsWorked', Number((e.target as HTMLInputElement).value))
                }
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="rounded-2xl p-6 border-2 border-emerald-500/30 bg-emerald-950/30 text-center">
              <p class="text-sm text-[var(--color-muted)] mb-1">Method A: daily proration</p>
              <p class="text-3xl font-display font-bold text-emerald-400 tabular-nums">
                {formatCurrency(result.methodADailyProration)}
              </p>
              <p class="text-xs text-[var(--color-muted)] mt-2">Full AWS x days worked / 365</p>
            </div>
            <div class="rounded-2xl p-6 border-2 border-sky-500/30 bg-sky-950/30 text-center">
              <p class="text-sm text-[var(--color-muted)] mb-1">Method B: completed months</p>
              <p class="text-3xl font-display font-bold text-sky-400 tabular-nums">
                {formatCurrency(result.methodBMonthlyProration)}
              </p>
              <p class="text-xs text-[var(--color-muted)] mt-2">Full AWS x months worked / 12</p>
            </div>
          </div>

          <div class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">Breakdown</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Full AWS at this multiplier</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.fullAwsAmount)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Difference between the two methods</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.differenceAmount)}
                </span>
              </div>
            </div>
          </div>

          <p class="text-xs text-[var(--color-muted)]">
            AWS is a contractual payment, not a statutory one. MOM does not prescribe a proration
            formula, so which method applies depends entirely on your employment contract or company
            policy, not on which figure is larger. This is not employment-law advice; check
            mom.gov.sg or your contract for anything you will rely on.
          </p>
        </div>
      </div>
    </div>
  );
}
