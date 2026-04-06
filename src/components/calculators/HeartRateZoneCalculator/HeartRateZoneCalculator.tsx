/**
 * Heart Rate Zone Calculator - React Component
 */

import { calculateHeartRateZones } from './calculations';
import {
  getDefaultInputs,
  METHOD_OPTIONS,
  type HeartRateZoneInputs,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  ButtonGroup,
  Checkbox,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

const ZONE_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-orange-500',
  'bg-red-500',
] as const;

const ZONE_TEXT_COLORS = [
  'text-blue-400',
  'text-green-400',
  'text-yellow-400',
  'text-orange-400',
  'text-red-400',
] as const;

const ZONE_BORDER_COLORS = [
  'border-blue-500/30',
  'border-green-500/30',
  'border-yellow-500/30',
  'border-orange-500/30',
  'border-red-500/30',
] as const;

const GOAL_LABELS: Record<string, { label: string; description: string }> = {
  recovery: { label: 'Recovery', description: 'Post-workout recovery and active rest days' },
  weightLoss: { label: 'Weight Loss', description: 'Optimal fat burning during longer sessions' },
  endurance: { label: 'Endurance', description: 'Building cardiovascular fitness and stamina' },
  performance: { label: 'Performance', description: 'High-intensity interval training and racing' },
};

