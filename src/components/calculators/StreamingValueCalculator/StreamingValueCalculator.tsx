/**
 * Streaming Value Calculator - React Component
 */

import { useCallback } from 'preact/hooks';
import {
  calculateStreamingValue,
  formatDollars,
  formatCostPerHour,
} from './calculations';
import { getDefaultInputs, type StreamingValueInputs, type StreamingService } from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Slider,
  Checkbox,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

const VALUE_COLORS: Record<string, string> = {
  great: 'bg-green-500',
  good: 'bg-emerald-400',
  fair: 'bg-amber-400',
  poor: 'bg-red-500',
};

const VALUE_TEXT_COLORS: Record<string, string> = {
  great: 'text-green-400',
  good: 'text-emerald-400',
  fair: 'text-amber-400',
  poor: 'text-red-400',
};

const VALUE_LABELS: Record<string, string> = {
  great: 'Great Value',
  good: 'Good Value',
  fair: 'Fair Value',
  poor: 'Poor Value',
};

export default function StreamingValueCalculator() {
  const { inputs, result, setInputs } = useCalculatorState<
    StreamingValueInputs,
    ReturnType<typeof calculateStreamingValue>
  >({
    name: 'Streaming Value Calculator',
    defaults: getDefaultInputs,
    compute: calculateStreamingValue,
  });

  const toggleService = useCallback(
    (index: number) => {
      setInputs((prev) => ({
        ...prev,
        subscriptions: prev.subscriptions.map((s, i) =>
          i === index ? { ...s, enabled: !s.enabled } : s
        ),
      }));
    },
    [setInputs]
  );

  const updateHours = useCallback(
    (index: number, hours: number) => {
      setInputs((prev) => ({
        ...prev,
        subscriptions: prev.subscriptions.map((s, i) =>
          i === index ? { ...s, hoursWatchedPerMonth: hours } : s
        ),
      }));
    },
    [setInputs]
  );

  const enabledCount = inputs.subscriptions.filter((s) => s.enabled).length;

  // Find max cost per hour for bar scaling (cap at 10 for visual clarity)
  const maxCostPerHour = Math.min(
    10,
    Math.max(...result.perServiceMetrics.map((m) => m.costPerHour), 1)
  );

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        <CalculatorHeader
          title="Streaming Value Calculator"
          subtitle="Find which subscriptions give you the most bang for your buck"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Subscription Toggles */}
            <div>
              <Label>Select your subscriptions</Label>
              <div className="space-y-3 mt-2">
                {inputs.subscriptions.map((service: StreamingService, index: number) => (
                  <div
                    key={service.name}
                    className={`rounded-xl border transition-all ${
                      service.enabled
                        ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30'
                        : 'bg-[var(--color-night)] border-white/10'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <Checkbox
                          label={service.name}
                          checked={service.enabled}
                          onChange={() => toggleService(index)}
                        />
                        <span className="text-sm font-medium text-[var(--color-subtle)]">
                          {formatDollars(service.monthlyPrice)}/mo
                        </span>
                      </div>

                      {service.enabled && (
                        <div className="mt-3 pl-7">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-[var(--color-muted)]">
                              Hours watched per month
                            </span>
                            <span className="text-sm font-medium text-[var(--color-cream)]">
                              {service.hoursWatchedPerMonth}h
                            </span>
                          </div>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={service.hoursWatchedPerMonth}
                            onChange={(value) => updateHours(index, value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {enabledCount > 0 ? (
              <>
                {/* Big Total */}
                <ResultCard
                  label="Total Monthly Cost"
                  value={formatDollars(result.totalMonthlyCost)}
                  subtitle={`${formatDollars(result.totalYearlyCost)} per year across ${enabledCount} service${enabledCount !== 1 ? 's' : ''}`}
                />

                {/* Summary Metrics */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Monthly"
                    value={formatDollars(result.totalMonthlyCost)}
                    sublabel="total cost"
                  />
                  <MetricCard
                    label="Yearly"
                    value={formatDollars(result.totalYearlyCost)}
                    sublabel="total cost"
                    valueColor="text-[var(--color-accent)]"
                  />
                  <MetricCard
                    label="Best Value"
                    value={result.bestValue || '--'}
                    sublabel="lowest $/hr"
                    valueColor="text-green-400"
                  />
                  <MetricCard
                    label="Worst Value"
                    value={result.worstValue || '--'}
                    sublabel="highest $/hr"
                    valueColor="text-red-400"
                  />
                </Grid>

                {/* Value Ranking Bars */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Value Ranking (Cost Per Hour)
                  </h3>
                  <div className="space-y-3">
                    {result.perServiceMetrics.map((metric) => {
                      const barWidth = Math.min(
                        100,
                        (metric.costPerHour / maxCostPerHour) * 100
                      );
                      return (
                        <div key={metric.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[var(--color-cream)]">
                              {metric.name}
                            </span>
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-xs font-medium ${VALUE_TEXT_COLORS[metric.valueRating]}`}
                              >
                                {VALUE_LABELS[metric.valueRating]}
                              </span>
                              <span className="text-sm font-bold text-[var(--color-cream)] w-20 text-right">
                                {formatCostPerHour(metric.costPerHour)}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${VALUE_COLORS[metric.valueRating]}`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-0.5">
                            <span className="text-xs text-[var(--color-muted)]">
                              {formatDollars(metric.monthlyPrice)}/mo
                            </span>
                            <span className="text-xs text-[var(--color-muted)]">
                              {metric.hoursWatched}h watched
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recommended Cut */}
                {result.recommendedCut && (
                  <Alert variant="tip" title="Money-saving tip:">
                    Consider dropping <strong>{result.recommendedCut}</strong> -- it has the
                    worst cost-per-hour ratio among your subscriptions. That saves you{' '}
                    <strong>
                      {formatDollars(
                        result.perServiceMetrics.find((m) => m.name === result.recommendedCut)
                          ?.monthlyPrice ?? 0
                      )}
                      /month
                    </strong>{' '}
                    (
                    {formatDollars(
                      (result.perServiceMetrics.find((m) => m.name === result.recommendedCut)
                        ?.monthlyPrice ?? 0) * 12
                    )}
                    /year).
                  </Alert>
                )}
              </>
            ) : (
              <Alert variant="info" title="Select a service">
                Toggle on the streaming services you subscribe to and adjust the hours you watch
                each month.
              </Alert>
            )}

            {/* Share Results */}
            {enabledCount > 0 && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Streaming: ${formatDollars(result.totalMonthlyCost)}/mo (${formatDollars(result.totalYearlyCost)}/yr). Best value: ${result.bestValue}. Worst value: ${result.worstValue}.`}
                  calculatorName="Streaming Value Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
