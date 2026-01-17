/**
 * IBU Calculator Component
 * Calculate hop bitterness for homebrewing
 */

import { useState, useMemo } from 'preact/hooks';
import { ResultCard, Input, Select, ButtonGroup } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import type { IBUInputs, HopAddition } from './types';
import { HOP_VARIETIES } from './types';
import { calculateIBU } from './calculations';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function IBUCalculator() {
  const [inputs, setInputs] = useState<IBUInputs>({
    batchSize: 5,
    batchUnit: 'gallons',
    originalGravity: 1.055,
    hopAdditions: [
      {
        id: generateId(),
        hopName: 'Cascade',
        weight: 1,
        weightUnit: 'oz',
        alphaAcid: 5.5,
        boilTime: 60,
        form: 'pellet',
      },
    ],
    formula: 'tinseth',
  });

  const results = useMemo(() => calculateIBU(inputs), [inputs]);

  const addHopAddition = () => {
    setInputs({
      ...inputs,
      hopAdditions: [
        ...inputs.hopAdditions,
        {
          id: generateId(),
          hopName: 'Cascade',
          weight: 1,
          weightUnit: 'oz',
          alphaAcid: 5.5,
          boilTime: 15,
          form: 'pellet',
        },
      ],
    });
  };

  const removeHopAddition = (id: string) => {
    if (inputs.hopAdditions.length > 1) {
      setInputs({
        ...inputs,
        hopAdditions: inputs.hopAdditions.filter((h) => h.id !== id),
      });
    }
  };

  const updateHopAddition = (id: string, field: keyof HopAddition, value: any) => {
    setInputs({
      ...inputs,
      hopAdditions: inputs.hopAdditions.map((h) =>
        h.id === id ? { ...h, [field]: value } : h
      ),
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Batch Settings</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Batch Size"
              type="number"
              value={inputs.batchSize}
              onChange={(v) => setInputs({ ...inputs, batchSize: parseFloat(v) || 0 })}
              min={1}
              max={100}
              step={0.5}
              suffix={inputs.batchUnit}
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
                value={inputs.batchUnit}
                onChange={(v) => setInputs({ ...inputs, batchUnit: v as 'gallons' | 'liters' })}
              />
            </div>

            <Input
              label="Original Gravity"
              type="number"
              value={inputs.originalGravity}
              onChange={(v) => setInputs({ ...inputs, originalGravity: parseFloat(v) || 1 })}
              min={1.0}
              max={1.2}
              step={0.001}
              suffix="SG"
            />

            <Select
              label="IBU Formula"
              value={inputs.formula}
              onChange={(v) => setInputs({ ...inputs, formula: v as 'tinseth' | 'rager' | 'garetz' })}
              options={[
                { value: 'tinseth', label: 'Tinseth (recommended)' },
                { value: 'rager', label: 'Rager' },
                { value: 'garetz', label: 'Garetz' },
              ]}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Hop Additions</h2>
            <button
              onClick={addHopAddition}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-500"
            >
              + Add Hop
            </button>
          </div>

          <div className="space-y-4">
            {inputs.hopAdditions.map((hop, index) => (
              <div
                key={hop.id}
                className="rounded-lg bg-amber-900/20 p-4 ring-1 ring-amber-500/20"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium text-amber-400">Addition #{index + 1}</span>
                  {inputs.hopAdditions.length > 1 && (
                    <button
                      onClick={() => removeHopAddition(hop.id)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    label="Hop Variety"
                    value={hop.hopName}
                    onChange={(v) => {
                      const variety = HOP_VARIETIES.find((h) => h.name === v);
                      updateHopAddition(hop.id, 'hopName', v);
                      if (variety) {
                        updateHopAddition(
                          hop.id,
                          'alphaAcid',
                          (variety.alphaMin + variety.alphaMax) / 2
                        );
                      }
                    }}
                    options={HOP_VARIETIES.map((h) => ({ value: h.name, label: h.name }))}
                  />

                  <Input
                    label="Alpha Acid %"
                    type="number"
                    value={hop.alphaAcid}
                    onChange={(v) => updateHopAddition(hop.id, 'alphaAcid', parseFloat(v) || 0)}
                    min={1}
                    max={25}
                    step={0.1}
                    suffix="%"
                  />

                  <Input
                    label={`Weight (${hop.weightUnit})`}
                    type="number"
                    value={hop.weight}
                    onChange={(v) => updateHopAddition(hop.id, 'weight', parseFloat(v) || 0)}
                    min={0.1}
                    max={20}
                    step={0.1}
                  />

                  <Input
                    label="Boil Time"
                    type="number"
                    value={hop.boilTime}
                    onChange={(v) => updateHopAddition(hop.id, 'boilTime', parseInt(v) || 0)}
                    min={0}
                    max={120}
                    suffix="min"
                  />

                  <Select
                    label="Form"
                    value={hop.form}
                    onChange={(v) => updateHopAddition(hop.id, 'form', v)}
                    options={[
                      { value: 'pellet', label: 'Pellet (+10% util)' },
                      { value: 'whole', label: 'Whole Leaf' },
                      { value: 'plug', label: 'Plug (+2% util)' },
                    ]}
                  />

                  <ButtonGroup
                    options={[
                      { value: 'oz', label: 'oz' },
                      { value: 'g', label: 'grams' },
                    ]}
                    value={hop.weightUnit}
                    onChange={(v) => updateHopAddition(hop.id, 'weightUnit', v)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-6 ring-1 ring-amber-500/30">
          <h2 className="mb-4 text-lg font-semibold text-amber-300">Total Bitterness</h2>
          <div className="text-center">
            <div className="text-5xl font-bold text-amber-400">{results.totalIBU}</div>
            <div className="mt-1 text-lg text-amber-300">IBU</div>
            <div className="mt-3 text-sm text-amber-200/70">{results.beerStyle}</div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard
            label="BU:GU Ratio"
            value={results.bitteringRatio.toFixed(2)}
            sublabel={
              results.bitteringRatio < 0.5
                ? 'Malty'
                : results.bitteringRatio < 0.8
                  ? 'Balanced'
                  : 'Hoppy'
            }
            color="green"
          />
          <ResultCard
            label="Hop Additions"
            value={inputs.hopAdditions.length.toString()}
            color="blue"
          />
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">IBU Breakdown</h3>
          <div className="space-y-3">
            {results.ibuByAddition.map((addition, index) => {
              const hop = inputs.hopAdditions.find((h) => h.id === addition.id);
              return (
                <div key={addition.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-[var(--color-text)]">
                      {hop?.hopName} @ {hop?.boilTime} min
                    </span>
                    <span className="ml-2 text-xs text-[var(--color-subtle)]">
                      ({addition.utilization}% util)
                    </span>
                  </div>
                  <span className="font-medium text-amber-400">{addition.ibu} IBU</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg bg-green-900/20 p-4 ring-1 ring-green-500/30">
          <h4 className="mb-2 font-medium text-green-400">IBU Guidelines</h4>
          <ul className="space-y-1 text-sm text-green-200/80">
            <li>• Light Lager: 8-12 IBU</li>
            <li>• Pale Ale: 30-50 IBU</li>
            <li>• IPA: 40-70 IBU</li>
            <li>• Double IPA: 60-120 IBU</li>
            <li>• Stout: 25-45 IBU</li>
          </ul>
        </div>

        <div className="flex justify-center pt-4">
          <ShareResults
            result={`Total IBU: ${results.totalIBU} (${results.beerStyle}). BU:GU Ratio: ${results.bitteringRatio.toFixed(2)}. ${inputs.hopAdditions.length} hop addition(s) in ${inputs.batchSize} ${inputs.batchUnit} batch at OG ${inputs.originalGravity}.`}
            calculatorName="IBU Calculator"
          />
        </div>
      </div>
    </div>
  );
}
