/**
 * Mash Water Calculator Component
 * Strike water and sparge calculations for all-grain brewing
 */

import { useState, useMemo } from 'preact/hooks';
import { ResultCard, Input, Select, ButtonGroup, Slider } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import type { MashWaterInputs } from './types';
import { MASH_TEMPS, MASH_THICKNESS, SPARGE_TYPES } from './types';
import { calculateMashWater } from './calculations';

export function MashWaterCalculator() {
  const [inputs, setInputs] = useState<MashWaterInputs>({
    grainWeight: 10,
    weightUnit: 'pounds',
    grainTemp: 68,
    targetMashTemp: 152,
    tempUnit: 'fahrenheit',
    mashThickness: 1.25,
    equipmentLoss: 0.25,
    grainAbsorption: 0.125,
    boilTime: 60,
    evaporationRate: 1.0,
    preboilVolume: 6.5,
    volumeUnit: 'gallons',
    spargeType: 'batch',
    batchSpargeCount: 2,
  });

  const results = useMemo(() => calculateMashWater(inputs), [inputs]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Grain Bill</h2>

          <div className="space-y-4">
            <Input
              label="Total Grain Weight"
              type="number"
              value={inputs.grainWeight}
              onChange={(v) => setInputs({ ...inputs, grainWeight: parseFloat(v) || 0 })}
              min={0.5}
              step={0.5}
              suffix={inputs.weightUnit === 'pounds' ? 'lbs' : 'kg'}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                  Weight Unit
                </label>
                <ButtonGroup
                  options={[
                    { value: 'pounds', label: 'Pounds' },
                    { value: 'kg', label: 'kg' },
                  ]}
                  value={inputs.weightUnit}
                  onChange={(v) => setInputs({ ...inputs, weightUnit: v as any })}
                />
              </div>
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

            <Input
              label="Grain Temperature"
              type="number"
              value={inputs.grainTemp}
              onChange={(v) => setInputs({ ...inputs, grainTemp: parseFloat(v) || 0 })}
              suffix={inputs.tempUnit === 'fahrenheit' ? '°F' : '°C'}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Mash Settings</h2>

          <div className="space-y-4">
            <Input
              label="Target Mash Temperature"
              type="number"
              value={inputs.targetMashTemp}
              onChange={(v) => setInputs({ ...inputs, targetMashTemp: parseFloat(v) || 0 })}
              suffix={inputs.tempUnit === 'fahrenheit' ? '°F' : '°C'}
            />

            <div className="flex flex-wrap gap-2">
              {MASH_TEMPS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() =>
                    setInputs({
                      ...inputs,
                      targetMashTemp: inputs.tempUnit === 'fahrenheit' ? preset.temp : preset.tempC,
                    })
                  }
                  className="rounded-lg bg-[var(--color-background)] px-3 py-1.5 text-xs ring-1 ring-white/5 hover:ring-amber-500/30"
                >
                  {preset.label} (
                  {inputs.tempUnit === 'fahrenheit' ? `${preset.temp}°F` : `${preset.tempC}°C`})
                </button>
              ))}
            </div>

            <Slider
              label="Mash Thickness"
              value={inputs.mashThickness}
              onChange={(v) => setInputs({ ...inputs, mashThickness: v })}
              min={0.75}
              max={2.5}
              step={0.125}
              formatValue={(v) =>
                inputs.volumeUnit === 'gallons' ? `${v} qt/lb` : `${(v * 2.086).toFixed(1)} L/kg`
              }
            />

            <div className="flex flex-wrap gap-2">
              {MASH_THICKNESS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() =>
                    setInputs({
                      ...inputs,
                      mashThickness: preset.qtPerLb,
                    })
                  }
                  className="rounded-lg bg-[var(--color-background)] px-3 py-1.5 text-xs ring-1 ring-white/5 hover:ring-amber-500/30"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <Slider
              label="Grain Absorption"
              value={inputs.grainAbsorption}
              onChange={(v) => setInputs({ ...inputs, grainAbsorption: v })}
              min={0.05}
              max={0.2}
              step={0.01}
              formatValue={(v) => `${v} qt/lb`}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Sparge & Boil</h2>

          <div className="space-y-4">
            <Select
              label="Sparge Type"
              value={inputs.spargeType}
              onChange={(v) => setInputs({ ...inputs, spargeType: v as any })}
              options={SPARGE_TYPES}
            />

            {inputs.spargeType === 'batch' && (
              <Input
                label="Number of Batch Sparges"
                type="number"
                value={inputs.batchSpargeCount}
                onChange={(v) => setInputs({ ...inputs, batchSpargeCount: parseInt(v) || 1 })}
                min={1}
                max={4}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Pre-Boil Volume"
                type="number"
                value={inputs.preboilVolume}
                onChange={(v) => setInputs({ ...inputs, preboilVolume: parseFloat(v) || 0 })}
                min={1}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Boil Time"
                type="number"
                value={inputs.boilTime}
                onChange={(v) => setInputs({ ...inputs, boilTime: parseInt(v) || 0 })}
                min={30}
                max={120}
                step={15}
                suffix="min"
              />
              <Input
                label="Evaporation Rate"
                type="number"
                value={inputs.evaporationRate}
                onChange={(v) => setInputs({ ...inputs, evaporationRate: parseFloat(v) || 0 })}
                min={0.5}
                max={2}
                step={0.1}
                suffix={`${inputs.volumeUnit === 'gallons' ? 'gal' : 'L'}/hr`}
              />
            </div>

            <Input
              label="Equipment Dead Space"
              type="number"
              value={inputs.equipmentLoss}
              onChange={(v) => setInputs({ ...inputs, equipmentLoss: parseFloat(v) || 0 })}
              min={0}
              max={2}
              step={0.1}
              suffix={inputs.volumeUnit === 'gallons' ? 'gal' : 'L'}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-6 ring-1 ring-amber-500/30">
          <h2 className="mb-4 text-lg font-semibold text-amber-300">Strike Water</h2>
          <div className="text-center">
            <div className="text-5xl font-bold text-amber-400">
              {results.strikeWaterTemp}
              {results.tempUnit}
            </div>
            <div className="mt-2 text-amber-300">heat water to this temperature</div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard
            label="Strike Water Volume"
            value={`${results.strikeWaterVolume} ${results.volumeUnit}`}
            color="blue"
          />
          <ResultCard
            label="Total Water Needed"
            value={`${results.totalWaterNeeded} ${results.volumeUnit}`}
            color="green"
          />
          <ResultCard
            label="First Runnings"
            value={`${results.firstRunningsVolume} ${results.volumeUnit}`}
            color="purple"
          />
          <ResultCard
            label="Post-Boil Volume"
            value={`${results.postBoilVolume} ${results.volumeUnit}`}
            color="blue"
          />
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Mash Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">Total Mash Volume</span>
              <span className="font-medium text-[var(--color-text)]">
                {results.totalMashVolume} {results.volumeUnit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">Water Absorbed by Grain</span>
              <span className="font-medium text-[var(--color-text)]">
                {results.waterAbsorbedByGrain} {results.volumeUnit}
              </span>
            </div>
          </div>
        </div>

        {inputs.spargeType !== 'no-sparge' && (
          <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Sparge Water</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--color-subtle)]">Total Sparge Water</span>
                <span className="font-medium text-[var(--color-text)]">
                  {results.spargeWaterVolume} {results.volumeUnit}
                </span>
              </div>
              {inputs.spargeType === 'batch' && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-subtle)]">Per Batch Sparge</span>
                  <span className="font-medium text-amber-400">
                    {results.spargeWaterPerBatch} {results.volumeUnit}
                  </span>
                </div>
              )}
              <div className="mt-4 rounded-lg bg-amber-900/20 p-3 ring-1 ring-amber-500/20">
                <p className="text-sm text-amber-200/80">
                  Heat sparge water to 168-170°F (75-77°C) to help with lautering and prevent tannin
                  extraction.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Brew Day Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-6 text-center font-bold text-amber-400">1</span>
              <span className="text-[var(--color-subtle)]">
                Heat {results.strikeWaterVolume} {results.volumeUnit} to {results.strikeWaterTemp}
                {results.tempUnit}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 text-center font-bold text-amber-400">2</span>
              <span className="text-[var(--color-subtle)]">
                Add grain, target mash temp: {inputs.targetMashTemp}
                {results.tempUnit}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 text-center font-bold text-amber-400">3</span>
              <span className="text-[var(--color-subtle)]">Mash for 60 minutes</span>
            </div>
            {inputs.spargeType !== 'no-sparge' && (
              <div className="flex items-center gap-2">
                <span className="w-6 text-center font-bold text-amber-400">4</span>
                <span className="text-[var(--color-subtle)]">
                  {inputs.spargeType === 'batch'
                    ? `Batch sparge ${inputs.batchSpargeCount}x with ${results.spargeWaterPerBatch} ${results.volumeUnit} each`
                    : `Fly sparge with ${results.spargeWaterVolume} ${results.volumeUnit}`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="w-6 text-center font-bold text-amber-400">5</span>
              <span className="text-[var(--color-subtle)]">
                Collect {inputs.preboilVolume} {results.volumeUnit} pre-boil
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-amber-900/20 p-4 ring-1 ring-amber-500/30">
          <h4 className="mb-2 font-medium text-amber-400">Mash Tips</h4>
          <ul className="space-y-1 text-sm text-amber-200/80">
            <li>• Preheat your mash tun to reduce heat loss</li>
            <li>• Stir well when adding grain to avoid dough balls</li>
            <li>• Lower mash temps = more fermentable, drier beer</li>
            <li>• Higher mash temps = more body, sweeter beer</li>
            <li>• Check actual mash temp after mixing and adjust</li>
          </ul>
        </div>

        <div className="flex justify-center pt-4">
          <ShareResults
            result={`Strike water: ${results.strikeWaterVolume} ${results.volumeUnit} at ${results.strikeWaterTemp}${results.tempUnit}. Total water: ${results.totalWaterNeeded} ${results.volumeUnit}. Target mash: ${inputs.targetMashTemp}${results.tempUnit} for ${inputs.grainWeight} ${inputs.weightUnit === 'pounds' ? 'lbs' : 'kg'} grain.`}
            calculatorName="Mash Water Calculator"
          />
        </div>
      </div>
    </div>
  );
}
