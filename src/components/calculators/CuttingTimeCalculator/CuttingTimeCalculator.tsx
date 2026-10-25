/**
 * Cutting Time Estimator Component
 * Calculate machining time for CNC operations
 */

import { useState } from 'preact/hooks';
import { ResultCard, Input, Select, ButtonGroup, Label } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import type { CuttingTimeInputs } from './types';
import { OPERATION_TYPES, MACHINE_RATES } from './types';
import { calculateCuttingTime, formatTime } from './calculations';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

export function CuttingTimeCalculator() {
  const {
    inputs,
    result: results,
    setInputs,
  } = useCalculatorState<CuttingTimeInputs, ReturnType<typeof calculateCuttingTime>>({
    defaults: {
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
    },
    compute: calculateCuttingTime,
  });

  const [machineRate, setMachineRate] = useState(75);

  const adjustedCost = (results.totalJobTime / 60) * machineRate;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Operation Type</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="operation">Operation</Label>
              <Select
                id="operation"
                value={inputs.operationType}
                onChange={(v) =>
                  setInputs({
                    ...inputs,
                    operationType: v as CuttingTimeInputs['operationType'],
                  })
                }
                options={OPERATION_TYPES}
              />
            </div>

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
                  onChange={(v) =>
                    setInputs({
                      ...inputs,
                      pathUnit: v as CuttingTimeInputs['pathUnit'],
                    })
                  }
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
                  onChange={(v) =>
                    setInputs({
                      ...inputs,
                      feedUnit: v as CuttingTimeInputs['feedUnit'],
                    })
                  }
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
                <div>
                  <Label htmlFor="tool-path-length">Tool Path Length ({inputs.pathUnit})</Label>
                  <Input
                    id="tool-path-length"
                    type="number"
                    value={inputs.pathLength}
                    onChange={(e) =>
                      setInputs({ ...inputs, pathLength: parseFloat(e.currentTarget.value) || 0 })
                    }
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="feed-rate">Feed Rate ({inputs.feedUnit})</Label>
                  <Input
                    id="feed-rate"
                    type="number"
                    value={inputs.feedRate}
                    onChange={(e) =>
                      setInputs({ ...inputs, feedRate: parseFloat(e.currentTarget.value) || 0 })
                    }
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="number-of-passes">Number of Passes</Label>
                  <Input
                    id="number-of-passes"
                    type="number"
                    value={inputs.numberOfPasses}
                    onChange={(e) =>
                      setInputs({ ...inputs, numberOfPasses: parseInt(e.currentTarget.value) || 1 })
                    }
                    min={1}
                  />
                </div>
              </>
            )}

            {inputs.operationType === 'turning' && (
              <>
                <div>
                  <Label htmlFor="part-length">Part Length ({inputs.pathUnit})</Label>
                  <Input
                    id="part-length"
                    type="number"
                    value={inputs.partLength}
                    onChange={(e) =>
                      setInputs({ ...inputs, partLength: parseFloat(e.currentTarget.value) || 0 })
                    }
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="part-diameter">Part Diameter ({inputs.pathUnit})</Label>
                  <Input
                    id="part-diameter"
                    type="number"
                    value={inputs.partDiameter}
                    onChange={(e) =>
                      setInputs({ ...inputs, partDiameter: parseFloat(e.currentTarget.value) || 0 })
                    }
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="feed-rate-2">Feed Rate ({inputs.feedUnit})</Label>
                  <Input
                    id="feed-rate-2"
                    type="number"
                    value={inputs.feedRate}
                    onChange={(e) =>
                      setInputs({ ...inputs, feedRate: parseFloat(e.currentTarget.value) || 0 })
                    }
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="number-of-passes-2">Number of Passes</Label>
                  <Input
                    id="number-of-passes-2"
                    type="number"
                    value={inputs.numberOfPasses}
                    onChange={(e) =>
                      setInputs({ ...inputs, numberOfPasses: parseInt(e.currentTarget.value) || 1 })
                    }
                    min={1}
                  />
                </div>
              </>
            )}

            {inputs.operationType === 'drilling' && (
              <>
                <div>
                  <Label htmlFor="hole-depth">Hole Depth ({inputs.pathUnit})</Label>
                  <Input
                    id="hole-depth"
                    type="number"
                    value={inputs.holeDepth}
                    onChange={(e) =>
                      setInputs({ ...inputs, holeDepth: parseFloat(e.currentTarget.value) || 0 })
                    }
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="number-of-holes">Number of Holes</Label>
                  <Input
                    id="number-of-holes"
                    type="number"
                    value={inputs.numberOfHoles}
                    onChange={(e) =>
                      setInputs({ ...inputs, numberOfHoles: parseInt(e.currentTarget.value) || 1 })
                    }
                    min={1}
                  />
                </div>
                <div>
                  <Label htmlFor="feed-rate-3">Feed Rate ({inputs.feedUnit})</Label>
                  <Input
                    id="feed-rate-3"
                    type="number"
                    value={inputs.feedRate}
                    onChange={(e) =>
                      setInputs({ ...inputs, feedRate: parseFloat(e.currentTarget.value) || 0 })
                    }
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="peck-depth-0-for-no-peck">
                    Peck Depth (0 for no peck) ({inputs.pathUnit})
                  </Label>
                  <Input
                    id="peck-depth-0-for-no-peck"
                    type="number"
                    value={inputs.peckDepth}
                    onChange={(e) =>
                      setInputs({ ...inputs, peckDepth: parseFloat(e.currentTarget.value) || 0 })
                    }
                    min={0}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Job Parameters</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="rapid-rate">Rapid Rate (ipm)</Label>
              <Input
                id="rapid-rate"
                type="number"
                value={inputs.rapidRate}
                onChange={(e) =>
                  setInputs({ ...inputs, rapidRate: parseFloat(e.currentTarget.value) || 0 })
                }
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="rapid-distance">Rapid Distance ({inputs.pathUnit})</Label>
              <Input
                id="rapid-distance"
                type="number"
                value={inputs.rapidDistance}
                onChange={(e) =>
                  setInputs({ ...inputs, rapidDistance: parseFloat(e.currentTarget.value) || 0 })
                }
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="tool-changes">Tool Changes</Label>
              <Input
                id="tool-changes"
                type="number"
                value={inputs.numberOfToolChanges}
                onChange={(e) =>
                  setInputs({
                    ...inputs,
                    numberOfToolChanges: parseInt(e.currentTarget.value) || 0,
                  })
                }
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="time-per-change">Time per Change (min)</Label>
              <Input
                id="time-per-change"
                type="number"
                value={inputs.toolChangeTime}
                onChange={(e) =>
                  setInputs({ ...inputs, toolChangeTime: parseFloat(e.currentTarget.value) || 0 })
                }
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="setup-time">Setup Time (min)</Label>
              <Input
                id="setup-time"
                type="number"
                value={inputs.setupTime}
                onChange={(e) =>
                  setInputs({ ...inputs, setupTime: parseFloat(e.currentTarget.value) || 0 })
                }
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={inputs.quantity}
                onChange={(e) =>
                  setInputs({ ...inputs, quantity: parseInt(e.currentTarget.value) || 1 })
                }
                min={1}
              />
            </div>
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
          <ResultCard label="Cutting Time" value={formatTime(results.cuttingTime)} />
          <ResultCard label="Rapid Time" value={formatTime(results.rapidTime)} />
          <ResultCard label="Tool Change Time" value={formatTime(results.toolChangeTime)} />
          <ResultCard label="Parts Per Hour" value={results.partsPerHour.toString()} />
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
          <div>
            <Label htmlFor="machine-rate">Machine Rate</Label>
            <Select
              id="machine-rate"
              value={machineRate.toString()}
              onChange={(v) => setMachineRate(parseFloat(v))}
              options={MACHINE_RATES.map((r) => ({
                value: r.rate.toString(),
                label: `${r.label} ($${r.rate}/hr)`,
              }))}
            />
          </div>
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
