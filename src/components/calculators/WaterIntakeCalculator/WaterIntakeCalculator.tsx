/**
 * Water Intake Calculator - Preact Component
 */

import { calculateWaterIntake, formatMl, formatOz, formatCups } from './calculations';
import {
  getDefaultInputs,
  ACTIVITY_LEVELS,
  CLIMATE_OPTIONS,
  type WaterIntakeInputs,
  type WaterIntakeResult,
  type WeightUnit,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Grid,
  Divider,
  Toggle,
  Alert,
  MetricCard,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

export default function WaterIntakeCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorState<
    WaterIntakeInputs,
    WaterIntakeResult
  >({
    name: 'Water Intake Calculator',
    defaults: getDefaultInputs,
    compute: calculateWaterIntake,
  });

  const handleUnitChange = (newUnit: WeightUnit) => {
    if (newUnit === inputs.unit) return;
    const converted =
      newUnit === 'lbs'
        ? Math.round(inputs.bodyWeight / 0.453592)
        : Math.round(inputs.bodyWeight * 0.453592);
    setInputs((prev) => ({ ...prev, unit: newUnit, bodyWeight: converted }));
  };

  const unitOptions = [
    { value: 'kg' as const, label: 'Kilograms (kg)' },
    { value: 'lbs' as const, label: 'Pounds (lbs)' },
  ];

  // Water bottle fill percentage (capped at 100% for visual)
  const fillPercent = Math.min(100, Math.round((result.dailyIntakeMl / 4000) * 100));

  // Number of cups to show (max 16 for display)
  const cupsToShow = Math.min(16, Math.ceil(result.dailyIntakeCups));

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Water Intake Calculator"
          subtitle="Find your daily hydration target"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Unit toggle */}
            <div>
              <Label>Unit System</Label>
              <ButtonGroup
                options={unitOptions}
                value={inputs.unit}
                onChange={(value) => handleUnitChange(value as WeightUnit)}
                columns={2}
              />
            </div>

            {/* Body weight */}
            <div>
              <Label htmlFor="bodyWeight" required>
                Body Weight ({inputs.unit})
              </Label>
              <Input
                id="bodyWeight"
                type="number"
                min={20}
                max={inputs.unit === 'kg' ? 300 : 660}
                step={1}
                value={inputs.bodyWeight}
                onChange={(e) => updateInput('bodyWeight', Number(e.target.value))}
              />
            </div>

            {/* Activity level */}
            <div>
              <Label>Activity Level</Label>
              <div className="space-y-2">
                {ACTIVITY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => updateInput('activityLevel', level.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      inputs.activityLevel === level.value
                        ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/50 text-[var(--color-cream)]'
                        : 'bg-[var(--color-night)] border-white/10 text-[var(--color-subtle)] hover:border-white/20'
                    }`}
                  >
                    <div className="font-medium">{level.label}</div>
                    <div className="text-sm opacity-75">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Climate */}
            <div>
              <Label>Climate</Label>
              <ButtonGroup
                options={CLIMATE_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
                value={inputs.climate}
                onChange={(value) => updateInput('climate', value as WaterIntakeInputs['climate'])}
                columns={4}
              />
            </div>

            {/* Pregnancy toggles */}
            <div className="space-y-3">
              <Toggle
                checked={inputs.isPregnant}
                onChange={(checked) => updateInput('isPregnant', checked)}
                label="Pregnant (+300ml)"
              />
              <Toggle
                checked={inputs.isBreastfeeding}
                onChange={(checked) => updateInput('isBreastfeeding', checked)}
                label="Breastfeeding (+700ml)"
              />
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {inputs.bodyWeight > 0 ? (
              <>
                {/* Primary result - water bottle fill */}
                <div className="bg-[var(--color-night)] rounded-2xl p-8 border border-white/10 text-center">
                  <div className="flex justify-center mb-6">
                    <div
                      className="relative w-24 h-48 rounded-b-2xl rounded-t-lg border-2 border-blue-400/50 overflow-hidden"
                      aria-label={`Water bottle ${fillPercent}% full`}
                    >
                      {/* Bottle cap */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-3 bg-blue-400/30 rounded-t-md border-2 border-blue-400/50 border-b-0" />
                      {/* Water fill */}
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-700"
                        style={{ height: `${fillPercent}%` }}
                      />
                      {/* Fill label */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-white drop-shadow-md">
                          {formatMl(result.dailyIntakeMl)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-[var(--color-cream)] tabular-nums mb-1">
                    {formatMl(result.dailyIntakeMl)}
                  </p>
                  <p className="text-lg text-[var(--color-muted)]">
                    {formatOz(result.dailyIntakeOz)} / {formatCups(result.dailyIntakeCups)}
                  </p>
                  <p className="text-sm text-[var(--color-subtle)] mt-2">
                    {result.comparedToEightGlasses}% of the "8 glasses a day" recommendation
                  </p>
                </div>

                {/* Cups visual */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Daily Cups ({result.dailyIntakeCups})
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Array.from({ length: cupsToShow }).map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-10 rounded-b-lg rounded-t-sm border-2 border-blue-400/40 bg-blue-500/30 flex items-end justify-center overflow-hidden"
                        aria-hidden="true"
                      >
                        <div className="w-full bg-blue-400/60 rounded-b-md" style={{ height: '70%' }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Daily Intake"
                    value={formatMl(result.dailyIntakeMl)}
                    sublabel="total recommended"
                  />
                  <MetricCard
                    label="Per Hour"
                    value={`${result.hourlyIntakeMl}ml`}
                    sublabel="during waking hours"
                    valueColor="text-[var(--color-accent)]"
                  />
                  <MetricCard
                    label="Exercise Extra"
                    value={`+${result.exerciseAdditionMl}ml`}
                    sublabel="activity addition"
                    valueColor="text-emerald-400"
                  />
                  <MetricCard
                    label="vs 8 Glasses"
                    value={`${result.comparedToEightGlasses}%`}
                    sublabel="of standard advice"
                  />
                </Grid>

                {/* Hydration tips */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Hydration Tips
                  </h3>
                  <ul className="space-y-3">
                    {result.hydrationTips.map((tip, i) => (
                      <li key={i} className="flex gap-3 text-[var(--color-subtle)]">
                        <span className="text-blue-400 flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Alert variant="info" title="Disclaimer:">
                  This calculator provides general guidelines. Individual needs vary based on health
                  conditions, medications, and other factors. Consult a healthcare provider for
                  personalized hydration advice.
                </Alert>

                {/* Share */}
                <div className="flex justify-center pt-4">
                  <ShareResults
                    result={`Daily water intake: ${formatMl(result.dailyIntakeMl)} (${formatOz(result.dailyIntakeOz)} / ${formatCups(result.dailyIntakeCups)}) - ${result.comparedToEightGlasses}% of "8 glasses a day"`}
                    calculatorName="Water Intake Calculator"
                  />
                </div>
              </>
            ) : (
              <Alert variant="info" title="Enter your weight">
                Enter your body weight to calculate your daily water intake recommendation.
              </Alert>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
