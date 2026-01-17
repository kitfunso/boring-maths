/**
 * CO2 Injection Calculator Component
 * Calculate CO2 levels from pH and KH readings
 */

import { useState, useMemo } from 'preact/hooks';
import { ResultCard, Input, ButtonGroup } from '../../ui';
import type { CO2Inputs } from './types';
import { calculateCO2, calculateTargetPH } from './calculations';

export function CO2Calculator() {
  const [inputs, setInputs] = useState<CO2Inputs>({
    ph: 6.8,
    kh: 4,
    tankVolume: 20,
    volumeUnit: 'gallons',
  });

  const results = useMemo(() => calculateCO2(inputs), [inputs]);

  const targetPH = useMemo(() => calculateTargetPH(inputs.kh, 30), [inputs.kh]);

  const levelColors = {
    low: 'text-blue-400',
    optimal: 'text-green-400',
    high: 'text-yellow-400',
    dangerous: 'text-red-400',
  };

  const levelBgColors = {
    low: 'from-blue-500/20 to-blue-600/10 ring-blue-500/30',
    optimal: 'from-green-500/20 to-green-600/10 ring-green-500/30',
    high: 'from-yellow-500/20 to-yellow-600/10 ring-yellow-500/30',
    dangerous: 'from-red-500/20 to-red-600/10 ring-red-500/30',
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Water Parameters</h2>

          <div className="space-y-4">
            <Input
              label="pH Level"
              type="number"
              value={inputs.ph}
              onChange={(v) => setInputs({ ...inputs, ph: parseFloat(v) || 0 })}
              step={0.1}
              min={5.5}
              max={8.5}
              suffix="pH"
            />

            <Input
              label="Carbonate Hardness (KH)"
              type="number"
              value={inputs.kh}
              onChange={(v) => setInputs({ ...inputs, kh: parseFloat(v) || 0 })}
              step={0.5}
              min={0.5}
              max={20}
              suffix="dKH"
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
                onChange={(v) => setInputs({ ...inputs, volumeUnit: v as 'gallons' | 'liters' })}
              />
            </div>

            <Input
              label="Tank Volume"
              type="number"
              value={inputs.tankVolume}
              onChange={(v) => setInputs({ ...inputs, tankVolume: parseFloat(v) || 0 })}
              min={1}
              max={1000}
              suffix={inputs.volumeUnit}
            />
          </div>
        </div>

        <div className="rounded-lg bg-cyan-900/20 p-4 ring-1 ring-cyan-500/30">
          <h4 className="mb-2 font-medium text-cyan-400">pH/KH/CO2 Relationship</h4>
          <p className="text-sm text-cyan-200/80">
            CO2 dissolves in water to form carbonic acid, lowering pH. With your KH of{' '}
            <strong>{inputs.kh} dKH</strong>, target pH of <strong>{targetPH}</strong> will give you
            approximately 30 ppm CO2.
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div
          className={`rounded-2xl bg-gradient-to-br ${levelBgColors[results.co2Level]} p-6 ring-1`}
        >
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">CO2 Level</h2>
          <div className="text-center">
            <div className={`text-5xl font-bold ${levelColors[results.co2Level]}`}>
              {results.co2ppm} ppm
            </div>
            <div className={`mt-2 text-lg ${levelColors[results.co2Level]}`}>
              {results.co2Level === 'low' && 'Low - Plants need more'}
              {results.co2Level === 'optimal' && 'Optimal for plant growth'}
              {results.co2Level === 'high' && 'High - Watch your fish'}
              {results.co2Level === 'dangerous' && 'DANGEROUS - Reduce now!'}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard
            label="Drop Checker Color"
            value={results.dropCheckerColor}
            color={results.co2Level === 'optimal' ? 'green' : 'blue'}
          />
          <ResultCard
            label="Suggested Bubble Rate"
            value={`${results.suggestedBubbleRate} BPS`}
            sublabel="bubbles per second"
            color="purple"
          />
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-3 text-lg font-semibold text-[var(--color-text)]">Recommendation</h3>
          <p className="text-[var(--color-subtle)]">{results.adjustmentNeeded}</p>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">CO2 Reference</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-400">0-15 ppm</span>
              <span className="text-sm text-[var(--color-subtle)]">Low (blue drop checker)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-400">15-35 ppm</span>
              <span className="text-sm text-[var(--color-subtle)]">
                Optimal (green drop checker)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-yellow-400">35-50 ppm</span>
              <span className="text-sm text-[var(--color-subtle)]">High (yellow-green)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-400">50+ ppm</span>
              <span className="text-sm text-[var(--color-subtle)]">Dangerous (yellow)</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-amber-900/20 p-4 ring-1 ring-amber-500/30">
          <h4 className="mb-2 font-medium text-amber-400">Important Notes</h4>
          <ul className="space-y-1 text-sm text-amber-200/80">
            <li>• Always measure pH and KH from the same water sample</li>
            <li>• This formula assumes no other acids are present in the water</li>
            <li>• Use a drop checker as a secondary CO2 indicator</li>
            <li>• Never inject CO2 at night when plants don&apos;t photosynthesize</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
