/**
 * Screen Time Calculator - React Component
 */

import { useMemo } from 'preact/hooks';
import { calculateScreenTime, formatNumber, getAgeGroupAverage } from './calculations';
import { getDefaultInputs, AGE_GROUPS, type ScreenTimeInputs, type CategoryName } from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  ButtonGroup,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

const CATEGORY_COLORS: Record<CategoryName, string> = {
  'Social Media': 'bg-purple-500',
  Video: 'bg-blue-500',
  Games: 'bg-rose-500',
  Productive: 'bg-emerald-500',
  Other: 'bg-amber-500',
};

const CATEGORY_ICONS: Record<CategoryName, string> = {
  'Social Media':
    'M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zm-3 14H9v-2h6v2zm0-4H9v-2h6v2zm0-4H9V6h6v2z',
  Video:
    'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  Games:
    'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  Productive: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  Other:
    'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
};

const OPPORTUNITY_ICONS: Record<string, string> = {
  book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  language:
    'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
  marathon: 'M13 10V3L4 14h7v7l9-11h-7z',
  instrument:
    'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
  course:
    'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5',
  novel:
    'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
};

function SvgIcon({ path, className = '' }: { path: string; className?: string }) {
  return (
    <svg
      className={`w-5 h-5 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export default function ScreenTimeCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorState<
    ScreenTimeInputs,
    ReturnType<typeof calculateScreenTime>
  >({
    name: 'Screen Time Calculator',
    defaults: getDefaultInputs,
    compute: calculateScreenTime,
  });

  const average = useMemo(() => getAgeGroupAverage(inputs.ageGroup), [inputs.ageGroup]);

  const updateCategoryHours = (index: number, hours: number) => {
    const newCategories = inputs.categories.map((c, i) => (i === index ? { ...c, hours } : c));
    const newTotal = newCategories.reduce((sum, c) => sum + c.hours, 0);
    setInputs((prev) => ({
      ...prev,
      categories: newCategories,
      dailyHours: Math.round(newTotal * 10) / 10,
    }));
  };

  const comparisonLabel =
    result.comparedToAverage > 0
      ? `${Math.abs(result.comparedToAverage)}% above average`
      : result.comparedToAverage < 0
        ? `${Math.abs(result.comparedToAverage)}% below average`
        : 'Right at average';

  const comparisonColor =
    result.comparedToAverage > 20
      ? 'text-rose-400'
      : result.comparedToAverage < -10
        ? 'text-emerald-400'
        : 'text-amber-400';

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        <CalculatorHeader
          title="Screen Time Calculator"
          subtitle="See where your screen time goes"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Age Group */}
            <div>
              <Label>Age Group</Label>
              <ButtonGroup
                options={AGE_GROUPS.map((g) => ({ value: g.value, label: g.label }))}
                value={inputs.ageGroup}
                onChange={(v) => updateInput('ageGroup', v as ScreenTimeInputs['ageGroup'])}
              />
            </div>

            {/* Category Sliders */}
            <div>
              <Label>Daily Screen Time by Category</Label>
              <div className="space-y-4 mt-3">
                {inputs.categories.map((category, index) => (
                  <div
                    key={category.name}
                    className="bg-[var(--color-night)] rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-8 h-8 rounded-lg ${CATEGORY_COLORS[category.name]} flex items-center justify-center`}
                      >
                        <SvgIcon
                          path={CATEGORY_ICONS[category.name]}
                          className="text-white w-4 h-4"
                        />
                      </div>
                      <span className="text-sm font-medium text-[var(--color-cream)] flex-1">
                        {category.name}
                      </span>
                      <span className="text-sm font-semibold text-[var(--color-accent)]">
                        {category.hours}h
                      </span>
                    </div>
                    <Slider
                      value={category.hours}
                      onChange={(v) => updateCategoryHours(index, v)}
                      min={0}
                      max={12}
                      step={0.5}
                      aria-label={`${category.name} hours per day`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center">
                <span className="text-lg font-bold text-[var(--color-cream)]">
                  Total: {inputs.dailyHours}h / day
                </span>
              </div>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {inputs.dailyHours > 0 ? (
              <>
                {/* Big Yearly Reveal */}
                <ResultCard
                  label="Your Yearly Screen Time"
                  value={`${formatNumber(result.yearlyDays)} days`}
                  subtitle={`${formatNumber(result.yearlyHours)} hours per year spent on screens`}
                  footer={
                    <>
                      That&apos;s{' '}
                      <span className="font-semibold text-[var(--color-accent)]">
                        {formatNumber(result.lifetimeYears)} years
                      </span>{' '}
                      of your remaining lifetime
                    </>
                  }
                />

                {/* Time Metrics */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Weekly"
                    value={`${formatNumber(result.weeklyHours)}h`}
                    sublabel="per week"
                  />
                  <MetricCard
                    label="Monthly"
                    value={`${formatNumber(result.monthlyHours)}h`}
                    sublabel="per month"
                  />
                  <MetricCard
                    label="Yearly"
                    value={`${formatNumber(result.yearlyHours)}h`}
                    sublabel="per year"
                    valueColor="text-[var(--color-accent)]"
                  />
                  <MetricCard
                    label="Lifetime"
                    value={`${formatNumber(result.lifetimeYears)}y`}
                    sublabel="projected"
                    valueColor="text-rose-400"
                  />
                </Grid>

                {/* Age Group Comparison */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Compared to Average ({average}h/day for {inputs.ageGroup}s)
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-4 bg-[var(--color-void)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (inputs.dailyHours / Math.max(average * 2, inputs.dailyHours * 1.2)) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-[var(--color-muted)]">
                        <span>0h</span>
                        <span className="text-[var(--color-subtle)]">Avg: {average}h</span>
                        <span>
                          {Math.max(Math.ceil(average * 2), Math.ceil(inputs.dailyHours * 1.2))}h
                        </span>
                      </div>
                    </div>
                    <div className={`text-right min-w-[100px] ${comparisonColor}`}>
                      <div className="text-lg font-bold">{comparisonLabel}</div>
                    </div>
                  </div>
                </div>

                {/* Category Breakdown (pie-like) */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Category Breakdown
                  </h3>
                  {/* Horizontal stacked bar */}
                  <div className="h-8 rounded-full overflow-hidden flex mb-4">
                    {result.categoryBreakdown
                      .filter((c) => c.percent > 0)
                      .map((c) => (
                        <div
                          key={c.name}
                          className={`${CATEGORY_COLORS[c.name]} transition-all duration-500`}
                          style={{ width: `${c.percent}%` }}
                          title={`${c.name}: ${c.percent}%`}
                        />
                      ))}
                  </div>
                  {/* Legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {result.categoryBreakdown.map((c) => (
                      <div key={c.name} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[c.name]}`} />
                        <span className="text-sm text-[var(--color-subtle)]">
                          {c.name}{' '}
                          <span className="text-[var(--color-cream)] font-medium">
                            {c.percent}%
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Productive vs Leisure */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-sm text-[var(--color-subtle)]">Productive time</span>
                    <span
                      className={`text-lg font-bold ${result.productivePercent >= 30 ? 'text-emerald-400' : result.productivePercent >= 15 ? 'text-amber-400' : 'text-rose-400'}`}
                    >
                      {result.productivePercent}%
                    </span>
                  </div>
                </div>

                {/* Opportunity Cost Cards */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    What You Could Do Instead (per year)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {result.opportunityCosts.map((oc) => (
                      <div
                        key={oc.activity}
                        className="bg-[var(--color-night)] rounded-xl p-4 border border-white/10 text-center"
                      >
                        <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center mx-auto mb-2">
                          <SvgIcon
                            path={OPPORTUNITY_ICONS[oc.icon] || OPPORTUNITY_ICONS.book}
                            className="text-[var(--color-accent)]"
                          />
                        </div>
                        <div className="text-2xl font-bold text-[var(--color-cream)]">
                          {formatNumber(oc.count)}
                        </div>
                        <div className="text-xs text-[var(--color-muted)] mt-1">{oc.activity}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert variant="tip" title="Food for thought:">
                  Small reductions add up. Cutting just 1 hour per day frees up over 365 hours a
                  year, enough to read 60 books or finish 9 online courses.
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Adjust the sliders">
                Set your daily screen time by category to see the full breakdown.
              </Alert>
            )}

            {/* Share */}
            {inputs.dailyHours > 0 && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`I spend ${inputs.dailyHours}h/day on screens. That's ${formatNumber(result.yearlyDays)} days per year and ${formatNumber(result.lifetimeYears)} years of my remaining life. ${result.productivePercent}% is productive.`}
                  calculatorName="Screen Time Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
