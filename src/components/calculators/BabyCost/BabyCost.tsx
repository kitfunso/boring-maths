/**
 * Baby Cost Calculator - React Component
 *
 * Estimate the costs of having a baby in the first year.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateBabyCost } from './calculations';
import {
  getDefaultInputs,
  type BabyCostInputs,
  type ChildcareType,
  type FeedingMethod,
  type DiaperPreference,
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

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
const CHILDCARE_OPTIONS = [
  { value: 'none', label: 'Stay-at-home' },
  { value: 'family', label: 'Family help' },
  { value: 'daycare', label: 'Daycare' },
  { value: 'nanny', label: 'Nanny' },
];

const FEEDING_OPTIONS = [
  { value: 'breastfeeding', label: 'Breastfeeding' },
  { value: 'formula', label: 'Formula' },
  { value: 'combination', label: 'Combination' },
];

const DIAPER_OPTIONS = [
  { value: 'disposable', label: 'Disposable' },
  { value: 'cloth', label: 'Cloth' },
  { value: 'hybrid', label: 'Hybrid' },
];

const GEAR_OPTIONS = [
  { value: 'new', label: 'Buy New' },
  { value: 'used', label: 'Used/Hand-me-downs' },
];

export default function BabyCost() {
  // Track calculator usage for analytics
  useCalculatorTracking('Baby Cost Calculator');

  const [inputs, setInputs] = useState<BabyCostInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const result = useMemo(() => calculateBabyCost(inputs), [inputs]);

  const updateInput = <K extends keyof BabyCostInputs>(field: K, value: BabyCostInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  return (
    <ThemeProvider defaultColor="red">
      <Card variant="elevated">
        <CalculatorHeader
          title="Baby Cost Calculator"
          subtitle="Estimate first year expenses for your new arrival"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-rose-400 uppercase tracking-wider">
                Care & Basics
              </div>

              {/* Childcare Type */}
              <div>
                <Label>Childcare Type</Label>
                <ButtonGroup
                  options={CHILDCARE_OPTIONS}
                  value={inputs.childcareType}
                  onChange={(value) => updateInput('childcareType', value as ChildcareType)}
                />
              </div>

              {inputs.childcareType !== 'none' && inputs.childcareType !== 'family' && (
                <Slider
                  label="Months of Childcare"
                  value={inputs.childcareMonths}
                  onChange={(value) => updateInput('childcareMonths', value)}
                  min={1}
                  max={12}
                  showValue
                  labels={{
                    min: '1 mo',
                    mid: '6 mo',
                    max: '12 mo',
                    current: (v) => `${v} months`,
                  }}
                />
              )}

              {/* Feeding Method */}
              <div>
                <Label>Feeding Method</Label>
                <ButtonGroup
                  options={FEEDING_OPTIONS}
                  value={inputs.feedingMethod}
                  onChange={(value) => updateInput('feedingMethod', value as FeedingMethod)}
                />
              </div>

              {/* Diaper Preference */}
              <div>
                <Label>Diaper Preference</Label>
                <ButtonGroup
                  options={DIAPER_OPTIONS}
                  value={inputs.diaperPreference}
                  onChange={(value) => updateInput('diaperPreference', value as DiaperPreference)}
                />
              </div>

              {/* Baby Gear */}
              <div>
                <Label>Baby Gear</Label>
                <ButtonGroup
                  options={GEAR_OPTIONS}
                  value={inputs.buyNewGear ? 'new' : 'used'}
                  onChange={(value) => updateInput('buyNewGear', value === 'new')}
                />
              </div>

              <div>
                <Label htmlFor="nurseryBudget">Nursery Budget</Label>
                <Input
                  id="nurseryBudget"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={100}
                  value={inputs.nurseryBudget}
                  onChange={(e) =>
                    updateInput('nurseryBudget', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>

              <Divider />

              <div className="text-sm font-semibold text-rose-400 uppercase tracking-wider">
                Healthcare & Income
              </div>

              {/* Health Insurance */}
              <Toggle
                checked={inputs.hasHealthInsurance}
                onChange={(checked) => updateInput('hasHealthInsurance', checked)}
                label="Has Health Insurance"
                size="md"
              />

              {inputs.hasHealthInsurance && inputs.currency === 'USD' && (
                <Grid responsive={{ sm: 2 }} gap="md">
                  <div>
                    <Label htmlFor="deductible">Deductible</Label>
                    <Input
                      id="deductible"
                      variant="currency"
                      currencySymbol={currencySymbol}
                      min={0}
                      step={100}
                      value={inputs.deductible}
                      onChange={(e) =>
                        updateInput('deductible', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                  <Slider
                    label="Copay/Coinsurance"
                    value={Math.round(inputs.copayPercent * 100)}
                    onChange={(value) => updateInput('copayPercent', value / 100)}
                    min={0}
                    max={40}
                    showValue
                    labels={{
                      min: '0%',
                      max: '40%',
                      current: (v) => `${v}%`,
                    }}
                  />
                </Grid>
              )}

              {/* Parental Leave */}
              <Grid responsive={{ sm: 2 }} gap="md">
                <Slider
                  label="Maternity Leave"
                  value={inputs.maternityLeaveWeeks}
                  onChange={(value) => updateInput('maternityLeaveWeeks', value)}
                  min={0}
                  max={52}
                  showValue
                  labels={{
                    min: '0 wks',
                    max: '52 wks',
                    current: (v) => `${v} weeks`,
                  }}
                />
                <Slider
                  label="Paternity Leave"
                  value={inputs.paternityLeaveWeeks}
                  onChange={(value) => updateInput('paternityLeaveWeeks', value)}
                  min={0}
                  max={12}
                  showValue
                  labels={{
                    min: '0 wks',
                    max: '12 wks',
                    current: (v) => `${v} weeks`,
                  }}
                />
              </Grid>

              <Slider
                label="Paid Leave Percentage"
                value={Math.round(inputs.paidLeavePercent * 100)}
                onChange={(value) => updateInput('paidLeavePercent', value / 100)}
                min={0}
                max={100}
                step={5}
                showValue
                labels={{
                  min: '0%',
                  max: '100%',
                  current: (v) => `${v}%`,
                }}
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="primaryEarnerSalary">Primary Earner Salary</Label>
                  <Input
                    id="primaryEarnerSalary"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={1000}
                    value={inputs.primaryEarnerSalary}
                    onChange={(e) =>
                      updateInput(
                        'primaryEarnerSalary',
                        Number((e.target as HTMLInputElement).value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryEarnerSalary">Secondary Earner Salary</Label>
                  <Input
                    id="secondaryEarnerSalary"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={1000}
                    value={inputs.secondaryEarnerSalary}
                    onChange={(e) =>
                      updateInput(
                        'secondaryEarnerSalary',
                        Number((e.target as HTMLInputElement).value)
                      )
                    }
                  />
                </div>
              </Grid>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="First Year Total"
                value={fmt(result.totalFirstYearCost)}
                subtitle="Estimated cost for baby's first year"
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <MetricCard label="Monthly Average" value={fmt(result.monthlyAverage)} />
                <MetricCard
                  label="Monthly Budget (with buffer)"
                  value={fmt(result.monthlyBudgetNeeded)}
                />
              </Grid>

              {/* Cost Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Cost Breakdown
                </h3>
                <div className="space-y-4">
                  {result.categories
                    .sort((a, b) => b.amount - a.amount)
                    .map((category, index) => {
                      const percent = (category.amount / result.totalFirstYearCost) * 100;
                      return (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[var(--color-cream)] font-medium">
                              {category.name}
                            </span>
                            <span className="text-rose-400 font-semibold">
                              {fmt(category.amount)}
                            </span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rose-500 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <p className="text-xs text-[var(--color-muted)] mt-1">
                            {category.description} ({Math.round(percent)}%)
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Savings Opportunities */}
              {result.savingsOpportunities.length > 0 && (
                <Alert variant="tip" title="Savings Opportunities">
                  <ul className="space-y-1 text-sm mt-2">
                    {result.savingsOpportunities.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}

              <Alert variant="info" title="Note:">
                Costs vary significantly by location and lifestyle. These are estimates based on
                national averages. Consider creating a detailed budget closer to your due date.
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Baby First Year Cost: ${fmt(result.totalFirstYearCost)} total, ${fmt(result.monthlyAverage)}/month. Biggest expense: ${result.biggestExpense}`}
                  calculatorName="Baby Cost Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
