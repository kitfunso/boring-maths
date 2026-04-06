/**
 * Leftovers Calculator - React Component
 *
 * Determines how long leftover food is safe to eat based on
 * food type, storage method, and preparation date.
 */

import { calculateLeftovers, formatDisplayDate, formatDaysRemaining } from './calculations';
import {
  getDefaultInputs,
  FOOD_CATEGORIES,
  STORAGE_METHODS,
  FOOD_SAFETY_DATA,
  type LeftoversInputs,
  type StorageMethod,
  type FoodCategory,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Select,
  ButtonGroup,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

const FOOD_OPTIONS = FOOD_CATEGORIES.map((f) => ({
  value: f.value,
  label: `${f.icon} ${f.label}`,
}));

const STORAGE_OPTIONS = STORAGE_METHODS.map((s) => ({
  value: s.value,
  label: s.label,
}));

export default function LeftoversCalculator() {
  const { inputs, result, updateInput } = useCalculatorState<
    LeftoversInputs,
    ReturnType<typeof calculateLeftovers>
  >({
    name: 'Leftovers Calculator',
    defaults: getDefaultInputs,
    compute: calculateLeftovers,
  });

  const foodData = FOOD_SAFETY_DATA[inputs.foodCategory];

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="Leftovers Calculator"
          subtitle="How long will your leftovers last?"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Food Category */}
            <div>
              <Label htmlFor="foodCategory" required>
                What food do you have?
              </Label>
              <Select<FoodCategory>
                id="foodCategory"
                options={FOOD_OPTIONS}
                value={inputs.foodCategory}
                onChange={(val) => updateInput('foodCategory', val)}
              />
            </div>

            {/* Storage Method */}
            <div>
              <Label>Where is it stored?</Label>
              <ButtonGroup<StorageMethod>
                options={STORAGE_OPTIONS}
                value={inputs.storageMethod}
                onChange={(val) => updateInput('storageMethod', val)}
                columns={3}
                aria-label="Storage method"
              />
            </div>

            {/* Prepared Date */}
            <div>
              <Label htmlFor="preparedDate" required>
                When was it prepared?
              </Label>
              <input
                id="preparedDate"
                type="date"
                value={inputs.preparedDate}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value) {
                    updateInput('preparedDate', target.value);
                  }
                }}
                className="w-full px-4 py-3 border-2 border-white/10 rounded-xl
                  bg-[var(--color-charcoal)] text-[var(--color-cream)] text-lg
                  focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10
                  transition-all duration-200"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Safety Status */}
            <ResultCard
              label={result.isSafe ? 'Safe to Eat' : 'Discard - Not Safe'}
              value={
                inputs.storageMethod === 'counter'
                  ? `${foodData.counterHours}h on counter`
                  : formatDisplayDate(result.expiryDate)
              }
              subtitle={
                result.isSafe
                  ? formatDaysRemaining(result.daysRemaining)
                  : 'This food has exceeded its safe storage time'
              }
            />

            {/* Safety Warning */}
            {!result.isSafe && (
              <Alert variant="warning" title="Food Safety Warning">
                According to USDA guidelines, this food has been stored longer than recommended.
                When in doubt, throw it out. Foodborne illness bacteria can grow without visible
                signs of spoilage.
              </Alert>
            )}

            {/* Storage Duration Metrics */}
            <Grid responsive={{ sm: 2, md: 3 }} gap="md">
              <MetricCard
                label="Fridge"
                value={`${result.fridgeDays} days`}
                sublabel="at 40\u00B0F / 4\u00B0C"
                valueColor={
                  inputs.storageMethod === 'fridge' ? 'text-[var(--color-accent)]' : undefined
                }
              />
              <MetricCard
                label="Freezer"
                value={
                  result.freezerMonths > 0 ? `${result.freezerMonths} months` : 'Not recommended'
                }
                sublabel="at 0\u00B0F / -18\u00B0C"
                valueColor={
                  inputs.storageMethod === 'freezer' ? 'text-[var(--color-accent)]' : undefined
                }
              />
              <MetricCard
                label="Counter"
                value={
                  result.counterHours <= 2
                    ? `${result.counterHours} hours`
                    : `${result.counterHours} hours`
                }
                sublabel="room temperature"
                valueColor={
                  inputs.storageMethod === 'counter' ? 'text-[var(--color-accent)]' : undefined
                }
              />
            </Grid>

            {/* Reheating Temperature */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                Reheating Temperature
              </h3>
              <p className="text-2xl font-bold text-[var(--color-accent)]">
                {result.reheatingTemp}
              </p>
              <p className="text-sm text-[var(--color-subtle)] mt-1">
                Use a food thermometer to verify internal temperature
              </p>
            </div>

            {/* Spoilage Signs */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Signs of Spoilage
              </h3>
              <ul className="space-y-2">
                {result.spoilageSigns.map((sign, i) => (
                  <li key={i} className="flex items-start gap-3 text-[var(--color-subtle)]">
                    <span className="text-red-400 mt-0.5 shrink-0">&#9888;</span>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Freezing Tips */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Freezing Tips
              </h3>
              <ul className="space-y-2">
                {result.freezingTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-[var(--color-subtle)]">
                    <span className="text-blue-400 mt-0.5 shrink-0">&#10052;</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* General Safety Tip */}
            <Alert variant="tip" title="USDA 2-Hour Rule">
              Perishable food left at room temperature for more than 2 hours should be discarded. In
              hot weather (above 90\u00B0F / 32\u00B0C), this window shrinks to 1 hour. Always
              refrigerate or freeze leftovers promptly.
            </Alert>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
