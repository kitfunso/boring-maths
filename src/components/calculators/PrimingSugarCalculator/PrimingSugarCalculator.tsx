/**
 * Priming Sugar Calculator Component
 * Calculate carbonation sugar for bottle conditioning
 */

import { useState, useMemo } from 'preact/hooks';
import { ResultCard, Input, Select, ButtonGroup, Slider } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import type { PrimingSugarInputs } from './types';
import { SUGAR_TYPES, STYLE_PRESETS, BATCH_PRESETS } from './types';
import { calculatePrimingSugar, formatCO2 } from './calculations';

export function PrimingSugarCalculator() {
  const [inputs, setInputs] = useState<PrimingSugarInputs>({
    batchVolume: 5,
    volumeUnit: 'gallons',
    beerTemp: 65,
    tempUnit: 'fahrenheit',
    targetCO2: 2.4,
    sugarType: 'corn',
    containerType: 'bottle',
  });

  const results = useMemo(() => calculatePrimingSugar(inputs), [inputs]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Batch Size</h2>

          <div className="space-y-4">
            <Input
              label="Batch Volume"
              type="number"
              value={inputs.batchVolume}
              onChange={(v) => setInputs({ ...inputs, batchVolume: parseFloat(v) || 0 })}
              min={0.5}
              step={0.5}
              suffix={inputs.volumeUnit === 'gallons' ? 'gal' : 'L'}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                Volume Unit
              </label>
              <ButtonGroup
                options={[
                  { value: 'gallons', label: 'Gallons' },
                  { value: 'liters', label: 'Liters' },
                ]}
                value={inputs.volumeUnit}
                onChange={(v) => setInputs({ ...inputs, volumeUnit: v as any })}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {BATCH_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() =>
                    setInputs({
                      ...inputs,
                      batchVolume: inputs.volumeUnit === 'gallons'
                        ? preset.gallons
                        : preset.gallons * 3.78541,
                    })
                  }
                  className="rounded-lg bg-[var(--color-background)] px-3 py-1.5 text-xs ring-1 ring-white/5 hover:ring-amber-500/30"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                Container Type
              </label>
              <ButtonGroup
                options={[
                  { value: 'bottle', label: 'Bottles' },
                  { value: 'keg', label: 'Keg' },
                ]}
                value={inputs.containerType}
                onChange={(v) => setInputs({ ...inputs, containerType: v as any })}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Carbonation Level</h2>

          <div className="space-y-4">
            <Slider
              label="Target CO₂ Volumes"
              value={inputs.targetCO2}
              onChange={(v) => setInputs({ ...inputs, targetCO2: v })}
              min={1.0}
              max={4.5}
              step={0.1}
              formatValue={(v) => `${v.toFixed(1)} vol`}
            />

            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style.label}
                  onClick={() => setInputs({ ...inputs, targetCO2: style.co2 })}
                  className={`rounded-lg p-2 text-left text-xs ring-1 transition-all ${
                    Math.abs(inputs.targetCO2 - style.co2) < 0.1
                      ? 'bg-amber-500/20 ring-amber-500/50'
                      : 'bg-[var(--color-background)] ring-white/5 hover:ring-amber-500/30'
                  }`}
                >
                  <div className="font-medium text-[var(--color-text)]">{style.label}</div>
                  <div className="text-[var(--color-subtle)]">{style.range} vol</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Beer Temperature"
                type="number"
                value={inputs.beerTemp}
                onChange={(v) => setInputs({ ...inputs, beerTemp: parseFloat(v) || 0 })}
                min={32}
                max={80}
                suffix={inputs.tempUnit === 'fahrenheit' ? '°F' : '°C'}
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                  Temp Unit
                </label>
                <ButtonGroup
                  options={[
                    { value: 'fahrenheit', label: '°F' },
                    { value: 'celsius', label: '°C' },
                  ]}
                  value={inputs.tempUnit}
                  onChange={(v) => setInputs({ ...inputs, tempUnit: v as any })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Sugar Type</h2>

          <Select
            label="Priming Sugar"
            value={inputs.sugarType}
            onChange={(v) => setInputs({ ...inputs, sugarType: v })}
            options={SUGAR_TYPES.map((s) => ({
              value: s.value,
              label: s.label,
            }))}
          />

          <div className="mt-4 rounded-lg bg-amber-900/20 p-3 ring-1 ring-amber-500/20">
            <p className="text-sm text-amber-200/80">
              Corn sugar (dextrose) is most common. Table sugar works equally well.
              Honey and DME add subtle flavor but require more weight.
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-6 ring-1 ring-amber-500/30">
          <h2 className="mb-4 text-lg font-semibold text-amber-300">Priming Sugar</h2>
          <div className="text-center">
            <div className="text-5xl font-bold text-amber-400">
              {results.sugarAmount}
              <span className="ml-2 text-2xl">{results.sugarUnit}</span>
            </div>
            <div className="mt-2 text-amber-300">
              {SUGAR_TYPES.find(s => s.value === inputs.sugarType)?.label}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard
            label="Per Bottle (12oz)"
            value={`${results.sugarPerBottle} ${results.bottleUnit}`}
            color="blue"
          />
          <ResultCard
            label="Target CO₂"
            value={formatCO2(results.totalCO2)}
            color="green"
          />
          <ResultCard
            label="Residual CO₂"
            value={formatCO2(results.residualCO2)}
            sublabel="already in beer"
            color="purple"
          />
          <ResultCard
            label="CO₂ to Add"
            value={formatCO2(results.addedCO2)}
            sublabel="from priming"
            color="blue"
          />
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Sugar Alternatives</h3>
          <div className="space-y-2">
            {results.sugarAlternatives.map((alt, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-[var(--color-subtle)]">{alt.name}</span>
                <span className="font-medium text-[var(--color-text)]">
                  {alt.amount} {alt.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {results.warnings.length > 0 && (
          <div className="rounded-lg bg-red-900/20 p-4 ring-1 ring-red-500/30">
            <h4 className="mb-2 font-medium text-red-400">Warnings</h4>
            <ul className="space-y-1 text-sm text-red-200/80">
              {results.warnings.map((warning, i) => (
                <li key={i}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Bottle Conditioning</h3>
          <div className="space-y-2 text-sm text-[var(--color-subtle)]">
            <div className="flex items-center gap-2">
              <span className="w-6 text-center font-bold text-amber-400">1</span>
              <span>Dissolve sugar in 1-2 cups of boiling water</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 text-center font-bold text-amber-400">2</span>
              <span>Cool and add to bottling bucket</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 text-center font-bold text-amber-400">3</span>
              <span>Gently rack beer onto sugar solution</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 text-center font-bold text-amber-400">4</span>
              <span>Fill and cap bottles</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 text-center font-bold text-amber-400">5</span>
              <span>Store at 65-75°F for 2-3 weeks</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-amber-900/20 p-4 ring-1 ring-amber-500/30">
          <h4 className="mb-2 font-medium text-amber-400">Carbonation Tips</h4>
          <ul className="space-y-1 text-sm text-amber-200/80">
            <li>• Colder beer at bottling = more CO₂ needed</li>
            <li>• Warmer conditioning temps = faster carbonation</li>
            <li>• Higher gravity beers may need more time</li>
            <li>• Test one bottle at 2 weeks before chilling batch</li>
            <li>• Carbonation drops are less precise but convenient</li>
          </ul>
        </div>

        <div className="flex justify-center pt-4">
          <ShareResults
            result={`Priming sugar: ${results.sugarAmount} ${results.sugarUnit} for ${inputs.batchVolume} ${inputs.volumeUnit === 'gallons' ? 'gal' : 'L'} batch. Target CO2: ${formatCO2(results.totalCO2)}. Per 12oz bottle: ${results.sugarPerBottle} ${results.bottleUnit}.`}
            calculatorName="Priming Sugar Calculator"
          />
        </div>
      </div>
    </div>
  );
}
