/**
 * Cutting Time Estimator Component
 * Calculate machining time for CNC operations
 */

import { useState, useMemo } from 'preact/hooks';
import { ResultCard, Input, Select, ButtonGroup } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import type { CuttingTimeInputs } from './types';
import { OPERATION_TYPES, MACHINE_RATES } from './types';
import { calculateCuttingTime, formatTime } from './calculations';

export function CuttingTimeCalculator() {
  const [inputs, setInputs] = useState<CuttingTimeInputs>({
    operationType: 'milling',
    pathLength: 24,
    pathUnit: 'inches',
    feedRate: 20,
    feedUnit: 'ipm',
    numberOfPasses: 1,
    partLength: 6,
    partDiameter: 2,
    depthOfCut: 0.1,
    holeDepth: 1,
    numberOfHoles: 8,
    peckDepth: 0.25,
    rapidRate: 400,
    rapidDistance: 12,
    toolChangeTime: 0.25,
    numberOfToolChanges: 2,
    setupTime: 15,
    quantity: 10,
  });

  const [machineRate, setMachineRate] = useState(75);

  const results = useMemo(() => calculateCuttingTime(inputs), [inputs]);

  const adjustedCost = (results.totalJobTime / 60) * machineRate;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Operation Type</h2>

          <div className="space-y-4">
            <Select
              label="Operation"
              value={inputs.operationType}
              onChange={(v) => setInputs({ ...inputs, operationType: v as any })}
              options={OPERATION_TYPES}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                  Length Unit
                </label>
                <ButtonGroup
                  options={[
                    { value: 'inches', label: 'Inches' },
                    { value: 'mm', label: 'mm' },
                  ]}
                  value={inputs.pathUnit}
                  onChange={(v) => setInputs({ ...inputs, pathUnit: v as any })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                  Feed Unit
                </label>
                <ButtonGroup
                  options={[
                    { value: 'ipm', label: 'IPM' },
                    { value: 'mmpm', label: 'mm/min' },
                  ]}
                  value={inputs.feedUnit}
                  onChange={(v) => setInputs({ ...inputs, feedUnit: v as any })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">
            {inputs.operationType === 'milling' && 'Milling Parameters'}
            {inputs.operationType === 'turning' && 'Turning Parameters'}
            {inputs.operationType === 'drilling' && 'Drilling Parameters'}
          </h2>

          <div className="space-y-4">
            {inputs.operationType === 'milling' && (
              <>
                <Input
                  label="Tool Path Length"
                  type="number"
                  value={inputs.pathLength}
                  onChange={(v) => setInputs({ ...inputs, pathLength: parseFloat(v) || 0 })}
                  min={0}
                  suffix={inputs.pathUnit}
                />
                <Input
                  label="Feed Rate"
                  type="number"
                  value={inputs.feedRate}
                  onChange={(v) => setInputs({ ...inputs, feedRate: parseFloat(v) || 0 })}
                  min={0}
                  suffix={inputs.feedUnit}
                />
                <Input
                  label="Number of Passes"
                  type="number"
                  value={inputs.numberOfPasses}
                  onChange={(v) => setInputs({ ...inputs, numberOfPasses: parseInt(v) || 1 })}
                  min={1}
                />
              </>
            )}

            {inputs.operationType === 'turning' && (
              <>
                <Input
                  label="Part Length"
                  type="number"
                  value={inputs.partLength}
                  onChange={(v) => setInputs({ ...inputs, partLength: parseFloat(v) || 0 })}
                  min={0}
                  suffix={inputs.pathUnit}
                />
                <Input
                  label="Part Diameter"
                  type="number"
                  value={inputs.partDiameter}
                  onChange={(v) => setInputs({ ...inputs, partDiameter: parseFloat(v) || 0 })}
                  min={0}
                  suffix={inputs.pathUnit}
                />
                <Input
                  label="Feed Rate"
                  type="number"
                  value={inputs.feedRate}
                  onChange={(v) => setInputs({ ...inputs, feedRate: parseFloat(v) || 0 })}
                  min={0}
                  suffix={inputs.feedUnit}
                />
                <Input
                  label="Number of Passes"
                  type="number"
                  value={inputs.numberOfPasses}
                  onChange={(v) => setInputs({ ...inputs, numberOfPasses: parseInt(v) || 1 })}
                  min={1}
                />
              </>
            )}

            {inputs.operationType === 'drilling' && (
              <>
                <Input
                  label="Hole Depth"
                  type="number"
                  value={inputs.holeDepth}
                  onChange={(v) => setInputs({ ...inputs, holeDepth: parseFloat(v) || 0 })}
                  min={0}
                  suffix={inputs.pathUnit}
                />
                <Input
                  label="Number of Holes"
                  type="number"
                  value={inputs.numberOfHoles}
                  onChange={(v) => setInputs({ ...inputs, numberOfHoles: parseInt(v) || 1 })}
                  min={1}
                />
                <Input
                  label="Feed Rate"
                  type="number"
                  value={inputs.feedRate}
                  onChange={(v) => setInputs({ ...inputs, feedRate: parseFloat(v) || 0 })}
                  min={0}
                  suffix={inputs.feedUnit}
                />
                <Input
                  label="Peck Depth (0 for no peck)"
                  type="number"
                  value={inputs.peckDepth}
                  onChange={(v) => setInputs({ ...inputs, peckDepth: parseFloat(v) || 0 })}
                  min={0}
                  suffix={inputs.pathUnit}
                />
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Job Parameters</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Rapid Rate"
              type="number"
              value={inputs.rapidRate}
              onChange={(v) => setInputs({ ...inputs, rapidRate: parseFloat(v) || 0 })}
              min={0}
              suffix="ipm"
            />
            <Input
              label="Rapid Distance"
              type="number"
              value={inputs.rapidDistance}
              onChange={(v) => setInputs({ ...inputs, rapidDistance: parseFloat(v) || 0 })}
              min={0}
              suffix={inputs.pathUnit}
            />
            <Input
              label="Tool Changes"
              type="number"
              value={inputs.numberOfToolChanges}
              onChange={(v) => setInputs({ ...inputs, numberOfToolChanges: parseInt(v) || 0 })}
              min={0}
            />
            <Input
              label="Time per Change"
              type="number"
              value={inputs.toolChangeTime}
              onChange={(v) => setInputs({ ...inputs, toolChangeTime: parseFloat(v) || 0 })}
              min={0}
              suffix="min"
            />
            <Input
              label="Setup Time"
              type="number"
              value={inputs.setupTime}
              onChange={(v) => setInputs({ ...inputs, setupTime: parseFloat(v) || 0 })}
              min={0}
              suffix="min"
            />
            <Input
              label="Quantity"
              type="number"
              value={inputs.quantity}
              onChange={(v) => setInputs({ ...inputs, quantity: parseInt(v) || 1 })}
              min={1}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-slate-500/20 to-slate-600/10 p-6 ring-1 ring-slate-500/30">
          <h2 className="mb-4 text-lg font-semibold text-slate-300">Cycle Time</h2>
          <div className="text-center">
            <div className="text-5xl font-bold text-slate-300">
              {formatTime(results.totalCycleTime)}
            </div>
            <div className="mt-2 text-slate-400">per part</div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard label="Cutting Time" value={formatTime(results.cuttingTime)} color="blue" />
          <ResultCard label="Rapid Time" value={formatTime(results.rapidTime)} color="green" />
          <ResultCard
            label="Tool Change Time"
            value={formatTime(results.toolChangeTime)}
            color="purple"
          />
          <ResultCard
            label="Parts Per Hour"
            value={results.partsPerHour.toString()}
            color="green"
          />
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Job Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">Setup Time</span>
              <span className="font-medium text-[var(--color-text)]">
                {formatTime(inputs.setupTime)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">Total Machining</span>
              <span className="font-medium text-[var(--color-text)]">
                {formatTime(results.totalCycleTime * inputs.quantity)}
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="font-medium text-[var(--color-text)]">Total Job Time</span>
              <span className="font-bold text-[var(--color-accent)]">
                {formatTime(results.totalJobTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Cost Estimate</h3>
          <Select
            label="Machine Rate"
            value={machineRate.toString()}
            onChange={(v) => setMachineRate(parseFloat(v))}
            options={MACHINE_RATES.map((r) => ({
              value: r.rate.toString(),
              label: `${r.label} ($${r.rate}/hr)`,
            }))}
          />
          <div className="mt-4 text-center">
            <div className="text-3xl font-bold text-green-400">${adjustedCost.toFixed(2)}</div>
            <div className="text-sm text-[var(--color-subtle)]">
              ${(adjustedCost / inputs.quantity).toFixed(2)} per part
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-amber-900/20 p-4 ring-1 ring-amber-500/30">
          <h4 className="mb-2 font-medium text-amber-400">Estimation Notes</h4>
          <ul className="space-y-1 text-sm text-amber-200/80">
            <li>• Actual times vary based on machine, material, and conditions</li>
            <li>• Add 10-20% buffer for real-world scheduling</li>
            <li>• Complex geometries may require additional time</li>
            <li>• Includes basic rapid moves, not complex tool paths</li>
          </ul>
        </div>

        <div className="flex justify-center pt-4">
          <ShareResults
            result={`Cycle time: ${formatTime(results.totalCycleTime)} per part. Total job time: ${formatTime(results.totalJobTime)} for ${inputs.quantity} parts. Est. cost: $${adjustedCost.toFixed(2)} ($${(adjustedCost / inputs.quantity).toFixed(2)}/part).`}
            calculatorName="Cutting Time Calculator"
          />
        </div>
      </div>
    </div>
  );
}
