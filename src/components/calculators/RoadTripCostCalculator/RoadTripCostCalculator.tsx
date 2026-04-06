/**
 * Road Trip Cost Calculator - Preact Component
 */

import { useMemo } from 'preact/hooks';
import { calculateRoadTripCost, formatCurrency, formatNumber } from './calculations';
import { getDefaultInputs, type RoadTripInputs, type DistanceUnit, type FuelUnit } from './types';
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
  ButtonGroup,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

const DISTANCE_OPTIONS = [
  { value: 'miles' as DistanceUnit, label: 'Miles' },
  { value: 'km' as DistanceUnit, label: 'Kilometers' },
];

const FUEL_OPTIONS_IMPERIAL = [{ value: 'mpg' as FuelUnit, label: 'MPG' }];
const FUEL_OPTIONS_METRIC = [
  { value: 'l100km' as FuelUnit, label: 'L/100km' },
  { value: 'kmpl' as FuelUnit, label: 'km/L' },
];

export default function RoadTripCostCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorState<
    RoadTripInputs,
    ReturnType<typeof calculateRoadTripCost>
  >({
    name: 'Road Trip Cost Calculator',
    defaults: () => getDefaultInputs(getInitialCurrency()),
    compute: calculateRoadTripCost,
  });

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const fuelUnitOptions = useMemo(
    () => (inputs.unit === 'miles' ? FUEL_OPTIONS_IMPERIAL : FUEL_OPTIONS_METRIC),
    [inputs.unit]
  );

  const fuelPriceLabel = inputs.fuelUnit === 'mpg' ? 'Price per Gallon' : 'Price per Liter';

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const handleDistanceUnitChange = (newUnit: DistanceUnit) => {
    setInputs((prev) => {
      // Convert distance when switching units
      const converted =
        newUnit === 'km'
          ? Math.round(prev.totalDistance * 1.60934)
          : Math.round(prev.totalDistance / 1.60934);

      // Switch fuel unit to match
      const newFuelUnit: FuelUnit = newUnit === 'miles' ? 'mpg' : 'l100km';
      // Convert fuel economy
      let newFuelEconomy = prev.fuelEconomy;
      if (prev.fuelUnit === 'mpg' && newFuelUnit === 'l100km') {
        newFuelEconomy =
          prev.fuelEconomy > 0 ? Math.round((235.215 / prev.fuelEconomy) * 10) / 10 : 8;
      } else if (
        (prev.fuelUnit === 'l100km' || prev.fuelUnit === 'kmpl') &&
        newFuelUnit === 'mpg'
      ) {
        newFuelEconomy =
          prev.fuelUnit === 'l100km' && prev.fuelEconomy > 0
            ? Math.round((235.215 / prev.fuelEconomy) * 10) / 10
            : 25;
      }

      // Convert fuel price
      const newFuelPrice =
        prev.fuelUnit === 'mpg' && newFuelUnit !== 'mpg'
          ? Math.round((prev.fuelPrice / 3.78541) * 100) / 100
          : prev.fuelUnit !== 'mpg' && newFuelUnit === 'mpg'
            ? Math.round(prev.fuelPrice * 3.78541 * 100) / 100
            : prev.fuelPrice;

      return {
        ...prev,
        unit: newUnit,
        totalDistance: converted,
        fuelUnit: newFuelUnit,
        fuelEconomy: newFuelEconomy,
        fuelPrice: newFuelPrice,
      };
    });
  };

  const drivingSavings = result.comparisonToFlying - result.totalTripCost;
  const isDrivingCheaper = drivingSavings > 0;

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        <CalculatorHeader
          title="Road Trip Cost Calculator"
          subtitle="Calculate fuel, food, hotel, and total trip costs"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Distance Unit Toggle */}
            <div>
              <Label>Distance Unit</Label>
              <ButtonGroup
                options={DISTANCE_OPTIONS}
                value={inputs.unit}
                onChange={handleDistanceUnitChange}
                columns={2}
                size="sm"
                aria-label="Distance unit"
              />
            </div>

            {/* Total Distance */}
            <div>
              <Label htmlFor="totalDistance" required>
                Total Distance ({inputs.unit === 'miles' ? 'mi' : 'km'})
              </Label>
              <Input
                id="totalDistance"
                type="number"
                min={0}
                step={10}
                value={inputs.totalDistance}
                onChange={(e) => updateInput('totalDistance', Number(e.target.value))}
              />
            </div>

            {/* Fuel Economy */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div>
                <Label htmlFor="fuelEconomy" required>
                  Fuel Economy ({inputs.fuelUnit.toUpperCase()})
                </Label>
                <Input
                  id="fuelEconomy"
                  type="number"
                  min={0}
                  step={0.1}
                  value={inputs.fuelEconomy}
                  onChange={(e) => updateInput('fuelEconomy', Number(e.target.value))}
                />
                {fuelUnitOptions.length > 1 && (
                  <div className="mt-2">
                    <ButtonGroup
                      options={fuelUnitOptions}
                      value={inputs.fuelUnit}
                      onChange={(v) => updateInput('fuelUnit', v)}
                      columns={2}
                      size="sm"
                      aria-label="Fuel economy unit"
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="fuelPrice" required>
                  {fuelPriceLabel}
                </Label>
                <Input
                  id="fuelPrice"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  type="number"
                  min={0}
                  step={0.01}
                  value={inputs.fuelPrice}
                  onChange={(e) => updateInput('fuelPrice', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Trip Duration & Passengers */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div>
                <Label htmlFor="tripDays" required>
                  Trip Duration (days)
                </Label>
                <Input
                  id="tripDays"
                  type="number"
                  min={1}
                  max={60}
                  step={1}
                  value={inputs.tripDays}
                  onChange={(e) => updateInput('tripDays', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="passengers" required>
                  Passengers
                </Label>
                <Input
                  id="passengers"
                  type="number"
                  min={1}
                  max={10}
                  step={1}
                  value={inputs.passengers}
                  onChange={(e) =>
                    updateInput('passengers', Math.min(10, Math.max(1, Number(e.target.value))))
                  }
                />
              </div>
            </Grid>

            {/* Expenses */}
            <Grid responsive={{ sm: 3 }} gap="md">
              <div>
                <Label htmlFor="tolls">Tolls (total)</Label>
                <Input
                  id="tolls"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  type="number"
                  min={0}
                  step={1}
                  value={inputs.tolls}
                  onChange={(e) => updateInput('tolls', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="foodBudgetPerDay">Food per Person/Day</Label>
                <Input
                  id="foodBudgetPerDay"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  type="number"
                  min={0}
                  step={5}
                  value={inputs.foodBudgetPerDay}
                  onChange={(e) => updateInput('foodBudgetPerDay', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="hotelPerNight">Hotel per Night</Label>
                <Input
                  id="hotelPerNight"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  type="number"
                  min={0}
                  step={10}
                  value={inputs.hotelPerNight}
                  onChange={(e) => updateInput('hotelPerNight', Number(e.target.value))}
                />
              </div>
            </Grid>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {inputs.totalDistance > 0 ? (
              <>
                {/* Primary Result - Cost Per Person */}
                <ResultCard
                  label="Cost Per Person"
                  value={formatCurrency(result.costPerPerson, inputs.currency)}
                  subtitle={`Split between ${inputs.passengers} passenger${inputs.passengers > 1 ? 's' : ''}`}
                  footer={
                    <>
                      Total trip cost:{' '}
                      <span className="font-semibold text-[var(--color-accent)]">
                        {formatCurrency(result.totalTripCost, inputs.currency)}
                      </span>
                    </>
                  }
                />

                {/* Cost Breakdown */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Fuel"
                    value={formatCurrency(result.totalFuelCost, inputs.currency)}
                    sublabel={`${formatNumber(result.fuelVolume)} ${result.fuelVolumeLabel}`}
                    valueColor="text-[var(--color-accent)]"
                  />
                  <MetricCard
                    label="Food"
                    value={formatCurrency(result.totalFoodCost, inputs.currency)}
                    sublabel={`${inputs.tripDays} days`}
                  />
                  <MetricCard
                    label="Hotels"
                    value={formatCurrency(result.totalHotelCost, inputs.currency)}
                    sublabel={`${Math.max(0, inputs.tripDays - 1)} night${inputs.tripDays - 1 !== 1 ? 's' : ''}`}
                  />
                  <MetricCard
                    label="Tolls"
                    value={formatCurrency(inputs.tolls, inputs.currency)}
                    sublabel="total"
                  />
                </Grid>

                {/* Trip Stats */}
                <Grid responsive={{ sm: 2, md: 3 }} gap="md">
                  <MetricCard
                    label={`Cost ${result.costPerMileLabel}`}
                    value={formatCurrency(result.costPerMile, inputs.currency)}
                    sublabel="all expenses"
                  />
                  <MetricCard
                    label="Daily Cost"
                    value={formatCurrency(result.dailyCost, inputs.currency)}
                    sublabel="average per day"
                  />
                  <MetricCard
                    label="Total Trip"
                    value={formatCurrency(result.totalTripCost, inputs.currency)}
                    sublabel="all costs included"
                    valueColor="text-[var(--color-accent)]"
                  />
                </Grid>

                {/* CO2 Emissions */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Environmental Impact
                  </h3>
                  <Grid responsive={{ sm: 2 }} gap="md">
                    <div className="text-center p-4 rounded-lg bg-[var(--color-void)]">
                      <div className="text-2xl font-bold text-[var(--color-cream)]">
                        {formatNumber(result.co2Emissions, 0)} kg
                      </div>
                      <div className="text-sm text-[var(--color-subtle)] mt-1">CO2 emissions</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[var(--color-void)]">
                      <div className="text-2xl font-bold text-green-400">
                        {result.treesNeeded} tree{result.treesNeeded !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-[var(--color-subtle)] mt-1">
                        to offset (1 year)
                      </div>
                    </div>
                  </Grid>
                </div>

                {/* vs Flying Comparison */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Driving vs Flying
                  </h3>
                  <Grid responsive={{ sm: 2 }} gap="md">
                    <div className="text-center p-4 rounded-lg bg-[var(--color-void)]">
                      <div className="text-xs uppercase tracking-wider text-[var(--color-subtle)] mb-2">
                        Driving
                      </div>
                      <div className="text-2xl font-bold text-[var(--color-accent)]">
                        {formatCurrency(result.totalTripCost, inputs.currency)}
                      </div>
                      <div className="text-sm text-[var(--color-subtle)] mt-1">
                        {inputs.passengers} passenger{inputs.passengers > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[var(--color-void)]">
                      <div className="text-xs uppercase tracking-wider text-[var(--color-subtle)] mb-2">
                        Flying (est.)
                      </div>
                      <div className="text-2xl font-bold text-blue-400">
                        {formatCurrency(result.comparisonToFlying, inputs.currency)}
                      </div>
                      <div className="text-sm text-[var(--color-subtle)] mt-1">economy class</div>
                    </div>
                  </Grid>
                  <div className="mt-4 text-center">
                    <span
                      className={`text-sm font-medium ${isDrivingCheaper ? 'text-green-400' : 'text-rose-400'}`}
                    >
                      {isDrivingCheaper
                        ? `Driving saves ${formatCurrency(drivingSavings, inputs.currency)}`
                        : `Flying saves ${formatCurrency(Math.abs(drivingSavings), inputs.currency)}`}
                    </span>
                    <span className="text-xs text-[var(--color-muted)] block mt-1">
                      Flight estimate is approximate and excludes baggage, hotels at destination,
                      etc.
                    </span>
                  </div>
                </div>

                <Alert variant="tip" title="Budget tip:">
                  Adding passengers reduces your per-person cost significantly. A road trip with 4
                  people costs each person roughly half what 2 travelers pay.
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Enter trip details">
                Enter your trip distance to calculate road trip costs.
              </Alert>
            )}

            {/* Share Results */}
            {inputs.totalDistance > 0 && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Road trip: ${inputs.totalDistance} ${inputs.unit}, ${inputs.tripDays} days, ${inputs.passengers} passengers. Total: ${formatCurrency(result.totalTripCost, inputs.currency)} (${formatCurrency(result.costPerPerson, inputs.currency)}/person). Fuel: ${formatCurrency(result.totalFuelCost, inputs.currency)}, CO2: ${formatNumber(result.co2Emissions, 0)} kg`}
                  calculatorName="Road Trip Cost Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
