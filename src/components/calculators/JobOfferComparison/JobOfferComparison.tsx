/**
 * Job Offer Comparison Calculator - React Component
 *
 * Compare two job offers by total compensation including salary,
 * benefits, equity, and quality of life factors.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateComparison, formatCurrency, formatDifference } from './calculations';
import {
  getDefaultInputs,
  type JobOfferComparisonInputs,
  type JobOfferComparisonResult,
  type JobOffer,
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
  Checkbox,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

/**
 * Single offer input panel
 */
function OfferPanel({
  offer,
  onChange,
  currencySymbol,
  label,
  color,
}: {
  offer: JobOffer;
  onChange: (updates: Partial<JobOffer>) => void;
  currencySymbol: string;
  label: string;
  color: string;
}) {
  return (
    <div className="space-y-4">
      <div
        className={`text-sm font-semibold uppercase tracking-wider ${color === 'indigo' ? 'text-indigo-600' : 'text-violet-600'}`}
      >
        {label}
      </div>

      {/* Name */}
      <div>
        <Label htmlFor={`${label}-name`}>Label</Label>
        <Input
          id={`${label}-name`}
          type="text"
          value={offer.name}
          onChange={(e) => onChange({ name: (e.target as HTMLInputElement).value })}
        />
      </div>

      {/* Base Salary */}
      <div>
        <Label htmlFor={`${label}-salary`} required>
          Base Salary
        </Label>
        <Input
          id={`${label}-salary`}
          variant="currency"
          currencySymbol={currencySymbol}
          min={0}
          step={1000}
          value={offer.baseSalary}
          onChange={(e) => onChange({ baseSalary: Number(e.target.value) })}
        />
      </div>

      {/* Bonus */}
      <div>
        <Label htmlFor={`${label}-bonus`}>Annual Bonus</Label>
        <Input
          id={`${label}-bonus`}
          variant="percentage"
          min={0}
          max={100}
          step={1}
          value={Math.round(offer.bonusPercentage * 100)}
          onChange={(e) => onChange({ bonusPercentage: Number(e.target.value) / 100 })}
        />
      </div>

      {/* Equity */}
      <div>
        <Label htmlFor={`${label}-equity`}>Annual Equity/RSU Value</Label>
        <Input
          id={`${label}-equity`}
          variant="currency"
          currencySymbol={currencySymbol}
          min={0}
          step={1000}
          value={offer.annualEquity}
          onChange={(e) => onChange({ annualEquity: Number(e.target.value) })}
        />
        <p className="text-xs text-[var(--color-muted)] mt-1">Vested value per year</p>
      </div>

      {/* 401k Match */}
      <Grid responsive={{ sm: 2 }} gap="md">
        <div>
          <Label htmlFor={`${label}-401k-match`}>401k Match</Label>
          <Input
            id={`${label}-401k-match`}
            variant="percentage"
            min={0}
            max={10}
            step={0.5}
            value={Math.round(offer.match401kPercentage * 100)}
            onChange={(e) => onChange({ match401kPercentage: Number(e.target.value) / 100 })}
          />
        </div>
        <div>
          <Label htmlFor={`${label}-401k-limit`}>Up to</Label>
          <Input
            id={`${label}-401k-limit`}
            variant="percentage"
            min={0}
            max={100}
            step={1}
            value={Math.round(offer.match401kLimit * 100)}
            onChange={(e) => onChange({ match401kLimit: Number(e.target.value) / 100 })}
          />
        </div>
      </Grid>

      {/* Health Insurance */}
      <Grid responsive={{ sm: 2 }} gap="md">
        <div>
          <Label htmlFor={`${label}-health-cost`}>Monthly Health Cost</Label>
          <Input
            id={`${label}-health-cost`}
            variant="currency"
            currencySymbol={currencySymbol}
            min={0}
            step={25}
            value={offer.healthInsuranceCost}
            onChange={(e) => onChange({ healthInsuranceCost: Number(e.target.value) })}
          />
          <p className="text-xs text-[var(--color-muted)] mt-1">Your contribution</p>
        </div>
        <div>
          <Label htmlFor={`${label}-health-value`}>Annual Benefit Value</Label>
          <Input
            id={`${label}-health-value`}
            variant="currency"
            currencySymbol={currencySymbol}
            min={0}
            step={500}
            value={offer.healthBenefitValue}
            onChange={(e) => onChange({ healthBenefitValue: Number(e.target.value) })}
          />
          <p className="text-xs text-[var(--color-muted)] mt-1">Employer pays</p>
        </div>
      </Grid>

      {/* PTO */}
      <div>
        <Label htmlFor={`${label}-pto`}>PTO Days</Label>
        <Input
          id={`${label}-pto`}
          type="number"
          min={0}
          max={50}
          value={offer.ptoDays}
          onChange={(e) => onChange({ ptoDays: Number(e.target.value) })}
        />
      </div>

      {/* Commute */}
      <Grid responsive={{ sm: 2 }} gap="md">
        <div>
          <Label htmlFor={`${label}-commute`}>Commute (one-way)</Label>
          <Input
            id={`${label}-commute`}
            type="number"
            min={0}
            max={100}
            value={offer.commuteDistance}
            onChange={(e) => onChange({ commuteDistance: Number(e.target.value) })}
          />
          <p className="text-xs text-[var(--color-muted)] mt-1">miles</p>
        </div>
        <div>
          <Label htmlFor={`${label}-office-days`}>Office Days/Week</Label>
          <Input
            id={`${label}-office-days`}
            type="number"
            min={0}
            max={5}
            value={offer.officeDaysPerWeek}
            onChange={(e) => onChange({ officeDaysPerWeek: Number(e.target.value) })}
          />
        </div>
      </Grid>

      {/* Signing Bonus */}
      <div>
        <Label htmlFor={`${label}-signing`}>Signing Bonus</Label>
        <Input
          id={`${label}-signing`}
          variant="currency"
          currencySymbol={currencySymbol}
          min={0}
          step={1000}
          value={offer.signingBonus}
          onChange={(e) => onChange({ signingBonus: Number(e.target.value) })}
        />
      </div>

      {/* Other Benefits */}
      <div>
        <Label htmlFor={`${label}-other`}>Other Annual Benefits</Label>
        <Input
          id={`${label}-other`}
          variant="currency"
          currencySymbol={currencySymbol}
          min={0}
          step={100}
          value={offer.otherBenefits}
          onChange={(e) => onChange({ otherBenefits: Number(e.target.value) })}
        />
        <p className="text-xs text-[var(--color-muted)] mt-1">Gym, transit, meals, etc.</p>
      </div>
    </div>
  );
}

