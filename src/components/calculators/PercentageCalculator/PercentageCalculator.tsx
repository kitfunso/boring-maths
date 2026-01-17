/**
 * Percentage Calculator - React Component
 *
 * Handles multiple percentage calculations:
 * - What is X% of Y?
 * - X is what % of Y?
 * - Percentage change from X to Y
 * - X increased/decreased by Y%
 */

import { useState, useMemo } from 'preact/hooks';
import { calculate, formatNumber, formatPercent } from './calculations';
import {
  getDefaultInputs,
  MODE_OPTIONS,
  type PercentageCalculatorInputs,
  type CalculationMode,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function PercentageCalculator() {
  const [inputs, setInputs] = useState<PercentageCalculatorInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculate(inputs), [inputs]);

  const updateInput = <K extends keyof PercentageCalculatorInputs>(
    field: K,
    value: PercentageCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const modeOptions = MODE_OPTIONS.map((m) => ({
    value: m.value,
    label: m.label,
  }));

  const currentMode = MODE_OPTIONS.find((m) => m.value === inputs.mode);

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        <CalculatorHeader
          title="Percentage Calculator"
          subtitle="Calculate percentages quickly and easily"
        />

        <div className="p-6 md:p-8">
          {/* Mode Selection */}
          <div className="mb-8">
            <Label>Calculation Type</Label>
            <ButtonGroup
              options={modeOptions}
              value={inputs.mode}
              onChange={(value) => updateInput('mode', value as CalculationMode)}
              columns={2}
            />
            <p className="text-sm text-[var(--color-muted)] mt-2 text-center">
              {currentMode?.question}
            </p>
          </div>

          {/* Dynamic Input Fields Based on Mode */}
          <div className="space-y-6 mb-8">
            {inputs.mode === 'percentOf' && (
              <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
                <div>
                  <Label htmlFor="percentOf_percentage" required>
                    Percentage
                  </Label>
                  <Input
                    id="percentOf_percentage"
                    variant="percentage"
                    type="number"
                    min={0}
                    step={1}
                    value={inputs.percentOf_percentage}
                    onChange={(e) => updateInput('percentOf_percentage', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="percentOf_value" required>
                    Of Value
                  </Label>
                  <Input
                    id="percentOf_value"
                    type="number"
                    step="any"
                    value={inputs.percentOf_value}
                    onChange={(e) => updateInput('percentOf_value', Number(e.target.value))}
                  />
                </div>
              </Grid>
            )}

            {inputs.mode === 'whatPercent' && (
              <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
                <div>
                  <Label htmlFor="whatPercent_partValue" required>
                    Part Value
                  </Label>
                  <Input
                    id="whatPercent_partValue"
                    type="number"
                    step="any"
                    value={inputs.whatPercent_partValue}
                    onChange={(e) => updateInput('whatPercent_partValue', Number(e.target.value))}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">The number you have</p>
                </div>
                <div>
                  <Label htmlFor="whatPercent_wholeValue" required>
                    Whole Value
                  </Label>
                  <Input
                    id="whatPercent_wholeValue"
                    type="number"
                    step="any"
                    value={inputs.whatPercent_wholeValue}
                    onChange={(e) => updateInput('whatPercent_wholeValue', Number(e.target.value))}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">The total (100%)</p>
                </div>
              </Grid>
            )}

            {inputs.mode === 'percentChange' && (
              <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
                <div>
                  <Label htmlFor="percentChange_fromValue" required>
                    From Value
                  </Label>
                  <Input
                    id="percentChange_fromValue"
                    type="number"
                    step="any"
                    value={inputs.percentChange_fromValue}
                    onChange={(e) => updateInput('percentChange_fromValue', Number(e.target.value))}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">Original amount</p>
                </div>
                <div>
                  <Label htmlFor="percentChange_toValue" required>
                    To Value
                  </Label>
                  <Input
                    id="percentChange_toValue"
                    type="number"
                    step="any"
                    value={inputs.percentChange_toValue}
                    onChange={(e) => updateInput('percentChange_toValue', Number(e.target.value))}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">New amount</p>
                </div>
              </Grid>
            )}

            {inputs.mode === 'increaseDecrease' && (
              <>
                <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
                  <div>
                    <Label htmlFor="increaseDecrease_value" required>
                      Starting Value
                    </Label>
                    <Input
                      id="increaseDecrease_value"
                      type="number"
                      step="any"
                      value={inputs.increaseDecrease_value}
                      onChange={(e) =>
                        updateInput('increaseDecrease_value', Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="increaseDecrease_percentage" required>
                      Percentage
                    </Label>
                    <Input
                      id="increaseDecrease_percentage"
                      variant="percentage"
                      type="number"
                      min={0}
                      step={1}
                      value={inputs.increaseDecrease_percentage}
                      onChange={(e) =>
                        updateInput('increaseDecrease_percentage', Number(e.target.value))
                      }
                    />
                  </div>
                </Grid>
                <div>
                  <Label>Operation</Label>
                  <ButtonGroup
                    options={[
                      { value: 'increase', label: 'Increase (+)' },
                      { value: 'decrease', label: 'Decrease (-)' },
                    ]}
                    value={inputs.increaseDecrease_isIncrease ? 'increase' : 'decrease'}
                    onChange={(value) =>
                      updateInput('increaseDecrease_isIncrease', value === 'increase')
                    }
                  />
                </div>
              </>
            )}
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label={result.primaryLabel}
              value={result.formattedPrimary}
              subtitle={
                result.mode === 'percentChange'
                  ? result.primaryResult >= 0
                    ? 'Increase'
                    : 'Decrease'
                  : undefined
              }
            />

            {/* Secondary Metrics */}
            {result.secondaryResult !== undefined && (
              <Grid responsive={{ sm: 2, md: 2 }} gap="md">
                <MetricCard
                  label={result.secondaryLabel || 'Difference'}
                  value={result.formattedSecondary || ''}
                  sublabel={result.mode === 'percentChange' ? 'absolute change' : undefined}
                />
                {result.mode === 'whatPercent' && (
                  <MetricCard
                    label="Remaining %"
                    value={formatPercent(100 - result.primaryResult)}
                    sublabel="of whole"
                  />
                )}
                {result.mode === 'percentChange' && (
                  <MetricCard
                    label="Multiplier"
                    value={`${result.primaryResult >= 0 ? '' : ''}${formatNumber(1 + result.primaryResult / 100, 3)}x`}
                    sublabel="factor"
                  />
                )}
              </Grid>
            )}

            {/* Common Percentages Table (for percentOf mode) */}
            {result.commonPercentages && (
              <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Quick Reference: Percentages of {formatNumber(inputs.percentOf_value)}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {result.commonPercentages.map((item) => (
                    <button
                      key={item.percentage}
                      onClick={() => updateInput('percentOf_percentage', item.percentage)}
                      className={`p-3 rounded-lg border transition-all text-center ${
                        item.percentage === inputs.percentOf_percentage
                          ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/50'
                          : 'bg-[var(--color-void)] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <p className="text-sm text-[var(--color-muted)]">{item.percentage}%</p>
                      <p className="text-lg font-bold text-[var(--color-cream)] tabular-nums">
                        {item.formatted}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <Alert variant="tip" title="Quick tip:">
              {inputs.mode === 'percentOf' &&
                'To find 10% of any number, just move the decimal point one place left.'}
              {inputs.mode === 'whatPercent' &&
                'Divide the part by the whole and multiply by 100 to get the percentage.'}
              {inputs.mode === 'percentChange' &&
                'A positive result means an increase, negative means a decrease.'}
              {inputs.mode === 'increaseDecrease' &&
                "Tip: To reverse a percentage change, you need a different percentage. A 20% decrease followed by 20% increase doesn't return to the original."}
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`${result.primaryLabel} = ${result.formattedPrimary}`}
                calculatorName="Percentage Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
