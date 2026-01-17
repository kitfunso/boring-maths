/**
 * Tap Drill Size Calculator Component
 * Calculate drill sizes for tapping threads
 */

import { useState, useMemo } from 'preact/hooks';
import { ResultCard, Select, Slider, ButtonGroup } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import type { TapDrillInputs } from './types';
import { IMPERIAL_THREADS, METRIC_THREADS } from './types';
import { calculateTapDrill } from './calculations';

export function TapDrillCalculator() {
  const [inputs, setInputs] = useState<TapDrillInputs>({
    threadType: 'imperial',
    threadSize: '1/4-20',
    threadPercentage: 75,
  });

  const results = useMemo(() => calculateTapDrill(inputs), [inputs]);

  const threadOptions =
    inputs.threadType === 'imperial'
      ? IMPERIAL_THREADS.map((t) => ({ value: t.value, label: t.label }))
      : METRIC_THREADS.map((t) => ({ value: t.value, label: t.label }));

  // Reset to appropriate default when switching thread types
  const handleTypeChange = (type: 'imperial' | 'metric') => {
    setInputs({
      ...inputs,
      threadType: type,
      threadSize: type === 'imperial' ? '1/4-20' : 'M6',
    });
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Thread Selection</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                Thread System
              </label>
              <ButtonGroup
                options={[
                  { value: 'imperial', label: 'Imperial (UNC/UNF)' },
                  { value: 'metric', label: 'Metric (ISO)' },
                ]}
                value={inputs.threadType}
                onChange={(v) => handleTypeChange(v as 'imperial' | 'metric')}
              />
            </div>

            <Select
              label="Thread Size"
              value={inputs.threadSize}
              onChange={(v) => setInputs({ ...inputs, threadSize: v })}
              options={threadOptions}
            />

            <Slider
              label="Thread Engagement %"
              value={inputs.threadPercentage}
              onChange={(v) => setInputs({ ...inputs, threadPercentage: v })}
              min={50}
              max={100}
              step={5}
              formatValue={(v) => `${v}%`}
            />

            <div className="rounded-lg bg-slate-800/50 p-4">
              <h4 className="mb-2 text-sm font-medium text-slate-300">Thread % Guidelines</h4>
              <ul className="space-y-1 text-xs text-slate-400">
                <li>
                  <span className="text-green-400">75%</span> - Standard for most applications
                </li>
                <li>
                  <span className="text-blue-400">65-70%</span> - Easier tapping, less torque
                </li>
                <li>
                  <span className="text-amber-400">80-85%</span> - High strength requirements
                </li>
                <li>
                  <span className="text-red-400">50-60%</span> - Soft materials, hand tapping
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {results && (
          <>
            <div className="rounded-2xl bg-gradient-to-br from-slate-500/20 to-slate-600/10 p-6 ring-1 ring-slate-500/30">
              <h2 className="mb-4 text-lg font-semibold text-slate-300">Recommended Tap Drill</h2>
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-300">{results.closestDrill}</div>
                <div className="mt-2 text-lg text-slate-400">
                  {inputs.threadType === 'imperial'
                    ? `${(results.closestDrillSize * 25.4).toFixed(2)}mm`
                    : `${(results.closestDrillSize / 25.4).toFixed(4)}"`}
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  For {results.threadPercentage}% thread engagement
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ResultCard
                label="Calculated Drill Size"
                value={results.tapDrillSizeFormatted}
                color="blue"
              />
              <ResultCard
                label="Closest Standard Drill"
                value={results.closestDrill}
                color="green"
              />
            </div>

            <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
              <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
                Thread Dimensions
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--color-subtle)]">Major Diameter</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {inputs.threadType === 'imperial'
                      ? `${results.majorDiameter.toFixed(4)}" (${(results.majorDiameter * 25.4).toFixed(2)}mm)`
                      : `${results.majorDiameter.toFixed(2)}mm`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-subtle)]">Pitch Diameter</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {inputs.threadType === 'imperial'
                      ? `${results.pitchDiameter.toFixed(4)}" (${(results.pitchDiameter * 25.4).toFixed(2)}mm)`
                      : `${results.pitchDiameter.toFixed(2)}mm`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-subtle)]">Minor Diameter (100%)</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {inputs.threadType === 'imperial'
                      ? `${results.minorDiameter.toFixed(4)}" (${(results.minorDiameter * 25.4).toFixed(2)}mm)`
                      : `${results.minorDiameter.toFixed(2)}mm`}
                  </span>
                </div>
                {results.tpi && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-subtle)]">Threads Per Inch</span>
                    <span className="font-medium text-[var(--color-text)]">{results.tpi} TPI</span>
                  </div>
                )}
                {results.pitch && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-subtle)]">Thread Pitch</span>
                    <span className="font-medium text-[var(--color-text)]">{results.pitch}mm</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-amber-900/20 p-4 ring-1 ring-amber-500/30">
              <h4 className="mb-2 font-medium text-amber-400">Tapping Tips</h4>
              <ul className="space-y-1 text-sm text-amber-200/80">
                <li>• Use cutting oil or tapping fluid for best results</li>
                <li>• Back out frequently to clear chips (1/2 turn forward, 1/4 turn back)</li>
                <li>• Start tap perpendicular to surface</li>
                <li>• Use a bottoming tap for blind holes after starting tap</li>
              </ul>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Tap drill for ${inputs.threadSize}: ${results.closestDrill} (${results.tapDrillSizeFormatted}) at ${results.threadPercentage}% thread engagement. Major dia: ${results.majorDiameter.toFixed(4)}${inputs.threadType === 'imperial' ? '"' : 'mm'}.`}
                calculatorName="Tap Drill Calculator"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
