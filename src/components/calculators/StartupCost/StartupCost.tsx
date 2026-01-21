/**
 * Startup Cost Calculator - React Component
 *
 * Estimate total startup costs based on business type.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateStartupCost } from './calculations';
import {
  getDefaultInputs,
  type StartupCostInputs,
  type BusinessType,
  BUSINESS_TYPES,
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
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  ButtonGroup,
  Toggle,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

const BUSINESS_TYPE_OPTIONS = [
  { value: 'consulting', label: 'Consulting' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'saas', label: 'SaaS' },
  { value: 'service', label: 'Service' },
  { value: 'retail', label: 'Retail' },
  { value: 'restaurant', label: 'Restaurant' },
];

export default function StartupCost() {
  const [inputs, setInputs] = useState<StartupCostInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const result = useMemo(() => calculateStartupCost(inputs), [inputs]);

  const updateInput = <K extends keyof StartupCostInputs>(
    field: K,
    value: StartupCostInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  const businessConfig = BUSINESS_TYPES[inputs.currency][inputs.businessType];

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="Startup Cost Calculator"
          subtitle="Estimate how much capital you need to launch"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Business Details
              </div>

              {/* Business Type */}
              <div>
                <Label>Business Type</Label>
                <ButtonGroup
                  options={BUSINESS_TYPE_OPTIONS}
                  value={inputs.businessType}
                  onChange={(value) => updateInput('businessType', value as BusinessType)}
                />
                <p className="text-xs text-[var(--color-muted)] mt-2">
                  {businessConfig.description}
                </p>
              </div>

              {/* Employees */}
              <Slider
                label="Number of Employees"
                value={inputs.employees}
                onChange={(value) => updateInput('employees', value)}
                min={0}
                max={20}
                step={1}
                showValue
                labels={{
                  min: '0',
                  max: '20',
                  current: (v) => (v === 0 ? 'Just you' : `${v} employee${v > 1 ? 's' : ''}`),
                }}
              />

              {/* Runway */}
              <Slider
                label="Runway (Months)"
                value={inputs.runwayMonths}
                onChange={(value) => updateInput('runwayMonths', value)}
                min={3}
                max={24}
                step={1}
                showValue
                labels={{
                  min: '3 mo',
                  max: '24 mo',
                  current: (v) => `${v} months`,
                }}
              />

              {/* Founder Salary */}
              <div>
                <Label htmlFor="founderSalary">Monthly Founder Salary</Label>
                <Input
                  id="founderSalary"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={500}
                  value={inputs.founderSalary}
                  onChange={(e) => updateInput('founderSalary', Number(e.target.value))}
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  Your living expenses during runway
                </p>
              </div>

              <Divider />

              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Options
              </div>

              {/* Needs Office */}
              <Toggle
                checked={inputs.needsOffice}
                onChange={(checked) => updateInput('needsOffice', checked)}
                label="Need Office/Retail Space"
                size="sm"
              />

              {/* Contingency */}
              <Toggle
                checked={inputs.includeContingency}
                onChange={(checked) => updateInput('includeContingency', checked)}
                label={`Include ${inputs.contingencyPercent}% Contingency Buffer`}
                size="sm"
              />

              {inputs.includeContingency && (
                <Slider
                  label="Contingency %"
                  value={inputs.contingencyPercent}
                  onChange={(value) => updateInput('contingencyPercent', value)}
                  min={5}
                  max={50}
                  step={5}
                  showValue
                  labels={{
                    min: '5%',
                    max: '50%',
                    current: (v) => `${v}%`,
                  }}
                />
              )}

              <Divider />

              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Custom Overrides (Optional)
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="customEquipment" badge="Optional">
                    Custom Equipment Cost
                  </Label>
                  <Input
                    id="customEquipment"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={1000}
                    value={inputs.customEquipment}
                    onChange={(e) => updateInput('customEquipment', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="customInventory" badge="Optional">
                    Custom Inventory Cost
                  </Label>
                  <Input
                    id="customInventory"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={1000}
                    value={inputs.customInventory}
                    onChange={(e) => updateInput('customInventory', Number(e.target.value))}
                  />
                </div>
              </Grid>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Total Capital Needed"
                value={fmt(result.totalCapitalNeeded)}
                subtitle={`For ${inputs.runwayMonths} months of runway`}
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <MetricCard label="One-Time Costs" value={fmt(result.oneTimeCosts)} />
                <MetricCard label="Monthly Burn Rate" value={fmt(result.monthlyBurnRate)} />
                <MetricCard label="Daily Burn" value={fmt(result.dailyBurnRate)} />
                {result.contingencyBuffer > 0 && (
                  <MetricCard label="Contingency Buffer" value={fmt(result.contingencyBuffer)} />
                )}
              </Grid>

              {/* One-Time Costs Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  One-Time Costs
                </h3>
                <div className="space-y-3">
                  {result.oneTimeBreakdown.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-start py-2 ${
                        index > 0 ? 'border-t border-white/5' : ''
                      }`}
                    >
                      <div>
                        <span className="text-[var(--color-cream)] font-medium">
                          {item.category}
                        </span>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-emerald-400 font-semibold">{fmt(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 border-t border-white/20">
                    <span className="text-[var(--color-cream)] font-semibold">Total One-Time</span>
                    <span className="text-emerald-400 font-bold">{fmt(result.oneTimeCosts)}</span>
                  </div>
                </div>
              </div>

              {/* Monthly Costs Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Monthly Recurring Costs
                </h3>
                <div className="space-y-3">
                  {result.monthlyBreakdown.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-start py-2 ${
                        index > 0 ? 'border-t border-white/5' : ''
                      }`}
                    >
                      <div>
                        <span className="text-[var(--color-cream)] font-medium">
                          {item.category}
                        </span>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-emerald-400 font-semibold">{fmt(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 border-t border-white/20">
                    <span className="text-[var(--color-cream)] font-semibold">Monthly Total</span>
                    <span className="text-emerald-400 font-bold">
                      {fmt(result.monthlyBurnRate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <Alert variant="tip" title="Tips for Your Business Type">
                <ul className="space-y-2 mt-2">
                  {result.tips.slice(0, 3).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-400 mt-0.5">*</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Startup Cost Estimate: ${fmt(result.totalCapitalNeeded)} total (${fmt(result.oneTimeCosts)} one-time + ${fmt(result.monthlyBurnRate)}/month for ${inputs.runwayMonths} months)`}
                  calculatorName="Startup Cost Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
