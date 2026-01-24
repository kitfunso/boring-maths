/**
 * Sleep Calculator - React Component
 *
 * Calculate optimal sleep and wake times based on 90-minute sleep cycles.
 */

import type { ChangeEvent } from 'react';
import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateSleepTimes, calculateNapTimes } from './calculations';
import {
  getDefaultInputs,
  AGE_SLEEP_NEEDS,
  type SleepInputs,
  type CalculationMode,
  type AgeGroup,
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
  Alert,
  Slider,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import PrintResults from '../../ui/PrintResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';

export default function SleepCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('Sleep Calculator');

  const [inputs, setInputs] = useLocalStorage<SleepInputs>('calc-sleep-inputs', getDefaultInputs);

  const result = useMemo(() => {
    return calculateSleepTimes(inputs);
  }, [inputs]);

  const napResults = useMemo(() => {
    if (inputs.mode === 'napTime') {
      // Use current time for nap calculation
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      return calculateNapTimes(currentTime);
    }
    return [];
  }, [inputs.mode]);

  const updateInput = <K extends keyof SleepInputs>(field: K, value: SleepInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const modeOptions = [
    { value: 'wakeTime' as const, label: 'I need to wake at...' },
    { value: 'bedTime' as const, label: "I'm going to bed at..." },
    { value: 'napTime' as const, label: 'Nap calculator' },
  ];

  const ageGroupOptions = [
    { value: 'teen' as const, label: 'Teen (13-17)' },
    { value: 'adult' as const, label: 'Adult (18-64)' },
    { value: 'senior' as const, label: 'Senior (65+)' },
  ];

  const getQualityStyles = (quality: 'optimal' | 'good' | 'fair') => {
    switch (quality) {
      case 'optimal':
        return 'bg-green-950/50 border-green-500/30 text-green-400';
      case 'good':
        return 'bg-yellow-950/50 border-yellow-500/30 text-yellow-400';
      case 'fair':
        return 'bg-white/5 border-white/10 text-[var(--color-muted)]';
    }
  };

  const getQualityLabel = (quality: 'optimal' | 'good' | 'fair') => {
    switch (quality) {
      case 'optimal':
        return 'Optimal';
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
    }
  };

  const getNapTypeStyles = (napType: 'power' | 'short' | 'full') => {
    switch (napType) {
      case 'power':
        return 'bg-green-950/50 border-green-500/30';
      case 'short':
        return 'bg-yellow-950/50 border-yellow-500/30';
      case 'full':
        return 'bg-blue-950/50 border-blue-500/30';
    }
  };

  const needs = AGE_SLEEP_NEEDS[inputs.ageGroup];

  // Generate share text based on mode
  const getShareText = () => {
    if (inputs.mode === 'napTime') {
      return 'Check out this Sleep Calculator with nap recommendations!';
    }
    const firstRec = result.recommendations[0];
    if (!firstRec) return 'Calculate your optimal sleep schedule!';
    if (inputs.mode === 'wakeTime') {
      return `To wake at ${inputs.wakeTime}, I should go to bed at ${firstRec.bedTime} for ${firstRec.sleepDuration} of sleep (${firstRec.cycles} cycles)`;
    }
    return `Going to bed at ${inputs.bedTime}, I should wake at ${firstRec.wakeTime} for ${firstRec.sleepDuration} of sleep (${firstRec.cycles} cycles)`;
  };

  // Generate print results
  const getPrintResults = () => {
    if (inputs.mode === 'napTime') {
      return napResults.map((nap) => ({
        label: `${nap.napType.charAt(0).toUpperCase() + nap.napType.slice(1)} Nap (${nap.napDuration})`,
        value: `Wake at ${nap.wakeTime}`,
      }));
    }
    return result.recommendations.map((rec) => ({
      label: `${rec.cycles} cycles (${rec.sleepDuration})`,
      value: inputs.mode === 'wakeTime' ? `Bed: ${rec.bedTime}` : `Wake: ${rec.wakeTime}`,
    }));
  };

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Sleep Calculator"
          subtitle="Optimize your sleep with 90-minute cycles"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Mode Selection */}
            <div>
              <Label>What would you like to calculate?</Label>
              <ButtonGroup
                options={modeOptions}
                value={inputs.mode}
                onChange={(value) => updateInput('mode', value as CalculationMode)}
                columns={3}
              />
            </div>

            {/* Time Input - Wake Time Mode */}
            {inputs.mode === 'wakeTime' && (
              <div>
                <Label htmlFor="wakeTime" required>
                  I need to wake up at
                </Label>
                <Input
                  id="wakeTime"
                  type="time"
                  value={inputs.wakeTime}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateInput('wakeTime', e.target.value)
                  }
                />
              </div>
            )}

            {/* Time Input - Bed Time Mode */}
            {inputs.mode === 'bedTime' && (
              <div>
                <Label htmlFor="bedTime" required>
                  I'm going to bed at
                </Label>
                <Input
                  id="bedTime"
                  type="time"
                  value={inputs.bedTime}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateInput('bedTime', e.target.value)
                  }
                />
              </div>
            )}

            {/* Age Group - Not shown for nap mode */}
            {inputs.mode !== 'napTime' && (
              <div>
                <Label>Age Group</Label>
                <ButtonGroup
                  options={ageGroupOptions}
                  value={inputs.ageGroup}
                  onChange={(value) => updateInput('ageGroup', value as AgeGroup)}
                  columns={3}
                />
              </div>
            )}

            {/* Fall Asleep Time - Not shown for nap mode */}
            {inputs.mode !== 'napTime' && (
              <Slider
                value={inputs.fallAsleepMinutes}
                onChange={(value) => updateInput('fallAsleepMinutes', value)}
                min={5}
                max={30}
                step={5}
                label="Time to fall asleep"
                showValue
                labels={{
                  min: '5 min',
                  max: '30 min',
                  current: (v) => `${v} minutes`,
                }}
              />
            )}
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Sleep Cycle Results */}
            {inputs.mode !== 'napTime' && (
              <>
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    {inputs.mode === 'wakeTime'
                      ? 'Recommended Bed Times'
                      : 'Recommended Wake Times'}
                  </h3>
                  <div className="space-y-3">
                    {result.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${getQualityStyles(rec.quality)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold tabular-nums">
                            {inputs.mode === 'wakeTime' ? rec.bedTime : rec.wakeTime}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                              rec.quality === 'optimal'
                                ? 'bg-green-500/20 text-green-400'
                                : rec.quality === 'good'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-white/10 text-[var(--color-muted)]'
                            }`}
                          >
                            {getQualityLabel(rec.quality)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[var(--color-muted)]">
                          <span>{rec.sleepDuration} of sleep</span>
                          <span>|</span>
                          <span>{rec.cycles} cycles</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Age-based recommendation */}
                <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                  <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                    <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                      Recommended Sleep
                    </p>
                    <p className="text-xl font-bold text-[var(--color-cream)] tabular-nums">
                      {result.optimalSleep}
                    </p>
                    <p className="text-xs text-[var(--color-muted)] mt-1">
                      for{' '}
                      {inputs.ageGroup === 'teen'
                        ? 'teens'
                        : inputs.ageGroup === 'adult'
                          ? 'adults'
                          : 'seniors'}
                    </p>
                  </div>
                  <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                    <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                      Sleep Cycle Length
                    </p>
                    <p className="text-xl font-bold text-[var(--color-cream)] tabular-nums">
                      {result.cycleLength} minutes
                    </p>
                    <p className="text-xs text-[var(--color-muted)] mt-1">average cycle duration</p>
                  </div>
                </Grid>
              </>
            )}

            {/* Nap Results */}
            {inputs.mode === 'napTime' && (
              <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Nap Options (starting now)
                </h3>
                <div className="space-y-3">
                  {napResults.map((nap, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${getNapTypeStyles(nap.napType)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-lg font-bold capitalize">{nap.napType} Nap</span>
                          <span className="ml-2 text-[var(--color-muted)]">
                            ({nap.napDuration})
                          </span>
                        </div>
                        <span className="text-xl font-bold tabular-nums">{nap.wakeTime}</span>
                      </div>
                      <p className="text-sm text-[var(--color-muted)]">{nap.benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tip of the Day */}
            <Alert variant="info" title="Sleep Tip">
              {result.tipOfTheDay}
            </Alert>

            {/* Share & Print Results */}
            <div className="flex justify-center gap-3 pt-4">
              <ShareResults result={getShareText()} calculatorName="Sleep Calculator" />
              <PrintResults title="Sleep Calculator Results" results={getPrintResults()} />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
