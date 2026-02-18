/**
 * Time Zone Converter - Preact Component
 */

import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { convertTimeZone } from './calculations';
import { getDefaultInputs, TIME_ZONES, type TimeZoneConverterInputs } from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Select,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import PrintResults from '../../ui/PrintResults';
import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';

export default function TimeZoneConverter() {
  useCalculatorTracking('Time Zone Converter');

  const [inputs, setInputs] = useLocalStorage<TimeZoneConverterInputs>(
    'calc-timezone-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => convertTimeZone(inputs), [inputs]);

  const updateInput = <K extends keyof TimeZoneConverterInputs>(
    field: K,
    value: TimeZoneConverterInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const swapZones = () => {
    setInputs((prev) => ({
      ...prev,
      fromZone: prev.toZone,
      toZone: prev.fromZone,
    }));
  };

  const zoneOptions = TIME_ZONES.map((tz) => ({
    value: tz.id,
    label: tz.label,
  }));

  const pad = (n: number) => n.toString().padStart(2, '0');
  const inputTime = `${pad(inputs.hours)}:${pad(inputs.minutes)}`;

  const dayLabel =
    result.dayShift === 1 ? ' (next day)' : result.dayShift === -1 ? ' (previous day)' : '';
  const diffSign = result.offsetDiff >= 0 ? '+' : '';
  const diffHours = result.offsetDiff % 1 === 0 ? result.offsetDiff : result.offsetDiff.toFixed(1);

  // Common conversions table
  const commonTimes = [0, 3, 6, 9, 12, 15, 18, 21];

  const shareText = `${inputTime} ${result.fromAbbrev} = ${result.convertedTime} ${result.toAbbrev}${dayLabel}`;

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Time Zone Converter"
          subtitle="Convert time between any two time zones"
        />

        <div class="p-6 space-y-6">
          <Grid cols={2}>
            <div>
              <Label required>Hours (0-23)</Label>
              <Input
                type="number"
                value={inputs.hours}
                onChange={(v) => updateInput('hours', Math.max(0, Math.min(23, Number(v))))}
                min={0}
                max={23}
              />
            </div>
            <div>
              <Label required>Minutes (0-59)</Label>
              <Input
                type="number"
                value={inputs.minutes}
                onChange={(v) => updateInput('minutes', Math.max(0, Math.min(59, Number(v))))}
                min={0}
                max={59}
              />
            </div>
          </Grid>

          <Grid cols={2}>
            <div>
              <Label required>From Time Zone</Label>
              <Select
                options={zoneOptions}
                value={inputs.fromZone}
                onChange={(v) => updateInput('fromZone', v)}
              />
            </div>
            <div>
              <Label required>To Time Zone</Label>
              <Select
                options={zoneOptions}
                value={inputs.toZone}
                onChange={(v) => updateInput('toZone', v)}
              />
            </div>
          </Grid>

          <div class="flex justify-center">
            <button
              onClick={swapZones}
              class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              aria-label="Swap time zones"
            >
              ⇄ Swap
            </button>
          </div>

          <Divider />

          <ResultCard
            label={`${inputTime} ${result.fromAbbrev}`}
            value={`${result.convertedTime} ${result.toAbbrev}`}
            subtitle={`${diffSign}${diffHours} hours difference${dayLabel}`}
          />

          {result.dayShift !== 0 && (
            <Alert variant="info">
              <strong>{result.dayShift === 1 ? 'Next day' : 'Previous day'}:</strong> The converted
              time falls on the {result.dayShift === 1 ? 'following' : 'preceding'} calendar day.
            </Alert>
          )}

          {/* Reference table */}
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Quick Reference</h3>
            <div class="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-100">
                    <th class="text-left p-3 font-medium text-gray-600">{result.fromAbbrev}</th>
                    <th class="text-right p-3 font-medium text-gray-600">{result.toAbbrev}</th>
                  </tr>
                </thead>
                <tbody>
                  {commonTimes.map((h) => {
                    const r = convertTimeZone({ ...inputs, hours: h, minutes: 0 });
                    const dl = r.dayShift === 1 ? ' (+1d)' : r.dayShift === -1 ? ' (-1d)' : '';
                    return (
                      <tr key={h} class="border-b border-gray-100 last:border-0">
                        <td class="p-3 text-gray-700">{pad(h)}:00</td>
                        <td class="p-3 text-right font-medium text-gray-800">
                          {r.convertedTime}
                          {dl}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Alert variant="info">
            <strong>Note:</strong> This converter uses standard time offsets. Daylight Saving Time
            (DST) is not automatically applied — check whether your regions are currently observing
            DST and adjust accordingly.
          </Alert>

          <div class="flex gap-3 flex-wrap">
            <ShareResults text={shareText} title="Time Zone Conversion" />
            <PrintResults />
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
