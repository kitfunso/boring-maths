/** Singapore Notice Period calculator, live updating like every other calc in this repo. */

import { useState } from 'preact/hooks';
import {
  calculateSingaporeNoticePeriod,
  getDefaultInputs,
  type SingaporeNoticePeriodInputs,
} from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  maximumFractionDigits: 2,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export default function SingaporeNoticePeriod() {
  const [inputs, setInputs] = useState<SingaporeNoticePeriodInputs>(getDefaultInputs());

  const result = calculateSingaporeNoticePeriod(inputs);

  const updateInput = <K extends keyof SingaporeNoticePeriodInputs>(field: K, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 p-6 md:p-8">
        {/* Inputs */}
        <div class="space-y-6 mb-8">
          <div>
            <label
              for="monthlyGrossSalary"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Monthly gross salary
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                S$
              </span>
              <input
                id="monthlyGrossSalary"
                type="number"
                min={0}
                step={100}
                value={inputs.monthlyGrossSalary}
                onInput={(e) =>
                  updateInput('monthlyGrossSalary', Number((e.target as HTMLInputElement).value))
                }
                class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="serviceYears"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Length of service (years)
              </label>
              <input
                id="serviceYears"
                type="number"
                min={0}
                step={1}
                value={inputs.serviceYears}
                onInput={(e) =>
                  updateInput('serviceYears', Number((e.target as HTMLInputElement).value))
                }
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
            <div>
              <label
                for="serviceMonths"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Plus months
              </label>
              <input
                id="serviceMonths"
                type="number"
                min={0}
                max={11}
                step={1}
                value={inputs.serviceMonths}
                onInput={(e) =>
                  updateInput('serviceMonths', Number((e.target as HTMLInputElement).value))
                }
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="workingDaysPerWeek"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Working days per week
              </label>
              <input
                id="workingDaysPerWeek"
                type="number"
                min={1}
                max={7}
                step={1}
                value={inputs.workingDaysPerWeek}
                onInput={(e) =>
                  updateInput('workingDaysPerWeek', Number((e.target as HTMLInputElement).value))
                }
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
            <div>
              <label
                for="unusedLeaveDays"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Unused annual leave (days)
              </label>
              <input
                id="unusedLeaveDays"
                type="number"
                min={0}
                step={1}
                value={inputs.unusedLeaveDays}
                onInput={(e) =>
                  updateInput('unusedLeaveDays', Number((e.target as HTMLInputElement).value))
                }
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              for="contractualNoticeWeeks"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Contractual notice override (weeks, optional)
            </label>
            <input
              id="contractualNoticeWeeks"
              type="number"
              min={0}
              step={1}
              value={inputs.contractualNoticeWeeks}
              onInput={(e) =>
                updateInput('contractualNoticeWeeks', Number((e.target as HTMLInputElement).value))
              }
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            />
            <p class="text-xs text-[var(--color-muted)] mt-2">
              Leave at 0 to use the statutory default. A written contract term always overrides the
              statutory table, whether it is longer or shorter.
            </p>
          </div>
        </div>

        {/* Results */}
        <div class="space-y-6">
          <div class="rounded-2xl p-6 border-2 border-emerald-500/30 bg-emerald-950/30 text-center">
            <p class="text-sm text-[var(--color-muted)] mb-1">Total final pay</p>
            <p class="text-4xl md:text-5xl font-display font-bold text-emerald-400 tabular-nums">
              {formatCurrency(result.totalFinalPay)}
            </p>
            <p class="text-sm text-[var(--color-muted)] mt-2">
              Salary in lieu of notice plus unused leave encashment
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Notice period applying</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {result.appliedNoticeLabel}
              </p>
              <p class="text-xs text-[var(--color-muted)] mt-1">
                {result.isOverrideApplied
                  ? `Contractual override (statutory default: ${result.statutoryNoticeLabel})`
                  : 'Statutory default (contract is silent)'}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Salary in lieu of notice</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.salaryInLieu)}
              </p>
              <p class="text-xs text-[var(--color-muted)] mt-1">
                CPF is not payable on this amount
              </p>
            </div>
          </div>

          <div class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">Breakdown</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Daily rate of pay</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.dailyRate)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Notice period, in working days</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {result.appliedNoticeDays} days
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Annual leave entitlement to date</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {result.leaveEntitlementDays} days
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Unused leave encashed</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {result.unusedLeaveDays} days ({formatCurrency(result.leaveEncashment)})
                </span>
              </div>
              <div class="flex justify-between border-t border-white/10 pt-2 mt-2">
                <span class="text-[var(--color-subtle)]">Total final pay</span>
                <span class="text-emerald-400 font-medium tabular-nums">
                  {formatCurrency(result.totalFinalPay)}
                </span>
              </div>
            </div>
          </div>

          <p class="text-xs text-[var(--color-muted)]">
            Leave encashment uses basic salary only; bonuses, allowances and overtime are excluded.
            This is not employment-law advice. For anything you will rely on, check mom.gov.sg or
            your employment contract.
          </p>
        </div>
      </div>
    </div>
  );
}
