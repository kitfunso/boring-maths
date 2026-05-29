/**
 * Gravel Calculator - React Component
 *
 * Calculate tonnes of gravel, volume, bulk bags, and optional cost
 * for driveways, paths, and beds. Uses the shared design-system UI kit.
 */
import { calculateGravelCalculator } from './calculations';
import {
  getDefaultInputs,
  GRAVEL_TYPES,
  type GravelCalculatorInputs,
  type GravelCalculatorResult,
  type GravelType,
  type GravelUnit,
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

const UNIT_OPTIONS = [
  { value: 'm', label: 'Metres' },
  { value: 'ft', label: 'Feet' },
];

const GRAVEL_TYPE_OPTIONS = (Object.keys(GRAVEL_TYPES) as GravelType[]).map((key) => ({
  value: key,
  label: GRAVEL_TYPES[key].label,
}));

export default function GravelCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorBase<
    GravelCalculatorInputs,
    GravelCalculatorResult
  >({
    name: 'Gravel Calculator',
    slug: 'calc-gravel-calculator-inputs',
    defaults: () => getDefaultInputs(getInitialCurrency('GBP')),
    compute: calculateGravelCalculator,
  });

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const fmt = (value: number) => formatCurrency(value, inputs.currency, 2);
  const dimUnitLabel = inputs.unit === 'ft' ? 'feet' : 'metres';

  const handleCurrencyChange = (newCurrency: Currency) => {
    updateInput('currency', newCurrency);
  };

  // Selecting a named gravel type sets its typical density. 'custom' keeps
  // whatever density is currently entered so the user can type their own.
  const handleGravelTypeChange = (type: GravelType) => {
    setInputs((prev) => ({
      ...prev,
      gravelType: type,
      density: type === 'custom' ? prev.density : GRAVEL_TYPES[type].density,
    }));
  };

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Gravel Calculator"
          subtitle="Work out how many tonnes and bulk bags of gravel you need"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Coverage Area
              </div>

              {/* Unit toggle */}
              <div>
                <Label>Units</Label>
                <ButtonGroup
                  options={UNIT_OPTIONS}
                  value={inputs.unit}
                  onChange={(value) => updateInput('unit', value as GravelUnit)}
                  columns={2}
                />
              </div>

              {/* Dimensions */}
              <Grid cols={2} gap="md">
                <div>
                  <Label htmlFor="gravelLength">Length ({dimUnitLabel})</Label>
                  <Input
                    id="gravelLength"
                    type="number"
                    min={0}
                    step={0.1}
                    value={inputs.length}
                    onChange={(e) =>
                      updateInput('length', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="gravelWidth">Width ({dimUnitLabel})</Label>
                  <Input
                    id="gravelWidth"
                    type="number"
                    min={0}
                    step={0.1}
                    value={inputs.width}
                    onChange={(e) =>
                      updateInput('width', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              </Grid>

              <div>
                <Label htmlFor="gravelDepth">Depth ({dimUnitLabel})</Label>
                <Input
                  id="gravelDepth"
                  type="number"
                  min={0}
                  step={inputs.unit === 'ft' ? 0.05 : 0.01}
                  value={inputs.depth}
                  onChange={(e) =>
                    updateInput('depth', Number((e.target as HTMLInputElement).value))
                  }
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  A 50mm (0.05m) layer suits paths; 75mm to 100mm suits driveways.
                </p>
              </div>

              <Divider />

              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Gravel Type and Density
              </div>

              {/* Gravel type select (maps to density) */}
              <div>
                <Label htmlFor="gravelType">Gravel Type</Label>
                <Select
                  options={GRAVEL_TYPE_OPTIONS}
                  value={inputs.gravelType}
                  onChange={(value) => handleGravelTypeChange(value as GravelType)}
                />
              </div>

              {/* Density (editable, especially for custom) */}
              <div>
                <Label htmlFor="gravelDensity">Density (tonnes per cubic metre)</Label>
                <Input
                  id="gravelDensity"
                  type="number"
                  min={0}
                  step={0.05}
                  value={inputs.density}
                  onChange={(e) => {
                    const next = Number((e.target as HTMLInputElement).value);
                    setInputs((prev) => ({ ...prev, density: next, gravelType: 'custom' }));
                  }}
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  Most loose gravels weigh 1.4 to 1.7 t/m3. Check your supplier for an exact figure.
                </p>
              </div>

              {/* Waste */}
              <div>
                <Label htmlFor="gravelWaste">Extra Allowance</Label>
                <Input
                  id="gravelWaste"
                  variant="percentage"
                  min={0}
                  max={50}
                  step={1}
                  value={inputs.wastePct}
                  onChange={(e) =>
                    updateInput('wastePct', Number((e.target as HTMLInputElement).value))
                  }
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  A 5 to 10 percent allowance covers settling and uneven ground.
                </p>
              </div>

              <Divider />

              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Cost (optional)
              </div>

              <div>
                <Label htmlFor="gravelPrice">Price per tonne ({currencySymbol})</Label>
                <Input
                  id="gravelPrice"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={1}
                  value={inputs.pricePerTonne}
                  onChange={(e) =>
                    updateInput('pricePerTonne', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              {result.isInvalid ? (
                <Alert variant="warning" title="Enter your dimensions:">
                  Enter length, width, and depth above to see how much gravel you need.
                </Alert>
              ) : (
                <>
                  <ResultCard
                    label="Gravel Needed"
                    value={`${result.tonnes} tonnes`}
                    subtitle={`${result.volumeM3} cubic metres at ${inputs.wastePct}% extra allowance`}
                    footer={
                      inputs.pricePerTonne > 0 ? (
                        <>
                          Estimated cost: <span className="font-semibold">{fmt(result.cost)}</span>{' '}
                          at {fmt(inputs.pricePerTonne)} per tonne
                        </>
                      ) : undefined
                    }
                  />

                  <Grid responsive={{ sm: 2, md: 3 }} gap="md">
                    <MetricCard
                      label="Volume"
                      value={`${result.volumeM3} m3`}
                      sublabel="before waste"
                    />
                    <MetricCard
                      label="Bulk Bags"
                      value={`${result.bulkBags}`}
                      sublabel="0.85 t per bag"
                    />
                    <MetricCard
                      label="Est. Cost"
                      value={inputs.pricePerTonne > 0 ? fmt(result.cost) : '-'}
                      sublabel="tonnes x price"
                    />
                  </Grid>

                  <Alert variant="tip" title="Buying tip:">
                    Loose tipped gravel is usually cheaper per tonne than bulk bags for large jobs,
                    but bags are easier to handle and store. Order a little extra so you do not run
                    short mid-project.
                  </Alert>

                  <div className="flex justify-center pt-4">
                    <ShareResults
                      result={`Gravel needed: ${result.tonnes} tonnes (${result.bulkBags} bulk bags) for ${result.volumeM3} cubic metres`}
                      calculatorName="Gravel Calculator"
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
