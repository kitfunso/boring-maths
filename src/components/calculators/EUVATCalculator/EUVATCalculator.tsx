/**
 * EU VAT Calculator - React Component
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateVAT, formatCurrency, formatPercent, getAllRatesForCountry, getCountryByCode } from './calculations';
import { EU_COUNTRIES, getDefaultInputs, type VATInputs, type CalculationMode } from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function EUVATCalculator() {
  const [inputs, setInputs] = useState<VATInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculateVAT(inputs), [inputs]);

  const updateInput = <K extends keyof VATInputs>(field: K, value: VATInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (code: string) => {
    const country = getCountryByCode(code);
    if (country) {
      updateInput('countryCode', code);
      updateInput('vatRate', country.standardRate);
    }
  };

  const selectedCountry = getCountryByCode(inputs.countryCode) || EU_COUNTRIES[0];
  const availableRates = getAllRatesForCountry(selectedCountry);

  const modeOptions = [
    { value: 'add', label: 'Add VAT' },
    { value: 'remove', label: 'Remove VAT' },
    { value: 'reverse', label: 'From VAT Amount' },
  ];

  const rateOptions = availableRates.map((rate) => ({
    value: rate,
    label: `${rate}%${rate === selectedCountry.standardRate ? ' (Std)' : ''}`,
  }));

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="EU VAT Calculator"
          subtitle="Calculate VAT for all 27 EU member states"
        />

        <div className="p-6 md:p-8">
          {/* Calculation Mode */}
          <div className="space-y-6 mb-8">
            <div>
              <Label>Calculation Mode</Label>
              <ButtonGroup
                options={modeOptions}
                value={inputs.mode}
                onChange={(value) => updateInput('mode', value as CalculationMode)}
              />
            </div>

            {/* Country Selection */}
            <div>
              <Label htmlFor="country">EU Country</Label>
              <select
                id="country"
                value={inputs.countryCode}
                onChange={(e) => handleCountryChange((e.target as HTMLSelectElement).value)}
                className="w-full px-4 py-3 bg-[var(--color-night)] border border-white/10 rounded-xl
                         text-[var(--color-cream)] focus:border-[var(--color-accent)] focus:ring-2
                         focus:ring-[var(--color-accent)]/20 transition-all"
              >
                {EU_COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.standardRate}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="amount" required>
                  {inputs.mode === 'add' ? 'Net Amount (excl. VAT)' :
                   inputs.mode === 'remove' ? 'Gross Amount (incl. VAT)' :
                   'VAT Amount'}
                </Label>
                <Input
                  id="amount"
                  variant="currency"
                  currencySymbol="€"
                  type="number"
                  min={0}
                  step={0.01}
                  value={inputs.amount}
                  onChange={(e) => updateInput('amount', Number(e.target.value))}
                />
              </div>
              <div>
                <Label>VAT Rate</Label>
                <ButtonGroup
                  options={rateOptions}
                  value={inputs.vatRate}
                  onChange={(value) => updateInput('vatRate', value as number)}
                  columns={availableRates.length > 3 ? 4 : 3}
                />
              </div>
            </Grid>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            <ResultCard
              label={inputs.mode === 'add' ? 'Total with VAT' : 'Net Amount'}
              value={formatCurrency(inputs.mode === 'add' ? result.grossAmount : result.netAmount)}
              subtitle={`${selectedCountry.name} @ ${formatPercent(inputs.vatRate)}`}
            />

            {/* Breakdown */}
            <Grid responsive={{ sm: 2, md: 3 }} gap="md">
              <MetricCard
                label="Net Amount"
                value={formatCurrency(result.netAmount)}
                sublabel="excl. VAT"
              />
              <MetricCard
                label="VAT Amount"
                value={formatCurrency(result.vatAmount)}
                sublabel={formatPercent(inputs.vatRate)}
                valueColor="accent"
              />
              <MetricCard
                label="Gross Amount"
                value={formatCurrency(result.grossAmount)}
                sublabel="incl. VAT"
              />
            </Grid>

            {/* Country VAT Rates */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                {selectedCountry.name} VAT Rates
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-900/30 rounded-lg">
                  <p className="text-xl font-bold text-blue-400">{selectedCountry.standardRate}%</p>
                  <p className="text-xs text-[var(--color-muted)]">Standard</p>
                </div>
                {selectedCountry.reducedRates.map((rate, i) => (
                  <div key={rate} className="text-center p-3 bg-white/5 rounded-lg">
                    <p className="text-xl font-bold text-[var(--color-cream)]">{rate}%</p>
                    <p className="text-xs text-[var(--color-muted)]">Reduced {selectedCountry.reducedRates.length > 1 ? i + 1 : ''}</p>
                  </div>
                ))}
                {selectedCountry.superReducedRate && (
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <p className="text-xl font-bold text-[var(--color-cream)]">{selectedCountry.superReducedRate}%</p>
                    <p className="text-xs text-[var(--color-muted)]">Super Reduced</p>
                  </div>
                )}
                {selectedCountry.parkingRate && (
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <p className="text-xl font-bold text-[var(--color-cream)]">{selectedCountry.parkingRate}%</p>
                    <p className="text-xs text-[var(--color-muted)]">Parking</p>
                  </div>
                )}
              </div>
            </div>

            {/* EU VAT Comparison Table */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                EU Standard VAT Rates Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider border-b border-white/10">
                      <th className="text-left py-2">Country</th>
                      <th className="text-right py-2">Standard</th>
                      <th className="text-right py-2">Your Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {EU_COUNTRIES.slice().sort((a, b) => b.standardRate - a.standardRate).slice(0, 10).map((country) => {
                      const vatForCountry = inputs.amount * (country.standardRate / 100);
                      const isSelected = country.code === inputs.countryCode;
                      return (
                        <tr key={country.code} className={isSelected ? 'bg-blue-900/30' : ''}>
                          <td className="py-2">{country.name}</td>
                          <td className="text-right py-2 font-medium">{country.standardRate}%</td>
                          <td className="text-right py-2 tabular-nums text-blue-400">
                            {formatCurrency(inputs.mode === 'add' ? inputs.amount + vatForCountry : inputs.amount / (1 + country.standardRate / 100))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-3">
                Showing top 10 EU countries by VAT rate. Hungary has the highest (27%), Luxembourg the lowest (17%).
              </p>
            </div>

            {/* Tips */}
            <Alert variant="tip" title="EU VAT Info:">
              VAT (Value Added Tax) applies to most goods and services in the EU. Reduced rates typically apply to
              essentials like food, books, and medicine. Businesses can reclaim VAT on purchases (input VAT) against
              VAT charged on sales (output VAT). Cross-border B2B services are often reverse-charged.
            </Alert>

            {/* Share */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`${selectedCountry.name} VAT: ${formatCurrency(result.netAmount)} + ${formatCurrency(result.vatAmount)} (${formatPercent(inputs.vatRate)}) = ${formatCurrency(result.grossAmount)}`}
                calculatorName="EU VAT Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
