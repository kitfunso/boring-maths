/**
 * Electricity Cost Calculator - React Component
 *
 * Interactive calculator for determining appliance electricity costs.
 * Supports multi-select for calculating total household usage.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateHouseholdCost, formatCurrency } from './calculations';
import {
  getDefaultInputs,
  type ElectricityCostInputs,
  type SelectedAppliance,
  APPLIANCE_PRESETS,
} from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
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
import ShareResults from '../../ui/ShareResults';

export default function ElectricityCostCalculator() {
  const [inputs, setInputs] = useState<ElectricityCostInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );
  const [selectedAppliances, setSelectedAppliances] = useState<SelectedAppliance[]>([]);

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results for all selected appliances
  const result = useMemo(() => {
    if (selectedAppliances.length === 0) {
      return null;
    }
    return calculateHouseholdCost(
      selectedAppliances,
      inputs.daysPerMonth,
      inputs.ratePerKwh,
      inputs.currency
    );
  }, [selectedAppliances, inputs.daysPerMonth, inputs.ratePerKwh, inputs.currency]);

  // Update input
  const updateInput = <K extends keyof ElectricityCostInputs>(
    field: K,
    value: ElectricityCostInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  // Toggle appliance selection
  const toggleAppliance = (preset: (typeof APPLIANCE_PRESETS)[0]) => {
    setSelectedAppliances((prev) => {
      const existing = prev.find((a) => a.name === preset.name);
      if (existing) {
        return prev.filter((a) => a.name !== preset.name);
      }
      return [
        ...prev,
        {
          name: preset.name,
          watts: preset.watts,
          hoursPerDay: preset.typicalHoursPerDay,
          category: preset.category,
        },
      ];
    });
  };

  // Update hours for a specific appliance
  const updateApplianceHours = (name: string, hours: number) => {
    setSelectedAppliances((prev) =>
      prev.map((a) => (a.name === name ? { ...a, hoursPerDay: hours } : a))
    );
  };

  // Remove appliance
  const removeAppliance = (name: string) => {
    setSelectedAppliances((prev) => prev.filter((a) => a.name !== name));
  };

  // Clear all
  const clearAll = () => {
    setSelectedAppliances([]);
  };

  // Check if appliance is selected
  const isSelected = (name: string) => selectedAppliances.some((a) => a.name === name);

  // Group presets by category
  const presetsByCategory = APPLIANCE_PRESETS.reduce(
    (acc, preset) => {
      if (!acc[preset.category]) {
        acc[preset.category] = [];
      }
      acc[preset.category].push(preset);
      return acc;
    },
    {} as Record<string, typeof APPLIANCE_PRESETS>
  );

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
          subtitle="Select multiple appliances to calculate total household usage"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Electricity Rate */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
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
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  Check your electricity bill
                </p>
              </div>

              <div>
                <Slider
                  label="Days Per Month"
                  value={inputs.daysPerMonth}
                  onChange={(value) => updateInput('daysPerMonth', value)}
                  min={1}
                  max={31}
                  showValue
                  labels={{
                    min: '1',
                    mid: '15',
                    max: '31',
                    current: (v) => `${v} days`,
                  }}
                />
              </div>
            </Grid>

            {/* Appliance Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Select Appliances</Label>
                {selectedAppliances.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear all ({selectedAppliances.length})
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {Object.entries(presetsByCategory).map(([category, presets]) => (
                  <div key={category}>
                    <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-2">
                      {categoryLabels[category]}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {presets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => toggleAppliance(preset)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            isSelected(preset.name)
                              ? 'bg-yellow-500 text-black font-medium'
                              : 'bg-[var(--color-night)] text-[var(--color-cream)] hover:bg-white/10'
                          }`}
                        >
                          {preset.name}
                          <span className="ml-1 opacity-60">({preset.watts}W)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Appliances List */}
            {selectedAppliances.length > 0 && (
              <div className="bg-[var(--color-night)] rounded-xl p-4">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                  Selected Appliances ({selectedAppliances.length})
                </h3>
                <div className="space-y-3">
                  {selectedAppliances.map((appliance) => (
                    <div
                      key={appliance.name}
                      className="flex items-center gap-3 bg-[var(--color-void)] rounded-lg p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--color-cream)] truncate">
                          {appliance.name}
                        </p>
                        <p className="text-xs text-[var(--color-muted)]">{appliance.watts}W</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0.25}
                          max={24}
                          step={0.25}
                          value={appliance.hoursPerDay}
                          onChange={(e) =>
                            updateApplianceHours(appliance.name, Number(e.target.value))
                          }
                          className="w-16 px-2 py-1 rounded bg-[var(--color-charcoal)] border border-white/10 text-center text-sm text-[var(--color-cream)]"
                        />
                        <span className="text-xs text-[var(--color-muted)]">hrs/day</span>
                      </div>
                      <button
                        onClick={() => removeAppliance(appliance.name)}
                        className="p-1 text-[var(--color-muted)] hover:text-red-400 transition-colors"
                        aria-label={`Remove ${appliance.name}`}
                      >
                        <svg
                          className="w-5 h-5"
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
                  ))}
                </div>
              </div>
            )}
          </div>

          <Divider />

          {/* Results Section */}
          {result ? (
            <div className="space-y-6">
              {/* Primary Result */}
              <ResultCard
                label="Total Monthly Cost"
                value={formatCurrency(result.totalCostPerMonth, inputs.currency)}
                subtitle={`${result.totalKwhPerMonth} kWh per month`}
                footer={
                  <>
                    That's{' '}
                    <span className="font-semibold">
                      {formatCurrency(result.totalCostPerYear, inputs.currency, 0)}/year
                    </span>{' '}
                    for {selectedAppliances.length} appliance
                    {selectedAppliances.length !== 1 ? 's' : ''}
                  </>
                }
              />

              {/* Summary Metrics */}
              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <MetricCard
                  label="Total Power"
                  value={`${result.totalWatts}W`}
                  sublabel="combined wattage"
                />
                <MetricCard
                  label="Monthly Usage"
                  value={`${result.totalKwhPerMonth} kWh`}
                  sublabel="total consumption"
                />
                <MetricCard
                  label="Monthly Cost"
                  value={formatCurrency(result.totalCostPerMonth, inputs.currency)}
                  sublabel="electricity bill"
                />
                <MetricCard
                  label="Yearly Cost"
                  value={formatCurrency(result.totalCostPerYear, inputs.currency, 0)}
                  sublabel="annual total"
                />
              </Grid>

              {/* Breakdown Table */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Cost Breakdown by Appliance
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider border-b border-white/10">
                        <th className="text-left py-2 pr-4">Appliance</th>
                        <th className="text-right py-2 px-2">Watts</th>
                        <th className="text-right py-2 px-2">Hrs/Day</th>
                        <th className="text-right py-2 px-2">kWh/Mo</th>
                        <th className="text-right py-2 px-2">Monthly</th>
                        <th className="text-right py-2 pl-2">Yearly</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {result.appliances.map((appliance) => (
                        <tr key={appliance.name} className="hover:bg-white/5">
                          <td className="py-2 pr-4 font-medium">{appliance.name}</td>
                          <td className="text-right py-2 px-2 tabular-nums text-[var(--color-muted)]">
                            {appliance.watts}W
                          </td>
                          <td className="text-right py-2 px-2 tabular-nums text-[var(--color-muted)]">
                            {appliance.hoursPerDay}h
                          </td>
                          <td className="text-right py-2 px-2 tabular-nums">
                            {appliance.kwhPerMonth}
                          </td>
                          <td className="text-right py-2 px-2 tabular-nums text-yellow-400">
                            {formatCurrency(appliance.costPerMonth, inputs.currency)}
                          </td>
                          <td className="text-right py-2 pl-2 tabular-nums">
                            {formatCurrency(appliance.costPerYear, inputs.currency, 0)}
                          </td>
                        </tr>
                      ))}
                      {/* Total Row */}
                      <tr className="bg-yellow-900/30 font-semibold">
                        <td className="py-2 pr-4">Total</td>
                        <td className="text-right py-2 px-2 tabular-nums">{result.totalWatts}W</td>
                        <td className="text-right py-2 px-2 tabular-nums">-</td>
                        <td className="text-right py-2 px-2 tabular-nums">
                          {result.totalKwhPerMonth}
                        </td>
                        <td className="text-right py-2 px-2 tabular-nums text-yellow-400">
                          {formatCurrency(result.totalCostPerMonth, inputs.currency)}
                        </td>
                        <td className="text-right py-2 pl-2 tabular-nums">
                          {formatCurrency(result.totalCostPerYear, inputs.currency, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Energy Context */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Energy Usage Context
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-subtle)]">Combined power draw</span>
                    <span className="font-medium">
                      {result.totalWatts}W ({(result.totalWatts / 1000).toFixed(2)} kW)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-subtle)]">Equivalent LED bulbs</span>
                    <span className="font-medium">
                      {Math.round(result.totalWatts / 10)} bulbs (10W each)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-subtle)]">Annual CO2 emissions</span>
                    <span className="font-medium">
                      ~{Math.round(result.totalKwhPerMonth * 12 * 0.4)} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <Alert variant="tip" title="Energy saving tip:">
                The biggest energy consumers in most homes are heating/cooling, water heaters, and
                dryers. Consider energy-efficient alternatives and smart power strips to reduce
                standby power.
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Household electricity: ${formatCurrency(result.totalCostPerMonth, inputs.currency)}/month (${formatCurrency(result.totalCostPerYear, inputs.currency, 0)}/year) for ${selectedAppliances.length} appliances - ${result.totalKwhPerMonth} kWh`}
                  calculatorName="Electricity Cost Calculator"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-900/30 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <p className="text-[var(--color-muted)] mb-2">
                Select appliances above to calculate costs
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                Click on appliances to add them to your household calculation
              </p>
            </div>
          )}
        </div>
      </Card>
    </ThemeProvider>
  );
}
