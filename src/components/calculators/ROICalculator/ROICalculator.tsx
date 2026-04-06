/**
 * ROI Calculator - Preact Component
 *
 * Interactive calculator for return on investment with
 * real-time calculation and annualised ROI.
 */
import { calculateROI, formatCurrency, formatPercentage } from './calculations';
import {
  getDefaultInputs,
  type ROICalculatorInputs,
  type ROICalculatorResult,
  type InputMode,
  type TimePeriodUnit,
} from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
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
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import PrintResults from '../../ui/PrintResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';
export default function ROICalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorBase<
    ROICalculatorInputs,
    ROICalculatorResult
  >({
    name: 'Calculate Your ROI',
    slug: 'calc-roi-inputs',
    defaults: () => getDefaultInputs(getInitialCurrency()),
    compute: calculateROI,
  });

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results reactively

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Calculate Your ROI"
          subtitle="Measure the return on your investment"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Initial Investment */}
            <div>
              <Label htmlFor="initialInvestment" required>
                Initial Investment
              </Label>
              <Input
                id="initialInvestment"
                variant="currency"
                currencySymbol={currencySymbol}
                min={0}
                step={100}
                value={inputs.initialInvestment}
                onChange={(e) => updateInput('initialInvestment', Number(e.target.value))}
              />
            </div>

            {/* Input Mode Toggle */}
            <div>
              <Label>I know the</Label>
              <ButtonGroup
                options={[
                  { value: 'finalValue' as InputMode, label: 'Final Value' },
                  { value: 'gainAmount' as InputMode, label: 'Gain Amount' },
                ]}
                value={inputs.inputMode}
                onChange={(value) => updateInput('inputMode', value as InputMode)}
                aria-label="Choose input mode"
              />
            </div>

            {/* Final Value or Gain Amount */}
            {inputs.inputMode === 'finalValue' ? (
              <div>
                <Label htmlFor="finalValue" required>
                  Final Value
                </Label>
                <Input
                  id="finalValue"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={100}
                  value={inputs.finalValue}
                  onChange={(e) => updateInput('finalValue', Number(e.target.value))}
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="gainAmount" required>
                  Gain Amount
                </Label>
                <Input
                  id="gainAmount"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  step={100}
                  value={inputs.gainAmount}
                  onChange={(e) => updateInput('gainAmount', Number(e.target.value))}
                />
              </div>
            )}

            {/* Time Period */}
            <div>
              <Label htmlFor="timePeriod" required>
                Time Period
              </Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    id="timePeriod"
                    type="number"
                    min={1}
                    step={1}
                    value={inputs.timePeriod}
                    onChange={(e) => updateInput('timePeriod', Number(e.target.value))}
                  />
                </div>
                <div className="w-40">
                  <ButtonGroup
                    options={[
                      { value: 'years' as TimePeriodUnit, label: 'Years' },
                      { value: 'months' as TimePeriodUnit, label: 'Months' },
                    ]}
                    value={inputs.timePeriodUnit}
                    onChange={(value) => updateInput('timePeriodUnit', value as TimePeriodUnit)}
                    size="sm"
                    aria-label="Time period unit"
                  />
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Validity Warning */}
            {!result.isValid && (
              <Alert variant="warning" title="Invalid inputs">
                Please enter a positive initial investment and a time period greater than zero.
              </Alert>
            )}

            {/* Primary Result - ROI Percentage */}
            {result.isValid && (
              <>
                <ResultCard
                  label="Return on Investment"
                  value={formatPercentage(result.roiPercentage)}
                  subtitle={
                    result.isGain
                      ? `You gained ${formatCurrency(result.totalGainLoss, result.currency)} on your investment`
                      : `You lost ${formatCurrency(Math.abs(result.totalGainLoss), result.currency)} on your investment`
                  }
                  footer={
                    <>
                      Over{' '}
                      {result.timeInYears === 1
                        ? '1 year'
                        : `${result.timeInYears.toLocaleString('en-GB')} years`}
                    </>
                  }
                />

                {/* Breakdown Metrics */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Total Gain / Loss"
                    value={formatCurrency(result.totalGainLoss, result.currency)}
                    sublabel={result.isGain ? 'profit' : 'loss'}
                    valueColor={result.isGain ? 'success' : 'danger'}
                  />
                  <MetricCard
                    label="Annualised ROI"
                    value={formatPercentage(result.annualisedROI)}
                    sublabel="per year (CAGR)"
                    valueColor={result.annualisedROI >= 0 ? 'success' : 'danger'}
                  />
                  <MetricCard
                    label="Final Value"
                    value={formatCurrency(result.finalValue, result.currency)}
                    sublabel="end value"
                  />
                  <MetricCard
                    label="Initial Investment"
                    value={formatCurrency(inputs.initialInvestment, result.currency)}
                    sublabel="starting value"
                  />
                </Grid>

                {/* Contextual Tip */}
                <Alert variant="tip" title="Understanding annualised ROI:">
                  Annualised ROI (CAGR) shows the equivalent yearly return, making it easier to
                  compare investments of different durations. A 50% ROI over 5 years is roughly
                  8.45% annualised.
                </Alert>

                {/* Share & Print Results */}
                <div className="flex justify-center gap-3 pt-4">
                  <ShareResults
                    result={`ROI: ${formatPercentage(result.roiPercentage)} | Annualised: ${formatPercentage(result.annualisedROI)} | Gain: ${formatCurrency(result.totalGainLoss, result.currency)} over ${result.timeInYears} year${result.timeInYears === 1 ? '' : 's'}`}
                    calculatorName="ROI Calculator"
                  />
                  <PrintResults
                    title="ROI Calculator Results"
                    results={[
                      {
                        label: 'Initial Investment',
                        value: formatCurrency(inputs.initialInvestment, result.currency),
                      },
                      {
                        label: 'Final Value',
                        value: formatCurrency(result.finalValue, result.currency),
                      },
                      {
                        label: 'Total Gain / Loss',
                        value: formatCurrency(result.totalGainLoss, result.currency),
                      },
                      { label: 'ROI', value: formatPercentage(result.roiPercentage) },
                      { label: 'Annualised ROI', value: formatPercentage(result.annualisedROI) },
                      {
                        label: 'Time Period',
                        value: `${result.timeInYears} year${result.timeInYears === 1 ? '' : 's'}`,
                      },
                    ]}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
