/**
 * Candle Wax Calculator Component
 * Calculate wax weight from container volume
 */

import { useState, useMemo } from 'preact/hooks';
import { ResultCard, Input, Select, ButtonGroup, Slider } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import type { CandleWaxInputs } from './types';
import { WAX_TYPES, CONTAINER_PRESETS, FILL_OPTIONS } from './types';
import { calculateCandleWax, formatBurnTime } from './calculations';

export function CandleWaxCalculator() {
  const [inputs, setInputs] = useState<CandleWaxInputs>({
    calculationMode: 'dimensions',
    containerDiameter: 3.0,
    containerHeight: 3.5,
    containerShape: 'cylinder',
    ovalWidth: 2.5,
    fillPercentage: 85,
    directVolume: 9,
    volumeUnit: 'ounces',
    waxType: 'soy-464',
    numberOfContainers: 1,
    weightUnit: 'ounces',
  });

  const results = useMemo(() => calculateCandleWax(inputs), [inputs]);

  const selectedWax = WAX_TYPES.find(w => w.value === inputs.waxType);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Container Size</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                Input Method
              </label>
              <ButtonGroup
                options={[
                  { value: 'dimensions', label: 'Dimensions' },
                  { value: 'volume', label: 'Direct Volume' },
                ]}
                value={inputs.calculationMode}
                onChange={(v) => setInputs({ ...inputs, calculationMode: v as any })}
              />
            </div>

            {inputs.calculationMode === 'dimensions' ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {CONTAINER_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() =>
                        setInputs({
                          ...inputs,
                          containerDiameter: preset.diameter,
                          containerHeight: preset.height,
                          containerShape: preset.shape,
                        })
                      }
                      className="rounded-lg bg-[var(--color-background)] px-3 py-1.5 text-xs ring-1 ring-white/5 hover:ring-purple-500/30"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                    Container Shape
                  </label>
                  <ButtonGroup
                    options={[
                      { value: 'cylinder', label: 'Round' },
                      { value: 'square', label: 'Square' },
                      { value: 'oval', label: 'Oval' },
                    ]}
                    value={inputs.containerShape}
                    onChange={(v) => setInputs({ ...inputs, containerShape: v as any })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={inputs.containerShape === 'square' ? 'Side Length' : 'Diameter'}
                    type="number"
                    value={inputs.containerDiameter}
                    onChange={(v) => setInputs({ ...inputs, containerDiameter: parseFloat(v) || 0 })}
                    min={0.5}
                    step={0.1}
                    suffix="in"
                  />
                  <Input
                    label="Height"
                    type="number"
                    value={inputs.containerHeight}
                    onChange={(v) => setInputs({ ...inputs, containerHeight: parseFloat(v) || 0 })}
                    min={0.5}
                    step={0.1}
                    suffix="in"
                  />
                </div>

                {inputs.containerShape === 'oval' && (
                  <Input
                    label="Width (shorter axis)"
                    type="number"
                    value={inputs.ovalWidth}
                    onChange={(v) => setInputs({ ...inputs, ovalWidth: parseFloat(v) || 0 })}
                    min={0.5}
                    step={0.1}
                    suffix="in"
                  />
                )}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Container Volume"
                  type="number"
                  value={inputs.directVolume}
                  onChange={(v) => setInputs({ ...inputs, directVolume: parseFloat(v) || 0 })}
                  min={1}
                  suffix={inputs.volumeUnit === 'ounces' ? 'oz' : 'mL'}
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                    Volume Unit
                  </label>
                  <ButtonGroup
                    options={[
                      { value: 'ounces', label: 'fl oz' },
                      { value: 'ml', label: 'mL' },
                    ]}
                    value={inputs.volumeUnit}
                    onChange={(v) => setInputs({ ...inputs, volumeUnit: v as any })}
                  />
                </div>
              </div>
            )}

            <Select
              label="Fill Percentage"
              value={inputs.fillPercentage.toString()}
              onChange={(v) => setInputs({ ...inputs, fillPercentage: parseInt(v) })}
              options={FILL_OPTIONS.map(f => ({ value: f.value.toString(), label: f.label }))}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Wax Settings</h2>

          <div className="space-y-4">
            <Select
              label="Wax Type"
              value={inputs.waxType}
              onChange={(v) => setInputs({ ...inputs, waxType: v })}
              options={WAX_TYPES.map(w => ({ value: w.value, label: w.label }))}
            />

            {selectedWax && (
              <div className="rounded-lg bg-purple-900/20 p-3 ring-1 ring-purple-500/20">
                <p className="text-sm text-purple-300">{selectedWax.description}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-center text-xs">
                  <div>
                    <div className="text-purple-400">{(selectedWax.density * 100).toFixed(0)}%</div>
                    <div className="text-purple-300/70">Density</div>
                  </div>
                  <div>
                    <div className="text-purple-400">{selectedWax.burnRate} oz/hr</div>
                    <div className="text-purple-300/70">Burn Rate</div>
                  </div>
                </div>
              </div>
            )}

            <Input
              label="Number of Containers"
              type="number"
              value={inputs.numberOfContainers}
              onChange={(v) => setInputs({ ...inputs, numberOfContainers: parseInt(v) || 1 })}
              min={1}
              max={1000}
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
                onChange={(v) => setInputs({ ...inputs, weightUnit: v as any })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-6 ring-1 ring-purple-500/30">
          <h2 className="mb-4 text-lg font-semibold text-purple-300">Wax Needed</h2>
          <div className="text-center">
            <div className="text-5xl font-bold text-purple-400">
              {results.waxWeight}
              <span className="ml-2 text-2xl">{results.weightUnit}</span>
            </div>
            <div className="mt-2 text-purple-300">
              for {inputs.numberOfContainers} container{inputs.numberOfContainers > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard
            label="Container Volume"
            value={`${results.containerVolume} ${inputs.volumeUnit === 'ounces' ? 'fl oz' : 'mL'}`}
            color="blue"
          />
          <ResultCard
            label="Usable Volume"
            value={`${results.usableVolume} ${inputs.volumeUnit === 'ounces' ? 'fl oz' : 'mL'}`}
            sublabel={`at ${inputs.fillPercentage}% fill`}
            color="green"
          />
          <ResultCard
            label="Est. Burn Time"
            value={formatBurnTime(results.burnTime)}
            sublabel="per candle"
            color="purple"
          />
          <ResultCard
            label="Per Container"
            value={`${results.waxWeightPerContainer} ${results.weightUnit}`}
            color="blue"
          />
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Production Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">Wax (with wick displacement)</span>
              <span className="font-medium text-[var(--color-text)]">
                {results.wickedWeight} {results.weightUnit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">With 10% overpour buffer</span>
              <span className="font-medium text-purple-400">
                {results.waxNeededWithOverpour} {results.weightUnit}
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="text-[var(--color-subtle)]">Suggested Wick</span>
              <span className="font-medium text-[var(--color-text)]">
                {results.suggestedWickSize}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Wax Weight Formula</h3>
          <div className="space-y-2 text-sm text-[var(--color-subtle)]">
            <p>For container candles:</p>
            <div className="rounded-lg bg-[var(--color-background)] p-3 font-mono text-xs">
              Wax (oz) = Volume (fl oz) × Fill% × Wax Density
            </div>
            <p className="mt-2">
              Density varies by wax type. Soy wax is typically 0.86 (86% the weight of water),
              while paraffin and beeswax are denser at 0.90-0.96.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-amber-900/20 p-4 ring-1 ring-amber-500/30">
          <h4 className="mb-2 font-medium text-amber-400">Candle Making Tips</h4>
          <ul className="space-y-1 text-sm text-amber-200/80">
            <li>• Always test wicks - this calculator provides a starting point</li>
            <li>• Leave room at top for second pour (sink holes)</li>
            <li>• Add 10% extra wax for pour pot residue and testing</li>
            <li>• Weigh wax, don&apos;t measure by volume for consistency</li>
            <li>• Let candles cure 1-2 weeks for best scent throw</li>
          </ul>
        </div>

        <div className="rounded-lg bg-red-900/20 p-4 ring-1 ring-red-500/30">
          <h4 className="mb-2 font-medium text-red-400">Safety Note</h4>
          <p className="text-sm text-red-200/80">
            Always test burn every candle design. Incorrect wick sizing can cause tunneling,
            sooting, or dangerous flame heights. Never leave burning candles unattended.
          </p>
        </div>

        <div className="flex justify-center pt-4">
          <ShareResults
            result={`Wax needed: ${results.waxWeight} ${results.weightUnit} for ${inputs.numberOfContainers} container(s). Per container: ${results.waxWeightPerContainer} ${results.weightUnit}. Est. burn time: ${formatBurnTime(results.burnTime)} per candle.`}
            calculatorName="Candle Wax Calculator"
          />
        </div>
      </div>
    </div>
  );
}
