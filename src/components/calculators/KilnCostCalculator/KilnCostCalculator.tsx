/**
 * Kiln Cost Calculator Component
 * Calculate electricity and gas costs for pottery kiln firings
 */

import { useState, useMemo } from 'preact/hooks';
import { ResultCard, Input, Select, ButtonGroup, Slider } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import type { KilnCostInputs } from './types';
import { KILN_PRESETS, FIRING_TYPES, CONE_TEMPS } from './types';
import { calculateKilnCost, formatTime, getConeOptions } from './calculations';

export function KilnCostCalculator() {
  const [inputs, setInputs] = useState<KilnCostInputs>({
    kilnType: 'electric',
    kilnSize: 7,
    kilnWattage: 11.5,
    targetCone: '6',
    firingType: 'glaze',
    firingTime: 8,
    electricityRate: 0.12,
    gasRate: 1.5,
    gasUnit: 'therm',
    firingSchedule: 'medium',
    loadDensity: 'medium',
  });

  const results = useMemo(() => calculateKilnCost(inputs), [inputs]);

  const coneOptions = useMemo(() => getConeOptions(), []);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Kiln Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                Kiln Type
              </label>
              <ButtonGroup
                options={[
                  { value: 'electric', label: 'Electric' },
                  { value: 'gas', label: 'Gas' },
                ]}
                value={inputs.kilnType}
                onChange={(v) => setInputs({ ...inputs, kilnType: v as any })}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {KILN_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() =>
                    setInputs({
                      ...inputs,
                      kilnSize: preset.cubicFeet,
                      kilnWattage: preset.kw,
                    })
                  }
                  className="rounded-lg bg-[var(--color-background)] px-3 py-1.5 text-xs ring-1 ring-white/5 hover:ring-orange-500/30"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Kiln Size"
                type="number"
                value={inputs.kilnSize}
                onChange={(v) => setInputs({ ...inputs, kilnSize: parseFloat(v) || 0 })}
                min={0.5}
                step={0.5}
                suffix="cu ft"
              />
              {inputs.kilnType === 'electric' && (
                <Input
                  label="Kiln Wattage"
                  type="number"
                  value={inputs.kilnWattage}
                  onChange={(v) => setInputs({ ...inputs, kilnWattage: parseFloat(v) || 0 })}
                  min={1}
                  step={0.5}
                  suffix="kW"
                />
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Firing Program</h2>

          <div className="space-y-4">
            <Select
              label="Firing Type"
              value={inputs.firingType}
              onChange={(v) => {
                const firingType = FIRING_TYPES.find((f) => f.value === v);
                setInputs({
                  ...inputs,
                  firingType: v as any,
                  targetCone: firingType?.defaultCone || inputs.targetCone,
                });
              }}
              options={FIRING_TYPES.map((f) => ({ value: f.value, label: f.label }))}
            />

            <Select
              label="Target Cone"
              value={inputs.targetCone}
              onChange={(v) => setInputs({ ...inputs, targetCone: v })}
              options={coneOptions}
            />

            {inputs.firingType === 'custom' && (
              <Input
                label="Firing Time"
                type="number"
                value={inputs.firingTime}
                onChange={(v) => setInputs({ ...inputs, firingTime: parseFloat(v) || 0 })}
                min={1}
                max={24}
                step={0.5}
                suffix="hours"
              />
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                Firing Schedule
              </label>
              <ButtonGroup
                options={[
                  { value: 'slow', label: 'Slow' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'fast', label: 'Fast' },
                ]}
                value={inputs.firingSchedule}
                onChange={(v) => setInputs({ ...inputs, firingSchedule: v as any })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                Load Density
              </label>
              <ButtonGroup
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'heavy', label: 'Heavy' },
                ]}
                value={inputs.loadDensity}
                onChange={(v) => setInputs({ ...inputs, loadDensity: v as any })}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Energy Rates</h2>

          <div className="space-y-4">
            {inputs.kilnType === 'electric' ? (
              <Slider
                label="Electricity Rate"
                value={inputs.electricityRate}
                onChange={(v) => setInputs({ ...inputs, electricityRate: v })}
                min={0.05}
                max={0.4}
                step={0.01}
                formatValue={(v) => `$${v.toFixed(2)}/kWh`}
              />
            ) : (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                    Gas Unit
                  </label>
                  <ButtonGroup
                    options={[
                      { value: 'therm', label: 'Therms (NG)' },
                      { value: 'gallon', label: 'Gallons (Propane)' },
                    ]}
                    value={inputs.gasUnit}
                    onChange={(v) => setInputs({ ...inputs, gasUnit: v as any })}
                  />
                </div>
                <Input
                  label={inputs.gasUnit === 'therm' ? 'Natural Gas Rate' : 'Propane Rate'}
                  type="number"
                  value={inputs.gasRate}
                  onChange={(v) => setInputs({ ...inputs, gasRate: parseFloat(v) || 0 })}
                  min={0.1}
                  step={0.1}
                  suffix={inputs.gasUnit === 'therm' ? '$/therm' : '$/gal'}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 p-6 ring-1 ring-orange-500/30">
          <h2 className="mb-4 text-lg font-semibold text-orange-300">Firing Cost</h2>
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-400">
              ${results.totalCost.toFixed(2)}
            </div>
            <div className="mt-2 text-orange-300">estimated cost for this firing</div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard label="Firing Time" value={formatTime(results.estimatedTime)} color="blue" />
          <ResultCard
            label="Peak Temperature"
            value={`${results.peakTemperature}°F`}
            sublabel={`${results.peakTempC}°C`}
            color="purple"
          />
          <ResultCard
            label="Energy Used"
            value={`${results.energyUsed} ${inputs.kilnType === 'electric' ? 'kWh' : inputs.gasUnit === 'therm' ? 'therms' : 'gal'}`}
            color="green"
          />
          <ResultCard
            label="Cost Per Cu Ft"
            value={`$${results.costPerCubicFoot.toFixed(2)}`}
            color="blue"
          />
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Firing Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">Target Cone</span>
              <span className="font-medium text-[var(--color-text)]">Cone {inputs.targetCone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">Firing Type</span>
              <span className="font-medium text-[var(--color-text)]">
                {FIRING_TYPES.find((f) => f.value === inputs.firingType)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">Schedule</span>
              <span className="font-medium text-[var(--color-text)]">
                {inputs.firingSchedule.charAt(0).toUpperCase() + inputs.firingSchedule.slice(1)}
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="text-[var(--color-subtle)]">CO₂ Emissions</span>
              <span className="font-medium text-orange-400">~{results.co2Emissions} lbs</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
            Quick Cone Reference
          </h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg bg-red-900/20 p-2 text-center">
              <div className="font-medium text-red-400">Low Fire</div>
              <div className="text-xs text-[var(--color-subtle)]">06-04</div>
              <div className="text-xs text-[var(--color-subtle)]">1823-1940°F</div>
            </div>
            <div className="rounded-lg bg-orange-900/20 p-2 text-center">
              <div className="font-medium text-orange-400">Mid Fire</div>
              <div className="text-xs text-[var(--color-subtle)]">5-6</div>
              <div className="text-xs text-[var(--color-subtle)]">2163-2228°F</div>
            </div>
            <div className="rounded-lg bg-yellow-900/20 p-2 text-center">
              <div className="font-medium text-yellow-400">High Fire</div>
              <div className="text-xs text-[var(--color-subtle)]">9-10</div>
              <div className="text-xs text-[var(--color-subtle)]">2300-2345°F</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-orange-900/20 p-4 ring-1 ring-orange-500/30">
          <h4 className="mb-2 font-medium text-orange-400">Tip of the Day</h4>
          <p className="text-sm text-orange-200/80">{results.tipOfTheDay}</p>
        </div>

        <div className="rounded-lg bg-amber-900/20 p-4 ring-1 ring-amber-500/30">
          <h4 className="mb-2 font-medium text-amber-400">Cost Saving Tips</h4>
          <ul className="space-y-1 text-sm text-amber-200/80">
            <li>• Fire full loads to maximize efficiency</li>
            <li>• Consider off-peak electricity rates (nights/weekends)</li>
            <li>• Maintain elements regularly for consistent heating</li>
            <li>• Use a kiln shelf system that allows good air flow</li>
            <li>• Track your firings to identify cost patterns</li>
          </ul>
        </div>

        <div className="flex justify-center pt-4">
          <ShareResults
            result={`Kiln firing cost: $${results.totalCost.toFixed(2)}. Cone ${inputs.targetCone} (${results.peakTemperature}F/${results.peakTempC}C). ${formatTime(results.estimatedTime)} firing time. Energy: ${results.energyUsed} ${inputs.kilnType === 'electric' ? 'kWh' : inputs.gasUnit}.`}
            calculatorName="Kiln Cost Calculator"
          />
        </div>
      </div>
    </div>
  );
}
