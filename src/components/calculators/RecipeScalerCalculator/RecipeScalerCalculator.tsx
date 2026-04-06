/**
 * Recipe Scaler Calculator - React Component
 */

import { useCallback } from 'preact/hooks';
import { calculateRecipeScaler } from './calculations';
import { getDefaultInputs, COMMON_UNITS, type RecipeScalerInputs, type Ingredient } from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  Toggle,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

const QUICK_SCALES = [
  { label: '\u00BDx', factor: 0.5 },
  { label: '2x', factor: 2 },
  { label: '3x', factor: 3 },
] as const;

export default function RecipeScalerCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorState<
    RecipeScalerInputs,
    ReturnType<typeof calculateRecipeScaler>
  >({
    name: 'Recipe Scaler Calculator',
    defaults: getDefaultInputs,
    compute: calculateRecipeScaler,
  });

  const applyQuickScale = useCallback(
    (factor: number) => {
      setInputs((prev) => ({
        ...prev,
        desiredServings: Math.round(prev.originalServings * factor),
      }));
    },
    [setInputs]
  );

  const updateIngredient = useCallback(
    (index: number, field: keyof Ingredient, value: string | number) => {
      setInputs((prev) => {
        const updated = prev.ingredients.map((ing, i) =>
          i === index ? { ...ing, [field]: value } : ing
        );
        return { ...prev, ingredients: updated };
      });
    },
    [setInputs]
  );

  const addIngredient = useCallback(() => {
    setInputs((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: 0, unit: 'cups' }],
    }));
  }, [setInputs]);

  const removeIngredient = useCallback(
    (index: number) => {
      setInputs((prev) => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index),
      }));
    },
    [setInputs]
  );

  const hasIngredients = inputs.ingredients.length > 0;
  const hasValidServings = inputs.originalServings > 0 && inputs.desiredServings > 0;
  const showResults = hasIngredients && hasValidServings;

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="Recipe Scaler Calculator"
          subtitle="Scale any recipe up or down with smart rounding"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Servings */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div>
                <Label htmlFor="originalServings" required>
                  Original Servings
                </Label>
                <Input
                  id="originalServings"
                  type="number"
                  min={1}
                  step={1}
                  value={inputs.originalServings}
                  onChange={(e) =>
                    updateInput('originalServings', Math.max(1, Number(e.target.value)))
                  }
                />
              </div>
              <div>
                <Label htmlFor="desiredServings" required>
                  Desired Servings
                </Label>
                <Input
                  id="desiredServings"
                  type="number"
                  min={1}
                  step={1}
                  value={inputs.desiredServings}
                  onChange={(e) =>
                    updateInput('desiredServings', Math.max(1, Number(e.target.value)))
                  }
                />
              </div>
            </Grid>

            {/* Quick scale buttons */}
            <div>
              <Label>Quick Scale</Label>
              <div className="flex flex-wrap gap-2">
                {QUICK_SCALES.map(({ label, factor }) => {
                  const isActive =
                    inputs.desiredServings === Math.round(inputs.originalServings * factor);
                  return (
                    <button
                      key={label}
                      onClick={() => applyQuickScale(factor)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[var(--color-accent)] text-[var(--color-void)]'
                          : 'bg-[var(--color-night)] text-[var(--color-subtle)] hover:bg-white/10'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Baking mode toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Baking Mode</Label>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">
                  Round to kitchen-friendly fractions (1/4 cup, whole eggs)
                </p>
              </div>
              <Toggle
                checked={inputs.isBakingMode}
                onChange={(checked) => updateInput('isBakingMode', checked)}
              />
            </div>

            {/* Ingredients list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Ingredients</Label>
                <button
                  onClick={addIngredient}
                  className="px-3 py-1.5 rounded-lg text-sm bg-[var(--color-accent)] text-[var(--color-void)] font-medium hover:opacity-90 transition-opacity"
                >
                  + Add Ingredient
                </button>
              </div>

              <div className="space-y-3">
                {inputs.ingredients.map((ing, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-start bg-[var(--color-night)] rounded-xl p-3 border border-white/10"
                  >
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        placeholder="Ingredient name"
                        value={ing.name}
                        onChange={(e) =>
                          updateIngredient(index, 'name', (e.target as HTMLInputElement).value)
                        }
                        className="w-full bg-transparent border-b border-white/10 pb-1 text-sm text-[var(--color-cream)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] outline-none"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        min={0}
                        step={0.25}
                        value={ing.amount}
                        onChange={(e) =>
                          updateIngredient(
                            index,
                            'amount',
                            Number((e.target as HTMLInputElement).value)
                          )
                        }
                        className="w-full bg-transparent border-b border-white/10 pb-1 text-sm text-[var(--color-cream)] text-right focus:border-[var(--color-accent)] outline-none"
                      />
                    </div>
                    <div className="w-24">
                      <select
                        value={ing.unit}
                        onChange={(e) =>
                          updateIngredient(index, 'unit', (e.target as HTMLSelectElement).value)
                        }
                        className="w-full bg-transparent border-b border-white/10 pb-1 text-sm text-[var(--color-cream)] focus:border-[var(--color-accent)] outline-none appearance-none cursor-pointer"
                      >
                        {COMMON_UNITS.map((unit) => (
                          <option key={unit} value={unit} className="bg-[var(--color-void)]">
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => removeIngredient(index)}
                      className="p-1 text-[var(--color-muted)] hover:text-rose-400 transition-colors flex-shrink-0"
                      aria-label={`Remove ${ing.name || 'ingredient'}`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {inputs.ingredients.length === 0 && (
                <p className="text-sm text-[var(--color-muted)] text-center py-6">
                  No ingredients yet. Click "Add Ingredient" to start.
                </p>
              )}
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {showResults ? (
              <>
                {/* Primary Result */}
                <ResultCard
                  label="Scale Factor"
                  value={`${result.scaleFactor.toFixed(2)}x`}
                  subtitle={`${inputs.originalServings} servings \u2192 ${inputs.desiredServings} servings`}
                />

                {/* Metrics */}
                <Grid responsive={{ sm: 2, md: 3 }} gap="md">
                  <MetricCard
                    label="Scale Factor"
                    value={`${result.scaleFactor.toFixed(2)}x`}
                    sublabel={
                      result.scaleFactor > 1
                        ? 'scaling up'
                        : result.scaleFactor < 1
                          ? 'scaling down'
                          : 'same size'
                    }
                    valueColor="text-[var(--color-accent)]"
                  />
                  <MetricCard
                    label="Ingredients"
                    value={String(inputs.ingredients.length)}
                    sublabel="in recipe"
                  />
                  <MetricCard
                    label="Mode"
                    value={inputs.isBakingMode ? 'Baking' : 'Cooking'}
                    sublabel={inputs.isBakingMode ? 'precise fractions' : 'decimal amounts'}
                  />
                </Grid>

                {/* Scaled Ingredients Table */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Original vs Scaled
                  </h3>
                  <div className="space-y-2">
                    {/* Table header */}
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs text-[var(--color-muted)] uppercase tracking-wider pb-2 border-b border-white/5">
                      <span>Ingredient</span>
                      <span className="text-right w-20">Original</span>
                      <span className="text-right w-20">Scaled</span>
                      <span className="w-16">Unit</span>
                    </div>
                    {result.scaledIngredients.map((ing, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center py-2 border-b border-white/5 last:border-0"
                      >
                        <span className="text-sm text-[var(--color-cream)] truncate">
                          {ing.name || 'Unnamed'}
                        </span>
                        <span className="text-sm text-[var(--color-subtle)] text-right w-20">
                          {ing.originalAmount}
                        </span>
                        <span className="text-sm font-semibold text-[var(--color-accent)] text-right w-20">
                          {ing.displayAmount}
                        </span>
                        <span className="text-sm text-[var(--color-subtle)] w-16">{ing.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pan & Time Adjustments */}
                <Grid responsive={{ sm: 2 }} gap="md">
                  <div className="bg-[var(--color-night)] rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">
                      Pan Size
                    </div>
                    <div className="text-sm text-[var(--color-cream)]">
                      {result.panSizeAdjustment}
                    </div>
                  </div>
                  <div className="bg-[var(--color-night)] rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">
                      Cooking Time
                    </div>
                    <div className="text-sm text-[var(--color-cream)]">
                      {result.cookingTimeAdjustment}
                    </div>
                  </div>
                </Grid>

                <Alert variant="tip" title="Baking tip:">
                  When scaling baking recipes above 2x, consider mixing multiple separate batches
                  instead of one large batch. Leavening agents (baking soda, baking powder) don't
                  scale linearly at high ratios.
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Add your recipe">
                Enter servings and add ingredients to see scaled amounts.
              </Alert>
            )}

            {/* Share Results */}
            {showResults && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Recipe scaled ${result.scaleFactor.toFixed(1)}x: ${inputs.originalServings} \u2192 ${inputs.desiredServings} servings (${inputs.ingredients.length} ingredients)`}
                  calculatorName="Recipe Scaler Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