export default function HeartRateZoneCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorState<
    HeartRateZoneInputs,
    ReturnType<typeof calculateHeartRateZones>
  >({
    name: 'Heart Rate Zone Calculator',
    defaults: getDefaultInputs,
    compute: calculateHeartRateZones,
  });

  const handleReset = () => {
    setInputs(getDefaultInputs());
  };

  // Width of zone bar relative to max (zone 5 = 100%)
  const maxBPM = result.zones.length > 0 ? result.zones[result.zones.length - 1].maxBPM : 200;

  return (
    <ThemeProvider defaultColor="red">
      <Card variant="elevated">
        <CalculatorHeader
          title="Heart Rate Zone Calculator"
          subtitle="Find your training zones for any fitness goal"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Age */}
            <div>
              <Label htmlFor="age" required>
                Age
              </Label>
              <Input
                id="age"
                type="number"
                min={1}
                max={120}
                step={1}
                value={inputs.age}
                onChange={(e) => updateInput('age', Number(e.target.value))}
              />
            </div>

            {/* Resting Heart Rate */}
            <div>
              <Label htmlFor="restingHeartRate">
                Resting Heart Rate (BPM)
              </Label>
              <Input
                id="restingHeartRate"
                type="number"
                min={30}
                max={120}
                step={1}
                value={inputs.restingHeartRate}
                onChange={(e) => updateInput('restingHeartRate', Number(e.target.value))}
              />
              <p className="mt-1.5 text-xs text-[var(--color-muted)]">
                Measure first thing in the morning before getting out of bed.
              </p>
            </div>

            {/* Custom Max HR Toggle */}
            <div>
              <Checkbox
                label="I know my max heart rate"
                checked={inputs.useCustomMaxHR}
                onChange={(checked) => updateInput('useCustomMaxHR', checked)}
              />
              {inputs.useCustomMaxHR && (
                <div className="mt-3">
                  <Label htmlFor="maxHeartRate">
                    Max Heart Rate (BPM)
                  </Label>
                  <Input
                    id="maxHeartRate"
                    type="number"
                    min={100}
                    max={240}
                    step={1}
                    value={inputs.maxHeartRate}
                    onChange={(e) => updateInput('maxHeartRate', Number(e.target.value))}
                  />
                </div>
              )}
              {!inputs.useCustomMaxHR && (
                <p className="mt-1.5 text-xs text-[var(--color-muted)]">
                  Estimated using 220 - age = {220 - inputs.age} BPM
                </p>
              )}
            </div>

            {/* Method Toggle */}
            <div>
              <Label>Calculation Method</Label>
              <ButtonGroup
                options={METHOD_OPTIONS as unknown as { value: string; label: string }[]}
                value={inputs.method}
                onChange={(v) => updateInput('method', v as HeartRateZoneInputs['method'])}
                columns={2}
                aria-label="Calculation method"
              />
              <p className="mt-1.5 text-xs text-[var(--color-muted)]">
                {inputs.method === 'karvonen'
                  ? 'Karvonen uses heart rate reserve (maxHR - restingHR) for more personalized zones.'
                  : 'Percentage method applies zone percentages directly to your max heart rate.'}
              </p>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {inputs.age > 0 ? (
              <>
                {/* Max HR */}
                <ResultCard
                  label="Estimated Max Heart Rate"
                  value={`${result.maxHR} BPM`}
                  subtitle={
                    inputs.useCustomMaxHR
                      ? 'Using your measured max heart rate'
                      : `Calculated as 220 - ${inputs.age}`
                  }
                />

                {/* Summary Metrics */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Max HR"
                    value={`${result.maxHR}`}
                    sublabel="BPM"
                  />
                  <MetricCard
                    label="Resting HR"
                    value={`${inputs.restingHeartRate}`}
                    sublabel="BPM"
                  />
                  <MetricCard
                    label="HR Reserve"
                    value={`${result.maxHR - inputs.restingHeartRate}`}
                    sublabel="BPM"
                    valueColor="text-[var(--color-accent)]"
                  />
                  <MetricCard
                    label="Method"
                    value={inputs.method === 'karvonen' ? 'Karvonen' : 'Max HR %'}
                    sublabel="formula"
                  />
                </Grid>

                {/* Zone Bars */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-5">
                    Your Training Zones
                  </h3>
                  <div className="space-y-4">
                    {result.zones.map((zone, i) => {
                      const widthPct = maxBPM > 0 ? (zone.maxBPM / maxBPM) * 100 : 0;
                      return (
                        <div key={zone.zone} className={`rounded-xl border p-4 ${ZONE_BORDER_COLORS[i]}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-white ${ZONE_COLORS[i]}`}
                              >
                                {zone.zone}
                              </span>
                              <div>
                                <span className={`font-semibold ${ZONE_TEXT_COLORS[i]}`}>
                                  {zone.name}
                                </span>
                                <span className="text-xs text-[var(--color-muted)] ml-2">
                                  {zone.minPercent}-{zone.maxPercent}%
                                </span>
                              </div>
                            </div>
                            <span className="text-lg font-bold text-[var(--color-cream)]">
                              {zone.minBPM}-{zone.maxBPM} BPM
                            </span>
                          </div>
                          {/* Bar */}
                          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${ZONE_COLORS[i]} opacity-60`}
                              style={{ width: `${Math.min(widthPct, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-[var(--color-muted)] mt-2">
                            {zone.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Goal Recommendations */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Zone by Fitness Goal
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(result.targetZoneForGoal).map(([goal, zoneNum]) => {
                      const goalInfo = GOAL_LABELS[goal];
                      const zone = result.zones[zoneNum - 1];
                      if (!goalInfo || !zone) return null;
                      return (
                        <div
                          key={goal}
                          className={`rounded-xl border p-4 ${ZONE_BORDER_COLORS[zoneNum - 1]}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold text-white ${ZONE_COLORS[zoneNum - 1]}`}
                            >
                              {zoneNum}
                            </span>
                            <span className="font-medium text-[var(--color-cream)]">
                              {goalInfo.label}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--color-muted)] mb-1">
                            {goalInfo.description}
                          </p>
                          <p className={`text-sm font-semibold ${ZONE_TEXT_COLORS[zoneNum - 1]}`}>
                            {zone.minBPM}-{zone.maxBPM} BPM
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Alert variant="tip" title="Training tip:">
                  Most training should happen in Zones 1-3. Limit Zone 4-5 work to 1-2 sessions
                  per week and allow adequate recovery between high-intensity efforts.
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Enter your age">
                Enter your age to calculate personalized heart rate training zones.
              </Alert>
            )}

            {/* Share */}
            {inputs.age > 0 && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Max HR: ${result.maxHR} BPM | Zone 1: ${result.zones[0]?.minBPM}-${result.zones[0]?.maxBPM} | Zone 2: ${result.zones[1]?.minBPM}-${result.zones[1]?.maxBPM} | Zone 3: ${result.zones[2]?.minBPM}-${result.zones[2]?.maxBPM} | Zone 4: ${result.zones[3]?.minBPM}-${result.zones[3]?.maxBPM} | Zone 5: ${result.zones[4]?.minBPM}-${result.zones[4]?.maxBPM}`}
                  calculatorName="Heart Rate Zone Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
