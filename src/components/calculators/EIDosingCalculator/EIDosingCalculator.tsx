/**
 * EI Dosing Calculator Component
 * Estimative Index fertilization for planted aquariums
 */

import { useState, useMemo } from 'preact/hooks';
import { ResultCard, Input, Select, ButtonGroup, Slider } from '../../ui';
import type { EIDosingInputs } from './types';
import { DOSING_SCHEDULES, TANK_PRESETS, FERTILIZERS } from './types';
import { calculateEIDosing, gramsToTeaspoons } from './calculations';

export function EIDosingCalculator() {
  const [inputs, setInputs] = useState<EIDosingInputs>({
    tankVolume: 55,
    volumeUnit: 'gallons',
    dosingSched: 'ei-standard',
    nitrateTarget: 20,
    phosphateTarget: 2,
    potassiumTarget: 20,
    ironTarget: 0.3,
    fertilizerType: 'dry',
    waterChangePercent: 50,
    waterChangeFrequency: 'weekly',
  });

  const results = useMemo(() => calculateEIDosing(inputs), [inputs]);

  const selectedSchedule = DOSING_SCHEDULES.find(s => s.value === inputs.dosingSched);

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
              suffix={inputs.volumeUnit}
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
                  className="rounded-lg bg-[var(--color-background)] px-3 py-1.5 text-sm ring-1 ring-white/5 hover:ring-cyan-500/30"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Dosing Method</h2>

          <div className="space-y-4">
            <Select
              label="Dosing Schedule"
              value={inputs.dosingSched}
              onChange={(v) => setInputs({ ...inputs, dosingSched: v as any })}
              options={DOSING_SCHEDULES.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
            />

            {selectedSchedule && (
              <div className="rounded-lg bg-cyan-900/20 p-3 ring-1 ring-cyan-500/20">
                <p className="text-sm text-cyan-300">{selectedSchedule.description}</p>
                <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <div className="text-cyan-400">{selectedSchedule.no3}</div>
                    <div className="text-cyan-300/70">NO₃</div>
                  </div>
                  <div>
                    <div className="text-cyan-400">{selectedSchedule.po4}</div>
                    <div className="text-cyan-300/70">PO₄</div>
                  </div>
                  <div>
                    <div className="text-cyan-400">{selectedSchedule.k}</div>
                    <div className="text-cyan-300/70">K</div>
                  </div>
                  <div>
                    <div className="text-cyan-400">{selectedSchedule.fe}</div>
                    <div className="text-cyan-300/70">Fe</div>
                  </div>
                </div>
              </div>
            )}

            {inputs.dosingSched === 'custom' && (
              <div className="space-y-3 pt-2">
                <Slider
                  label="Nitrate (NO₃) Target"
                  value={inputs.nitrateTarget}
                  onChange={(v) => setInputs({ ...inputs, nitrateTarget: v })}
                  min={5}
                  max={50}
                  step={5}
                  formatValue={(v) => `${v} ppm`}
                />
                <Slider
                  label="Phosphate (PO₄) Target"
                  value={inputs.phosphateTarget}
                  onChange={(v) => setInputs({ ...inputs, phosphateTarget: v })}
                  min={0.5}
                  max={5}
                  step={0.5}
                  formatValue={(v) => `${v} ppm`}
                />
                <Slider
                  label="Potassium (K) Target"
                  value={inputs.potassiumTarget}
                  onChange={(v) => setInputs({ ...inputs, potassiumTarget: v })}
                  min={5}
                  max={50}
                  step={5}
                  formatValue={(v) => `${v} ppm`}
                />
                <Slider
                  label="Iron (Fe) Target"
                  value={inputs.ironTarget}
                  onChange={(v) => setInputs({ ...inputs, ironTarget: v })}
                  min={0.1}
                  max={1}
                  step={0.1}
                  formatValue={(v) => `${v} ppm`}
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                Fertilizer Type
              </label>
              <ButtonGroup
                options={[
                  { value: 'dry', label: 'Dry Salts' },
                  { value: 'liquid', label: 'Liquid' },
                ]}
                value={inputs.fertilizerType}
                onChange={(v) => setInputs({ ...inputs, fertilizerType: v as any })}
              />
            </div>

            <Slider
              label="Weekly Water Change"
              value={inputs.waterChangePercent}
              onChange={(v) => setInputs({ ...inputs, waterChangePercent: v })}
              min={25}
              max={75}
              step={5}
              formatValue={(v) => `${v}%`}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 p-6 ring-1 ring-cyan-500/30">
          <h2 className="mb-4 text-lg font-semibold text-cyan-300">Per Dose (3x weekly)</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-cyan-200">KNO₃ (Potassium Nitrate)</span>
              <span className="font-mono font-medium text-cyan-400">
                {results.kno3PerDose}g
                <span className="text-xs text-cyan-300/70 ml-2">
                  (~{gramsToTeaspoons(results.kno3PerDose, 'kno3')} tsp)
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-200">KH₂PO₄ (Phosphate)</span>
              <span className="font-mono font-medium text-cyan-400">
                {results.kh2po4PerDose}g
                <span className="text-xs text-cyan-300/70 ml-2">
                  (~{gramsToTeaspoons(results.kh2po4PerDose, 'kh2po4')} tsp)
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-200">K₂SO₄ (Potassium)</span>
              <span className="font-mono font-medium text-cyan-400">
                {results.k2so4PerDose}g
                <span className="text-xs text-cyan-300/70 ml-2">
                  (~{gramsToTeaspoons(results.k2so4PerDose, 'k2so4')} tsp)
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-200">MgSO₄ (Epsom Salt)</span>
              <span className="font-mono font-medium text-cyan-400">
                {results.mgso4PerDose}g
                <span className="text-xs text-cyan-300/70 ml-2">
                  (~{gramsToTeaspoons(results.mgso4PerDose, 'mgso4')} tsp)
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-cyan-500/30 pt-3">
              <span className="text-cyan-200">CSM+B (Traces)</span>
              <span className="font-mono font-medium text-cyan-400">
                {results.csmBPerDose}g
                <span className="text-xs text-cyan-300/70 ml-2">
                  (~{gramsToTeaspoons(results.csmBPerDose, 'csmB')} tsp)
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard
            label="Weekly NO₃"
            value={`${results.nitrateAchieved} ppm`}
            color="blue"
          />
          <ResultCard
            label="Weekly PO₄"
            value={`${results.phosphateAchieved} ppm`}
            color="green"
          />
          <ResultCard
            label="Weekly K"
            value={`${results.potassiumAchieved} ppm`}
            color="purple"
          />
          <ResultCard
            label="Weekly Fe"
            value={`${results.ironAchieved} ppm`}
            color="blue"
          />
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Weekly Totals</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">KNO₃</span>
              <span className="font-medium text-[var(--color-text)]">{results.kno3Weekly}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">KH₂PO₄</span>
              <span className="font-medium text-[var(--color-text)]">{results.kh2po4Weekly}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">K₂SO₄</span>
              <span className="font-medium text-[var(--color-text)]">{results.k2so4Weekly}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">MgSO₄</span>
              <span className="font-medium text-[var(--color-text)]">{results.mgso4Weekly}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">CSM+B</span>
              <span className="font-medium text-[var(--color-text)]">{results.csmBWeekly}g</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">EI Dosing Schedule</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-20 font-medium text-green-400">Day 1</span>
              <span className="text-[var(--color-subtle)]">Macros (KNO₃, KH₂PO₄, K₂SO₄, MgSO₄)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 font-medium text-cyan-400">Day 2</span>
              <span className="text-[var(--color-subtle)]">Micros (CSM+B / Traces)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 font-medium text-green-400">Day 3</span>
              <span className="text-[var(--color-subtle)]">Macros</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 font-medium text-cyan-400">Day 4</span>
              <span className="text-[var(--color-subtle)]">Micros</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 font-medium text-green-400">Day 5</span>
              <span className="text-[var(--color-subtle)]">Macros</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 font-medium text-cyan-400">Day 6</span>
              <span className="text-[var(--color-subtle)]">Micros</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 font-medium text-blue-400">Day 7</span>
              <span className="text-[var(--color-subtle)]">50% Water Change</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-amber-900/20 p-4 ring-1 ring-amber-500/30">
          <h4 className="mb-2 font-medium text-amber-400">EI Method Notes</h4>
          <ul className="space-y-1 text-sm text-amber-200/80">
            <li>• EI deliberately overdoses nutrients so plants never run out</li>
            <li>• Large weekly water change resets nutrient buildup</li>
            <li>• Best for high-light, CO2-injected planted tanks</li>
            <li>• Reduce doses for low-light or non-CO2 setups</li>
            <li>• Watch for algae if light/CO2 doesn&apos;t match fert levels</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
