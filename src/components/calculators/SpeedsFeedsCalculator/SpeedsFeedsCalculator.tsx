/**
 * Speeds & Feeds Calculator - React Component
 */

import { useState, useMemo } from 'preact/hooks';
import {
  calculateSpeedsFeeds,
  formatNumber,
  getRPMWarning,
  getFeedRateWarning,
} from './calculations';
import {
  getDefaultInputs,
  MATERIALS,
  OPERATION_TYPES,
  FLUTE_OPTIONS,
  type SpeedsFeedsInputs,
  type OperationType,
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
  ButtonGroup,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function SpeedsFeedsCalculator() {
  const [inputs, setInputs] = useState<SpeedsFeedsInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculateSpeedsFeeds(inputs), [inputs]);

  const updateInput = <K extends keyof SpeedsFeedsInputs>(
    field: K,
    value: SpeedsFeedsInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const rpmWarning = getRPMWarning(result.rpm);
  const feedWarning = getFeedRateWarning(result.feedRate, inputs.material);

  // Group materials by type
  const metalMaterials = MATERIALS.filter(
    (m) => !m.value.includes('plastic') && !m.value.includes('wood')
  );
  const plasticMaterials = MATERIALS.filter((m) => m.value.includes('plastic'));
  const woodMaterials = MATERIALS.filter((m) => m.value.includes('wood'));

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Speeds & Feeds Calculator"
          subtitle="Calculate optimal RPM and feed rate for CNC milling"
        />

        <div className="p-6 md:p-8">
          {/* Material Selection */}
          <div className="mb-6">
            <Label htmlFor="material">Material</Label>
            <select
              id="material"
              value={inputs.material}
              onChange={(e) => updateInput('material', (e.target as HTMLSelectElement).value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--color-cream)]"
            >
              <optgroup label="Metals">
                {metalMaterials.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Plastics">
                {plasticMaterials.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Wood">
                {woodMaterials.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Tool Parameters */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
              Tool Parameters
            </h3>
            <Grid responsive={{ sm: 2, md: 3 }} gap="md">
              <div>
                <Label htmlFor="toolDiameter">Tool Diameter</Label>
                <div className="flex gap-2">
                  <Input
                    id="toolDiameter"
                    type="number"
                    value={inputs.toolDiameter}
                    onChange={(value) => updateInput('toolDiameter', Number(value))}
                    min={0.01}
                    step={0.0625}
                  />
                  <ButtonGroup
                    options={[
                      { value: 'in', label: 'in' },
                      { value: 'mm', label: 'mm' },
                    ]}
                    value={inputs.toolDiameterUnit}
                    onChange={(value) => updateInput('toolDiameterUnit', value as 'in' | 'mm')}
                    size="sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="flutes">Number of Flutes</Label>
                <ButtonGroup
                  options={FLUTE_OPTIONS.map((f) => ({ value: String(f), label: String(f) }))}
                  value={String(inputs.numberOfFlutes)}
                  onChange={(value) => updateInput('numberOfFlutes', Number(value))}
                  size="sm"
                />
              </div>
              <div>
                <Label>Operation Type</Label>
                <ButtonGroup
                  options={OPERATION_TYPES.map((o) => ({ value: o.value, label: o.label }))}
                  value={inputs.operationType}
                  onChange={(value) => updateInput('operationType', value as OperationType)}
                  size="sm"
                />
              </div>
            </Grid>
          </div>

          {/* Depth of Cut */}
          <div className="mb-6">
            <Label htmlFor="depthOfCut">Depth of Cut</Label>
            <div className="flex gap-2 max-w-xs">
              <Input
                id="depthOfCut"
                type="number"
                value={inputs.depthOfCut}
                onChange={(value) => updateInput('depthOfCut', Number(value))}
                min={0.001}
                step={0.01}
              />
              <ButtonGroup
                options={[
                  { value: 'in', label: 'in' },
                  { value: 'mm', label: 'mm' },
                ]}
                value={inputs.depthOfCutUnit}
                onChange={(value) => updateInput('depthOfCutUnit', value as 'in' | 'mm')}
                size="sm"
              />
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Results */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <ResultCard
                label="Spindle Speed"
                value={`${formatNumber(result.rpm)} RPM`}
                subtitle="revolutions per minute"
                valueColor="success"
              />
              <ResultCard
                label="Feed Rate"
                value={`${formatNumber(result.feedRate, 1)} IPM`}
                subtitle="inches per minute"
                valueColor="success"
              />
            </Grid>

            {/* Warnings */}
            {rpmWarning && (
              <Alert variant="warning" title="RPM Warning">
                {rpmWarning}
              </Alert>
            )}
            {feedWarning && (
              <Alert variant="warning" title="Feed Rate Warning">
                {feedWarning}
              </Alert>
            )}

            {/* Additional Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Chip Load"
                value={`${result.chipLoad}" per tooth`}
                sublabel="thickness per flute"
              />
              <MetricCard
                label="Surface Speed"
                value={`${result.surfaceSpeed} SFM`}
                sublabel="surface feet/min"
              />
              <MetricCard
                label="Material Removal"
                value={`${result.materialRemovalRate} in³/min`}
                sublabel="volume rate"
              />
              <MetricCard
                label="Time per Inch"
                value={`${result.cuttingTime} sec`}
                sublabel="cutting time"
              />
            </Grid>

            {/* G-Code Preview */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                G-Code Reference
              </h3>
              <div className="font-mono text-sm bg-black/30 rounded-lg p-4 text-green-400">
                <div>
                  S{formatNumber(result.rpm)} M3{' '}
                  <span className="text-[var(--color-muted)]">
                    (Spindle on CW at {formatNumber(result.rpm)} RPM)
                  </span>
                </div>
                <div>
                  F{formatNumber(result.feedRate, 1)}{' '}
                  <span className="text-[var(--color-muted)]">
                    (Feed rate {formatNumber(result.feedRate, 1)} IPM)
                  </span>
                </div>
              </div>
            </div>

            {/* Formula Reference */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Formulas Used
              </h3>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                <div>
                  <strong>RPM</strong> = (SFM × 12) / (π × Diameter)
                </div>
                <div>
                  <strong>Feed Rate</strong> = RPM × Chip Load × Number of Flutes
                </div>
                <div>
                  <strong>MRR</strong> = Feed Rate × DOC × Tool Diameter
                </div>
              </div>
            </div>

            {/* Tips */}
            <Alert variant="tip" title="Machining Tips:">
              Start conservative and increase speeds/feeds as you gain confidence with your setup.
              Listen for chatter (vibration) and watch chip formation. Ideal chips are small,
              consistent, and not discolored from heat.
            </Alert>

            {/* Share */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`${formatNumber(result.rpm)} RPM, ${formatNumber(result.feedRate, 1)} IPM for ${MATERIALS.find((m) => m.value === inputs.material)?.label}`}
                calculatorName="Speeds & Feeds Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
