/**
 * One Rep Max Calculator - Preact Component
 *
 * Estimates 1RM using five formulas with percentage table and training zones.
 */

import { useMemo } from 'preact/hooks';
import { calculateOneRepMax } from './calculations';
import {
  getDefaultInputs,
  FORMULA_OPTIONS,
  type OneRepMaxInputs,
  type WeightUnit,
  type FormulaName,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Select,
  Grid,
  Divider,
  ResultCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 0.453592;

export default function OneRepMaxCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorState<
    OneRepMaxInputs,
    ReturnType<typeof calculateOneRepMax>
  >({
    name: 'One Rep Max Calculator',
    defaults: getDefaultInputs,
    compute: calculateOneRepMax,
  });

  const handleUnitChange = (newUnit: WeightUnit) => {
    if (newUnit === inputs.unit) return;
    const converted =
      newUnit === 'lbs'
        ? Math.round(inputs.weight * KG_TO_LBS)
        : Math.round(inputs.weight * LBS_TO_KG);
    setInputs({ ...inputs, unit: newUnit, weight: converted });
  };

  const unitOptions = [
    { value: 'kg' as const, label: 'kg' },
    { value: 'lbs' as const, label: 'lbs' },
  ];

  const formulaSelectOptions = FORMULA_OPTIONS.map((f) => ({
    value: f.value,
    label: f.label,
  }));

  const getZoneColor = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-950/50 border-red-500/30 text-red-400';
      case 'yellow':
        return 'bg-yellow-950/50 border-yellow-500/30 text-yellow-400';
      case 'green':
        return 'bg-green-950/50 border-green-500/30 text-green-400';
      default:
        return 'bg-[var(--color-night)] border-white/10 text-[var(--color-cream)]';
    }
  };

  const hasResult = result.estimated1RM > 0;

  return (
    <ThemeProvider defaultColor="red">
      <Card variant="elevated">
        <CalculatorHeader
          title="One Rep Max Calculator"
          subtitle="Estimate your maximum single-repetition lift"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Unit Toggle */}
            <div>
              <Label>Unit</Label>
              <ButtonGroup
                options={unitOptions}
                value={inputs.unit}
                onChange={(v) => handleUnitChange(v as WeightUnit)}
                columns={2}
              />
            </div>

            {/* Weight Lifted */}
            <div>
              <Label htmlFor="weight" required>
                Weight Lifted ({inputs.unit})
              </Label>
              <Input
                id="weight"
                type="number"
                min={1}
                max={2000}
                step={inputs.unit === 'kg' ? 2.5 : 5}
                value={inputs.weight}
                onChange={(e) => updateInput('weight', Number(e.target.value))}
              />
            </div>

            {/* Reps Performed */}
            <div>
              <Label htmlFor="reps" required>
                Reps Performed
              </Label>
              <Input
                id="reps"
                type="number"
                min={1}
                max={30}
                step={1}
                value={inputs.reps}
                onChange={(e) => updateInput('reps', Math.min(30, Math.max(1, Number(e.target.value))))}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                1-30 reps. Lower rep ranges give more accurate estimates.
              </p>
            </div>

            {/* Formula Selector */}
            <div>
              <Label htmlFor="formula">Formula</Label>
              <Select
                id="formula"
                options={formulaSelectOptions}
                value={inputs.formula}
                onChange={(v) => updateInput('formula', v as FormulaName)}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                {FORMULA_OPTIONS.find((f) => f.value === inputs.formula)?.description}
              </p>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {hasResult ? (
              <>
                {/* Primary Result */}
                <ResultCard
                  label="Estimated 1RM"
                  value={`${result.estimated1RM} ${inputs.unit}`}
                  subtitle={`Using ${FORMULA_OPTIONS.find((f) => f.value === inputs.formula)?.label} formula`}
                  footer={
                    <>
                      Based on {inputs.weight} {inputs.unit} x {inputs.reps} rep{inputs.reps > 1 ? 's' : ''}
                    </>
                  }
                />

                {/* Training Zones */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Training Zones
                  </h3>
                  <div className="space-y-3">
                    {result.trainingZones.map((zone) => (
                      <div
                        key={zone.name}
                        className={`p-4 rounded-lg border-2 ${getZoneColor(zone.color)}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-base">{zone.name}</span>
                          <span className="text-sm font-medium tabular-nums">
                            {zone.minPercent}-{zone.maxPercent}% 1RM
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm opacity-75">{zone.description}</span>
                          <span className="text-sm tabular-nums whitespace-nowrap ml-4">
                            {zone.minWeight}-{zone.maxWeight} {inputs.unit}
                          </span>
                        </div>
                        <div className="text-xs opacity-60 mt-1">{zone.repsRange}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Percentage Table */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Percentage of 1RM
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {result.percentages.map((row) => (
                      <div
                        key={row.percent}
                        className={`p-3 rounded-lg text-center ${
                          row.percent === 100
                            ? 'bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)]/50'
                            : 'bg-[var(--color-void)] hover:bg-white/5'
                        }`}
                      >
                        <div
                          className={`text-lg font-bold tabular-nums ${
                            row.percent === 100 ? 'text-[var(--color-accent)]' : 'text-[var(--color-cream)]'
                          }`}
                        >
                          {row.percent}%
                        </div>
                        <div className="text-sm text-[var(--color-subtle)] tabular-nums">
                          {row.weight} {inputs.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formula Comparison */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Formula Comparison
                  </h3>
                  <div className="space-y-2">
                    {result.formulaComparison.map((f) => (
                      <div
                        key={f.formula}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          f.formula === inputs.formula
                            ? 'bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30'
                            : 'bg-[var(--color-void)]'
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            f.formula === inputs.formula
                              ? 'text-[var(--color-accent)]'
                              : 'text-[var(--color-cream)]'
                          }`}
                        >
                          {f.label}
                          {f.formula === inputs.formula && (
                            <span className="text-xs ml-2 opacity-60">(selected)</span>
                          )}
                        </span>
                        <span className="font-bold tabular-nums text-[var(--color-cream)]">
                          {f.estimated1RM} {inputs.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert variant="info" title="Note:">
                  1RM estimates are most accurate with 1-10 reps. Higher rep counts decrease
                  reliability. Never attempt a true 1RM without a spotter and proper warm-up.
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Enter your lift">
                Enter the weight lifted and number of reps to estimate your one rep max.
              </Alert>
            )}

            {/* Share */}
            {hasResult && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Estimated 1RM: ${result.estimated1RM} ${inputs.unit} (${FORMULA_OPTIONS.find((f) => f.value === inputs.formula)?.label} formula) from ${inputs.weight} ${inputs.unit} x ${inputs.reps} reps`}
                  calculatorName="One Rep Max Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
