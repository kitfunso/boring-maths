/**
 * Baking Conversion Calculator - Preact Component
 */

import { useMemo } from 'preact/hooks';
import { calculateBakingConversion, formatAmount } from './calculations';
import {
  getDefaultInputs,
  INGREDIENT_LABELS,
  UNIT_LABELS,
  INGREDIENT_DENSITIES,
  type BakingConversionInputs,
  type BakingUnit,
  type Ingredient,
} from './types';
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
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

const UNIT_OPTIONS = (Object.entries(UNIT_LABELS) as [BakingUnit, string][]).map(
  ([value, label]) => ({ value, label })
);

const INGREDIENT_OPTIONS = (Object.entries(INGREDIENT_LABELS) as [Ingredient, string][]).map(
  ([value, label]) => ({ value, label })
);

export default function BakingConversionCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorState<
    BakingConversionInputs,
    ReturnType<typeof calculateBakingConversion>
  >({
    name: 'Baking Conversion Calculator',
    defaults: getDefaultInputs,
    compute: calculateBakingConversion,
  });

  const handleSwapUnits = () => {
    setInputs((prev) => ({
      ...prev,
      fromUnit: prev.toUnit,
      toUnit: prev.fromUnit,
    }));
  };

  // Build quick-reference rows for the selected ingredient
  const quickReference = useMemo(() => {
    const amounts = [0.25, 0.5, 1, 2, 3];
    return amounts.map((cups) => {
      const grams = Math.round(cups * INGREDIENT_DENSITIES[inputs.ingredient]);
      const oz = Math.round((grams / 28.3495) * 10) / 10;
      return { cups, grams, oz };
    });
  }, [inputs.ingredient]);

  return (
    <ThemeProvider defaultColor="amber">
      <Card variant="elevated">
        <CalculatorHeader
          title="Baking Conversion Calculator"
          subtitle="Convert between cups, grams, ounces, and more"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Ingredient selector */}
            <div>
              <Label htmlFor="ingredient" required>
                Ingredient
              </Label>
              <Select
                id="ingredient"
                options={INGREDIENT_OPTIONS}
                value={inputs.ingredient}
                onChange={(val) => updateInput('ingredient', val as Ingredient)}
              />
            </div>

            {/* Amount input */}
            <div>
              <Label htmlFor="amount" required>
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step={0.25}
                value={inputs.amount}
                onChange={(e) => updateInput('amount', Number(e.target.value))}
              />
            </div>

            {/* From / Swap / To row */}
            <Grid responsive={{ sm: 1, md: 3 }} gap="md">
              <div>
                <Label htmlFor="fromUnit" required>
                  From
                </Label>
                <Select
                  id="fromUnit"
                  options={UNIT_OPTIONS}
                  value={inputs.fromUnit}
                  onChange={(val) => updateInput('fromUnit', val as BakingUnit)}
                />
              </div>

              <div className="flex items-end justify-center pb-1">
                <button
                  type="button"
                  onClick={handleSwapUnits}
                  className="p-3 rounded-xl bg-[var(--color-night)] border border-white/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 hover:border-[var(--color-accent)]/50 transition-all"
                  aria-label="Swap units"
                  title="Swap units"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                    />
                  </svg>
                </button>
              </div>

              <div>
                <Label htmlFor="toUnit" required>
                  To
                </Label>
                <Select
                  id="toUnit"
                  options={UNIT_OPTIONS}
                  value={inputs.toUnit}
                  onChange={(val) => updateInput('toUnit', val as BakingUnit)}
                />
              </div>
            </Grid>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {inputs.amount > 0 ? (
              <>
                {/* Primary Result */}
                <ResultCard
                  label="Converted Amount"
                  value={formatAmount(result.convertedAmount, inputs.toUnit)}
                  subtitle={`${formatAmount(inputs.amount, inputs.fromUnit)} ${INGREDIENT_LABELS[inputs.ingredient]}`}
                  footer={<>Density: {result.ingredientDensity} g per cup</>}
                />

                {/* Metrics */}
                <Grid responsive={{ sm: 2, md: 3 }} gap="md">
                  <MetricCard
                    label="Input"
                    value={formatAmount(inputs.amount, inputs.fromUnit)}
                    sublabel={INGREDIENT_LABELS[inputs.ingredient]}
                  />
                  <MetricCard
                    label="Result"
                    value={formatAmount(result.convertedAmount, inputs.toUnit)}
                    sublabel="converted"
                    valueColor="text-[var(--color-accent)]"
                  />
                  <MetricCard
                    label="Density"
                    value={`${result.ingredientDensity} g`}
                    sublabel="per cup"
                  />
                </Grid>

                {/* Equivalents table */}
                {result.equivalents.length > 0 && (
                  <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                    <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                      All Equivalents for {formatAmount(inputs.amount, inputs.fromUnit)}{' '}
                      {INGREDIENT_LABELS[inputs.ingredient]}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {result.equivalents.map((eq) => (
                        <div
                          key={eq.unit}
                          className="p-3 rounded-lg bg-[var(--color-void)] text-center"
                        >
                          <div className="text-lg font-bold text-[var(--color-accent)]">
                            {eq.amount}
                          </div>
                          <div className="text-sm text-[var(--color-subtle)]">{eq.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick reference table */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Quick Reference: {INGREDIENT_LABELS[inputs.ingredient]}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[var(--color-subtle)] border-b border-white/10">
                          <th className="text-left py-2 pr-4">Cups</th>
                          <th className="text-left py-2 pr-4">Grams</th>
                          <th className="text-left py-2">Ounces</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quickReference.map((row) => (
                          <tr
                            key={row.cups}
                            className="border-b border-white/5 text-[var(--color-cream)]"
                          >
                            <td className="py-2 pr-4">
                              {row.cups === 0.25
                                ? '\u00bc'
                                : row.cups === 0.5
                                  ? '\u00bd'
                                  : row.cups}
                            </td>
                            <td className="py-2 pr-4 font-medium text-[var(--color-accent)]">
                              {row.grams} g
                            </td>
                            <td className="py-2">{row.oz} oz</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Precision note */}
                <Alert variant="tip" title="Baking precision">
                  {result.precisionNote} Professional bakers weigh ingredients because measuring
                  cups can vary by 10-20% depending on technique. A $15 kitchen scale is the single
                  best upgrade for consistent baking.
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Enter an amount">
                Enter a positive amount to see the conversion.
              </Alert>
            )}

            {/* Share */}
            {inputs.amount > 0 && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`${formatAmount(inputs.amount, inputs.fromUnit)} ${INGREDIENT_LABELS[inputs.ingredient]} = ${formatAmount(result.convertedAmount, inputs.toUnit)}`}
                  calculatorName="Baking Conversion Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
