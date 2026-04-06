/**
 * Pace Calculator - Preact Component
 *
 * Interactive calculator for running/walking pace, time, and distance.
 * Three modes: Calculate Pace, Calculate Time, Calculate Distance.
 */
import { calculatePace } from './calculations';
import {
  getDefaultInputs,
  MODE_OPTIONS,
  type PaceCalculatorInputs,
  type PaceMode,
  type DistanceUnit,
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
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import PrintResults from '../../ui/PrintResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';

export default function PaceCalculator() {
  const { inputs, result, updateInput } = useCalculatorBase<PaceCalculatorInputs, ReturnType<typeof calculatePace>>({
    name: 'Pace Calculator',
    slug: 'calc-pace-inputs',
    defaults: getDefaultInputs,
    compute: calculatePace,
  });

  const unitLabel = inputs.distanceUnit === 'km' ? 'km' : 'mi';

  return (
    <ThemeProvider defaultColor="coral">
      <Card variant="elevated">
        <CalculatorHeader
          title="Pace Calculator"
          subtitle="Calculate your running or walking pace, time, or distance"
        />

        <div className="p-6 md:p-8">
          {/* Mode Selection */}
          <div className="mb-8">
            <Label>Calculation Mode</Label>
            <ButtonGroup
              options={MODE_OPTIONS}
              value={inputs.mode}
              onChange={(value) => updateInput('mode', value as PaceMode)}
              columns={3}
              aria-label="Calculation mode"
            />
          </div>

          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Distance Unit Toggle */}
            <div>
              <Label>Distance Unit</Label>
              <ButtonGroup
                options={[
                  { value: 'km', label: 'Kilometres' },
                  { value: 'miles', label: 'Miles' },
                ]}
                value={inputs.distanceUnit}
                onChange={(value) => updateInput('distanceUnit', value as DistanceUnit)}
                columns={2}
                size="sm"
                aria-label="Distance unit"
              />
            </div>

            {/* Distance Input - shown for pace and time modes */}
            {inputs.mode !== 'distance' && (
              <div>
                <Label htmlFor="distance" required>
                  Distance ({unitLabel})
                </Label>
                <Input
                  id="distance"
                  type="number"
                  min={0}
                  step={0.01}
                  value={inputs.distance}
                  onChange={(e) => updateInput('distance', Number(e.target.value))}
                />
              </div>
            )}

            {/* Time Input - shown for pace and distance modes */}
            {inputs.mode !== 'time' && (
              <div>
                <Label required>Time</Label>
                <Grid responsive={{ sm: 3 }} gap="md">
                  <div>
                    <label htmlFor="hours" className="text-xs text-[var(--color-muted)] mb-1 block">
                      Hours
                    </label>
                    <Input
                      id="hours"
                      type="number"
                      min={0}
                      max={99}
                      step={1}
                      value={inputs.hours}
                      onChange={(e) =>
                        updateInput('hours', Math.max(0, Math.floor(Number(e.target.value))))
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="minutes"
                      className="text-xs text-[var(--color-muted)] mb-1 block"
                    >
                      Minutes
                    </label>
                    <Input
                      id="minutes"
                      type="number"
                      min={0}
                      max={59}
                      step={1}
                      value={inputs.minutes}
                      onChange={(e) =>
                        updateInput(
                          'minutes',
                          Math.max(0, Math.min(59, Math.floor(Number(e.target.value))))
                        )
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="seconds"
                      className="text-xs text-[var(--color-muted)] mb-1 block"
                    >
                      Seconds
                    </label>
                    <Input
                      id="seconds"
                      type="number"
                      min={0}
                      max={59}
                      step={1}
                      value={inputs.seconds}
                      onChange={(e) =>
                        updateInput(
                          'seconds',
                          Math.max(0, Math.min(59, Math.floor(Number(e.target.value))))
                        )
                      }
                    />
                  </div>
                </Grid>
              </div>
            )}

            {/* Pace Input - shown for time and distance modes */}
            {inputs.mode !== 'pace' && (
              <div>
                <Label required>Pace (per {unitLabel})</Label>
                <Grid responsive={{ sm: 2 }} gap="md">
                  <div>
                    <label
                      htmlFor="paceMinutes"
                      className="text-xs text-[var(--color-muted)] mb-1 block"
                    >
                      Minutes
                    </label>
                    <Input
                      id="paceMinutes"
                      type="number"
                      min={0}
                      max={59}
                      step={1}
                      value={inputs.paceMinutes}
                      onChange={(e) =>
                        updateInput('paceMinutes', Math.max(0, Math.floor(Number(e.target.value))))
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="paceSeconds"
                      className="text-xs text-[var(--color-muted)] mb-1 block"
                    >
                      Seconds
                    </label>
                    <Input
                      id="paceSeconds"
                      type="number"
                      min={0}
                      max={59}
                      step={1}
                      value={inputs.paceSeconds}
                      onChange={(e) =>
                        updateInput(
                          'paceSeconds',
                          Math.max(0, Math.min(59, Math.floor(Number(e.target.value))))
                        )
                      }
                    />
                  </div>
                </Grid>
              </div>
            )}
          </div>

          <Divider />

          {/* Results Section */}
          {result.valid && (
            <div className="space-y-6">
              {/* Primary Result */}
              {inputs.mode === 'pace' && (
                <ResultCard
                  label="Your Pace"
                  value={`${result.pacePerKm} /km`}
                  subtitle={`${result.pacePerMile} /mile`}
                />
              )}
              {inputs.mode === 'time' && (
                <ResultCard
                  label="Total Time"
                  value={result.totalTime}
                  subtitle={`For ${result.totalDistance} ${result.totalDistanceUnit}`}
                />
              )}
              {inputs.mode === 'distance' && (
                <ResultCard
                  label="Distance Covered"
                  value={`${result.totalDistance} ${result.totalDistanceUnit}`}
                  subtitle={`In ${result.totalTime}`}
                />
              )}

              {/* Speed & Pace Metrics */}
              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <MetricCard label="Pace" value={`${result.pacePerKm}`} sublabel="per km" />
                <MetricCard label="Pace" value={`${result.pacePerMile}`} sublabel="per mile" />
                <MetricCard label="Speed" value={`${result.speedKmh}`} sublabel="km/h" />
                <MetricCard label="Speed" value={`${result.speedMph}`} sublabel="mph" />
              </Grid>

              {/* Split Times Table */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Split Times
                </h3>
                <div className="overflow-x-auto">
                  <table
                    className="w-full text-sm"
                    aria-label="Split times for common race distances"
                  >
                    <thead>
                      <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider">
                        <th scope="col" className="text-left py-2">
                          Distance
                        </th>
                        <th scope="col" className="text-right py-2">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {result.splits.map((split) => (
                        <tr key={split.label} className="hover:bg-white/5 transition-colors">
                          <td className="py-2 text-[var(--color-cream)]">{split.label}</td>
                          <td className="text-right py-2 tabular-nums text-[var(--color-cream)]">
                            {split.time}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tips */}
              <Alert variant="tip" title="Training tip:">
                A general guideline is that most easy runs should be 60-90 seconds per km slower
                than your race pace. Long runs build endurance, while interval training improves
                speed.
              </Alert>

              {/* Share & Print */}
              <div className="flex justify-center gap-3 pt-4">
                <ShareResults
                  result={`Pace: ${result.pacePerKm}/km (${result.pacePerMile}/mile) - Speed: ${result.speedKmh} km/h`}
                  calculatorName="Pace Calculator"
                />
                <PrintResults
                  title="Pace Calculator Results"
                  results={[
                    { label: 'Pace (per km)', value: result.pacePerKm },
                    { label: 'Pace (per mile)', value: result.pacePerMile },
                    { label: 'Speed (km/h)', value: result.speedKmh },
                    { label: 'Speed (mph)', value: result.speedMph },
                    { label: 'Total Time', value: result.totalTime },
                    {
                      label: 'Distance',
                      value: `${result.totalDistance} ${result.totalDistanceUnit}`,
                    },
                    ...result.splits.map((s) => ({
                      label: `Split: ${s.label}`,
                      value: s.time,
                    })),
                  ]}
                />
              </div>
            </div>
          )}

          {/* Empty State */}
          {!result.valid && (
            <div className="text-center py-12 text-[var(--color-muted)]">
              <p className="text-lg">Enter values above to calculate your pace</p>
            </div>
          )}
        </div>
      </Card>
    </ThemeProvider>
  );
}
