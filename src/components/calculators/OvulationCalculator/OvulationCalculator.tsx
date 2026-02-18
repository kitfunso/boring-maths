/**
 * Ovulation Calculator - Preact Component
 */

import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateOvulation } from './calculations';
import { getDefaultInputs, type OvulationInputs } from './types';
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
import PrintResults from '../../ui/PrintResults';
import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function OvulationCalculator() {
  useCalculatorTracking('Ovulation Calculator');

  const [inputs, setInputs] = useLocalStorage<OvulationInputs>(
    'calc-ovulation-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateOvulation(inputs), [inputs]);

  const updateInput = <K extends keyof OvulationInputs>(field: K, value: OvulationInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const shareText = `Estimated ovulation: ${formatDate(result.ovulationDate)}. Fertile window: ${formatDate(result.fertileWindowStart)} – ${formatDate(result.fertileWindowEnd)}`;

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Ovulation Calculator"
          subtitle="Estimate your fertile window and ovulation date"
        />

        <div class="p-6 space-y-6">
          <Grid cols={2}>
            <div>
              <Label required>First Day of Last Period</Label>
              <Input
                type="date"
                value={inputs.lastPeriodDate}
                onChange={(v) => updateInput('lastPeriodDate', v)}
              />
            </div>
            <div>
              <Label required>Average Cycle Length (days)</Label>
              <Input
                type="number"
                value={inputs.cycleLength}
                onChange={(v) => updateInput('cycleLength', Number(v))}
                min={21}
                max={45}
              />
              <p class="text-xs text-gray-500 mt-1">Typical range: 21–35 days</p>
            </div>
          </Grid>

          <Divider />

          {/* Current cycle results */}
          <ResultCard
            label="Estimated Ovulation Date"
            value={formatDate(result.ovulationDate)}
            subtitle="Most fertile day"
          />

          <Grid cols={2}>
            <MetricCard
              label="Fertile Window"
              value={`${formatDate(result.fertileWindowStart)}`}
              subtitle={`to ${formatDate(result.fertileWindowEnd)}`}
            />
            <MetricCard
              label="Next Period"
              value={formatDate(result.nextPeriodDate)}
              subtitle="Expected start date"
            />
          </Grid>

          {/* Upcoming cycles */}
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Upcoming Cycles</h3>
            <div class="space-y-3">
              {result.upcomingCycles.map((cycle, i) => (
                <div key={i} class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-medium text-gray-700">Cycle {i + 2}</span>
                    <span class="text-sm text-gray-500">
                      Period: {formatDate(cycle.nextPeriodDate)}
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    <span class="text-blue-600 font-medium">Ovulation:</span>{' '}
                    {formatDate(cycle.ovulationDate)}
                    {' · '}
                    <span class="text-pink-600 font-medium">Fertile:</span>{' '}
                    {formatDate(cycle.start)} – {formatDate(cycle.end)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Alert variant="info">
            <strong>Note:</strong> This calculator provides estimates based on average cycle
            patterns. Actual ovulation can vary. For family planning, consider using ovulation
            predictor kits (OPKs) or basal body temperature tracking for more accuracy.
          </Alert>

          <div class="flex gap-3 flex-wrap">
            <ShareResults text={shareText} title="Ovulation Calculator Results" />
            <PrintResults />
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
