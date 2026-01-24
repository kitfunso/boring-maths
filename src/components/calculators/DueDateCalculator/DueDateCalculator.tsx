/**
 * Due Date Calculator - Preact Component
 *
 * Calculate pregnancy due date using multiple methods.
 */

import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateDueDate } from './calculations';
import { getDefaultInputs, type DueDateInputs, type CalculationMethod } from './types';
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
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import PrintResults from '../../ui/PrintResults';
import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';

export default function DueDateCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('Due Date Calculator');

  const [inputs, setInputs] = useLocalStorage<DueDateInputs>(
    'calc-due-date-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => {
    return calculateDueDate(inputs);
  }, [inputs]);

  const updateInput = <K extends keyof DueDateInputs>(field: K, value: DueDateInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const methodOptions = [
    { value: 'lmp' as const, label: 'Last Period' },
    { value: 'conception' as const, label: 'Conception' },
    { value: 'ivf' as const, label: 'IVF Transfer' },
    { value: 'ultrasound' as const, label: 'Ultrasound' },
  ];

  const ivfDayOptions = [
    { value: '3day' as const, label: '3-Day Embryo' },
    { value: '5day' as const, label: '5-Day Embryo' },
  ];

  const getTrimesterColor = (trimester: 1 | 2 | 3) => {
    switch (trimester) {
      case 1:
        return 'bg-pink-950/50 border-pink-500/30 text-pink-400';
      case 2:
        return 'bg-coral-950/50 border-coral-500/30 text-coral-400';
      case 3:
        return 'bg-orange-950/50 border-orange-500/30 text-orange-400';
    }
  };

  return (
    <ThemeProvider defaultColor="coral">
      <Card variant="elevated">
        <CalculatorHeader
          title="Pregnancy Due Date Calculator"
          subtitle="Estimate your baby's arrival date"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Calculation Method */}
            <div>
              <Label>Calculation Method</Label>
              <ButtonGroup
                options={methodOptions}
                value={inputs.method}
                onChange={(value) => updateInput('method', value as CalculationMethod)}
                columns={2}
              />
            </div>

            {/* LMP Method */}
            {inputs.method === 'lmp' && (
              <>
                <div>
                  <Label htmlFor="lmpDate" required>
                    First Day of Last Menstrual Period
                  </Label>
                  <Input
                    id="lmpDate"
                    type="date"
                    value={inputs.lmpDate}
                    onChange={(e) => updateInput('lmpDate', (e.target as HTMLInputElement).value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cycleLength">Average Cycle Length (days)</Label>
                  <Input
                    id="cycleLength"
                    type="number"
                    min={21}
                    max={45}
                    value={inputs.cycleLength}
                    onChange={(e) =>
                      updateInput('cycleLength', Number((e.target as HTMLInputElement).value))
                    }
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    Default is 28 days. Adjust if your cycle is longer or shorter.
                  </p>
                </div>
              </>
            )}

            {/* Conception Date Method */}
            {inputs.method === 'conception' && (
              <div>
                <Label htmlFor="conceptionDate" required>
                  Conception Date
                </Label>
                <Input
                  id="conceptionDate"
                  type="date"
                  value={inputs.conceptionDate}
                  onChange={(e) =>
                    updateInput('conceptionDate', (e.target as HTMLInputElement).value)
                  }
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  The date you believe conception occurred.
                </p>
              </div>
            )}

            {/* IVF Method */}
            {inputs.method === 'ivf' && (
              <>
                <div>
                  <Label htmlFor="ivfDate" required>
                    IVF Transfer Date
                  </Label>
                  <Input
                    id="ivfDate"
                    type="date"
                    value={inputs.ivfDate}
                    onChange={(e) => updateInput('ivfDate', (e.target as HTMLInputElement).value)}
                  />
                </div>
                <div>
                  <Label>Embryo Type</Label>
                  <ButtonGroup
                    options={ivfDayOptions}
                    value={inputs.ivfDayType}
                    onChange={(value) => updateInput('ivfDayType', value as '3day' | '5day')}
                    columns={2}
                  />
                </div>
              </>
            )}

            {/* Ultrasound Method */}
            {inputs.method === 'ultrasound' && (
              <>
                <div>
                  <Label htmlFor="ultrasoundDate" required>
                    Ultrasound Date
                  </Label>
                  <Input
                    id="ultrasoundDate"
                    type="date"
                    value={inputs.ultrasoundDate}
                    onChange={(e) =>
                      updateInput('ultrasoundDate', (e.target as HTMLInputElement).value)
                    }
                  />
                </div>
                <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                  <div>
                    <Label htmlFor="ultrasoundWeeks" required>
                      Gestational Age (Weeks)
                    </Label>
                    <Input
                      id="ultrasoundWeeks"
                      type="number"
                      min={4}
                      max={42}
                      value={inputs.ultrasoundWeeks}
                      onChange={(e) =>
                        updateInput('ultrasoundWeeks', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="ultrasoundDays">Days</Label>
                    <Input
                      id="ultrasoundDays"
                      type="number"
                      min={0}
                      max={6}
                      value={inputs.ultrasoundDays}
                      onChange={(e) =>
                        updateInput('ultrasoundDays', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                </Grid>
                <p className="text-xs text-[var(--color-muted)]">
                  Enter the gestational age shown on your ultrasound report.
                </p>
              </>
            )}
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Due Date Display */}
            <div className="rounded-2xl p-8 text-center border-2 bg-coral-950/50 border-coral-500/30">
              <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-2">
                Estimated Due Date
              </p>
              <p className="text-3xl md:text-4xl font-bold text-coral-400 mb-2">
                {result.dueDateFormatted}
              </p>
              <p className="text-lg text-[var(--color-cream)]">
                {result.daysUntilDue > 0
                  ? `${result.daysUntilDue} days to go`
                  : result.daysUntilDue === 0
                    ? 'Due today!'
                    : `${Math.abs(result.daysUntilDue)} days past due date`}
              </p>
            </div>

            {/* Current Progress */}
            <div className={`rounded-xl p-6 border-2 ${getTrimesterColor(result.trimester)}`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-2xl font-bold">
                    {result.currentWeeks} weeks, {result.currentDays} days
                  </p>
                  <p className="text-sm opacity-75">{result.trimesterName}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{result.percentComplete}%</p>
                  <p className="text-sm opacity-75">Complete</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[var(--color-night)] rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-coral-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${result.percentComplete}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-2 opacity-75">
                <span>Week 0</span>
                <span>Week 13</span>
                <span>Week 27</span>
                <span>Week 40</span>
              </div>
            </div>

            {/* Key Dates */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                  Estimated Conception
                </p>
                <p className="text-lg font-bold text-[var(--color-cream)]">
                  {result.conceptionDateEstimate}
                </p>
              </div>
              <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                  Days Pregnant
                </p>
                <p className="text-lg font-bold text-[var(--color-cream)] tabular-nums">
                  {result.daysPregnant} days
                </p>
              </div>
            </Grid>

            {/* Milestones Timeline */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Pregnancy Milestones
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {result.milestones.map((milestone) => (
                  <div
                    key={milestone.week}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-opacity ${
                      milestone.isPast ? 'opacity-50' : 'bg-white/5'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        milestone.isPast ? 'bg-green-500' : 'bg-coral-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[var(--color-cream)]">
                          Week {milestone.week}: {milestone.name}
                        </span>
                        <span className="text-sm text-[var(--color-muted)] ml-2">
                          {milestone.date}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-muted)]">{milestone.description}</p>
                    </div>
                    {milestone.isPast && (
                      <span className="text-xs text-green-400 flex-shrink-0">Passed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Alert variant="info" title="Note:">
              Due dates are estimates. Only about 5% of babies are born on their exact due date.
              Most babies are born within 2 weeks before or after. Always consult your healthcare
              provider for personalized guidance.
            </Alert>

            {/* Share & Print Results */}
            <div className="flex justify-center gap-3 pt-4">
              <ShareResults
                result={`My due date: ${result.dueDateFormatted} - Currently ${result.currentWeeks} weeks, ${result.currentDays} days (${result.trimesterName})`}
                calculatorName="Pregnancy Due Date Calculator"
              />
              <PrintResults
                title="Pregnancy Due Date Calculator Results"
                results={[
                  { label: 'Due Date', value: result.dueDateFormatted },
                  {
                    label: 'Current Progress',
                    value: `${result.currentWeeks} weeks, ${result.currentDays} days`,
                  },
                  { label: 'Trimester', value: result.trimesterName },
                  { label: 'Days Until Due', value: result.daysUntilDue.toString() },
                  { label: 'Percent Complete', value: `${result.percentComplete}%` },
                  { label: 'Estimated Conception', value: result.conceptionDateEstimate },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
