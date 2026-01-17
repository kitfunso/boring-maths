/**
 * Fragrance Load Calculator Component
 * Calculate fragrance oil amounts for candle making
 */

import { useState, useMemo } from 'preact/hooks';
import { ResultCard, Input, Select, ButtonGroup, Slider } from '../../ui';
import type { FragranceInputs } from './types';
import { WAX_TYPES, CONTAINER_SIZES } from './types';
import { calculateFragrance } from './calculations';

export function FragranceCalculator() {
  const [inputs, setInputs] = useState<FragranceInputs>({
    waxWeight: 16,
    weightUnit: 'ounces',
    fragranceLoad: 8,
    waxType: 'soy-464',
    numberOfCandles: 2,
  });

  const results = useMemo(() => calculateFragrance(inputs), [inputs]);

  const selectedWax = WAX_TYPES.find((w) => w.value === inputs.waxType);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Wax Settings</h2>

          <div className="space-y-4">
            <Select
              label="Wax Type"
              value={inputs.waxType}
              onChange={(v) => setInputs({ ...inputs, waxType: v })}
              options={WAX_TYPES.map((w) => ({
                value: w.value,
                label: `${w.label} (max ${w.maxFragrance}%)`,
              }))}
            />

            {selectedWax && (
              <div className="rounded-lg bg-purple-900/20 p-3 ring-1 ring-purple-500/20">
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="text-purple-400">{selectedWax.maxFragrance}%</div>
                    <div className="text-xs text-purple-300/70">Max Load</div>
                  </div>
                  <div>
                    <div className="text-purple-400">{selectedWax.meltPoint}</div>
                    <div className="text-xs text-purple-300/70">Melt Point</div>
                  </div>
                  <div>
                    <div className="text-purple-400">{selectedWax.throwRating}</div>
                    <div className="text-xs text-purple-300/70">Throw</div>
                  </div>
                </div>
              </div>
            )}

            <Input
              label="Total Wax Weight"
              type="number"
              value={inputs.waxWeight}
              onChange={(v) => setInputs({ ...inputs, waxWeight: parseFloat(v) || 0 })}
              min={1}
              max={1000}
              step={0.5}
              suffix={inputs.weightUnit}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                Weight Unit
              </label>
              <ButtonGroup
                options={[
                  { value: 'ounces', label: 'Ounces' },
                  { value: 'grams', label: 'Grams' },
                  { value: 'pounds', label: 'Pounds' },
                ]}
                value={inputs.weightUnit}
                onChange={(v) =>
                  setInputs({ ...inputs, weightUnit: v as 'ounces' | 'grams' | 'pounds' })
                }
              />
            </div>

            <Slider
              label="Fragrance Load"
              value={inputs.fragranceLoad}
              onChange={(v) => setInputs({ ...inputs, fragranceLoad: v })}
              min={3}
              max={12}
              step={0.5}
              formatValue={(v) => `${v}%`}
            />

            {!results.isWithinLimit && (
              <div className="rounded-lg bg-red-900/20 p-3 ring-1 ring-red-500/30">
                <p className="text-sm text-red-400">
                  Warning: {inputs.fragranceLoad}% exceeds the recommended max of{' '}
                  {results.maxAllowed}% for this wax type. This may cause sweating, poor burn, or
                  safety issues.
                </p>
              </div>
            )}

            <Input
              label="Number of Candles"
              type="number"
              value={inputs.numberOfCandles}
              onChange={(v) => setInputs({ ...inputs, numberOfCandles: parseInt(v) || 1 })}
              min={1}
              max={100}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
            Container Quick Reference
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {CONTAINER_SIZES.map((container) => (
              <button
                key={container.label}
                onClick={() =>
                  setInputs({
                    ...inputs,
                    waxWeight:
                      inputs.weightUnit === 'grams'
                        ? container.waxOz * 28.3495
                        : inputs.weightUnit === 'pounds'
                          ? container.waxOz / 16
                          : container.waxOz,
                    numberOfCandles: 1,
                  })
                }
                className="rounded-lg bg-[var(--color-background)] p-2 text-left text-sm ring-1 ring-white/5 hover:ring-purple-500/30"
              >
                <div className="font-medium text-[var(--color-text)]">{container.label}</div>
                <div className="text-xs text-[var(--color-subtle)]">~{container.waxOz} oz wax</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-6 ring-1 ring-purple-500/30">
          <h2 className="mb-4 text-lg font-semibold text-purple-300">Fragrance Amount</h2>
          <div className="text-center">
            <div className="text-5xl font-bold text-purple-400">
              {results.fragranceAmount}
              <span className="ml-2 text-2xl">{inputs.weightUnit}</span>
            </div>
            <div className="mt-2 text-purple-300">
              at {inputs.fragranceLoad}% fragrance load
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard
            label="Total Batch Weight"
            value={`${results.totalWeight} ${inputs.weightUnit}`}
            sublabel="wax + fragrance"
            color="blue"
          />
          <ResultCard
            label="Est. Fragrance Cost"
            value={`$${results.costEstimate.toFixed(2)}`}
            sublabel="@ $2/oz average"
            color="green"
          />
        </div>

        {inputs.numberOfCandles > 1 && (
          <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Per Candle</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--color-text)]">
                  {results.waxPerCandle} {inputs.weightUnit}
                </div>
                <div className="text-sm text-[var(--color-subtle)]">Wax</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {results.fragrancePerCandle} {inputs.weightUnit}
                </div>
                <div className="text-sm text-[var(--color-subtle)]">Fragrance</div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Load Guidelines</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-subtle)]">Light scent throw</span>
              <span className="text-[var(--color-text)]">5-6%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-subtle)]">Medium scent throw</span>
              <span className="text-[var(--color-text)]">7-8%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-subtle)]">Strong scent throw</span>
              <span className="text-[var(--color-text)]">9-10%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-400">Maximum (check wax specs)</span>
              <span className="text-amber-400">10-12%</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-amber-900/20 p-4 ring-1 ring-amber-500/30">
          <h4 className="mb-2 font-medium text-amber-400">Best Practices</h4>
          <ul className="space-y-1 text-sm text-amber-200/80">
            <li>• Add fragrance at the correct temperature (usually 180-185°F for soy)</li>
            <li>• Stir for a full 2 minutes to ensure proper binding</li>
            <li>• Allow 1-2 weeks cure time for best scent throw</li>
            <li>• Test burn every new fragrance/wax combination</li>
            <li>• Keep detailed notes for reproducibility</li>
          </ul>
        </div>

        <div className="rounded-lg bg-red-900/20 p-4 ring-1 ring-red-500/30">
          <h4 className="mb-2 font-medium text-red-400">Safety Note</h4>
          <p className="text-sm text-red-200/80">
            Never exceed manufacturer&apos;s recommended fragrance load. Too much fragrance can
            cause the candle to sweat, produce soot, or create fire hazards. Always test burn
            candles before selling.
          </p>
        </div>
      </div>
    </div>
  );
}
