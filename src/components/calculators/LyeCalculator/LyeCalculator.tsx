/**
 * Lye Calculator - React Component
 */

import { useState, useMemo } from 'preact/hooks';
import {
  calculateLye,
  formatWeight,
  getLyeConcentrationWarning,
  getRecipeWarnings,
} from './calculations';
import {
  getDefaultInputs,
  generateId,
  OILS,
  LYE_TYPES,
  WATER_RATIOS,
  SUPERFAT_OPTIONS,
  type LyeCalculatorInputs,
  type LyeType,
  type OilEntry,
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

export default function LyeCalculator() {
  const [inputs, setInputs] = useState<LyeCalculatorInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculateLye(inputs), [inputs]);

  const updateInput = <K extends keyof LyeCalculatorInputs>(
    field: K,
    value: LyeCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const addOil = (oilValue: string) => {
    const oilData = OILS.find((o) => o.value === oilValue);
    if (!oilData) return;

    const newOil: OilEntry = {
      id: generateId(),
      oil: oilValue,
      weight: inputs.unit === 'oz' ? 8 : 200,
    };
    setInputs((prev) => ({ ...prev, oils: [...prev.oils, newOil] }));
  };

  const updateOil = (id: string, weight: number) => {
    setInputs((prev) => ({
      ...prev,
      oils: prev.oils.map((o) => (o.id === id ? { ...o, weight } : o)),
    }));
  };

  const removeOil = (id: string) => {
    setInputs((prev) => ({
      ...prev,
      oils: prev.oils.filter((o) => o.id !== id),
    }));
  };

  const lyeWarning = getLyeConcentrationWarning(result.lyeConcentration);
  const recipeWarnings = getRecipeWarnings(result.oilBreakdown);

  // Group oils by category
  const oilsByCategory = OILS.reduce(
    (acc, oil) => {
      if (!acc[oil.category]) acc[oil.category] = [];
      acc[oil.category].push(oil);
      return acc;
    },
    {} as Record<string, typeof OILS>
  );

  return (
    <ThemeProvider defaultColor="violet">
      <Card variant="elevated">
        <CalculatorHeader
          title="Soap Lye Calculator"
          subtitle="Calculate lye and water for cold/hot process soap"
        />

        <div className="p-6 md:p-8">
          {/* Lye Type */}
          <div className="mb-6">
            <Label>Lye Type</Label>
            <ButtonGroup
              options={LYE_TYPES.map((l) => ({ value: l.value, label: l.label }))}
              value={inputs.lyeType}
              onChange={(value) => updateInput('lyeType', value as LyeType)}
              size="sm"
            />
          </div>

          {/* Settings Row */}
          <div className="mb-6">
            <Grid responsive={{ sm: 3 }} gap="md">
              <div>
                <Label>Superfat %</Label>
                <ButtonGroup
                  options={SUPERFAT_OPTIONS.map((s) => ({ value: String(s), label: `${s}%` }))}
                  value={String(inputs.superfatPercent)}
                  onChange={(value) => updateInput('superfatPercent', Number(value))}
                  size="sm"
                />
              </div>
              <div>
                <Label>Water:Lye Ratio</Label>
                <select
                  value={inputs.waterRatio}
                  onChange={(e) =>
                    updateInput('waterRatio', Number((e.target as HTMLSelectElement).value))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--color-cream)]"
                >
                  {WATER_RATIOS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Unit</Label>
                <ButtonGroup
                  options={[
                    { value: 'oz', label: 'Ounces' },
                    { value: 'g', label: 'Grams' },
                  ]}
                  value={inputs.unit}
                  onChange={(value) => updateInput('unit', value as 'oz' | 'g')}
                  size="sm"
                />
              </div>
            </Grid>
          </div>

          {/* Oils List */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider">
                Oils & Butters
              </h3>
            </div>

            <div className="space-y-2 mb-4">
              {inputs.oils.map((oilEntry) => {
                const oilData = OILS.find((o) => o.value === oilEntry.oil);
                const breakdown = result.oilBreakdown.find((o) => o.name === oilData?.label);
                return (
                  <div
                    key={oilEntry.id}
                    className="flex gap-3 items-center bg-[var(--color-night)] rounded-lg p-3"
                  >
                    <span className="flex-1 text-[var(--color-cream)]">{oilData?.label}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={oilEntry.weight}
                        onChange={(value) => updateOil(oilEntry.id, Number(value))}
                        min={0}
                        step={inputs.unit === 'oz' ? 0.5 : 10}
                        className="w-24"
                      />
                      <span className="text-sm text-[var(--color-muted)] w-8">{inputs.unit}</span>
                    </div>
                    <span className="text-sm text-[var(--color-accent)] w-12">
                      {breakdown?.percent.toFixed(0)}%
                    </span>
                    <button
                      onClick={() => removeOil(oilEntry.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add Oil */}
            <div className="bg-[var(--color-night)] rounded-lg p-4">
              <Label>Add Oil</Label>
              <select
                onChange={(e) => {
                  const value = (e.target as HTMLSelectElement).value;
                  if (value) {
                    addOil(value);
                    (e.target as HTMLSelectElement).value = '';
                  }
                }}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--color-cream)]"
              >
                <option value="">Select an oil or butter...</option>
                {Object.entries(oilsByCategory).map(([category, categoryOils]) => (
                  <optgroup key={category} label={category}>
                    {categoryOils.map((oil) => (
                      <option key={oil.value} value={oil.value}>
                        {oil.label} (SAP: {oil.sapNaOH})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Results */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <ResultCard
                label={
                  inputs.lyeType === 'naoh'
                    ? 'Sodium Hydroxide (NaOH)'
                    : 'Potassium Hydroxide (KOH)'
                }
                value={formatWeight(result.lyeAmount, inputs.unit)}
                subtitle="lye needed"
                valueColor="error"
              />
              <ResultCard
                label="Distilled Water"
                value={formatWeight(result.waterAmount, inputs.unit)}
                subtitle={`${result.lyeConcentration}% lye solution`}
                valueColor="success"
              />
            </Grid>

            {/* Warnings */}
            {lyeWarning && (
              <Alert variant="warning" title="Lye Concentration">
                {lyeWarning}
              </Alert>
            )}
            {recipeWarnings.map((warning, i) => (
              <Alert key={i} variant="info" title="Recipe Note">
                {warning}
              </Alert>
            ))}

            {/* Batch Summary */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Total Oils"
                value={formatWeight(result.totalOilWeight, inputs.unit)}
                sublabel="base oils"
              />
              <MetricCard
                label="Superfat"
                value={formatWeight(result.superfatAmount, inputs.unit)}
                sublabel={`${inputs.superfatPercent}% of oils`}
              />
              <MetricCard
                label="Total Batch"
                value={formatWeight(result.totalBatchWeight, inputs.unit)}
                sublabel="oils + lye + water"
              />
              <MetricCard
                label="Lye Solution"
                value={`${result.lyeConcentration}%`}
                sublabel="concentration"
              />
            </Grid>

            {/* Oil Breakdown */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Oil Breakdown
              </h3>
              <div className="space-y-3">
                {result.oilBreakdown.map((oil) => (
                  <div key={oil.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{oil.name}</span>
                      <span>
                        {oil.weight} {inputs.unit} ({oil.percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${oil.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety */}
            <Alert variant="warning" title="Safety First!">
              Always add lye to water, NEVER water to lye. Work in a well-ventilated area. Wear
              safety goggles and gloves. Keep vinegar nearby (for skin contact only - not for
              neutralizing lye solution).
            </Alert>

            {/* Tips */}
            <Alert variant="tip" title="Soap Making Tips:">
              5% superfat is standard for most soaps. Increase to 7-10% for facial bars or shampoo
              bars. Cold process soap needs 4-6 weeks cure time. Use distilled water only.
            </Alert>

            {/* Share */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Soap Recipe: ${formatWeight(result.totalOilWeight, inputs.unit)} oils, ${formatWeight(result.lyeAmount, inputs.unit)} ${inputs.lyeType.toUpperCase()}, ${formatWeight(result.waterAmount, inputs.unit)} water (${inputs.superfatPercent}% SF)`}
                calculatorName="Soap Lye Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
