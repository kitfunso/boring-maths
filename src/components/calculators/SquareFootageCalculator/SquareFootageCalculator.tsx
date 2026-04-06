/**
 * Square Footage Calculator - Component
 *
 * Interactive calculator for room area with multiple shapes,
 * unit conversion, and cost estimation.
 */
import { calculateSquareFootage, formatArea } from './calculations';
import {
  getDefaultInputs,
  type SquareFootageCalculatorInputs,
  type RoomShape,
  type CircleMode,
  type UnitSystem,
} from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  ButtonGroup,
  Toggle,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import PrintResults from '../../ui/PrintResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';

const SHAPE_OPTIONS: { value: RoomShape; label: string }[] = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'circle', label: 'Circle' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'l-shape', label: 'L-Shape' },
];

const CIRCLE_MODE_OPTIONS: { value: CircleMode; label: string }[] = [
  { value: 'radius', label: 'Radius' },
  { value: 'diameter', label: 'Diameter' },
];

function formatCost(value: number, currency: Currency): string {
  return formatCurrencyByRegion(value, currency, 2);
}

/**
 * Dimension input pair: main value + inches (imperial only)
 */
function DimensionInput({
  label: fieldLabel,
  id,
  mainValue,
  inchesValue,
  onMainChange,
  onInchesChange,
  isMetric,
}: {
  label: string;
  id: string;
  mainValue: number;
  inchesValue: number;
  onMainChange: (v: number) => void;
  onInchesChange: (v: number) => void;
  isMetric: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{fieldLabel}</Label>
      {isMetric ? (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              id={id}
              min={0}
              step={0.01}
              value={mainValue}
              onChange={(e) => onMainChange(Number((e.target as HTMLInputElement).value))}
            />
          </div>
          <span className="text-sm text-[var(--color-subtle)] whitespace-nowrap">metres</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              id={id}
              min={0}
              step={1}
              value={mainValue}
              onChange={(e) => onMainChange(Number((e.target as HTMLInputElement).value))}
            />
          </div>
          <span className="text-sm text-[var(--color-subtle)]">ft</span>
          <div className="w-20">
            <Input
              id={`${id}-inches`}
              min={0}
              max={11}
              step={1}
              value={inchesValue}
              onChange={(e) => onInchesChange(Number((e.target as HTMLInputElement).value))}
            />
          </div>
          <span className="text-sm text-[var(--color-subtle)]">in</span>
        </div>
      )}
    </div>
  );
}

