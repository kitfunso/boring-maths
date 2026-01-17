/**
 * Age Calculator - React Component
 *
 * Calculate age from birthdate with detailed breakdown.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateAge } from './calculations';
import { getDefaultInputs, type AgeCalculatorInputs, type AgeResult } from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Grid,
  Divider,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function AgeCalculator() {
  const [inputs, setInputs] = useState<AgeCalculatorInputs>(() => getDefaultInputs());

  const result: AgeResult = useMemo(() => {
    return calculateAge(inputs);
  }, [inputs]);

  const updateInput = <K extends keyof AgeCalculatorInputs>(
    field: K,
    value: AgeCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Format numbers with commas
  const formatNumber = (num: number): string => num.toLocaleString();

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        <CalculatorHeader
          title="Age Calculator"
          subtitle="Calculate your exact age and life statistics"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Birth Date */}
            <div>
              <Label htmlFor="birthDate" required>
                Date of Birth
              </Label>
              <input
                id="birthDate"
                type="date"
                value={inputs.birthDate}
                onChange={(e) => updateInput('birthDate', e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-night)] border border-white/10 rounded-xl
                         text-[var(--color-cream)] focus:border-[var(--color-accent)]
                         focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
              />
            </div>

            {/* Target Date (for calculating age at a specific date) */}
            <div>
              <Label htmlFor="targetDate">Calculate Age On (defaults to today)</Label>
              <input
                id="targetDate"
                type="date"
                value={inputs.targetDate}
                onChange={(e) => updateInput('targetDate', e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-night)] border border-white/10 rounded-xl
                         text-[var(--color-cream)] focus:border-[var(--color-accent)]
                         focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
              />
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Age Display */}
            <div
              className="bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5
                          rounded-2xl p-8 text-center border border-[var(--color-accent)]/30"
            >
              <div className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-4">
                Your Age
              </div>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <div>
                  <span className="text-5xl md:text-6xl font-bold text-[var(--color-cream)] tabular-nums">
                    {result.years}
                  </span>
                  <span className="text-lg text-[var(--color-muted)] ml-2">years</span>
                </div>
                <div>
                  <span className="text-5xl md:text-6xl font-bold text-[var(--color-cream)] tabular-nums">
                    {result.months}
                  </span>
                  <span className="text-lg text-[var(--color-muted)] ml-2">months</span>
                </div>
                <div>
                  <span className="text-5xl md:text-6xl font-bold text-[var(--color-cream)] tabular-nums">
                    {result.days}
                  </span>
                  <span className="text-lg text-[var(--color-muted)] ml-2">days</span>
                </div>
              </div>
            </div>

            {/* Birthday Info */}
            {result.daysUntilBirthday > 0 && (
              <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-2">
                  Next Birthday
                </p>
                <p className="text-xl font-semibold text-[var(--color-cream)] mb-1">
                  {result.nextBirthday}
                </p>
                <p className="text-[var(--color-accent)]">{result.daysUntilBirthday} days to go!</p>
              </div>
            )}

            {/* Life Statistics */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Life Statistics
              </h3>
              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <MetricCard
                  label="Total Days"
                  value={formatNumber(result.totalDays)}
                  sublabel="days lived"
                />
                <MetricCard
                  label="Total Weeks"
                  value={formatNumber(result.totalWeeks)}
                  sublabel="weeks lived"
                />
                <MetricCard
                  label="Total Months"
                  value={formatNumber(result.totalMonths)}
                  sublabel="months lived"
                />
                <MetricCard
                  label="Total Hours"
                  value={formatNumber(result.totalHours)}
                  sublabel="hours lived"
                />
              </Grid>
            </div>

            {/* Birth Info */}
            <Grid responsive={{ sm: 1, md: 3 }} gap="md">
              <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                  Born on
                </p>
                <p className="text-xl font-bold text-[var(--color-cream)]">
                  {result.dayOfWeekBorn}
                </p>
              </div>
              <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                  Zodiac Sign
                </p>
                <p className="text-xl font-bold text-[var(--color-cream)]">{result.zodiacSign}</p>
              </div>
              <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                  Chinese Zodiac
                </p>
                <p className="text-xl font-bold text-[var(--color-cream)]">
                  {result.chineseZodiac}
                </p>
              </div>
            </Grid>

            <Alert variant="info" title="Fun fact:">
              You were born on a {result.dayOfWeekBorn}! People born on {result.dayOfWeekBorn}s are
              said to be {result.dayOfWeekBorn === 'Monday' && 'fair of face'}
              {result.dayOfWeekBorn === 'Tuesday' && 'full of grace'}
              {result.dayOfWeekBorn === 'Wednesday' && 'full of woe'}
              {result.dayOfWeekBorn === 'Thursday' && 'far to go'}
              {result.dayOfWeekBorn === 'Friday' && 'loving and giving'}
              {result.dayOfWeekBorn === 'Saturday' && 'work hard for a living'}
              {result.dayOfWeekBorn === 'Sunday' && 'bonny, blithe, good, and gay'} according to the
              old nursery rhyme.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`I'm ${result.years} years, ${result.months} months, and ${result.days} days old! Born on a ${result.dayOfWeekBorn}, ${result.zodiacSign} ♈`}
                calculatorName="Age Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