/**
 * Comparison bar visualization
 */
function ComparisonBar({
  label,
  value1,
  value2,
  currency,
  higherIsBetter = true,
}: {
  label: string;
  value1: number;
  value2: number;
  currency: Currency;
  higherIsBetter?: boolean;
}) {
  const maxValue = Math.max(value1, value2, 1);
  const width1 = (value1 / maxValue) * 100;
  const width2 = (value2 / maxValue) * 100;

  const isValue1Better = higherIsBetter ? value1 > value2 : value1 < value2;
  const isValue2Better = higherIsBetter ? value2 > value1 : value2 < value1;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-[var(--color-cream)]">{label}</div>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-20 text-xs text-[var(--color-subtle)]">Offer 1</div>
          <div className="flex-1 h-6 bg-white/10 rounded overflow-hidden">
            <div
              className={`h-full ${isValue1Better ? 'bg-indigo-500' : 'bg-indigo-500/50'} transition-all`}
              style={{ width: `${width1}%` }}
            />
          </div>
          <div
            className={`w-24 text-right text-sm ${isValue1Better ? 'text-indigo-400 font-medium' : 'text-[var(--color-subtle)]'}`}
          >
            {formatCurrency(value1, currency)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 text-xs text-[var(--color-subtle)]">Offer 2</div>
          <div className="flex-1 h-6 bg-white/10 rounded overflow-hidden">
            <div
              className={`h-full ${isValue2Better ? 'bg-violet-500' : 'bg-violet-500/50'} transition-all`}
              style={{ width: `${width2}%` }}
            />
          </div>
          <div
            className={`w-24 text-right text-sm ${isValue2Better ? 'text-violet-400 font-medium' : 'text-[var(--color-subtle)]'}`}
          >
            {formatCurrency(value2, currency)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobOfferComparison() {
  const [inputs, setInputs] = useState<JobOfferComparisonInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result: JobOfferComparisonResult = useMemo(() => {
    return calculateComparison(inputs);
  }, [inputs]);

  // Update offer
  const updateOffer1 = (updates: Partial<JobOffer>) => {
    setInputs((prev) => ({ ...prev, offer1: { ...prev.offer1, ...updates } }));
  };

  const updateOffer2 = (updates: Partial<JobOffer>) => {
    setInputs((prev) => ({ ...prev, offer2: { ...prev.offer2, ...updates } }));
  };

  // Update settings
  const updateSettings = <K extends keyof JobOfferComparisonInputs>(
    field: K,
    value: JobOfferComparisonInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Compare Job Offers"
          subtitle="See the true total compensation of each offer"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Two-column offer inputs */}
          <Grid responsive={{ sm: 1, lg: 2 }} gap="xl">
            <OfferPanel
              offer={inputs.offer1}
              onChange={updateOffer1}
              currencySymbol={currencySymbol}
              label="Offer 1"
              color="indigo"
            />
            <OfferPanel
              offer={inputs.offer2}
              onChange={updateOffer2}
              currencySymbol={currencySymbol}
              label="Offer 2"
              color="violet"
            />
          </Grid>

          {/* Settings */}
          <div className="mt-8 p-4 bg-[var(--color-night)]/50 rounded-xl">
            <div className="text-sm font-semibold text-[var(--color-subtle)] uppercase tracking-wider mb-4">
              Calculation Settings
            </div>
            <Grid responsive={{ sm: 1, md: 3 }} gap="md">
              <div>
                <Label htmlFor="hourly-value">Your Time Value (hourly)</Label>
                <Input
                  id="hourly-value"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={5}
                  value={inputs.hourlyTimeValue}
                  onChange={(e) => updateSettings('hourlyTimeValue', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="cost-per-mile">Cost per Mile</Label>
                <Input
                  id="cost-per-mile"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={0.05}
                  value={inputs.costPerMile}
                  onChange={(e) => updateSettings('costPerMile', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="401k-contribution">Your 401k Contribution</Label>
                <Input
                  id="401k-contribution"
                  variant="percentage"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(inputs.contribution401k * 100)}
                  onChange={(e) => updateSettings('contribution401k', Number(e.target.value) / 100)}
                />
              </div>
            </Grid>
            <div className="mt-4">
              <Checkbox
                id="include-commute"
                checked={inputs.includeCommuteTime}
                onChange={(e) =>
                  updateSettings('includeCommuteTime', (e.target as HTMLInputElement).checked)
                }
                label="Include commute time as opportunity cost"
              />
            </div>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Winner announcement */}
            <ResultCard
              label={
                result.recommendation.winner === 'tie'
                  ? 'Too Close to Call'
                  : result.recommendation.winner === 1
                    ? `${inputs.offer1.name} Wins`
                    : `${inputs.offer2.name} Wins`
              }
              value={formatDifference(result.difference.netComp, result.currency)}
              subtitle={result.recommendation.reason}
              footer={
                result.difference.percentageDiff !== 0 ? (
                  <>
                    Difference:{' '}
                    <span
                      className={
                        result.difference.percentageDiff > 0 ? 'text-green-500' : 'text-red-500'
                      }
                    >
                      {result.difference.percentageDiff > 0 ? '+' : ''}
                      {result.difference.percentageDiff.toFixed(1)}%
                    </span>
                  </>
                ) : undefined
              }
            />

            {/* Side by side totals */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div className="bg-indigo-900/30 rounded-xl p-6 border border-indigo-500/30">
                <div className="text-sm text-indigo-300 uppercase tracking-wider mb-2">
                  {inputs.offer1.name}
                </div>
                <div className="text-3xl font-bold text-indigo-400">
                  {formatCurrency(result.offer1.netComp, result.currency)}
                </div>
                <div className="text-sm text-[var(--color-muted)] mt-1">Net Total Compensation</div>
              </div>
              <div className="bg-violet-900/30 rounded-xl p-6 border border-violet-500/30">
                <div className="text-sm text-violet-300 uppercase tracking-wider mb-2">
                  {inputs.offer2.name}
                </div>
                <div className="text-3xl font-bold text-violet-400">
                  {formatCurrency(result.offer2.netComp, result.currency)}
                </div>
                <div className="text-sm text-[var(--color-muted)] mt-1">Net Total Compensation</div>
              </div>
            </Grid>

            {/* Comparison breakdown */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-6">
                Component Breakdown
              </h3>
              <div className="space-y-6">
                <ComparisonBar
                  label="Base Salary"
                  value1={result.offer1.baseSalary}
                  value2={result.offer2.baseSalary}
                  currency={result.currency}
                />
                <ComparisonBar
                  label="Bonus"
                  value1={result.offer1.bonusAmount}
                  value2={result.offer2.bonusAmount}
                  currency={result.currency}
                />
                {(result.offer1.equityValue > 0 || result.offer2.equityValue > 0) && (
                  <ComparisonBar
                    label="Equity/RSUs"
                    value1={result.offer1.equityValue}
                    value2={result.offer2.equityValue}
                    currency={result.currency}
                  />
                )}
                <ComparisonBar
                  label="401k Match"
                  value1={result.offer1.match401kValue}
                  value2={result.offer2.match401kValue}
                  currency={result.currency}
                />
                <ComparisonBar
                  label="Health Benefits (Net)"
                  value1={result.offer1.healthBenefitNet}
                  value2={result.offer2.healthBenefitNet}
                  currency={result.currency}
                />
                <ComparisonBar
                  label="Commute Cost"
                  value1={result.offer1.commuteCost}
                  value2={result.offer2.commuteCost}
                  currency={result.currency}
                  higherIsBetter={false}
                />
                {inputs.includeCommuteTime && (
                  <ComparisonBar
                    label="Commute Time Value"
                    value1={result.offer1.commuteTimeValue}
                    value2={result.offer2.commuteTimeValue}
                    currency={result.currency}
                    higherIsBetter={false}
                  />
                )}
              </div>
            </div>

            {/* Effective hourly rate */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label={`${inputs.offer1.name} Hourly`}
                value={formatCurrency(result.offer1.effectiveHourlyRate, result.currency, 2)}
                sublabel="effective rate"
              />
              <MetricCard
                label={`${inputs.offer2.name} Hourly`}
                value={formatCurrency(result.offer2.effectiveHourlyRate, result.currency, 2)}
                sublabel="effective rate"
              />
              <MetricCard
                label={`${inputs.offer1.name} PTO`}
                value={`${inputs.offer1.ptoDays} days`}
                sublabel={formatCurrency(result.offer1.ptoValue, result.currency)}
              />
              <MetricCard
                label={`${inputs.offer2.name} PTO`}
                value={`${inputs.offer2.ptoDays} days`}
                sublabel={formatCurrency(result.offer2.ptoValue, result.currency)}
              />
            </Grid>

            {/* Considerations */}
            {result.recommendation.considerations.length > 0 && (
              <Alert variant="info" title="Things to Consider">
                <ul className="list-disc list-inside space-y-1">
                  {result.recommendation.considerations.map((consideration, i) => (
                    <li key={i}>{consideration}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Tips */}
            <Alert variant="tip" title="Negotiation tip:">
              Use this comparison to negotiate. If Offer 2 has better benefits but lower salary,
              show Offer 1's total compensation and ask if they can match it.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Comparing job offers: ${inputs.offer1.name} (${formatCurrency(result.offer1.netComp, result.currency)}) vs ${inputs.offer2.name} (${formatCurrency(result.offer2.netComp, result.currency)}) - Difference: ${formatDifference(result.difference.netComp, result.currency)}`}
                calculatorName="Job Offer Comparison Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
