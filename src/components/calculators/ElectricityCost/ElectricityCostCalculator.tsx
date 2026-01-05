/**
 * Electricity Cost Calculator - React Component
 *
 * Interactive calculator for determining appliance electricity costs.
 * Uses the design system components.
 */

import { useState, useMemo } from 'react';
import { calculateElectricityCost, formatCurrency } from './calculations';
import {
  getDefaultInputs,
  type ElectricityCostInputs,
  type ElectricityCostResult,
  APPLIANCE_PRESETS,
} from './types';
import { type Currency, getCurrencySymbol } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';

export default function ElectricityCostCalculator() {
  const [inputs, setInputs] = useState<ElectricityCostInputs>(() => getDefaultInputs('USD'));
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result: ElectricityCostResult = useMemo(() => {
    return calculateElectricityCost(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof ElectricityCostInputs>(
    field: K,
    value: ElectricityCostInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    if (field === 'watts' || field === 'hoursPerDay') {
      setSelectedPreset(null);
    }
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
    setSelectedPreset(null);
  };

  // Select preset appliance
  const selectPreset = (presetName: string) => {
    const preset = APPLIANCE_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setInputs((prev) => ({
        ...prev,
        watts: preset.watts,
        hoursPerDay: preset.typicalHoursPerDay,
      }));
      setSelectedPreset(presetName);
    }
  };

  // Group presets by category
  const presetsByCategory = APPLIANCE_PRESETS.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, typeof APPLIANCE_PRESETS>);

  const categoryLabels: Record<string, string> = {
    heating: 'Heating',
    cooling: 'Cooling',
    kitchen: 'Kitchen',
    entertainment: 'Entertainment',
    computing: 'Computing',
    other: 'Other',
  };

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Calculate Electricity Costs"
          subtitle="See how much it costs to run any appliance"
          actions={
            <CurrencySelector
              value={inputs.currency}
              onChange={handleCurrencyChange}
            />
          }
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Quick Select Presets */}
            <div>
              <Label>Quick Select Appliance</Label>
              <div className="mt-2 space-y-4">
                {Object.entries(presetsByCategory).map(([category, presets]) => (
                  <div key={category}>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      {categoryLabels[category]}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {presets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => selectPreset(preset.name)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            selectedPreset === preset.name
                              ? 'bg-yellow-500 text-white font-medium'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Input */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="watts" required>
                  Power Consumption (Watts)
                </Label>
                <Input
                  id="watts"
                  type="number"
                  min={1}
                  max={10000}
                  value={inputs.watts}
                  onChange={(e) => updateInput('watts', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">Check appliance label or manual</p>
              </div>

              <div>
                <Label htmlFor="ratePerKwh" required>
                  Electricity Rate ({currencySymbol}/kWh)
                </Label>
                <Input
                  id="ratePerKwh"
                  type="number"
                  min={0.01}
                  max={1}
                  step={0.01}
                  value={inputs.ratePerKwh}
                  onChange={(e) => updateInput('ratePerKwh', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">Check your electricity bill</p>
              </div>
            </Grid>

            {/* Hours Per Day Slider */}
            <Slider
              label="Hours Used Per Day"
              value={inputs.hoursPerDay}
              onChange={(value) => updateInput('hoursPerDay', value)}
              min={0.25}
              max={24}
              showValue
              labels={{
                min: '15 min',
                mid: '12 hrs',
                max: '24 hrs',
                current: (v) => v < 1 ? `${Math.round(v * 60)} min` : `${v} hrs`,
              }}
            />

            {/* Days Per Month */}
            <Slider
              label="Days Used Per Month"
              value={inputs.daysPerMonth}
              onChange={(value) => updateInput('daysPerMonth', value)}
              min={1}
              max={31}
              showValue
              labels={{
                min: '1 day',
                mid: '15 days',
                max: '31 days',
                current: (v) => `${v} days`,
              }}
            />
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Monthly Cost"
              value={formatCurrency(result.costPerMonth, result.currency)}
              subtitle={`${result.kwhPerMonth} kWh per month`}
              footer={
                <>
                  That's <span className="font-semibold">{formatCurrency(result.costPerYear, result.currency, 0)}/year</span>
                </>
              }
            />

            {/* Breakdown */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Per Hour"
                value={formatCurrency(result.costPerHour, result.currency, 3)}
                sublabel="while running"
              />
              <MetricCard
                label="Per Day"
                value={formatCurrency(result.costPerDay, result.currency)}
                sublabel={`${result.kwhPerDay} kWh`}
              />
              <MetricCard
                label="Per Month"
                value={formatCurrency(result.costPerMonth, result.currency)}
                sublabel={`${result.kwhPerMonth} kWh`}
              />
              <MetricCard
                label="Per Year"
                value={formatCurrency(result.costPerYear, result.currency, 0)}
                sublabel={`${result.kwhPerYear} kWh`}
              />
            </Grid>

            {/* Energy Usage Context */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                Energy Usage Comparison
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Power draw</span>
                  <span className="font-medium">{inputs.watts}W ({(inputs.watts / 1000).toFixed(2)} kW)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Equivalent LED bulbs</span>
                  <span className="font-medium">{Math.round(inputs.watts / 10)} bulbs (10W each)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Annual CO2 emissions</span>
                  <span className="font-medium">~{Math.round(result.kwhPerYear * 0.4)} kg</span>
                </div>
              </div>
            </div>

            {/* Savings Tips */}
            {inputs.watts > 500 && (
              <Alert variant="tip" title="Energy saving tip:">
                {inputs.watts >= 1500 && 'High-wattage appliances like heaters and dryers are major energy consumers. Use them efficiently and consider energy-efficient alternatives.'}
                {inputs.watts >= 500 && inputs.watts < 1500 && 'Consider using a smart power strip to eliminate standby power draw when the appliance is not in use.'}
              </Alert>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
