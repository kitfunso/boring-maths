/**
 * Wedding Budget Calculator - React Component
 *
 * Plan and allocate your wedding budget across categories.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateWeddingBudget } from './calculations';
import {
  getDefaultInputs,
  type WeddingBudgetInputs,
  type Priority,
  type CategoryPriority,
} from './types';
import {
  type Currency,
  getCurrencySymbol,
  getInitialCurrency,
  formatCurrency,
} from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Save Here',
  medium: 'Standard',
  high: 'Priority',
  splurge: 'Splurge!',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-blue-500/20 text-blue-300',
  medium: 'bg-white/10 text-[var(--color-subtle)]',
  high: 'bg-amber-500/20 text-amber-300',
  splurge: 'bg-rose-500/20 text-rose-300',
};

export default function WeddingBudget() {
  // Track calculator usage for analytics
  useCalculatorTracking('Wedding Budget Calculator');

  const [inputs, setInputs] = useState<WeddingBudgetInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const result = useMemo(() => calculateWeddingBudget(inputs), [inputs]);

  const updateInput = <K extends keyof WeddingBudgetInputs>(
    field: K,
    value: WeddingBudgetInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const updatePriority = (category: keyof CategoryPriority, value: Priority) => {
    setInputs((prev) => ({
      ...prev,
      priorities: { ...prev.priorities, [category]: value },
    }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  const priorityCategories: { key: keyof CategoryPriority; label: string; icon: string }[] = [
    { key: 'venue', label: 'Venue', icon: '🏛️' },
    { key: 'catering', label: 'Food & Drink', icon: '🍽️' },
    { key: 'photography', label: 'Photo/Video', icon: '📸' },
    { key: 'flowers', label: 'Flowers', icon: '💐' },
    { key: 'music', label: 'Music', icon: '🎵' },
    { key: 'attire', label: 'Attire', icon: '👗' },
    { key: 'decor', label: 'Decor', icon: '✨' },
  ];

  return (
    <ThemeProvider defaultColor="red">
      <Card variant="elevated">
        <CalculatorHeader
          title="Wedding Budget Calculator"
          subtitle="Plan your perfect day within your budget"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-rose-400 uppercase tracking-wider">
                Budget & Guests
              </div>

              <div>
                <Label htmlFor="totalBudget" required>
                  Total Wedding Budget
                </Label>
                <Input
                  id="totalBudget"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={1000}
                  value={inputs.totalBudget}
                  onChange={(e) =>
                    updateInput('totalBudget', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>

              <Slider
                label="Guest Count"
                value={inputs.guestCount}
                onChange={(value) => updateInput('guestCount', value)}
                min={20}
                max={300}
                step={5}
                showValue
                labels={{
                  min: '20',
                  mid: '160',
                  max: '300',
                  current: (v) => `${v} guests`,
                }}
              />

              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-muted)]">Cost per guest:</span>
                  <span className="text-rose-400 font-semibold text-lg">
                    {fmt(result.costPerGuest)}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  Industry average: {fmt(result.industryAveragePerGuest)}/guest
                </p>
              </div>

              <Divider />

              <div className="text-sm font-semibold text-rose-400 uppercase tracking-wider">
                Set Your Priorities
              </div>
              <p className="text-sm text-[var(--color-muted)]">
                Where do you want to spend more or save?
              </p>

              {priorityCategories.map(({ key, label, icon }) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span className="text-[var(--color-cream)] font-medium">{label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {(['low', 'medium', 'high', 'splurge'] as Priority[]).map((priority) => (
                      <button
                        key={priority}
                        onClick={() => updatePriority(key, priority)}
                        className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                          inputs.priorities[key] === priority
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/5 text-[var(--color-subtle)] hover:bg-white/10'
                        }`}
                      >
                        {PRIORITY_LABELS[priority]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Budget Tier"
                value={result.budgetTier.charAt(0).toUpperCase() + result.budgetTier.slice(1)}
                subtitle={`${fmt(result.costPerGuest)} per guest • ${result.guestCount} guests`}
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <MetricCard
                  label="Venue & Catering"
                  value={fmt(result.venueAndCatering)}
                  sublabel="~45% of budget"
                />
                <MetricCard
                  label="Contingency Fund"
                  value={fmt(result.contingency)}
                  sublabel="5% for surprises"
                />
              </Grid>

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <Alert variant="warning">
                  <ul className="space-y-1">
                    {result.warnings.map((warning, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span>⚠️</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}

              {/* Budget Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Recommended Allocations
                </h3>
                <div className="space-y-4">
                  {result.allocations.slice(0, 8).map((allocation, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--color-cream)] font-medium">
                            {allocation.category}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${PRIORITY_COLORS[allocation.priority]}`}
                          >
                            {PRIORITY_LABELS[allocation.priority]}
                          </span>
                        </div>
                        <span className="text-rose-400 font-semibold">
                          {fmt(allocation.amount)}
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${allocation.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[var(--color-muted)]">
                        <span>{allocation.percentage}% of budget</span>
                        <span>{fmt(allocation.perGuestCost)}/guest</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Remaining categories summary */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted)]">
                      Other (stationery, transport, etc.)
                    </span>
                    <span className="text-[var(--color-subtle)]">
                      {fmt(result.allocations.slice(8).reduce((sum, a) => sum + a.amount, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Savings Tips */}
              <Alert variant="tip" title="Money-Saving Tips">
                <ul className="space-y-2 mt-2">
                  {result.savingsTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-rose-400">💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Wedding Budget: ${fmt(result.totalBudget)} for ${result.guestCount} guests (${fmt(result.costPerGuest)}/guest). Budget tier: ${result.budgetTier}`}
                  calculatorName="Wedding Budget Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
