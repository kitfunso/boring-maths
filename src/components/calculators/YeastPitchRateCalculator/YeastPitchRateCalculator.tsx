/**
 * Yeast Pitch Rate Calculator Component
 * Calculate proper yeast cell counts for fermentation
 */

import { useState, useMemo } from 'preact/hooks';
import { ResultCard, Input, Select, ButtonGroup, Slider } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import type { YeastPitchRateInputs } from './types';
import {
  PITCH_RATES,
  YEAST_FORMATS,
  STARTER_GROWTH,
  STARTER_SIZES,
  GRAVITY_PRESETS,
  BATCH_PRESETS,
} from './types';
import { calculateYeastPitchRate, formatCells } from './calculations';

export function YeastPitchRateCalculator() {
  const [inputs, setInputs] = useState<YeastPitchRateInputs>({
    batchVolume: 5,
    volumeUnit: 'gallons',
    originalGravity: 1.05,
    beerType: 'ale',
    yeastFormat: 'liquid',
    yeastAge: 14,
    packagesAvailable: 1,
    cellsPerPackage: 100,
    starterVolume: 1.5,
    useStarter: false,
    starterType: 'stir-plate',
  });

  const results = useMemo(() => calculateYeastPitchRate(inputs), [inputs]);

  const selectedYeastFormat = YEAST_FORMATS.find((f) => f.value === inputs.yeastFormat);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Batch Details</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                  Unit
                </label>
                <ButtonGroup
                  options={[
                    { value: 'gallons', label: 'Gallons' },
                    { value: 'liters', label: 'Liters' },
                  ]}
                  value={inputs.volumeUnit}
                  onChange={(v) =>
                    setInputs({
                      ...inputs,
                      volumeUnit: v as YeastPitchRateInputs[keyof YeastPitchRateInputs],
                    })
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {BATCH_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() =>
                    setInputs({
                      ...inputs,
                      batchVolume:
                        inputs.volumeUnit === 'gallons' ? preset.gallons : preset.gallons * 3.78541,
                    })
                  }
                  className="rounded-lg bg-[var(--color-background)] px-3 py-1.5 text-xs ring-1 ring-white/5 hover:ring-amber-500/30"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <Slider
              label="Original Gravity"
              value={inputs.originalGravity}
              onChange={(v) => setInputs({ ...inputs, originalGravity: v })}
              min={1.02}
              max={1.13}
              step={0.001}
              formatValue={(v) => v.toFixed(3)}
            />

            <div className="grid grid-cols-3 gap-2">
              {GRAVITY_PRESETS.slice(0, 6).map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setInputs({ ...inputs, originalGravity: preset.og })}
                  className={`rounded-lg p-2 text-xs ring-1 transition-all ${
                    Math.abs(inputs.originalGravity - preset.og) < 0.002
                      ? 'bg-amber-500/20 ring-amber-500/50'
                      : 'bg-[var(--color-background)] ring-white/5 hover:ring-amber-500/30'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                Beer Type
              </label>
              <ButtonGroup
                options={[
                  { value: 'ale', label: 'Ale' },
                  { value: 'lager', label: 'Lager' },
                  { value: 'hybrid', label: 'Hybrid' },
                ]}
                value={inputs.beerType}
                onChange={(v) =>
                  setInputs({
                    ...inputs,
                    beerType: v as YeastPitchRateInputs[keyof YeastPitchRateInputs],
                  })
                }
              />
              <p className="mt-2 text-xs text-[var(--color-subtle)]">
                {PITCH_RATES[inputs.beerType].description}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Yeast Details</h2>

          <div className="space-y-4">
            <Select
              label="Yeast Format"
              value={inputs.yeastFormat}
              onChange={(v) => {
                const format = YEAST_FORMATS.find((f) => f.value === v);
                setInputs({
                  ...inputs,
                  yeastFormat: v,
                  cellsPerPackage: format?.cellsPerPackage || 100,
                });
              }}
              options={YEAST_FORMATS.map((f) => ({
                value: f.value,
                label: f.label,
              }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Packages/Vials"
                type="number"
                value={inputs.packagesAvailable}
                onChange={(v) => setInputs({ ...inputs, packagesAvailable: parseInt(v) || 1 })}
                min={1}
                max={10}
              />
              <Input
                label="Cells per Package"
                type="number"
                value={inputs.cellsPerPackage}
                onChange={(v) => setInputs({ ...inputs, cellsPerPackage: parseFloat(v) || 100 })}
                min={50}
                max={1000}
                suffix="B"
              />
            </div>

            <Slider
              label="Yeast Age"
              value={inputs.yeastAge}
              onChange={(v) => setInputs({ ...inputs, yeastAge: v })}
              min={0}
              max={selectedYeastFormat?.maxAge || 180}
              step={1}
              formatValue={(v) => `${v} days`}
            />

            <div className="rounded-lg bg-amber-900/20 p-3 ring-1 ring-amber-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-200/80">Estimated Viability</span>
                <span
                  className={`font-bold ${
                    results.viability > 75
                      ? 'text-green-400'
                      : results.viability > 50
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }`}
                >
                  {results.viability}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Yeast Starter</h2>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={inputs.useStarter}
                onChange={(e) =>
                  setInputs({ ...inputs, useStarter: (e.target as HTMLInputElement).checked })
                }
                className="h-4 w-4 rounded border-white/20 bg-[var(--color-background)]"
              />
              <span className="text-sm text-[var(--color-subtle)]">Use Starter</span>
            </label>
          </div>

          {inputs.useStarter && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                  Starter Method
                </label>
                <ButtonGroup
                  options={Object.entries(STARTER_GROWTH).map(([key, val]) => ({
                    value: key,
                    label: val.label,
                  }))}
                  value={inputs.starterType}
                  onChange={(v) =>
                    setInputs({
                      ...inputs,
                      starterType: v as YeastPitchRateInputs[keyof YeastPitchRateInputs],
                    })
                  }
                />
              </div>

              <Slider
                label="Starter Volume"
                value={inputs.starterVolume}
                onChange={(v) => setInputs({ ...inputs, starterVolume: v })}
                min={0.5}
                max={4}
                step={0.5}
                formatValue={(v) => `${v} L`}
              />

              <div className="flex flex-wrap gap-2">
                {STARTER_SIZES.map((size) => (
                  <button
                    key={size.label}
                    onClick={() => setInputs({ ...inputs, starterVolume: size.liters })}
                    className={`rounded-lg px-3 py-1.5 text-xs ring-1 transition-all ${
                      inputs.starterVolume === size.liters
                        ? 'bg-amber-500/20 ring-amber-500/50'
                        : 'bg-[var(--color-background)] ring-white/5 hover:ring-amber-500/30'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div
          className={`rounded-2xl p-6 ring-1 ${
            results.isPitchRateAdequate
              ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 ring-green-500/30'
              : 'bg-gradient-to-br from-red-500/20 to-red-600/10 ring-red-500/30'
          }`}
        >
          <h2
            className={`mb-4 text-lg font-semibold ${
              results.isPitchRateAdequate ? 'text-green-300' : 'text-red-300'
            }`}
          >
            Pitch Rate Status
          </h2>
          <div className="text-center">
            <div
              className={`text-5xl font-bold ${
                results.isPitchRateAdequate ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {results.pitchRate.toFixed(2)}
              <span className="ml-2 text-xl">M/mL/°P</span>
            </div>
            <div
              className={`mt-2 ${results.isPitchRateAdequate ? 'text-green-300' : 'text-red-300'}`}
            >
              Target: {results.targetPitchRate} M/mL/°P ({inputs.beerType})
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard label="Cells Needed" value={formatCells(results.cellsNeeded)} color="blue" />
          <ResultCard
            label="Cells Available"
            value={formatCells(results.cellsAvailable)}
            sublabel={inputs.useStarter ? 'with starter' : 'without starter'}
            color={results.isPitchRateAdequate ? 'green' : 'purple'}
          />
          <ResultCard
            label="Packages Needed"
            value={results.packagesNeeded.toString()}
            sublabel="without starter"
            color="blue"
          />
          <ResultCard
            label="Yeast Viability"
            value={`${results.viability}%`}
            sublabel={`at ${inputs.yeastAge} days`}
            color={results.viability > 75 ? 'green' : results.viability > 50 ? 'purple' : 'blue'}
          />
        </div>

        {inputs.useStarter && (
          <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Starter Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-subtle)]">Initial Cells</span>
                <span className="font-medium text-[var(--color-text)]">
                  {formatCells(
                    Math.round(
                      inputs.packagesAvailable * inputs.cellsPerPackage * (results.viability / 100)
                    )
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-subtle)]">Cells Grown</span>
                <span className="font-medium text-green-400">
                  +{formatCells(results.starterCellsProduced)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-subtle)]">Total Cells</span>
                <span className="font-medium text-[var(--color-text)]">
                  {formatCells(results.totalCellsWithStarter)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-subtle)]">Method</span>
                <span className="font-medium text-[var(--color-text)]">
                  {STARTER_GROWTH[inputs.starterType].label}
                </span>
              </div>
            </div>
          </div>
        )}

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

        {results.recommendations.length > 0 && (
          <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Recommendations</h3>
            <ul className="space-y-2 text-sm text-[var(--color-subtle)]">
              {results.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Pitch Rate Guide</h3>
          <div className="space-y-3">
            {Object.entries(PITCH_RATES).map(([key, rate]) => (
              <div
                key={key}
                className={`flex items-center justify-between rounded-lg p-3 ${
                  key === inputs.beerType
                    ? 'bg-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-[var(--color-background)]'
                }`}
              >
                <div>
                  <div className="font-medium text-[var(--color-text)]">{rate.label}</div>
                  <div className="text-xs text-[var(--color-subtle)]">{rate.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-400">{rate.standard}</div>
                  <div className="text-xs text-[var(--color-subtle)]">M/mL/°P</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-amber-900/20 p-4 ring-1 ring-amber-500/30">
          <h4 className="mb-2 font-medium text-amber-400">Pitching Tips</h4>
          <ul className="space-y-1 text-sm text-amber-200/80">
            <li>• Pitch yeast when wort is at fermentation temperature</li>
            <li>• Aerate wort well before pitching (shake or pure O₂)</li>
            <li>• Cold crash and decant starter before pitching</li>
            <li>• Higher gravity beers stress yeast more - pitch more</li>
            <li>• Underpitching causes off-flavors and slow fermentation</li>
          </ul>
        </div>

        <div className="flex justify-center pt-4">
          <ShareResults
            result={`Yeast pitch rate: ${results.pitchRate.toFixed(2)} M/mL/°P (target: ${results.targetPitchRate}). Cells needed: ${formatCells(results.cellsNeeded)}, available: ${formatCells(results.cellsAvailable)}. ${inputs.batchVolume} ${inputs.volumeUnit === 'gallons' ? 'gal' : 'L'} ${inputs.beerType} at OG ${inputs.originalGravity}.`}
            calculatorName="Yeast Pitch Rate Calculator"
          />
        </div>
      </div>
    </div>
  );
}
