/**
 * EU Salary Calculator - React Component
 */

import { useState, useMemo } from 'preact/hooks';
import {
  calculateSalary,
  calculateAllCountries,
  formatCurrency,
  formatPercent,
  getCountryByCode,
} from './calculations';
import { EU_TAX_DATA, getDefaultInputs, type SalaryInputs } from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
export default function EUSalaryCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('EU Salary Calculator');

  const [inputs, setInputs] = useState<SalaryInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculateSalary(inputs), [inputs]);
  const allCountries = useMemo(
    () => calculateAllCountries(inputs.grossSalary),
    [inputs.grossSalary]
  );

  const updateInput = <K extends keyof SalaryInputs>(field: K, value: SalaryInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const selectedCountry = getCountryByCode(inputs.countryCode) || EU_TAX_DATA[0];

  return (
    <ThemeProvider defaultColor="violet">
      <Card variant="elevated">
        <CalculatorHeader
          title="EU Salary Calculator"
          subtitle="Compare net salary across European countries"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Country Selection */}
            <div>
              <Label htmlFor="country">Select Country</Label>
              <select
                id="country"
                value={inputs.countryCode}
                onChange={(e) => updateInput('countryCode', (e.target as HTMLSelectElement).value)}
                className="w-full px-4 py-3 bg-[var(--color-night)] border border-white/10 rounded-xl
                         text-[var(--color-cream)] focus:border-[var(--color-accent)] focus:ring-2
                         focus:ring-[var(--color-accent)]/20 transition-all"
              >
                {EU_TAX_DATA.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Gross Salary Input */}
            <div>
              <Label htmlFor="grossSalary" required>
                Annual Gross Salary ({selectedCountry.currency})
              </Label>
              <Input
                id="grossSalary"
                variant="currency"
                currencySymbol={
                  selectedCountry.currency === 'EUR'
                    ? '€'
                    : selectedCountry.currency === 'PLN'
                      ? 'zł'
                      : selectedCountry.currency === 'SEK'
                        ? 'kr'
                        : selectedCountry.currency === 'DKK'
                          ? 'kr'
                          : '€'
                }
                type="number"
                min={0}
                step={1000}
                value={inputs.grossSalary}
                onChange={(e) => updateInput('grossSalary', Number(e.target.value))}
              />
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            <ResultCard
              label="Annual Net Salary"
              value={formatCurrency(result.netSalary, result.country.currency)}
              subtitle={`${formatPercent(result.effectiveTaxRate)} effective tax rate`}
              footer={<>Monthly: {formatCurrency(result.monthlyNet, result.country.currency)}</>}
            />

            {/* Breakdown */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Gross Salary"
                value={formatCurrency(result.grossSalary, result.country.currency)}
                sublabel="annual"
              />
              <MetricCard
                label="Social Security"
                value={formatCurrency(result.socialSecurity, result.country.currency)}
                sublabel={`${result.country.socialSecurityRate}%`}
                valueColor="error"
              />
              <MetricCard
                label="Income Tax"
                value={formatCurrency(result.incomeTax, result.country.currency)}
                sublabel="annual"
                valueColor="error"
              />
              <MetricCard
                label="Net Salary"
                value={formatCurrency(result.netSalary, result.country.currency)}
                sublabel={formatPercent(100 - result.effectiveTaxRate) + ' take-home'}
                valueColor="success"
              />
            </Grid>

            {/* Tax Breakdown Visual */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                {result.country.name} Tax Breakdown
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Net Salary</span>
                    <span className="text-green-400">
                      {formatPercent(100 - result.effectiveTaxRate)}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${100 - result.effectiveTaxRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Income Tax</span>
                    <span className="text-red-400">
                      {formatPercent((result.incomeTax / result.grossSalary) * 100)}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${(result.incomeTax / result.grossSalary) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Social Security</span>
                    <span className="text-amber-400">
                      {formatPercent((result.socialSecurity / result.grossSalary) * 100)}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(result.socialSecurity / result.grossSalary) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Country Comparison Table */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Compare Across EU Countries
              </h3>
              <p className="text-sm text-[var(--color-muted)] mb-4">
                Same gross salary ({formatCurrency(inputs.grossSalary, 'EUR')}) in different
                countries (EUR equivalent shown):
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider border-b border-white/10">
                      <th className="text-left py-2">Country</th>
                      <th className="text-right py-2">Net Salary</th>
                      <th className="text-right py-2">Tax Rate</th>
                      <th className="text-right py-2">Monthly Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allCountries
                      .filter((r) => r.country.currency === 'EUR')
                      .map((r) => {
                        const isSelected = r.country.code === inputs.countryCode;
                        return (
                          <tr key={r.country.code} className={isSelected ? 'bg-violet-900/30' : ''}>
                            <td className="py-2 font-medium">{r.country.name}</td>
                            <td className="text-right py-2 tabular-nums text-green-400">
                              {formatCurrency(r.netSalary, r.country.currency)}
                            </td>
                            <td className="text-right py-2 tabular-nums text-red-400">
                              {formatPercent(r.effectiveTaxRate)}
                            </td>
                            <td className="text-right py-2 tabular-nums">
                              {formatCurrency(r.monthlyNet, r.country.currency)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-3">
                * Showing Eurozone countries only. Calculations are simplified estimates and may not
                reflect all deductions.
              </p>
            </div>

            {/* Tips */}
            <Alert variant="tip" title="Important Notes:">
              These calculations are simplified estimates for comparison purposes. Actual take-home
              pay depends on many factors including marital status, children, local taxes, specific
              deductions, and employer benefits. Always consult a local tax advisor for accurate
              calculations.
            </Alert>

            {/* Share */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`${result.country.name}: ${formatCurrency(result.grossSalary, result.country.currency)} gross → ${formatCurrency(result.netSalary, result.country.currency)} net (${formatPercent(result.effectiveTaxRate)} tax rate)`}
                calculatorName="EU Salary Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
