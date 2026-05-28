import { useState } from 'preact/hooks';
import {
  calculateHolidayEntitlement,
  getDefaultInputs,
  type UKHolidayEntitlementInputs,
  type EntitlementMethod,
} from './calculations';
import ShareResults from '../../ui/ShareResults';

const numberFormat = new Intl.NumberFormat('en-GB', {
  maximumFractionDigits: 1,
});

function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export default function UKHolidayEntitlementCalculator() {
  const [inputs, setInputs] = useState<UKHolidayEntitlementInputs>(getDefaultInputs);

  const result = calculateHolidayEntitlement(inputs);

  const updateInput = <K extends keyof UKHolidayEntitlementInputs>(
    field: K,
    value: UKHolidayEntitlementInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const setMethod = (method: EntitlementMethod) => {
    updateInput('method', method);
  };

  const isDays = inputs.method === 'days';

  const shareText = isDays
    ? `Statutory holiday entitlement for a ${formatNumber(inputs.daysPerWeek)}-day week: ${formatNumber(result.fullYearDays)} days a year (${formatNumber(result.proRatedDays)} days for ${formatNumber(inputs.monthsWorked)} months worked).`
    : `Statutory holiday accrued on ${formatNumber(inputs.hoursWorked)} hours worked: ${formatNumber(result.accruedHours)} hours of paid leave (12.07% accrual).`;

  return (
    <div class="calc-card card-elevated rounded-2xl p-6 md:p-8">
      {/* Method toggle */}
      <div class="mb-8">
        <div class="text-sm font-medium text-[var(--color-muted)] mb-3">Working pattern</div>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMethod('days')}
            class={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              isDays
                ? 'bg-[var(--color-accent)] text-[var(--color-void)]'
                : 'bg-white/10 text-[var(--color-cream)] hover:bg-white/20'
            }`}
          >
            Fixed days per week
          </button>
          <button
            type="button"
            onClick={() => setMethod('hours')}
            class={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              !isDays
                ? 'bg-[var(--color-accent)] text-[var(--color-void)]'
                : 'bg-white/10 text-[var(--color-cream)] hover:bg-white/20'
            }`}
          >
            Irregular hours
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div class="space-y-6 mb-8">
        {isDays ? (
          <>
            <div>
              <label
                htmlFor="daysPerWeek"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Days worked per week
              </label>
              <div class="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => updateInput('daysPerWeek', Math.max(1, inputs.daysPerWeek - 1))}
                  class="w-12 h-12 rounded-xl bg-white/10 text-[var(--color-cream)] font-bold text-xl hover:bg-white/20 transition-colors"
                  aria-label="Decrease days per week"
                >
                  -
                </button>
                <span class="text-3xl font-display font-bold text-[var(--color-cream)] w-12 text-center">
                  {inputs.daysPerWeek}
                </span>
                <button
                  type="button"
                  onClick={() => updateInput('daysPerWeek', Math.min(7, inputs.daysPerWeek + 1))}
                  class="w-12 h-12 rounded-xl bg-white/10 text-[var(--color-cream)] font-bold text-xl hover:bg-white/20 transition-colors"
                  aria-label="Increase days per week"
                >
                  +
                </button>
              </div>
              <p class="text-xs text-[var(--color-muted)] mt-1">
                A standard 5-day week earns the full 28-day statutory minimum.
              </p>
            </div>

            <div>
              <label
                htmlFor="monthsWorked"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Months worked in the leave year
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
                class="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)]"
              />
              <p class="text-xs text-[var(--color-muted)] mt-1">
                Use 12 for a full year. Use fewer months to pro-rate a starter or leaver.
              </p>
            </div>
          </>
        ) : (
          <div>
            <label
              htmlFor="hoursWorked"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Hours worked in the period
            </label>
            <input
              id="hoursWorked"
              type="number"
              min={0}
              step={10}
              value={inputs.hoursWorked}
              onInput={(e) =>
                updateInput('hoursWorked', Number((e.target as HTMLInputElement).value))
              }
              class="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)]"
            />
            <p class="text-xs text-[var(--color-muted)] mt-1">
              For casual or irregular hours, holiday accrues at 12.07% of the hours you actually
              work.
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      <div class="space-y-6">
        <div
          class="rounded-2xl p-6 border-2"
          style={{
            backgroundColor: 'rgba(6, 78, 59, 0.4)',
            borderColor: 'rgba(16, 185, 129, 0.3)',
          }}
        >
          <div class="text-center">
            <p class="text-sm text-[var(--color-muted)] mb-1">
              {isDays ? 'Entitlement for months worked' : 'Holiday accrued'}
            </p>
            <p class="text-4xl md:text-5xl font-display font-bold" style={{ color: '#34d399' }}>
              {isDays
                ? `${formatNumber(result.proRatedDays)} days`
                : `${formatNumber(result.accruedHours)} hours`}
            </p>
            <p class="text-sm text-[var(--color-muted)] mt-2">
              {isDays
                ? `Statutory minimum based on a ${formatNumber(inputs.daysPerWeek)}-day week`
                : 'Statutory minimum at the 12.07% accrual rate'}
            </p>
          </div>
        </div>

        {isDays && (
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Full-year entitlement</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)]">
                {formatNumber(result.fullYearDays)} days
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">In weeks</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)]">
                {formatNumber(result.proRatedWeeks)} weeks
              </p>
            </div>
          </div>
        )}

        {isDays && result.capApplied && (
          <div class="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
            <p class="text-sm text-[var(--color-subtle)]">
              The statutory entitlement is capped at 28 days. A working pattern of 5 or more days a
              week does not increase your statutory minimum beyond 28 days, though your employer can
              choose to offer more.
            </p>
          </div>
        )}

        {!isDays && (
          <div class="bg-white/5 rounded-xl p-4">
            <div class="flex justify-between text-sm">
              <span class="text-[var(--color-subtle)]">Accrual rate</span>
              <span class="text-[var(--color-cream)]">12.07% of hours worked</span>
            </div>
            <div class="flex justify-between text-sm mt-2 pt-2 border-t border-white/10">
              <span class="text-[var(--color-subtle)]">Hours worked</span>
              <span class="text-[var(--color-cream)]">
                {formatNumber(inputs.hoursWorked)} hours
              </span>
            </div>
          </div>
        )}

        <div class="bg-white/5 rounded-xl p-4">
          <h4 class="text-sm font-medium text-[var(--color-muted)] mb-3">
            Statutory holiday rules
          </h4>
          <div class="space-y-2 text-sm text-[var(--color-subtle)]">
            <div class="flex justify-between">
              <span>Minimum paid leave</span>
              <span class="text-[var(--color-cream)]">5.6 weeks</span>
            </div>
            <div class="flex justify-between">
              <span>Cap for a 5-day-plus week</span>
              <span class="text-[var(--color-cream)]">28 days</span>
            </div>
            <div class="flex justify-between">
              <span>Irregular-hours accrual</span>
              <span class="text-[var(--color-cream)]">12.07%</span>
            </div>
          </div>
        </div>

        <div class="flex justify-center pt-4">
          <ShareResults result={shareText} calculatorName="UK Holiday Entitlement Calculator" />
        </div>
      </div>
    </div>
  );
}
