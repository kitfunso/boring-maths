/**
 * Tipping Guide Calculator - Preact Component
 *
 * Interactive calculator showing country-specific tipping customs
 * for various service types. Uses the design system components.
 */
import { calculateTippingGuide, formatCurrency } from './calculations';
import {
  getDefaultInputs,
  TIPPING_DATA,
  COUNTRY_LABELS,
  SERVICE_LABELS,
  type TippingGuideInputs,
  type TippingGuideResult,
  type TippingCountry,
  type ServiceType,
} from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
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
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';

// ---------------------------------------------------------------------------
// Country options for the select dropdown
// ---------------------------------------------------------------------------

const COUNTRY_OPTIONS = (Object.keys(TIPPING_DATA) as TippingCountry[]).map((code) => ({
  value: code,
  label: `${TIPPING_DATA[code].flag} ${COUNTRY_LABELS[code]}`,
}));

const SERVICE_OPTIONS = (Object.keys(SERVICE_LABELS) as ServiceType[]).map((key) => ({
  value: key,
  label: SERVICE_LABELS[key],
}));

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TippingGuideCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorBase<
    TippingGuideInputs,
    TippingGuideResult
  >({
    name: 'Tipping Guide Calculator',
    slug: 'calc-tipping-guide-inputs',
    defaults: () => getDefaultInputs(getInitialCurrency()),
    compute: calculateTippingGuide,
  });

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const handleCountryChange = (country: TippingCountry) => {
    const profile = TIPPING_DATA[country];
    setInputs((prev) => ({
      ...prev,
      country,
      currency: profile.currency,
    }));
  };

  const tipPercentDisplay = Math.round(result.suggestedTipPercent * 100);

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Tipping Guide by Country"
          subtitle="Know the customs before you travel"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Country Selector */}
            <div>
              <Label htmlFor="country" required>
                Country
              </Label>
              <Select
                id="country"
                value={inputs.country}
                onChange={(e) => handleCountryChange(e.target.value as TippingCountry)}
                options={COUNTRY_OPTIONS}
              />
            </div>

            {/* Service Type Selector */}
            <div>
              <Label htmlFor="serviceType" required>
                Service Type
              </Label>
              <Select
                id="serviceType"
                value={inputs.serviceType}
                onChange={(e) => updateInput('serviceType', e.target.value as ServiceType)}
                options={SERVICE_OPTIONS}
              />
            </div>

            {/* Bill Amount */}
            <div>
              <Label htmlFor="billAmount" required>
                Bill Amount
              </Label>
              <Input
                id="billAmount"
                variant="currency"
                currencySymbol={currencySymbol}
                min={0}
                step={0.01}
                value={inputs.billAmount}
                onChange={(e) => updateInput('billAmount', Number(e.target.value))}
              />
            </div>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Cultural Note (prominent) */}
            {result.culturalNote && (
              <Alert
                variant={result.suggestedTipPercent === 0 ? 'warning' : 'tip'}
                title={`${TIPPING_DATA[inputs.country].flag} ${COUNTRY_LABELS[inputs.country]} - ${SERVICE_LABELS[inputs.serviceType]}`}
              >
                {result.culturalNote}
              </Alert>
            )}

            {/* Service Included Warning */}
            {result.isServiceIncluded && (
              <Alert variant="info" title="Service charge included">
                This country typically includes a service charge in the bill. Any additional tip is
                optional and a gesture of appreciation for excellent service.
              </Alert>
            )}

            {/* Primary Result */}
            <ResultCard
              label="Suggested Total"
              value={formatCurrency(result.totalWithTip, result.currency)}
              subtitle={
                tipPercentDisplay > 0
                  ? `${tipPercentDisplay}% tip included`
                  : 'No tip expected'
              }
              footer={
                result.roundedTotal !== result.totalWithTip ? (
                  <>
                    Rounded up:{' '}
                    <span className="font-semibold">
                      {formatCurrency(result.roundedTotal, result.currency)}
                    </span>
                  </>
                ) : undefined
              }
            />

            {/* Breakdown */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Bill Amount"
                value={formatCurrency(inputs.billAmount, result.currency)}
                sublabel="before tip"
              />
              <MetricCard
                label="Suggested Tip"
                value={formatCurrency(result.tipAmount, result.currency)}
                sublabel={tipPercentDisplay > 0 ? `${tipPercentDisplay}%` : 'none'}
                valueColor={tipPercentDisplay > 0 ? 'success' : 'default'}
              />
              <MetricCard
                label="Total"
                value={formatCurrency(result.totalWithTip, result.currency)}
                sublabel="bill + tip"
              />
              <MetricCard
                label="Rounded Total"
                value={formatCurrency(result.roundedTotal, result.currency)}
                sublabel="easy payment"
              />
            </Grid>

            {/* Quick Country Comparison Table */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                {SERVICE_LABELS[inputs.serviceType]} Tips Around the World
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Tipping comparison by country">
                  <thead>
                    <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider">
                      <th scope="col" className="text-left py-2">
                        Country
                      </th>
                      <th scope="col" className="text-right py-2">
                        Tip %
                      </th>
                      <th scope="col" className="text-right py-2">
                        Service Incl.
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {(Object.keys(TIPPING_DATA) as TippingCountry[]).map((code) => {
                      const profile = TIPPING_DATA[code];
                      const norm = profile.services[inputs.serviceType];
                      const isSelected = code === inputs.country;
                      return (
                        <tr
                          key={code}
                          tabIndex={0}
                          role="button"
                          aria-pressed={isSelected}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCountryChange(code);
                            }
                          }}
                          className={`${
                            isSelected
                              ? 'bg-blue-900/40 font-medium text-blue-400'
                              : 'hover:bg-white/5 focus:bg-white/5'
                          } cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                          onClick={() => handleCountryChange(code)}
                        >
                          <td className="py-2">
                            {profile.flag} {COUNTRY_LABELS[code]}
                          </td>
                          <td className="text-right py-2 tabular-nums">
                            {Math.round(norm.suggestedPercent * 100)}%
                          </td>
                          <td className="text-right py-2">
                            {norm.serviceIncluded ? (
                              <span className="text-amber-400">Yes</span>
                            ) : (
                              <span className="text-[var(--color-muted)]">No</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Share & Print */}
            <div className="flex justify-center gap-3 pt-4">
              <ShareResults
                result={`${COUNTRY_LABELS[inputs.country]} ${SERVICE_LABELS[inputs.serviceType]}: ${tipPercentDisplay}% tip - Total: ${formatCurrency(result.totalWithTip, result.currency)}`}
                calculatorName="Tipping Guide Calculator"
              />
              <PrintResults
                title="Tipping Guide Results"
                results={[
                  { label: 'Country', value: COUNTRY_LABELS[inputs.country] },
                  { label: 'Service', value: SERVICE_LABELS[inputs.serviceType] },
                  {
                    label: 'Bill Amount',
                    value: formatCurrency(inputs.billAmount, result.currency),
                  },
                  { label: 'Suggested Tip %', value: `${tipPercentDisplay}%` },
                  {
                    label: 'Tip Amount',
                    value: formatCurrency(result.tipAmount, result.currency),
                  },
                  {
                    label: 'Total',
                    value: formatCurrency(result.totalWithTip, result.currency),
                  },
                  {
                    label: 'Service Included',
                    value: result.isServiceIncluded ? 'Yes' : 'No',
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
