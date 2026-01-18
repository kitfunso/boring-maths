/**
 * Glaze Recipe Calculator Component
 * Scale and calculate pottery glaze recipes
 */

import { useState, useMemo } from 'preact/hooks';
import { Input, Select, ButtonGroup, Slider } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import type { GlazeInputs, GlazeIngredient } from './types';
import { GLAZE_MATERIALS, GLAZE_RECIPES } from './types';
import { calculateGlaze } from './calculations';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function GlazeCalculator() {
  const [inputs, setInputs] = useState<GlazeInputs>({
    ingredients: [
      { id: generateId(), name: 'Custer Feldspar', percentage: 40 },
      { id: generateId(), name: 'Silica (Flint)', percentage: 30 },
      { id: generateId(), name: 'Whiting (Calcium Carbonate)', percentage: 20 },
      { id: generateId(), name: 'EPK Kaolin', percentage: 10 },
    ],
    targetWeight: 1000,
    weightUnit: 'grams',
    waterRatio: 0.5,
  });

  const results = useMemo(() => calculateGlaze(inputs), [inputs]);

  const addIngredient = () => {
    setInputs({
      ...inputs,
      ingredients: [
        ...inputs.ingredients,
        { id: generateId(), name: 'Silica (Flint)', percentage: 0 },
      ],
    });
  };

  const removeIngredient = (id: string) => {
    if (inputs.ingredients.length > 1) {
      setInputs({
        ...inputs,
        ingredients: inputs.ingredients.filter((i) => i.id !== id),
      });
    }
  };

  const updateIngredient = (id: string, field: keyof GlazeIngredient, value: string | number) => {
    setInputs({
      ...inputs,
      ingredients: inputs.ingredients.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    });
  };

  const loadRecipe = (recipeName: string) => {
    const recipe = GLAZE_RECIPES.find((r) => r.name === recipeName);
    if (recipe) {
      setInputs({
        ...inputs,
        ingredients: recipe.ingredients.map((ing) => ({
          id: generateId(),
          name: ing.name,
          percentage: ing.percentage,
        })),
      });
    }
  };

  const materialOptions = GLAZE_MATERIALS.map((m) => ({
    value: m.name,
    label: `${m.name} (${m.category})`,
  }));

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Batch Settings</h2>

          <div className="space-y-4">
            <Select
              label="Load Recipe Template"
              value=""
              onChange={(v) => loadRecipe(v)}
              options={[
                { value: '', label: 'Select a recipe...' },
                ...GLAZE_RECIPES.map((r) => ({ value: r.name, label: `${r.name}` })),
              ]}
            />

            <Input
              label="Target Dry Weight"
              type="number"
              value={inputs.targetWeight}
              onChange={(v) => setInputs({ ...inputs, targetWeight: parseFloat(v) || 0 })}
              min={1}
              max={50000}
              suffix={inputs.weightUnit}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                Weight Unit
              </label>
              <ButtonGroup
                options={[
                  { value: 'grams', label: 'Grams' },
                  { value: 'ounces', label: 'Ounces' },
                  { value: 'pounds', label: 'Pounds' },
                ]}
                value={inputs.weightUnit}
                onChange={(v) =>
                  setInputs({ ...inputs, weightUnit: v as 'grams' | 'ounces' | 'pounds' })
                }
              />
            </div>

            <Slider
              label="Water Ratio"
              value={inputs.waterRatio}
              onChange={(v) => setInputs({ ...inputs, waterRatio: v })}
              min={0.3}
              max={1.0}
              step={0.05}
              formatValue={(v) => `${(v * 100).toFixed(0)}% of dry weight`}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Ingredients</h2>
            <button
              onClick={addIngredient}
              className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-500"
            >
              + Add Ingredient
            </button>
          </div>

          <div className="space-y-3">
            {inputs.ingredients.map((ing, _index) => (
              <div
                key={ing.id}
                className="flex items-center gap-3 rounded-lg bg-orange-900/20 p-3 ring-1 ring-orange-500/20"
              >
                <div className="min-w-0 flex-1">
                  <Select
                    label=""
                    value={ing.name}
                    onChange={(v) => updateIngredient(ing.id, 'name', v)}
                    options={materialOptions}
                  />
                </div>
                <div className="w-24">
                  <Input
                    label=""
                    type="number"
                    value={ing.percentage}
                    onChange={(v) => updateIngredient(ing.id, 'percentage', parseFloat(v) || 0)}
                    min={0}
                    max={100}
                    step={0.5}
                    suffix="%"
                  />
                </div>
                {inputs.ingredients.length > 1 && (
                  <button
                    onClick={() => removeIngredient(ing.id)}
                    className="text-red-400 hover:text-red-300"
                    title="Remove"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div
            className={`mt-4 rounded-lg p-3 ${
              results.isValid
                ? 'bg-green-900/20 ring-1 ring-green-500/30'
                : 'bg-red-900/20 ring-1 ring-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={results.isValid ? 'text-green-400' : 'text-red-400'}>
                Total: {results.percentageTotal}%
              </span>
              <span className="text-sm text-[var(--color-subtle)]">
                {results.isValid ? 'Valid recipe' : 'Should equal 100%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 p-6 ring-1 ring-orange-500/30">
          <h2 className="mb-4 text-lg font-semibold text-orange-300">Batch Weights</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {results.totalDryWeight} {inputs.weightUnit}
              </div>
              <div className="text-sm text-orange-300">Dry Materials</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {results.waterWeight} {inputs.weightUnit}
              </div>
              <div className="text-sm text-cyan-300">Water</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {results.totalBatchWeight} {inputs.weightUnit}
              </div>
              <div className="text-sm text-green-300">Total Batch</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
            Weigh Out ({inputs.weightUnit})
          </h3>
          <div className="space-y-2">
            {results.ingredientWeights.map((ing) => (
              <div
                key={ing.id}
                className="flex items-center justify-between rounded-lg bg-[var(--color-background)] p-3"
              >
                <span className="text-[var(--color-text)]">{ing.name}</span>
                <span className="font-mono font-medium text-orange-400">
                  {ing.weight} {inputs.weightUnit}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg bg-cyan-900/20 p-3">
              <span className="text-cyan-300">Water</span>
              <span className="font-mono font-medium text-cyan-400">
                {results.waterWeight} {inputs.weightUnit}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-amber-900/20 p-4 ring-1 ring-amber-500/30">
          <h4 className="mb-2 font-medium text-amber-400">Glaze Mixing Tips</h4>
          <ul className="space-y-1 text-sm text-amber-200/80">
            <li>• Add dry materials to water, not water to dry</li>
            <li>• Mix thoroughly and sieve twice (80 mesh)</li>
            <li>• Let glaze sit 24 hours before using</li>
            <li>• Adjust water for dipping vs. brushing consistency</li>
            <li>• Always test new glazes on test tiles first</li>
          </ul>
        </div>

        <div className="rounded-lg bg-red-900/20 p-4 ring-1 ring-red-500/30">
          <h4 className="mb-2 font-medium text-red-400">Safety Reminder</h4>
          <p className="text-sm text-red-200/80">
            Always wear a NIOSH-approved respirator when handling dry glaze materials. Many
            materials (silica, barium, lithium, colorants) are hazardous when inhaled. Work in a
            well-ventilated area.
          </p>
        </div>

        <div className="flex justify-center pt-4">
          <ShareResults
            result={`Glaze batch: ${results.totalDryWeight} ${inputs.weightUnit} dry materials + ${results.waterWeight} ${inputs.weightUnit} water = ${results.totalBatchWeight} ${inputs.weightUnit} total. ${inputs.ingredients.length} ingredients at ${inputs.waterRatio * 100}% water ratio.`}
            calculatorName="Glaze Recipe Calculator"
          />
        </div>
      </div>
    </div>
  );
}
