/**
 * Dog Age Calculator - React Component
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateDogAge, formatAge } from './calculations';
import { getDefaultInputs, DOG_SIZES, type DogAgeInputs } from './types';
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
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
export default function DogAgeCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('Dog Age Calculator');

  const [inputs, setInputs] = useState<DogAgeInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculateDogAge(inputs), [inputs]);

  const updateInput = <K extends keyof DogAgeInputs>(field: K, value: DogAgeInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const getStageColor = () => {
    switch (result.lifeStage) {
      case 'Puppy':
        return 'text-pink-400';
      case 'Adolescent':
        return 'text-blue-400';
      case 'Adult':
        return 'text-green-400';
      case 'Mature':
        return 'text-amber-400';
      case 'Senior':
        return 'text-purple-400';
      default:
        return 'text-[var(--color-cream)]';
    }
  };

  const getStageEmoji = () => {
    switch (result.lifeStage) {
      case 'Puppy':
        return '🐶';
      case 'Adolescent':
        return '🐕';
      case 'Adult':
        return '🦮';
      case 'Mature':
        return '🐕‍🦺';
      case 'Senior':
        return '🐾';
      default:
        return '🐶';
    }
  };

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        <CalculatorHeader title="Dog Age Calculator" subtitle="Convert dog years to human years" />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Dog Size */}
            <div>
              <Label>Dog Size</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DOG_SIZES.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => updateInput('size', size.value)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      inputs.size === size.value
                        ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/50 text-[var(--color-cream)]'
                        : 'bg-[var(--color-night)] border-white/10 text-[var(--color-subtle)] hover:border-white/20'
                    }`}
                  >
                    <div className="font-medium">{size.label}</div>
                    <div className="text-xs opacity-75">{size.weight}</div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-[var(--color-muted)] mt-2">
                {DOG_SIZES.find((s) => s.value === inputs.size)?.examples}
              </p>
            </div>

            {/* Dog Age */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div>
                <Label htmlFor="dogYears" required>
                  Years
                </Label>
                <Input
                  id="dogYears"
                  type="number"
                  min={0}
                  max={25}
                  value={inputs.dogYears}
                  onChange={(e) => updateInput('dogYears', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="dogMonths">Months</Label>
                <Input
                  id="dogMonths"
                  type="number"
                  min={0}
                  max={11}
                  value={inputs.dogMonths}
                  onChange={(e) => updateInput('dogMonths', Number(e.target.value))}
                />
              </div>
            </Grid>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Result */}
            <div className="text-center">
              <div className="text-6xl mb-4">{getStageEmoji()}</div>
              <ResultCard
                label="Human Age Equivalent"
                value={`${result.humanYears} years old`}
                subtitle={`Your dog is ${formatAge(inputs.dogYears, inputs.dogMonths)} old`}
                footer={
                  <>
                    Life stage:{' '}
                    <span className={`font-semibold ${getStageColor()}`}>{result.lifeStage}</span>
                    {' - '}
                    {result.stageDescription}
                  </>
                }
              />
            </div>

            {/* Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Dog Age"
                value={formatAge(inputs.dogYears, inputs.dogMonths)}
                sublabel="actual age"
              />
              <MetricCard
                label="Human Years"
                value={`${result.humanYears}`}
                sublabel="equivalent"
                valueColor="text-[var(--color-accent)]"
              />
              <MetricCard
                label="Avg. Lifespan"
                value={`${result.averageLifespan.min}-${result.averageLifespan.max}`}
                sublabel={`years for ${inputs.size}`}
              />
              <MetricCard
                label="Est. Remaining"
                value={
                  result.remainingYears.max > 0
                    ? `${result.remainingYears.min}-${result.remainingYears.max}`
                    : '—'
                }
                sublabel="years"
                valueColor={
                  result.remainingYears.max > 0 ? 'text-green-400' : 'text-[var(--color-muted)]'
                }
              />
            </Grid>

            {/* Life Stage Visualization */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Life Stage Progress
              </h3>
              <div className="relative">
                <div className="flex justify-between mb-2 text-xs text-[var(--color-muted)]">
                  <span>Puppy</span>
                  <span>Adult</span>
                  <span>Senior</span>
                </div>
                <div className="h-4 bg-[var(--color-void)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 via-green-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (result.humanYears / 100) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-[var(--color-muted)]">
                  <span>0</span>
                  <span>50</span>
                  <span>100+ human years</span>
                </div>
              </div>
            </div>

            {/* Health Tips */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Health Tips for {result.lifeStage} Dogs
              </h3>
              <ul className="space-y-3">
                {result.healthTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-[var(--color-subtle)]">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Alert variant="info" title="About this calculation:">
              Dogs age faster in their early years and at different rates based on size. This
              calculator uses research-based formulas, not the outdated "7 years" myth. Giant breeds
              age faster than small breeds after maturity. Individual dogs vary based on genetics,
              health, and care.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`My ${formatAge(inputs.dogYears, inputs.dogMonths)} old ${inputs.size} dog is ${result.humanYears} in human years! Life stage: ${result.lifeStage}`}
                calculatorName="Dog Age Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
