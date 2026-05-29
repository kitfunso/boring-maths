/**
 * Concrete Calculator - React Component
 *
 * Estimates bags of concrete and total volume for a slab, footing, or column.
 */
import { calculateConcreteCalculator } from './calculations';
import {
  getDefaultInputs,
  type ConcreteCalculatorInputs,
  type ConcreteCalculatorResult,
  type ConcreteShape,
  type ConcreteUnit,
} from './types';
import {
  type Currency,
  getCurrencySymbol,
  getInitialCurrency,
  formatCurrency,
} from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Select,
  ButtonGroup,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';

const SHAPE_OPTIONS = [
  { value: 'slab', label: 'Slab' },
  { value: 'footing', label: 'Footing' },
  { value: 'column', label: 'Column' },
];

const UNIT_OPTIONS = [
  { value: 'm', label: 'Metres' },
  { value: 'ft', label: 'Feet' },
];

export default function ConcreteCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorBase<
    ConcreteCalculatorInputs,
    ConcreteCalculatorResult
  >({
    name: 'Concrete Calculator',
    slug: 'calc-concrete-calculator-inputs',
    defaults: () => getDefaultInputs(getInitialCurrency('GBP')),
    compute: calculateConcreteCalculator,
  });

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const fmt = (value: number) => formatCurrency(value, inputs.currency, 2);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs((prev) => ({ ...prev, currency: newCurrency }));
  };

  const isColumn = inputs.shape === 'column';
  const unitLabel = inputs.unit === 'ft' ? 'ft' : 'm';

  // Labels switch for column: diameter + height instead of width + depth.
  const firstDimLabel = isColumn ? 'Diameter' : 'Width';
  const secondDimLabel = isColumn ? 'Height' : 'Depth';

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        <CalculatorHeader
          title="Concrete Calculator"
          subtitle="Estimate bags and volume for a slab, footing, or column pour"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider">
                Pour Details
              </div>

              {/* Shape */}
              <div>
                <Label>Shape</Label>
                <Select
                  options={SHAPE_OPTIONS}
                  value={inputs.shape}
                  onChange={(value) => updateInput('shape', value as ConcreteShape)}
                />
              </div>

              {/* Units */}
              <div>
                <Label>Units</Label>
                <ButtonGroup
                  options={UNIT_OPTIONS}
                  value={inputs.unit}
                  onChange={(value) => updateInput('unit', value as ConcreteUnit)}
                  columns={2}
                />
              </div>

              {/* Dimensions */}
              <div>
                <div className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                  Dimensions ({unitLabel})
                </div>
                <Grid cols={isColumn ? 2 : 3} gap="md">
                  {!isColumn && (
                    <div>
                      <Label htmlFor="length">Length</Label>
                      <Input
                        id="length"
                        type="number"
                        min={0}
                        step={0.1}
                        value={inputs.length}
                        onChange={(e) =>
                          updateInput('length', Number((e.target as HTMLInputElement).value))
                        }
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="width">{firstDimLabel}</Label>
                    <Input
                      id="width"
                      type="number"
                      min={0}
                      step={0.1}
                      value={inputs.width}
                      onChange={(e) =>
                        updateInput('width', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="depth">{secondDimLabel}</Label>
                    <Input
                      id="depth"
                      type="number"
                      min={0}
                      step={0.05}
                      value={inputs.depth}
                      onChange={(e) =>
                        updateInput('depth', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                </Grid>
              </div>

              <Divider />

              <div className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider">
                Material and Cost
              </div>

              <Grid cols={2} gap="md">
                <div>
                  <Label htmlFor="wastePct">Waste Allowance (%)</Label>
                  <Input
                    id="wastePct"
                    type="number"
                    variant="percentage"
                    min={0}
                    max={50}
                    step={1}
                    value={inputs.wastePct}
                    onChange={(e) =>
                      updateInput('wastePct', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="bagYield">Bag Yield (cubic metres per bag)</Label>
                  <Input
                    id="bagYield"
                    type="number"
                    min={0.001}
                    step={0.001}
                    value={inputs.bagYield}
                    onChange={(e) =>
                      updateInput('bagYield', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              </Grid>

              <div>
                <Label htmlFor="bagPrice">Price Per Bag ({currencySymbol})</Label>
                <Input
                  id="bagPrice"
                  type="number"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={0.5}
                  value={inputs.bagPrice}
                  onChange={(e) =>
                    updateInput('bagPrice', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              {result.isInvalid ? (
                <Alert variant="warning" title="Add your dimensions">
                  Enter all dimensions and a bag yield above zero to see how much concrete you need.
                </Alert>
              ) : (
                <>
                  <ResultCard
                    label="Concrete Bags Needed"
                    value={`${result.bags} bags`}
                    subtitle={`For ${result.volumeWithWasteM3} cubic metres including ${inputs.wastePct}% waste`}
                    footer={
                      inputs.bagPrice > 0 ? (
                        <>
                          Estimated material cost: <strong>{fmt(result.cost)}</strong>
                        </>
                      ) : undefined
                    }
                  />

                  <Grid responsive={{ sm: 2, md: 3 }} gap="md">
                    <MetricCard
                      label="Volume"
                      value={`${result.volumeM3} m3`}
                      sublabel="Before waste"
                    />
                    <MetricCard
                      label="Cubic Yards"
                      value={`${result.cubicYards}`}
                      sublabel="With waste"
                    />
                    <MetricCard label="Cost" value={fmt(result.cost)} sublabel="Bags only" />
                  </Grid>

                  <Alert variant="tip" title="Tip:">
                    Ready-mix concrete is usually sold by the cubic metre. If your volume is more
                    than about 1 cubic metre, ordering ready-mix is often cheaper and faster than
                    mixing bags by hand.
                  </Alert>

                  <div className="flex justify-center pt-4">
                    <ShareResults
                      result={`Concrete needed: ${result.bags} bags (${result.volumeWithWasteM3} m3 including ${inputs.wastePct}% waste)`}
                      calculatorName="Concrete Calculator"
                    />
                  </div>
                </>
              )}
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
