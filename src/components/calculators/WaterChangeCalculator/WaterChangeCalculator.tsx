/**
 * Water Change Calculator Component
 * Calculate dilution and parameter adjustment for aquariums
 */

import { useState, useMemo } from 'preact/hooks';
import { ResultCard, Input, Select, ButtonGroup, Slider } from '../../ui';
import type { WaterChangeInputs } from './types';
import { PARAMETER_PRESETS, CHANGE_PRESETS, TANK_PRESETS, FREQUENCY_OPTIONS } from './types';
import { calculateWaterChange, formatParameter } from './calculations';

export function WaterChangeCalculator() {
  const [inputs, setInputs] = useState<WaterChangeInputs>({
    tankVolume: 55,
    volumeUnit: 'gallons',
    changePercent: 25,
    currentParameter: 40,
    targetParameter: 20,
    parameterType: 'nitrate',
    newWaterParameter: 0,
    changeFrequency: 'weekly',
  });

  const results = useMemo(() => calculateWaterChange(inputs), [inputs]);

  const selectedPreset = PARAMETER_PRESETS.find(p => p.value === inputs.parameterType);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Tank Setup</h2>

          <div className="space-y-4">
            <Input
              label="Tank Volume"
              type="number"
              value={inputs.tankVolume}
              onChange={(v) => setInputs({ ...inputs, tankVolume: parseFloat(v) || 0 })}
              min={1}
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
              {TANK_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() =>
                    setInputs({
                      ...inputs,
                      tankVolume: inputs.volumeUnit === 'gallons'
                        ? preset.gallons
                        : preset.gallons * 3.78541,
                    })
                  }
                  className="rounded-lg bg-[var(--color-background)] px-3 py-1.5 text-xs ring-1 ring-white/5 hover:ring-cyan-500/30"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Water Change</h2>

          <div className="space-y-4">
            <Slider
              label="Water Change Percentage"
              value={inputs.changePercent}
              onChange={(v) => setInputs({ ...inputs, changePercent: v })}
              min={5}
              max={75}
              step={5}
              formatValue={(v) => `${v}%`}
            />

            <div className="flex flex-wrap gap-2">
              {CHANGE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setInputs({ ...inputs, changePercent: preset.value })}
                  className={`rounded-lg px-3 py-1.5 text-xs ring-1 transition-all ${
                    inputs.changePercent === preset.value
                      ? 'bg-cyan-500/20 ring-cyan-500/50 text-cyan-300'
                      : 'bg-[var(--color-background)] ring-white/5 hover:ring-cyan-500/30'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <Select
              label="Change Frequency"
              value={inputs.changeFrequency}
              onChange={(v) => setInputs({ ...inputs, changeFrequency: v as any })}
              options={FREQUENCY_OPTIONS.map((f) => ({
                value: f.value,
                label: f.label,
              }))}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Parameter Tracking</h2>

          <div className="space-y-4">
            <Select
              label="Parameter Type"
              value={inputs.parameterType}
              onChange={(v) => {
                const preset = PARAMETER_PRESETS.find(p => p.value === v);
                setInputs({
                  ...inputs,
                  parameterType: v as any,
                  newWaterParameter: preset?.newWaterDefault || 0,
                  targetParameter: preset?.safeMax || 20,
                });
              }}
              options={PARAMETER_PRESETS.map((p) => ({
                value: p.value,
                label: p.label,
              }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Current Level"
                type="number"
                value={inputs.currentParameter}
                onChange={(v) => setInputs({ ...inputs, currentParameter: parseFloat(v) || 0 })}
                min={0}
                step={1}
                suffix={selectedPreset?.unit || ''}
              />
              <Input
                label="Target Level"
                type="number"
                value={inputs.targetParameter}
                onChange={(v) => setInputs({ ...inputs, targetParameter: parseFloat(v) || 0 })}
                min={0}
                step={1}
                suffix={selectedPreset?.unit || ''}
              />
            </div>

            <Input
              label="New Water Level"
              type="number"
              value={inputs.newWaterParameter}
              onChange={(v) => setInputs({ ...inputs, newWaterParameter: parseFloat(v) || 0 })}
              min={0}
              step={1}
              suffix={selectedPreset?.unit || ''}
            />

            {selectedPreset && selectedPreset.value !== 'custom' && (
              <div className="rounded-lg bg-cyan-900/20 p-3 ring-1 ring-cyan-500/20">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="text-green-400">{"<"}{selectedPreset.safeMax}</div>
                    <div className="text-green-300/70">Ideal</div>
                  </div>
                  <div>
                    <div className="text-amber-400">{selectedPreset.safeMax}-{selectedPreset.warningMax}</div>
                    <div className="text-amber-300/70">Elevated</div>
                  </div>
                  <div>
                    <div className="text-red-400">{">"}{selectedPreset.dangerMax}</div>
                    <div className="text-red-300/70">Danger</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 p-6 ring-1 ring-cyan-500/30">
          <h2 className="mb-4 text-lg font-semibold text-cyan-300">Water to Change</h2>
          <div className="text-center">
            <div className="text-5xl font-bold text-cyan-400">
              {results.waterToRemove}
              <span className="ml-2 text-2xl">{results.volumeUnit}</span>
            </div>
            <div className="mt-2 text-cyan-300">
              {inputs.changePercent}% of {inputs.tankVolume} {results.volumeUnit}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard
            label="After Change"
            value={formatParameter(results.parameterAfterChange, inputs.parameterType)}
            sublabel={`from ${formatParameter(inputs.currentParameter, inputs.parameterType)}`}
            color="blue"
          />
          <ResultCard
            label="Reduction"
            value={`${results.reductionPercent}%`}
            sublabel="parameter decrease"
            color="green"
          />
          <ResultCard
            label="Weekly Volume"
            value={`${results.weeklyVolume} ${results.volumeUnit}`}
            color="purple"
          />
          <ResultCard
            label="Monthly Volume"
            value={`${results.monthlyVolume} ${results.volumeUnit}`}
            color="blue"
          />
        </div>

        {results.changesNeeded > 0 && (
          <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">To Reach Target</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400">
                {results.changesNeeded === -1 ? '∞' : results.changesNeeded}
              </div>
              <div className="mt-1 text-[var(--color-subtle)]">
                {results.changesNeeded === -1
                  ? 'Cannot reach target with current parameters'
                  : `water changes at ${inputs.changePercent}%`}
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Analysis</h3>
          <ul className="space-y-2">
            {results.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-subtle)]">
                <span className="text-cyan-400">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Dilution Math</h3>
          <div className="text-sm text-[var(--color-subtle)] space-y-2">
            <p>After each {inputs.changePercent}% water change:</p>
            <div className="rounded-lg bg-[var(--color-background)] p-3 font-mono text-xs">
              New Level = Current × {results.dilutionFactor.toFixed(3)} + New Water × {(1 - results.dilutionFactor).toFixed(3)}
            </div>
            <p className="mt-2">
              {results.dilutionFactor * 100}% of original water remains after each change.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-amber-900/20 p-4 ring-1 ring-amber-500/30">
          <h4 className="mb-2 font-medium text-amber-400">Water Change Tips</h4>
          <ul className="space-y-1 text-sm text-amber-200/80">
            <li>• Match new water temperature within 2°F/1°C of tank</li>
            <li>• Dechlorinate new water before adding to tank</li>
            <li>• Vacuum substrate during changes to remove debris</li>
            <li>• Smaller, regular changes are better than large, infrequent ones</li>
            <li>• Test parameters before and after to verify improvement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