export default function SquareFootageCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorBase<SquareFootageCalculatorInputs, ReturnType<typeof calculateSquareFootage>>({
    name: 'Square Footage Calculator',
    slug: 'calc-sqft-inputs',
    defaults: () => getDefaultInputs(getInitialCurrency()),
    compute: calculateSquareFootage,
  });

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const isMetric = inputs.unitSystem === 'metric';

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const unitLabel = isMetric ? 'sq m' : 'sq ft';

  return (
    <ThemeProvider defaultColor="ocean">
      <Card variant="elevated">
        <CalculatorHeader
          title="Square Footage Calculator"
          subtitle="Calculate area for any room shape"
          actions={
            inputs.showCostEstimate ? (
              <CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />
            ) : undefined
          }
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Unit System Toggle */}
            <div className="flex items-center justify-between">
              <ButtonGroup
                options={[
                  { value: 'imperial' as UnitSystem, label: 'Feet + Inches' },
                  { value: 'metric' as UnitSystem, label: 'Metres' },
                ]}
                value={inputs.unitSystem}
                onChange={(v) => updateInput('unitSystem', v)}
                columns={2}
                size="sm"
                aria-label="Measurement unit system"
              />
            </div>

            {/* Room Shape Selection */}
            <div>
              <Label>Room Shape</Label>
              <ButtonGroup
                options={SHAPE_OPTIONS}
                value={inputs.shape}
                onChange={(v) => updateInput('shape', v)}
                columns={4}
                aria-label="Room shape"
              />
            </div>

            {/* Shape-specific Inputs */}
            {inputs.shape === 'rectangle' && (
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <DimensionInput
                  label="Length"
                  id="rectLength"
                  mainValue={inputs.rectLengthMain}
                  inchesValue={inputs.rectLengthInches}
                  onMainChange={(v) => updateInput('rectLengthMain', v)}
                  onInchesChange={(v) => updateInput('rectLengthInches', v)}
                  isMetric={isMetric}
                />
                <DimensionInput
                  label="Width"
                  id="rectWidth"
                  mainValue={inputs.rectWidthMain}
                  inchesValue={inputs.rectWidthInches}
                  onMainChange={(v) => updateInput('rectWidthMain', v)}
                  onInchesChange={(v) => updateInput('rectWidthInches', v)}
                  isMetric={isMetric}
                />
              </Grid>
            )}

            {inputs.shape === 'circle' && (
              <div className="space-y-4">
                <div>
                  <Label>Measure by</Label>
                  <ButtonGroup
                    options={CIRCLE_MODE_OPTIONS}
                    value={inputs.circleMode}
                    onChange={(v) => updateInput('circleMode', v)}
                    columns={2}
                    size="sm"
                    aria-label="Circle measurement mode"
                  />
                </div>
                <DimensionInput
                  label={inputs.circleMode === 'radius' ? 'Radius' : 'Diameter'}
                  id="circleDim"
                  mainValue={inputs.circleMain}
                  inchesValue={inputs.circleInches}
                  onMainChange={(v) => updateInput('circleMain', v)}
                  onInchesChange={(v) => updateInput('circleInches', v)}
                  isMetric={isMetric}
                />
              </div>
            )}

            {inputs.shape === 'triangle' && (
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <DimensionInput
                  label="Base"
                  id="triBase"
                  mainValue={inputs.triBaseMain}
                  inchesValue={inputs.triBaseInches}
                  onMainChange={(v) => updateInput('triBaseMain', v)}
                  onInchesChange={(v) => updateInput('triBaseInches', v)}
                  isMetric={isMetric}
                />
                <DimensionInput
                  label="Height"
                  id="triHeight"
                  mainValue={inputs.triHeightMain}
                  inchesValue={inputs.triHeightInches}
                  onMainChange={(v) => updateInput('triHeightMain', v)}
                  onInchesChange={(v) => updateInput('triHeightInches', v)}
                  isMetric={isMetric}
                />
              </Grid>
            )}

            {inputs.shape === 'l-shape' && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-[var(--color-subtle)] mb-3">Section 1</p>
                  <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                    <DimensionInput
                      label="Length"
                      id="lLength1"
                      mainValue={inputs.lLength1Main}
                      inchesValue={inputs.lLength1Inches}
                      onMainChange={(v) => updateInput('lLength1Main', v)}
                      onInchesChange={(v) => updateInput('lLength1Inches', v)}
                      isMetric={isMetric}
                    />
                    <DimensionInput
                      label="Width"
                      id="lWidth1"
                      mainValue={inputs.lWidth1Main}
                      inchesValue={inputs.lWidth1Inches}
                      onMainChange={(v) => updateInput('lWidth1Main', v)}
                      onInchesChange={(v) => updateInput('lWidth1Inches', v)}
                      isMetric={isMetric}
                    />
                  </Grid>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-subtle)] mb-3">Section 2</p>
                  <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                    <DimensionInput
                      label="Length"
                      id="lLength2"
                      mainValue={inputs.lLength2Main}
                      inchesValue={inputs.lLength2Inches}
                      onMainChange={(v) => updateInput('lLength2Main', v)}
                      onInchesChange={(v) => updateInput('lLength2Inches', v)}
                      isMetric={isMetric}
                    />
                    <DimensionInput
                      label="Width"
                      id="lWidth2"
                      mainValue={inputs.lWidth2Main}
                      inchesValue={inputs.lWidth2Inches}
                      onMainChange={(v) => updateInput('lWidth2Main', v)}
                      onInchesChange={(v) => updateInput('lWidth2Inches', v)}
                      isMetric={isMetric}
                    />
                  </Grid>
                </div>
              </div>
            )}

            {/* Cost Estimator Toggle */}
            <Toggle
              checked={inputs.showCostEstimate}
              onChange={(v) => updateInput('showCostEstimate', v)}
              label="Show cost estimate"
            />

            {/* Cost Estimator Inputs */}
            {inputs.showCostEstimate && (
              <div>
                <Label htmlFor="pricePerUnit">Price per {isMetric ? 'sq metre' : 'sq foot'}</Label>
                <Input
                  id="pricePerUnit"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={0.01}
                  value={inputs.pricePerUnit}
                  onChange={(e) =>
                    updateInput('pricePerUnit', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>
            )}
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Total Area"
              value={`${formatArea(result.sqFt)} sq ft`}
              subtitle={`${formatArea(result.sqM)} sq metres / ${formatArea(result.sqYd)} sq yards`}
              footer={
                inputs.showCostEstimate && result.totalCost > 0 ? (
                  <>
                    Estimated cost:{' '}
                    <span className="font-semibold">
                      {formatCost(result.totalCost, result.currency)}
                    </span>{' '}
                    at {formatCost(result.pricePerUnit, result.currency)}/{unitLabel}
                  </>
                ) : undefined
              }
            />

            {/* Breakdown */}
            <Grid responsive={{ sm: 2, md: 3 }} gap="md">
              <MetricCard label="Square Feet" value={formatArea(result.sqFt)} sublabel="sq ft" />
              <MetricCard
                label="Square Metres"
                value={formatArea(result.sqM)}
                sublabel="sq m"
                valueColor="success"
              />
              <MetricCard label="Square Yards" value={formatArea(result.sqYd)} sublabel="sq yd" />
            </Grid>

            {/* Cost Breakdown */}
            {inputs.showCostEstimate && result.totalCost > 0 && (
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Cost Estimate
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-subtle)]">Area</span>
                    <span className="text-[var(--color-cream)] tabular-nums">
                      {isMetric
                        ? `${formatArea(result.sqM)} sq m`
                        : `${formatArea(result.sqFt)} sq ft`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-subtle)]">
                      Price per {isMetric ? 'sq metre' : 'sq foot'}
                    </span>
                    <span className="text-[var(--color-cream)] tabular-nums">
                      {formatCost(inputs.pricePerUnit, inputs.currency)}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between">
                    <span className="font-medium text-[var(--color-cream)]">Total Cost</span>
                    <span className="font-bold text-[var(--color-accent)] tabular-nums">
                      {formatCost(result.totalCost, inputs.currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <Alert variant="tip" title="Measurement tips:">
              For the most accurate results, measure each wall at floor level. For irregular rooms,
              break the space into simpler shapes and add the areas together. Always add 5-10% extra
              when ordering materials to account for waste and cuts.
            </Alert>

            {/* Share & Print */}
            <div className="flex justify-center gap-3 pt-4">
              <ShareResults
                result={`Area: ${formatArea(result.sqFt)} sq ft (${formatArea(result.sqM)} sq m)${inputs.showCostEstimate ? ` - Estimated cost: ${formatCost(result.totalCost, result.currency)}` : ''}`}
                calculatorName="Square Footage Calculator"
              />
              <PrintResults
                title="Square Footage Calculator Results"
                results={[
                  {
                    label: 'Shape',
                    value: inputs.shape.charAt(0).toUpperCase() + inputs.shape.slice(1),
                  },
                  { label: 'Square Feet', value: `${formatArea(result.sqFt)} sq ft` },
                  { label: 'Square Metres', value: `${formatArea(result.sqM)} sq m` },
                  { label: 'Square Yards', value: `${formatArea(result.sqYd)} sq yd` },
                  ...(inputs.showCostEstimate
                    ? [
                        {
                          label: 'Price per Unit',
                          value: `${formatCost(inputs.pricePerUnit, inputs.currency)}/${unitLabel}`,
                        },
                        {
                          label: 'Total Cost',
                          value: formatCost(result.totalCost, inputs.currency),
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
