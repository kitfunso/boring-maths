/**
 * Fuel Cost Calculator - Preact Component
 *
 * Interactive calculator for estimating journey fuel costs.
 * Supports miles/km, mpg/L per 100km, and multiple fuel price units.
 * UK-centric defaults with currency selector support.
 */
import { calculateFuelCost, formatCurrency, formatNumber } from './calculations';
import {
  getDefaultInputs,
  type FuelCostInputs,
  type FuelCostResult,
  type DistanceUnit,
  type FuelPriceUnit,
} from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
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
  Alert,
  Toggle,
  ButtonGroup,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import PrintResults from '../../ui/PrintResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';
export default function FuelCostCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorBase<
    FuelCostInputs,
    FuelCostResult
  >({
    name: 'Fuel Cost Calculator',
    slug: 'calc-fuel-cost-inputs',
    defaults: () => getDefaultInputs(getInitialCurrency('GBP')),
    compute: calculateFuelCost,
  });

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const handleDistanceUnitChange = (unit: DistanceUnit) => {
    setInputs((prev) => ({
      ...prev,
      distanceUnit: unit,
      efficiencyUnit: unit === 'miles' ? 'mpg' : 'l100km',
    }));
  };

  const fuelPriceLabel = (() => {
    switch (inputs.fuelPriceUnit) {
      case 'pence-per-litre':
        return 'Fuel Price (pence per litre)';
      case 'pounds-per-litre':
        return `Fuel Price (${currencySymbol} per litre)`;
      case 'per-gallon':
        return `Fuel Price (${currencySymbol} per UK gallon)`;
    }
  })();

  const costPerUnitLabel = inputs.distanceUnit === 'miles' ? 'Cost per Mile' : 'Cost per Kilometre';
  const costPerUnitValue = inputs.distanceUnit === 'miles' ? result.costPerMile : result.costPerKm;

  return (
    <ThemeProvider defaultColor="amber">
      <Card variant="elevated">
        <CalculatorHeader
          title="Fuel Cost Calculator"
          subtitle="Estimate the fuel cost of any journey"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Distance */}
            <div>
              <Label htmlFor="distance" required>
                Distance ({inputs.distanceUnit})
              </Label>
              <Input
                id="distance"
                type="number"
                min={0}
                step={1}
                value={inputs.distance}
                onChange={(e) => updateInput('distance', Number(e.target.value))}
              />
            </div>

            {/* Distance Unit Toggle */}
            <div>
              <Label>Distance Unit</Label>
              <ButtonGroup
                options={[
                  { value: 'miles' as DistanceUnit, label: 'Miles' },
                  { value: 'km' as DistanceUnit, label: 'Kilometres' },
                ]}
                value={inputs.distanceUnit}
                onChange={handleDistanceUnitChange}
                columns={2}
                size="sm"
                aria-label="Distance unit"
              />
            </div>

            {/* Round Trip Toggle */}
            <Toggle
              checked={inputs.roundTrip}
              onChange={(checked) => updateInput('roundTrip', checked)}
              label="Round trip (doubles the distance)"
            />

            {/* Fuel Efficiency */}
            <div>
              <Label htmlFor="efficiency" required>
                Fuel Efficiency ({inputs.efficiencyUnit === 'mpg' ? 'mpg' : 'L/100km'})
              </Label>
              <Input
                id="efficiency"
                type="number"
                min={0.1}
                step={0.1}
                value={inputs.efficiency}
                onChange={(e) => updateInput('efficiency', Number(e.target.value))}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                {inputs.efficiencyUnit === 'mpg'
                  ? 'Miles per UK gallon. A typical car does 35-45 mpg.'
                  : 'Litres per 100 km. A typical car uses 5-8 L/100km.'}
              </p>
            </div>

            {/* Fuel Price Unit */}
            <div>
              <Label>Fuel Price Unit</Label>
              <ButtonGroup
                options={
                  inputs.currency === 'GBP'
                    ? [
                        { value: 'pence-per-litre' as FuelPriceUnit, label: 'Pence/Litre' },
                        {
                          value: 'pounds-per-litre' as FuelPriceUnit,
                          label: `${currencySymbol}/Litre`,
                        },
                        {
                          value: 'per-gallon' as FuelPriceUnit,
                          label: `${currencySymbol}/${inputs.gallonType === 'us' ? 'US' : 'UK'} Gallon`,
                        },
                      ]
                    : [
                        {
                          value: 'pounds-per-litre' as FuelPriceUnit,
                          label: `${currencySymbol}/Litre`,
                        },
                        { value: 'per-gallon' as FuelPriceUnit, label: `${currencySymbol}/Gallon` },
                      ]
                }
                value={inputs.fuelPriceUnit}
                onChange={(unit) => updateInput('fuelPriceUnit', unit)}
                columns={inputs.currency === 'GBP' ? 3 : 2}
                size="sm"
                aria-label="Fuel price unit"
              />
            </div>

            {/* Fuel Price */}
            <div>
              <Label htmlFor="fuelPrice" required>
                {fuelPriceLabel}
              </Label>
              <Input
                id="fuelPrice"
                type="number"
                min={0}
                step={inputs.fuelPriceUnit === 'pence-per-litre' ? 1 : 0.01}
                value={inputs.fuelPrice}
                onChange={(e) => updateInput('fuelPrice', Number(e.target.value))}
              />
            </div>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Total Fuel Cost"
              value={formatCurrency(result.totalCost, result.currency)}
              subtitle={
                inputs.roundTrip
                  ? `Round trip: ${formatNumber(result.effectiveDistance, 0)} ${result.distanceUnit}`
                  : `${formatNumber(result.effectiveDistance, 0)} ${result.distanceUnit}`
              }
            />

            {/* Breakdown */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Fuel Needed"
                value={`${formatNumber(result.fuelNeededLitres)} L`}
                sublabel={`${formatNumber(result.fuelNeededGallons)} ${inputs.gallonType === 'us' ? 'US' : 'UK'} gallons`}
              />
              <MetricCard
                label={costPerUnitLabel}
                value={formatCurrency(costPerUnitValue, result.currency)}
                sublabel="running cost"
                valueColor="success"
              />
              <MetricCard
                label="Cost per Mile"
                value={formatCurrency(result.costPerMile, result.currency)}
                sublabel="per mile"
              />
              <MetricCard
                label="Cost per Kilometre"
                value={formatCurrency(result.costPerKm, result.currency)}
                sublabel="per km"
              />
            </Grid>

            {/* Tip */}
            <Alert variant="tip" title="Saving on fuel:">
              Driving at a steady speed, keeping tyres properly inflated, and removing excess weight
              from your vehicle can improve fuel efficiency by up to 15%. Avoid harsh braking and
              acceleration where possible.
            </Alert>

            {/* Share and Print */}
            <div className="flex justify-center gap-3 pt-4">
              <ShareResults
                result={`Fuel cost: ${formatCurrency(result.totalCost, result.currency)} for ${formatNumber(result.effectiveDistance, 0)} ${result.distanceUnit} (${formatNumber(result.fuelNeededLitres)} litres needed)`}
                calculatorName="Fuel Cost Calculator"
              />
              <PrintResults
                title="Fuel Cost Calculator Results"
                results={[
                  {
                    label: 'Distance',
                    value: `${formatNumber(result.effectiveDistance, 0)} ${result.distanceUnit}${inputs.roundTrip ? ' (round trip)' : ''}`,
                  },
                  {
                    label: 'Fuel Efficiency',
                    value:
                      inputs.efficiencyUnit === 'mpg'
                        ? `${inputs.efficiency} mpg`
                        : `${inputs.efficiency} L/100km`,
                  },
                  {
                    label: 'Fuel Needed',
                    value: `${formatNumber(result.fuelNeededLitres)} litres`,
                  },
                  {
                    label: 'Total Cost',
                    value: formatCurrency(result.totalCost, result.currency),
                  },
                  {
                    label: 'Cost per Mile',
                    value: formatCurrency(result.costPerMile, result.currency),
                  },
                  {
                    label: 'Cost per Kilometre',
                    value: formatCurrency(result.costPerKm, result.currency),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
