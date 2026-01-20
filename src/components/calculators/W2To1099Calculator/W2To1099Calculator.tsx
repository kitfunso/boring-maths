/**
 * W2 to 1099 Calculator - React Component
 *
 * Convert W2 employee hourly rate to equivalent 1099 contractor rate.
 * Shows detailed breakdown of costs including self-employment tax,
 * benefits, and business expenses.
 */

import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import {
  calculateW2To1099,
  formatCurrency,
  formatHourlyRate,
  formatMultiplier,
} from './calculations';
import {
  getDefaultInputs,
  US_STATES,
  STANDARD_ANNUAL_HOURS,
  type W2To1099CalculatorInputs,
  type InputMode,
} from './types';
import { ThemeProvider, Card, CalculatorHeader, Label, Input, Grid, Select, Alert } from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function W2To1099Calculator() {
  const [inputs, setInputs] = useLocalStorage<W2To1099CalculatorInputs>(
    'calc-w2-to-1099-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateW2To1099(inputs), [inputs]);

  const updateInput = <K extends keyof W2To1099CalculatorInputs>(
    field: K,
    value: W2To1099CalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Sync hourly and salary when input mode changes
  const handleInputModeChange = (mode: InputMode) => {
    if (mode === 'hourly' && inputs.inputMode === 'salary') {
      // Convert salary to hourly
      updateInput(
        'w2HourlyRate',
        Math.round((inputs.w2AnnualSalary / STANDARD_ANNUAL_HOURS) * 100) / 100
      );
    } else if (mode === 'salary' && inputs.inputMode === 'hourly') {
      // Convert hourly to salary
      updateInput('w2AnnualSalary', Math.round(inputs.w2HourlyRate * STANDARD_ANNUAL_HOURS));
    }
    updateInput('inputMode', mode);
  };

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="W2 to 1099 Rate Calculator"
          subtitle="Find your equivalent contractor rate"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Input Mode Toggle */}
            <div>
              <Label required>Input Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['hourly', 'salary'] as InputMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleInputModeChange(mode)}
                    className={`py-3 px-4 rounded-xl font-medium transition-all text-sm capitalize ${
                      inputs.inputMode === mode
                        ? 'bg-green-500 text-white'
                        : 'bg-white/5 text-[var(--color-subtle)] hover:bg-white/10'
                    }`}
                  >
                    {mode === 'hourly' ? 'Hourly Rate' : 'Annual Salary'}
                  </button>
                ))}
              </div>
            </div>

            {/* W2 Rate/Salary Input */}
            {inputs.inputMode === 'hourly' ? (
              <div>
                <Label htmlFor="w2HourlyRate" required>
                  W2 Hourly Rate
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    $
                  </span>
                  <Input
                    id="w2HourlyRate"
                    type="number"
                    value={inputs.w2HourlyRate}
                    onChange={(e) => updateInput('w2HourlyRate', Number(e.currentTarget.value))}
                    min={0}
                    step={1}
                    className="pl-8"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    /hr
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="w2AnnualSalary" required>
                  W2 Annual Salary
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    $
                  </span>
                  <Input
                    id="w2AnnualSalary"
                    type="number"
                    value={inputs.w2AnnualSalary}
                    onChange={(e) => updateInput('w2AnnualSalary', Number(e.currentTarget.value))}
                    min={0}
                    step={1000}
                    className="pl-8"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    /year
                  </span>
                </div>
              </div>
            )}

            {/* Benefits Section */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] mb-4">
                Current Benefits (as W2)
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <div>
                  <Label htmlFor="healthInsuranceMonthly">Health Insurance (monthly cost)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                      $
                    </span>
                    <Input
                      id="healthInsuranceMonthly"
                      type="number"
                      value={inputs.healthInsuranceMonthly}
                      onChange={(e) =>
                        updateInput('healthInsuranceMonthly', Number(e.currentTarget.value))
                      }
                      min={0}
                      step={50}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-[var(--color-muted)] mt-1">Typical: $500-800/month</p>
                </div>
                <div>
                  <Label htmlFor="retirement401kMatch">401k Employer Match (%)</Label>
                  <Input
                    id="retirement401kMatch"
                    type="number"
                    value={inputs.retirement401kMatch}
                    onChange={(e) =>
                      updateInput('retirement401kMatch', Number(e.currentTarget.value))
                    }
                    min={0}
                    max={100}
                    step={0.5}
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">Common: 3-6% match</p>
                </div>
                <div>
                  <Label htmlFor="ptoDays">PTO Days (per year)</Label>
                  <Input
                    id="ptoDays"
                    type="number"
                    value={inputs.ptoDays}
                    onChange={(e) => updateInput('ptoDays', Number(e.currentTarget.value))}
                    min={0}
                    max={60}
                    step={1}
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    Include vacation + sick days
                  </p>
                </div>
                <div>
                  <Label htmlFor="otherBenefitsAnnual">Other Benefits (annual)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                      $
                    </span>
                    <Input
                      id="otherBenefitsAnnual"
                      type="number"
                      value={inputs.otherBenefitsAnnual}
                      onChange={(e) =>
                        updateInput('otherBenefitsAnnual', Number(e.currentTarget.value))
                      }
                      min={0}
                      step={100}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    Dental, vision, life insurance, etc.
                  </p>
                </div>
              </Grid>
            </div>

            {/* State Selection */}
            <div>
              <Label htmlFor="state">State</Label>
              <Select
                id="state"
                value={inputs.state}
                onChange={(e) => updateInput('state', e.currentTarget.value)}
                options={US_STATES.map((s) => ({ value: s.value, label: s.label }))}
              />
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Result */}
            <div className="rounded-2xl p-6 border-2 bg-green-950/50 border-green-500/30">
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">Equivalent 1099 Rate</p>
                <p className="text-4xl md:text-5xl font-display font-bold text-green-400">
                  {formatHourlyRate(result.equivalent1099Hourly)}
                </p>
                <p className="text-lg text-[var(--color-cream)] mt-2">
                  {formatCurrency(result.equivalent1099Annual)}/year
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  {formatMultiplier(result.multiplier)} your W2 rate
                </p>
              </div>
            </div>

            {/* Rate Comparison */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs text-[var(--color-muted)] mb-1">W2 Rate</p>
                <p className="text-2xl font-bold text-[var(--color-cream)]">
                  {formatHourlyRate(result.w2HourlyRate)}
                </p>
                <p className="text-sm text-[var(--color-subtle)]">
                  {formatCurrency(result.w2AnnualSalary)}/year
                </p>
              </div>
              <div className="bg-green-950/30 rounded-xl p-4 border border-green-500/30">
                <p className="text-xs text-[var(--color-muted)] mb-1">1099 Rate Needed</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatHourlyRate(result.equivalent1099Hourly)}
                </p>
                <p className="text-sm text-green-400/80">
                  {formatCurrency(result.equivalent1099Annual)}/year
                </p>
              </div>
            </Grid>

            {/* Multiplier Info */}
            <Alert variant="tip" title="The typical multiplier is 1.25x-1.5x">
              Your rate of {formatMultiplier(result.multiplier)} means you need to charge{' '}
              {formatHourlyRate(result.equivalent1099Hourly)} as a contractor to match your W2 total
              compensation of {formatCurrency(result.totalW2Value)}/year.
            </Alert>

            {/* Cost Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-cream)] mb-4">
                Cost Breakdown
              </h3>
              <div className="bg-white/5 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-muted)]">
                        Item
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-[var(--color-muted)]">
                        W2 Value
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-[var(--color-muted)]">
                        1099 Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((item, index) => (
                      <tr key={index} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-3">
                          <p className="text-sm text-[var(--color-subtle)]">{item.label}</p>
                          {item.note && (
                            <p className="text-xs text-[var(--color-muted)]">{item.note}</p>
                          )}
                        </td>
                        <td className="text-right px-4 py-3 text-sm text-[var(--color-cream)] tabular-nums">
                          {item.w2Value > 0 ? formatCurrency(item.w2Value) : '-'}
                        </td>
                        <td className="text-right px-4 py-3 text-sm font-medium tabular-nums">
                          {item.contractorCost > 0 ? (
                            <span
                              className={
                                item.label === 'Base Salary'
                                  ? 'text-[var(--color-cream)]'
                                  : 'text-amber-400'
                              }
                            >
                              {formatCurrency(item.contractorCost)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-white/5">
                      <td className="px-4 py-3 text-sm font-semibold text-[var(--color-cream)]">
                        Total
                      </td>
                      <td className="text-right px-4 py-3 text-sm font-bold text-[var(--color-cream)]">
                        {formatCurrency(result.totalW2Value)}
                      </td>
                      <td className="text-right px-4 py-3 text-sm font-bold text-green-400">
                        {formatCurrency(result.w2AnnualSalary + result.totalAdditionalCosts)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">Key Insights</h4>
              <Grid responsive={{ sm: 2, md: 4 }} gap="sm">
                <div>
                  <p className="text-xs text-[var(--color-muted)]">SE Tax</p>
                  <p className="text-lg font-semibold text-amber-400">
                    {formatCurrency(result.selfEmploymentTax)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Benefits Lost</p>
                  <p className="text-lg font-semibold text-amber-400">
                    {formatCurrency(
                      result.healthInsuranceCost +
                        result.retirementMatchLoss +
                        result.ptoValue +
                        result.otherBenefitsLoss
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Billable Hours</p>
                  <p className="text-lg font-semibold text-[var(--color-cream)]">
                    {result.annualBillableHours}/yr
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Multiplier</p>
                  <p className="text-lg font-semibold text-green-400">
                    {formatMultiplier(result.multiplier)}
                  </p>
                </div>
              </Grid>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`W2 to 1099: ${formatHourlyRate(result.w2HourlyRate)} W2 = ${formatHourlyRate(result.equivalent1099Hourly)} as a contractor (${formatMultiplier(result.multiplier)} multiplier). Total W2 value: ${formatCurrency(result.totalW2Value)}/year.`}
                calculatorName="W2 to 1099 Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
