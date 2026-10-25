/**
 * Tool Deflection Calculator Component
 * Calculate end mill deflection to prevent tool breakage
 */
import { ResultCard, Input, Select, ButtonGroup, Label } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import type { ToolDeflectionInputs } from './types';
import { TOOL_MATERIALS, FLUTE_OPTIONS, MATERIAL_FACTORS, TOOL_PRESETS } from './types';
import { calculateToolDeflection, formatDeflection } from './calculations';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

export function ToolDeflectionCalculator() {
  const {
    inputs,
    result: results,
    setInputs,
  } = useCalculatorState<ToolDeflectionInputs, ReturnType<typeof calculateToolDeflection>>({
    defaults: {
      toolDiameter: 0.25,
      stickout: 1.0,
      lengthUnit: 'inches',
      toolMaterial: 'carbide',
      fluteCount: 4,
      cuttingForce: 10,
      forceUnit: 'lbs',
      calculationMode: 'parameters',
      depthOfCut: 0.1,
      widthOfCut: 0.125,
      feedRate: 10,
      materialFactor: 1.0,
    },
    compute: calculateToolDeflection,
  });

  const statusColors = {
    safe: 'text-green-400 bg-green-900/20 ring-green-500/30',
    warning: 'text-amber-400 bg-amber-900/20 ring-amber-500/30',
    danger: 'text-red-400 bg-red-900/20 ring-red-500/30',
  };

  const statusLabels = {
    safe: 'Within Limits',
    warning: 'Approaching Limit',
    danger: 'Excessive Deflection',
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Tool Setup</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tool-diameter">
                  Tool Diameter ({inputs.lengthUnit === 'inches' ? '"' : 'mm'})
                </Label>
                <Input
                  id="tool-diameter"
                  type="number"
                  value={inputs.toolDiameter}
                  onChange={(e) =>
                    setInputs({ ...inputs, toolDiameter: parseFloat(e.currentTarget.value) || 0 })
                  }
                  min={0.01}
                  step={0.0625}
                />
              </div>
              <div>
                <Label htmlFor="stickout-length">
                  Stickout Length ({inputs.lengthUnit === 'inches' ? '"' : 'mm'})
                </Label>
                <Input
                  id="stickout-length"
                  type="number"
                  value={inputs.stickout}
                  onChange={(e) =>
                    setInputs({ ...inputs, stickout: parseFloat(e.currentTarget.value) || 0 })
                  }
                  min={0.1}
                  step={0.125}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                Length Unit
              </label>
              <ButtonGroup
                options={[
                  { value: 'inches', label: 'Inches' },
                  { value: 'mm', label: 'mm' },
                ]}
                value={inputs.lengthUnit}
                onChange={(v) =>
                  setInputs({
                    ...inputs,
                    lengthUnit: v as ToolDeflectionInputs['lengthUnit'],
                  })
                }
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {TOOL_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() =>
                    setInputs({
                      ...inputs,
                      toolDiameter:
                        inputs.lengthUnit === 'inches' ? preset.diameter : preset.diameter * 25.4,
                      stickout:
                        inputs.lengthUnit === 'inches'
                          ? preset.maxStickout
                          : preset.maxStickout * 25.4,
                    })
                  }
                  className="rounded-lg bg-[var(--color-background)] px-3 py-1.5 text-xs ring-1 ring-white/5 hover:ring-blue-500/30"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div>
              <Label htmlFor="tool-material">Tool Material</Label>
              <Select
                id="tool-material"
                value={inputs.toolMaterial}
                onChange={(v) =>
                  setInputs({
                    ...inputs,
                    toolMaterial: v as ToolDeflectionInputs['toolMaterial'],
                  })
                }
                options={TOOL_MATERIALS.map((m) => ({
                  value: m.value,
                  label: m.label,
                }))}
              />
            </div>

            <div>
              <Label htmlFor="flute-count">Flute Count</Label>
              <Select
                id="flute-count"
                value={inputs.fluteCount.toString()}
                onChange={(v) =>
                  setInputs({
                    ...inputs,
                    fluteCount: parseInt(v) as ToolDeflectionInputs['fluteCount'],
                  })
                }
                options={FLUTE_OPTIONS.map((f) => ({
                  value: f.value.toString(),
                  label: f.label,
                }))}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">
            Cutting Parameters
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                Input Method
              </label>
              <ButtonGroup
                options={[
                  { value: 'parameters', label: 'Cutting Params' },
                  { value: 'force', label: 'Direct Force' },
                ]}
                value={inputs.calculationMode}
                onChange={(v) =>
                  setInputs({
                    ...inputs,
                    calculationMode: v as ToolDeflectionInputs['calculationMode'],
                  })
                }
              />
            </div>

            {inputs.calculationMode === 'force' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cutting-force">Cutting Force</Label>
                  <Input
                    id="cutting-force"
                    type="number"
                    value={inputs.cuttingForce}
                    onChange={(e) =>
                      setInputs({ ...inputs, cuttingForce: parseFloat(e.currentTarget.value) || 0 })
                    }
                    min={0.1}
                    step={1}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-subtle)]">
                    Force Unit
                  </label>
                  <ButtonGroup
                    options={[
                      { value: 'lbs', label: 'lbs' },
                      { value: 'N', label: 'N' },
                    ]}
                    value={inputs.forceUnit}
                    onChange={(v) =>
                      setInputs({
                        ...inputs,
                        forceUnit: v as ToolDeflectionInputs['forceUnit'],
                      })
                    }
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="workpiece-material">Workpiece Material</Label>
                  <Select
                    id="workpiece-material"
                    value={inputs.materialFactor.toString()}
                    onChange={(v) => setInputs({ ...inputs, materialFactor: parseFloat(v) })}
                    options={MATERIAL_FACTORS.map((m) => ({
                      value: m.factor.toString(),
                      label: m.label,
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="depth-of-cut">
                      Depth of Cut ({inputs.lengthUnit === 'inches' ? '"' : 'mm'})
                    </Label>
                    <Input
                      id="depth-of-cut"
                      type="number"
                      value={inputs.depthOfCut}
                      onChange={(e) =>
                        setInputs({ ...inputs, depthOfCut: parseFloat(e.currentTarget.value) || 0 })
                      }
                      min={0.001}
                      step={0.01}
                    />
                  </div>
                  <div>
                    <Label htmlFor="width-of-cut">
                      Width of Cut ({inputs.lengthUnit === 'inches' ? '"' : 'mm'})
                    </Label>
                    <Input
                      id="width-of-cut"
                      type="number"
                      value={inputs.widthOfCut}
                      onChange={(e) =>
                        setInputs({ ...inputs, widthOfCut: parseFloat(e.currentTarget.value) || 0 })
                      }
                      min={0.001}
                      step={0.01}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="feed-rate">Feed Rate (ipm)</Label>
                  <Input
                    id="feed-rate"
                    type="number"
                    value={inputs.feedRate}
                    onChange={(e) =>
                      setInputs({ ...inputs, feedRate: parseFloat(e.currentTarget.value) || 0 })
                    }
                    min={0.1}
                    step={1}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className={`rounded-2xl p-6 ring-1 ${statusColors[results.status]}`}>
          <h2 className="mb-4 text-lg font-semibold">Tool Deflection</h2>
          <div className="text-center">
            <div className="text-4xl font-bold">
              {formatDeflection(results.deflection, results.deflectionUnit)}
            </div>
            <div className="mt-2 text-lg font-medium">{statusLabels[results.status]}</div>
            <div className="mt-1 text-sm opacity-80">
              {results.deflectionRatio.toFixed(2)}x recommended limit
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard
            label="Max Recommended"
            value={formatDeflection(results.maxRecommended, results.deflectionUnit)}
            subtitle="0.1% of diameter"
          />
          <ResultCard
            label="Deflection Ratio"
            value={`${(results.deflectionRatio * 100).toFixed(0)}%`}
            subtitle="of limit"
          />
          <ResultCard
            label="Tool Stiffness"
            value={`${results.stiffness.toLocaleString()}`}
            subtitle="lbs/inch"
          />
          <ResultCard
            label="Stickout Ratio"
            value={`${(inputs.stickout / inputs.toolDiameter).toFixed(1)}:1`}
            subtitle="L/D ratio"
          />
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Recommendations</h3>
          <ul className="space-y-2">
            {results.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-subtle)]">
                <span
                  className={
                    results.status === 'danger'
                      ? 'text-red-400'
                      : results.status === 'warning'
                        ? 'text-amber-400'
                        : 'text-green-400'
                  }
                >
                  •
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
            Stickout Guidelines
          </h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg bg-green-900/20 p-3 text-center">
              <div className="font-medium text-green-400">Safe</div>
              <div className="text-xs text-[var(--color-subtle)]">{'<'} 3:1 L/D</div>
            </div>
            <div className="rounded-lg bg-amber-900/20 p-3 text-center">
              <div className="font-medium text-amber-400">Caution</div>
              <div className="text-xs text-[var(--color-subtle)]">3-5:1 L/D</div>
            </div>
            <div className="rounded-lg bg-red-900/20 p-3 text-center">
              <div className="font-medium text-red-400">Risk</div>
              <div className="text-xs text-[var(--color-subtle)]">{'>'}5:1 L/D</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-amber-900/20 p-4 ring-1 ring-amber-500/30">
          <h4 className="mb-2 font-medium text-amber-400">Reducing Deflection</h4>
          <ul className="space-y-1 text-sm text-amber-200/80">
            <li>• Use shortest possible stickout (most effective)</li>
            <li>• Increase tool diameter where geometry allows</li>
            <li>• Reduce depth/width of cut and take more passes</li>
            <li>• Use carbide over HSS for 3x more stiffness</li>
            <li>• Consider shrink-fit or hydraulic tool holders</li>
          </ul>
        </div>

        <div className="flex justify-center pt-4">
          <ShareResults
            result={`Tool deflection: ${formatDeflection(results.deflection, results.deflectionUnit)} (${results.status}). ${inputs.toolDiameter}${inputs.lengthUnit === 'inches' ? '"' : 'mm'} ${inputs.toolMaterial} end mill, ${inputs.stickout}${inputs.lengthUnit === 'inches' ? '"' : 'mm'} stickout. L/D ratio: ${(inputs.stickout / inputs.toolDiameter).toFixed(1)}:1.`}
            calculatorName="Tool Deflection Calculator"
          />
        </div>
      </div>
    </div>
  );
}
