/**
 * Solar Panel Calculator - React Component
 *
 * Calculate solar panel system costs, payback period, and long-term savings.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateSolar } from './calculations';
import {
  getDefaultInputs,
  SYSTEM_SIZES,
  COST_PER_WATT,
  type SolarCalculatorInputs,
  type SystemSize,
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
  ButtonGroup,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  Slider,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

const SYSTEM_SIZE_OPTIONS = [
  { value: 'small', label: '4 kW' },
  { value: 'medium', label: '7 kW' },
  { value: 'large', label: '10 kW' },
  { value: 'custom', label: 'Custom' },
];

export default function SolarCalculator() {
  const [inputs, setInputs] = useState<SolarCalculatorInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );
  const [systemSizePreset, setSystemSizePreset] = useState<SystemSize>('medium');

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const result = useMemo(() => calculateSolar(inputs), [inputs]);

  const updateInput = <K extends keyof SolarCalculatorInputs>(
    field: K,
    value: SolarCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const handleSystemSizeChange = (preset: SystemSize) => {
    setSystemSizePreset(preset);
    if (preset !== 'custom') {
      const sizeKw = SYSTEM_SIZES[preset];
      const cost = Math.round(sizeKw * 1000 * COST_PER_WATT[inputs.currency]);
      setInputs((prev) => ({
        ...prev,
        systemSizeKw: sizeKw,
        systemCost: cost,
      }));
    }
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        <CalculatorHeader
          title="Solar Panel Calculator"
          subtitle="Calculate your solar investment payback and savings"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                System Details
              </div>

              {/* System Size */}
              <div>
                <Label>System Size</Label>
                <ButtonGroup
                  options={SYSTEM_SIZE_OPTIONS}
                  value={systemSizePreset}
                  onChange={(value) => handleSystemSizeChange(value as SystemSize)}
                />
              </div>

              {systemSizePreset === 'custom' && (
                <Grid cols={2} gap="md">
                  <div>
                    <Label htmlFor="systemSizeKw">System Size (kW)</Label>
                    <Input
                      id="systemSizeKw"
                      type="number"
                      min={1}
                      max={30}
                      step={0.5}
                      value={inputs.systemSizeKw}
                      onChange={(e) =>
                        updateInput('systemSizeKw', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="systemCost">System Cost ({currencySymbol})</Label>
                    <Input
                      id="systemCost"
                      type="number"
                      min={1000}
                      max={100000}
                      step={500}
                      value={inputs.systemCost}
                      onChange={(e) =>
                        updateInput('systemCost', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                </Grid>
              )}

              {systemSizePreset !== 'custom' && (
                <div className="bg-amber-950/30 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-amber-300">System Size</span>
                    <span className="text-amber-400 font-semibold">{inputs.systemSizeKw} kW</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-amber-300">Estimated Cost</span>
                    <span className="text-amber-400 font-semibold">{fmt(inputs.systemCost)}</span>
                  </div>
                </div>
              )}

              <Divider />

              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Your Energy Usage
              </div>

              <Grid cols={2} gap="md">
                <div>
                  <Label htmlFor="monthlyElectricBill">Monthly Bill ({currencySymbol})</Label>
                  <Input
                    id="monthlyElectricBill"
                    type="number"
                    min={10}
                    max={1000}
                    value={inputs.monthlyElectricBill}
                    onChange={(e) =>
                      updateInput(
                        'monthlyElectricBill',
                        Number((e.target as HTMLInputElement).value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="electricityRate">Rate ({currencySymbol}/kWh)</Label>
                  <Input
                    id="electricityRate"
                    type="number"
                    min={0.05}
                    max={0.5}
                    step={0.01}
                    value={inputs.electricityRate}
                    onChange={(e) =>
                      updateInput('electricityRate', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              </Grid>

              <Slider
                label="Annual Rate Increase"
                value={inputs.annualRateIncrease}
                onChange={(value) => updateInput('annualRateIncrease', value)}
                min={0}
                max={10}
                step={0.5}
                showValue
                labels={{
                  min: '0%',
                  max: '10%',
                  current: (v) => `${v}% per year`,
                }}
              />

              <Divider />

              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Location & Efficiency
              </div>

              <Grid cols={2} gap="md">
                <div>
                  <Slider
                    label="Peak Sun Hours"
                    value={inputs.peakSunHours}
                    onChange={(value) => updateInput('peakSunHours', value)}
                    min={2}
                    max={7}
                    step={0.5}
                    showValue
                    labels={{
                      min: '2',
                      max: '7',
                      current: (v) => `${v} hrs/day`,
                    }}
                  />
                </div>
                <div>
                  <Slider
                    label="System Efficiency"
                    value={inputs.systemEfficiency}
                    onChange={(value) => updateInput('systemEfficiency', value)}
                    min={70}
                    max={95}
                    showValue
                    labels={{
                      min: '70%',
                      max: '95%',
                      current: (v) => `${v}%`,
                    }}
                  />
                </div>
              </Grid>

              <Divider />

              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Incentives & Rebates
              </div>

              <Grid cols={2} gap="md">
                <div>
                  <Label htmlFor="federalTaxCredit">Federal Tax Credit (%)</Label>
                  <Input
                    id="federalTaxCredit"
                    type="number"
                    min={0}
                    max={50}
                    value={inputs.federalTaxCredit}
                    onChange={(e) =>
                      updateInput('federalTaxCredit', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="stateTaxCredit">State Tax Credit (%)</Label>
                  <Input
                    id="stateTaxCredit"
                    type="number"
                    min={0}
                    max={50}
                    value={inputs.stateTaxCredit}
                    onChange={(e) =>
                      updateInput('stateTaxCredit', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              </Grid>

              <div>
                <Label htmlFor="localRebate">Local Rebate ({currencySymbol})</Label>
                <Input
                  id="localRebate"
                  type="number"
                  min={0}
                  max={20000}
                  value={inputs.localRebate}
                  onChange={(e) =>
                    updateInput('localRebate', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>

              {/* Financing Toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateInput('financed', !inputs.financed)}
                  className={`w-10 h-5 rounded-full transition-all ${
                    inputs.financed ? 'bg-amber-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      inputs.financed ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-[var(--color-cream)] text-sm">Finance with Solar Loan</span>
              </div>

              {inputs.financed && (
                <Grid cols={2} gap="md">
                  <div>
                    <Label htmlFor="loanInterestRate">Interest Rate (%)</Label>
                    <Input
                      id="loanInterestRate"
                      type="number"
                      min={0}
                      max={15}
                      step={0.25}
                      value={inputs.loanInterestRate}
                      onChange={(e) =>
                        updateInput(
                          'loanInterestRate',
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="loanTermYears">Loan Term (years)</Label>
                    <Input
                      id="loanTermYears"
                      type="number"
                      min={5}
                      max={25}
                      value={inputs.loanTermYears}
                      onChange={(e) =>
                        updateInput('loanTermYears', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                </Grid>
              )}
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Payback Period"
                value={`${result.paybackYears} years`}
                subtitle={`Net cost: ${fmt(result.netCost)} after ${fmt(result.totalIncentives)} in incentives`}
              />

              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <MetricCard
                  label="Annual Production"
                  value={`${result.annualProductionKwh.toLocaleString()} kWh`}
                />
                <MetricCard label="Bill Coverage" value={`${result.coveragePercent}%`} />
                <MetricCard label="25-Year ROI" value={`${result.roi25Year}%`} />
                <MetricCard label="25-Year Savings" value={fmt(result.lifetimeSavings)} />
              </Grid>

              {/* Cost Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Cost Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[var(--color-muted)]">Gross System Cost</span>
                    <span className="text-[var(--color-cream)] font-medium">
                      {fmt(result.grossCost)}
                    </span>
                  </div>
                  {result.federalCredit > 0 && (
                    <div className="flex justify-between items-center py-2 border-t border-white/5">
                      <span className="text-green-400">Federal Tax Credit</span>
                      <span className="text-green-400 font-medium">
                        -{fmt(result.federalCredit)}
                      </span>
                    </div>
                  )}
                  {result.stateCredit > 0 && (
                    <div className="flex justify-between items-center py-2 border-t border-white/5">
                      <span className="text-green-400">State Tax Credit</span>
                      <span className="text-green-400 font-medium">-{fmt(result.stateCredit)}</span>
                    </div>
                  )}
                  {inputs.localRebate > 0 && (
                    <div className="flex justify-between items-center py-2 border-t border-white/5">
                      <span className="text-green-400">Local Rebate</span>
                      <span className="text-green-400 font-medium">-{fmt(inputs.localRebate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-t border-white/20">
                    <span className="text-[var(--color-cream)] font-semibold">Net Cost</span>
                    <span className="text-amber-400 font-bold text-lg">{fmt(result.netCost)}</span>
                  </div>
                </div>

                {inputs.financed && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-muted)]">Monthly Loan Payment</span>
                      <span className="text-[var(--color-cream)] font-medium">
                        {fmt(result.monthlyPayment)}/mo
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Savings Over Time */}
              <div className="bg-amber-950/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
                  Cumulative Savings
                </h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-amber-300">
                      {fmt(result.firstYearSavings)}
                    </div>
                    <div className="text-xs text-amber-400">Year 1</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-amber-300">
                      {fmt(result.year5Savings)}
                    </div>
                    <div className="text-xs text-amber-400">Year 5</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-amber-300">
                      {fmt(result.year10Savings)}
                    </div>
                    <div className="text-xs text-amber-400">Year 10</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-amber-300">
                      {fmt(result.year25Savings)}
                    </div>
                    <div className="text-xs text-amber-400">Year 25</div>
                  </div>
                </div>
              </div>

              {/* Environmental Impact */}
              <div className="bg-green-950/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-4">
                  Annual Environmental Impact
                </h3>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-300">
                      {result.co2OffsetTons} tons
                    </div>
                    <div className="text-sm text-green-400">CO2 Offset</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-300">
                      {result.treesEquivalent}
                    </div>
                    <div className="text-sm text-green-400">Trees Equivalent</div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              {result.tips.length > 0 && (
                <Alert variant="tip" title="Solar Tips">
                  <ul className="space-y-1 mt-2">
                    {result.tips.slice(0, 3).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-400">-</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}

              {/* Share */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Solar: ${inputs.systemSizeKw}kW system, ${result.paybackYears} year payback, ${fmt(result.lifetimeSavings)} 25-year savings, ${result.roi25Year}% ROI`}
                  calculatorName="Solar Panel Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
