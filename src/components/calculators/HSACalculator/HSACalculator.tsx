/**
 * HSA Calculator - React Component
 *
 * Health Savings Account calculator showing triple tax advantage.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateHSA, formatCurrency, formatPercent } from './calculations';
import {
  getDefaultInputs,
  HSA_LIMITS_2025,
  FEDERAL_TAX_BRACKETS,
  type HSAInputs,
  type CoverageType,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function HSACalculator() {
  const [inputs, setInputs] = useState<HSAInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculateHSA(inputs), [inputs]);

  const updateInput = <K extends keyof HSAInputs>(
    field: K,
    value: HSAInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const coverageOptions = [
    { value: 'individual', label: `Individual ($${HSA_LIMITS_2025.individual.toLocaleString()})` },
    { value: 'family', label: `Family ($${HSA_LIMITS_2025.family.toLocaleString()})` },
  ];

  const taxBracketOptions = FEDERAL_TAX_BRACKETS.map((b) => ({
    value: b.rate,
    label: b.label,
  }));

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="HSA Calculator"
          subtitle="Calculate your triple tax advantage savings"
        />

        <div className="p-6 md:p-8">
          {/* Coverage Type */}
          <div className="space-y-6 mb-8">
            <div>
              <Label>HDHP Coverage Type</Label>
              <ButtonGroup
                options={coverageOptions}
                value={inputs.coverageType}
                onChange={(value) => updateInput('coverageType', value as CoverageType)}
              />
              <p className="text-sm text-[var(--color-muted)] mt-2">
                2025 contribution limits shown. Catch-up: +${HSA_LIMITS_2025.catchUp.toLocaleString()} if 55+
              </p>
            </div>

            {/* Contributions */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="annualContribution" required>
                  Your Annual Contribution
                </Label>
                <Input
                  id="annualContribution"
                  variant="currency"
                  currencySymbol="$"
                  type="number"
                  min={0}
                  max={10000}
                  step={100}
                  value={inputs.annualContribution}
                  onChange={(e) => updateInput('annualContribution', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="employerContribution">
                  Employer Contribution
                </Label>
                <Input
                  id="employerContribution"
                  variant="currency"
                  currencySymbol="$"
                  type="number"
                  min={0}
                  max={5000}
                  step={100}
                  value={inputs.employerContribution}
                  onChange={(e) => updateInput('employerContribution', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Age and Tax Info */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="age" required>
                  Your Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  min={18}
                  max={80}
                  value={inputs.age}
                  onChange={(e) => updateInput('age', Number(e.target.value))}
                />
                {inputs.age >= 55 && (
                  <p className="text-sm text-green-400 mt-1">
                    You qualify for ${HSA_LIMITS_2025.catchUp.toLocaleString()} catch-up contribution!
                  </p>
                )}
              </div>
              <div>
                <Label>Federal Tax Bracket</Label>
                <ButtonGroup
                  options={taxBracketOptions}
                  value={inputs.federalTaxRate}
                  onChange={(value) => updateInput('federalTaxRate', value as number)}
                  columns={4}
                />
              </div>
            </Grid>

            {/* State Tax */}
            <div>
              <Slider
                label="State Income Tax Rate"
                value={inputs.stateTaxRate}
                onChange={(value) => updateInput('stateTaxRate', value)}
                min={0}
                max={13}
                showValue
                labels={{
                  min: '0%',
                  mid: '6%',
                  max: '13%',
                  current: (v) => `${v}%`,
                }}
              />
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Note: Some states don't recognize HSA tax benefits (CA, NJ)
              </p>
            </div>

            {/* Long-term Projection Inputs */}
            <div className="bg-[var(--color-night)] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Long-Term Projection
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <div>
                  <Label htmlFor="currentBalance">Current HSA Balance</Label>
                  <Input
                    id="currentBalance"
                    variant="currency"
                    currencySymbol="$"
                    type="number"
                    min={0}
                    step={1000}
                    value={inputs.currentBalance}
                    onChange={(e) => updateInput('currentBalance', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="yearsToRetirement">Years to Age 65</Label>
                  <Input
                    id="yearsToRetirement"
                    type="number"
                    min={1}
                    max={50}
                    value={inputs.yearsToRetirement}
                    onChange={(e) => updateInput('yearsToRetirement', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="expectedReturn">Expected Annual Return</Label>
                  <Input
                    id="expectedReturn"
                    variant="percentage"
                    type="number"
                    min={0}
                    max={15}
                    step={0.5}
                    value={inputs.expectedReturn}
                    onChange={(e) => updateInput('expectedReturn', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="annualMedicalExpenses">Annual Medical Spending</Label>
                  <Input
                    id="annualMedicalExpenses"
                    variant="currency"
                    currencySymbol="$"
                    type="number"
                    min={0}
                    step={100}
                    value={inputs.annualMedicalExpenses}
                    onChange={(e) => updateInput('annualMedicalExpenses', Number(e.target.value))}
                  />
                </div>
              </Grid>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Contribution Status */}
            {result.overContribution > 0 && (
              <Alert variant="error" title="Over Contribution Limit">
                You're ${result.overContribution.toLocaleString()} over the {inputs.coverageType} limit of ${result.totalLimit.toLocaleString()}.
                Excess contributions are subject to 6% penalty tax.
              </Alert>
            )}

            {/* Primary Result - Tax Savings */}
            <ResultCard
              label="Annual Tax Savings"
              value={formatCurrency(result.totalAnnualTaxSavings)}
              subtitle={`${formatPercent(result.effectiveDiscount)} effective discount on contributions`}
              footer={
                <>
                  Contributing {formatCurrency(inputs.annualContribution)} saves you {formatCurrency(result.totalAnnualTaxSavings)} in taxes
                </>
              }
            />

            {/* Triple Tax Advantage Breakdown */}
            <div className="bg-green-900/30 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-4">
                Triple Tax Advantage
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-green-800/50">
                  <div>
                    <span className="font-medium text-[var(--color-cream)]">1. Federal Tax Savings</span>
                    <span className="text-[var(--color-muted)] ml-2">({inputs.federalTaxRate}% bracket)</span>
                  </div>
                  <span className="font-bold text-green-400">{formatCurrency(result.federalTaxSavings)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-green-800/50">
                  <div>
                    <span className="font-medium text-[var(--color-cream)]">2. State Tax Savings</span>
                    <span className="text-[var(--color-muted)] ml-2">({inputs.stateTaxRate}% rate)</span>
                  </div>
                  <span className="font-bold text-green-400">{formatCurrency(result.stateTaxSavings)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-green-800/50">
                  <div>
                    <span className="font-medium text-[var(--color-cream)]">3. FICA Tax Savings</span>
                    <span className="text-[var(--color-muted)] ml-2">(7.65% SS + Medicare)</span>
                  </div>
                  <span className="font-bold text-green-400">{formatCurrency(result.ficaTaxSavings)}</span>
                </div>
                <div className="flex items-center justify-between py-2 bg-green-900/50 rounded-lg px-3 -mx-3">
                  <span className="font-semibold text-[var(--color-cream)]">Total Annual Savings</span>
                  <span className="font-bold text-green-300 text-lg">{formatCurrency(result.totalAnnualTaxSavings)}</span>
                </div>
              </div>
            </div>

            {/* Contribution Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="2025 Limit"
                value={formatCurrency(result.totalLimit)}
                sublabel={inputs.age >= 55 ? 'includes catch-up' : inputs.coverageType}
              />
              <MetricCard
                label="Total Contribution"
                value={formatCurrency(result.totalContribution)}
                sublabel="you + employer"
              />
              <MetricCard
                label="Room Remaining"
                value={formatCurrency(result.remainingRoom)}
                sublabel="can still contribute"
                valueColor={result.remainingRoom > 0 ? 'default' : 'success'}
              />
              <MetricCard
                label="Effective Discount"
                value={formatPercent(result.effectiveDiscount)}
                sublabel="on contributions"
                valueColor="success"
              />
            </Grid>

            {/* Long-term Projection */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Projected Balance at Age 65
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(result.projectedBalance)}</p>
                  <p className="text-sm text-[var(--color-muted)]">Projected Balance</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--color-cream)]">{formatCurrency(result.totalContributions)}</p>
                  <p className="text-sm text-[var(--color-muted)]">Total Contributions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(result.taxFreeGrowth)}</p>
                  <p className="text-sm text-[var(--color-muted)]">Tax-Free Growth</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--color-cream)]">{inputs.yearsToRetirement}</p>
                  <p className="text-sm text-[var(--color-muted)]">Years</p>
                </div>
              </div>

              {/* Projection Table */}
              {result.projections.length > 0 && (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider border-b border-white/10">
                        <th className="text-left py-2">Year</th>
                        <th className="text-right py-2">Age</th>
                        <th className="text-right py-2">Contribution</th>
                        <th className="text-right py-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {result.projections.filter((_, i) => i % 5 === 0 || i === result.projections.length - 1).map((row) => (
                        <tr key={row.year} className={row.age === 65 ? 'bg-green-900/30' : ''}>
                          <td className="py-2">{row.year}</td>
                          <td className="text-right py-2">{row.age}</td>
                          <td className="text-right py-2 tabular-nums">{formatCurrency(row.contribution)}</td>
                          <td className="text-right py-2 tabular-nums font-medium text-green-400">
                            {formatCurrency(row.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Tips */}
            <Alert variant="tip" title="HSA Tips:">
              HSAs offer the only "triple tax advantage" in the US tax code: tax-free contributions, tax-free growth, and tax-free withdrawals for medical expenses.
              After age 65, you can withdraw for any purpose (taxed as income, like a traditional IRA).
              Consider investing your HSA and paying medical expenses out-of-pocket to maximize tax-free growth.
            </Alert>

            {/* Share */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`HSA Tax Savings: ${formatCurrency(result.totalAnnualTaxSavings)}/year (${formatPercent(result.effectiveDiscount)} effective discount). Projected balance at 65: ${formatCurrency(result.projectedBalance)}`}
                calculatorName="HSA Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
