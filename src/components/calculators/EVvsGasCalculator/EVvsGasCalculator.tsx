/**
 * EV vs Gas Calculator - Preact Component
 *
 * Compare the true costs of owning an electric vehicle versus a gas vehicle.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateEVvsGas } from './calculations';
import { getDefaultInputs, type EVvsGasInputs } from './types';
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
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  Toggle,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import PrintResults from '../../ui/PrintResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';

export default function EVvsGasCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('EV vs Gas Calculator');

  const [inputs, setInputs] = useState<EVvsGasInputs>(() => getDefaultInputs(getInitialCurrency()));

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    vehicleCosts: true,
    drivingHabits: true,
    evDetails: false,
    gasDetails: false,
  });

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const result = useMemo(() => calculateEVvsGas(inputs), [inputs]);

  const updateInput = <K extends keyof EVvsGasInputs>(field: K, value: EVvsGasInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  // Get the maximum cost for bar chart scaling
  const maxCost = Math.max(result.evCosts.total, result.gasCosts.total);

  // Unit labels based on metric preference
  const distanceUnit = inputs.useMetric ? 'km' : 'miles';
  const efficiencyLabel = inputs.useMetric ? 'km/kWh' : 'mi/kWh';
  const fuelEfficiencyLabel = inputs.useMetric ? 'km/L' : 'MPG';
  const fuelUnitLabel = inputs.useMetric ? '/L' : '/gal';
  const co2Unit = inputs.useMetric ? 'kg' : 'lbs';

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="EV vs Gas Cost Calculator"
          subtitle="Compare the true cost of ownership between electric and gas vehicles"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              {/* Vehicle Costs Section */}
              <div className="rounded-xl bg-[var(--color-surface)] ring-1 ring-white/10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('vehicleCosts')}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-semibold text-green-400 uppercase tracking-wider">
                    Vehicle Costs
                  </span>
                  <span className="text-[var(--color-muted)]">
                    {expandedSections.vehicleCosts ? '-' : '+'}
                  </span>
                </button>

                {expandedSections.vehicleCosts && (
                  <div className="px-4 pb-4 space-y-4">
                    <div>
                      <Label htmlFor="evPrice" required>
                        EV Purchase Price
                      </Label>
                      <Input
                        id="evPrice"
                        variant="currency"
                        currencySymbol={currencySymbol}
                        min={0}
                        step={1000}
                        value={inputs.evPrice}
                        onChange={(e) =>
                          updateInput('evPrice', Number((e.target as HTMLInputElement).value))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="gasPrice" required>
                        Gas Vehicle Purchase Price
                      </Label>
                      <Input
                        id="gasPrice"
                        variant="currency"
                        currencySymbol={currencySymbol}
                        min={0}
                        step={1000}
                        value={inputs.gasPrice}
                        onChange={(e) =>
                          updateInput('gasPrice', Number((e.target as HTMLInputElement).value))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="evTaxCredit">EV Tax Credit / Incentive</Label>
                      <Input
                        id="evTaxCredit"
                        variant="currency"
                        currencySymbol={currencySymbol}
                        min={0}
                        step={500}
                        value={inputs.evTaxCredit}
                        onChange={(e) =>
                          updateInput('evTaxCredit', Number((e.target as HTMLInputElement).value))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Driving Habits Section */}
              <div className="rounded-xl bg-[var(--color-surface)] ring-1 ring-white/10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('drivingHabits')}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-semibold text-green-400 uppercase tracking-wider">
                    Driving Habits
                  </span>
                  <span className="text-[var(--color-muted)]">
                    {expandedSections.drivingHabits ? '-' : '+'}
                  </span>
                </button>

                {expandedSections.drivingHabits && (
                  <div className="px-4 pb-4 space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <Label htmlFor="useMetric">Use Metric Units</Label>
                      <Toggle
                        id="useMetric"
                        checked={inputs.useMetric}
                        onChange={(checked) => updateInput('useMetric', checked)}
                      />
                    </div>

                    <Slider
                      label={`Annual ${distanceUnit.charAt(0).toUpperCase() + distanceUnit.slice(1)} Driven`}
                      value={inputs.annualMiles}
                      onChange={(value) => updateInput('annualMiles', value)}
                      min={1000}
                      max={30000}
                      step={500}
                      showValue
                      labels={{
                        min: '1K',
                        mid: '15K',
                        max: '30K',
                        current: (v) => `${v.toLocaleString()} ${distanceUnit}/yr`,
                      }}
                    />

                    <Slider
                      label="Years of Ownership"
                      value={inputs.yearsOwnership}
                      onChange={(value) => updateInput('yearsOwnership', value)}
                      min={1}
                      max={15}
                      showValue
                      labels={{
                        min: '1 yr',
                        mid: '8 yrs',
                        max: '15 yrs',
                        current: (v) => `${v} years`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* EV Details Section */}
              <div className="rounded-xl bg-[var(--color-surface)] ring-1 ring-white/10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('evDetails')}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                    EV Details
                  </span>
                  <span className="text-[var(--color-muted)]">
                    {expandedSections.evDetails ? '-' : '+'}
                  </span>
                </button>

                {expandedSections.evDetails && (
                  <div className="px-4 pb-4 space-y-4">
                    <Slider
                      label="EV Efficiency"
                      value={inputs.evEfficiency * 10}
                      onChange={(value) => updateInput('evEfficiency', value / 10)}
                      min={20}
                      max={60}
                      showValue
                      labels={{
                        min: '2.0',
                        mid: '4.0',
                        max: '6.0',
                        current: (v) => `${(v / 10).toFixed(1)} ${efficiencyLabel}`,
                      }}
                    />

                    <div>
                      <Label htmlFor="electricityRate">Home Electricity Rate</Label>
                      <Input
                        id="electricityRate"
                        type="number"
                        min={0}
                        step={0.01}
                        value={inputs.electricityRate}
                        suffix="/kWh"
                        onChange={(e) =>
                          updateInput(
                            'electricityRate',
                            parseFloat((e.target as HTMLInputElement).value) || 0
                          )
                        }
                      />
                    </div>

                    <Slider
                      label="Home Charging %"
                      value={inputs.homeChargingPercent}
                      onChange={(value) => updateInput('homeChargingPercent', value)}
                      min={0}
                      max={100}
                      step={5}
                      showValue
                      labels={{
                        min: '0%',
                        mid: '50%',
                        max: '100%',
                        current: (v) => `${v}% at home`,
                      }}
                    />

                    <div>
                      <Label htmlFor="publicChargingRate">Public Charging Rate</Label>
                      <Input
                        id="publicChargingRate"
                        type="number"
                        min={0}
                        step={0.01}
                        value={inputs.publicChargingRate}
                        suffix="/kWh"
                        onChange={(e) =>
                          updateInput(
                            'publicChargingRate',
                            parseFloat((e.target as HTMLInputElement).value) || 0
                          )
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="evMaintenanceYearly">Annual Maintenance</Label>
                      <Input
                        id="evMaintenanceYearly"
                        variant="currency"
                        currencySymbol={currencySymbol}
                        min={0}
                        step={50}
                        value={inputs.evMaintenanceYearly}
                        onChange={(e) =>
                          updateInput(
                            'evMaintenanceYearly',
                            Number((e.target as HTMLInputElement).value)
                          )
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="evInsuranceYearly">Annual Insurance</Label>
                      <Input
                        id="evInsuranceYearly"
                        variant="currency"
                        currencySymbol={currencySymbol}
                        min={0}
                        step={50}
                        value={inputs.evInsuranceYearly}
                        onChange={(e) =>
                          updateInput(
                            'evInsuranceYearly',
                            Number((e.target as HTMLInputElement).value)
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Gas Vehicle Details Section */}
              <div className="rounded-xl bg-[var(--color-surface)] ring-1 ring-white/10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('gasDetails')}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-semibold text-orange-400 uppercase tracking-wider">
                    Gas Vehicle Details
                  </span>
                  <span className="text-[var(--color-muted)]">
                    {expandedSections.gasDetails ? '-' : '+'}
                  </span>
                </button>

                {expandedSections.gasDetails && (
                  <div className="px-4 pb-4 space-y-4">
                    <Slider
                      label={`Fuel Efficiency (${fuelEfficiencyLabel})`}
                      value={inputs.gasMpg}
                      onChange={(value) => updateInput('gasMpg', value)}
                      min={inputs.useMetric ? 5 : 15}
                      max={inputs.useMetric ? 25 : 60}
                      showValue
                      labels={{
                        min: inputs.useMetric ? '5' : '15',
                        mid: inputs.useMetric ? '15' : '35',
                        max: inputs.useMetric ? '25' : '60',
                        current: (v) => `${v} ${fuelEfficiencyLabel}`,
                      }}
                    />

                    <div>
                      <Label htmlFor="gasPerGallon">Fuel Price</Label>
                      <Input
                        id="gasPerGallon"
                        type="number"
                        min={0}
                        step={0.1}
                        value={inputs.gasPerGallon}
                        suffix={fuelUnitLabel}
                        onChange={(e) =>
                          updateInput(
                            'gasPerGallon',
                            parseFloat((e.target as HTMLInputElement).value) || 0
                          )
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="gasMaintenanceYearly">Annual Maintenance</Label>
                      <Input
                        id="gasMaintenanceYearly"
                        variant="currency"
                        currencySymbol={currencySymbol}
                        min={0}
                        step={50}
                        value={inputs.gasMaintenanceYearly}
                        onChange={(e) =>
                          updateInput(
                            'gasMaintenanceYearly',
                            Number((e.target as HTMLInputElement).value)
                          )
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="gasInsuranceYearly">Annual Insurance</Label>
                      <Input
                        id="gasInsuranceYearly"
                        variant="currency"
                        currencySymbol={currencySymbol}
                        min={0}
                        step={50}
                        value={inputs.gasInsuranceYearly}
                        onChange={(e) =>
                          updateInput(
                            'gasInsuranceYearly',
                            Number((e.target as HTMLInputElement).value)
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              {/* Winner Badge */}
              <ResultCard
                label="Better Choice"
                value={
                  result.betterChoice === 'equal'
                    ? 'About Equal'
                    : result.betterChoice === 'ev'
                      ? 'Electric Vehicle'
                      : 'Gas Vehicle'
                }
                subtitle={
                  result.betterChoice === 'equal'
                    ? 'Costs are within $100 of each other'
                    : result.totalSavings > 0
                      ? `EV saves ${fmt(result.totalSavings)} over ${inputs.yearsOwnership} years`
                      : `Gas saves ${fmt(-result.totalSavings)} over ${inputs.yearsOwnership} years`
                }
              />

              {/* Side by side comparison */}
              <Grid responsive={{ sm: 2 }} gap="md">
                <div className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-500/30">
                  <h3 className="text-sm font-medium text-emerald-400 mb-3">ELECTRIC VEHICLE</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Purchase</span>
                      <span className="text-[var(--color-cream)]">
                        {fmt(result.evCosts.purchase)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Incentives</span>
                      <span className="text-green-400">{fmt(result.evCosts.incentives)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Fuel</span>
                      <span className="text-[var(--color-cream)]">{fmt(result.evCosts.fuel)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Maintenance</span>
                      <span className="text-[var(--color-cream)]">
                        {fmt(result.evCosts.maintenance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Insurance</span>
                      <span className="text-[var(--color-cream)]">
                        {fmt(result.evCosts.insurance)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10">
                      <span className="text-[var(--color-cream)] font-medium">Total</span>
                      <span className="text-emerald-400 font-bold">
                        {fmt(result.evCosts.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-900/20 rounded-xl p-4 border border-orange-500/30">
                  <h3 className="text-sm font-medium text-orange-400 mb-3">GAS VEHICLE</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Purchase</span>
                      <span className="text-[var(--color-cream)]">
                        {fmt(result.gasCosts.purchase)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Incentives</span>
                      <span className="text-[var(--color-muted)]">{fmt(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Fuel</span>
                      <span className="text-[var(--color-cream)]">{fmt(result.gasCosts.fuel)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Maintenance</span>
                      <span className="text-[var(--color-cream)]">
                        {fmt(result.gasCosts.maintenance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Insurance</span>
                      <span className="text-[var(--color-cream)]">
                        {fmt(result.gasCosts.insurance)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10">
                      <span className="text-[var(--color-cream)] font-medium">Total</span>
                      <span className="text-orange-400 font-bold">
                        {fmt(result.gasCosts.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </Grid>

              {/* Savings breakdown */}
              <Grid responsive={{ sm: 3 }} gap="md">
                <MetricCard
                  label="Monthly Savings"
                  value={`${result.savingsPerMonth >= 0 ? '+' : ''}${fmt(result.savingsPerMonth)}`}
                />
                <MetricCard
                  label="Yearly Savings"
                  value={`${result.savingsPerYear >= 0 ? '+' : ''}${fmt(result.savingsPerYear)}`}
                />
                <MetricCard
                  label="Break-even"
                  value={
                    result.breakEvenYears < 0
                      ? 'Never'
                      : result.breakEvenYears === 0
                        ? 'Immediate'
                        : `${result.breakEvenYears} yrs`
                  }
                />
              </Grid>

              {/* Cost comparison bar */}
              <div className="rounded-xl bg-[var(--color-surface)] p-4 ring-1 ring-white/10">
                <h3 className="text-sm font-medium text-[var(--color-muted)] mb-4">
                  Total Cost Comparison
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-emerald-400">EV</span>
                      <span className="text-[var(--color-cream)]">{fmt(result.evCosts.total)}</span>
                    </div>
                    <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${(result.evCosts.total / maxCost) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-orange-400">Gas</span>
                      <span className="text-[var(--color-cream)]">
                        {fmt(result.gasCosts.total)}
                      </span>
                    </div>
                    <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500"
                        style={{ width: `${(result.gasCosts.total / maxCost) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CO2 Savings */}
              <Alert variant="tip" title="Environmental Impact">
                <p className="text-sm">
                  Over {inputs.yearsOwnership} years, the EV saves approximately{' '}
                  <strong>
                    {result.co2Saved.toLocaleString()} {co2Unit}
                  </strong>{' '}
                  of CO2 emissions compared to the gas vehicle.
                </p>
              </Alert>

              {/* Year by year breakdown */}
              <div className="rounded-xl bg-[var(--color-surface)] p-4 ring-1 ring-white/10">
                <h3 className="text-sm font-medium text-[var(--color-muted)] mb-4">
                  Cumulative Cost by Year
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[var(--color-muted)]">
                        <th className="text-left py-2">Year</th>
                        <th className="text-right py-2">EV Total</th>
                        <th className="text-right py-2">Gas Total</th>
                        <th className="text-right py-2">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.yearlyCostComparison.map((row) => (
                        <tr key={row.year} className="border-t border-white/5">
                          <td className="py-2 text-[var(--color-cream)]">Year {row.year}</td>
                          <td className="py-2 text-right text-emerald-400">{fmt(row.evTotal)}</td>
                          <td className="py-2 text-right text-orange-400">{fmt(row.gasTotal)}</td>
                          <td
                            className={`py-2 text-right font-medium ${row.gasTotal - row.evTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}
                          >
                            {row.gasTotal - row.evTotal >= 0 ? '+' : ''}
                            {fmt(row.gasTotal - row.evTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Considerations */}
              <Alert variant="info" title="Things to Consider">
                <ul className="text-sm space-y-1 mt-1">
                  <li>Residual/resale value not included in this comparison</li>
                  <li>Charging infrastructure may vary by location</li>
                  <li>Electricity costs vary significantly by region and time of use</li>
                  <li>EV battery replacement costs (typically after 8+ years) not factored</li>
                </ul>
              </Alert>

              {/* Share and Print */}
              <div className="flex justify-center gap-4 pt-4">
                <ShareResults
                  result={`EV vs Gas: ${result.betterChoice === 'ev' ? 'EV' : 'Gas'} wins! EV total: ${fmt(result.evCosts.total)}, Gas total: ${fmt(result.gasCosts.total)}. Savings: ${fmt(Math.abs(result.totalSavings))} over ${inputs.yearsOwnership} years.`}
                  calculatorName="EV vs Gas Calculator"
                />
                <PrintResults
                  title="EV vs Gas Cost Comparison"
                  data={{
                    'Analysis Period': `${inputs.yearsOwnership} years`,
                    'Annual Mileage': `${inputs.annualMiles.toLocaleString()} ${distanceUnit}`,
                    'EV Total Cost': fmt(result.evCosts.total),
                    'Gas Total Cost': fmt(result.gasCosts.total),
                    'Total Savings': fmt(Math.abs(result.totalSavings)),
                    'Better Choice':
                      result.betterChoice === 'ev' ? 'Electric Vehicle' : 'Gas Vehicle',
                    'CO2 Saved': `${result.co2Saved.toLocaleString()} ${co2Unit}`,
                  }}
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
