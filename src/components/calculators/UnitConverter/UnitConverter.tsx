/**
 * Unit Converter - React Component
 *
 * Convert between various units of measurement.
 */

import { useState, useMemo } from 'react';
import { convert, getAllConversions } from './calculations';
import {
  getDefaultInputs,
  UNITS,
  CATEGORY_LABELS,
  type UnitConverterInputs,
  type UnitCategory,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Select,
  ButtonGroup,
  Grid,
  Divider,
} from '../../ui';

export default function UnitConverter() {
  const [inputs, setInputs] = useState<UnitConverterInputs>(() => getDefaultInputs());

  const result = useMemo(() => convert(inputs), [inputs]);
  const allConversions = useMemo(
    () => getAllConversions(inputs.value, inputs.fromUnit, inputs.category),
    [inputs.value, inputs.fromUnit, inputs.category]
  );

  const updateInput = <K extends keyof UnitConverterInputs>(
    field: K,
    value: UnitConverterInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (category: UnitCategory) => {
    const units = UNITS[category];
    setInputs({
      category,
      fromUnit: units[0].value,
      toUnit: units[1].value,
      value: 1,
    });
  };

  const swapUnits = () => {
    setInputs((prev) => ({
      ...prev,
      fromUnit: prev.toUnit,
      toUnit: prev.fromUnit,
      value: result.value,
    }));
  };

  const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as UnitCategory,
    label,
  }));

  const unitOptions = UNITS[inputs.category].map((u) => ({
    value: u.value,
    label: u.label,
  }));

  const fromLabel = UNITS[inputs.category].find(u => u.value === inputs.fromUnit)?.label || inputs.fromUnit;
  const toLabel = UNITS[inputs.category].find(u => u.value === inputs.toUnit)?.label || inputs.toUnit;

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Unit Converter"
          subtitle="Convert between different units of measurement"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Category Selection */}
            <div>
              <Label>Category</Label>
              <ButtonGroup
                options={categoryOptions}
                value={inputs.category}
                onChange={(value) => handleCategoryChange(value as UnitCategory)}
                columns={3}
              />
            </div>

            {/* Value Input */}
            <div>
              <Label htmlFor="value" required>
                Value
              </Label>
              <Input
                id="value"
                type="number"
                step="any"
                value={inputs.value}
                onChange={(e) => updateInput('value', Number(e.target.value))}
              />
            </div>

            {/* From/To Units */}
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="fromUnit">From</Label>
                <Select
                  id="fromUnit"
                  options={unitOptions}
                  value={inputs.fromUnit}
                  onChange={(value) => updateInput('fromUnit', value)}
                />
              </div>

              <button
                onClick={swapUnits}
                className="mb-1 p-3 rounded-xl bg-[var(--color-night)] border border-white/10
                         hover:bg-white/10 transition-colors"
                title="Swap units"
              >
                <svg className="w-5 h-5 text-[var(--color-cream)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>

              <div className="flex-1">
                <Label htmlFor="toUnit">To</Label>
                <Select
                  id="toUnit"
                  options={unitOptions}
                  value={inputs.toUnit}
                  onChange={(value) => updateInput('toUnit', value)}
                />
              </div>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Result */}
            <div className="bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/10
                          rounded-2xl p-8 text-center border border-[var(--color-accent)]/30">
              <div className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-2">
                {inputs.value} {fromLabel} =
              </div>
              <div className="text-4xl md:text-5xl font-bold text-[var(--color-cream)] tabular-nums mb-2">
                {result.formatted}
              </div>
              <div className="text-lg text-[var(--color-accent)]">
                {toLabel}
              </div>
            </div>

            {/* All Conversions */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                All Conversions from {inputs.value} {fromLabel}
              </h3>
              <Grid responsive={{ sm: 2, md: 3 }} gap="md">
                {allConversions.map((conv) => (
                  <div
                    key={conv.unit}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer
                              ${conv.unit === inputs.toUnit
                                ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/50'
                                : 'bg-[var(--color-void)] border-white/5 hover:border-white/20'
                              }`}
                    onClick={() => updateInput('toUnit', conv.unit)}
                  >
                    <p className="text-xl font-bold text-[var(--color-cream)] tabular-nums">
                      {conv.value}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">{conv.label}</p>
                  </div>
                ))}
              </Grid>
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
