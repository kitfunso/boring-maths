/**
 * Clay Shrinkage Calculator - React Component
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateClayShrinkage, formatSize, getShrinkageCategory, generateShrinkageTable } from './calculations';
import {
  getDefaultInputs,
  CLAY_TYPES,
  CONE_TEMPS,
  type ClayShrinkageInputs,
  type CalculationMode,
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

export default function ClayShrinkageCalculator() {
  const [inputs, setInputs] = useState<ClayShrinkageInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculateClayShrinkage(inputs), [inputs]);
  const shrinkageTable = useMemo(() => generateShrinkageTable(result.totalShrinkage, inputs.unit), [result.totalShrinkage, inputs.unit]);

  const updateInput = <K extends keyof ClayShrinkageInputs>(field: K, value: ClayShrinkageInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleClayTypeChange = (clayType: string) => {
    const clay = CLAY_TYPES.find(c => c.value === clayType);
    setInputs((prev) => ({
      ...prev,
      clayType,
      shrinkagePercent: clay?.totalShrinkage || prev.shrinkagePercent,
    }));
  };

  const shrinkageCategory = getShrinkageCategory(result.totalShrinkage);

  return (
    <ThemeProvider defaultColor="coral">
      <Card variant="elevated">
        <CalculatorHeader
          title="Clay Shrinkage Calculator"
          subtitle="Calculate pottery size changes from wet to fired"
        />

        <div className="p-6 md:p-8">
          {/* Calculation Mode */}
          <div className="mb-6">
            <Label>I want to calculate...</Label>
            <ButtonGroup
              options={[
                { value: 'thrown-to-fired', label: 'Fired size (I know thrown size)' },
                { value: 'fired-to-thrown', label: 'Thrown size (I want specific fired size)' },
              ]}
              value={inputs.calculationMode}
              onChange={(value) => updateInput('calculationMode', value as CalculationMode)}
              size="sm"
            />
          </div>

          {/* Size Input */}
          <div className="mb-6">
            <Grid responsive={{ sm: 2 }} gap="md">
              <div>
                <Label htmlFor="size">
                  {inputs.calculationMode === 'thrown-to-fired' ? 'Thrown (Wet) Size' : 'Desired Fired Size'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="size"
                    type="number"
                    value={inputs.knownSize}
                    onChange={(value) => updateInput('knownSize', Number(value))}
                    min={0.1}
                    step={0.125}
                  />
                  <ButtonGroup
                    options={[
                      { value: 'in', label: 'in' },
                      { value: 'cm', label: 'cm' },
                    ]}
                    value={inputs.unit}
                    onChange={(value) => updateInput('unit', value as 'in' | 'cm')}
                    size="sm"
                  />
                </div>
              </div>
            </Grid>
          </div>

          {/* Clay Type */}
          <div className="mb-6">
            <Label htmlFor="clayType">Clay Body</Label>
            <select
              id="clayType"
              value={inputs.clayType}
              onChange={(e) => handleClayTypeChange((e.target as HTMLSelectElement).value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--color-cream)]"
            >
              <optgroup label="Earthenware">
                {CLAY_TYPES.filter(c => c.value.includes('earthenware') || c.value === 'terracotta').map((c) => (
                  <option key={c.value} value={c.value}>{c.label} - {c.totalShrinkage}%</option>
                ))}
              </optgroup>
              <optgroup label="Stoneware">
                {CLAY_TYPES.filter(c => c.value.includes('stoneware') || c.value === 'speckled-buff').map((c) => (
                  <option key={c.value} value={c.value}>{c.label} - {c.totalShrinkage}%</option>
                ))}
              </optgroup>
              <optgroup label="Porcelain">
                {CLAY_TYPES.filter(c => c.value.includes('porcelain')).map((c) => (
                  <option key={c.value} value={c.value}>{c.label} - {c.totalShrinkage}%</option>
                ))}
              </optgroup>
              <optgroup label="Specialty">
                {CLAY_TYPES.filter(c => ['raku', 'paper-clay', 'sculpture', 'custom'].includes(c.value)).map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Custom Shrinkage */}
          {inputs.clayType === 'custom' && (
            <div className="mb-6">
              <Label htmlFor="shrinkage">Custom Shrinkage Percentage</Label>
              <Input
                id="shrinkage"
                type="number"
                value={inputs.shrinkagePercent}
                onChange={(value) => updateInput('shrinkagePercent', Number(value))}
                min={0}
                max={30}
                step={0.5}
                suffix="%"
              />
            </div>
          )}

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label={inputs.calculationMode === 'thrown-to-fired' ? 'Fired Size' : 'Throw At Size'}
              value={formatSize(result.resultSize, inputs.unit)}
              subtitle={inputs.calculationMode === 'thrown-to-fired'
                ? `${inputs.knownSize}${inputs.unit === 'in' ? '"' : 'cm'} thrown → ${formatSize(result.resultSize, inputs.unit)} fired`
                : `Throw at ${formatSize(result.resultSize, inputs.unit)} to get ${inputs.knownSize}${inputs.unit === 'in' ? '"' : 'cm'} fired`}
              valueColor="success"
            />

            {/* Shrinkage Breakdown */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Total Shrinkage"
                value={`${result.totalShrinkage}%`}
                sublabel={shrinkageCategory.label}
              />
              <MetricCard
                label="Drying Shrinkage"
                value={`${result.dryShrinkage}%`}
                sublabel="wet to bone dry"
              />
              <MetricCard
                label="Firing Shrinkage"
                value={`${result.firingShrinkage}%`}
                sublabel="bisque to glaze fire"
              />
              <MetricCard
                label="Size Change"
                value={`${result.sizeChange.toFixed(2)}${inputs.unit === 'in' ? '"' : 'cm'}`}
                sublabel="total difference"
              />
            </Grid>

            {/* Quick Reference Table */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Quick Reference Table ({result.totalShrinkage}% shrinkage)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 pr-4 text-[var(--color-muted)]">Thrown Size</th>
                      <th className="text-left py-2 text-[var(--color-muted)]">Fired Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shrinkageTable.map((row) => (
                      <tr key={row.thrown} className="border-b border-white/5">
                        <td className="py-2 pr-4">{row.thrown}{inputs.unit === 'in' ? '"' : 'cm'}</td>
                        <td className="py-2 text-[var(--color-accent)]">{row.fired}{inputs.unit === 'in' ? '"' : 'cm'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cone Temperature Reference */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Cone Temperature Reference
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CONE_TEMPS.filter(c => ['06', '04', '6', '10'].includes(c.cone)).map((cone) => (
                  <div key={cone.cone} className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-[var(--color-cream)]">Cone {cone.cone}</div>
                    <div className="text-sm text-[var(--color-muted)]">{cone.tempF}°F / {cone.tempC}°C</div>
                    <div className="text-xs text-[var(--color-accent)]">{cone.category}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formula */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Formulas
              </h3>
              <div className="space-y-2 font-mono text-sm bg-black/30 rounded-lg p-4 text-orange-400">
                <div>Fired Size = Thrown Size × (1 - Shrinkage%)</div>
                <div>Thrown Size = Desired Fired Size ÷ (1 - Shrinkage%)</div>
              </div>
            </div>

            {/* Tips */}
            <Alert variant="tip" title="Pottery Tips:">
              Always test your specific clay body - shrinkage varies between batches and brands.
              Make test tiles and measure before and after firing.
              For lids and matching pieces, throw from the same batch of clay on the same day.
            </Alert>

            {/* Share */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`${inputs.knownSize}${inputs.unit === 'in' ? '"' : 'cm'} ${inputs.calculationMode === 'thrown-to-fired' ? 'thrown' : 'fired'} → ${formatSize(result.resultSize, inputs.unit)} (${result.totalShrinkage}% shrinkage)`}
                calculatorName="Clay Shrinkage Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
