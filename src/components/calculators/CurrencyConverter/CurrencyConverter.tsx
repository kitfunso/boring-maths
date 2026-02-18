/**
 * Currency Converter - Preact Component
 */

import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { convertCurrency } from './calculations';
import { getDefaultInputs, CURRENCIES, type CurrencyConverterInputs } from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Select,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import PrintResults from '../../ui/PrintResults';
import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';

export default function CurrencyConverter() {
  useCalculatorTracking('Currency Converter');

  const [inputs, setInputs] = useLocalStorage<CurrencyConverterInputs>(
    'calc-currency-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => convertCurrency(inputs), [inputs]);

  const updateInput = <K extends keyof CurrencyConverterInputs>(
    field: K,
    value: CurrencyConverterInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const swapCurrencies = () => {
    setInputs((prev) => ({
      ...prev,
      fromCurrency: prev.toCurrency,
      toCurrency: prev.fromCurrency,
    }));
  };

  const currencyOptions = CURRENCIES.map((c) => ({
    value: c.code,
    label: `${c.code} — ${c.name}`,
  }));

  const fromInfo = CURRENCIES.find((c) => c.code === inputs.fromCurrency);
  const toInfo = CURRENCIES.find((c) => c.code === inputs.toCurrency);

  const shareText = `${inputs.amount} ${inputs.fromCurrency} = ${result.convertedAmount.toLocaleString()} ${inputs.toCurrency}`;

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Currency Converter"
          subtitle="Convert between 20 major world currencies"
        />

        <div class="p-6 space-y-6">
          <div>
            <Label required>Amount</Label>
            <Input
              type="number"
              value={inputs.amount}
              onChange={(v) => updateInput('amount', Number(v))}
              min={0}
              step={1}
            />
          </div>

          <Grid cols={2}>
            <div>
              <Label required>From</Label>
              <Select
                options={currencyOptions}
                value={inputs.fromCurrency}
                onChange={(v) => updateInput('fromCurrency', v)}
              />
            </div>
            <div>
              <Label required>To</Label>
              <Select
                options={currencyOptions}
                value={inputs.toCurrency}
                onChange={(v) => updateInput('toCurrency', v)}
              />
            </div>
          </Grid>

          <div class="flex justify-center">
            <button
              onClick={swapCurrencies}
              class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              aria-label="Swap currencies"
            >
              ⇄ Swap
            </button>
          </div>

          <Divider />

          <ResultCard
            label={`${inputs.amount.toLocaleString()} ${inputs.fromCurrency}`}
            value={`${toInfo?.symbol || ''}${result.convertedAmount.toLocaleString()}`}
            subtitle={`${result.toCurrency}`}
          />

          <Grid cols={2}>
            <MetricCard
              label={`1 ${inputs.fromCurrency}`}
              value={`${result.rate}`}
              subtitle={inputs.toCurrency}
            />
            <MetricCard
              label={`1 ${inputs.toCurrency}`}
              value={`${result.inverseRate}`}
              subtitle={inputs.fromCurrency}
            />
          </Grid>

          {/* Quick conversion table */}
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Quick Reference</h3>
            <div class="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-100">
                    <th class="text-left p-3 font-medium text-gray-600">{inputs.fromCurrency}</th>
                    <th class="text-right p-3 font-medium text-gray-600">{inputs.toCurrency}</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 5, 10, 50, 100, 500, 1000, 5000].map((amt) => (
                    <tr key={amt} class="border-b border-gray-100 last:border-0">
                      <td class="p-3 text-gray-700">
                        {(fromInfo?.symbol || '') + amt.toLocaleString()}
                      </td>
                      <td class="p-3 text-right font-medium text-gray-800">
                        {(toInfo?.symbol || '') +
                          (amt * result.rate).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Alert variant="info">
            <strong>Note:</strong> Exchange rates shown are approximate reference rates. Actual
            rates from banks and services will differ and include fees/spreads. Rates are updated
            periodically.
          </Alert>

          <div class="flex gap-3 flex-wrap">
            <ShareResults text={shareText} title="Currency Conversion" />
            <PrintResults />
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
